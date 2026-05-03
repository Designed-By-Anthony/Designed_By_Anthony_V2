"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { useLanguage } from "@/lib/i18n";
import { businessProfile } from "@/lib/seo";
import { SovereignDrawerForm } from "./SovereignDrawerForm";

const BODY_LOCK_CLASS = "site-contact-drawer-open";

/* ── Inline Tailwind: site-quick-rail + nav-rail (layout-shell.css) ── */

/*
 * Host wraps the tab + panel. Mobile (<1200px): bottom-sheet, slides up.
 * Desktop (>=1200px): left-edge drawer, slides in from the left.
 * Marker classes preserved for JS hooks: site-quick-rail-host,
 * site-quick-rail-host--open, site-quick-rail-host--hydrated.
 */
const HOST_BASE =
  "site-quick-rail-host block min-w-0 motion-reduce:[&_*]:!transition-none print:hidden";
const HOST_RESPONSIVE =
  "max-[1199px]:fixed max-[1199px]:inset-0 max-[1199px]:z-[88] max-[1199px]:invisible max-[1199px]:pointer-events-none max-[1199px]:[transform-origin:50%_100%] [&.site-quick-rail-host--hydrated]:max-[1199px]:visible min-[1200px]:fixed min-[1200px]:left-0 min-[1200px]:top-44 min-[1200px]:z-[88] min-[1200px]:invisible min-[1200px]:pointer-events-none min-[1200px]:[transform-origin:0%_100%] min-[1200px]:[transform:translate3d(-100%,0,0)] min-[1200px]:transition-transform min-[1200px]:duration-[280ms] min-[1200px]:[transition-timing-function:cubic-bezier(0.22,1,0.36,1)] [&.site-quick-rail-host--hydrated]:min-[1200px]:visible [&.site-quick-rail-host--open]:min-[1200px]:[transform:translate3d(0,0,0)]";
const HOST = `${HOST_BASE} ${HOST_RESPONSIVE}`;

const BACKDROP =
  "hidden max-[1199px]:fixed max-[1199px]:inset-0 max-[1199px]:block max-[1199px]:bg-[rgba(2,6,14,0.62)] max-[1199px]:backdrop-blur-[8px] max-[1199px]:[-webkit-backdrop-filter:blur(8px)] max-[1199px]:opacity-0 max-[1199px]:pointer-events-none max-[1199px]:transition-opacity max-[1199px]:duration-[280ms] max-[1199px]:[transition-timing-function:cubic-bezier(0.22,1,0.36,1)] max-[1199px]:z-0 max-[1199px]:p-0 max-[1199px]:m-0 max-[1199px]:cursor-pointer max-[1199px]:border-0 [.site-quick-rail-host--open_&]:max-[1199px]:opacity-100 [.site-quick-rail-host--open_&]:max-[1199px]:pointer-events-auto motion-reduce:transition-none";

/* Tab — slate CTA (desktop), linen bar (mobile) */
const TAB =
  "bg-transparent border-0 p-0 text-inherit cursor-pointer pointer-events-auto inline-flex items-center justify-center gap-2 max-[1199px]:fixed max-[1199px]:inset-x-0 max-[1199px]:bottom-0 max-[1199px]:z-[2] max-[1199px]:min-h-11 max-[1199px]:w-full max-[1199px]:flex-row max-[1199px]:rounded-t-[0.85rem] max-[1199px]:py-[0.55rem] max-[1199px]:px-4 max-[1199px]:[padding-bottom:calc(0.55rem+env(safe-area-inset-bottom,0px))] max-[1199px]:bg-brand-linen max-[1199px]:border max-[1199px]:border-brand-border max-[1199px]:border-b-0 max-[1199px]:shadow-[0_-8px_32px_-18px_rgba(26,42,64,0.12)] max-[1199px]:text-brand-indigo min-[1200px]:absolute min-[1200px]:right-[-2.35rem] min-[1200px]:top-4 min-[1200px]:w-[2.35rem] min-[1200px]:h-[7rem] min-[1200px]:flex-col min-[1200px]:gap-[0.3rem] min-[1200px]:rounded-l-none min-[1200px]:rounded-r-[0.75rem] min-[1200px]:bg-brand-accent min-[1200px]:border min-[1200px]:border-brand-accent min-[1200px]:border-l-0 min-[1200px]:text-brand-linen min-[1200px]:shadow-[4px_0_20px_rgba(26,42,64,0.18)]";
