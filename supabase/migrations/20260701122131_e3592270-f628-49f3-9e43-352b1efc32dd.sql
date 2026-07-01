
-- ============================================================
-- MANUSCRIPT MESSAGES
-- ============================================================
CREATE TABLE public.manuscript_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_name text,
  sender_role public.app_role,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_manuscript_messages_manuscript ON public.manuscript_messages(manuscript_id, created_at);

GRANT SELECT, INSERT ON public.manuscript_messages TO authenticated;
GRANT ALL ON public.manuscript_messages TO service_role;
ALTER TABLE public.manuscript_messages ENABLE ROW LEVEL SECURITY;

-- Helper: can this user access the thread? (author, assigned reviewer, secretary, or EiC)
CREATE OR REPLACE FUNCTION public.can_access_manuscript(_uid uuid, _mid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    EXISTS (SELECT 1 FROM public.manuscripts m WHERE m.id = _mid AND m.author_id = _uid)
    OR EXISTS (SELECT 1 FROM public.reviewer_assignments r WHERE r.manuscript_id = _mid AND r.reviewer_id = _uid)
    OR public.has_role(_uid, 'editorial_secretary')
    OR public.has_role(_uid, 'editor_in_chief')
    OR public.has_role(_uid, 'admin');
$$;
REVOKE EXECUTE ON FUNCTION public.can_access_manuscript(uuid,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_manuscript(uuid,uuid) TO authenticated, service_role;

CREATE POLICY "Thread participants read messages"
  ON public.manuscript_messages FOR SELECT TO authenticated
  USING (public.can_access_manuscript(auth.uid(), manuscript_id));

CREATE POLICY "Thread participants post messages"
  ON public.manuscript_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.can_access_manuscript(auth.uid(), manuscript_id));

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  manuscript_id uuid REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE read_at IS NULL;

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users update their notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete their notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- NOTIFICATION HELPERS + TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_users(
  _user_ids uuid[], _manuscript_id uuid, _kind text, _title text, _body text, _link text
) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  INSERT INTO public.notifications(user_id, manuscript_id, kind, title, body, link)
  SELECT DISTINCT u, _manuscript_id, _kind, _title, _body, _link
  FROM unnest(_user_ids) AS u
  WHERE u IS NOT NULL;
$$;
REVOKE EXECUTE ON FUNCTION public.notify_users(uuid[],uuid,text,text,text,text) FROM PUBLIC, anon, authenticated;

-- On manuscript status change
CREATE OR REPLACE FUNCTION public.notify_on_manuscript_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  secretaries uuid[];
  eics uuid[];
  reviewers uuid[];
  title_text text := coalesce(NEW.title, 'Manuscript');
  link_text text := '/author/manuscripts/' || NEW.id;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  SELECT array_agg(user_id) INTO secretaries FROM public.user_roles WHERE role = 'editorial_secretary';
  SELECT array_agg(user_id) INTO eics FROM public.user_roles WHERE role = 'editor_in_chief';
  SELECT array_agg(reviewer_id) INTO reviewers FROM public.reviewer_assignments WHERE manuscript_id = NEW.id;

  IF NEW.status IN ('submitted','resubmitted') THEN
    PERFORM public.notify_users(secretaries, NEW.id, 'submitted',
      'New submission: ' || title_text,
      'A manuscript is awaiting triage.',
      '/secretary');
  ELSIF NEW.status = 'under_review' THEN
    -- Reviewer-specific notifications happen in the assignments trigger; still ping author.
    PERFORM public.notify_users(ARRAY[NEW.author_id], NEW.id, 'under_review',
      'Under review: ' || title_text,
      'Your manuscript has been sent to reviewers.',
      '/author/manuscripts/' || NEW.id);
  ELSIF NEW.status = 'revision_requested' THEN
    PERFORM public.notify_users(ARRAY[NEW.author_id], NEW.id, 'revision_requested',
      'Revisions requested: ' || title_text,
      coalesce(NEW.rejection_reason, 'Please review the editor feedback and resubmit.'),
      '/author/manuscripts/' || NEW.id || '/revise');
  ELSIF NEW.status = 'reviews_complete' THEN
    PERFORM public.notify_users(secretaries, NEW.id, 'reviews_complete',
      'Reviews complete: ' || title_text, 'All reviews received.', '/secretary');
  ELSIF NEW.status = 'with_eic' THEN
    PERFORM public.notify_users(eics, NEW.id, 'with_eic',
      'Awaiting your decision: ' || title_text, 'Editor-in-Chief action needed.', '/eic');
  ELSIF NEW.status = 'approved_for_publication' THEN
    IF NEW.routed_to = 'author' THEN
      PERFORM public.notify_users(ARRAY[NEW.author_id], NEW.id, 'galley_proof',
        'Galley proof ready: ' || title_text, 'Please approve the galley for publication.', '/author/manuscripts/' || NEW.id);
    ELSE
      PERFORM public.notify_users(secretaries, NEW.id, 'galley_proof',
        'Galley proof approved: ' || title_text, 'Ready to publish.', '/secretary');
    END IF;
  ELSIF NEW.status = 'published' THEN
    PERFORM public.notify_users(ARRAY[NEW.author_id], NEW.id, 'published',
      'Published: ' || title_text, 'Your article is now live in the library.', '/');
  ELSIF NEW.status = 'rejected_by_secretary' THEN
    PERFORM public.notify_users(ARRAY[NEW.author_id], NEW.id, 'rejected',
      'Decision on: ' || title_text,
      coalesce(NEW.rejection_reason, 'Your submission was not accepted.'),
      '/author/manuscripts/' || NEW.id);
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_notify_manuscript_status
AFTER UPDATE ON public.manuscripts
FOR EACH ROW EXECUTE FUNCTION public.notify_on_manuscript_status();

-- On new submission
CREATE OR REPLACE FUNCTION public.notify_on_manuscript_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE secretaries uuid[];
BEGIN
  IF NEW.status IN ('submitted','with_secretary') THEN
    SELECT array_agg(user_id) INTO secretaries FROM public.user_roles WHERE role = 'editorial_secretary';
    PERFORM public.notify_users(secretaries, NEW.id, 'submitted',
      'New submission: ' || coalesce(NEW.title,'Manuscript'),
      'A manuscript is awaiting triage.', '/secretary');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_manuscript_insert
AFTER INSERT ON public.manuscripts
FOR EACH ROW EXECUTE FUNCTION public.notify_on_manuscript_insert();

-- On reviewer assignment
CREATE OR REPLACE FUNCTION public.notify_on_reviewer_assignment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m record;
BEGIN
  SELECT title INTO m FROM public.manuscripts WHERE id = NEW.manuscript_id;
  PERFORM public.notify_users(ARRAY[NEW.reviewer_id], NEW.manuscript_id, 'review_invite',
    'Review invitation: ' || coalesce(m.title,'Manuscript'),
    'You have been invited to review a manuscript.',
    '/reviewer/invitations/' || NEW.id);
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_reviewer_assignment
AFTER INSERT ON public.reviewer_assignments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_reviewer_assignment();

-- On new message: notify all thread participants except sender
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  recipients uuid[];
  m record;
BEGIN
  SELECT title, author_id INTO m FROM public.manuscripts WHERE id = NEW.manuscript_id;
  SELECT array_agg(DISTINCT uid) INTO recipients FROM (
    SELECT m.author_id AS uid
    UNION SELECT reviewer_id FROM public.reviewer_assignments WHERE manuscript_id = NEW.manuscript_id
    UNION SELECT user_id FROM public.user_roles WHERE role IN ('editorial_secretary','editor_in_chief')
  ) s WHERE uid <> NEW.sender_id;

  PERFORM public.notify_users(recipients, NEW.manuscript_id, 'message',
    'New message on: ' || coalesce(m.title,'Manuscript'),
    coalesce(NEW.sender_name,'Someone') || ': ' || left(NEW.body, 140),
    '/author/manuscripts/' || NEW.manuscript_id);
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_on_message
AFTER INSERT ON public.manuscript_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();

-- Lock helper function execution to server-side triggers only.
REVOKE EXECUTE ON FUNCTION public.notify_on_manuscript_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_manuscript_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_reviewer_assignment() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_message() FROM PUBLIC, anon, authenticated;

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.manuscript_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
