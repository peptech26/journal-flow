// Mock data for the Editor-in-Chief console. In-memory only — swap to Supabase later.

export type SubjectArea =
  | "Agroforestry"
  | "Remote sensing"
  | "Governance & policy"
  | "Biodiversity"
  | "Carbon & climate"
  | "Wood science";

export const SUBJECT_AREAS: SubjectArea[] = [
  "Agroforestry",
  "Remote sensing",
  "Governance & policy",
  "Biodiversity",
  "Carbon & climate",
  "Wood science",
];

export const eicMetrics = {
  activeSubmissions: 38,
  pendingDecisions: 6,
  overdueReviews: 4,
  deskRejectsMTD: 3,
  acceptedMTD: 5,
  rejectedMTD: 7,
  avgDaysToDecision: 41,
  bySubject: [
    { area: "Agroforestry", submissions: 11, accepted: 4, rejected: 3 },
    { area: "Remote sensing", submissions: 8, accepted: 2, rejected: 2 },
    { area: "Governance & policy", submissions: 6, accepted: 1, rejected: 3 },
    { area: "Biodiversity", submissions: 5, accepted: 2, rejected: 1 },
    { area: "Carbon & climate", submissions: 5, accepted: 1, rejected: 1 },
    { area: "Wood science", submissions: 3, accepted: 1, rejected: 1 },
  ],
};

export type ReviewerRec = "accept" | "minor" | "major" | "reject";

export type PendingDecision = {
  id: string;
  title: string;
  authorsLabel: string;
  subject: SubjectArea;
  handlingEditor: string;
  submittedAt: string;
  reviewers: {
    name: string;
    recommendation: ReviewerRec;
    toEditor: string;
    toAuthor: string;
    submittedAt: string;
  }[];
};

export const pendingDecisions: PendingDecision[] = [
  {
    id: "ms-2026-021",
    title: "Allometric equations for carbon estimation in shea parklands",
    authorsLabel: "Anonymised",
    subject: "Carbon & climate",
    handlingEditor: "Dr. A. Mensah",
    submittedAt: "2026-05-14",
    reviewers: [
      {
        name: "Reviewer 1",
        recommendation: "minor",
        toEditor: "Sound methods, sample size acceptable. Minor stats wording.",
        toAuthor: "Please clarify the height-diameter regression in §3.2 and add residual plots.",
        submittedAt: "2026-06-22",
      },
      {
        name: "Reviewer 2",
        recommendation: "major",
        toEditor: "Novelty modest; needs comparison with Mahamane (2019).",
        toAuthor: "Expand the discussion to contrast with prior Sahelian allometries.",
        submittedAt: "2026-06-24",
      },
    ],
  },
  {
    id: "ms-2026-019",
    title: "Fire-return intervals in Mole National Park (2000–2024)",
    authorsLabel: "Owusu, P. et al.",
    subject: "Remote sensing",
    handlingEditor: "Prof. K. Owusu",
    submittedAt: "2026-04-30",
    reviewers: [
      {
        name: "Reviewer 1",
        recommendation: "accept",
        toEditor: "Strong dataset, clear writing.",
        toAuthor: "Excellent. A few typos noted in the attached annotated PDF.",
        submittedAt: "2026-06-18",
      },
      {
        name: "Reviewer 2",
        recommendation: "minor",
        toEditor: "Accept after light edits to Figure 4 caption.",
        toAuthor: "Clarify the Landsat scene selection criterion.",
        submittedAt: "2026-06-20",
      },
    ],
  },
];

export type NewSubmission = {
  id: string;
  title: string;
  authorsLabel: string;
  subject: SubjectArea;
  submittedAt: string;
  abstractExcerpt: string;
};

export const newSubmissions: NewSubmission[] = [
  {
    id: "ms-2026-031",
    title: "Soil carbon dynamics under cocoa agroforestry transitions",
    authorsLabel: "Asare, K. et al.",
    subject: "Agroforestry",
    submittedAt: "2026-06-22",
    abstractExcerpt: "Field measurements from 24 cocoa farms across the Ashanti and Western regions…",
  },
  {
    id: "ms-2026-033",
    title: "A note on sapling survival in degraded shea parklands",
    authorsLabel: "Yeboah, F.",
    submittedAt: "2026-06-25",
    subject: "Carbon & climate",
    abstractExcerpt: "Short observational study from a single 0.4 ha plot in the Upper West…",
  },
];

