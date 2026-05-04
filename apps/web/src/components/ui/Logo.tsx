import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import { BRAND_ASSETS, BRAND_NAME } from "@/design-system/brand";

const variants = {
  header: "text-2xl",
  footer: "text-5xl max-md:text-4xl",
  dialog: "text-2xl",
} as const;

const imgHeights = {
  header: 40,
  footer: 64,
  dialog: 40,
} as const;

export type LogoProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  variant?: keyof typeof variants;
};

export function Logo({ variant = "header", className = "", ...props }: LogoProps) {
  const h = imgHeights[variant];
  return (
    <span className={`inline-flex items-center ${className}`.trim()} {...props}>
      <Image
        src={BRAND_ASSETS.logo}
        alt={BRAND_NAME}
        width={h}
        height={h}
        className="h-auto object-contain"
        style={{ height: h, width: "auto" }}
        priority={variant === "header"}
      />
    </span>
  );
}
