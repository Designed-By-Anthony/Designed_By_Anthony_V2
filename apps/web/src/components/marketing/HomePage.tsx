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
            <h1
              data-hero-h1
              className="home-hero-title font-[family-name:var(--font-inter)] font-normal tracking-[-0.02em]"
            >
              <span className="font-[family-name:var(--font-playfair)] font-bold">Websites</span>{" "}
              <span className="font-[family-name:var(--font-inter)] font-normal">
                that work as hard{" "}
              </span>
              <span className="font-[family-name:var(--font-inter)] font-normal">as you do.</span>{" "}
              <span className="font-[family-name:var(--font-inter)] font-normal">Built by </span>
              <span className="font-[family-name:var(--font-playfair)] font-bold whitespace-nowrap">
                ANTHONY
                <span className="text-[rgb(var(--accent-bronze-rgb))]">.</span>
              </span>
            </h1>
            <p data-hero-sub className="font-[family-name:var(--font-inter)] font-normal">
              {heroSubWithLegacy}
            </p>
            <p className="hero-pricing-anchor">
              Most projects: <strong>3 easy payments of {STANDARD_WEBSITE_INSTALLMENT_EACH}</strong>{" "}
              (typical total {STANDARD_WEBSITE_TYPICAL_RANGE}) — includes hosting and SEO for the
              first three months, then {FOUNDING_PARTNER_SEO_MONTHLY}/mo{" "}
              {FOUNDING_PARTNER_SEO_LABEL} to keep growing. Founding partner program: free build
              with SEO commitment — {FOUNDING_PARTNER_BUILD_SLOTS} spots left. Single projects from{" "}
              {STANDARD_WEBSITE_STARTING_PRICE}.
            </p>
            <div className="hero-actions">
              <Link
                href="/lighthouse"
                className={`${btnPrimaryAudit} hero-cta-glow`}
                id="hero-audit-btn"
              >
                <span className="hero-cta-glow-halo" aria-hidden="true" />
                Audit My Site
              </Link>
              <Link href="/contact" className={btnOutline} id="hero-contact-btn">
                Contact us
              </Link>
            </div>
            <div className="hero-trust-strip">
              <div className="hero-trust-badge">
                <span>Free · Manual Audit</span>
              </div>
              <span className="hero-trust-sep" aria-hidden="true" />
              <div className="hero-trust-badge">
                <span>Built in Rome, NY</span>
              </div>
              <span className="hero-trust-sep" aria-hidden="true" />
              <div className="hero-trust-badge">
                <span>Reply in 1 Business Day</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell section-shell--premium-pitch">
        <PremiumPitchStrip variant="home" />
      </section>

      <section
        className="section-shell section-shell--proof command-shell"
        aria-label="How this studio works"
      >
        <div className="section-container command-strip reveal-up">
          <div className="command-strip__item command-strip__item--brand">
            <p className="command-strip__label">Who builds it</p>
            <p className="command-strip__value">One person, end to end</p>
            <p className="command-strip__meta">
              You talk to the same builder from first call to launch — structure, copy, and
              performance, not a handoff chain.
            </p>
          </div>
          <div className="command-strip__item">
            <p className="command-strip__label">How we start</p>
            <p className="command-strip__value">Audit, then a plan</p>
            <p className="command-strip__meta">
              We run the numbers first so the quote matches what your site actually needs — not a
              guess from a sales call.
            </p>
          </div>
          <div className="command-strip__item">
            <p className="command-strip__label">What we optimize for</p>
            <p className="command-strip__value">Real calls, not vanity</p>
            <p className="command-strip__meta">
              Clear next steps on every page so the right visitors know how to reach you — and you
              are not chasing junk leads.
            </p>
          </div>
        </div>
      </section>

      <section
        className="section-shell section-shell--wash home-proof-shell"
        aria-labelledby="home-proof-heading"
      >
        <div className="section-container">
          <div className="section-header centered">
            <p className="section-eyebrow">Results so far</p>
            <h2 id="home-proof-heading">Real results, not promises.</h2>
            <p>
              We are in our first 10-client launch. Here is what we can honestly show you right now.
            </p>
          </div>
          <div className="home-proof-grid">
            <article className="surface-card home-proof-card reveal-up">
              <span className="card-tag">Verified speed and quality</span>
              <h3>Every site we build scores high on Google's website test.</h3>
              <p>
                Our sites are graded on the same speed, accessibility, and SEO test Google uses to
                rank search results. We build to pass from day one. {ATELIER_ROME_LEGACY}
              </p>
            </article>
            <article className="surface-card home-proof-card reveal-up">
              <span className="card-tag">Live client project</span>
              <h3>The Long Beach Handyman site is live and generating leads.</h3>
              <p>
                Our first client paid $250 for the build and the site is live. We are continuing to
                test and improve traffic and lead generation as we refine the approach.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        className="section-shell section-shell--wash home-email-cta"
        aria-labelledby="home-email-cta-heading"
      >
        <div className="section-container">
          <div className="home-email-cta__card surface-card reveal-up">
            <div className="home-email-cta__copy">
              <p className="home-email-cta__eyebrow">Prefer email?</p>
              <h2 id="home-email-cta-heading" className="home-email-cta__title">
                Send us a message instead
              </h2>
              <p className="home-email-cta__sub">
                Use the contact form to tell us about your project. Include your phone number if you
                want a call. We reply within one business day.
              </p>
            </div>
            <div className="home-email-cta__actions">
              <Link href="/contact" className={btnOutline}>
                Open contact form
              </Link>
              <Link href="/contact" className={btnPrimary}>
                Let&apos;s build something great.
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section-shell section-shell--wash why-stack-shell"
        aria-labelledby="why-stack-heading"
      >
        <div className="section-container">
          <div className="section-header centered">
            <p className="section-eyebrow">Why our websites are different</p>
            <h2 id="why-stack-heading">
              What makes your website faster, safer, and easier to manage.
            </h2>
            <p>
              Instead of a WordPress site held together with plugins, you get a clean site that
              stays fast. Fewer moving parts, less to patch, and nothing that quietly breaks while
              you are out on a job.
            </p>
          </div>
          <div className="why-stack-grid">
            {whyStackCards.map((card) => (
              <article key={card.tech} className="surface-card why-stack-card reveal-up">
                <span className="why-stack-tech">{card.tech}</span>
                <h3 className="why-stack-plain">{card.plain}</h3>
                <p className="why-stack-why">{card.why}</p>
              </article>
            ))}
          </div>
          <p className="why-stack-cta-note">
            Want the full details?{" "}
            <Link href="/ouredge" className="inline-link">
              See what makes us different →
            </Link>
          </p>
        </div>
      </section>

      <section className="section-shell home-faq-shell" aria-labelledby="home-faq-heading">
        <div className="section-container">
          <div className="section-header centered">
            <p className="section-eyebrow">Quick Answers</p>
            <h2 id="home-faq-heading">Questions local business owners ask most.</h2>
            <p>
              Pricing, timelines, and how this actually works — in plain language, before you spend
              a dollar.
            </p>
          </div>
          <FaqSection
            className="home-faq-list"
            itemClassName="reveal-up"
            entries={homeFaqEntries}
          />
          <p className="home-faq-cta-note">
            More on process, hosting, and revisions on the{" "}
            <Link href="/faq" className="inline-link">
              full FAQ page
            </Link>
            .
          </p>
        </div>
      </section>

      <FoundingPartnerSection />

      <section className="section-shell section-shell--technical process-shell">
        <div className="section-container">
          <div className="section-flow-marker reveal-up" aria-hidden="true" />
          <div className="section-header centered">
            <p className="section-eyebrow section-eyebrow--pulse">How It Works</p>
            <h2>From free review to live website — no runaround.</h2>
            <p>
              No pressure to commit on the first call. Here is how we go from your first click to a
              finished site.
            </p>
          </div>

          <div className="process-grid process-grid--asymmetric">
            {processSteps.map((step, index) => (
              <div
                key={step.title}
                className="surface-card surface-card--technical process-card reveal-up"
              >
                <span className="process-number">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>

          <div className="process-action">
            <Link href="/contact" className={btnOutline}>
              Contact us for your free audit
            </Link>
          </div>
        </div>
      </section>

      <section className="section-shell section-shell--editorial section-shell--wash">
        <div className="section-container">
          <div className="section-flow-marker reveal-up" aria-hidden="true" />
          <div className="section-header centered">
            <p className="section-eyebrow">Recent Work</p>
            <h2>Websites we have built for real businesses.</h2>
            <p>
              See the layout, structure, and results we bring to every project.{" "}
              <Link href="/ouredge" className="inline-link">
                See what makes us different →
              </Link>
            </p>
          </div>

          <div className="featured-work-grid featured-work-grid--stagger" data-home-featured-work>
            {homeFeaturedWorkItems.map((item, i) => {
              const href = item.caseStudySlug
                ? `/portfolio/${item.caseStudySlug}`
                : (item.href ?? "#");
              const isExternal = !item.caseStudySlug;
              const ctaLabel = item.caseStudySlug ? "View Case Study" : `Open ${item.name} example`;
              const imgSrc = item.displayImage ?? item.image;
              return (
                <article
                  key={item.name}
                  className="surface-card surface-card--editorial featured-work-card reveal-up"
                >
                  <a
                    href={href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="featured-work-media"
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    <div className="featured-image-wrap">
                      <Image
                        src={imgSrc}
                        alt={item.imageAlt ?? item.name}
                        className="featured-image"
                        width={640}
                        height={480}
                        sizes="(max-width: 900px) min(100vw, 1160px), min(33vw, 480px)"
                        priority={i === 0}
                        {...(i === 0 ? { fetchPriority: "high" as const } : {})}
                      />
                    </div>
                  </a>
                  <div className="featured-copy">
                    <div className="featured-meta">
                      <span className="card-tag">{item.statusLabel}</span>
                      <span className="featured-industry">{item.industry}</span>
                    </div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <a
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="featured-link"
                    >
                      {ctaLabel}
                      {isExternal && <span className="sr-only">(opens in new window)</span>}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="portfolio-link-wrap">
            <Link href="/portfolio" className={btnSecondaryProof}>
              View Full Portfolio
            </Link>
          </div>
        </div>
      </section>

      <Script id="hero-variants" strategy="afterInteractive">
        {`(() => {
  try {
    var params = new URLSearchParams(window.location.search);
    var variantKey = params.get('v');
    var heroVariants = ${JSON.stringify(heroVariants)};
    if (variantKey && heroVariants && heroVariants[variantKey]) {
      var variant = heroVariants[variantKey];
      var eyebrow = document.querySelector('[data-hero-eyebrow]');
      var sub = document.querySelector('[data-hero-sub]');
      if (eyebrow && variant.eyebrow) eyebrow.textContent = variant.eyebrow;
      if (sub && variant.sub) sub.textContent = variant.sub;
      document.documentElement.setAttribute('data-hero-variant', variantKey);
    }
  } catch (e) {}
})();`}
      </Script>

      <Script id="home-hero-motion" strategy="afterInteractive">
        {`(() => {
  var hero = document.querySelector('.page-hero--home');
  if (!hero) return;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!prefersReducedMotion && hasFinePointer) {
    hero.addEventListener('pointermove', function (event) {
      var rect = hero.getBoundingClientRect();
      var x = ((event.clientX - rect.left) / rect.width) * 100;
      var y = ((event.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty('--hero-spot-x', x.toFixed(2) + '%');
      hero.style.setProperty('--hero-spot-y', y.toFixed(2) + '%');
    }, { passive: true });
    hero.addEventListener('pointerleave', function () {
      hero.style.setProperty('--hero-spot-x', '50%');
      hero.style.setProperty('--hero-spot-y', '22%');
    });
  }
  var actionButtons = hero.querySelectorAll('.hero-actions .btn');
  if (prefersReducedMotion || !hasFinePointer || actionButtons.length === 0) return;
  var MAX_SHIFT = 8;
  actionButtons.forEach(function (button) {
    button.addEventListener('pointermove', function (event) {
      var rect = button.getBoundingClientRect();
      var dx = event.clientX - (rect.left + rect.width / 2);
      var dy = event.clientY - (rect.top + rect.height / 2);
      var xShift = (dx / (rect.width / 2)) * MAX_SHIFT;
      var yShift = (dy / (rect.height / 2)) * MAX_SHIFT;
      button.style.setProperty('--btn-shift-x', xShift.toFixed(2) + 'px');
      button.style.setProperty('--btn-shift-y', yShift.toFixed(2) + 'px');
    }, { passive: true });
    button.addEventListener('pointerleave', function () {
      button.style.setProperty('--btn-shift-x', '0px');
      button.style.setProperty('--btn-shift-y', '0px');
    });
  });
})();`}
      </Script>
      <FirstVisitSplash />
    </>
  );
}
