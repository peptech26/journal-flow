import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { editorPerformance } from "@/lib/mock-eic";

export const Route = createFileRoute("/eic/performance")({
  component: PerformancePage,
});

function PerformancePage() {
  const rows = [...editorPerformance].sort((a, b) => b.onTimeRate - a.onTimeRate);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">Editorial board performance</CardTitle>
        <p className="text-sm text-muted-foreground">Last 90 days · efficiency and timeliness.</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 pr-3">Editor</th>
                <th className="py-2 pr-3">Assigned</th>
                <th className="py-2 pr-3">Decided</th>
                <th className="py-2 pr-3">Avg. days to 1st decision</th>
                <th className="py-2 pr-3">Overdue</th>
                <th className="py-2 pr-3">On-time rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-border/60">
                  <td className="py-2.5 pr-3 font-medium text-foreground">{r.name}</td>
                  <td className="py-2.5 pr-3">{r.assigned}</td>
                  <td className="py-2.5 pr-3">{r.decided}</td>
                  <td className="py-2.5 pr-3">
                    <span className={r.avgDaysToFirstDecision > 45 ? "text-rose-700" : "text-foreground"}>{r.avgDaysToFirstDecision}</span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={r.overdue > 0 ? "text-rose-700" : "text-muted-foreground"}>{r.overdue}</span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div className={`h-full ${r.onTimeRate >= 90 ? "bg-emerald-500" : r.onTimeRate >= 75 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${r.onTimeRate}%` }} />
                      </div>
                      <span className="text-xs">{r.onTimeRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
