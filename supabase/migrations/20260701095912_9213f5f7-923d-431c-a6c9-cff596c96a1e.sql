
-- Revoke public execute on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_role_request_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_manuscript_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- Tighten permissive WITH CHECK (true) policies to match USING clauses
DROP POLICY IF EXISTS "Staff update" ON public.manuscripts;
CREATE POLICY "Staff update" ON public.manuscripts
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'editorial_secretary'::public.app_role)
    OR public.has_role(auth.uid(), 'editor_in_chief'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'editorial_secretary'::public.app_role)
    OR public.has_role(auth.uid(), 'editor_in_chief'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

DROP POLICY IF EXISTS "Reviewer or staff update assignments" ON public.reviewer_assignments;
CREATE POLICY "Reviewer or staff update assignments" ON public.reviewer_assignments
  FOR UPDATE TO authenticated
  USING (
    reviewer_id = auth.uid()
    OR public.has_role(auth.uid(), 'editorial_secretary'::public.app_role)
    OR public.has_role(auth.uid(), 'editor_in_chief'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    reviewer_id = auth.uid()
    OR public.has_role(auth.uid(), 'editorial_secretary'::public.app_role)
    OR public.has_role(auth.uid(), 'editor_in_chief'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );
