## Goal

Wire the full manuscript lifecycle across Author → Editorial Secretary → Reviewer → Editor-in-Chief → Library, with explicit hand-off buttons at each step and a "Submit manuscript" CTA on the library home that opens the submission system.

Backend (Supabase) tables already exist (`manuscripts`, `manuscript_versions`, `reviewer_assignments`, `audit_events`). However the current dashboards run on mock data and auth is not yet enforced. To stay focused on the requested workflow features and keep them visible immediately, I'll implement the lifecycle on a **shared client-side store** (localStorage-backed, same shape as the Supabase schema) so every dashboard reads/writes the same manuscripts. Swapping the store for Supabase queries later is a one-file change.

## Status model

```text
draft → submitted → under_review → revisions_requested → resubmitted
      → with_eic → approved_for_publication → published
                ↘ rejected (terminal, with comment)
```

Every state change appends an entry to the manuscript's audit timeline (actor, action, note, timestamp).

## What changes per surface

### Library home (`/`)
- Promote the existing hero "Submit your manuscript" button and add a secondary sticky "Submit manuscript" button in the library section header that routes to `/author/submit` (auth gate via existing `/submit` page handles unauthenticated users).
- Library list reads `published` manuscripts from the shared store (merged with existing mock articles so the page is never empty).

### Author (`/author`)
- Dashboard lists the author's manuscripts with current status + next action.
- "Submit to editor" button on a draft → status `submitted`.
- When status = `revisions_requested`, show a **Submit revision** action on the manuscript detail page that uploads a new version and flips status to `resubmitted`.
- When status = `approved_for_publication` and EiC routed to author, show **Approve galley & publish** button (publishes to library).

### Editorial Secretary (`/secretary`)
- Triage queue shows `submitted` and `resubmitted` manuscripts.
- Per-row actions:
  - **Reject** (modal requires comment) → `rejected`.
  - **Accept & assign reviewers** (modal: pick 1–3 reviewers from `/secretary/reviewers`) → `under_review`, creates `reviewer_assignments`.
  - **Return to author for corrections** (modal: comment) → `revisions_requested` (used after reviews come back).
  - **Send to Editor-in-Chief for galley** → `with_eic`.
  - **Publish to library** (available once `approved_for_publication`) → `published`.

### Reviewer (`/reviewer`)
- Assignments list shows manuscripts assigned to the current reviewer.
- Review form (already exists) gains a **Return review to secretary** submit button → marks assignment complete, appends review comments to the manuscript, and when all assignments for that round are complete flips manuscript back to secretary view (status stays `under_review` but surfaces "reviews complete" badge in triage).

### Editor-in-Chief (`/eic`)
- Galley queue lists `with_eic` manuscripts.
- Per-row actions:
  - **Send final to Secretary for publication** → `approved_for_publication` (route=secretary).
  - **Send final to Author for approval** → `approved_for_publication` (route=author).
  - **Publish to library** (direct) → `published`.

### Shared
- New `src/lib/workflow-store.ts`: typed store with `getManuscripts`, `updateStatus`, `assignReviewers`, `addReview`, `publish`, plus a `useWorkflowStore` hook (subscribes via `storage` event + custom event so all open tabs/dashboards stay in sync).
- New `src/lib/workflow-types.ts`: status enum + helpers (label, color, next-actions per role).
- New `src/components/workflow/audit-timeline.tsx` reused on every manuscript detail page.
- New `src/components/workflow/action-dialog.tsx` for comment-required actions (reject, return, assign).

## Technical notes

- Pure frontend wiring — no schema changes, no server functions. The store mirrors the Supabase schema 1:1 so we can later replace `workflow-store.ts` internals with `supabase.from('manuscripts')...` calls without touching the dashboards.
- "Current user" is read from `localStorage` (already set after signup in `auth.tsx`). Role-based action visibility uses that role.
- All buttons use existing shadcn `Button`/`Dialog`/`Textarea` components; no new dependencies.
- Audit timeline entries are appended in the store, never edited.

## Out of scope (call out)

- Real Supabase persistence of manuscripts (still mock — keeps this change focused on the workflow buttons you asked for).
- Email notifications.
- File virus scanning / plagiarism (already mocked in their own pages).

Approve and I'll implement.
