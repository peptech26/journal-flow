import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";

const editorialCommittee = [
  { name: "Dr. (Mrs.) Lucy Amissah", role: "Editor-in-Chief" },
  { name: "Prof. Stephen Adu-Bredu", role: "Editor" },
  { name: "Dr. (Mrs.) Margaret Sraku-Lartey", role: "Editor" },
  { name: "Dr. (Mrs.) Elizabeth Obeng", role: "Editor" },
  { name: "Dr. Shalom D. Addo-Danso", role: "Editor" },
  { name: "Mr. Francis Wilson I Owusu", role: "Editor" },
  { name: "Ms. Martina Elizabeth Nikoi", role: "Editorial Secretary" },
  { name: "Mr. Emmanuel Sarpong", role: "Assistant Editorial Secretary" },
];

const advisoryBoard = [
  "Dr. M. D. Swaine (Honorary Lecturer in Botany, School of Biological Sciences, University of Aberdeen, Scotland)",
  "Dr. N. A. Darkwa (P. O. Box 1060 K. N. U. S. T., Kumasi, Ghana)",
  "Dr. Ouddara Souvannavong (FAO African Forestry Project, Via delle Terme di Caracalla 001000, Rome, Italy)",
  "Prof. Ivan Eastin (Director, CINTRAFOR, University of Washington, Seattle, Washington, U. S. A.)",
  "Prof. Kwabena Tuffour (P. O. Box 180 Achimota, Accra, Ghana)",
  "Prof. Michael Wagner (Northern Arizona University, School of Forestry, Flagstaff, Arizona, U. S. A.)",
  "Mr. J. G. K. Owusu (Forest Consultant, Kumasi, Ghana)",
  "Prof. Oteng-Yeboah (Accra, Ghana)",
  "Prof. Jeff Morrel (Oregon State University, Dept. of Forest Products, Corvallis, Oregon 97331-5704, U. S. A.)",
  "Prof. Yoshihiko Hirashima (Graduate School of Bio-Agricultural Sciences, Nagoya University, Furo-cho Chikusaku, Nagoya 464-8601, Japan)",
];

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
