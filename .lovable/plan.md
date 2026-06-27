## Author Dashboard — Implementation Plan

Scope: build the Author-side experience listed below. Since Lovable Cloud (Supabase) isn't connected yet, I'll scaffold the full UI with realistic mock state now, structured so swapping in real data + storage later is a drop-in change.

### Routes (new)

```
/author                       Dashboard home (submissions list + status)
/author/profile               Profile + avatar upload
/author/submit                Smart Submission Wizard (multi-step)
/author/manuscripts/$id       Manuscript detail (status, timeline, correspondence)
/author/manuscripts/$id/revise   Revision upload + response letter
/author/manuscripts/$id/ethics   Ethics & disclosure forms
```

Author-only routes will live under `_authenticated/author/*` once auth is wired. For now they're public so we can preview.

### Features → UI mapping

1. **Profile picture (used on article cards)**
   - `/author/profile` page with avatar dropzone, crop preview, name, affiliation, ORCID iD, bio.
   - Article cards on `/` extended with author avatar + name strip.
   - Storage target later: `avatars/` public bucket.

2. **Smart Submission Wizard** (`/author/submit`)
   - Steps: Type & Title → Abstract & Keywords → Authors & ORCID → Files → Ethics → Review & Submit.
   - ORCID field with format validation (`0000-0000-0000-000X` + checksum).
   - Keywords as chip input. Co-authors repeater (name, email, affiliation, ORCID, corresponding flag).
   - Reference textarea with an "Auto-format (APA)" button that normalises spacing/punctuation client-side.
   - Progress bar + ability to save draft (localStorage now, DB later).

3. **File Validation**
   - On upload: check extension (.docx/.pdf), size cap, estimate word count (for .txt/.pdf via lightweight parse; .docx flagged "will be checked server-side").
   - Anonymization check: scan extracted text for author names from the metadata step → warn if found.
   - "Convert to PDF" placeholder action (stub now; real conversion runs in a server function once Cloud is on).
   - Inline checklist with pass/warn/fail badges before allowing submit.

4. **Real-Time Dashboard** (`/author`)
   - Cards per manuscript: title, status badge (Draft / With Editor / Under Review / Revisions Requested / Decision Pending / Accepted / Published / Rejected), submitted date, last update, ETA to decision.
   - Filters: status, year. Search by title.
   - Empty state CTA → submission wizard.

5. **Revision Upload** (`/author/manuscripts/$id/revise`)
   - New file dropzone, "Highlight changes" toggle (track-changes vs colored-text guidance), point-by-point response letter editor (reviewer comment ↔ author response pairs auto-populated from prior review).
   - Submit creates a new manuscript version row (mocked list now).

6. **Correspondence Log** (tab on manuscript detail)
   - Unified timeline: editor decisions, reviewer comments (anonymized), system events, emails sent. Each entry timestamped, type-tagged, expandable.

7. **Publication Ethics Forms** (`/author/manuscripts/$id/ethics`)
   - Three one-click forms: Conflict of Interest, Data Availability Statement, Copyright Transfer Agreement.
   - Each renders a pre-filled template, checkbox attestations, typed-signature field, "Generate & sign" → produces a downloadable PDF stub and marks the form complete on the manuscript.

### Shared building blocks

- `src/lib/mock-manuscripts.ts` — sample manuscripts, versions, reviews, timeline events, ethics state.
- `src/components/author/` — `StatusBadge`, `ManuscriptCard`, `WizardStepper`, `FileDropzone`, `ValidationChecklist`, `TimelineList`, `ResponseLetterEditor`, `EthicsFormCard`, `AvatarUploader`.
- `src/lib/orcid.ts` — ORCID validator with checksum.
- `src/lib/reference-format.ts` — naive APA normaliser.
- Header gets an "Author dashboard" link when a (mock) session flag is set.

### What I'm NOT doing this round

- Real auth, RLS, persistence — needs Lovable Cloud connection. UI will already speak the right shapes so wiring is mechanical.
- True DOCX parsing / PDF conversion — needs server function (Cloud).
- Email sending — needs Cloud + email domain.

### Technical notes (for your reference)

- Wizard state held in a single `useReducer` with `localStorage` persistence keyed by draft id.
- File checks run in-browser via `FileReader` + a small word-count heuristic for PDFs (`pdfjs-dist` would be added only if you want true PDF text extraction now — say the word and I'll add it).
- Status badges + timeline use the existing forest/gold theme; no new tokens.
- All new routes follow TanStack file-based routing (`src/routes/author.*.tsx`).

Approve and I'll build it. Want me to **also** add `pdfjs-dist` for real PDF word-count/anonymization checks now, or leave that for the Cloud phase?