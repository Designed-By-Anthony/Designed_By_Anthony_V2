import { z } from "zod";

/** URL-safe slugs for programmatic infrastructure landing pages (315 / Upstate NY focus). */
export const PROGRAMMATIC_CITY_SLUGS = [
  "utica",
  "rome-ny",
  "syracuse",
  "albany",
  "buffalo",
  "rochester",
  "watertown",
  "schenectady",
  "troy",
  "plattsburgh",
  "glens-falls",
  "amsterdam",
  "new-hartford",
  "clinton-ny",
  "herkimer",
  "oneida",
] as const;

export const PROGRAMMATIC_INDUSTRY_SLUGS = [
  "manufacturing",
  "home-services",
  "hvac",
  "plumbing",
  "electrical",
  "legal",
  "healthcare",
  "retail",
  "hospitality",
  "construction",
  "professional-services",
  "medspa",
  "automotive",
  "roofing",
  "landscaping",
] as const;

export type ProgrammaticCitySlug = (typeof PROGRAMMATIC_CITY_SLUGS)[number];
export type ProgrammaticIndustrySlug = (typeof PROGRAMMATIC_INDUSTRY_SLUGS)[number];

const CITY_LABELS: Record<ProgrammaticCitySlug, string> = {
  utica: "Utica",
  "rome-ny": "Rome",
  syracuse: "Syracuse",
  albany: "Albany",
  buffalo: "Buffalo",
  rochester: "Rochester",
  watertown: "Watertown",
  schenectady: "Schenectady",
  troy: "Troy",
  plattsburgh: "Plattsburgh",
  "glens-falls": "Glens Falls",
  amsterdam: "Amsterdam",
  "new-hartford": "New Hartford",
  "clinton-ny": "Clinton",
  herkimer: "Herkimer",
  oneida: "Oneida",
};

const INDUSTRY_LABELS: Record<ProgrammaticIndustrySlug, string> = {
  manufacturing: "Manufacturing",
  "home-services": "Home Services",
  hvac: "HVAC",
  plumbing: "Plumbing",
  electrical: "Electrical",
  legal: "Legal",
  healthcare: "Healthcare",
  retail: "Retail",
  hospitality: "Hospitality",
  construction: "Construction",
  "professional-services": "Professional Services",
  medspa: "Medspa & Aesthetics",
  automotive: "Automotive",
  roofing: "Roofing",
  landscaping: "Landscaping",
};

export const programmaticSlugParamsSchema = z.object({
  city: z.enum(PROGRAMMATIC_CITY_SLUGS),
  industry: z.enum(PROGRAMMATIC_INDUSTRY_SLUGS),
});

export type InfrastructurePagePayload = {
  citySlug: ProgrammaticCitySlug;
  cityLabel: string;
  industrySlug: ProgrammaticIndustrySlug;
  industryLabel: string;
  title: string;
  description: string;
  h1: string;
  lead: string;
  canonicalPath: string;
};

export function buildInfrastructurePayload(
  citySlug: ProgrammaticCitySlug,
  industrySlug: ProgrammaticIndustrySlug
): InfrastructurePagePayload {
  const cityLabel = CITY_LABELS[citySlug];
  const industryLabel = INDUSTRY_LABELS[industrySlug];
  const canonicalPath = `/infrastructure/${citySlug}/${industrySlug}`;
  const h1 = `Custom websites for ${industryLabel.toLowerCase()} businesses in ${cityLabel}`;
  const title = `${industryLabel} Web Design in ${cityLabel} | ANTHONY.`;
  const description = `Fast, mobile-friendly websites and local SEO for ${industryLabel.toLowerCase()} businesses in ${cityLabel}. Built by ANTHONY. — a web design studio in Central New York.`;
  const lead = `When customers in ${cityLabel} search for ${industryLabel.toLowerCase()}, your website needs to show up, load fast, and make it easy to contact you. We build clean, mobile-friendly websites designed to rank on Google and turn visitors into phone calls.`;

  return {
    citySlug,
    cityLabel,
    industrySlug,
    industryLabel,
    title,
    description,
    h1,
    lead,
    canonicalPath,
  };
}

export function parseInfrastructureParams(raw: {
  city?: string;
  industry?: string;
}): InfrastructurePagePayload | null {
  const parsed = programmaticSlugParamsSchema.safeParse(raw);
  if (!parsed.success) return null;
  return buildInfrastructurePayload(parsed.data.city, parsed.data.industry);
}

export function listAllInfrastructurePaths(): {
  city: ProgrammaticCitySlug;
  industry: ProgrammaticIndustrySlug;
}[] {
  const out: {
    city: ProgrammaticCitySlug;
    industry: ProgrammaticIndustrySlug;
  }[] = [];
  for (const city of PROGRAMMATIC_CITY_SLUGS) {
    for (const industry of PROGRAMMATIC_INDUSTRY_SLUGS) {
      out.push({ city, industry });
    }
  }
  return out;
}
