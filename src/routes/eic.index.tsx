import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { eicMetrics } from "@/lib/mock-eic";
import { FileText, Clock, AlertTriangle, CheckCircle2, XCircle, Gauge } from "lucide-react";

export const Route = createFileRoute("/eic/")({
  component: ExecutiveDashboard,
});

function ExecutiveDashboard() {
  const m = eicMetrics;
  const cards = [
    { label: "Active submissions", value: m.activeSubmissions, icon: FileText, tone: "text-foreground" },
    { label: "Pending decisions", value: m.pendingDecisions, icon: Clock, tone: "text-purple-700" },
    { label: "Overdue reviews", value: m.overdueReviews, icon: AlertTriangle, tone: "text-red-700" },
    { label: "Accepted (MTD)", value: m.acceptedMTD, icon: CheckCircle2, tone: "text-emerald-700" },
    { label: "Rejected (MTD)", value: m.rejectedMTD, icon: XCircle, tone: "text-rose-700" },
    { label: "Avg. days to decision", value: m.avgDaysToDecision, icon: Gauge, tone: "text-foreground" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-start justify-between p-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
                <div className={`mt-1 font-serif text-2xl ${c.tone}`}>{c.value}</div>
              </div>
              <c.icon className={`h-5 w-5 ${c.tone}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Accept / reject ratios by subject area</CardTitle>
          <p className="text-sm text-muted-foreground">Year-to-date, all decisions.</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {m.bySubject.map((row) => {
              const total = row.accepted + row.rejected;
              const acc = total ? Math.round((row.accepted / total) * 100) : 0;
              return (
                <div key={row.area}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="font-medium text-foreground">{row.area}</span>
                    <span className="text-xs text-muted-foreground">
                      {row.submissions} submissions · {row.accepted} accepted · {row.rejected} rejected
                    </span>
                  </div>
                  <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className="bg-emerald-500" style={{ width: `${acc}%` }} />
                    <div className="bg-rose-500" style={{ width: `${100 - acc}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Where attention is needed</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Link to="/eic/decisions" className="rounded-lg border border-border bg-card p-4 hover:border-primary/40">
            <Badge variant="secondary">{m.pendingDecisions} pending</Badge>
            <div className="mt-2 font-medium text-foreground">Final decisions</div>
            <p className="text-xs text-muted-foreground">Review reviewer recommendations and finalize.</p>
          </Link>
          <Link to="/eic/triage" className="rounded-lg border border-border bg-card p-4 hover:border-primary/40">
            <Badge variant="secondary">New</Badge>
            <div className="mt-2 font-medium text-foreground">Triage incoming submissions</div>
            <p className="text-xs text-muted-foreground">Assign to associate editors or desk-reject.</p>
          </Link>
          <Link to="/eic/conflicts" className="rounded-lg border border-border bg-card p-4 hover:border-primary/40">
            <Badge variant="destructive">Action</Badge>
            <div className="mt-2 font-medium text-foreground">Open conflict cases</div>
            <p className="text-xs text-muted-foreground">Disputes and ethics concerns awaiting your call.</p>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