export const ASSOCIATE_EDITORS = [
  "Dr. A. Mensah",
  "Prof. K. Owusu",
  "Dr. R. Adjei",
  "Dr. M. Sarpong",
];

export const DESK_REJECT_REASONS = [
  "Out of scope for the journal",
  "Insufficient novelty / incremental contribution",
  "Methodological flaws not recoverable in revision",
  "Below quality bar (writing, structure, data)",
  "Ethics or research integrity concerns",
];

export type ConflictCase = {
  id: string;
  manuscriptId: string;
  type: "author_complaint" | "reviewer_dispute" | "ethics" | "coi";
  raisedBy: string;
  raisedAt: string;
  summary: string;
  status: "open" | "investigating" | "resolved";
};

export const conflictCases: ConflictCase[] = [
  {
    id: "c-101",
    manuscriptId: "ms-2026-014",
    type: "author_complaint",
    raisedBy: "E. Boateng (author)",
    raisedAt: "2026-06-20",
    summary: "Author alleges Reviewer 2 misrepresented the sampling design.",
    status: "open",
  },
  {
    id: "c-102",
    manuscriptId: "ms-2026-009",
    type: "ethics",
    raisedBy: "Editorial secretary",
    raisedAt: "2026-06-15",
    summary: "Possible duplicate publication flagged by similarity check (26%).",
    status: "investigating",
  },
  {
    id: "c-103",
    manuscriptId: "ms-2026-027",
    type: "coi",
    raisedBy: "Dr. R. Adjei (editor)",
    raisedAt: "2026-06-10",
    summary: "Undisclosed co-authorship within the past 3 years between author and reviewer.",
    status: "resolved",
  },
];

export type EditorPerformance = {
  name: string;
  assigned: number;
  decided: number;
  avgDaysToFirstDecision: number;
  overdue: number;
  onTimeRate: number;
};

export const editorPerformance: EditorPerformance[] = [
  { name: "Dr. A. Mensah", assigned: 14, decided: 11, avgDaysToFirstDecision: 32, overdue: 1, onTimeRate: 93 },
  { name: "Prof. K. Owusu", assigned: 12, decided: 7, avgDaysToFirstDecision: 49, overdue: 3, onTimeRate: 71 },
  { name: "Dr. R. Adjei", assigned: 9, decided: 8, avgDaysToFirstDecision: 28, overdue: 0, onTimeRate: 100 },
  { name: "Dr. M. Sarpong", assigned: 7, decided: 3, avgDaysToFirstDecision: 58, overdue: 2, onTimeRate: 60 },
];

export type JournalPolicy = {
  abstractWordLimit: number;
  manuscriptWordLimit: number;
  reviewerResponseDays: number;
  reviewerReviewDays: number;
  authorRevisionDays: number;
  openAccessFeeUSD: number;
  waiverCountriesEnabled: boolean;
  doubleBlind: boolean;
};

export const defaultPolicy: JournalPolicy = {
  abstractWordLimit: 300,
  manuscriptWordLimit: 8000,
  reviewerResponseDays: 7,
  reviewerReviewDays: 28,
  authorRevisionDays: 45,
  openAccessFeeUSD: 250,
  waiverCountriesEnabled: true,
  doubleBlind: true,
};

export type Delegation = {
  id: string;
  delegate: string;
  scope: string;
  startsAt: string;
  endsAt: string;
  powers: string[];
  active: boolean;
};

export const delegations: Delegation[] = [
  {
    id: "d-1",
    delegate: "Dr. A. Mensah",
    scope: "Special Issue: Cocoa Agroforestry 2026",
    startsAt: "2026-06-01",
    endsAt: "2026-09-30",
    powers: ["assign_reviewers", "final_decision"],
    active: true,
  },
  {
    id: "d-2",
    delegate: "Prof. K. Owusu",
    scope: "EiC leave cover (Jul 10–24)",
    startsAt: "2026-07-10",
    endsAt: "2026-07-24",
    powers: ["assign_reviewers", "desk_reject", "final_decision"],
    active: false,
  },
];

export const REC_META: Record<ReviewerRec, { label: string; tone: string }> = {
  accept: { label: "Accept", tone: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  minor: { label: "Minor revisions", tone: "bg-blue-100 text-blue-900 border-blue-200" },
  major: { label: "Major revisions", tone: "bg-amber-100 text-amber-900 border-amber-200" },
  reject: { label: "Reject", tone: "bg-red-100 text-red-900 border-red-200" },
};
