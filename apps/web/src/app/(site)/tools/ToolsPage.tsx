"use client";

import { type FormEvent, useState } from "react";
import {
  FOUNDER_ALL_ACCESS,
  PROMO_BOGO,
  PROMO_FOUNDING,
  type Product,
  type ProductTier,
  TOOLS_PRODUCTS,
} from "@/data/tools-products";
import { buildPublicApiUrl } from "@/lib/publicApi";

const ICON_MAP: Record<string, string> = {
  search: "\u{1F50D}",
  bot: "\u{1F916}",
  folder: "\u{1F4C2}",
  mapPin: "\u{1F4CD}",
  star: "\u2B50",
  pen: "\u270D\uFE0F",
};

function ProductIcon({ icon }: { icon: string }) {
  return (
    <span className="text-[1.75rem] leading-none shrink-0 mt-[0.15rem]" aria-hidden>
      {ICON_MAP[icon] ?? "\u{1F527}"}
    </span>
  );
}

type PreorderStatus = "idle" | "form" | "submitting" | "success" | "error";

function PreorderForm({
  productName,
  tierName,
  onClose,
}: {
  productName: string;
  tierName: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<PreorderStatus>("form");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("submitting");
    try {
      const res = await fetch(buildPublicApiUrl("/api/lead-email"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: email.split("@")[0] || "Pre-order",
          source: "tools-preorder",
          leadSource: "tools-preorder",
          ctaSource: `${productName} — ${tierName}`,
          message: `Pre-order interest: ${productName} — ${tierName} tier`,
        }),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <p className="text-[0.82rem] text-[#22c55e] leading-[1.45]">
          Reserved! We will email you when {productName} launches.
        </p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <input
        type="email"
        className="w-full rounded-[0.45rem] border border-brand-border bg-white px-3 py-[0.55rem] text-[0.82rem] text-brand-charcoal outline-none transition-[border-color] duration-[180ms] ease-in focus:border-brand-accent placeholder:text-brand-charcoal/45"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        aria-label={`Email for ${productName} ${tierName} pre-order`}
        disabled={status === "submitting"}
      />
      <div className="flex gap-[0.4rem]">
        <button
          type="submit"
          className="flex-1 cursor-pointer rounded-[0.45rem] border border-brand-accent bg-brand-accent px-3 py-[0.55rem] text-[0.8rem] font-bold text-brand-linen transition-[background,transform,border-color] duration-[180ms] ease-in hover:border-[var(--accent-bronze-dark)] hover:bg-[var(--accent-bronze-dark)] hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Reserving\u2026" : "Reserve Spot"}
        </button>
        <button
          type="button"
          className="cursor-pointer rounded-[0.45rem] border border-brand-border bg-transparent px-3 py-[0.55rem] text-[0.8rem] font-semibold text-brand-charcoal/55 transition-colors duration-[180ms] ease-in hover:text-brand-indigo"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
      {status === "error" ? (
        <p className="text-[0.75rem] text-[rgba(248,113,113,0.85)]">
          Something went wrong. Try again.
        </p>
      ) : null}
    </form>
  );
}

