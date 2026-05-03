"use client";

import { useLanguage } from "@/lib/i18n";

export function T({ k }: { k: string }) {
  const { t } = useLanguage();
  return <>{t(k)}</>;
}
