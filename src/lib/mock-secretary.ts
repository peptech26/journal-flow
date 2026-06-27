// Mock data for the Editorial Secretary dashboard.
// All data is in-memory; swap with Supabase queries once Cloud is wired.

export type TriageStatus =
  | "awaiting_assignment"
  | "with_reviewers"
  | "overdue_review"
  | "pending_decision"
  | "revisions_in"
  | "ready_to_publish";

export const TRIAGE_META: Record<TriageStatus, { label: string; tone: string }> = {
  awaiting_assignment: { label: "Awaiting assignment", tone: "bg-blue-100 text-blue-900 border-blue-200" },
  with_reviewers: { label: "With reviewers", tone: "bg-amber-100 text-amber-900 border-amber-200" },
  overdue_review: { label: "Overdue review", tone: "bg-red-100 text-red-900 border-red-200" },
  pending_decision: { label: "Pending decision", tone: "bg-purple-100 text-purple-900 border-purple-200" },
  revisions_in: { label: "Revisions in", tone: "bg-orange-100 text-orange-900 border-orange-200" },
  ready_to_publish: { label: "Ready to publish", tone: "bg-emerald-100 text-emerald-900 border-emerald-200" },
};

export type TriageItem = {
  id: string;
  title: string;
  authorsLabel: string;
  submittedAt: string;
  daysInStage: number;
  status: TriageStatus;
  assignedEditor?: string;
  reviewers?: { name: string; due: string; state: "invited" | "accepted" | "submitted" | "overdue" }[];
  plagiarismScore?: number;
  keywords: string[];
};

export const mockTriage: TriageItem[] = [
  {
    id: "ms-2026-031",
    title: "Soil carbon dynamics under cocoa agroforestry transitions",
    authorsLabel: "Asare, K. et al.",
    submittedAt: "2026-06-22",
    daysInStage: 5,
    status: "awaiting_assignment",
    plagiarismScore: 8,
    keywords: ["soil carbon", "cocoa", "agroforestry"],
  },
  {
    id: "ms-2026-029",
    title: "Remote-sensing detection of illegal chainsaw activity in Atewa",
    authorsLabel: "Nyarko, A.; Owusu, P.",
    submittedAt: "2026-06-18",
    daysInStage: 9,
    status: "with_reviewers",
    assignedEditor: "Dr. A. Mensah",
    reviewers: [
      { name: "Dr. K. Boateng", due: "2026-07-22", state: "accepted" },
      { name: "Prof. E. Quaye", due: "2026-07-22", state: "invited" },
    ],
    plagiarismScore: 12,
    keywords: ["remote sensing", "illegal logging"],
  },
  {
    id: "ms-2026-014",
    title: "Community perceptions of REDD+ benefit-sharing in Bono East",
    authorsLabel: "Boateng, E. et al.",
    submittedAt: "2026-05-10",
    daysInStage: 21,
    status: "overdue_review",
    assignedEditor: "Prof. K. Owusu",
    reviewers: [{ name: "Dr. M. Sarpong", due: "2026-06-10", state: "overdue" }],
    plagiarismScore: 6,
    keywords: ["REDD+", "governance"],
  },
  {
    id: "ms-2026-021",
    title: "Allometric equations for carbon estimation in shea parklands",
    authorsLabel: "Anonymised",
    submittedAt: "2026-05-14",
    daysInStage: 3,
    status: "pending_decision",
    assignedEditor: "Dr. A. Mensah",
    reviewers: [
      { name: "Dr. K. Boateng", due: "2026-06-15", state: "submitted" },
      { name: "Dr. R. Adjei", due: "2026-06-15", state: "submitted" },
    ],
    plagiarismScore: 4,
    keywords: ["allometry", "shea", "carbon"],
  },
  {
    id: "ms-2026-018",
    title: "Drivers of community forest reserve compliance",
    authorsLabel: "Kuffour, S.",
    submittedAt: "2026-02-03",
    daysInStage: 2,
    status: "revisions_in",
    assignedEditor: "Dr. A. Mensah",
    plagiarismScore: 9,
    keywords: ["CREMA", "compliance"],
  },
  {
    id: "ms-2026-009",
    title: "Mangrove carbon offsets along the Volta estuary",
    authorsLabel: "Tetteh, J.; Mensa, F.",
    submittedAt: "2026-01-20",
    daysInStage: 1,
    status: "ready_to_publish",
    assignedEditor: "Prof. K. Owusu",
    plagiarismScore: 5,
    keywords: ["mangroves", "blue carbon"],
  },
];

