"use client";

import { useId, useRef, useState } from "react";
import { btnPrimary, btnSm } from "@/design-system/buttons";
import { useLanguage } from "@/lib/i18n";
import { descriptionAlreadyHasRegionPrefix, regionTagFromPhone } from "@/lib/leadRegion";
import { buildPublicApiUrl } from "@/lib/publicApi";
import { normalizeWebsiteForApi } from "@/lib/websiteNormalize";

/* ── Phase 5: salesforce-form-* classes migrated to inline Tailwind ── */
const SF_DRAWER_FORM = "block";
const SF_DRAWER_GRID =
  "grid grid-cols-2 max-[480px]:grid-cols-1 gap-x-4 gap-y-3 max-[480px]:gap-[0.6rem] mb-4";
const SF_DRAWER_FIELD =
  "flex flex-col gap-[0.4rem] [&>label]:text-[0.8rem] [&>label]:font-semibold [&>label]:text-[var(--text-cream)] [&>label]:uppercase [&>label]:tracking-[0.08em] [&_input]:w-full [&_textarea]:w-full [&_input]:min-w-0 [&_textarea]:min-w-0 [&_input]:px-[0.85rem] [&_textarea]:px-[0.85rem] [&_input]:py-[0.6rem] [&_textarea]:py-[0.6rem] [&_input]:rounded-[0.65rem] [&_textarea]:rounded-[0.65rem] [&_input]:border [&_textarea]:border [&_input]:border-[rgb(var(--accent-bronze-rgb)/0.32)] [&_textarea]:border-[rgb(var(--accent-bronze-rgb)/0.32)] [&_input]:bg-white [&_textarea]:bg-white [&_input]:text-brand-charcoal [&_textarea]:text-brand-charcoal [&_input]:[caret-color:rgb(var(--accent-bronze-rgb)/0.95)] [&_input]:text-[0.9rem] [&_textarea]:text-[0.9rem] [&_input]:font-[inherit] [&_textarea]:font-[inherit] [&_input]:transition-[border-color,box-shadow,background-color] [&_textarea]:transition-[border-color,box-shadow,background-color] [&_input]:duration-200 [&_textarea]:duration-200 [&_input:focus]:outline-none [&_textarea:focus]:outline-none [&_input:focus]:border-[rgb(var(--accent-bronze-rgb)/0.7)] [&_textarea:focus]:border-[rgb(var(--accent-bronze-rgb)/0.7)] [&_input:focus]:bg-[rgba(10,14,22,0.92)] [&_textarea:focus]:bg-[rgba(10,14,22,0.92)] [&_input:focus]:shadow-[0_0_0_3px_rgb(var(--accent-bronze-rgb)/0.18)] [&_textarea:focus]:shadow-[0_0_0_3px_rgb(var(--accent-bronze-rgb)/0.18)] [&_input::placeholder]:text-brand-charcoal/[0.42] [&_textarea::placeholder]:text-brand-charcoal/[0.42]";
const SF_DRAWER_FIELD_FULL = "col-span-full";
const SF_DRAWER_ACTIONS =
  "flex justify-start max-[600px]:justify-center mt-4 [&>button]:max-[600px]:w-full [&>button]:max-[600px]:min-h-11";

/**
 * Sovereign Drawer Form. Submits to our own DBA API Worker.
 * No client-side captcha: the previous reCAPTCHA v2 widget required
 * Salesforce-side validation that was silently dropping leads.
 */
export function SovereignDrawerForm({
  onSuccess,
  sourceId,
}: {
  onSuccess?: () => void;
  sourceId?: string;
}) {
  const formId = useId();
  const phoneRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { lang, t } = useLanguage();

  const injectRegionPrefix = () => {
    const phone = phoneRef.current?.value ?? "";
    const region = regionTagFromPhone(phone);
    if (!region || !descriptionRef.current) return;
    const tag = `Region: ${region}. `;
    const cur = descriptionRef.current.value;
    if (descriptionAlreadyHasRegionPrefix(cur)) return;
    descriptionRef.current.value = tag + cur;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    injectRegionPrefix();

    const formData = new FormData(e.currentTarget);
    const urlRaw = (formData.get("url") as string) || "";
    const data = {
      email: formData.get("email") as string,
      company: formData.get("first_name") as string,
      website: normalizeWebsiteForApi(urlRaw),
      sourceId: sourceId,
      lang: lang !== "en" ? lang : undefined,
    };

    try {
      const response = await fetch(buildPublicApiUrl("/leads"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      onSuccess?.();
    } catch (_error) {
      setSubmitError("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={SF_DRAWER_FORM}>
      <div className={SF_DRAWER_GRID}>
        <div className={SF_DRAWER_FIELD}>
          <label htmlFor={`${formId}-first_name`}>{t("First Name")}</label>
          <input
            id={`${formId}-first_name`}
            maxLength={40}
            name="first_name"
            type="text"
            autoComplete="given-name"
            required
          />
        </div>

        <div className={SF_DRAWER_FIELD}>
          <label htmlFor={`${formId}-email`}>{t("Email")}</label>
          <input
            id={`${formId}-email`}
            maxLength={80}
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className={SF_DRAWER_FIELD}>
          <label htmlFor={`${formId}-phone`}>{t("Phone")}</label>
          <input
            id={`${formId}-phone`}
            ref={phoneRef}
            maxLength={40}
            name="phone"
            type="tel"
            autoComplete="tel"
          />
        </div>

        <div className={SF_DRAWER_FIELD}>
          <label htmlFor={`${formId}-url`}>{t("Website")}</label>
          <input
            id={`${formId}-url`}
            maxLength={80}
            name="url"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://example.com"
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && !/^https?:\/\//i.test(v)) {
                e.target.value = `https://${v}`;
              }
            }}
          />
        </div>

        <div className={`${SF_DRAWER_FIELD} ${SF_DRAWER_FIELD_FULL}`}>
          <label htmlFor={`${formId}-description`}>{t("Message")}</label>
          <textarea
            id={`${formId}-description`}
            ref={descriptionRef}
            name="description"
            rows={3}
            placeholder={t("How can we help?")}
            required
          />
        </div>
      </div>

      <div className={SF_DRAWER_ACTIONS}>
        <button type="submit" className={`${btnPrimary} ${btnSm}`} disabled={isSubmitting}>
          {isSubmitting ? t("Sending...") : t("Let's build something great.")}
        </button>
      </div>

      {submitError && (
        <p className="mt-3 text-sm text-red-400">{t("Failed to submit form. Please try again.")}</p>
      )}
    </form>
  );
}
