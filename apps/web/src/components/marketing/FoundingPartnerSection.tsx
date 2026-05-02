import Link from "next/link";
import { btnOutline, btnPrimary } from "@/design-system/buttons";
import { ATELIER_ROME_LEGACY } from "@/design-system/location";
import {
	FOUNDING_PARTNER_BUILD_SLOTS,
	FOUNDING_PARTNER_SEO_LABEL,
	FOUNDING_PARTNER_SEO_MONTHLY,
	FOUNDING_PARTNER_SHORT_COPY,
} from "@/lib/offers";

const SHELL =
	"section-shell relative pt-[clamp(3.5rem,6vw,5rem)] pb-[clamp(4.25rem,7vw,6rem)] bg-brand-linen";
const HEADER =
	"section-header centered reveal-up max-w-[40rem] mb-[clamp(2.5rem,5vw,3.75rem)] gap-[1.15rem] [&>h2]:text-[clamp(1.85rem,3.8vw,2.85rem)] [&>h2]:font-bold [&>h2]:tracking-[-0.035em] [&>h2]:leading-[1.12] [&>h2]:mb-[0.15rem] [&>h2]:text-brand-indigo [&>p]:max-w-[38rem] [&>p]:leading-[1.78] [&>p]:text-brand-charcoal [&>p]:opacity-[0.88]";
const PILLARS =
	"grid grid-cols-1 md:grid-cols-2 gap-[clamp(1.25rem,3vw,2rem)] max-w-[920px] mx-auto relative z-[1]";
const PILLAR_BASE =
	"reveal-up relative p-[clamp(1.85rem,3.5vw,2.35rem)] rounded-[var(--radius-card)] bg-brand-surface border border-brand-border shadow-[var(--shadow-soft)] transition-[border-color,box-shadow,transform] duration-[450ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:border-brand-indigo/22 hover:shadow-[0_24px_56px_-36px_rgba(26,42,64,0.14)] hover:-translate-y-0.5";
const PILLAR_ACCENT_TOP =
	"absolute top-0 left-[1.85rem] right-[1.85rem] h-[2px] rounded-[2px] bg-brand-accent pointer-events-none";
const PILLAR_ACCENT_TOP_MUTED =
	"absolute top-0 left-[1.85rem] right-[1.85rem] h-[2px] rounded-[2px] bg-brand-indigo/25 pointer-events-none";
const EYEBROW_PRIMARY =
	"text-[0.68rem] font-extrabold tracking-[0.2em] uppercase text-brand-accent mt-[0.65rem] mb-4";
const EYEBROW_SECONDARY =
	"text-[0.68rem] font-extrabold tracking-[0.2em] uppercase text-brand-charcoal/70 mt-[0.65rem] mb-4";
const PILLAR_TITLE =
	"font-[family-name:var(--font-display)] text-[clamp(1.35rem,2.4vw,1.6rem)] font-bold tracking-[-0.028em] leading-[1.2] text-brand-indigo m-0 mb-4";
const PILLAR_STAT =
	"inline-block text-[clamp(2.35rem,5vw,3.1rem)] font-extrabold tracking-[-0.045em] leading-none mb-[0.35rem] text-brand-indigo animate-[founding-stat-pop_6s_ease-in-out_infinite] motion-reduce:animate-none";
const PILLAR_PRICE =
	"block text-[clamp(2.35rem,5vw,3.1rem)] font-extrabold tracking-[-0.045em] leading-none mb-[0.35rem] text-brand-indigo";
const PILLAR_LEDE =
	"text-[0.98rem] leading-[1.75] text-brand-charcoal m-0 mb-[1.15rem] opacity-[0.88]";
const PILLAR_LIST =
	"list-none m-0 p-0 grid gap-[0.65rem] [&>li]:relative [&>li]:pl-[1.15rem] [&>li]:text-[0.92rem] [&>li]:leading-[1.55] [&>li]:text-brand-charcoal/[0.78] [&>li]:before:content-[''] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.52rem] [&>li]:before:w-[5px] [&>li]:before:h-[5px] [&>li]:before:rounded-full [&>li]:before:bg-brand-accent";
