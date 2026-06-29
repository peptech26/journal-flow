## Goal

Persist the entire manuscript workflow in your connected Supabase project (`amjwfovwswthhgsvdzsd`) so submissions, reviewer assignments, status transitions, file uploads, audit timeline, and role-request approvals survive reloads and are shared across users. Dashboards stay public for now (no `_authenticated/` gate yet); when no Supabase session is present we fall back to a demo user so the UI still works in the preview.

## Schema reconciliation

Your existing `manuscript_status` enum is close to the workflow store but missing four labels. One migration adds them and a few helper columns.

- ALTER ENUM `manuscript_status` ADD: `reviews_complete`, `resubmitted`, `with_eic`, `approved_for_publication`. (Existing labels `with_secretary`, `revision_requested`, `rejected_by_secretary`, `galley_proof`, `accepted`, `published`, `submitted`, `under_review`, `withdrawn` stay.)
- `manuscripts`: add `routed_to text` ("secretary" | "author"), `rejection_reason text`.
- `reviewer_assignments`: confirm `recommendation`, `comments_to_editor`, `comments_to_author`, `submitted_at` exist (add any missing).
- `audit_events`: add `actor_role app_role` and `actor_name text` so the timeline survives even if a profile row is missing.

## Row-level security

- `manuscripts`: author SELECT/UPDATE own; secretary/EiC/admin SELECT/UPDATE all; anon SELECT only where `status = 'published'`.
- `manuscript_versions`: author can INSERT for own manuscripts; secretary/EiC SELECT all; reviewers SELECT versions of manuscripts they're assigned to.
- `reviewer_assignments`: secretary INSERT/UPDATE; reviewer SELECT/UPDATE own row only.
- `audit_events`: SELECT for anyone who can read the parent manuscript; INSERT via SECURITY DEFINER helper only.
- `role_requests` + `role_request_history`: requester SELECT own; admin SELECT/UPDATE all; INSERT for any authenticated user.
- `reviewer_cvs`: reviewer manages own; secretary SELECT all.

## Storage RLS

- `manuscripts` bucket: author can write under `{manuscript_id}/...`; secretary/EiC/reviewers (assigned) read.
- `reviewer-cvs` bucket: reviewer writes own folder; secretary reads.
- `published` bucket: secretary/EiC write; anon read.
- `avatars` bucket: owner writes own folder; anon read.

## SECURITY DEFINER helpers

- `public.log_audit(_manuscript_id uuid, _action text, _details jsonb)` — inserts an `audit_events` row and copies actor name/role from `auth.uid()`. Called from triggers on status change and from server fns.
- Existing `has_role()` is reused.
- `public.publish_manuscript(_id uuid)` — secretary or EiC only; flips status + `published_at`.

## Trigger: status-change audit

`AFTER UPDATE OF status ON manuscripts` calls `log_audit` so every transition lands in `audit_events` automatically.

## Frontend rewrite

Replace `src/lib/workflow-store.ts` localStorage code with a Supabase-backed module exposing the same API surface used by `manuscript-queue.tsx` so the UI doesn't change shape:

- `useWorkflowList(role)` — TanStack Query reading `manuscripts` (+ joined `assignments`, latest `manuscript_versions`, `audit_events`).
- Mutations via `createServerFn` in `src/lib/workflow.functions.ts` using `requireSupabaseAuth`:
  - `submitManuscript`, `rejectManuscript`, `assignReviewers`, `submitReview`, `returnToAuthor`, `resubmit`, `sendToEic`, `eicRoute`, `publishManuscript`.
- File uploads (browser side, using the publishable client) into the right bucket; the server fn records `manuscript_versions` / `reviewer_cvs` rows.
- `src/lib/current-user.ts` becomes a thin Supabase-aware hook: reads `supabase.auth.getUser()` + `user_roles` if signed in; otherwise returns the localStorage demo user so demo flows still work.

Public library page (`/`) reads `manuscripts` where `status='published'` through a public server fn using the server publishable client.

## Role-request approval

- Signup with `editorial_secretary` or `editor_in_chief` inserts into `role_requests` instead of granting the role. Admin sees a pending list on `/admin/role-requests`; approval flips status and the existing trigger writes to `user_roles`.
- Singleton lock: SQL check that prevents approval when an `editorial_secretary` or `editor_in_chief` is already active. UI shows "currently held by X" and lets admin revoke first.
- Each role-request detail page renders `role_request_history` so the full approval/rejection trail is visible.

## File layout

```text
supabase/migrations/<ts>_workflow_persistence.sql   # all SQL above

src/lib/
  workflow.functions.ts     # createServerFn mutations
  workflow.server.ts        # shared types / status maps
  workflow-queries.ts       # client-side TanStack Query hooks + uploads
  current-user.ts           # rewritten Supabase-aware

src/components/workflow/
  manuscript-queue.tsx      # swapped to new hooks, same UI

src/routes/
  admin/role-requests.tsx   # new
  admin/role-requests.$id.tsx
  author.submit.tsx         # wired to real upload + submit fn
  author.manuscripts.$id.revise.tsx  # real resubmit
  reviewer.assignments.$id.tsx       # real submitReview
  reviewer.profile.tsx               # real CV upload
  secretary.index.tsx / eic.index.tsx (already pull queue)
  index.tsx                          # public library reads Supabase
  auth.tsx                           # role-request branch for secretary/EiC
```

## Out of scope this turn

- Moving dashboards under `_authenticated/` (you chose "Not yet").
- Email notifications, plagiarism integration, real CV parsing.
- Avatar uploads (bucket exists; UI plumbing later).

## Risks / things you should know

- Editing an enum used by a column requires the migration to run as separate statements; I'll split into two migration files if Postgres rejects the single transaction.
- Storage RLS policies must reference the bucket via `bucket_id` — easy to get wrong; I'll verify with the linter after.
- The first time you sign in with a real Supabase user, the demo data in localStorage is ignored. To seed your account, sign up as an author and use the submit flow once.

Approve and I'll ship the migration first, then the frontend rewrite in a second batch so you can review the SQL before the code lands on top of it.