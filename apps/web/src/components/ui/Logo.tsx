import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import { BRAND_ASSETS, BRAND_NAME } from "@/design-system/brand";

const imgHeights = {
  header: 40,
  footer: 64,
  dialog: 40,
} as const;

export type LogoProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  variant?: keyof typeof imgHeights;
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
