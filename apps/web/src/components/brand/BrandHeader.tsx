import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import {
	SITE_AUDIT_CTA,
	SITE_BANNER,
	SITE_BRAND,
	SITE_CONTACT_LINK,
	SITE_HEADER_NAV_LINKS,
	SITE_WORDMARK_ALT,
} from "@/design-system/site-config";

export type BrandHeaderProps = {
	currentSection?: "audit";
	includeHamburger?: boolean;
};

const navAuditCtaTypography =
	"font-[family-name:var(--font-inter)] font-semibold uppercase tracking-widest text-[0.68rem]";

const navCtaBase = `inline-flex items-center gap-[0.4rem] rounded-[0.6rem] border border-transparent bg-brand-accent ${navAuditCtaTypography} text-brand-linen no-underline shadow-[0_8px_22px_-10px_rgba(91,124,153,0.35)] transition-[transform,box-shadow,background-color] duration-[200ms] ease-in whitespace-nowrap hover:-translate-y-px hover:bg-[#4a6278] hover:shadow-[0_12px_28px_-10px_rgba(91,124,153,0.32)]`;

const auditCurrentChip = `inline-flex items-center gap-[0.45rem] px-3 py-[0.35rem] rounded-full border border-brand-border bg-brand-linen ${navAuditCtaTypography} text-brand-indigo whitespace-nowrap`;

const bannerDot =
	"inline-block w-[0.4rem] h-[0.4rem] rounded-full shrink-0 bg-brand-accent animate-[atelier-bronze-dot-pulse_2.4s_ease-in-out_infinite]";

export function BrandHeader({
	currentSection,
	includeHamburger = true,
}: BrandHeaderProps) {
	const isAudit = currentSection === "audit";

	return (
		<>
			<aside
				className="relative z-[4] bg-brand-surface border-b border-brand-border"
				aria-label="Site notice"
			>
				<Link
					href={isAudit ? SITE_BRAND.homeHref : SITE_BANNER.href}
					className="site-banner-link flex items-center justify-center gap-[0.6rem] px-4 py-[0.55rem] text-[0.7rem] font-[family-name:var(--font-inter)] font-normal tracking-[0.03em] text-brand-charcoal/85 no-underline transition-colors duration-[180ms] ease-in hover:text-brand-indigo max-[36rem]:text-[0.65rem] max-[36rem]:px-3 max-[36rem]:py-[0.5rem]"
				>
					<span className={bannerDot} aria-hidden />
					<span>
						<span className="text-brand-charcoal">{SITE_BANNER.label}</span>
						<span className="text-brand-charcoal/35 mx-[0.05em]" aria-hidden>
							{" — "}
						</span>
						<span className="italic text-brand-charcoal/65 max-[36rem]:hidden">
							{isAudit ? SITE_BANNER.currentCta : `${SITE_BANNER.cta} →`}
						</span>
					</span>
				</Link>
			</aside>

			<header className="relative z-[3] bg-brand-background border-b border-brand-border pl-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))]">
				<div className="flex items-center justify-between gap-6 max-w-[80rem] mx-auto pt-8 pb-4">
					<Link
						href={SITE_BRAND.homeHref}
						className="inline-flex items-center min-w-0 shrink group"
						aria-label={SITE_WORDMARK_ALT}
					>
						<Logo
							variant="header"
							className="opacity-[0.96] transition-opacity duration-200 group-hover:opacity-100"
						/>
					</Link>

					<nav
						className="hidden min-[960px]:flex items-center gap-5"
						aria-label="Main navigation"
					>
						{SITE_HEADER_NAV_LINKS.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="text-[0.82rem] font-medium text-brand-charcoal/75 no-underline transition-colors duration-[180ms] ease-in tracking-[-0.005em] whitespace-nowrap hover:text-brand-indigo"
							>
								{link.label}
							</Link>
						))}
						<Link
							href={SITE_CONTACT_LINK.href}
							className="nav-contact-link text-[0.82rem] font-medium text-brand-charcoal/75 no-underline transition-colors duration-[180ms] ease-in tracking-[-0.005em] whitespace-nowrap hover:text-brand-indigo"
						>
							{SITE_CONTACT_LINK.label}
						</Link>
						{isAudit ? (
							<span className={auditCurrentChip} aria-current="page">
								<span
									className="inline-block w-[0.35rem] h-[0.35rem] rounded-full bg-[#15803d] shadow-[0_0_6px_1px_rgba(21,128,61,0.35)] animate-[dba-pulse-dot_2s_ease-in-out_infinite]"
									aria-hidden
								/>
								{SITE_AUDIT_CTA.shortLabel}
							</span>
						) : (
							<Link
								href={SITE_AUDIT_CTA.href}
								className={`${navCtaBase} px-[1rem] py-[0.5rem]`}
								id="nav-audit-btn"
							>
								{SITE_AUDIT_CTA.shortLabel}
							</Link>
						)}
					</nav>

					<div className="flex min-[960px]:hidden items-center gap-[0.6rem]">
						{isAudit ? (
							<span className={auditCurrentChip} aria-current="page">
								<span
									className="inline-block w-[0.35rem] h-[0.35rem] rounded-full bg-[#15803d] shadow-[0_0_6px_1px_rgba(21,128,61,0.35)] animate-[dba-pulse-dot_2s_ease-in-out_infinite]"
									aria-hidden
								/>
								{SITE_AUDIT_CTA.shortLabel}
							</span>
						) : (
							<Link
								href={SITE_AUDIT_CTA.href}
								className={`${navCtaBase} px-[0.75rem] py-[0.38rem]`}
							>
								{SITE_AUDIT_CTA.shortLabel}
							</Link>
						)}
						{includeHamburger ? (
							<button
								className="hamburger inline-flex flex-col justify-center gap-[0.28rem] w-[2.4rem] h-[2.4rem] px-[0.55rem] bg-brand-linen border border-brand-border rounded-[0.5rem] cursor-pointer transition-[background,border-color] duration-[180ms] ease-in hover:bg-brand-surface hover:border-brand-indigo/20 aria-expanded:bg-brand-surface [&.active>span:nth-child(1)]:[transform:translate(0,0.4rem)_rotate(45deg)] [&.active>span:nth-child(2)]:opacity-0 [&.active>span:nth-child(3)]:[transform:translate(0,-0.4rem)_rotate(-45deg)]"
								id="hamburger-btn"
								type="button"
								aria-label="Open navigation menu"
								aria-controls="mobile-nav"
								aria-expanded="false"
							>
								<span className="block h-[1.5px] w-full bg-brand-indigo/75 rounded-[1px] transition-transform duration-[200ms] ease-in" />
								<span className="block h-[1.5px] w-full bg-brand-indigo/75 rounded-[1px] transition-[opacity,transform] duration-[200ms] ease-in" />
								<span className="block h-[1.5px] w-full bg-brand-indigo/75 rounded-[1px] transition-transform duration-[200ms] ease-in" />
							</button>
						) : null}
					</div>
				</div>

				<div className="h-px bg-brand-border" aria-hidden />
			</header>
		</>
	);
}
