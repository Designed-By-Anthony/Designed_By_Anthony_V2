import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LighthouseAuditForm } from "@/components/marketing/LighthouseAuditForm";
import { MarketingChrome } from "@/components/marketing/MarketingChrome";
import { homeFooterCta } from "@/data/home";
import { btnOutline, btnPrimary } from "@/design-system/buttons";
import { listAllInfrastructurePaths, parseInfrastructureParams } from "@/lib/programmaticSeo";

const SovereignServicesCarousel = dynamic(() =>
  import("@/components/marketing/SovereignServicesCarousel").then(
    (mod) => mod.SovereignServicesCarousel
  )
);

export const revalidate = 86400;

export function generateStaticParams(): {
  city: string;
  industry: string;
}[] {
  return listAllInfrastructurePaths().map(({ city, industry }) => ({
    city,
    industry,
  }));
}

function getHeroVariant(
  citySlug: string,
  industrySlug: string,
  cityLabel: string,
  industryLabel: string
) {
  const variants = [
    `Fast, mobile-friendly websites for ${industryLabel.toLowerCase()} businesses in ${cityLabel}. Built to rank on Google and turn visitors into customers.`,
    `${industryLabel} websites in ${cityLabel} that load fast, look professional, and make it easy for customers to call you.`,
    `When ${cityLabel} customers search for ${industryLabel.toLowerCase()}, your website needs to show up first and make a great impression.`,
    `Custom websites for ${industryLabel.toLowerCase()} companies in ${cityLabel} — designed to get found on Google and bring in more business.`,
  ];
  const seed = `${citySlug}:${industrySlug}`;
  const index =
    Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % variants.length;
  return variants[index];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; industry: string }>;
}): Promise<Metadata> {
  const { city, industry } = await params;
  const payload = parseInfrastructureParams({ city, industry });
  if (!payload) return { title: "Not found" };

  return {
    title: payload.title,
    description: payload.description,
    alternates: { canonical: payload.canonicalPath },
    openGraph: {
      title: payload.title,
      description: payload.description,
      url: `https://designedbyanthony.com${payload.canonicalPath}`,
      type: "website",
    },
  };
}

export default async function InfrastructureProgrammaticPage({
  params,
}: {
  params: Promise<{ city: string; industry: string }>;
}) {
  const { city, industry } = await params;
  const payload = parseInfrastructureParams({ city, industry });
  if (!payload) notFound();

  const heroVariant = getHeroVariant(
    payload.citySlug,
    payload.industrySlug,
    payload.cityLabel,
    payload.industryLabel
  );

  return (
    <MarketingChrome footerCta={homeFooterCta}>
      <section className="section-shell section-shell--wash marketing-page-hero">
        <div className="section-container grid min-h-[85vh] gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[0.72rem] font-[family-name:var(--font-inter)] uppercase tracking-[0.22em] text-[rgb(var(--accent-bronze-rgb))] mb-4">
              315 · {payload.cityLabel} · {payload.industryLabel}
            </p>
            <h1 className="page-title max-w-[42rem]">
              {payload.industryLabel} web design in {payload.cityLabel}.
            </h1>
            <p className="page-lead max-w-[42rem] mt-5">{heroVariant}</p>
            <p className="mt-8 max-w-[40rem] text-[1rem] leading-8 text-slate-300">
              {payload.lead}
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link href="/contact" className={btnPrimary}>
                Get a free website review
              </Link>
              <Link href="/lighthouse" className={btnOutline}>
                Test my site speed
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-[rgba(6,10,18,0.95)] p-7 shadow-[0_32px_70px_-30px_rgba(0,0,0,0.8)]">
            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[rgb(var(--accent-bronze-rgb))] mb-3">
              Free website review
            </p>
            <h2 className="text-3xl font-semibold leading-[1.05] text-brand-charcoal">
              See how your website stacks up in {payload.cityLabel}.
            </h2>
            <p className="mt-4 text-[0.98rem] leading-7 text-slate-300">
              Get a free report on your website's speed, SEO, and mobile friendliness. Takes less
              than a minute.
            </p>
            <div className="mt-8">
              <LighthouseAuditForm
                sourceId={`pseo-${payload.citySlug}-${payload.industrySlug}`}
                ctaSource="pseo_audit"
                pageContext={`pseo-${payload.citySlug}-${payload.industrySlug}`}
                submitLabel="Run audit"
                websiteLabel="Your website URL"
                issueLabel="Which page or goal matters most?"
                issuePlaceholder="Homepage, services page, or contact page"
                showPhoneField={false}
                metaMessage="Protected against spam. We only use this info to review your site."
              />
            </div>
          </div>
        </div>
      </section>
      <section className="section-shell">
        <SovereignServicesCarousel />
      </section>
      <section className="section-shell">
        <div className="section-container marketing-prose max-w-[42rem]">
          <p>
            Want to learn more about how we help {payload.industryLabel.toLowerCase()} businesses in{" "}
            {payload.cityLabel}?{" "}
            <Link href="/contact" className="text-brand-accent underline">
              Contact us for a free consultation
            </Link>
            .
          </p>
        </div>
      </section>
    </MarketingChrome>
  );
}
