export type ManuscriptStatus =
  | "draft"
  | "with_editor"
  | "under_review"
  | "revisions_requested"
  | "decision_pending"
  | "accepted"
  | "published"
  | "rejected";

export type TimelineEvent = {
  id: string;
  type: "submission" | "editor" | "reviewer" | "decision" | "email" | "system";
  at: string;
  title: string;
  body?: string;
  actor?: string;
};

export type ReviewerComment = {
  id: string;
  reviewer: string; // anonymised label e.g. "Reviewer 1"
  comment: string;
  response?: string;
};

export type ManuscriptVersion = {
  id: string;
  label: string;
  uploadedAt: string;
  filename: string;
  notes?: string;
};

export type EthicsForm = {
  conflictOfInterest: boolean;
  dataAvailability: boolean;
  copyrightTransfer: boolean;
};

export type Manuscript = {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  status: ManuscriptStatus;
  submittedAt: string;
  lastUpdatedAt: string;
  estimatedDecisionAt?: string;
  versions: ManuscriptVersion[];
  reviews: ReviewerComment[];
  timeline: TimelineEvent[];
  ethics: EthicsForm;
};

export const STATUS_META: Record<ManuscriptStatus, { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "bg-muted text-muted-foreground" },
  with_editor: { label: "With Editor", tone: "bg-blue-100 text-blue-900" },
  under_review: { label: "Under Review", tone: "bg-amber-100 text-amber-900" },
  revisions_requested: { label: "Revisions Requested", tone: "bg-orange-100 text-orange-900" },
  decision_pending: { label: "Decision Pending", tone: "bg-purple-100 text-purple-900" },
  accepted: { label: "Accepted", tone: "bg-emerald-100 text-emerald-900" },
  published: { label: "Published", tone: "bg-primary text-primary-foreground" },
  rejected: { label: "Rejected", tone: "bg-red-100 text-red-900" },
};

export const mockManuscripts: Manuscript[] = [
  {
    id: "ms-2026-021",
    title: "Allometric equations for carbon estimation in Ghanaian shea parklands",
    abstract:
      "We develop site-specific allometric models for Vitellaria paradoxa using destructive sampling across three savanna districts, improving aboveground biomass estimates by 18%.",
    keywords: ["allometry", "shea", "carbon", "savanna"],
    status: "under_review",
    submittedAt: "2026-05-14",
    lastUpdatedAt: "2026-06-18",
    estimatedDecisionAt: "2026-07-22",
    versions: [
      { id: "v1", label: "Initial submission", uploadedAt: "2026-05-14", filename: "shea-allometry-v1.pdf" },
    ],
    reviews: [
      {
        id: "r1",
        reviewer: "Reviewer 1",
        comment: "Please clarify the sampling protocol for trees < 10 cm DBH and provide residual diagnostics.",
      },
      {
        id: "r2",
        reviewer: "Reviewer 2",
        comment: "The discussion would benefit from comparison with Sawadogo et al. (2022) models from Burkina Faso.",
      },
    ],
    timeline: [
      { id: "t1", type: "submission", at: "2026-05-14T09:12:00Z", title: "Manuscript submitted", actor: "You" },
      { id: "t2", type: "editor", at: "2026-05-16T14:02:00Z", title: "Assigned to subject editor", actor: "Editorial Secretary" },
      { id: "t3", type: "reviewer", at: "2026-06-01T10:30:00Z", title: "Sent to 2 reviewers" },
      { id: "t4", type: "email", at: "2026-06-18T08:45:00Z", title: "Reviewer 1 returned comments" },
    ],
    ethics: { conflictOfInterest: true, dataAvailability: true, copyrightTransfer: false },
  },
  {
    id: "ms-2026-018",
    title: "Drivers of community forest reserve compliance in the Eastern Region",
    abstract:
      "A mixed-methods study across 12 CREMAs identifies tenure security and benefit-sharing transparency as the strongest predictors of compliance.",
    keywords: ["CREMA", "governance", "compliance"],
    status: "revisions_requested",
    submittedAt: "2026-02-03",
    lastUpdatedAt: "2026-05-29",
    estimatedDecisionAt: "2026-07-10",
    versions: [
      { id: "v1", label: "Initial submission", uploadedAt: "2026-02-03", filename: "crema-compliance-v1.pdf" },
    ],
    reviews: [
      { id: "r1", reviewer: "Reviewer 1", comment: "Strengthen the methods section with a clearer sampling frame." },
      { id: "r2", reviewer: "Reviewer 2", comment: "Add a limitations paragraph addressing self-reporting bias." },
    ],
    timeline: [
      { id: "t1", type: "submission", at: "2026-02-03T11:00:00Z", title: "Manuscript submitted", actor: "You" },
      { id: "t2", type: "decision", at: "2026-05-29T16:00:00Z", title: "Decision: Minor revisions", actor: "Editor-in-Chief" },
    ],
    ethics: { conflictOfInterest: true, dataAvailability: true, copyrightTransfer: true },
  },
  {
    id: "ms-2026-024",
    title: "Pollinator visitation patterns in degraded forest edges",
    abstract: "Camera-trap and transect data from 8 sites near Kakum National Park.",
    keywords: ["pollinators", "edge effects"],
    status: "draft",
    submittedAt: "2026-06-22",
    lastUpdatedAt: "2026-06-25",
    versions: [],
    reviews: [],
    timeline: [{ id: "t1", type: "system", at: "2026-06-22T09:00:00Z", title: "Draft created" }],
    ethics: { conflictOfInterest: false, dataAvailability: false, copyrightTransfer: false },
  },
];

export function getManuscript(id: string): Manuscript | undefined {
  return mockManuscripts.find((m) => m.id === id);
}
