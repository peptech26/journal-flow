
CREATE TYPE public.app_role AS ENUM ('author','reviewer','editorial_secretary','editor_in_chief','admin');
CREATE TYPE public.role_request_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.manuscript_status AS ENUM (
  'submitted','with_secretary','rejected_by_secretary','under_review',
  'revision_requested','accepted','galley_proof','published','withdrawn'
);
CREATE TYPE public.assignment_status AS ENUM ('invited','accepted','declined','submitted','expired');
CREATE TYPE public.review_recommendation AS ENUM ('accept','minor_revision','major_revision','reject');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT, email TEXT, affiliation TEXT, orcid TEXT,
  avatar_url TEXT, bio TEXT, expertise TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users delete own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- role_requests
CREATE TABLE public.role_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_role public.app_role NOT NULL,
  status public.role_request_status NOT NULL DEFAULT 'pending',
  justification TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.role_requests TO authenticated;
GRANT ALL ON public.role_requests TO service_role;
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_role_requests_updated BEFORE UPDATE ON public.role_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "View own role requests" ON public.role_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Create own role requests" ON public.role_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update role requests" ON public.role_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.role_request_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.role_requests(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  from_status public.role_request_status,
  to_status public.role_request_status,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.role_request_history TO authenticated;
GRANT ALL ON public.role_request_history TO service_role;
ALTER TABLE public.role_request_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View history with request" ON public.role_request_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.role_requests r WHERE r.id = request_id
    AND (r.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "Insert history" ON public.role_request_history FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR actor_id = auth.uid());

CREATE OR REPLACE FUNCTION public.log_role_request_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_request_history(request_id, actor_id, action, to_status, notes)
    VALUES (NEW.id, NEW.user_id, 'created', NEW.status, NEW.justification);
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.role_request_history(request_id, actor_id, action, from_status, to_status, notes)
    VALUES (NEW.id, NEW.reviewed_by, NEW.status::text, OLD.status, NEW.status, NEW.review_notes);
    IF NEW.status = 'approved' THEN
      INSERT INTO public.user_roles(user_id, role, granted_by)
      VALUES (NEW.user_id, NEW.requested_role, NEW.reviewed_by)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_role_request_history
  AFTER INSERT OR UPDATE ON public.role_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_role_request_change();

-- manuscripts
CREATE TABLE public.manuscripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  abstract TEXT,
  keywords TEXT[] DEFAULT '{}',
  subject_area TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.manuscript_status NOT NULL DEFAULT 'submitted',
  assigned_secretary UUID REFERENCES auth.users(id),
  assigned_editor UUID REFERENCES auth.users(id),
  current_version INT NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ,
  published_pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.manuscripts TO authenticated;
GRANT SELECT ON public.manuscripts TO anon;
GRANT ALL ON public.manuscripts TO service_role;
ALTER TABLE public.manuscripts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_manuscripts_updated BEFORE UPDATE ON public.manuscripts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- reviewer_assignments (created before manuscripts policies reference it)
CREATE TABLE public.reviewer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id UUID NOT NULL REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  round INT NOT NULL DEFAULT 1,
  status public.assignment_status NOT NULL DEFAULT 'invited',
  due_date TIMESTAMPTZ,
  recommendation public.review_recommendation,
  comments_to_editor TEXT,
  comments_to_author TEXT,
  decline_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (manuscript_id, reviewer_id, round)
);
GRANT SELECT, INSERT, UPDATE ON public.reviewer_assignments TO authenticated;
GRANT ALL ON public.reviewer_assignments TO service_role;
ALTER TABLE public.reviewer_assignments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_reviewer_assignments_updated BEFORE UPDATE ON public.reviewer_assignments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Public sees published" ON public.manuscripts FOR SELECT USING (status = 'published');
CREATE POLICY "Authors see own" ON public.manuscripts FOR SELECT TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Staff see all" ON public.manuscripts FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'editorial_secretary') OR public.has_role(auth.uid(),'editor_in_chief') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Assigned reviewers see" ON public.manuscripts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.reviewer_assignments ra WHERE ra.manuscript_id = manuscripts.id AND ra.reviewer_id = auth.uid()));
CREATE POLICY "Authors create" ON public.manuscripts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors update own" ON public.manuscripts FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Staff update" ON public.manuscripts FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(),'editorial_secretary') OR public.has_role(auth.uid(),'editor_in_chief') OR public.has_role(auth.uid(),'admin')
) WITH CHECK (true);

