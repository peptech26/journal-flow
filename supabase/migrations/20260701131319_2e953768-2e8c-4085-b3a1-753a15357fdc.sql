
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_requests TO authenticated;
GRANT ALL ON public.role_requests TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_request_history TO authenticated;
GRANT ALL ON public.role_request_history TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.manuscripts TO authenticated;
GRANT SELECT ON public.manuscripts TO anon;
GRANT ALL ON public.manuscripts TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviewer_assignments TO authenticated;
GRANT ALL ON public.reviewer_assignments TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.manuscript_versions TO authenticated;
GRANT SELECT ON public.manuscript_versions TO anon;
GRANT ALL ON public.manuscript_versions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviewer_cvs TO authenticated;
GRANT ALL ON public.reviewer_cvs TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.manuscript_messages TO authenticated;
GRANT ALL ON public.manuscript_messages TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
