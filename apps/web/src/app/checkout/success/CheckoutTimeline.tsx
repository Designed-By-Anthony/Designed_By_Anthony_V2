"use client";

/**
 * Four-step provisioning timeline shown on the /checkout/success page.
 *
 * Steps:
 *  1. Payment Received   — completed (solid slate accent)
 *  2. Design Meeting     — pending   (muted)
 *  3. Brand Integration  — in progress (shimmer animation at 0.05 opacity)
 *  4. Production Launch  — 48h       (muted)
 *
 * Intentionally keeps framer-motion out of this component — uses only
 * CSS animations so the page stays fast and doesn't pull in the
 * animation bundle just for a success state.
 */

const STEPS = [
  {
    id: "payment",
    label: "Payment Received",
    sub: "Confirmed",
    state: "done",
  },
  {
    id: "meeting",
    label: "Design Meeting",
    sub: "Schedule via email",
    state: "pending",
  },
  {
    id: "brand",
    label: "Brand Integration",
    sub: "Post design sync — ANTHONY. standard",
    state: "active",
  },
  {
    id: "launch",
    label: "Production Launch",
    sub: "~48h post design sync",
    state: "pending",
  },
] as const;

type StepState = "done" | "active" | "pending";

function stepDotClass(state: StepState): string {
  if (state === "done")
    return "h-3 w-3 rounded-full bg-brand-accent shadow-[0_0_10px_2px_rgb(var(--brand-accent-rgb)/0.35)]";
  if (state === "active")
    return "h-3 w-3 rounded-full border-2 border-brand-accent bg-[rgb(var(--brand-accent-rgb)/0.12)]";
  return "h-3 w-3 rounded-full border border-brand-border bg-transparent";
}

function stepLabelClass(state: StepState): string {
  if (state === "done") return "font-semibold text-brand-indigo";
  if (state === "active") return "font-semibold text-brand-accent";
  return "text-brand-charcoal/45";
}

function stepSubClass(state: StepState): string {
  if (state === "done") return "text-brand-charcoal/65";
  if (state === "active") return "text-brand-charcoal/55";
  return "text-brand-charcoal/35";
}

export function CheckoutTimeline() {
  return (
    <ul
      className="w-full text-bubble is-bordered flex flex-col gap-0 list-none p-0 m-0"
      aria-label="Provisioning steps"
    >
      {STEPS.map((step, i) => {
        const isLast = i === STEPS.length - 1;
        const isActive = step.state === "active";
        return (
          <li key={step.id} className="relative flex gap-4">
            {/* Vertical connector line */}
            <div className="flex flex-col items-center shrink-0">
              <div className="mt-[1.1rem]">{/* top spacing to centre dot */}</div>
              <div className={stepDotClass(step.state)} />
              {!isLast && <div className="mb-0 mt-1 min-h-[2rem] w-px flex-1 bg-brand-border" />}
            </div>

            {/* Content */}
            <div className={`relative pb-5 flex-1 overflow-hidden ${isActive ? "rounded-md" : ""}`}>
              {/* Shimmer overlay on the "In Progress" step (0.05 opacity — Atelier feel) */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 animate-pulse rounded-md bg-[rgb(var(--brand-accent-rgb)/0.06)]"
                />
              )}
              <p
                className={`text-[0.9rem] leading-snug m-0 mt-[0.55rem] ${stepLabelClass(step.state)}`}
              >
                {step.label}
              </p>
              <p
                className={`text-[0.74rem] leading-snug m-0 mt-[0.2rem] ${stepSubClass(step.state)}`}
              >
                {step.sub}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
