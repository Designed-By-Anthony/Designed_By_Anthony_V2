"use client";

import { useLanguage } from "@/lib/i18n";

const BTN_BASE =
  "rounded-full border px-[0.45rem] py-[0.18rem] text-[0.68rem] font-semibold uppercase tracking-[0.1em] no-underline transition-colors duration-[180ms] ease-in cursor-pointer bg-transparent";
const BTN_ACTIVE =
  "border-brand-border bg-card text-brand-indigo hover:border-brand-accent hover:text-brand-accent";
const BTN_INACTIVE =
  "border-transparent text-brand-charcoal/50 hover:border-brand-accent hover:text-brand-accent";

export function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="flex items-center gap-[0.3rem] shrink-0" role="group" aria-label={t("Language")}>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-label={t("EN \u2014 Switch to English")}
        aria-pressed={lang === "en"}
        className={`${BTN_BASE} ${lang === "en" ? BTN_ACTIVE : BTN_INACTIVE}`}
      >
        EN
      </button>
      <span className="text-[0.6rem] text-brand-charcoal/25" aria-hidden>
        |
      </span>
      <button
        type="button"
        onClick={() => setLang("es")}
        aria-label={t("ES \u2014 Switch to Spanish")}
        aria-pressed={lang === "es"}
        className={`${BTN_BASE} ${lang === "es" ? BTN_ACTIVE : BTN_INACTIVE}`}
      >
        ES
      </button>
    </div>
  );
}
