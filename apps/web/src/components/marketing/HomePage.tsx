import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { homeFaqEntries } from "@/data/home";
import { btnOutline, btnPrimary, btnPrimaryAudit } from "@/design-system/buttons";
import { ATELIER_ROME_LEGACY, COPPER_CITY_HOOK } from "@/design-system/location";
import { FOUNDING_PARTNER_BUILD_SLOTS } from "@/lib/offers";
import { FaqSection } from "./FaqSection";
import { FirstVisitSplash } from "./FirstVisitSplash";
import { FoundingPartnerSection } from "./FoundingPartnerSection";
import { PremiumPitchStrip } from "./PremiumPitchStrip";
import "@/app/home-page.css";

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

const heroVariants = {
  wellness: {
    eyebrow: "Web Design Studio · Medspa · Salon · Wellness · Boutique",
    h1: "Websites for wellness brands that look as polished as the experience you give your clients.",
    sub: "Custom websites for medspas, salons, clinics, and wellness brands across Utica, Rome, Syracuse, and Central New York.",
  },
  "multi-location": {
    eyebrow: "Web Design Studio · Multi-Location · HVAC · Home Services",
    h1: "Websites and local SEO for multi-location service businesses across Central New York.",
    sub: "Custom websites for HVAC, plumbing, electrical, and home-service businesses.",
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
        <HeroGhostLayer />
        <div className="page-hero-inner">
          <div className="hero-copy">
            <p className="page-eyebrow page-eyebrow--rule" data-hero-eyebrow>
              Web Design · Utica · Rome · Syracuse · Central NY — {COPPER_CITY_HOOK}
            </p>
            <div className="hero-launch-pill relative z-[40]">
              <span className="hero-launch-pill__text">
                Limited Offer:{" "}
                <strong>{FOUNDING_PARTNER_BUILD_SLOTS} Free Website Builds Remaining</strong>
              </span>
            </div>
            <h1 data-hero-h1 className="home-hero-title font-[family-name:var(--font-inter)]">
              <span className="font-[family-name:var(--font-playfair)] font-bold">Websites</span>{" "}
              that work as hard as you do.
            </h1>
            <p data-hero-sub>{heroSubWithLegacy}</p>
            <div className="hero-actions">
              <Link href="/lighthouse" className={`${btnPrimaryAudit} hero-cta-glow`}>
                Audit My Site
              </Link>
              <Link
                href="/contact"
                className={`${btnOutline} !text-[#1A2A40] !bg-white !border-[#1A2A40]/50`}
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <PremiumPitchStrip variant="home" />
      </section>

      <section className="section-shell section-shell--wash">
        <div className="section-container">
          <div className="home-email-cta__card surface-card">
            <h2>Send us a message</h2>
            <div className="flex gap-3 mt-4">
              <Link href="/contact" className={`${btnOutline} !text-[#1A2A40] !bg-white`}>
                Open form
              </Link>
              <Link href="/contact" className={btnPrimary}>
                Let's build.
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-container">
          <FaqSection entries={homeFaqEntries} />
        </div>
      </section>

      <FoundingPartnerSection />
      <FirstVisitSplash />

      <Script id="hero-variants" strategy="afterInteractive">
        {`(() => {
          try {
            var params = new URLSearchParams(window.location.search);
            var variantKey = params.get('v');
            var heroVariants = ${JSON.stringify(heroVariants)};
            if (variantKey && heroVariants && heroVariants[variantKey]) {
              var variant = heroVariants[variantKey];
              var eyebrow = document.querySelector('[data-hero-eyebrow]');
              var h1 = document.querySelector('[data-hero-h1]');
              var sub = document.querySelector('[data-hero-sub]');
              if (eyebrow && variant.eyebrow) eyebrow.textContent = variant.eyebrow;
              if (h1 && variant.h1) h1.textContent = variant.h1;
              if (sub && variant.sub) sub.textContent = variant.sub;
              document.documentElement.setAttribute('data-hero-variant', variantKey);
            }
          } catch (e) {
            console.error("Hero variant swap failed", e);
          }
        })();`}
      </Script>

      <Script id="home-hero-motion" strategy="afterInteractive">
        {`(() => {
          var hero = document.querySelector('.page-hero--home');
          if (!hero) return;
          var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (prefersReducedMotion) return;

          hero.addEventListener('pointermove', function (e) {
            var rect = hero.getBoundingClientRect();
            var x = ((e.clientX - rect.left) / rect.width) * 100;
            var y = ((e.clientY - rect.top) / rect.height) * 100;
            hero.style.setProperty('--hero-spot-x', x.toFixed(2) + '%');
            hero.style.setProperty('--hero-spot-y', y.toFixed(2) + '%');
          }, { passive: true });
        })();`}
      </Script>
    </>
  );
}