const PILLAR_LIST_GROWTH = `${PILLAR_LIST} [&>li]:before:bg-brand-indigo/40`;
const ACTIONS =
	"reveal-up flex flex-wrap justify-center gap-[0.85rem] mt-[clamp(2.25rem,4vw,3rem)] max-md:flex-col max-md:items-stretch [&>.btn]:max-md:w-full";
const NOTE =
	"reveal-up max-w-[36rem] mx-auto mt-6 text-center text-[0.8rem] leading-[1.65] text-brand-charcoal/55";

export function FoundingPartnerSection() {
	return (
		<section className={SHELL} aria-labelledby="founding-partner-heading">
			<div className="section-container relative z-[1]">
				<div className={HEADER}>
					<p className="section-eyebrow">Founding partner program</p>
					<h2 id="founding-partner-heading">
						{FOUNDING_PARTNER_BUILD_SLOTS} complimentary custom builds for early
						client partners.
					</h2>
					<p>{FOUNDING_PARTNER_SHORT_COPY}</p>
				</div>

				<div className={PILLARS}>
					<article className={PILLAR_BASE}>
						<div className={PILLAR_ACCENT_TOP} aria-hidden="true" />
						<p className={EYEBROW_PRIMARY}>Launch allocation</p>
						<h3 className={PILLAR_TITLE}>
							<span className={PILLAR_STAT} data-founding-stat>
								{FOUNDING_PARTNER_BUILD_SLOTS}
							</span>{" "}
							complimentary launch builds
						</h3>
						<p className={PILLAR_LEDE}>
							Full custom website—strategy, design, and hand-built
							performance—not a page builder skin. Reserved for businesses that
							are the right fit and ready for a higher-trust digital presence.
						</p>
						<ul className={PILLAR_LIST}>
							<li>
								Built for trust, calls, and local search—not vanity slides
							</li>
							<li>
								Mobile-first engineering with strong Lighthouse scores —{" "}
								{ATELIER_ROME_LEGACY}
							</li>
							<li>You approve everything before anything goes live</li>
						</ul>
					</article>

					<article className={PILLAR_BASE}>
						<div className={PILLAR_ACCENT_TOP_MUTED} aria-hidden="true" />
						<p className={EYEBROW_SECONDARY}>After launch</p>
						<h3 className={PILLAR_TITLE}>
							<span className={PILLAR_PRICE}>
								{FOUNDING_PARTNER_SEO_MONTHLY}
							</span>
							/mo {FOUNDING_PARTNER_SEO_LABEL}
						</h3>
						<p className={PILLAR_LEDE}>
							Ongoing visibility and care: Google Cloud hosting, security, and
							SEO—plus Google Business Profile attention, review support, and
							one meaningful growth asset each month.
						</p>
						<ul className={PILLAR_LIST_GROWTH}>
							<li>Hosting on a fast global CDN—included in the plan</li>
							<li>
								Local SEO structure maintained as Google and your market shift
							</li>
							<li>Direct line to Anthony—no tickets, no offshore handoffs</li>
						</ul>
					</article>
				</div>

				<div className={ACTIONS}>
					<Link href="/contact" className={btnPrimary}>
						Let&apos;s build something great.
					</Link>
					<Link href="/lighthouse" className={btnOutline}>
						Audit My Site
					</Link>
				</div>

				<p className={NOTE}>
					Limited to {FOUNDING_PARTNER_BUILD_SLOTS} approved partners. Fit and
					scope confirmed on a short call. Complimentary build applies when you
					enroll in the {FOUNDING_PARTNER_SEO_MONTHLY}/month{" "}
					{FOUNDING_PARTNER_SEO_LABEL}; terms reviewed before any commitment.
				</p>
			</div>
		</section>
	);
}
