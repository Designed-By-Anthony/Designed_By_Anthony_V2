"use client";

import { useState, useId } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { btnPrimaryAudit } from "@/design-system/buttons";
import { CARD_HAS_TEXT_PAD, SURFACE_CARD_FROST } from "@/design-system/sections";
import { businessProfile } from "@/lib/seo";
import { buildPublicApiUrl } from "@/lib/publicApi";
import { resolveEffectiveSiteKey } from "@/lib/turnstile";
import { normalizeWebsiteForApi } from "@/lib/websiteNormalize";

export interface LighthouseAuditFormProps {
  sourceId?: string;
  ctaSource?: string;
  pageContext?: string;
  submitLabel?: string;
  websiteLabel?: string;
  websitePlaceholder?: string;
  issueLabel?: string;
  issuePlaceholder?: string;
  showPhoneField?: boolean;
  issueRows?: number;
  metaMessage?: string;
}

const FORM =
	"grid gap-[1.1rem] relative [&_input]:w-full [&_textarea]:w-full [&_input]:py-[0.95rem] [&_input]:px-4 [&_textarea]:py-[0.95rem] [&_textarea]:px-4 [&_input]:rounded-2xl [&_textarea]:rounded-2xl [&_input]:border [&_input]:border-[rgba(226,232,240,0.5)] [&_textarea]:border [&_textarea]:border-[rgba(226,232,240,0.5)] [&_input]:bg-white [&_textarea]:bg-white [&_input]:text-[var(--brand-charcoal)] [&_textarea]:text-[var(--brand-charcoal)] [&_input]:font-[inherit] [&_textarea]:font-[inherit] [&_input]:transition-[border-color,box-shadow,transform] [&_textarea]:transition-[border-color,box-shadow,transform] [&_input]:duration-[250ms] [&_textarea]:duration-[250ms] [&_input::placeholder]:text-brand-charcoal/[0.34] [&_textarea::placeholder]:text-brand-charcoal/[0.34] [&_input:focus]:outline-none [&_textarea:focus]:outline-none [&_input:focus]:border-[rgb(var(--brand-accent-rgb)/0.78)] [&_textarea:focus]:border-[rgb(var(--brand-accent-rgb)/0.78)] [&_input:focus]:shadow-[0_0_0_3px_rgb(var(--brand-accent-rgb)/0.28),0_0_12px_rgb(var(--brand-accent-rgb)/0.18)] [&_textarea:focus]:shadow-[0_0_0_3px_rgb(var(--brand-accent-rgb)/0.28),0_0_12px_rgb(var(--brand-accent-rgb)/0.18)] [&_input:focus]:-translate-y-px [&_textarea:focus]:-translate-y-px [&_textarea]:resize-y [&_textarea]:min-h-[140px] [&_label]:flex [&_label]:items-center [&_label]:justify-between [&_label]:gap-3 [&_label]:text-[0.84rem] [&_label]:font-bold [&_label]:text-brand-charcoal/[0.86] [&_label]:tracking-[0.01em] [&_[aria-invalid='true']]:border-[rgba(248,113,113,0.8)] [&_[aria-invalid='true']]:shadow-[0_0_0_4px_rgba(248,113,113,0.14)]";
const FORM_GRID = "grid grid-cols-1 sm:grid-cols-2 gap-4";
const FIELD = "grid gap-[0.45rem]";
const FIELD_FULL = `${FIELD} col-span-full`;
const FIELD_HINT = "min-h-[1.2rem] text-[0.84rem] text-[#fca5a5] m-0";
const ACTIONS = "grid gap-[0.8rem]";
const META =
	"min-h-[1.2rem] text-[0.84rem] text-[#fca5a5] m-0 mt-[-0.15rem] text-brand-charcoal/54 leading-[1.65]";
const PRIVACY =
	"text-brand-charcoal/[0.46] text-[0.8rem] leading-[1.55] m-0 [&_a]:text-brand-accent [&_a:hover]:text-[var(--accent-bronze-dark)]";
const STATUS = "min-h-[1.2rem] text-[0.84rem] text-[#fca5a5] m-0 mt-[-0.15rem]";
const SUBMIT_BTN = btnPrimaryAudit;

