import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, FileUp, ClipboardList, Send } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit a manuscript — Ghana Journal of Forestry" },
      { name: "description", content: "Sign in or create an author account to submit a manuscript to the Ghana Journal of Forestry." },
    ],
  }),
  component: Submit,
});

const steps = [
  { icon: ClipboardList, title: "Prepare your manuscript", body: "Format according to the author guidelines: blinded PDF, references in the journal's standard style, and a cover letter." },
  { icon: FileUp, title: "Upload files", body: "Submit your manuscript file, optional supplementary material, and suggest up to three reviewers." },
  { icon: Send, title: "Track progress", body: "Receive decisions and reviewer comments through your dashboard. Full audit timeline for every submission." },
];

function Submit() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">For authors</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-foreground">Submit a manuscript</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          You'll need an author account to upload your manuscript. Sign in if you already have one, or create an account in under a minute.
        </p>

        <div className="mt-10 rounded-2xl border border-border bg-card p-8 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary">
              <Lock className="h-5 w-5 text-secondary-foreground" />
            </span>
            <div>
              <h2 className="font-serif text-xl font-semibold">Sign in to continue</h2>
              <p className="text-sm text-muted-foreground">Authors and reviewers can register themselves.</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/auth">Sign in</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/auth">Create an account</Link></Button>
            <Button asChild size="lg" variant="ghost"><Link to="/guidelines">Read guidelines</Link></Button>
          </div>
        </div>

        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="rounded-2xl border border-border bg-background p-6">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-primary" />
                <span className="font-serif text-2xl text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </div>
  );
}
