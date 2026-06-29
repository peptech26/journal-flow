// Supabase-backed workflow store. Same exported API as the previous
// localStorage version so consumers (manuscript-queue.tsx, library, etc.)
// keep working with minimal changes.

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser, type Role } from "./current-user";

// DB enum: submitted | with_secretary | rejected_by_secretary | under_review
// | revision_requested | resubmitted | reviews_complete | with_eic
// | approved_for_publication | accepted | galley_proof | published | withdrawn
export type WorkflowStatus =
  | "submitted"
  | "with_secretary"
  | "under_review"
  | "reviews_complete"
  | "revision_requested"
  | "resubmitted"
  | "with_eic"
  | "approved_for_publication"
  | "accepted"
  | "galley_proof"
  | "published"
  | "rejected_by_secretary"
  | "withdrawn";

export const STATUS_LABEL: Record<WorkflowStatus, string> = {
  submitted: "Submitted to editor",
  with_secretary: "With secretary",
  under_review: "Under review",
  reviews_complete: "Reviews complete",
  revision_requested: "Revisions requested",
  resubmitted: "Resubmitted",
  with_eic: "With Editor-in-Chief",
  approved_for_publication: "Approved for publication",
  accepted: "Accepted",
  galley_proof: "Galley proof",
  published: "Published",
  rejected_by_secretary: "Rejected",
  withdrawn: "Withdrawn",
};

export const STATUS_TONE: Record<WorkflowStatus, string> = {
  submitted: "bg-blue-100 text-blue-900",
  with_secretary: "bg-blue-100 text-blue-900",
  under_review: "bg-amber-100 text-amber-900",
  reviews_complete: "bg-amber-200 text-amber-900",
  revision_requested: "bg-orange-100 text-orange-900",
  resubmitted: "bg-blue-100 text-blue-900",
  with_eic: "bg-purple-100 text-purple-900",
  approved_for_publication: "bg-emerald-100 text-emerald-900",
  accepted: "bg-emerald-100 text-emerald-900",
  galley_proof: "bg-purple-100 text-purple-900",
  published: "bg-primary text-primary-foreground",
  rejected_by_secretary: "bg-red-100 text-red-900",
  withdrawn: "bg-muted text-muted-foreground",
};

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  actorRole: Role | "system" | "admin";
  action: string;
  note?: string;
};

export type Assignment = {
  id: string;
  reviewerId: string;
  reviewerName: string;
  assignedAt: string;
  completed: boolean;
  recommendation?: "accept" | "minor_revision" | "major_revision" | "reject" | null;
  commentsToEditor?: string | null;
  commentsToAuthor?: string | null;
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
  versions: { id: string; label: string; filename: string; uploadedAt: string; filePath?: string }[];
  assignments: Assignment[];
  reviews: Assignment[]; // alias for completed assignments
  routedTo?: "secretary" | "author" | null;
  rejectionReason?: string | null;
  audit: AuditEntry[];
};

const EVT = "gjf:workflow-change";

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVT));
}

