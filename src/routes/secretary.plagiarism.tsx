import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockPlagiarismReports } from "@/lib/mock-secretary";
import { ShieldAlert, ShieldCheck, AlertTriangle, ExternalLink, Play } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/secretary/plagiarism")({
  component: PlagiarismPage,
});

const STATUS_META = {
  clean: { label: "Clean", icon: ShieldCheck, tone: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  flagged: { label: "Flagged", icon: AlertTriangle, tone: "bg-amber-100 text-amber-900 border-amber-200" },
  critical: { label: "Critical", icon: ShieldAlert, tone: "bg-red-100 text-red-900 border-red-200" },
} as const;

function PlagiarismPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-serif text-lg">Similarity reports</CardTitle>
            <p className="text-sm text-muted-foreground">One-click iThenticate integration. Reports refresh on new versions.</p>
          </div>
          <Button size="sm" onClick={() => toast.success("Running iThenticate scan on pending submissions…")}>
            <Play className="mr-1 h-4 w-4" /> Run new scan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockPlagiarismReports.map((r) => {
              const meta = STATUS_META[r.status];
              const Icon = meta.icon;
              return (
                <div key={r.manuscriptId} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{r.manuscriptId}</span>
                        <Badge variant="outline" className={`${meta.tone} border font-normal`}>
                          <Icon className="mr-1 h-3 w-3" /> {meta.label}
                        </Badge>
                      </div>
                      <div className="mt-1 font-medium text-foreground">{r.title}</div>
                      <div className="text-xs text-muted-foreground">Scanned {new Date(r.runAt).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-serif text-3xl ${r.status === "critical" ? "text-red-700" : r.status === "flagged" ? "text-amber-700" : "text-emerald-700"}`}>
                        {r.overallScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">overall similarity</div>
                    </div>
                  </div>
                  <Progress className="mt-3" value={r.overallScore} />
                  <div className="mt-3 space-y-1.5">
                    {r.topMatches.map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <a href={m.url} className="inline-flex items-center gap-1 text-foreground hover:underline">
                          {m.source} <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="text-muted-foreground">{m.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