export function LighthouseAuditForm({
  sourceId,
  ctaSource = "marketing",
  pageContext = "unknown",
  submitLabel = "Run audit",
  websiteLabel = "Website URL",
  websitePlaceholder = "https://example.com",
  issueLabel = "What should we know?",
  issuePlaceholder = "Goals, timeline, or anything else helpful.",
  showPhoneField = false,
  issueRows = 4,
  metaMessage = "Protected against spam. We only use this info to review your site.",
}: LighthouseAuditFormProps) {
  const formId = useId();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const siteKey = resolveEffectiveSiteKey(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const turnstileRequired = !!siteKey;
  const isDisabled = turnstileRequired && !turnstileToken;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData(e.currentTarget);
    const websiteRaw = formData.get("website") as string;
    const data = {
      email: formData.get("email") as string,
      first_name: formData.get("first_name") as string,
      website: normalizeWebsiteForApi(websiteRaw),
      biggest_issue: formData.get("biggest_issue") as string,
      phone: formData.get("phone") as string | null,
      cta_source: ctaSource,
      page_context: pageContext,
      sourceId: sourceId,
    };

    try {
      const response = await fetch(buildPublicApiUrl("/leads"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          company: data.first_name,
          website: data.website,
          sourceId: data.sourceId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setSubmitSuccess(true);
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitError("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className={`${SURFACE_CARD_FROST} ${CARD_HAS_TEXT_PAD}`}>
        <div className="py-2 text-center">
          <p className={STATUS}>Thanks — we received your audit request.</p>
          <p className={PRIVACY}>
            Questions?{" "}
            <a href={`mailto:${businessProfile.email}`}>
              {businessProfile.email}
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${SURFACE_CARD_FROST} ${CARD_HAS_TEXT_PAD}`}>
    <form
      onSubmit={handleSubmit}
      className={FORM}
      noValidate
      data-audit-form
    >
      <div data-form-shell>
        <div className={FORM_GRID}>
          <div className={FIELD}>
            <label htmlFor={`${formId}-first`}>First name</label>
            <input
              id={`${formId}-first`}
              name="first_name"
              type="text"
              autoComplete="given-name"
              required
            />
            <p className={FIELD_HINT} data-field-error="first_name" />
          </div>
          <div className={FIELD}>
            <label htmlFor={`${formId}-email`}>Email</label>
            <input
              id={`${formId}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <p className={FIELD_HINT} data-field-error="email" />
          </div>
          <div className={FIELD_FULL}>
            <label htmlFor={`${formId}-site`}>{websiteLabel}</label>
            <input
              id={`${formId}-site`}
              name="website"
              type="url"
              inputMode="url"
              placeholder={websitePlaceholder}
              required
            />
            <p className={FIELD_HINT} data-field-error="website" />
          </div>
          {showPhoneField ? (
            <div className={FIELD}>
              <label htmlFor={`${formId}-phone`}>Phone (optional)</label>
              <input
                id={`${formId}-phone`}
                name="phone"
                type="tel"
                autoComplete="tel"
              />
              <p className={FIELD_HINT} data-field-error="phone" />
            </div>
          ) : null}
          <div className={FIELD_FULL}>
            <label htmlFor={`${formId}-issue`}>{issueLabel}</label>
            <textarea
              id={`${formId}-issue`}
              name="biggest_issue"
              rows={issueRows}
              placeholder={issuePlaceholder}
              required
            />
            <p className={FIELD_HINT} data-field-error="biggest_issue" />
          </div>
        </div>

        <p className={META} data-form-error hidden />
        <div className={ACTIONS}>
          {turnstileRequired && (
            <div className="flex flex-col items-center gap-2 py-4">
              <Turnstile
                siteKey={siteKey}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
                options={{ theme: "light", size: "flexible" }}
              />
              <p className="text-[0.7rem] font-bold uppercase tracking-widest text-brand-charcoal/30">
                Security check required to proceed
              </p>
            </div>
          )}
          <button
            type="submit"
            className={SUBMIT_BTN}
            data-form-submit
            disabled={isDisabled || isSubmitting}
            aria-disabled={isDisabled || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : submitLabel}
          </button>
        </div>
        <p className={PRIVACY}>{metaMessage}</p>
        {submitError && (
          <p className="mt-3 text-sm text-red-400">{submitError}</p>
        )}
      </div>
    </form>
    </div>
  );
}
