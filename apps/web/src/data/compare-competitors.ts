export type CompareCompetitor = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
};

/** Scaffold list — expand with full comparison tables + FAQs over time. */
export const COMPARE_COMPETITORS: readonly CompareCompetitor[] = [
  {
    slug: "wordpress",
    name: "WordPress",
    tagline: "Plugin patchwork vs a purpose-built site",
    summary:
      "WordPress can work — until themes, builders, and plugins pile on load time and security patches. ANTHONY. ships lean, fast sites with built-in SEO and lead routing from day one.",
  },
  {
    slug: "wix",
    name: "Wix",
    tagline: "Template limits vs a custom build",
    summary:
      "Wix makes it fast to publish, not fast to load — and every site looks like the next. We build one-of-a-kind sites tuned for speed, local search, and real lead conversion.",
  },
  {
    slug: "squarespace",
    name: "Squarespace",
    tagline: "Easy editor vs full SEO control",
    summary:
      "Squarespace keeps layouts simple but limits your SEO depth and integrations. ANTHONY. gives you structured data, programmatic landing pages, and tools that grow with your business.",
  },
  {
    slug: "webflow",
    name: "Webflow",
    tagline: "Visual builder vs a complete growth system",
    summary:
      "Webflow is great for visual design; ANTHONY. goes further — fast hosting, a built-in CRM, automated workflows, and a growth plan that ties your site to real results.",
  },
] as const;

export function getCompareCompetitor(slug: string): CompareCompetitor | undefined {
  return COMPARE_COMPETITORS.find((c) => c.slug === slug);
}
