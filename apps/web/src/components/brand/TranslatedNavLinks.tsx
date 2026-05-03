"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

interface NavLink {
  readonly href: string;
  readonly label: string;
}

export function TranslatedNavLinks({
  links,
  className,
}: {
  links: readonly NavLink[];
  className: string;
}) {
  const { t } = useLanguage();

  return (
    <>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={className}>
          {t(link.label)}
        </Link>
      ))}
    </>
  );
}

export function TranslatedLink({
  href,
  label,
  className,
  id,
}: {
  href: string;
  label: string;
  className: string;
  id?: string;
}) {
  const { t } = useLanguage();

  return (
    <Link href={href} className={className} id={id}>
      {t(label)}
    </Link>
  );
}