async function fetchAll(): Promise<WorkflowManuscript[]> {
  const { data: rows, error } = await supabase
    .from("manuscripts")
    .select(`
      id,title,abstract,keywords,status,routed_to,rejection_reason,
      author_id,created_at,updated_at,
      author:profiles!manuscripts_author_id_fkey(full_name),
      manuscript_versions(id,version_number,file_path,file_name,created_at),
      reviewer_assignments(id,reviewer_id,assigned_at,submitted_at,recommendation,comments_to_editor,comments_to_author,
        reviewer:profiles!reviewer_assignments_reviewer_id_fkey(full_name)),
      audit_events(id,action,details,created_at,actor_name,actor_role)
    `)
    .order("updated_at", { ascending: false });
  if (error) {
    console.warn("[workflow] fetch failed", error.message);
    return [];
  }
  return (rows ?? []).map((r): WorkflowManuscript => {
    const versions = (r.manuscript_versions ?? [])
      .slice()
      .sort((a: { version_number: number }, b: { version_number: number }) => a.version_number - b.version_number)
      .map((v) => ({
        id: v.id,
        label: v.version_number === 1 ? "Initial submission" : `Revision ${v.version_number - 1}`,
        filename: v.file_name ?? v.file_path.split("/").pop() ?? "manuscript.pdf",
        filePath: v.file_path,
        uploadedAt: v.created_at,
      }));
    const assignments: Assignment[] = (r.reviewer_assignments ?? []).map((a) => {
      const reviewerObj = a.reviewer as { full_name?: string } | { full_name?: string }[] | null;
      const reviewer = Array.isArray(reviewerObj) ? reviewerObj[0] : reviewerObj;
      return {
        id: a.id,
        reviewerId: a.reviewer_id,
        reviewerName: reviewer?.full_name ?? "Reviewer",
        assignedAt: a.assigned_at,
        completed: !!a.submitted_at,
        recommendation: a.recommendation,
        commentsToEditor: a.comments_to_editor,
        commentsToAuthor: a.comments_to_author,
      };
    });
    const audit: AuditEntry[] = (r.audit_events ?? [])
      .slice()
      .sort((a: { created_at: string }, b: { created_at: string }) => a.created_at.localeCompare(b.created_at))
      .map((e) => {
        const detailsObj = (e.details ?? {}) as Record<string, unknown>;
        const note =
          typeof detailsObj.note === "string" ? detailsObj.note :
          typeof detailsObj.rejection_reason === "string" ? detailsObj.rejection_reason :
          typeof detailsObj.comments_to_editor === "string" ? detailsObj.comments_to_editor :
          undefined;
        return {
          id: e.id,
          at: e.created_at,
          actor: e.actor_name ?? "User",
          actorRole: (e.actor_role ?? "system") as AuditEntry["actorRole"],
          action: e.action === "status_change"
            ? `Status → ${(detailsObj.to as string) ?? ""}`
            : e.action,
          note,
        };
      });
    const authorObj = r.author as { full_name?: string } | { full_name?: string }[] | null;
    const author = Array.isArray(authorObj) ? authorObj[0] : authorObj;
    return {
      id: r.id,
      title: r.title,
      abstract: r.abstract ?? "",
      keywords: r.keywords ?? [],
      authorId: r.author_id,
      authorName: author?.full_name ?? "Author",
      status: r.status as WorkflowStatus,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      versions,
      assignments,
      reviews: assignments.filter((a) => a.completed),
      routedTo: (r.routed_to ?? null) as "secretary" | "author" | null,
      rejectionReason: r.rejection_reason ?? null,
      audit,
    };
  });
}

