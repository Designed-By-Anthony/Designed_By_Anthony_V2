import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { homeFaqEntries, processSteps, whyStackCards } from "@/data/home";
import { showcaseFeaturedItems } from "@/data/showcase";
import {
  btnOutline,
  btnPrimary,
  btnPrimaryAudit,
  btnSecondaryProof,
} from "@/design-system/buttons";
import { ATELIER_ROME_LEGACY, COPPER_CITY_HOOK } from "@/design-system/location";
import {
  FOUNDING_PARTNER_BUILD_SLOTS,
  FOUNDING_PARTNER_SEO_LABEL,
  FOUNDING_PARTNER_SEO_MONTHLY,
  STANDARD_WEBSITE_INSTALLMENT_EACH,
  STANDARD_WEBSITE_STARTING_PRICE,
  STANDARD_WEBSITE_TYPICAL_RANGE,
} from "@/lib/offers";
import { FaqSection } from "./FaqSection";
import { FirstVisitSplash } from "./FirstVisitSplash";
import { FoundingPartnerSection } from "./FoundingPartnerSection";
import { PremiumPitchStrip } from "./PremiumPitchStrip";
import "@/app/home-page.css";

const homeFeaturedWorkItems = showcaseFeaturedItems.slice(0, 3);
const heroGhostLines = [
  "WEBSITES THAT WORK.",
  "LETS BUILD SOMETHING GREAT.",
  "MADE IN THE 315.",
  "YOUR BUSINESS, ONLINE.",
] as const;

function HeroGhostLayer() {
  return (
    <div className="hero-ghost-layer" aria-hidden="true">
      {heroGhostLines.map((line, index) => (
        <span key={line} className={`hero-ghost-line hero-ghost-line--${index + 1}`}>
          {line}
        </span>
      ))}
    </div>
  );
}

/**
 * Hero A/B variants. Default copy always renders in SSR for SEO; the
 * afterInteractive script swaps only when `?v=<key>` is present (ad
 * campaign landing pages). Search engines always see the default.
 */
const heroVariants = {
  wellness: {
    eyebrow: "Web Design Studio · Medspa · Salon · Wellness · Boutique",
    h1: "Websites for wellness brands that look as polished as the experience you give your clients.",
    sub: "Custom websites for medspas, salons, clinics, and wellness brands across Utica, Rome, Syracuse, and Central New York. Beautiful layouts, easy booking, and a site that feels like your brand — not a template. Contact us for your free audit.",
  },
  "multi-location": {
    eyebrow: "Web Design Studio · Multi-Location · HVAC · Home Services",
    h1: "Websites and local SEO for multi-location service businesses across Central New York.",
    sub: "Custom websites for HVAC, plumbing, electrical, and home-service businesses with two or more locations across Utica, Syracuse, Watertown, and Upstate NY. Separate pages for each location, shared lead capture, and local SEO tuned for every market. Contact us for your free audit.",
  },
} as const;

export function HomePage() {
  const heroSub =
    "Fast, mobile-friendly websites for contractors, home services, medical spas, salons, and growing businesses in Utica, Rome, Syracuse, and Central New York. Sites that load fast on phones, rank higher on Google, and turn visitors into customers. ";
  const heroSubWithLegacy = `${heroSub}${ATELIER_ROME_LEGACY}`;
  
  return (
    <>
      <section className="page-hero page-hero--home">
        <div className="hero-lcp-layer" aria-hidden="true">
          <Image
            src="/images/og-site-premium.png"
            alt=""
            width={2400}
            height={1260}
            className="hero-lcp-layer__img"
            priority
            fetchPriority="high"
            sizes="100vw"
          />
        </div>
        <div className="hero-drift" aria-hidden="true">
          <span className="hero-drift__glow hero-drift__glow--a" />
          <span className="hero-drift__glow hero-drift__glow--b" />
        </div>
        <div className="hero-rain" aria-hidden="true">
          <span className="hero-rain__layer hero-rain__layer--back" />
          <span className="hero-rain__layer hero-rain__layer--front" />
        </div>
        <HeroGhostLayer />
        <div className="page-hero-inner">
          <div className="hero-copy">
            <p className="hero-place-marker">
              <span className="sr-only">Area codes three one five and five one eight</span>
              <span className="hero-place-marker__rule" aria-hidden="true" />
              <span className="hero-place-marker__text" aria-hidden="true">
                315 · 518
              </span>
            </p>
            <p className="page-eyebrow page-eyebrow--rule" data-hero-eyebrow>
              Web Design · Utica · Rome · Syracuse · Central NY — {COPPER_CITY_HOOK}
            </p>
            <div className="hero-launch-pill relative z-[40]" role="status">
              <span className="hero-launch-dot" aria-hidden="true" />
              <span className="hero-launch-pill__text">
                Limited Offer:{" "}
                <strong>{FOUNDING_PARTNER_BUILD_SLOTS} Free Website Builds Remaining</strong>
                <span className="hero-launch-pill__sep"> · </span>
                <span className="hero-launch-pill__sub">
                  free build + {FOUNDING_PARTNER_SEO_MONTHLY}/mo growth plan
                </span>
              </span>
            </div>
            
            {/* --- FIX APPLIED HERE --- */}
            <h1
              data-hero-h1
              className="home-hero-title font-[family-name:var(--font-inter)] font-normal tracking-[-0.02em]"
            >
              <span className="font-[family-name:var(--font-playfair)] font-bold">Websites</span>{" "}
              <span className="font-[family-name:var(--font-inter)]">that drive results.</span>
            </h1>
            
            <p className="hero-sub mt-6 text-lg max-w-2xl" data-hero-sub>
              {heroSubWithLegacy}
            </p>
            
            <div className="hero-actions mt-8 flex flex-wrap gap-4">
              <Link href="/contact" className={btnPrimary}>
                Get Started
              </Link>
              <Link href="/audit" className={btnPrimaryAudit}>
                Free Audit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rendering imported sections to complete the page layout */}
      <PremiumPitchStrip />
      <FoundingPartnerSection />
      <FaqSection />
      <FirstVisitSplash />
    </>
  );
}