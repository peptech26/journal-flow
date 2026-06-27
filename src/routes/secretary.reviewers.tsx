import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { mockReviewerPool, mockEmailTemplates } from "@/lib/mock-secretary";
import { Search, Mail, Star, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/secretary/reviewers")({
  component: ReviewersPage,
});

function ReviewersPage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [template, setTemplate] = useState(mockEmailTemplates[0]);
  const [body, setBody] = useState(mockEmailTemplates[0].body);
  const [subject, setSubject] = useState(mockEmailTemplates[0].subject);

  const list = useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return mockReviewerPool;
    return mockReviewerPool.filter((r) =>
      [r.name, r.affiliation, r.country, ...r.expertise].some((s) => s.toLowerCase().includes(needle)),
    );
  }, [q]);

  const toggle = (id: string) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  };

  const sendInvites = () => {
    if (selected.size === 0) return toast.error("Select at least one reviewer");
    toast.success(`Sent ${selected.size} invitation${selected.size === 1 ? "" : "s"}`);
    setSelected(new Set());
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="font-serif text-lg">Reviewer database</CardTitle>
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by expertise, name, country" className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {list.map((r) => (
              <div key={r.id} className="flex gap-3 rounded-lg border border-border p-3">
                <Checkbox className="mt-1" checked={selected.has(r.id)} onCheckedChange={() => toggle(r.id)} />
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-medium text-foreground">{r.name}</span>
                    <span className="text-xs text-muted-foreground">· {r.affiliation} · {r.country}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {r.expertise.map((e) => (
                      <Badge key={e} variant="secondary" className="font-normal">{e}</Badge>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> {r.qualityScore.toFixed(1)} quality</span>
                    <span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {r.acceptanceRate}% accept rate</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {r.avgTurnaroundDays}d avg turnaround</span>
                    <span>{r.reviewsCompleted} reviews · {r.currentLoad} active</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.success(`Opened CV for ${r.name}`)}>View CV</Button>
              </div>
            ))}
            {list.length === 0 && <div className="py-8 text-center text-sm text-muted-foreground">No reviewers match.</div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Bulk invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-muted-foreground">{selected.size} reviewer{selected.size === 1 ? "" : "s"} selected</div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Template</label>
            <select
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={template.id}
              onChange={(e) => {
                const t = mockEmailTemplates.find((x) => x.id === e.target.value)!;
                setTemplate(t); setBody(t.body); setSubject(t.subject);
              }}
            >
              {mockEmailTemplates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Subject</label>
            <Input className="mt-1" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Body</label>
            <Textarea className="mt-1 min-h-[160px] font-mono text-xs" value={body} onChange={(e) => setBody(e.target.value)} />
            <p className="mt-1 text-[11px] text-muted-foreground">Merge fields: {"{{reviewer_name}}, {{title}}, {{respond_by}}"}</p>
          </div>
          <Button className="w-full" onClick={sendInvites}>
            <Mail className="mr-2 h-4 w-4" /> Send invitations
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
