import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ManuscriptQueue } from "@/components/workflow/manuscript-queue";
import { ensureRole, getCurrentUser } from "@/lib/current-user";
import { useWorkflow } from "@/lib/workflow-store";

export const Route = createFileRoute("/secretary/")({
  component: TriageDashboard,
});

function TriageDashboard() {
  useEffect(() => { ensureRole("secretary"); }, []);
  const me = getCurrentUser();
  const all = useWorkflow();

  const stats = useMemo(() => {
    const newToday = all.filter((m) => m.status === "submitted" || m.status === "resubmitted").length;
    const active = all.filter((m) => m.status === "under_review").length;
    const withEic = all.filter((m) => m.status === "with_eic").length;
    const readyToPublish = all.filter((m) => m.status === "approved_for_publication").length;
    return { newToday, active, withEic, readyToPublish };
  }, [all]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Editorial secretary</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-foreground">Triage dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Route new submissions, assign reviewers, and shepherd manuscripts through the pipeline.</p>
      </div>

      <ManuscriptQueue role="secretary" currentUserId={me.id} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Awaiting triage" value={stats.newToday} sub="submitted or resubmitted" />
        <StatCard label="Under review" value={stats.active} sub="with reviewers" />
        <StatCard label="With Editor-in-Chief" value={stats.withEic} sub="pending decision" tone="text-purple-700" />
        <StatCard label="Ready to publish" value={stats.readyToPublish} sub="approved for publication" tone="text-emerald-700" />
      </div>
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
