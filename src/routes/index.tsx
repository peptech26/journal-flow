import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, BookOpen, FileText, Users2, ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { articles } from "@/lib/mock-articles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ghana Journal of Forestry — Peer-reviewed forestry research" },
      {
        name: "description",
        content:
          "Open-access, peer-reviewed research on forests, biodiversity, and sustainable land use in Ghana and West Africa.",
      },
      { property: "og:title", content: "Ghana Journal of Forestry" },
      {
        property: "og:description",
        content: "Open-access, peer-reviewed forestry research from Ghana and West Africa.",
      },
    ],
  }),
  component: Library,
});

const sections = ["All", "Research", "Review", "Short communication", "Editorial"] as const;

function Library() {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<(typeof sections)[number]>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (section !== "All" && a.section !== section) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.authors.some((x) => x.toLowerCase().includes(q)) ||
        a.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [query, section]);

  const latest = articles[0];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.4fr_1fr] md:py-24">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Volume 12 · Issue 2 · 2026
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
              Forestry research<br />
              <span className="italic text-primary">for a greener Ghana.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              An open-access, peer-reviewed journal publishing original research on forest
              ecosystems, biodiversity, agroforestry, and sustainable land use across West
              Africa.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/submit">
                  Submit a manuscript <ArrowRight className="ml-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#current-issue">Browse current issue</a>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-6">
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Issues / yr</dt>
                <dd className="mt-1 font-serif text-2xl">4</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Open access</dt>
                <dd className="mt-1 font-serif text-2xl">100%</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Articles</dt>
                <dd className="mt-1 font-serif text-2xl">240+</dd>
              </div>
            </dl>
          </div>

          {/* Featured card */}
          <Link
            to="/"
            className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div>
              <Badge variant="secondary" className="font-normal">Featured · {latest.section}</Badge>
              <h2 className="mt-4 font-serif text-2xl leading-snug tracking-tight">
                {latest.title}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-4">
                {latest.abstract}
              </p>
            </div>
            <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">{latest.authors.join(", ")}</p>
              <p className="mt-1">
                Vol. {latest.volume}({latest.issue}), pp. {latest.pages} · DOI {latest.doi}
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Search & filter */}
      <section id="current-issue" className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-serif text-3xl tracking-tight">Library</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse published articles. All content is free to read and download.
              </p>
            </div>
            <div className="relative md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, author, keyword…"
                className="pl-9"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  section === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <ul className="mt-8 divide-y divide-border border-y border-border">
            {filtered.map((a) => (
              <li key={a.id} className="group py-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                    {a.section}
                  </span>
                  <span>
                    Vol. {a.volume}({a.issue}) · {a.pages}
                  </span>
                  <span>·</span>
                  <time>{new Date(a.publishedAt).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</time>
                </div>
                <h3 className="mt-2 font-serif text-xl leading-snug tracking-tight group-hover:text-primary">
                  {a.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-foreground/80">{a.authors.join(", ")}</p>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{a.abstract}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {a.keywords.map((k) => (
                    <span key={k} className="text-xs text-muted-foreground">#{k}</span>
                  ))}
                </div>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="py-12 text-center text-sm text-muted-foreground">
                No articles match your search.
              </li>
            )}
          </ul>
        </div>
      </section>

      {/* For authors / reviewers */}
      <section className="bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
          {[
            { icon: FileText, title: "Authors", body: "Submit original research through our editorial system. Average first decision in 6 weeks.", cta: "Submit manuscript", to: "/submit" as const },
            { icon: Users2, title: "Reviewers", body: "Join our reviewer pool. Upload your CV and indicate your areas of expertise.", cta: "Register as reviewer", to: "/auth" as const },
            { icon: BookOpen, title: "Readers", body: "All articles are open access under CC BY 4.0. Subscribe to receive new issues.", cta: "Browse library", to: "/" as const },
          ].map(({ icon: Icon, title, body, cta, to }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-serif text-xl">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              <Button asChild variant="link" className="mt-3 h-auto p-0 text-primary">
                <Link to={to}>{cta} →</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
