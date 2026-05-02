/**
 * Tailwind v4 button class constants — permanent light UI.
 * Slate accent (#5B7C99), linen button text (#F8F9FA).
 */

const slateBtn =
	"btn relative inline-flex items-center justify-center gap-[0.45rem] px-[1.8rem] py-[0.96rem] rounded-full overflow-hidden cursor-pointer no-underline font-[family-name:var(--font-inter)] font-semibold text-[0.95rem] tracking-normal leading-none text-[#F8F9FA] bg-[#5B7C99] border border-transparent shadow-[0_8px_30px_rgb(26,42,64,0.04)] transition-[transform,box-shadow,background-color,border-color] duration-[300ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:bg-[#1A2A40] hover:shadow-[0_10px_34px_-20px_rgba(26,42,64,0.12)] active:scale-[0.98] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgba(91,124,153,0.45)] focus-visible:outline-offset-[3px] disabled:opacity-[0.72] disabled:cursor-not-allowed";

export const btnChrome = slateBtn;

export const btnPrimarySans =
	"font-[family-name:var(--font-inter)] uppercase tracking-widest text-[0.82rem]";

export const btnUiSans =
	"font-[family-name:var(--font-inter)] font-medium tracking-normal text-[0.95rem]";

export const btnSerif =
	"font-[family-name:var(--font-playfair)] text-[0.95rem] tracking-[0.01em]";

export const btnBase = `${btnChrome} ${btnUiSans}`;

export const btnPrimary = slateBtn;

export const btnPrimaryBook = `${slateBtn} motion-safe:animate-none`;

export const btnPrimaryAudit = `${slateBtn} [&.audit-submit-success]:!bg-[#15803d] [&.audit-submit-success]:!opacity-100 [&.audit-submit-success]:!cursor-default disabled:cursor-wait`;

export const btnSecondaryProof = `${btnBase} !bg-brand-surface !text-brand-charcoal border-brand-border shadow-[0_8px_24px_-16px_rgba(26,42,64,0.12)] hover:!bg-brand-linen hover:border-brand-indigo/25`;

export const btnOutline = `${btnBase} !bg-transparent !text-brand-charcoal border border-brand-indigo/20 shadow-none hover:!bg-brand-linen hover:border-brand-indigo/35`;

export const btnSecondary = `${btnBase} !bg-transparent !text-brand-charcoal border border-brand-indigo/15 shadow-none hover:!bg-brand-surface`;

export const btnWhite = `${btnBase} !bg-brand-surface !text-brand-indigo border-brand-border shadow-[0_8px_24px_-16px_rgba(26,42,64,0.1)] hover:!bg-brand-linen`;

export const btnSm = "!px-[1.2rem] !py-[0.65rem] !text-[0.82rem]";

export const stackBadge =
	"inline-flex items-center px-[0.52rem] py-[0.18rem] rounded-full border border-brand-border bg-brand-linen text-[0.62rem] font-medium tracking-[0.01em] text-brand-charcoal/70 no-underline whitespace-nowrap transition-[color,border-color,background-color] duration-[180ms] ease-in hover:text-brand-indigo hover:border-brand-indigo/25 hover:bg-brand-surface";
