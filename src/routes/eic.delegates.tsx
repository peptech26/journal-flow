import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { delegations, ASSOCIATE_EDITORS, type Delegation } from "@/lib/mock-eic";
import { UserCheck, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/eic/delegates")({
  component: DelegatesPage,
});

const ALL_POWERS = [
  { id: "assign_reviewers", label: "Assign reviewers" },
  { id: "desk_reject", label: "Desk-reject" },
  { id: "final_decision", label: "Make final decisions" },
  { id: "publish", label: "Publish to library" },
];

function DelegatesPage() {
  const [list, setList] = useState<Delegation[]>(delegations);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Delegation>({
    id: "", delegate: ASSOCIATE_EDITORS[0], scope: "", startsAt: "", endsAt: "", powers: ["assign_reviewers"], active: true,
  });

  const toggle = (id: string) => {
    setList((xs) => xs.map((d) => (d.id === id ? { ...d, active: !d.active } : d)));
    toast.success("Delegation updated");
  };

  const togglePower = (p: string) => {
    setDraft((d) => ({ ...d, powers: d.powers.includes(p) ? d.powers.filter((x) => x !== p) : [...d.powers, p] }));
  };

  const add = () => {
    if (!draft.scope || !draft.startsAt || !draft.endsAt) return toast.error("Scope and dates are required");
    setList((xs) => [...xs, { ...draft, id: `d-${Date.now()}` }]);
    setAdding(false);
    setDraft({ id: "", delegate: ASSOCIATE_EDITORS[0], scope: "", startsAt: "", endsAt: "", powers: ["assign_reviewers"], active: true });
    toast.success("Delegation granted");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAdding((s) => !s)}><Plus className="mr-1.5 h-4 w-4" /> Grant delegation</Button>
      </div>

      {adding && (
        <Card>
          <CardHeader><CardTitle className="font-serif text-lg">New delegation</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Delegate</Label>
                <Select value={draft.delegate} onValueChange={(v) => setDraft({ ...draft, delegate: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ASSOCIATE_EDITORS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Scope</Label>
                <Input className="mt-1" value={draft.scope} onChange={(e) => setDraft({ ...draft, scope: e.target.value })} placeholder="e.g. Special Issue: REDD+ 2026" />
              </div>
              <div>
                <Label>Starts</Label>
                <Input type="date" className="mt-1" value={draft.startsAt} onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })} />
              </div>
              <div>
                <Label>Ends</Label>
                <Input type="date" className="mt-1" value={draft.endsAt} onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Powers</Label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {ALL_POWERS.map((p) => (
                  <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card p-2 text-sm">
                    <Checkbox checked={draft.powers.includes(p.id)} onCheckedChange={() => togglePower(p.id)} />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              <Button onClick={add}><UserCheck className="mr-2 h-4 w-4" /> Grant</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {list.map((d) => (
          <Card key={d.id}>
            <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{d.delegate}</span>
                  <Badge variant={d.active ? "default" : "secondary"}>{d.active ? "Active" : "Inactive"}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">{d.scope}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {new Date(d.startsAt).toLocaleDateString()} → {new Date(d.endsAt).toLocaleDateString()}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {d.powers.map((p) => (
                    <Badge key={p} variant="outline" className="text-[10px]">{ALL_POWERS.find((x) => x.id === p)?.label ?? p}</Badge>
                  ))}
                </div>
              </div>
              <Button size="sm" variant={d.active ? "outline" : "default"} onClick={() => toggle(d.id)}>
                {d.active ? "Revoke" : "Activate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
