import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useWorkflow, workflow, MOCK_REVIEWERS, STATUS_LABEL, STATUS_TONE, type WorkflowManuscript } from "@/lib/workflow-store";
import type { Role } from "@/lib/current-user";
import { Send, XCircle, UserPlus, RotateCcw, FileUp, BookCheck, CheckCircle2, ArrowUpRight } from "lucide-react";

export function ManuscriptQueue({ role, currentUserId }: { role: Role; currentUserId: string }) {
  const list = useWorkflow();
  const items = filterByRole(list, role, currentUserId);

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="font-serif text-base">Workflow queue</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">No manuscripts need your action right now.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">Workflow queue</CardTitle>
        <p className="text-sm text-muted-foreground">Manuscripts awaiting your action in the publication pipeline.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((m) => <Row key={m.id} m={m} role={role} currentUserId={currentUserId} />)}
      </CardContent>
    </Card>
  );
}

function filterByRole(list: WorkflowManuscript[], role: Role, uid: string) {
  switch (role) {
    case "author":
      return list.filter((m) => m.authorId === uid || m.authorId === "demo-author" || m.authorId === "demo");
    case "secretary":
      return list.filter((m) => ["submitted", "resubmitted", "reviews_complete", "under_review", "with_eic", "approved_for_publication"].includes(m.status));
    case "reviewer":
      return list.filter((m) => m.assignments.some((a) => a.reviewerId === uid || a.reviewerId === "rev-001"));
    case "eic":
      return list.filter((m) => ["with_eic", "approved_for_publication", "published"].includes(m.status));
  }
}

