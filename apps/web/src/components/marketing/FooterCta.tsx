import Link from "next/link";
import { btnPrimary } from "@/design-system/buttons";
import { SURFACE_CARD_FROST } from "@/design-system/sections";

export interface FooterCtaProps {
	eyebrow: string;
	title: string;
	description: string;
	primaryHref: string;
	primaryLabel: string;
	secondaryHref?: string;
	secondaryLabel?: string;
	note?: string;
}

const CARD = `${SURFACE_CARD_FROST} reveal-up p-[clamp(2rem,4vw,2.8rem)] max-md:p-[1.8rem_1.25rem] text-left grid grid-cols-1 md:[grid-template-columns:minmax(0,1.2fr)_minmax(240px,0.8fr)] gap-[clamp(1.2rem,2.6vw,2rem)] items-center max-md:text-center [&>div>h2]:font-[family-name:var(--font-playfair)] [&>div>h2]:text-[clamp(1.95rem,4vw,3rem)] [&>div>h2]:font-black [&>div>h2]:tracking-[-0.045em] [&>div>h2]:leading-[1.06] [&>div>h2]:text-brand-indigo [&>div>h2]:mb-[0.95rem] [&>div>p]:text-brand-charcoal [&>div>p]:text-[clamp(1rem,1.7vw,1.08rem)] [&>div>p]:leading-[1.72] [&>div>p]:opacity-[0.85] [&>div>p]:m-0 max-md:[&>div>p]:mx-auto`;
const COPY = "max-w-[760px]";
const NOTE = "!mt-[0.9rem] text-brand-charcoal/70 !text-[0.95rem]";
const ACTIONS =
	"hero-actions flex flex-col items-stretch justify-end gap-[0.85rem] mt-0 max-md:mt-[1.35rem] [&>.btn]:max-md:w-full";

/** Deep Indigo + underline that grows on hover */
const SECONDARY_LINK =
	"relative inline-flex justify-center text-center font-[family-name:var(--font-inter)] text-[0.95rem] font-semibold text-[#1A2A40] no-underline py-1 max-md:w-full after:pointer-events-none after:absolute after:left-0 after:right-0 after:bottom-[2px] after:h-px after:bg-[#1A2A40] after:origin-left after:scale-x-0 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:scale-x-100";

export function FooterCta({
	eyebrow,
	title,
	description,
	primaryHref,
	primaryLabel,
	secondaryHref,
	secondaryLabel,
	note,
}: FooterCtaProps) {
	const primaryIsCalendly = primaryHref.includes("calendly.com");
	const secondaryIsExternal = Boolean(secondaryHref?.startsWith("http"));
	const secondaryIsCalendly = Boolean(secondaryHref?.includes("calendly.com"));

	return (
		<section className="section-shell section-shell--proof pt-0">
			<div className="section-container">
				<div className={CARD}>
					<div className={COPY}>
						<p className="section-eyebrow section-eyebrow--pulse !tracking-[0.32em]">
							{eyebrow}
						</p>
						<h2>{title}</h2>
						<p>{description}</p>
						{note && <p className={NOTE}>{note}</p>}
					</div>

					<div className={ACTIONS}>
						{primaryHref.startsWith("/") ? (
							<Link href={primaryHref} className={btnPrimary}>
								{primaryLabel}
							</Link>
						) : (
							<a
								href={primaryHref}
								className={btnPrimary}
								{...(primaryIsCalendly ? { "data-calendar-link": true } : {})}
							>
								{primaryLabel}
							</a>
						)}
						{secondaryHref &&
							secondaryLabel &&
							(secondaryHref.startsWith("/") ? (
								<Link href={secondaryHref} className={SECONDARY_LINK}>
									{secondaryLabel}
								</Link>
							) : (
								<a
									href={secondaryHref}
									className={SECONDARY_LINK}
									target={
										secondaryIsExternal && !secondaryIsCalendly
											? "_blank"
											: undefined
									}
									rel={
										secondaryIsExternal && !secondaryIsCalendly
											? "noopener noreferrer"
											: undefined
									}
									{...(secondaryIsCalendly
										? { "data-calendar-link": true }
										: {})}
								>
									{secondaryLabel}
									{secondaryIsExternal && !secondaryIsCalendly && (
										<span className="sr-only"> (opens in new window)</span>
									)}
								</a>
							))}
					</div>
				</div>
			</div>
		</section>
	);
}