export function useWorkflow() {
  const [list, setList] = useState<WorkflowManuscript[]>([]);
  useEffect(() => {
    let cancelled = false;
    const load = () => fetchAll().then((rows) => { if (!cancelled) setList(rows); });
    load();
    const handler = () => load();
    if (typeof window !== "undefined") {
      window.addEventListener(EVT, handler);
    }
    // Optional realtime
    const channel = supabase
      .channel("gjf-workflow")
      .on("postgres_changes", { event: "*", schema: "public", table: "manuscripts" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviewer_assignments" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "audit_events" }, load)
      .subscribe();
    return () => {
      cancelled = true;
      if (typeof window !== "undefined") window.removeEventListener(EVT, handler);
      supabase.removeChannel(channel);
    };
  }, []);
  return list;
}

async function logAudit(manuscriptId: string, action: string, details: Record<string, unknown> = {}) {
  const u = getCurrentUser();
  await supabase.from("audit_events").insert({
    manuscript_id: manuscriptId,
    actor_id: u.id.startsWith("u-") ? null : u.id,
    actor_name: u.name,
    actor_role: roleToDb(u.role),
    action,
    details,
  });
}

function roleToDb(r: Role): "author" | "reviewer" | "editorial_secretary" | "editor_in_chief" {
  switch (r) {
    case "author": return "author";
    case "reviewer": return "reviewer";
    case "secretary": return "editorial_secretary";
    case "eic": return "editor_in_chief";
  }
}

export const workflow = {
  async createAndSubmit(input: { title: string; abstract: string; keywords: string[]; filename?: string; filePath?: string; coverLetter?: string }) {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) throw new Error("Sign in to submit a manuscript");
    const { data: m, error } = await supabase
      .from("manuscripts")
      .insert({
        title: input.title,
        abstract: input.abstract,
        keywords: input.keywords,
        author_id: uid,
        status: "submitted",
      })
      .select("id")
      .single();
    if (error || !m) throw error ?? new Error("Failed to create manuscript");
    if (input.filename || input.filePath) {
      await supabase.from("manuscript_versions").insert({
        manuscript_id: m.id,
        version_number: 1,
        file_path: input.filePath ?? `placeholder/${input.filename}`,
        file_name: input.filename,
        cover_letter: input.coverLetter,
        uploaded_by: uid,
      });
    }
    await logAudit(m.id, "submitted_to_editor");
    emit();
    return m.id;
  },

  async submitToEditor(id: string) {
    await supabase.from("manuscripts").update({ status: "submitted" }).eq("id", id);
    emit();
  },

  async reject(id: string, comment: string) {
    await supabase.from("manuscripts").update({ status: "rejected_by_secretary", rejection_reason: comment }).eq("id", id);
    await logAudit(id, "rejected", { note: comment });
    emit();
  },

  async assignReviewers(id: string, reviewers: { reviewerId: string; reviewerName: string }[]) {
    if (reviewers.length === 0) return;
    const { data: userData } = await supabase.auth.getUser();
    const rows = reviewers.map((r) => ({
      manuscript_id: id,
      reviewer_id: r.reviewerId,
      assigned_by: userData.user?.id,
      status: "invited" as const,
    }));
    const { error } = await supabase.from("reviewer_assignments").insert(rows);
    if (error) throw error;
    await supabase.from("manuscripts").update({ status: "under_review" }).eq("id", id);
    await logAudit(id, "reviewers_assigned", { reviewers: reviewers.map((r) => r.reviewerName) });
    emit();
  },

  async submitReview(id: string, review: { reviewerId: string; recommendation: "accept" | "minor_revision" | "major_revision" | "reject"; commentsToEditor: string; commentsToAuthor: string }) {
    const { error } = await supabase
      .from("reviewer_assignments")
      .update({
        recommendation: review.recommendation,
        comments_to_editor: review.commentsToEditor,
        comments_to_author: review.commentsToAuthor,
        submitted_at: new Date().toISOString(),
        status: "submitted",
      })
      .eq("manuscript_id", id)
      .eq("reviewer_id", review.reviewerId);
    if (error) throw error;
    // Mark reviews complete if all submitted.
    const { data: remaining } = await supabase
      .from("reviewer_assignments")
      .select("id,submitted_at")
      .eq("manuscript_id", id);
    if (remaining && remaining.length > 0 && remaining.every((a) => a.submitted_at)) {
      await supabase.from("manuscripts").update({ status: "reviews_complete" }).eq("id", id);
    }
    await logAudit(id, "review_submitted", { recommendation: review.recommendation, comments_to_editor: review.commentsToEditor });
    emit();
  },

  async returnToAuthor(id: string, comment: string) {
    await supabase.from("manuscripts").update({ status: "revision_requested" }).eq("id", id);
    await logAudit(id, "returned_to_author", { note: comment });
    emit();
  },

  async resubmit(id: string, filename?: string, filePath?: string) {
    const { data: userData } = await supabase.auth.getUser();
    const { data: versions } = await supabase
      .from("manuscript_versions")
      .select("version_number")
      .eq("manuscript_id", id)
      .order("version_number", { ascending: false })
      .limit(1);
    const next = (versions?.[0]?.version_number ?? 0) + 1;
    await supabase.from("manuscript_versions").insert({
      manuscript_id: id,
      version_number: next,
      file_path: filePath ?? `placeholder/${filename ?? "revision.pdf"}`,
      file_name: filename ?? `revision-v${next}.pdf`,
      uploaded_by: userData.user?.id,
    });
    await supabase.from("manuscripts").update({ status: "resubmitted", current_version: next }).eq("id", id);
    await logAudit(id, "resubmitted");
    emit();
  },

  async sendToEic(id: string) {
    await supabase.from("manuscripts").update({ status: "with_eic" }).eq("id", id);
    emit();
  },

  async eicRoute(id: string, route: "secretary" | "author") {
    await supabase.from("manuscripts").update({ status: "approved_for_publication", routed_to: route }).eq("id", id);
    emit();
  },

  async publish(id: string) {
    await supabase
      .from("manuscripts")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", id);
    emit();
  },
};

// Fetch active reviewers (users with the 'reviewer' role) for the assign dialog.
export async function fetchReviewers(): Promise<{ reviewerId: string; reviewerName: string; expertise: string[] }[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("user_id, profile:profiles!user_roles_user_id_fkey(full_name, expertise)")
    .eq("role", "reviewer");
  if (error) return [];
  return (data ?? []).map((row) => {
    const p = row.profile as { full_name?: string; expertise?: string[] } | { full_name?: string; expertise?: string[] }[] | null;
    const profile = Array.isArray(p) ? p[0] : p;
    return {
      reviewerId: row.user_id,
      reviewerName: profile?.full_name ?? "Reviewer",
      expertise: profile?.expertise ?? [],
    };
  });
}

// Backwards-compat re-export so existing imports still resolve.
export const MOCK_REVIEWERS: { reviewerId: string; reviewerName: string; expertise: string[] }[] = [];