function Row({ m, role, currentUserId }: { m: WorkflowManuscript; role: Role; currentUserId: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{m.id}</span>
            <Badge variant="outline" className={`${STATUS_TONE[m.status]} border-transparent font-normal`}>{STATUS_LABEL[m.status]}</Badge>
            {m.routedTo && <span className="text-xs">routed to {m.routedTo}</span>}
          </div>
          <div className="mt-1.5 font-serif text-base font-semibold text-foreground">{m.title}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">by {m.authorName} · updated {new Date(m.updatedAt).toLocaleDateString()}</div>
        </div>
        <Actions m={m} role={role} currentUserId={currentUserId} />
      </div>
      {m.audit.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">Audit timeline ({m.audit.length})</summary>
          <ol className="mt-2 space-y-1.5 border-l border-border pl-3 text-xs">
            {m.audit.slice().reverse().map((e) => (
              <li key={e.id}>
                <span className="text-foreground">{e.action}</span>
                <span className="text-muted-foreground"> — {e.actor} ({e.actorRole}) · {new Date(e.at).toLocaleString()}</span>
                {e.note && <div className="mt-0.5 rounded bg-muted/60 px-2 py-1 text-muted-foreground">{e.note}</div>}
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}

function Actions({ m, role, currentUserId }: { m: WorkflowManuscript; role: Role; currentUserId: string }) {
  const [openDialog, setOpenDialog] = useState<null | "reject" | "return" | "assign" | "review" | "resubmit">(null);

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {/* AUTHOR */}
      {role === "author" && m.status === "revision_requested" && (
        <Button size="sm" onClick={() => setOpenDialog("resubmit")}>
          <FileUp className="mr-1 h-3.5 w-3.5" /> Submit revision
        </Button>
      )}
      {role === "author" && m.status === "approved_for_publication" && m.routedTo === "author" && (
        <Button size="sm" onClick={() => { workflow.publish(m.id); toast.success("Approved & published"); }}>
          <BookCheck className="mr-1 h-3.5 w-3.5" /> Approve & publish
        </Button>
      )}

      {/* SECRETARY */}
      {role === "secretary" && (m.status === "submitted" || m.status === "resubmitted") && (
        <>
          <Button size="sm" variant="outline" onClick={() => setOpenDialog("assign")}>
            <UserPlus className="mr-1 h-3.5 w-3.5" /> Accept & assign
          </Button>
          <Button size="sm" variant="outline" className="text-red-700" onClick={() => setOpenDialog("reject")}>
            <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
          </Button>
        </>
      )}
      {role === "secretary" && m.status === "reviews_complete" && (
        <>
          <Button size="sm" variant="outline" onClick={() => setOpenDialog("return")}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Return to author
          </Button>
          <Button size="sm" onClick={() => { workflow.sendToEic(m.id); toast.success("Sent to Editor-in-Chief"); }}>
            <ArrowUpRight className="mr-1 h-3.5 w-3.5" /> Send to EiC
          </Button>
        </>
      )}
      {role === "secretary" && m.status === "approved_for_publication" && m.routedTo === "secretary" && (
        <Button size="sm" onClick={() => { workflow.publish(m.id); toast.success("Published to library"); }}>
          <BookCheck className="mr-1 h-3.5 w-3.5" /> Publish to library
        </Button>
      )}

      {/* REVIEWER */}
      {role === "reviewer" && m.status === "under_review" && !m.assignments.find((a) => a.reviewerId === currentUserId || a.reviewerId === "rev-001")?.completed && (
        <Button size="sm" onClick={() => setOpenDialog("review")}>
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Submit review
        </Button>
      )}

      {/* EIC */}
      {role === "eic" && m.status === "with_eic" && (
        <>
          <Button size="sm" variant="outline" onClick={() => { workflow.eicRoute(m.id, "secretary"); toast.success("Sent to secretary"); }}>
            To secretary
          </Button>
          <Button size="sm" variant="outline" onClick={() => { workflow.eicRoute(m.id, "author"); toast.success("Sent to author for approval"); }}>
            To author
          </Button>
          <Button size="sm" onClick={() => { workflow.publish(m.id); toast.success("Published to library"); }}>
            <BookCheck className="mr-1 h-3.5 w-3.5" /> Publish
          </Button>
        </>
      )}
      {role === "eic" && m.status === "approved_for_publication" && (
        <Button size="sm" onClick={() => { workflow.publish(m.id); toast.success("Published"); }}>
          <BookCheck className="mr-1 h-3.5 w-3.5" /> Publish to library
        </Button>
      )}

      <CommentDialog
        open={openDialog === "reject"} onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Reject manuscript" description="Provide a clear reason for the author."
        confirmLabel="Reject" destructive
        onConfirm={(text) => { workflow.reject(m.id, text); toast.success("Manuscript rejected"); }}
      />
      <CommentDialog
        open={openDialog === "return"} onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Return to author for corrections" description="Summarize the reviewer feedback and required changes."
        confirmLabel="Return to author"
        onConfirm={(text) => { workflow.returnToAuthor(m.id, text); toast.success("Returned to author"); }}
      />
      <AssignDialog
        open={openDialog === "assign"} onOpenChange={(o) => !o && setOpenDialog(null)}
        onConfirm={(selected) => { workflow.assignReviewers(m.id, selected); toast.success(`Assigned ${selected.length} reviewer(s)`); }}
      />
      <ReviewDialog
        open={openDialog === "review"} onOpenChange={(o) => !o && setOpenDialog(null)}
        onConfirm={(r) => {
          const a = m.assignments.find((x) => x.reviewerId === currentUserId) ?? m.assignments[0];
          if (!a) { toast.error("No assignment found"); return; }
          workflow.submitReview(m.id, { reviewerId: a.reviewerId, ...r });
          toast.success("Review returned to secretary");
        }}
      />
      <ResubmitDialog
        open={openDialog === "resubmit"} onOpenChange={(o) => !o && setOpenDialog(null)}
        onConfirm={(filename) => { workflow.resubmit(m.id, filename); toast.success("Revision submitted"); }}
      />
    </div>
  );
}

function CommentDialog({ open, onOpenChange, title, description, confirmLabel, destructive, onConfirm }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description: string; confirmLabel: string; destructive?: boolean; onConfirm: (text: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setText(""); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Comments…" />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant={destructive ? "destructive" : "default"} disabled={text.trim().length < 5} onClick={() => { onConfirm(text.trim()); onOpenChange(false); setText(""); }}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignDialog({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; onConfirm: (selected: { reviewerId: string; reviewerName: string }[]) => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (id: string) => setPicked((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setPicked([]); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign reviewers</DialogTitle>
          <DialogDescription>Choose one to three reviewers based on expertise.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {MOCK_REVIEWERS.map((r) => (
            <label key={r.reviewerId} className="flex items-start gap-3 rounded-md border border-border p-3 hover:bg-muted/40">
              <Checkbox checked={picked.includes(r.reviewerId)} onCheckedChange={() => toggle(r.reviewerId)} />
              <div>
                <div className="text-sm font-medium">{r.reviewerName}</div>
                <div className="text-xs text-muted-foreground">{r.expertise.join(" · ")}</div>
              </div>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={picked.length === 0 || picked.length > 3} onClick={() => {
            const selected = MOCK_REVIEWERS.filter((r) => picked.includes(r.reviewerId)).map((r) => ({ reviewerId: r.reviewerId, reviewerName: r.reviewerName }));
            onConfirm(selected); onOpenChange(false); setPicked([]);
          }}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReviewDialog({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; onConfirm: (r: { recommendation: "accept" | "minor_revision" | "major_revision" | "reject"; commentsToEditor: string; commentsToAuthor: string }) => void }) {
  const [rec, setRec] = useState<"accept" | "minor_revision" | "major_revision" | "reject">("minor_revision");
  const [editor, setEditor] = useState("");
  const [author, setAuthor] = useState("");
  const reset = () => { setRec("minor_revision"); setEditor(""); setAuthor(""); };
  const recLabel: Record<typeof rec, string> = { accept: "accept", minor_revision: "minor", major_revision: "major", reject: "reject" };
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit review</DialogTitle>
          <DialogDescription>Your review is returned to the editorial secretary.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Recommendation</Label>
            <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["accept","minor_revision","major_revision","reject"] as const).map((r) => (
                <button key={r} onClick={() => setRec(r)} type="button" className={`rounded-md border px-2 py-1.5 text-xs ${rec === r ? "border-primary bg-primary/10 text-foreground" : "border-border"}`}>{recLabel[r]}</button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Comments to editor (confidential)</Label>
            <Textarea value={editor} onChange={(e) => setEditor(e.target.value)} rows={3} />
          </div>
          <div>
            <Label className="text-xs">Comments to author</Label>
            <Textarea value={author} onChange={(e) => setAuthor(e.target.value)} rows={4} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={author.trim().length < 5} onClick={() => { onConfirm({ recommendation: rec, commentsToEditor: editor, commentsToAuthor: author }); onOpenChange(false); reset(); }}>Return to secretary</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResubmitDialog({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; onConfirm: (filename: string) => void }) {
  const [filename, setFilename] = useState("revised-manuscript.pdf");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit revision</DialogTitle>
          <DialogDescription>Upload your revised manuscript. It returns to the editor for review.</DialogDescription>
        </DialogHeader>
        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFilename(e.target.files?.[0]?.name ?? filename)} className="text-sm" />
        <p className="text-xs text-muted-foreground">Selected: {filename}</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onConfirm(filename); onOpenChange(false); }}>Submit revision</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Re-export used in routes
export { Link };
