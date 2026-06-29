import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ArrowRight, BookOpen, FileText, Users, Send, Download } from "lucide-react";
import type { Article } from "@/lib/mock-articles";
import { useWorkflow } from "@/lib/workflow-store";
import { toast } from "sonner";

function downloadArticle(a: Article) {
  const content = `Ghana Journal of Forestry\nDOI: ${a.doi}\n\n${a.title}\n${a.authors.join(", ")}\nVol ${a.volume}, No ${a.issue} · pp ${a.pages} · ${new Date(a.publishedAt).toDateString()}\n\nAbstract\n${a.abstract}\n\nKeywords: ${a.keywords.join(", ")}\n`;
  const blob = new Blob([content], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${a.id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast.success("Download started", { description: a.title });
}
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { articles } from "@/lib/mock-articles";
import heroImg from "@/assets/forest-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ghana Journal of Forestry — Peer-reviewed research from West Africa" },
      { name: "description", content: "Browse peer-reviewed research on tropical forestry, ecology, conservation and silviculture across Ghana and West Africa." },
      { property: "og:title", content: "Ghana Journal of Forestry" },
      { property: "og:description", content: "Peer-reviewed research on the forests, ecology and people of West Africa." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LibraryHome,
});

function LibraryHome() {
  const [q, setQ] = useState("");
  const [activeKw, setActiveKw] = useState<string | null>(null);
  const workflowList = useWorkflow();

  const allArticles = useMemo<Article[]>(() => {
    const published: Article[] = workflowList
      .filter((m) => m.status === "published")
      .map((m) => ({
        id: m.id,
        title: m.title,
        authors: [m.authorName],
        abstract: m.abstract,
        keywords: m.keywords,
        doi: `10.0000/gjf.${m.id}`,
        section: "Research",
        volume: new Date(m.updatedAt).getFullYear() - 1984,
        issue: 1,
        pages: "1-12",
        publishedAt: m.updatedAt,
      }));
    return [...published, ...articles];
  }, [workflowList]);

  const allKeywords = useMemo(() => {
    const s = new Set<string>();
    allArticles.forEach(a => a.keywords.forEach(k => s.add(k)));
    return Array.from(s).slice(0, 20);
  }, [allArticles]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return allArticles.filter(a => {
      const matchTerm = !term
        || a.title.toLowerCase().includes(term)
        || a.abstract.toLowerCase().includes(term)
        || a.keywords.some(k => k.toLowerCase().includes(term))
        || a.authors.some(au => au.toLowerCase().includes(term));
      const matchKw = !activeKw || a.keywords.includes(activeKw);
      return matchTerm && matchKw;
    });
  }, [q, activeKw, allArticles]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" width={1920} height={1080} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/65 to-background" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Open peer review · since 1984
            </span>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-primary-foreground text-balance sm:text-5xl lg:text-6xl">
              Ghana Journal <span className="italic text-gold">of Forestry</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-primary-foreground/85 sm:text-lg">
              A peer-reviewed home for original research on tropical forestry, ecology, silviculture and forest livelihoods across Ghana and West Africa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
                <Link to="/submit"><Send className="mr-2 h-4 w-4" /> Submit your manuscript</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <a href="#library"><BookOpen className="mr-2 h-4 w-4" /> Browse the library</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* LIBRARY */}
      <section id="library" className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-foreground">The library</h2>
            <p className="mt-2 text-muted-foreground">Search published research by title, keyword or author.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/guidelines" className="text-sm font-medium text-primary hover:underline">Author guidelines →</Link>
            <Button asChild size="sm"><Link to="/author/submit"><Send className="mr-1.5 h-3.5 w-3.5" /> Submit manuscript</Link></Button>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles, abstracts, keywords or authors…"
              className="h-12 pl-10 text-base"
            />
          </div>
          {allKeywords.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveKw(null)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${!activeKw ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}
              >All</button>
              {allKeywords.map(k => (
                <button key={k} onClick={() => setActiveKw(k === activeKw ? null : k)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${activeKw === k ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}
                >{k}</button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/60" />
              <h3 className="mt-3 font-serif text-lg text-foreground">No articles match your search</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try a different keyword or clear your filters.</p>
            </div>
          )}
          {filtered.map(a => (
            <article key={a.id} className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{new Date(a.publishedAt).getFullYear()}</span>
                <span>· Vol {a.volume}, No {a.issue}</span>
                <span>· {a.section}</span>
              </div>
              <h3 className="mt-3 font-serif text-lg font-semibold leading-snug text-foreground group-hover:text-primary">{a.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{a.authors.join(", ")}</p>
              <p className="mt-3 line-clamp-3 text-sm text-foreground/80">{a.abstract}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {a.keywords.slice(0, 4).map(k => (
                  <Badge key={k} variant="secondary" className="font-normal">{k}</Badge>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                <Button size="sm" variant="outline" onClick={() => downloadArticle(a)}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
                </Button>
                <span className="text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100">
                  Read <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section className="border-t border-border/60 bg-secondary/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
          <Feature icon={FileText} title="Rigorous peer review" body="Every submission is triaged by the editorial secretary and assigned to subject reviewers with tracked feedback." />
          <Feature icon={Users} title="Author-centred workflow" body="Track your manuscript through every stage, respond to reviewers, and approve the galley before publication." />
          <Feature icon={BookOpen} title="Open library" body="All published articles are openly accessible to readers, scholars and policy-makers around the world." />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Feature({ icon: Icon, title, body }: { icon: typeof FileText; title: string; body: string }) {
  return (
    <div>
      <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
