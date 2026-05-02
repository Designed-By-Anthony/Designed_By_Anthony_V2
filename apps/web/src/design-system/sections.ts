/**
 * Tailwind v4 section + surface-card constants — Linen / Indigo / Slate system.
 * No gradients; solid surfaces and brand-border hairlines.
 */

const SECTION_VERTICAL = "py-24 md:py-32 px-[var(--container-gutter)]";

export const SECTION_SHELL = `relative ${SECTION_VERTICAL}`;

export const SECTION_SHELL_WASH = `${SECTION_SHELL} bg-brand-linen`;

export const SECTION_SHELL_EDITORIAL = `${SECTION_SHELL} bg-brand-surface`;

export const SECTION_SHELL_TECHNICAL = `${SECTION_SHELL} bg-brand-linen`;

export const SECTION_SHELL_PROOF = `${SECTION_SHELL} bg-brand-linen`;

/** Tight vertical rhythm: inner PremiumPitchStrip sets its own padding. */
export const SECTION_SHELL_PREMIUM_PITCH =
	"relative py-0 px-[var(--container-gutter)]";

export const SECTION_CONTAINER =
	"w-[min(var(--content-max),100%)] max-w-full mx-auto";

export const SECTION_HEADER =
	"max-w-[720px] mb-[clamp(2.35rem,4.5vw,3.35rem)] grid gap-[1.05rem]";

export const SECTION_HEADER_CENTERED = `${SECTION_HEADER} text-center mx-auto [&>p]:mx-auto`;

const SECTION_HEADER_DISPLAY_HEADING =
	"[&_h1]:font-[family-name:var(--font-display)] [&_h2]:font-[family-name:var(--font-display)] [&_h1]:text-[clamp(2.8rem,6.5vw,5.4rem)] [&_h1]:font-extrabold [&_h1]:tracking-[-0.035em] [&_h1]:leading-[1.05] [&_h1]:mb-4 [&_h1]:text-brand-indigo [&_h2]:text-[clamp(2.8rem,6.5vw,5.4rem)] [&_h2]:font-bold [&_h2]:tracking-[-0.035em] [&_h2]:leading-[1.05] [&_h2]:mb-4 [&_h2]:text-brand-indigo [&_p]:text-[clamp(1rem,1.6vw,1.15rem)] [&_p]:text-brand-charcoal [&_p]:leading-[1.78] [&_p]:max-w-[64ch]";

export const SECTION_HEADER_DISPLAY = `${SECTION_HEADER} ${SECTION_HEADER_DISPLAY_HEADING}`;
export const SECTION_HEADER_DISPLAY_CENTERED = `${SECTION_HEADER_CENTERED} ${SECTION_HEADER_DISPLAY_HEADING}`;

export const EYEBROW =
	"inline-flex items-center gap-[0.55rem] text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-brand-accent mb-4";

export const SECTION_EYEBROW = `${EYEBROW} before:content-[''] before:w-[7px] before:h-[7px] before:rounded-full before:bg-brand-accent before:shadow-[0_0_0_1px_rgb(var(--brand-accent-rgb)/0.35)] before:flex-shrink-0`;

export const SECTION_EYEBROW_PULSE = `${SECTION_EYEBROW} before:animate-[pulse-dot_3.5s_ease-in-out_infinite]`;

export const PAGE_EYEBROW =
	"inline-flex items-center gap-[0.55rem] text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-brand-accent mb-4";

const SURFACE_CARD_BASE =
	"relative overflow-hidden rounded-[var(--radius-card-lg)] border border-brand-border shadow-[var(--shadow-card)] [perspective:800px] transition-[transform,box-shadow,border-color] duration-[350ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_24px_48px_-28px_rgba(26,42,64,0.14)] motion-safe:hover:border-brand-indigo/25";

export const SURFACE_CARD = `surface-card ${SURFACE_CARD_BASE} bg-brand-surface`;

export const SURFACE_CARD_EDITORIAL = `surface-card ${SURFACE_CARD_BASE} bg-brand-surface border-brand-border`;

export const SURFACE_CARD_TECHNICAL = `surface-card ${SURFACE_CARD_BASE} bg-brand-surface border-brand-border shadow-[0_20px_48px_-28px_rgba(26,42,64,0.12)]`;

export const SURFACE_CARD_PROOF = `surface-card ${SURFACE_CARD_BASE} bg-brand-surface border-[rgba(34,197,94,0.28)]`;

export const CARD_HAS_TEXT_PAD =
	"p-[max(var(--card-pad),var(--radius-card-lg))]";
export const CARD_LG_TEXT_PAD =
	"p-[max(var(--card-pad-lg),var(--radius-card-lg))]";

export const PROSE_CONTAINER = "max-w-prose mx-auto";
