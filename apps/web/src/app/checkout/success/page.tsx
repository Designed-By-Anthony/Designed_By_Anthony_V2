/**
 * /checkout/success — post-payment provisioning confirmation.
 *
 * Shown after a successful Stripe checkout. Communicates the 24-48 hour
 * bespoke brand-integration window before environment access is granted.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { btnOutline, btnPrimary } from "@/design-system/buttons";
import { BESPOKE_CONFIG_DESCRIPTION } from "@/lib/offers";
import { CheckoutTimeline } from "./CheckoutTimeline";

export const metadata: Metadata = {
  title: "Payment Received — Your Project Is Starting",
  description:
    "Your payment was received. We are setting up your project now. Expect access within 24–48 hours after we sync on your brand and business details.",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-linen px-5 py-[clamp(4rem,10vw,8rem)]">
      <div className="relative z-10 flex w-full max-w-[38rem] flex-col items-center gap-8 text-center">
        {/* Success icon */}
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-accent bg-[rgb(var(--brand-accent-rgb)/0.08)] shadow-[0_12px_36px_-16px_rgb(var(--brand-accent-rgb)/0.35)]"
          aria-hidden="true"
        >
          <svg
            className="text-brand-accent"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-3">
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.22em] text-brand-accent">
            Payment received
          </p>
          <h1 className="m-0 font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw,2.6rem)] font-bold leading-[1.12] tracking-[-0.032em] text-brand-indigo">
            Your project is being set up.
          </h1>
          <p className="m-0 text-[1rem] leading-[1.78] text-brand-charcoal/75">
            {BESPOKE_CONFIG_DESCRIPTION}
          </p>
        </div>

        {/* Timeline */}
        <CheckoutTimeline />

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          <Link href="/contact" className={btnPrimary}>
            Questions? Contact us.
          </Link>
          <Link href="/" className={btnOutline}>
            Back to Home
          </Link>
        </div>

        {/* Fine print */}
        <p className="max-w-[30rem] text-[0.74rem] leading-[1.7] text-brand-charcoal/45">
          You will receive a confirmation email shortly. If you have questions, reply to that email
          or{" "}
          <Link
            href="/contact"
            className="text-brand-accent underline underline-offset-2 transition-colors duration-150 hover:text-[var(--accent-bronze-dark)]"
          >
            contact us directly
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
