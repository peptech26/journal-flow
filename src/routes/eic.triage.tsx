import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { newSubmissions, ASSOCIATE_EDITORS, DESK_REJECT_REASONS } from "@/lib/mock-eic";
import { UserPlus, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/eic/triage")({
  component: TriagePage,
});

function TriagePage() {
  const [items, setItems] = useState(newSubmissions);

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">All caught up — no submissions awaiting triage.</CardContent></Card>
      )}
      {items.map((s) => (
        <TriageRow key={s.id} item={s} onResolved={() => setItems((xs) => xs.filter((x) => x.id !== s.id))} />
      ))}
    </div>
  );
}

function TriageRow({ item, onResolved }: { item: typeof newSubmissions[number]; onResolved: () => void }) {
  const [mode, setMode] = useState<"none" | "assign" | "reject">("none");
  const [editor, setEditor] = useState(ASSOCIATE_EDITORS[0]);
  const [reason, setReason] = useState(DESK_REJECT_REASONS[0]);
  const [notes, setNotes] = useState("");

  const assign = () => {
    toast.success(`${item.id} assigned to ${editor}`);
    onResolved();
  };
  const deskReject = () => {
    toast.success(`${item.id} desk-rejected — ${reason}`);
    onResolved();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <CardTitle className="font-serif text-lg">{item.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{item.authorsLabel} · submitted {new Date(item.submittedAt).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{item.subject}</Badge>
            <Badge variant="outline" className="font-mono text-[10px]">{item.id}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{item.abstractExcerpt}</p>
        {mode === "none" && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setMode("assign")}><UserPlus className="mr-1.5 h-4 w-4" /> Assign to editor</Button>
            <Button size="sm" variant="outline" onClick={() => setMode("reject")}><XCircle className="mr-1.5 h-4 w-4" /> Desk-reject</Button>
          </div>
        )}
        {mode === "assign" && (
          <div className="grid gap-3 rounded-lg border border-border bg-secondary/40 p-3 md:grid-cols-[1fr_auto]">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Associate editor</Label>
              <Select value={editor} onValueChange={setEditor}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ASSOCIATE_EDITORS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={assign}>Assign</Button>
              <Button variant="ghost" onClick={() => setMode("none")}>Cancel</Button>
            </div>
          </div>
        )}
        {mode === "reject" && (
          <div className="grid gap-3 rounded-lg border border-rose-200 bg-rose-50/40 p-3">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Standardized reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DESK_REJECT_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Note to author (optional)</Label>
              <Textarea className="mt-1 bg-white" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Brief, constructive note…" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setMode("none")}>Cancel</Button>
              <Button variant="destructive" onClick={deskReject}>Desk-reject</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
