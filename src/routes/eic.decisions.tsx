import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { pendingDecisions, REC_META, type ReviewerRec } from "@/lib/mock-eic";
import { Gavel } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/eic/decisions")({
  component: DecisionsPage,
});

const DECISIONS: { value: ReviewerRec; label: string }[] = [
  { value: "accept", label: "Accept" },
  { value: "minor", label: "Minor revisions" },
  { value: "major", label: "Major revisions" },
  { value: "reject", label: "Reject" },
];

function DecisionsPage() {
  const [active, setActive] = useState(pendingDecisions[0].id);
  const ms = pendingDecisions.find((p) => p.id === active)!;
  const [decision, setDecision] = useState<ReviewerRec>("minor");
  const [letter, setLetter] = useState("");
  const [override, setOverride] = useState(false);
  const [reason, setReason] = useState("");

  const majority: ReviewerRec = (() => {
    const counts: Record<ReviewerRec, number> = { accept: 0, minor: 0, major: 0, reject: 0 };
    ms.reviewers.forEach((r) => counts[r.recommendation]++);
    return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as ReviewerRec);
  })();
  const isOverride = decision !== majority;

  const submit = () => {
    if (isOverride && !reason.trim()) {
      toast.error("An override reason is required.");
      return;
    }
    toast.success(`Decision recorded: ${REC_META[decision].label}`);
    setLetter("");
    setReason("");
    setOverride(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <Card>
        <CardHeader><CardTitle className="font-serif text-lg">Pending decisions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {pendingDecisions.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                active === p.id ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[11px] text-muted-foreground">{p.id}</span>
                <Badge variant="secondary" className="text-[10px]">{p.subject}</Badge>
              </div>
              <div className="mt-1 text-sm font-medium text-foreground">{p.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{p.authorsLabel} · {p.handlingEditor}</div>
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="font-serif text-lg">{ms.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{ms.authorsLabel} · submitted {new Date(ms.submittedAt).toLocaleDateString()}</p>
              </div>
              <Badge variant="outline">Majority: {REC_META[majority].label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {ms.reviewers.map((r, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-baseline justify-between">
                  <div className="font-medium text-foreground">{r.name}</div>
                  <span className={`rounded border px-2 py-0.5 text-[11px] ${REC_META[r.recommendation].tone}`}>
                    {REC_META[r.recommendation].label}
                  </span>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Confidential to editor</div>
                    <p className="mt-0.5 text-sm">{r.toEditor}</p>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">To author</div>
                    <p className="mt-0.5 text-sm">{r.toAuthor}</p>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground">Returned {new Date(r.submittedAt).toLocaleDateString()}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-serif text-lg">Final decision</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={decision} onValueChange={(v) => setDecision(v as ReviewerRec)} className="grid gap-2 md:grid-cols-4">
              {DECISIONS.map((d) => (
                <Label key={d.value} htmlFor={`d-${d.value}`} className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card p-2.5 hover:border-primary/40">
                  <RadioGroupItem id={`d-${d.value}`} value={d.value} />
                  <span className="text-sm">{d.label}</span>
                </Label>
              ))}
            </RadioGroup>

            {isOverride && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
                  <Checkbox id="ack" checked={override} onCheckedChange={(c) => setOverride(!!c)} />
                  <Label htmlFor="ack">I am overriding the reviewer majority ({REC_META[majority].label}).</Label>
                </div>
                <Textarea
                  className="mt-2 min-h-[90px] bg-white"
                  placeholder="Mandatory: reason for overriding reviewer recommendations…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            )}

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Decision letter to author</Label>
              <Textarea className="mt-1 min-h-[140px]" placeholder="Compose the editorial decision letter…" value={letter} onChange={(e) => setLetter(e.target.value)} />
            </div>

            <div className="flex justify-end">
              <Button onClick={submit} disabled={isOverride && !override}>
                <Gavel className="mr-2 h-4 w-4" /> Record final decision
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