export type ReviewerProfile = {
  id: string;
  name: string;
  affiliation: string;
  country: string;
  email: string;
  expertise: string[];
  reviewsCompleted: number;
  acceptanceRate: number; // % of invitations accepted
  avgTurnaroundDays: number;
  qualityScore: number; // 1-5
  lastReviewed: string;
  currentLoad: number;
};

export const mockReviewerPool: ReviewerProfile[] = [
  {
    id: "rv-1",
    name: "Dr. Kwame Boateng",
    affiliation: "KNUST, Kumasi",
    country: "Ghana",
    email: "k.boateng@knust.edu.gh",
    expertise: ["allometry", "carbon", "savanna"],
    reviewsCompleted: 23,
    acceptanceRate: 78,
    avgTurnaroundDays: 19,
    qualityScore: 4.6,
    lastReviewed: "2026-05-12",
    currentLoad: 1,
  },
  {
    id: "rv-2",
    name: "Prof. Esi Quaye",
    affiliation: "University of Ghana",
    country: "Ghana",
    email: "e.quaye@ug.edu.gh",
    expertise: ["remote sensing", "land use", "illegal logging"],
    reviewsCompleted: 41,
    acceptanceRate: 64,
    avgTurnaroundDays: 24,
    qualityScore: 4.8,
    lastReviewed: "2026-06-01",
    currentLoad: 2,
  },
  {
    id: "rv-3",
    name: "Dr. Mawuli Sarpong",
    affiliation: "CSIR-FORIG",
    country: "Ghana",
    email: "m.sarpong@csir.org.gh",
    expertise: ["REDD+", "governance", "community forestry"],
    reviewsCompleted: 17,
    acceptanceRate: 88,
    avgTurnaroundDays: 31,
    qualityScore: 4.1,
    lastReviewed: "2026-04-22",
    currentLoad: 0,
  },
  {
    id: "rv-4",
    name: "Dr. Ruth Adjei",
    affiliation: "University of Cape Coast",
    country: "Ghana",
    email: "r.adjei@ucc.edu.gh",
    expertise: ["soil carbon", "agroforestry", "cocoa"],
    reviewsCompleted: 12,
    acceptanceRate: 92,
    avgTurnaroundDays: 16,
    qualityScore: 4.7,
    lastReviewed: "2026-06-09",
    currentLoad: 1,
  },
  {
    id: "rv-5",
    name: "Prof. Daniel Mensah",
    affiliation: "Wageningen University",
    country: "Netherlands",
    email: "d.mensah@wur.nl",
    expertise: ["tropical ecology", "biodiversity", "edge effects"],
    reviewsCompleted: 58,
    acceptanceRate: 52,
    avgTurnaroundDays: 21,
    qualityScore: 4.9,
    lastReviewed: "2026-05-30",
    currentLoad: 3,
  },
  {
    id: "rv-6",
    name: "Dr. Akua Asante",
    affiliation: "FORIG, Kumasi",
    country: "Ghana",
    email: "a.asante@forig.org",
    expertise: ["mangroves", "blue carbon", "coastal ecology"],
    reviewsCompleted: 9,
    acceptanceRate: 85,
    avgTurnaroundDays: 14,
    qualityScore: 4.4,
    lastReviewed: "2026-03-18",
    currentLoad: 0,
  },
];

export type ReminderRule = {
  id: string;
  name: string;
  trigger: "reviewer_invitation_pending" | "reviewer_review_due" | "author_revision_due";
  offsetDays: number; // before(-) or after(+) due date
  channel: "email" | "in_app";
  escalateToEditor: boolean;
  enabled: boolean;
};

export const mockReminderRules: ReminderRule[] = [
  { id: "rm-1", name: "Reviewer invitation — gentle nudge", trigger: "reviewer_invitation_pending", offsetDays: 3, channel: "email", escalateToEditor: false, enabled: true },
  { id: "rm-2", name: "Reviewer invitation — escalate", trigger: "reviewer_invitation_pending", offsetDays: 7, channel: "email", escalateToEditor: true, enabled: true },
  { id: "rm-3", name: "Review due — 3 days before", trigger: "reviewer_review_due", offsetDays: -3, channel: "email", escalateToEditor: false, enabled: true },
  { id: "rm-4", name: "Review overdue — escalate to editor", trigger: "reviewer_review_due", offsetDays: 5, channel: "email", escalateToEditor: true, enabled: true },
  { id: "rm-5", name: "Author revision — 7 days before deadline", trigger: "author_revision_due", offsetDays: -7, channel: "email", escalateToEditor: false, enabled: true },
];

export type PlagiarismReport = {
  manuscriptId: string;
  title: string;
  overallScore: number;
  topMatches: { source: string; score: number; url: string }[];
  runAt: string;
  status: "clean" | "flagged" | "critical";
};

