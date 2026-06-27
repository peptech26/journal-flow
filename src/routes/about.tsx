import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Ghana Journal of Forestry" },
      { name: "description", content: "About the Ghana Journal of Forestry — mission, editorial board and peer-review process." },
      { property: "og:title", content: "About — Ghana Journal of Forestry" },
      { property: "og:description", content: "About the Ghana Journal of Forestry." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">About</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-foreground">About the journal</h1>
        <div className="prose prose-neutral mt-6 max-w-none text-foreground/85">
          <p>The Ghana Journal of Forestry publishes original peer-reviewed research on the forests, ecology, silviculture and livelihoods of West Africa. The journal serves scholars, practitioners and policy-makers committed to the stewardship of tropical forest ecosystems.</p>
          <h2 className="mt-8 font-serif text-2xl font-semibold text-foreground">Editorial process</h2>
          <p>Every submission is triaged by the editorial secretary, assigned to subject reviewers, revised in dialogue with the authors, and finally galley-proofed by the Editor-in-Chief before publication.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
