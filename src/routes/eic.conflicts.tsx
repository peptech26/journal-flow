import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { conflictCases, type ConflictCase } from "@/lib/mock-eic";
import { toast } from "sonner";

export const Route = createFileRoute("/eic/conflicts")({
  component: ConflictsPage,
});

const TYPE_LABEL: Record<ConflictCase["type"], string> = {
  author_complaint: "Author complaint",
  reviewer_dispute: "Reviewer dispute",
  ethics: "Ethics concern",
  coi: "Conflict of interest",
};

const STATUS_TONE: Record<ConflictCase["status"], string> = {
  open: "bg-red-100 text-red-900 border-red-200",
  investigating: "bg-amber-100 text-amber-900 border-amber-200",
  resolved: "bg-emerald-100 text-emerald-900 border-emerald-200",
};

function ConflictsPage() {
  const [cases, setCases] = useState(conflictCases);
  const update = (id: string, status: ConflictCase["status"], msg: string) => {
    setCases((xs) => xs.map((c) => (c.id === id ? { ...c, status } : c)));
    toast.success(msg);
  };

  return (
    <div className="space-y-3">
      {cases.map((c) => (
        <Card key={c.id}>
          <CardHeader>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <CardTitle className="font-serif text-lg">{TYPE_LABEL[c.type]} — {c.manuscriptId}</CardTitle>
                <p className="text-xs text-muted-foreground">Raised by {c.raisedBy} · {new Date(c.raisedAt).toLocaleDateString()}</p>
              </div>
              <span className={`rounded border px-2 py-0.5 text-[11px] ${STATUS_TONE[c.status]}`}>{c.status}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{c.summary}</p>
            <div className="flex flex-wrap gap-2">
              {c.status === "open" && (
                <Button size="sm" onClick={() => update(c.id, "investigating", "Investigation opened")}>
                  Initiate investigation
                </Button>
              )}
              {c.status !== "resolved" && (
                <Button size="sm" variant="outline" onClick={() => update(c.id, "resolved", "Case marked resolved")}>
                  Mark resolved
                </Button>
              )}
              <Badge variant="secondary" className="font-mono text-[10px]">{c.id}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
