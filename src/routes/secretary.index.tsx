import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockTriage, TRIAGE_META, TriageStatus } from "@/lib/mock-secretary";
import { Search, UserPlus, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ManuscriptQueue } from "@/components/workflow/manuscript-queue";
import { ensureRole, getCurrentUser } from "@/lib/current-user";

export const Route = createFileRoute("/secretary/")({
  component: TriageDashboard,
});

const FILTERS: { key: TriageStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "awaiting_assignment", label: "Awaiting assignment" },
  { key: "with_reviewers", label: "With reviewers" },
  { key: "overdue_review", label: "Overdue" },
  { key: "pending_decision", label: "Pending decision" },
  { key: "revisions_in", label: "Revisions in" },
  { key: "ready_to_publish", label: "Ready to publish" },
];

function TriageDashboard() {
  const [filter, setFilter] = useState<TriageStatus | "all">("all");
  const [query, setQuery] = useState("");
  useEffect(() => { ensureRole("secretary"); }, []);
  const me = getCurrentUser();

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: mockTriage.length };
    for (const m of mockTriage) c[m.status] = (c[m.status] ?? 0) + 1;
    return c;
  }, []);

  const items = useMemo(() => {
    return mockTriage.filter((m) => {
      if (filter !== "all" && m.status !== filter) return false;
      if (query && !`${m.title} ${m.authorsLabel} ${m.id}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [filter, query]);

  return (
    <div className="space-y-6">
      <ManuscriptQueue role="secretary" currentUserId={me.id} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New today" value={2} sub="awaiting triage" />
        <StatCard label="Active reviews" value={counts.with_reviewers ?? 0} sub="across all editors" />
        <StatCard label="Overdue" value={counts.overdue_review ?? 0} sub="needs escalation" tone="text-red-700" />
        <StatCard label="Ready to publish" value={counts.ready_to_publish ?? 0} sub="awaiting EiC sign-off" tone="text-emerald-700" />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="font-serif text-lg">Manuscript queue</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, author or ID" className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-1.5 text-xs">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-3 py-1 ${filter === f.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}
              >
                {f.label} {f.key !== "all" && counts[f.key] ? <span className="opacity-70">· {counts[f.key]}</span> : null}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Authors</th>
                  <th className="py-2 pr-3">Stage</th>
                  <th className="py-2 pr-3">Days</th>
                  <th className="py-2 pr-3">Similarity</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => {
                  const meta = TRIAGE_META[m.status];
                  return (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-3 pr-3 font-mono text-xs text-muted-foreground">{m.id}</td>
                      <td className="py-3 pr-3">
                        <div className="font-medium text-foreground">{m.title}</div>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {m.keywords.map((k) => (
                            <span key={k} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">{k}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground">{m.authorsLabel}</td>
                      <td className="py-3 pr-3">
                        <Badge className={`${meta.tone} border font-normal`} variant="outline">{meta.label}</Badge>
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground">{m.daysInStage}</td>
                      <td className="py-3 pr-3">
                        <span className={(m.plagiarismScore ?? 0) >= 20 ? "text-red-700 font-medium" : (m.plagiarismScore ?? 0) >= 10 ? "text-amber-700" : "text-emerald-700"}>
                          {m.plagiarismScore}%
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex justify-end gap-1">
                          {m.status === "awaiting_assignment" && (
                            <Button size="sm" variant="outline" onClick={() => toast.success("Opened reviewer finder")}>
                              <UserPlus className="mr-1 h-3.5 w-3.5" /> Assign
                            </Button>
                          )}
                          {m.status === "overdue_review" && (
                            <Button size="sm" variant="outline" onClick={() => toast.success("Reminder sent")}>
                              <Send className="mr-1 h-3.5 w-3.5" /> Nudge
                            </Button>
                          )}
                          {m.status === "ready_to_publish" && (
                            <Button size="sm" onClick={() => toast.success("Sent to Editor-in-Chief")}>
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> EiC
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">No manuscripts match these filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, sub, tone }: { label: string; value: number; sub: string; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`mt-1 font-serif text-3xl ${tone ?? "text-foreground"}`}>{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}
