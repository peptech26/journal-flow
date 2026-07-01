import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, Download } from "lucide-react";
import { ManuscriptQueue } from "@/components/workflow/manuscript-queue";
import { ensureRole, getCurrentUser } from "@/lib/current-user";
import { useWorkflow } from "@/lib/workflow-store";

export const Route = createFileRoute("/reviewer/")({
  component: ReviewerDashboard,
});

function ReviewerDashboard() {
  useEffect(() => { ensureRole("reviewer"); }, []);
  const me = getCurrentUser();
  const all = useWorkflow();

  const mine = useMemo(() => all.filter((m) => m.assignments.some((a) => a.reviewerId === me.id)), [all, me.id]);
  const active = mine.filter((m) => m.status === "under_review" && !m.assignments.find((a) => a.reviewerId === me.id)?.completed);
  const done = mine.filter((m) => m.assignments.find((a) => a.reviewerId === me.id)?.completed);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Reviewer dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your assigned reviews from the editorial secretary.
        </p>
      </header>

      <ManuscriptQueue role="reviewer" currentUserId={me.id} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Assigned" value={mine.length} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Awaiting your review" value={active.length} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Reviews submitted" value={done.length} icon={<CheckCircle2 className="h-4 w-4" />} tone="text-emerald-700" />
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Confidentiality reminder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Manuscripts under review are confidential. Do not share them, store them in shared drives, or
            paste any portion into generative AI tools without written editorial permission.
          </p>
          <Button asChild size="sm" variant="link" className="px-0">
            <Link to="/reviewer/ethics">
              <Download className="mr-1 h-3.5 w-3.5" /> Read full confidentiality agreement
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className={`mt-1 font-serif text-3xl font-semibold ${tone ?? ""}`}>{value}</div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-muted-foreground">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