function TierCard({
  tier,
  annual,
  productName,
}: {
  tier: ProductTier;
  annual: boolean;
  productName: string;
}) {
  const price = annual ? tier.annualPrice : tier.monthlyPrice;
  const period = annual ? "/yr" : "/mo";
  const link = annual ? tier.annualLink : tier.monthlyLink;
  const isPlaceholder = link === "#";
  const [showPreorder, setShowPreorder] = useState(false);

  return (
    <div
      className={`relative flex flex-col rounded-[var(--radius-card,1.25rem)] border p-[var(--card-pad,1.5rem)] transition-all duration-300 ease-out hover:-translate-y-1 ${
        tier.highlight
          ? "border-brand-accent bg-brand-linen shadow-[0_12px_36px_-16px_rgb(var(--brand-accent-rgb)/0.22)] hover:shadow-[0_20px_48px_-20px_rgb(var(--brand-accent-rgb)/0.3)] ring-1 ring-brand-accent/20"
          : "border-brand-border bg-card shadow-[0_8px_28px_-18px_rgba(26,42,64,0.08)] hover:shadow-[0_20px_44px_-22px_rgba(26,42,64,0.14)] hover:border-[rgb(var(--brand-accent-rgb)/0.28)]"
      }`}
    >
      {tier.highlight ? (
        <span className="absolute -top-[0.65rem] left-1/2 -translate-x-1/2 rounded-full bg-brand-accent px-[0.75rem] py-[0.22rem] text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-white whitespace-nowrap shadow-[0_2px_8px_-2px_rgb(var(--brand-accent-rgb)/0.4)]">
          Most Popular
        </span>
      ) : null}
      <h4 className="mb-3 text-[0.82rem] font-bold uppercase tracking-[0.08em] text-brand-indigo">
        {tier.name}
      </h4>
      <p className="mb-1 flex items-baseline gap-[0.2rem]">
        <span className="text-[2rem] font-extrabold leading-none tracking-[-0.02em] text-brand-indigo">
          ${price}
        </span>
        <span className="text-[0.82rem] font-medium text-brand-charcoal/65">{period}</span>
      </p>
      {annual ? (
        <p className="text-[0.7rem] text-[#22c55e] font-semibold mb-3">2 months free vs. monthly</p>
      ) : null}
      <ul className="list-none p-0 mt-3 mb-5 flex flex-col gap-[0.45rem] flex-1">
        {tier.features.map((f) => (
          <li
            key={f}
            className="relative pl-[1.15rem] text-[0.82rem] leading-[1.4] text-brand-charcoal/75 before:absolute before:left-0 before:text-[0.72rem] before:font-bold before:text-[#22c55e] before:content-['✓']"
          >
            {f}
          </li>
        ))}
      </ul>
      {isPlaceholder ? (
        showPreorder ? (
          <PreorderForm
            productName={productName}
            tierName={tier.name}
            onClose={() => setShowPreorder(false)}
          />
        ) : (
          <button
            type="button"
            className="block w-full cursor-pointer rounded-[0.55rem] border border-brand-accent bg-brand-accent px-5 py-[0.65rem] text-center text-[0.85rem] font-bold text-brand-linen transition-[transform,box-shadow,border-color,background-color] duration-[180ms] ease-in hover:-translate-y-px hover:border-[var(--accent-bronze-dark)] hover:bg-[var(--accent-bronze-dark)] hover:shadow-[0_12px_28px_-12px_rgb(var(--brand-accent-rgb)/0.35)]"
            onClick={() => setShowPreorder(true)}
          >
            Pre-order
          </button>
        )
      ) : (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="block cursor-pointer rounded-[0.55rem] border border-brand-accent bg-brand-accent px-5 py-[0.65rem] text-center text-[0.85rem] font-bold text-brand-linen no-underline transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out hover:-translate-y-px hover:border-[var(--accent-bronze-dark)] hover:bg-[var(--accent-bronze-dark)] hover:shadow-[0_12px_28px_-12px_rgb(var(--brand-accent-rgb)/0.35)]"
        >
          Get Started
        </a>
      )}
    </div>
  );
}

function ProductSection({ product }: { product: Product }) {
  const [annual, setAnnual] = useState(false);

  return (
    <section
      className="mb-[4.5rem] pt-8"
      id={product.slug}
      aria-labelledby={`${product.slug}-heading`}
    >
      <div className="flex gap-4 items-start mb-7 max-sm:flex-col">
        <ProductIcon icon={product.icon} />
        <div>
          <span className="mb-[0.3rem] inline-block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-brand-accent">
            {product.category}
          </span>
          <h3
            id={`${product.slug}-heading`}
            className="mb-2 text-[clamp(1.35rem,3vw,1.75rem)] font-bold leading-[1.2] text-brand-indigo"
          >
            {product.name}{" "}
            <span className="font-normal text-brand-charcoal/65">&mdash; {product.tagline}</span>
          </h3>
          <p className="max-w-[44rem] text-[0.9rem] leading-[1.6] text-brand-charcoal/75">
            {product.description}
          </p>
        </div>
      </div>

      <fieldset
        className="mb-6 inline-flex min-w-0 rounded-[0.55rem] border border-brand-border bg-brand-linen p-[0.2rem]"
        aria-label="Billing cycle"
      >
        <button
          type="button"
          className={`cursor-pointer rounded-[0.4rem] border-none px-4 py-[0.45rem] text-[0.8rem] font-semibold transition-[background,color] duration-[150ms] ease-in ${
            !annual
              ? "bg-[rgb(var(--brand-accent-rgb)/0.14)] text-brand-accent"
              : "bg-transparent text-brand-charcoal/55"
          }`}
          onClick={() => setAnnual(false)}
          aria-pressed={!annual}
        >
          Monthly
        </button>
        <button
          type="button"
          className={`cursor-pointer rounded-[0.4rem] border-none px-4 py-[0.45rem] text-[0.8rem] font-semibold transition-[background,color] duration-[150ms] ease-in ${
            annual
              ? "bg-[rgb(var(--brand-accent-rgb)/0.14)] text-brand-accent"
              : "bg-transparent text-brand-charcoal/55"
          }`}
          onClick={() => setAnnual(true)}
          aria-pressed={annual}
        >
          Annual{" "}
          <span className="text-[0.65rem] font-bold px-[0.4rem] py-[0.12rem] rounded-full bg-[rgba(34,197,94,0.14)] text-[#22c55e] ml-[0.35rem] align-middle">
            Save 2 mo
          </span>
        </button>
      </fieldset>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-5 max-sm:grid-cols-1">
        {product.tiers.map((tier) => (
          <TierCard key={tier.name} tier={tier} annual={annual} productName={product.name} />
        ))}
      </div>
    </section>
  );
}

