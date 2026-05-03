"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "dba_first_visit_shown_v1";

export function FirstVisitSplash() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const COOKIE_KEY = "dba_cookie_consent";

        function safeLocalGet(key: string): string | null {
            try { return localStorage.getItem(key); } catch { return null; }
        }

        function tryShow(): (() => void) | undefined {
            const hasShown = safeLocalGet(STORAGE_KEY);
            if (!hasShown) {
                const t = setTimeout(() => setIsOpen(true), 800);
                return () => clearTimeout(t);
            }
        }

        const cookieStored = safeLocalGet(COOKIE_KEY);
        const cookieResolved = cookieStored === "accepted" || cookieStored === "rejected";

        if (cookieResolved) {
            return tryShow();
        }

        let cleanup: (() => void) | undefined;
        const handler = () => { cleanup = tryShow(); };
        window.addEventListener("dba:cookie-resolved", handler, { once: true });
        return () => {
            window.removeEventListener("dba:cookie-resolved", handler);
            cleanup?.();
        };
    }, []);

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setIsOpen(false);
    };

    const handleContactClick = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        // Track the CTA
        if (typeof window !== "undefined") {
            const w = window as unknown as { dataLayer?: unknown[] };
            w.dataLayer?.push({
                event: "first_visit_splash_contact",
                cta_source: "first_visit_splash",
            });
        }
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 transform-gpu">
            {/* Backdrop */}
            <button
                type="button"
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={handleClose}
                aria-label="Close splash"
            />

            {/* Modal — on-brand cream surface, matches the rest of the marketing site. */}
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[rgba(26,42,64,0.1)] bg-[rgba(255,255,255,0.96)] p-8 md:p-10 shadow-[0_32px_80px_-32px_rgba(26,42,64,0.35)]">
                {/* Close Button — inline override of the dark splash-close-btn defaults */}
                <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close"
                    className="absolute top-5 right-5 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(26,42,64,0.12)] bg-white text-brand-charcoal/60 transition-[background-color,color,transform,border-color] duration-200 hover:scale-105 hover:border-[rgba(26,42,64,0.22)] hover:bg-white hover:text-brand-charcoal"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[1.1rem] w-[1.1rem]">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                </button>

                <div className="mb-4">
                    <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[rgb(var(--accent-bronze-rgb)/0.9)]">
                        New: Micro SaaS Division
                    </p>
                    <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-medium tracking-[-0.035em] leading-[1.1] text-brand-charcoal">
                        Bespoke web apps & automations.
                    </h2>
                </div>

                <p className="mb-8 text-[0.95rem] leading-relaxed text-brand-charcoal/75">
                    From custom CRMs to complex API integrations—if your business needs it to scale, we can build it. 
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/contact"
                        onClick={handleContactClick}
                        className="btn-premium-primary flex-1 sm:flex-none"
                    >
                        Contact us →
                    </Link>
                    
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 sm:flex-none rounded-xl border border-[rgba(26,42,64,0.15)] bg-white px-6 py-2.5 text-[0.95rem] font-medium text-brand-charcoal/80 transition-colors hover:border-brand-accent/40 hover:text-brand-charcoal"
                    >
                        Explore the site
                    </button>
                </div>
            </div>
        </div>
    );
}