CREATE POLICY "Reviewer sees own assignments" ON public.reviewer_assignments FOR SELECT TO authenticated USING (
  reviewer_id = auth.uid()
  OR public.has_role(auth.uid(),'editorial_secretary')
  OR public.has_role(auth.uid(),'editor_in_chief')
  OR public.has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.manuscripts m WHERE m.id = manuscript_id AND m.author_id = auth.uid()));
CREATE POLICY "Staff create assignments" ON public.reviewer_assignments FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(),'editorial_secretary') OR public.has_role(auth.uid(),'editor_in_chief') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Reviewer or staff update assignments" ON public.reviewer_assignments FOR UPDATE TO authenticated USING (
  reviewer_id = auth.uid() OR public.has_role(auth.uid(),'editorial_secretary')
  OR public.has_role(auth.uid(),'editor_in_chief') OR public.has_role(auth.uid(),'admin')
) WITH CHECK (true);

-- manuscript_versions
CREATE TABLE public.manuscript_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id UUID NOT NULL REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT,
  word_count INT,
  cover_letter TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (manuscript_id, version_number)
);
GRANT SELECT, INSERT ON public.manuscript_versions TO authenticated;
GRANT ALL ON public.manuscript_versions TO service_role;
ALTER TABLE public.manuscript_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View versions via manuscript" ON public.manuscript_versions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.manuscripts m WHERE m.id = manuscript_id AND (
    m.author_id = auth.uid()
    OR public.has_role(auth.uid(),'editorial_secretary')
    OR public.has_role(auth.uid(),'editor_in_chief')
    OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.reviewer_assignments ra WHERE ra.manuscript_id = m.id AND ra.reviewer_id = auth.uid()))));
CREATE POLICY "Author/staff upload versions" ON public.manuscript_versions FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.manuscripts m WHERE m.id = manuscript_id AND (
    m.author_id = auth.uid()
    OR public.has_role(auth.uid(),'editorial_secretary')
    OR public.has_role(auth.uid(),'editor_in_chief')
    OR public.has_role(auth.uid(),'admin'))));

-- reviewer_cvs
CREATE TABLE public.reviewer_cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviewer_cvs TO authenticated;
GRANT ALL ON public.reviewer_cvs TO service_role;
ALTER TABLE public.reviewer_cvs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviewer manages own CV" ON public.reviewer_cvs FOR ALL TO authenticated
  USING (reviewer_id = auth.uid()) WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "Staff view CVs" ON public.reviewer_cvs FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'editorial_secretary') OR public.has_role(auth.uid(),'editor_in_chief') OR public.has_role(auth.uid(),'admin'));

-- audit_events
CREATE TABLE public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id UUID REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO service_role;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View audit if can see manuscript" ON public.audit_events FOR SELECT TO authenticated USING (
  manuscript_id IS NULL
  OR EXISTS (SELECT 1 FROM public.manuscripts m WHERE m.id = manuscript_id AND (
    m.author_id = auth.uid()
    OR public.has_role(auth.uid(),'editorial_secretary')
    OR public.has_role(auth.uid(),'editor_in_chief')
    OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.reviewer_assignments ra WHERE ra.manuscript_id = m.id AND ra.reviewer_id = auth.uid()))));
CREATE POLICY "Insert audit" ON public.audit_events FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() OR actor_id IS NULL);

CREATE INDEX idx_audit_manuscript ON public.audit_events(manuscript_id, created_at DESC);
CREATE INDEX idx_manuscripts_author ON public.manuscripts(author_id);
CREATE INDEX idx_manuscripts_status ON public.manuscripts(status);
CREATE INDEX idx_assignments_reviewer ON public.reviewer_assignments(reviewer_id);
CREATE INDEX idx_assignments_manuscript ON public.reviewer_assignments(manuscript_id);

-- Storage object policies (buckets created via the storage tool)
CREATE POLICY "Author upload manuscript files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'manuscripts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Read manuscript files" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'manuscripts' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(),'editorial_secretary')
    OR public.has_role(auth.uid(),'editor_in_chief')
    OR public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'reviewer')));

CREATE POLICY "Reviewer upload CV" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'reviewer-cvs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Reviewer/staff read CV" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'reviewer-cvs' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(),'editorial_secretary')
    OR public.has_role(auth.uid(),'editor_in_chief')
    OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "Reviewer update own CV" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'reviewer-cvs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Reviewer delete own CV" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'reviewer-cvs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Published files public" ON storage.objects FOR SELECT USING (bucket_id = 'published');
CREATE POLICY "EiC publish files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'published' AND (public.has_role(auth.uid(),'editor_in_chief') OR public.has_role(auth.uid(),'admin')));

CREATE POLICY "Avatars public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Upload own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Update own avatar" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