export function ToolsPage() {
  return (
    <div className="min-h-[80vh] pt-[clamp(4rem,8vw,7rem)] pb-[clamp(4rem,8vw,6rem)] px-[var(--container-gutter)] max-w-[80rem] mx-auto">
      {/* Hero */}
      <section className="max-w-[52rem] mx-auto mb-12 text-center">
        <p className="mb-6 inline-flex items-center gap-[0.45rem] rounded-full border border-[rgb(var(--brand-accent-rgb)/0.28)] bg-[rgb(var(--brand-accent-rgb)/0.08)] px-[0.85rem] py-[0.35rem] text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-accent">
          <span
            className="inline-block h-[0.35rem] w-[0.35rem] shrink-0 rounded-full bg-brand-accent shadow-[0_0_6px_1px_rgb(var(--brand-accent-rgb)/0.35)]"
            aria-hidden
          />
          Business Tools &middot; Pre-orders Open
        </p>
        <h1 className="mb-5 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.12] tracking-[-0.03em] text-brand-indigo">
          Simple tools built for local service businesses.
        </h1>
        <p className="mx-auto max-w-[38rem] text-[clamp(0.95rem,1.8vw,1.1rem)] leading-[1.65] text-brand-charcoal/75">
          Six tools — website reports, review management, client portals, testimonial collection,
          and more — priced for small businesses and freelancers. No bloat. No contracts. Pre-order
          now to lock in founding member pricing.
        </p>
        <div className="mt-6 flex gap-3 justify-center flex-wrap">
          <a
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-[0.55rem] border border-brand-accent bg-brand-accent px-6 py-[0.65rem] text-[0.85rem] font-bold text-white no-underline transition-[transform,box-shadow,background] duration-200 ease-out hover:-translate-y-px hover:bg-[var(--accent-bronze-dark)] hover:shadow-[0_12px_28px_-12px_rgb(var(--brand-accent-rgb)/0.35)]"
          >
            Sign Up &amp; Get Started
          </a>
          <a
            href="/sign-in"
            className="inline-flex items-center gap-2 rounded-[0.55rem] border border-brand-border bg-transparent px-6 py-[0.65rem] text-[0.85rem] font-semibold text-brand-charcoal/70 no-underline transition-colors duration-200 ease-in hover:border-brand-accent hover:text-brand-indigo"
          >
            Already have an account? Sign in
          </a>
        </div>
      </section>

      {/* Promo banners */}
      <div className="flex flex-wrap gap-4 justify-center mb-10 max-sm:flex-col max-sm:items-stretch">
        <div className="flex max-w-[28rem] flex-[1_1_20rem] items-center gap-3 rounded-xl border border-brand-border bg-brand-linen px-5 py-3 max-sm:max-w-full">
          <span className="inline-block shrink-0 whitespace-nowrap rounded-[0.35rem] bg-[rgb(var(--brand-accent-rgb)/0.14)] px-[0.55rem] py-[0.25rem] text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-brand-accent">
            {PROMO_FOUNDING.code}
          </span>
          <span className="text-[0.82rem] leading-[1.45] text-brand-charcoal">
            <strong>{PROMO_FOUNDING.label}</strong> &mdash; {PROMO_FOUNDING.discount}.{" "}
            {PROMO_FOUNDING.note}.
          </span>
        </div>
        <div className="flex max-w-[28rem] flex-[1_1_20rem] items-center gap-3 rounded-xl border border-brand-border bg-brand-linen px-5 py-3 max-sm:max-w-full">
          <span className="inline-block shrink-0 whitespace-nowrap rounded-[0.35rem] bg-[rgb(var(--brand-accent-rgb)/0.14)] px-[0.55rem] py-[0.25rem] text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-brand-accent">
            {PROMO_BOGO.code}
          </span>
          <span className="text-[0.82rem] leading-[1.45] text-brand-charcoal">
            <strong>{PROMO_BOGO.label}</strong> &mdash; {PROMO_BOGO.discount}. {PROMO_BOGO.note}.
          </span>
        </div>
      </div>

      {/* Founder All-Access */}
      <section
        id="founder-all-access"
        className="mx-auto mb-14 max-w-[44rem] rounded-[var(--radius-card,1.25rem)] border-2 border-brand-accent bg-brand-linen p-[clamp(1.5rem,4vw,2.5rem)] text-center shadow-[0_16px_48px_-20px_rgb(var(--brand-accent-rgb)/0.18)]"
      >
        <span className="mb-4 inline-block rounded-full bg-brand-accent px-[0.85rem] py-[0.25rem] text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_2px_8px_-2px_rgb(var(--brand-accent-rgb)/0.4)]">
          Best Value
        </span>
        <h3 className="mb-2 text-[clamp(1.35rem,3vw,1.75rem)] font-bold leading-[1.2] text-brand-indigo">
          {FOUNDER_ALL_ACCESS.name}
        </h3>
        <p className="mb-1 text-[0.9rem] leading-[1.5] text-brand-charcoal/70">
          {FOUNDER_ALL_ACCESS.tagline}
        </p>
        <p className="mb-5 text-[0.88rem] leading-[1.6] text-brand-charcoal/65">
          {FOUNDER_ALL_ACCESS.description}
        </p>
        <p className="mb-1 flex items-baseline justify-center gap-[0.25rem]">
          <span className="text-[2.5rem] font-extrabold leading-none tracking-[-0.02em] text-brand-indigo">
            ${FOUNDER_ALL_ACCESS.annualPrice.toLocaleString()}
          </span>
          <span className="text-[0.9rem] font-medium text-brand-charcoal/65">/yr</span>
        </p>
        <p className="mb-6 text-[0.72rem] text-brand-charcoal/55">
          That&rsquo;s ${Math.round(FOUNDER_ALL_ACCESS.annualPrice / 12)}/mo for every tool
        </p>
        <ul className="mx-auto mb-6 inline-flex max-w-[24rem] list-none flex-col gap-[0.45rem] p-0 text-left">
          {FOUNDER_ALL_ACCESS.features.map((f) => (
            <li
              key={f}
              className="relative pl-[1.15rem] text-[0.85rem] leading-[1.4] text-brand-charcoal/75 before:absolute before:left-0 before:text-[0.72rem] before:font-bold before:text-[#22c55e] before:content-['✓']"
            >
              {f}
            </li>
          ))}
        </ul>
        <a
          href="/sign-up"
          className="inline-block cursor-pointer rounded-[0.55rem] border border-brand-accent bg-brand-accent px-8 py-[0.75rem] text-[0.9rem] font-bold text-white no-underline transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:-translate-y-px hover:border-[var(--accent-bronze-dark)] hover:bg-[var(--accent-bronze-dark)] hover:shadow-[0_12px_28px_-12px_rgb(var(--brand-accent-rgb)/0.35)]"
        >
          Get All-Access
        </a>
      </section>

      {/* Quick nav */}
      <nav className="flex flex-wrap gap-2 justify-center mb-14" aria-label="Product quick links">
        {TOOLS_PRODUCTS.map((p) => (
          <a
            key={p.slug}
            href={`#${p.slug}`}
            className="inline-flex items-center gap-[0.35rem] rounded-full border border-brand-border bg-card px-[0.85rem] py-[0.45rem] text-[0.78rem] font-semibold text-brand-charcoal no-underline transition-[border-color,background,color] duration-[180ms] ease-in hover:border-brand-accent hover:bg-brand-linen hover:text-brand-indigo"
          >
            {ICON_MAP[p.icon] ?? "\u{1F527}"} {p.name}
          </a>
        ))}
      </nav>

      {/* Product sections */}
      {TOOLS_PRODUCTS.map((product) => (
        <ProductSection key={product.slug} product={product} />
      ))}

      {/* Bottom CTA */}
      <section className="mx-auto mt-8 max-w-[40rem] rounded-[var(--radius-card,1.25rem)] border border-brand-border bg-brand-linen px-[var(--card-pad,1.5rem)] py-10 text-center">
        <h2 className="mb-3 text-[clamp(1.25rem,3vw,1.6rem)] font-bold text-brand-indigo">
          Want every tool?
        </h2>
        <p className="text-[0.9rem] leading-[1.65] text-brand-charcoal/75">
          The{" "}
          <a
            href="#founder-all-access"
            className="font-semibold text-brand-accent no-underline hover:underline"
          >
            Founder All-Access
          </a>{" "}
          plan gives you the full suite for ${FOUNDER_ALL_ACCESS.annualPrice.toLocaleString()}/yr
          &mdash; that&rsquo;s ${Math.round(FOUNDER_ALL_ACCESS.annualPrice / 12)}/mo for every tool,
          locked in forever.
        </p>
      </section>
    </div>
  );
}
