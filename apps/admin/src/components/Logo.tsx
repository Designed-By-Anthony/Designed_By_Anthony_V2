import type { ComponentPropsWithoutRef } from "react";

const wordmarkBase =
	"font-serif font-black uppercase tracking-tighter text-brand-indigo leading-none";

const variants = {
	header: "text-2xl",
	footer: "text-5xl max-md:text-4xl",
	dialog: "text-2xl",
} as const;

export type LogoProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
	variant?: keyof typeof variants;
};

export function Logo({ variant = "header", className = "", ...props }: LogoProps) {
	return (
		<span className={`${wordmarkBase} ${variants[variant]} ${className}`.trim()} {...props}>
			ANTHONY.
		</span>
	);
}
