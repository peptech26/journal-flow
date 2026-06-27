import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, FileText, MessageSquare, Clock, Mail, Shield, Upload, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/author/status-badge";
import { getManuscript, type Manuscript } from "@/lib/mock-manuscripts";

export const Route = createFileRoute("/author/manuscripts/$id")({
  loader: ({ params }): Manuscript => {
    const m = getManuscript(params.id);
    if (!m) throw notFound();
    return m;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.title ?? "Manuscript"} — Ghana Journal of Forestry` }],
  }),
  notFoundComponent: () => (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <h2 className="font-serif text-xl">Manuscript not found</h2>
      <Button asChild className="mt-4"><Link to="/author">Back to dashboard</Link></Button>
    </div>
  ),
  errorComponent: ({ error }) => <p className="text-destructive">{error.message}</p>,
  component: ManuscriptDetail,
});

function ManuscriptDetail() {
  const m = Route.useLoaderData();

  return (
    <div>
      <Link to="/author" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{m.id}</span>
            <StatusBadge status={m.status} />
          </div>
          <h1 className="mt-2 font-serif text-3xl font-semibold">{m.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{m.abstract}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/author/manuscripts/$id/ethics" params={{ id: m.id }}><Shield className="mr-1.5 h-4 w-4" /> Ethics</Link></Button>
          <Button asChild><Link to="/author/manuscripts/$id/revise" params={{ id: m.id }}><Upload className="mr-1.5 h-4 w-4" /> Upload revision</Link></Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat icon={Clock} label="Submitted" value={new Date(m.submittedAt).toLocaleDateString()} />
        <Stat icon={Clock} label="Last update" value={new Date(m.lastUpdatedAt).toLocaleDateString()} />
        <Stat icon={Clock} label="Decision ETA" value={m.estimatedDecisionAt ? new Date(m.estimatedDecisionAt).toLocaleDateString() : "—"} />
      </div>

      <Tabs defaultValue="timeline" className="mt-8">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="correspondence">Correspondence</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <ol className="relative space-y-5 border-l border-border pl-6">
            {m.timeline.map((e) => (
              <li key={e.id}>
                <span className="absolute -left-2 mt-1.5 grid h-4 w-4 place-items-center rounded-full bg-primary text-primary-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                </span>
                <p className="text-xs text-muted-foreground">{new Date(e.at).toLocaleString()}</p>
                <p className="font-medium">{e.title}</p>
                {e.actor && <p className="text-xs text-muted-foreground">by {e.actor}</p>}
                {e.body && <p className="mt-1 text-sm">{e.body}</p>}
              </li>
            ))}
          </ol>
        </TabsContent>

        <TabsContent value="reviews">
          {m.reviews.length === 0 ? (
            <Empty icon={MessageSquare} text="No reviewer comments yet." />
          ) : (
            <div className="space-y-3">
              {m.reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">{r.reviewer}</p>
                  <p className="mt-2 text-sm">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="versions">
          {m.versions.length === 0 ? (
            <Empty icon={History} text="No versions uploaded yet." />
          ) : (
            <div className="space-y-2">
              {m.versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{v.label}</p>
                      <p className="text-xs text-muted-foreground">{v.filename} · {new Date(v.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="correspondence">
          <div className="space-y-3">
            {m.timeline.filter((t) => t.type === "email" || t.type === "decision").map((e) => (
              <div key={e.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {new Date(e.at).toLocaleString()}
                </div>
                <p className="mt-1 font-medium">{e.title}</p>
                {e.actor && <p className="text-xs text-muted-foreground">{e.actor}</p>}
              </div>
            ))}
            {!m.timeline.some((t) => t.type === "email" || t.type === "decision") && <Empty icon={Mail} text="No correspondence yet." />}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}
function Empty({ icon: Icon, text }: { icon: typeof Clock; text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/60 p-10 text-center">
      <Icon className="mx-auto h-8 w-8 text-muted-foreground/60" />
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
