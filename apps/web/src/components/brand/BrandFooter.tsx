import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { stackBadge } from "@/design-system/buttons";
import { FOOTER_LOCATION_TAGLINE } from "@/design-system/location";
import {
  SITE_BRAND,
  SITE_FOOTER_LINKS,
  SITE_LEGAL_LINKS,
  SITE_WORDMARK_ALT,
} from "@/design-system/site-config";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { T } from "./TranslatedText";

const BUILT_WITH = [
  { label: "Next.js", href: "https://nextjs.org" },
  { label: "React 19", href: "https://react.dev" },
  { label: "Tailwind v4", href: "https://tailwindcss.com" },
  { label: "Cloudflare Pages", href: "https://pages.cloudflare.com" },
  { label: "Cloudflare Workers", href: "https://workers.cloudflare.com" },
] as const;

export type BrandFooterProps = {
  buildTag?: string;
  poweredBy?: ReadonlyArray<{ label: string; href: string }>;
};

export function BrandFooter({ buildTag, poweredBy }: BrandFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-[1] mt-[clamp(2.5rem,5vw,4rem)] bg-brand-linen pl-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))]">
      <div className="h-px bg-brand-border" aria-hidden />

      <div className="max-w-[80rem] mx-auto py-5 pb-[1.1rem]">
        <div className="flex items-center flex-wrap gap-x-6 gap-y-3">
          <Link
            href={SITE_BRAND.homeHref}
            className="inline-flex items-center shrink-0 min-w-0"
            aria-label={SITE_WORDMARK_ALT}
          >
            <Logo
              variant="footer"
              className="opacity-90 transition-opacity duration-200 hover:opacity-100"
            />
          </Link>

          <nav className="flex flex-row flex-wrap gap-x-4 gap-y-1" aria-label="Footer navigation">
            {SITE_FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.78rem] text-brand-charcoal/55 no-underline transition-colors duration-[180ms] ease-in whitespace-nowrap hover:text-brand-indigo"
              >
                <T k={link.label} />
              </Link>
            ))}
          </nav>

          {/* Language switcher */}
          <LanguageSwitcher />

          {/* Legal + copyright */}
          <div className="ml-auto flex flex-wrap items-center gap-x-[0.55rem] gap-y-[0.35rem] text-[0.7rem] text-brand-charcoal/45 max-sm:ml-0">
            <p className="m-0 max-w-[min(52rem,92vw)] leading-snug text-brand-charcoal/55 max-sm:max-w-none">
              © {year}{" "}
              <span className="text-brand-charcoal/70">
                {SITE_BRAND.displayNameShort}
                <span className="text-brand-accent">.</span>
                {" | "}
                {FOOTER_LOCATION_TAGLINE}
              </span>
            </p>
            {SITE_LEGAL_LINKS.map((link) => (
              <span key={link.href} className="inline-flex items-center gap-[0.55rem]">
                <span className="text-brand-charcoal/25" aria-hidden>
                  ·
                </span>
                <Link
                  href={link.href}
                  className="text-brand-charcoal/55 no-underline transition-colors duration-[180ms] ease-in hover:text-brand-indigo"
                >
                  <T k={link.label} />
                </Link>
              </span>
            ))}
            {buildTag ? (
              <span className="inline-flex items-center gap-[0.55rem]">
                <span className="text-brand-charcoal/25" aria-hidden>
                  ·
                </span>
                <span className="font-mono text-[0.66rem] tracking-[0.06em] text-brand-accent/70">
                  {buildTag}
                </span>
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-[0.65rem] flex flex-wrap items-center gap-x-2 gap-y-[0.35rem] border-t border-brand-border pt-[0.7rem]">
          <span className="mr-[0.15rem] shrink-0 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-brand-charcoal/40">
            Built with
          </span>
          {BUILT_WITH.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={stackBadge}
              target="_blank"
              rel="noopener noreferrer"
            >
              {label}
            </a>
          ))}
        </div>

        {poweredBy?.length ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-[0.35rem] pt-[0.7rem] border-t border-[rgba(255,255,255,0.06)] mt-[0.65rem]">
            <span className="text-[0.6rem] font-semibold tracking-[0.12em] uppercase text-[rgba(247,244,238,0.28)] mr-[0.15rem] shrink-0">
              Powered by
            </span>
            {poweredBy.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className={stackBadge}
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
