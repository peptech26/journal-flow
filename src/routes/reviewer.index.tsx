import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { mockAssignments, mockInvitations, ANONYMITY_META } from "@/lib/mock-reviewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, AlertTriangle, CheckCircle2, Download } from "lucide-react";
import { toast } from "sonner";
import { ManuscriptQueue } from "@/components/workflow/manuscript-queue";
import { ensureRole, getCurrentUser } from "@/lib/current-user";

export const Route = createFileRoute("/reviewer/")({
  component: ReviewerDashboard,
});

function daysUntil(date: string) {
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  return diff;
}

function ReviewerDashboard() {
  useEffect(() => { ensureRole("reviewer"); }, []);
  const me = getCurrentUser();
  const pending = mockInvitations.filter((i) => i.status === "pending");
  const active = mockAssignments;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Reviewer dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your assigned reviews, pending invitations, and deadlines in one place.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending invitations" value={pending.length} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Active reviews" value={active.length} icon={<FileText className="h-4 w-4" />} />
        <StatCard
          label="Overdue"
          value={active.filter((a) => a.status === "overdue").length}
          icon={<AlertTriangle className="h-4 w-4" />}
          tone="text-red-600"
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl">Pending invitations</h2>
          <Link to="/reviewer/invitations" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invitations awaiting response.</p>
        ) : (
          <div className="grid gap-3">
            {pending.map((inv) => (
              <Card key={inv.id}>
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                        {ANONYMITY_META[inv.anonymity].label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Respond by {new Date(inv.respondBy).toLocaleDateString()}
                      </span>
                    </div>
                    <Link
                      to="/reviewer/invitations/$id"
                      params={{ id: inv.id }}
                      className="block font-serif text-lg leading-snug hover:text-primary"
                    >
                      {inv.title}
                    </Link>
                    <p className="line-clamp-2 max-w-prose text-sm text-muted-foreground">{inv.abstract}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button asChild size="sm">
                      <Link to="/reviewer/invitations/$id" params={{ id: inv.id }}>
                        Respond
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-serif text-xl">Active reviews</h2>
        <div className="grid gap-3">
          {active.map((a) => {
            const d = daysUntil(a.dueAt);
            const overdue = a.status === "overdue" || d < 0;
            return (
              <Card key={a.id}>
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">Round {a.round}</span>
                      <span className="rounded-full bg-secondary px-2 py-0.5">
                        {ANONYMITY_META[a.anonymity].label}
                      </span>
                      <span className={overdue ? "text-red-600 font-medium" : "text-muted-foreground"}>
                        Due {new Date(a.dueAt).toLocaleDateString()} ({overdue ? `${Math.abs(d)}d overdue` : `${d}d left`})
                      </span>
                    </div>
                    <Link
                      to="/reviewer/assignments/$id"
                      params={{ id: a.id }}
                      className="block font-serif text-lg leading-snug hover:text-primary"
                    >
                      {a.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{a.authorsLabel}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                    <Button asChild size="sm">
                      <Link to="/reviewer/assignments/$id" params={{ id: a.id }}>
                        Open review
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toast.success("Added to calendar (iCal)");
                      }}
                    >
                      <Calendar className="mr-1.5 h-3.5 w-3.5" /> Add to calendar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

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

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: string;
}) {
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
