-- Helper: append an audit row using the calling user's profile + role.
CREATE OR REPLACE FUNCTION public.log_manuscript_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_name text;
  v_role public.app_role;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT full_name INTO v_name FROM public.profiles WHERE id = v_actor;
    SELECT role INTO v_role
      FROM public.user_roles
      WHERE user_id = v_actor
      ORDER BY CASE role
        WHEN 'admin' THEN 1
        WHEN 'editor_in_chief' THEN 2
        WHEN 'editorial_secretary' THEN 3
        WHEN 'reviewer' THEN 4
        WHEN 'author' THEN 5
      END
      LIMIT 1;

    INSERT INTO public.audit_events (manuscript_id, actor_id, actor_name, actor_role, action, details)
    VALUES (
      NEW.id,
      v_actor,
      COALESCE(v_name, 'System'),
      v_role,
      'status_change',
      jsonb_build_object(
        'from', OLD.status,
        'to', NEW.status,
        'rejection_reason', NEW.rejection_reason,
        'routed_to', NEW.routed_to
      )
    );
  END IF;
  RETURN NEW;
END $$;

REVOKE EXECUTE ON FUNCTION public.log_manuscript_status_change() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_manuscripts_status_audit ON public.manuscripts;
CREATE TRIGGER trg_manuscripts_status_audit
  AFTER UPDATE OF status ON public.manuscripts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_manuscript_status_change();

-- Also auto-update manuscripts.updated_at
DROP TRIGGER IF EXISTS trg_manuscripts_updated_at ON public.manuscripts;
CREATE TRIGGER trg_manuscripts_updated_at
  BEFORE UPDATE ON public.manuscripts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();