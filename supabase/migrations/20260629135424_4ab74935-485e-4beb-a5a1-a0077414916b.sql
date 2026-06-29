-- 1. Add missing workflow statuses to the enum.
ALTER TYPE public.manuscript_status ADD VALUE IF NOT EXISTS 'reviews_complete';
ALTER TYPE public.manuscript_status ADD VALUE IF NOT EXISTS 'resubmitted';
ALTER TYPE public.manuscript_status ADD VALUE IF NOT EXISTS 'with_eic';
ALTER TYPE public.manuscript_status ADD VALUE IF NOT EXISTS 'approved_for_publication';

-- 2. Manuscripts: routing + rejection reason.
ALTER TABLE public.manuscripts
  ADD COLUMN IF NOT EXISTS routed_to text,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 3. Reviewer assignments: review payload columns (idempotent).
ALTER TABLE public.reviewer_assignments
  ADD COLUMN IF NOT EXISTS recommendation public.review_recommendation,
  ADD COLUMN IF NOT EXISTS comments_to_editor text,
  ADD COLUMN IF NOT EXISTS comments_to_author text,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

-- 4. Audit events: denormalised actor info so the timeline survives profile deletion.
ALTER TABLE public.audit_events
  ADD COLUMN IF NOT EXISTS actor_role public.app_role,
  ADD COLUMN IF NOT EXISTS actor_name text;