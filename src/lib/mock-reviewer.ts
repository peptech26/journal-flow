export type AnonymityModel = "single_blind" | "double_blind" | "open";

export type ReviewRecommendation = "accept" | "minor_revisions" | "major_revisions" | "reject";

export const RECOMMENDATION_META: Record<ReviewRecommendation, { label: string; tone: string; description: string }> = {
  accept: {
    label: "Accept",
    tone: "bg-emerald-100 text-emerald-900 border-emerald-200",
    description: "Publish substantially as submitted.",
  },
  minor_revisions: {
    label: "Minor Revisions",
    tone: "bg-amber-100 text-amber-900 border-amber-200",
    description: "Small clarifications or edits before acceptance.",
  },
  major_revisions: {
    label: "Major Revisions",
    tone: "bg-orange-100 text-orange-900 border-orange-200",
    description: "Substantive rework required and a second review round.",
  },
  reject: {
    label: "Reject",
    tone: "bg-red-100 text-red-900 border-red-200",
    description: "Not suitable for the journal in its current scope or quality.",
  },
};

export const ANONYMITY_META: Record<AnonymityModel, { label: string; note: string }> = {
  single_blind: { label: "Single-blind", note: "Authors do not see who you are. You can see the authors." },
  double_blind: { label: "Double-blind", note: "Neither you nor the authors see each other's identities." },
  open: { label: "Open review", note: "Your identity and report may be published with the article." },
};

export type Invitation = {
  id: string;
  manuscriptId: string;
  title: string;
  abstract: string;
  keywords: string[];
  invitedAt: string;
  respondBy: string;
  reviewDueIfAccepted: string;
  anonymity: AnonymityModel;
  editor: string;
  status: "pending" | "accepted" | "declined";
};

export type Annotation = {
  id: string;
  page: number;
  quote: string;
  note: string;
  createdAt: string;
};

export type RatingKey = "originality" | "methodology" | "clarity" | "significance" | "literature";

export const RATING_QUESTIONS: { key: RatingKey; label: string; help: string }[] = [
  { key: "originality", label: "Originality", help: "Novelty of the question and contribution." },
  { key: "methodology", label: "Methodology", help: "Soundness of design, sampling, and analysis." },
  { key: "clarity", label: "Clarity of writing", help: "Structure, language, figures and tables." },
  { key: "significance", label: "Significance", help: "Importance to the field and policy/practice." },
  { key: "literature", label: "Literature coverage", help: "Engagement with relevant prior work." },
];

export type Assignment = {
  id: string;
  manuscriptId: string;
  title: string;
  abstract: string;
  keywords: string[];
  authorsLabel: string; // "Authors anonymised" or names depending on anonymity
  anonymity: AnonymityModel;
  assignedAt: string;
  dueAt: string;
  round: number;
  files: { id: string; filename: string; size: string; kind: "manuscript" | "supplementary" }[];
  annotations: Annotation[];
  status: "in_progress" | "submitted" | "overdue";
};

export const mockInvitations: Invitation[] = [
  {
    id: "inv-501",
    manuscriptId: "ms-2026-031",
    title: "Soil carbon dynamics under cocoa agroforestry transitions in the Western Region",
    abstract:
      "We quantify topsoil carbon stocks across a 25-year chronosequence of cocoa-shade transitions, showing recovery to 78% of forest baseline within 15 years.",
    keywords: ["soil carbon", "cocoa", "agroforestry"],
    invitedAt: "2026-06-22",
    respondBy: "2026-06-30",
    reviewDueIfAccepted: "2026-07-28",
    anonymity: "double_blind",
    editor: "Dr. A. Mensah (Subject Editor)",
    status: "pending",
  },
  {
    id: "inv-502",
    manuscriptId: "ms-2026-029",
    title: "Remote-sensing detection of illegal chainsaw activity in Atewa forest reserve",
    abstract:
      "Sentinel-2 time-series combined with acoustic ground truthing identifies hotspots of unlicensed felling with 84% precision.",
    keywords: ["remote sensing", "illegal logging", "Atewa"],
    invitedAt: "2026-06-18",
    respondBy: "2026-06-26",
    reviewDueIfAccepted: "2026-07-22",
    anonymity: "single_blind",
    editor: "Prof. K. Owusu (Editor-in-Chief)",
    status: "pending",
  },
];

export const mockAssignments: Assignment[] = [
  {
    id: "asg-301",
    manuscriptId: "ms-2026-021",
    title: "Allometric equations for carbon estimation in Ghanaian shea parklands",
    abstract:
      "Site-specific allometric models for Vitellaria paradoxa using destructive sampling across three savanna districts.",
    keywords: ["allometry", "shea", "carbon"],
    authorsLabel: "Authors anonymised",
    anonymity: "double_blind",
    assignedAt: "2026-06-01",
    dueAt: "2026-07-02",
    round: 1,
    files: [
      { id: "f1", filename: "shea-allometry-v1-anon.pdf", size: "2.4 MB", kind: "manuscript" },
      { id: "f2", filename: "supp-dataset.xlsx", size: "118 KB", kind: "supplementary" },
    ],
    annotations: [
      {
        id: "a1",
        page: 6,
        quote: "trees < 10 cm DBH were excluded from the destructive sample",
        note: "Justify exclusion — small stems can dominate stocking in degraded plots.",
        createdAt: "2026-06-12T10:14:00Z",
      },
    ],
    status: "in_progress",
  },
  {
    id: "asg-302",
    manuscriptId: "ms-2026-014",
    title: "Community perceptions of REDD+ benefit-sharing in the Bono East Region",
    abstract: "Survey of 412 households across 6 REDD+ pilot communities.",
    keywords: ["REDD+", "benefit sharing"],
    authorsLabel: "Dr. E. Boateng et al.",
    anonymity: "single_blind",
    assignedAt: "2026-05-10",
    dueAt: "2026-06-10",
    round: 2,
    files: [{ id: "f1", filename: "redd-benefit-r2.pdf", size: "1.7 MB", kind: "manuscript" }],
    annotations: [],
    status: "overdue",
  },
];

export function getInvitation(id: string) {
  return mockInvitations.find((i) => i.id === id);
}
export function getAssignment(id: string) {
  return mockAssignments.find((a) => a.id === id);
}
