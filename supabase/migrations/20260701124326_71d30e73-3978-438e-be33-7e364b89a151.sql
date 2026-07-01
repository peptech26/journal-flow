-- Attach notification triggers for workflow transitions
DROP TRIGGER IF EXISTS trg_notify_manuscript_insert ON public.manuscripts;
CREATE TRIGGER trg_notify_manuscript_insert
AFTER INSERT ON public.manuscripts
FOR EACH ROW EXECUTE FUNCTION public.notify_on_manuscript_insert();

DROP TRIGGER IF EXISTS trg_notify_manuscript_status ON public.manuscripts;
CREATE TRIGGER trg_notify_manuscript_status
AFTER UPDATE ON public.manuscripts
FOR EACH ROW EXECUTE FUNCTION public.notify_on_manuscript_status();

DROP TRIGGER IF EXISTS trg_log_manuscript_status ON public.manuscripts;
CREATE TRIGGER trg_log_manuscript_status
AFTER UPDATE ON public.manuscripts
FOR EACH ROW EXECUTE FUNCTION public.log_manuscript_status_change();

DROP TRIGGER IF EXISTS trg_notify_reviewer_assignment ON public.reviewer_assignments;
CREATE TRIGGER trg_notify_reviewer_assignment
AFTER INSERT ON public.reviewer_assignments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_reviewer_assignment();

DROP TRIGGER IF EXISTS trg_notify_message ON public.manuscript_messages;
CREATE TRIGGER trg_notify_message
AFTER INSERT ON public.manuscript_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();

DROP TRIGGER IF EXISTS trg_role_request_history ON public.role_requests;
CREATE TRIGGER trg_role_request_history
AFTER INSERT OR UPDATE ON public.role_requests
FOR EACH ROW EXECUTE FUNCTION public.log_role_request_change();

-- Ensure realtime delivers row-level payloads
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.manuscripts REPLICA IDENTITY FULL;
ALTER TABLE public.reviewer_assignments REPLICA IDENTITY FULL;
ALTER TABLE public.manuscript_messages REPLICA IDENTITY FULL;

-- Add to realtime publication (idempotent)
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.manuscripts; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.reviewer_assignments; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.manuscript_messages; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;