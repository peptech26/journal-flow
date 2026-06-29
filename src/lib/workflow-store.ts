import { useEffect, useState } from "react";
import { getCurrentUser, type Role } from "./current-user";

export type WorkflowStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "reviews_complete"
  | "revisions_requested"
  | "resubmitted"
  | "with_eic"
  | "approved_for_publication"
  | "published"
  | "rejected";

export const STATUS_LABEL: Record<WorkflowStatus, string> = {
  draft: "Draft",
  submitted: "Submitted to editor",
  under_review: "Under review",
  reviews_complete: "Reviews complete",
  revisions_requested: "Revisions requested",
  resubmitted: "Resubmitted",
  with_eic: "With Editor-in-Chief",
  approved_for_publication: "Approved for publication",
  published: "Published",
  rejected: "Rejected",
};

export const STATUS_TONE: Record<WorkflowStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-100 text-blue-900",
  under_review: "bg-amber-100 text-amber-900",
  reviews_complete: "bg-amber-200 text-amber-900",
  revisions_requested: "bg-orange-100 text-orange-900",
  resubmitted: "bg-blue-100 text-blue-900",
  with_eic: "bg-purple-100 text-purple-900",
  approved_for_publication: "bg-emerald-100 text-emerald-900",
  published: "bg-primary text-primary-foreground",
  rejected: "bg-red-100 text-red-900",
};

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  actorRole: Role | "system";
  action: string;
  note?: string;
};

export type Review = {
  id: string;
  reviewerId: string;
  reviewerName: string;
  recommendation: "accept" | "minor" | "major" | "reject";
  commentsToEditor: string;
  commentsToAuthor: string;
  submittedAt: string;
};

export type Assignment = {
  reviewerId: string;
  reviewerName: string;
  assignedAt: string;
  completed: boolean;
};

export type WorkflowManuscript = {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  authorId: string;
  authorName: string;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  versions: { id: string; label: string; filename: string; uploadedAt: string }[];
  assignments: Assignment[];
  reviews: Review[];
  routedTo?: "secretary" | "author"; // EiC routes final to
  rejectionReason?: string;
  audit: AuditEntry[];
};

const KEY = "gjf:workflow-manuscripts";
const EVT = "gjf:workflow-change";

function seed(): WorkflowManuscript[] {
  const now = new Date().toISOString();
  return [
    {
      id: "WF-2026-001",
      title: "Carbon stocks in mixed-species plantations of Ghana's transition zone",
      abstract: "We quantify above- and below-ground carbon across 18 mixed-species plots and contrast with monoculture teak.",
      keywords: ["carbon", "plantations", "transition zone"],
      authorId: "demo-author",
      authorName: "Ama Mensah",
      status: "submitted",
      createdAt: now,
      updatedAt: now,
      versions: [{ id: "v1", label: "Initial submission", filename: "carbon-stocks-v1.pdf", uploadedAt: now }],
      assignments: [],
      reviews: [],
      audit: [
        { id: "a1", at: now, actor: "Ama Mensah", actorRole: "author", action: "Submitted manuscript to editor" },
      ],
    },
  ];
}

