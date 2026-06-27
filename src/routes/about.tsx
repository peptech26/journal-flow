import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Ghana Journal of Forestry" },
      {
        name: "description",
        content:
          "About the Ghana Journal of Forestry: aims, scope, editorial process, and open-access policy.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-16">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">About</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight">A journal for West African forests</h1>
        <div className="prose mt-8 space-y-5 text-base leading-relaxed text-foreground/85">
          <p>
            The Ghana Journal of Forestry (GJF) is a peer-reviewed, open-access journal publishing
            original research, reviews, and short communications on the structure, function, and
            management of forest ecosystems across West Africa.
          </p>
          <p>
            We welcome submissions in forest ecology, silviculture, biodiversity conservation,
            agroforestry, forest policy and economics, remote sensing of land cover, and the
            socio-ecology of forest-dependent communities.
          </p>
          <h2 className="font-serif text-2xl tracking-tight">Editorial process</h2>
          <p>
            Every manuscript is screened by the editorial secretary, assigned to a subject editor,
            and double-blind reviewed by at least two external reviewers. The Editor-in-Chief
            approves all galley proofs prior to publication. A full timeline of decisions is
            recorded for each submission.
          </p>
          <h2 className="font-serif text-2xl tracking-tight">Open access</h2>
          <p>
            All content is published under a Creative Commons Attribution 4.0 licence (CC BY 4.0).
            There are currently no article-processing charges for authors based in West Africa.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