const TAB_CHEVRON = "shrink-0 leading-none max-[1199px]:text-base min-[1200px]:text-[0.88rem]";
const TAB_LABEL =
  "uppercase font-[720] max-[1199px]:[writing-mode:horizontal-tb] max-[1199px]:tracking-[0.18em] max-[1199px]:text-[0.68rem] min-[1200px]:[writing-mode:vertical-rl] min-[1200px]:tracking-[0.16em] min-[1200px]:text-[0.68rem] min-[1200px]:py-[0.35rem]";

const RAIL_DRAWER =
  "site-quick-rail pointer-events-auto max-[1199px]:fixed max-[1199px]:inset-x-0 max-[1199px]:[bottom:calc(3.85rem+env(safe-area-inset-bottom,0px))] max-[1199px]:z-[1] max-[1199px]:w-full max-[1199px]:max-w-screen max-[1199px]:max-h-[min(72dvh,28rem)] max-[1199px]:overflow-x-hidden max-[1199px]:overflow-y-auto max-[1199px]:[overscroll-behavior:contain] max-[1199px]:p-[0.75rem_1rem_0.25rem] max-[1199px]:rounded-t-2xl max-[1199px]:shadow-[0_-20px_50px_-24px_rgba(0,0,0,0.55)] max-[1199px]:bg-[rgba(248,249,250,0.92)] max-[1199px]:backdrop-blur-[14px] max-[1199px]:[-webkit-backdrop-filter:blur(14px)] max-[1199px]:[transform:translate3d(0,108%,0)] max-[1199px]:transition-transform max-[1199px]:duration-300 max-[1199px]:[transition-timing-function:cubic-bezier(0.22,1,0.36,1)] [.site-quick-rail-host--open_&]:max-[1199px]:[transform:translate3d(0,0,0)] min-[1200px]:relative min-[1200px]:w-[min(17.5rem,44vw)] min-[1200px]:max-h-none min-[1200px]:bg-[rgba(248,249,250,0.88)] min-[1200px]:backdrop-blur-[16px] min-[1200px]:[-webkit-backdrop-filter:blur(16px)] min-[1200px]:rounded-[1.15rem] min-[1200px]:border min-[1200px]:border-brand-border min-[1200px]:shadow-[8px_0_32px_-16px_rgba(26,42,64,0.14)] min-[1200px]:p-[0.65rem] min-[1200px]:invisible min-[1200px]:[transition:visibility_0s_linear_280ms] [.site-quick-rail-host--open_&]:min-[1200px]:visible [.site-quick-rail-host--open_&]:min-[1200px]:[transition:visibility_0s_linear_0s]";

const HEAD = "flex items-center justify-between p-[0_0_0.5rem]";
const MARK = "opacity-85";
const CLOSE_BTN =
  "bg-transparent border-0 p-0 text-inherit cursor-pointer inline-flex items-center justify-center w-11 h-11 rounded-full text-[1.2rem] text-brand-charcoal/70 bg-brand-linen border border-brand-border hover:border-brand-accent hover:text-brand-indigo";

const INNER =
  "flex flex-col gap-[0.4rem] p-[0.75rem_0.6rem] rounded-[0.95rem] border border-brand-border bg-card shadow-[0_12px_32px_-24px_rgba(26,42,64,0.14)] pointer-events-auto max-[1199px]:overflow-hidden";
const LEAD =
  "m-0 mb-1 px-[0.1rem] text-[0.66rem] font-medium tracking-[0.04em] leading-[1.4] text-brand-charcoal/70";

