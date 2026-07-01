import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FileText, Plus, Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ManuscriptQueue } from "@/components/workflow/manuscript-queue";
import { ensureRole, getCurrentUser } from "@/lib/current-user";
import { useWorkflow, STATUS_LABEL, STATUS_TONE, type WorkflowStatus } from "@/lib/workflow-store";

export const Route = createFileRoute("/author/")({
  head: () => ({ meta: [{ title: "Author dashboard — Ghana Journal of Forestry" }] }),
  component: AuthorDashboard,
});

const FILTERS: (WorkflowStatus | "all")[] = [
  "all",
  "submitted",
  "under_review",
  "revision_requested",
  "with_eic",
  "approved_for_publication",
  "published",
  "rejected_by_secretary",
];

function AuthorDashboard() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<WorkflowStatus | "all">("all");
  useEffect(() => { ensureRole("author"); }, []);
  const me = getCurrentUser();
  const all = useWorkflow();

  const list = useMemo(() => {
    return all
      .filter((m) => m.authorId === me.id)
      .filter((m) => {
        const matchTerm = !q || m.title.toLowerCase().includes(q.toLowerCase());
        const matchFilter = filter === "all" || m.status === filter;
        return matchTerm && matchFilter;
      });
  }, [q, filter, all, me.id]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Author dashboard</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-foreground">My manuscripts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track every submission, decision, and revision in one place.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/author/profile">My profile</Link></Button>
          <Button asChild><Link to="/author/submit"><Plus className="mr-1.5 h-4 w-4" /> New submission</Link></Button>
        </div>
      </div>

      <div className="mt-8">
        <ManuscriptQueue role="author" currentUserId={me.id} />
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title…" className="pl-9" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}
            >
              {f === "all" ? "All" : STATUS_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {list.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card/60 p-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground/60" />
            <h3 className="mt-3 font-serif text-lg">No manuscripts yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Start your first submission to see it here.</p>
            <Button asChild className="mt-4"><Link to="/author/submit">Start a submission</Link></Button>
          </div>
        )}
        {list.map((m) => (
          <Link
            key={m.id}
            to="/author/manuscripts/$id"
            params={{ id: m.id }}
            className="group block rounded-xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{m.id.slice(0, 8)}</span>
                  <Badge variant="outline" className={`${STATUS_TONE[m.status]} border-transparent font-normal`}>{STATUS_LABEL[m.status]}</Badge>
                </div>
                <h3 className="mt-2 font-serif text-lg font-semibold text-foreground group-hover:text-primary">{m.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{m.abstract}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span>Submitted {new Date(m.createdAt).toLocaleDateString()}</span>
              <span>Last update {new Date(m.updatedAt).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
