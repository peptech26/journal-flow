import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { journalStats } from "@/lib/mock-secretary";
import { Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/secretary/stats")({
  component: StatsPage,
});

function StatsPage() {
  const maxSub = Math.max(...journalStats.monthly.map((m) => m.subs));
  const maxGeo = Math.max(...journalStats.geo.map((g) => g.count));

  const exportCSV = () => {
    const rows = [["month", "submissions", "decisions"], ...journalStats.monthly.map((m) => [m.m, m.subs, m.dec])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "gjf-monthly.csv"; a.click(); URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Submissions (YTD)" value={journalStats.submissionsYTD} />
        <Stat label="Accepted (YTD)" value={journalStats.acceptedYTD} />
        <Stat label="Rejected (YTD)" value={journalStats.rejectedYTD} />
        <Stat label="Avg review time" value={`${journalStats.avgReviewDays}d`} />
        <Stat label="Acceptance rate" value={`${journalStats.acceptanceRate}%`} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-serif text-lg">Monthly submissions vs decisions</CardTitle>
          <Button size="sm" variant="outline" onClick={exportCSV}><Download className="mr-1 h-4 w-4" /> Export CSV</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 items-end gap-3 h-48">
            {journalStats.monthly.map((m) => (
              <div key={m.m} className="flex h-full flex-col items-center justify-end gap-1">
                <div className="flex h-full w-full items-end gap-1">
                  <div className="flex-1 rounded-t bg-primary/80" style={{ height: `${(m.subs / maxSub) * 100}%` }} title={`${m.subs} submissions`} />
                  <div className="flex-1 rounded-t bg-amber-400" style={{ height: `${(m.dec / maxSub) * 100}%` }} title={`${m.dec} decisions`} />
                </div>
                <div className="text-xs text-muted-foreground">{m.m}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-primary/80" /> Submissions</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-amber-400" /> Decisions</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-serif text-lg">Geographic distribution of authors</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {journalStats.geo.map((g) => (
              <div key={g.country}>
                <div className="flex justify-between text-sm"><span>{g.country}</span><span className="text-muted-foreground">{g.count}</span></div>
                <div className="mt-1 h-2 rounded bg-secondary">
                  <div className="h-full rounded bg-primary" style={{ width: `${(g.count / maxGeo) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 font-serif text-3xl text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}