export const mockPlagiarismReports: PlagiarismReport[] = [
  {
    manuscriptId: "ms-2026-031",
    title: "Soil carbon dynamics under cocoa agroforestry transitions",
    overallScore: 8,
    topMatches: [
      { source: "Asare et al. 2019, Agroforestry Systems", score: 4, url: "#" },
      { source: "FAO Cocoa Atlas (2021)", score: 3, url: "#" },
    ],
    runAt: "2026-06-23T10:14:00Z",
    status: "clean",
  },
  {
    manuscriptId: "ms-2026-029",
    title: "Remote-sensing detection of illegal chainsaw activity",
    overallScore: 12,
    topMatches: [
      { source: "Nyarko 2024, Remote Sensing", score: 6, url: "#" },
      { source: "GFW Methodology Note", score: 4, url: "#" },
    ],
    runAt: "2026-06-19T08:02:00Z",
    status: "flagged",
  },
  {
    manuscriptId: "ms-2026-014",
    title: "Community perceptions of REDD+ benefit-sharing",
    overallScore: 26,
    topMatches: [
      { source: "Boateng et al. 2023 (preprint)", score: 14, url: "#" },
      { source: "REDD+ Ghana Annual Report 2022", score: 7, url: "#" },
    ],
    runAt: "2026-05-12T15:30:00Z",
    status: "critical",
  },
];

export type EmailTemplate = {
  id: string;
  name: string;
  category: "invitation" | "decision" | "revision" | "reminder";
  subject: string;
  body: string;
};

export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: "tpl-invite",
    name: "Reviewer invitation",
    category: "invitation",
    subject: "Invitation to review for the Ghana Journal of Forestry — {{title}}",
    body: "Dear {{reviewer_name}},\n\nWe would be grateful if you could review the manuscript titled \"{{title}}\". Please respond by {{respond_by}}.\n\nKind regards,\nEditorial Office",
  },
  {
    id: "tpl-accept",
    name: "Acceptance letter",
    category: "decision",
    subject: "Decision on {{manuscript_id}} — Accepted",
    body: "Dear {{author_name}},\n\nWe are pleased to inform you that your manuscript \"{{title}}\" has been accepted for publication.\n\nRegards,\nEditor-in-Chief",
  },
  {
    id: "tpl-reject",
    name: "Rejection letter",
    category: "decision",
    subject: "Decision on {{manuscript_id}}",
    body: "Dear {{author_name}},\n\nAfter careful consideration, the editorial board has decided not to proceed with \"{{title}}\". Reviewer comments are attached.\n\nRegards,\nEditorial Office",
  },
  {
    id: "tpl-revise",
    name: "Revision request",
    category: "revision",
    subject: "Revisions requested — {{manuscript_id}}",
    body: "Dear {{author_name}},\n\nThe reviewers have suggested revisions to \"{{title}}\". Please submit your revised version by {{revision_deadline}}.\n\nRegards,\nEditorial Office",
  },
];

export type CommHubMessage = {
  id: string;
  manuscriptId: string;
  subject: string;
  preview: string;
  from: string;
  at: string;
  unread: boolean;
};

export const mockMessages: CommHubMessage[] = [
  { id: "m1", manuscriptId: "ms-2026-029", subject: "Re: Reviewer invitation", preview: "Happy to review — should have it back by the 18th.", from: "Prof. Esi Quaye", at: "2026-06-26T08:14:00Z", unread: true },
  { id: "m2", manuscriptId: "ms-2026-014", subject: "Reviewer overdue notice", preview: "Auto-reminder sent to Dr. Sarpong.", from: "System", at: "2026-06-25T06:00:00Z", unread: false },
  { id: "m3", manuscriptId: "ms-2026-031", subject: "Submission acknowledgement", preview: "Thank you for confirming receipt.", from: "K. Asare", at: "2026-06-23T11:42:00Z", unread: true },
];

export const journalStats = {
  submissionsYTD: 87,
  acceptedYTD: 24,
  rejectedYTD: 31,
  avgReviewDays: 41,
  acceptanceRate: 28,
  monthly: [
    { m: "Jan", subs: 9, dec: 5 },
    { m: "Feb", subs: 12, dec: 7 },
    { m: "Mar", subs: 11, dec: 8 },
    { m: "Apr", subs: 14, dec: 9 },
    { m: "May", subs: 18, dec: 11 },
    { m: "Jun", subs: 23, dec: 15 },
  ],
  geo: [
    { country: "Ghana", count: 52 },
    { country: "Nigeria", count: 11 },
    { country: "Côte d'Ivoire", count: 7 },
    { country: "Kenya", count: 6 },
    { country: "United Kingdom", count: 5 },
    { country: "Netherlands", count: 3 },
    { country: "Other", count: 3 },
  ],
};
