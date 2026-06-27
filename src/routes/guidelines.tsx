import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const Route = createFileRoute("/guidelines")({
  head: () => ({
    meta: [
      { title: "Author guidelines — Ghana Journal of Forestry" },
      { name: "description", content: "Detailed submission guidelines, formatting, structure and reference style for authors of the Ghana Journal of Forestry." },
      { property: "og:title", content: "Author guidelines — Ghana Journal of Forestry" },
      { property: "og:description", content: "Submission guidelines for the Ghana Journal of Forestry." },
    ],
  }),
  component: Guidelines,
});

const ITEMS: { h: string; b: string }[] = [
  { h: "1. Title page", b: "A separate title page must include the full title, all authors, and their affiliations. All articles must use continuous line numbering." },
  { h: "2. Abstract & keywords", b: "Abstract on a separate page, not exceeding 250 words, followed by up to five keywords." },
  { h: "3. Paper structure", b: "Manuscripts should be structured as Introduction, Materials and Methods, Results, and Discussion." },
  { h: "4. Language & layout", b: "Submissions must be in English, double-spaced, on A4 paper with 30 mm borders on all sides." },
  { h: "5. Tables & figures", b: "Tables and figures should be prepared in Microsoft Excel, numbered consecutively, with concise headings." },
  { h: "6. Drawings", b: "Drawings must be fully lettered and sized so they remain legible after reduction for print." },
  { h: "7. Photographs", b: "Supply high-quality photographs on separate pages, numbered, titled, and referenced in the text." },
  { h: "8. References", b: "Cite references in the text and list them at the end in alphabetical order, following the journal's standard format." },
  { h: "9. Electronic version", b: "Final accepted articles must be supplied as Microsoft Word 2007 (.docx) files." },
  { h: "10. Line spacing", b: "Use single spacing within the body text and double spacing between paragraphs." },
  { h: "11. Reprints", b: "Five free reprints are supplied to the corresponding author of each published paper." },
  { h: "12. Upload format", b: "Files uploaded during submission must be in Word (.doc, .docx) or PDF format." },
];

function Guidelines() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">For authors</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-foreground">Submission guidelines</h1>
        <p className="mt-4 text-muted-foreground">
          Please follow these guidelines carefully. Manuscripts that do not meet the minimum formatting requirements will be returned to the author before peer review begins.
        </p>
        <ol className="mt-10 space-y-6">
          {ITEMS.map(it => (
            <li key={it.h} className="rounded-lg border border-border bg-card p-5 shadow-card">
              <h2 className="font-serif text-lg font-semibold text-foreground">{it.h}</h2>
              <p className="mt-1.5 text-sm text-foreground/85">{it.b}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
          <h3 className="font-serif text-xl font-semibold text-foreground">Ready to submit?</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create an account or sign in to start your submission.</p>
          <Link to="/submit" className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Submit a manuscript
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
