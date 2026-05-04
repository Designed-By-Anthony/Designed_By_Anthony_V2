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
          className="flex-1 cursor-pointer rounded-[0.45rem] border border-transparent !bg-[#1A2A40] px-3 py-[0.55rem] text-[0.8rem] font-bold !text-[#FFFFFF] transition-all duration-[180ms] ease-in hover:!bg-[#486D8A] hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
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
          ? "border-[rgba(26,42,64,0.15)] bg-brand-linen shadow-[0_12px_36px_-16px_rgba(26,42,64,0.15)] hover:shadow-[0_20px_48px_-20px_rgba(26,42,64,0.2)] ring-1 ring-[#1A2A40]/10"
          : "border-brand-border bg-card shadow-[0_8px_28px_-18px_rgba(26,42,64,0.08)] hover:shadow-[0_20px_44px_-22px_rgba(26,42,64,0.14)] hover:border-[rgba(26,42,64,0.2)]"
      }`}
    >
      {tier.highlight ? (
        <span className="absolute -top-[0.65rem] left-1/2 -translate-x-1/2 rounded-full !bg-[#1A2A40] px-[0.75rem] py-[0.22rem] text-[0.62rem] font-extrabold uppercase tracking-[0.1em] !text-white whitespace-nowrap shadow-[0_4px_10px_-2px_rgba(26,42,64,0.3)]">
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
            className="block w-full cursor-pointer rounded-[0.55rem] border border-transparent !bg-[#1A2A40] px-5 py-[0.65rem] text-center text-[0.85rem] font-bold !text-[#FFFFFF] transition-all duration-[180ms] ease-in hover:-translate-y-px hover:!bg-[#486D8A] hover:shadow-[0_12px_28px_-12px_rgba(26,42,64,0.35)]"
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
          className="block cursor-pointer rounded-[0.55rem] border border-transparent !bg-[#1A2A40] px-5 py-[0.65rem] text-center text-[0.85rem] font-bold !text-[#FFFFFF] no-underline transition-all duration-300 ease-out hover:-translate-y-px hover:!bg-[#486D8A] hover:shadow-[0_12px_28px_-12px_rgba(26,42,64,0.35)]"
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
          <span className="mb-[0.3rem] inline-block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[#486D8A]">
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

      <div className="mb-6 flex items-center gap-3">
        <span
          className={`text-[0.82rem] font-semibold ${!annual ? "text-brand-indigo" : "text-brand-charcoal/50"}`}
        >
          Monthly
        </span>
        <button
          type="button"
          onClick={() => setAnnual((a) => !a)}
          aria-pressed={annual}
          aria-label="Toggle annual billing"
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            annual ? "bg-brand-indigo" : "bg-brand-charcoal/20"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              annual ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span
          className={`text-[0.82rem] font-semibold ${annual ? "text-brand-indigo" : "text-brand-charcoal/50"}`}
        >
          Annual <span className="font-bold text-[#22c55e]">(save 2 months)</span>
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {product.tiers.map((tier) => (
          <TierCard key={tier.name} tier={tier} annual={annual} productName={product.name} />
        ))}
      </div>
    </section>
  );
}

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-[72rem] px-6 pb-24 pt-16">
      <div className="mb-10 flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#1A2A40]/15 bg-[#1A2A40]/5 px-4 py-[0.4rem] text-[0.75rem] font-bold text-brand-indigo">
          <span className="rounded bg-[#1A2A40] px-[0.4rem] py-[0.1rem] text-white">
            {PROMO_FOUNDING.code}
          </span>
          {PROMO_FOUNDING.label} &mdash; {PROMO_FOUNDING.discount}{" "}
          <span className="font-normal text-brand-charcoal/55">{PROMO_FOUNDING.note}</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#486D8A]/20 bg-[#486D8A]/5 px-4 py-[0.4rem] text-[0.75rem] font-bold text-[#486D8A]">
          <span className="rounded bg-[#486D8A] px-[0.4rem] py-[0.1rem] text-white">
            {PROMO_BOGO.code}
          </span>
          {PROMO_BOGO.label} &mdash; {PROMO_BOGO.discount}{" "}
          <span className="font-normal text-brand-charcoal/55">{PROMO_BOGO.note}</span>
        </span>
      </div>

      {TOOLS_PRODUCTS.map((product) => (
        <ProductSection key={product.slug} product={product} />
      ))}

      <section
        className="mt-4 rounded-[1.5rem] border border-[rgba(26,42,64,0.15)] bg-brand-linen p-10 shadow-[0_12px_36px_-16px_rgba(26,42,64,0.12)]"
        aria-labelledby="founder-heading"
      >
        <h2
          id="founder-heading"
          className="mb-2 text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold leading-[1.15] text-brand-indigo"
        >
          {FOUNDER_ALL_ACCESS.name}
        </h2>
        <p className="mb-1 text-[0.9rem] font-semibold text-brand-charcoal/65">
          {FOUNDER_ALL_ACCESS.tagline}
        </p>
        <p className="mb-6 max-w-[42rem] text-[0.9rem] leading-[1.6] text-brand-charcoal/75">
          {FOUNDER_ALL_ACCESS.description}
        </p>
        <ul className="mb-7 flex list-none flex-col gap-[0.45rem] p-0">
          {FOUNDER_ALL_ACCESS.features.map((f) => (
            <li
              key={f}
              className="relative pl-[1.15rem] text-[0.85rem] leading-[1.4] text-brand-charcoal/75 before:absolute before:left-0 before:text-[0.72rem] before:font-bold before:text-[#22c55e] before:content-['✓']"
            >
              {f}
            </li>
          ))}
        </ul>
        <div className="mb-6 flex flex-wrap items-baseline gap-3">
          <span className="text-[2.5rem] font-extrabold leading-none tracking-[-0.02em] text-brand-indigo">
            ${FOUNDER_ALL_ACCESS.annualPrice}
          </span>
          <span className="text-[0.9rem] font-medium text-brand-charcoal/65">/yr</span>
        </div>
        <a
          href={FOUNDER_ALL_ACCESS.annualLink}
          className="inline-block cursor-pointer rounded-[0.6rem] border border-transparent !bg-[#1A2A40] px-8 py-[0.75rem] text-[0.9rem] font-bold !text-white no-underline transition-all duration-300 ease-out hover:-translate-y-px hover:!bg-[#486D8A] hover:shadow-[0_12px_28px_-12px_rgba(26,42,64,0.35)]"
        >
          Claim Founding Rate
        </a>
      </section>
    </main>
  );
}
