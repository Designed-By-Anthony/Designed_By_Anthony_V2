"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { type SupportedLang, translate } from "./translations";

const COOKIE_NAME = "dba_lang";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

interface LanguageContextValue {
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

function readCookie(): SupportedLang {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  const val = match?.[1];
  return val === "es" ? "es" : "en";
}

function writeCookie(lang: SupportedLang) {
  if (typeof document === "undefined") return;
  // biome-ignore lint/suspicious/noDocumentCookie: lightweight i18n — no cookie-store polyfill needed
  document.cookie = `${COOKIE_NAME}=${lang};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;
}

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: ReactNode;
  initialLang?: SupportedLang;
}) {
  const [lang, setLangState] = useState<SupportedLang>(initialLang ?? "en");

  /* Sync from cookie on mount (client-only, intentionally runs once) */
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only effect reads the cookie once
  useEffect(() => {
    const stored = readCookie();
    if (stored !== lang) setLangState(stored);
  }, []);

  /* Update <html lang> when language changes */
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: SupportedLang) => {
    writeCookie(next);
    setLangState(next);
  }, []);

  const t = useCallback((key: string) => translate(key, lang), [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