function read(): WorkflowManuscript[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function write(list: WorkflowManuscript[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVT));
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useWorkflow() {
  const [list, setList] = useState<WorkflowManuscript[]>([]);
  useEffect(() => {
    setList(read());
    return subscribe(() => setList(read()));
  }, []);
  return list;
}

function audit(m: WorkflowManuscript, action: string, note?: string): WorkflowManuscript {
  const u = getCurrentUser();
  const entry: AuditEntry = {
    id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    actor: u.name,
    actorRole: u.role,
    action,
    note,
  };
  return { ...m, updatedAt: entry.at, audit: [...m.audit, entry] };
}

function mutate(id: string, fn: (m: WorkflowManuscript) => WorkflowManuscript) {
  const list = read();
  const next = list.map((m) => (m.id === id ? fn(m) : m));
  write(next);
}

export const workflow = {
  list: read,
  get: (id: string) => read().find((m) => m.id === id),

  createDraft(input: { title: string; abstract: string; keywords: string[]; filename?: string }) {
    const u = getCurrentUser();
    const now = new Date().toISOString();
    const id = `WF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const m: WorkflowManuscript = {
      id,
      title: input.title,
      abstract: input.abstract,
      keywords: input.keywords,
      authorId: u.id,
      authorName: u.name,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      versions: input.filename
        ? [{ id: "v1", label: "Draft", filename: input.filename, uploadedAt: now }]
        : [],
      assignments: [],
      reviews: [],
      audit: [{ id: `a-${Date.now()}`, at: now, actor: u.name, actorRole: "author", action: "Created draft" }],
    };
    write([m, ...read()]);
    return m;
  },

  submitToEditor(id: string) {
    mutate(id, (m) => audit({ ...m, status: "submitted" }, "Submitted manuscript to editor"));
  },

  reject(id: string, comment: string) {
    mutate(id, (m) => audit({ ...m, status: "rejected", rejectionReason: comment }, "Rejected manuscript", comment));
  },

  assignReviewers(id: string, reviewers: { reviewerId: string; reviewerName: string }[]) {
    mutate(id, (m) => {
      const now = new Date().toISOString();
      const assignments: Assignment[] = reviewers.map((r) => ({ ...r, assignedAt: now, completed: false }));
      return audit(
        { ...m, status: "under_review", assignments },
        `Assigned ${reviewers.length} reviewer${reviewers.length === 1 ? "" : "s"}`,
        reviewers.map((r) => r.reviewerName).join(", "),
      );
    });
  },

  submitReview(id: string, review: Omit<Review, "id" | "submittedAt">) {
    mutate(id, (m) => {
      const now = new Date().toISOString();
      const r: Review = { ...review, id: `r-${Date.now()}`, submittedAt: now };
      const assignments = m.assignments.map((a) => a.reviewerId === review.reviewerId ? { ...a, completed: true } : a);
      const allDone = assignments.length > 0 && assignments.every((a) => a.completed);
      const next = audit(
        { ...m, reviews: [...m.reviews, r], assignments, status: allDone ? "reviews_complete" : m.status },
        `Reviewer returned review (${review.recommendation})`,
        review.commentsToEditor,
      );
      return next;
    });
  },

  returnToAuthor(id: string, comment: string) {
    mutate(id, (m) => audit({ ...m, status: "revisions_requested" }, "Returned to author for corrections", comment));
  },

  resubmit(id: string, filename?: string) {
    mutate(id, (m) => {
      const now = new Date().toISOString();
      const version = {
        id: `v${m.versions.length + 1}`,
        label: `Revision ${m.versions.length}`,
        filename: filename ?? `revision-${m.versions.length}.pdf`,
        uploadedAt: now,
      };
      return audit({ ...m, status: "resubmitted", versions: [...m.versions, version] }, "Submitted corrections to editor");
    });
  },

  sendToEic(id: string) {
    mutate(id, (m) => audit({ ...m, status: "with_eic" }, "Sent to Editor-in-Chief for galley proof"));
  },

  eicRoute(id: string, route: "secretary" | "author") {
    mutate(id, (m) => audit(
      { ...m, status: "approved_for_publication", routedTo: route },
      `Sent final to ${route === "author" ? "author" : "secretary"} for approval to publish`,
    ));
  },

  publish(id: string) {
    mutate(id, (m) => audit({ ...m, status: "published" }, "Published to library"));
  },
};

// Mock reviewer directory used by the assignment dialog.
export const MOCK_REVIEWERS = [
  { reviewerId: "rev-001", reviewerName: "Dr. Kwesi Owusu", expertise: ["silviculture", "biomass"] },
  { reviewerId: "rev-002", reviewerName: "Prof. Akua Boateng", expertise: ["forest ecology", "biodiversity"] },
  { reviewerId: "rev-003", reviewerName: "Dr. Yaw Frimpong", expertise: ["forest economics", "policy"] },
  { reviewerId: "rev-004", reviewerName: "Dr. Esi Adjei", expertise: ["soil science", "carbon"] },
  { reviewerId: "rev-005", reviewerName: "Dr. Kojo Sarpong", expertise: ["remote sensing", "GIS"] },
];