const RAIL_LINK =
  "flex items-start gap-2 p-[0.55rem_0.6rem] rounded-[0.75rem] no-underline text-brand-charcoal border border-brand-border bg-brand-linen transition-[border-color,background,color,transform,box-shadow] duration-[220ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] min-h-11 hover:border-brand-accent hover:bg-white hover:text-brand-indigo hover:-translate-y-px hover:shadow-[0_8px_24px_-16px_rgba(26,42,64,0.12)] focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-[rgb(var(--brand-accent-rgb)/0.45)] focus-visible:outline-offset-2";
const RAIL_TEXT = "flex flex-col gap-[0.08rem] leading-[1.2] min-w-0";
const RAIL_TEXT_TITLE =
  "text-[0.68rem] font-[650] tracking-[0.16em] uppercase font-[family-name:var(--font-display)] text-brand-indigo";
const RAIL_TEXT_SUB =
  "text-[0.66rem] font-[450] text-brand-charcoal/[0.48] tracking-[0.03em] leading-[1.35]";

/* Inline Sovereign form for the contact drawer. */
function ContactDrawerForm({ onSuccess }: { onSuccess?: () => void }) {
  return <SovereignDrawerForm onSuccess={onSuccess} sourceId="main-contact-drawer" />;
}

/**
 * Contact drawer: desktop slides in from the left (transform-origin 0% 100%);
 * narrow viewports use a bottom sheet. High-contrast panel; CSS transitions only.
 */
export function SiteContactDrawer() {
  const panelId = "site-contact-drawer-panel";
  const tabRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        tabRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (typeof document === "undefined" || !hydrated) return;
    const mq = window.matchMedia("(max-width: 1199px)");
    const sync = () => {
      if (mq.matches && open) {
        document.body.classList.add(BODY_LOCK_CLASS);
      } else {
        document.body.classList.remove(BODY_LOCK_CLASS);
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      document.body.classList.remove(BODY_LOCK_CLASS);
    };
  }, [open, hydrated]);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    tabRef.current?.focus();
  }, []);

  return (
    <div
      className={`${HOST}${open ? " site-quick-rail-host--open" : ""}${hydrated ? " site-quick-rail-host--hydrated" : ""}`}
    >
      <button
        type="button"
        className={BACKDROP}
        aria-label={t("Close contact drawer")}
        tabIndex={-1}
        aria-hidden={!open}
        onClick={close}
      />
      <button
        ref={tabRef}
        type="button"
        className={TAB}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        <span className={TAB_CHEVRON} aria-hidden="true">
          {open ? "⟨" : "⟩"}
        </span>
        <span className={TAB_LABEL}>{t("Contact")}</span>
      </button>
      <aside
        id={panelId}
        className={RAIL_DRAWER}
        role="dialog"
        aria-modal={open}
        aria-label={t("Contact form")}
        aria-hidden={!open}
        data-nav-rail
      >
        <div className={HEAD}>
          <span className={MARK} aria-hidden>
            <Logo variant="header" />
          </span>
          <button
            type="button"
            className={CLOSE_BTN}
            onClick={close}
            aria-label={t("Close contact drawer")}
          >
            ×
          </button>
        </div>
        <div className={INNER}>
          <p className={LEAD}>
            {t("Send a quick message \u2014 we reply within one business day.")}
          </p>
          <ContactDrawerForm onSuccess={close} />
          <div className="site-quick-rail__divider" />
          <a
            href={businessProfile.telephoneHref}
            className={`nav-rail-link nav-rail-link--phone ${RAIL_LINK}`}
            onClick={close}
          >
            <span className={RAIL_TEXT}>
              <strong className={RAIL_TEXT_TITLE}>{t("Or call now")}</strong>
              <span className={RAIL_TEXT_SUB}>{businessProfile.telephone.replace("+1-", "")}</span>
            </span>
          </a>
        </div>
      </aside>
    </div>
  );
}
