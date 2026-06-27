export type Article = {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  keywords: string[];
  volume: number;
  issue: number;
  pages: string;
  publishedAt: string;
  doi: string;
  section: "Research" | "Review" | "Short communication" | "Editorial";
};

export const articles: Article[] = [
  {
    id: "gjf-2026-014",
    title: "Carbon stock dynamics of secondary forests in the Atewa Range",
    authors: ["Yaa Asantewaa", "Kwesi Boateng", "Linda Mensah"],
    abstract:
      "Long-term monitoring of regenerating moist semi-deciduous stands shows aboveground carbon accumulation of 3.4 Mg C ha⁻¹ yr⁻¹, with strong dependence on canopy openness and seed-source proximity.",
    keywords: ["carbon", "secondary forest", "Atewa", "regeneration"],
    volume: 12,
    issue: 2,
    pages: "101–118",
    publishedAt: "2026-06-02",
    doi: "10.55915/gjf.2026.014",
    section: "Research",
  },
  {
    id: "gjf-2026-013",
    title: "Smallholder cocoa agroforestry and shade-tree diversity in the Western Region",
    authors: ["Nana Owusu", "Esi Quarshie"],
    abstract:
      "A survey of 184 farms across three districts identifies 47 shade species; species richness correlates positively with on-farm yield stability under the 2023–2024 drought.",
    keywords: ["agroforestry", "cocoa", "shade trees", "resilience"],
    volume: 12,
    issue: 2,
    pages: "119–136",
    publishedAt: "2026-05-20",
    doi: "10.55915/gjf.2026.013",
    section: "Research",
  },
  {
    id: "gjf-2026-012",
    title: "Remote sensing of mangrove loss in the Volta estuary, 2015–2024",
    authors: ["Kojo Addai", "Patience Nyarko", "Samuel Ofori"],
    abstract:
      "Sentinel-2 time-series analysis estimates a 21% net loss of mangrove canopy over the decade, concentrated near aquaculture expansion zones.",
    keywords: ["mangroves", "remote sensing", "Volta", "land cover"],
    volume: 12,
    issue: 1,
    pages: "44–62",
    publishedAt: "2026-03-11",
    doi: "10.55915/gjf.2026.012",
    section: "Research",
  },
  {
    id: "gjf-2025-011",
    title: "Policy review: Implementing Ghana's REDD+ strategy at the landscape scale",
    authors: ["Akua Frimpong"],
    abstract:
      "A critical appraisal of benefit-sharing arrangements and tenure clarity across four pilot HIAs, with recommendations for the 2026–2030 implementation cycle.",
    keywords: ["REDD+", "policy", "tenure", "benefit sharing"],
    volume: 11,
    issue: 4,
    pages: "311–330",
    publishedAt: "2025-12-15",
    doi: "10.55915/gjf.2025.011",
    section: "Review",
  },
  {
    id: "gjf-2025-010",
    title: "First record of Talbotiella gentii regeneration outside protected areas",
    authors: ["Daniel Tetteh", "Mavis Antwi"],
    abstract:
      "Field surveys in the Densu basin document natural recruitment of the IUCN-Endangered legume on community lands, suggesting opportunities for assisted natural regeneration.",
    keywords: ["endangered species", "regeneration", "Talbotiella"],
    volume: 11,
    issue: 4,
    pages: "298–306",
    publishedAt: "2025-11-04",
    doi: "10.55915/gjf.2025.010",
    section: "Short communication",
  },
  {
    id: "gjf-2025-009",
    title: "Charcoal value chains and forest degradation in the Transition Zone",
    authors: ["Ibrahim Mohammed", "Gifty Aboagye"],
    abstract:
      "Household-level data from Kintampo and Atebubu link kiln efficiency, market access, and degradation hotspots, identifying leverage points for low-emission alternatives.",
    keywords: ["charcoal", "degradation", "livelihoods"],
    volume: 11,
    issue: 3,
    pages: "201–222",
    publishedAt: "2025-09-22",
    doi: "10.55915/gjf.2025.009",
    section: "Research",
  },
];
