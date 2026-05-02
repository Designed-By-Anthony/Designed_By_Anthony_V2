import type { ReactNode } from "react";

interface SurfaceCardProps {
	children: ReactNode;
	className?: string;
	interactive?: boolean;
}

/** Solid surface card — Linen / Indigo system (no gradients). */
export function SurfaceCard({
	children,
	className = "",
	interactive = false,
}: SurfaceCardProps) {
	const baseClasses =
		"surface-card relative overflow-hidden rounded-[1.15rem] border border-brand-border bg-brand-surface p-[clamp(1.2rem,2.4vw,1.6rem)] shadow-[var(--shadow-card)] transition-all duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)]";

	const interactiveClasses = interactive
		? "hover:-translate-y-[3px] hover:border-brand-indigo/22 hover:shadow-[0_28px_56px_-32px_rgba(26,42,64,0.16)]"
		: "";

	return (
		<div className={`${baseClasses} ${interactiveClasses} ${className}`}>
			{children}
		</div>
	);
}

interface TileGridProps {
	children: ReactNode;
	className?: string;
	columns?: 2 | 3 | 4;
}

/**
 * Global Tile Grid component - responsive grid layout for cards
 */
export function TileGrid({
	children,
	className = "",
	columns = 3,
}: TileGridProps) {
	const columnClasses = {
		2: "grid-cols-1 md:grid-cols-2",
		3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
	};

	return (
		<div
			className={`grid gap-[clamp(1rem,2.2vw,1.35rem)] ${columnClasses[columns]} ${className}`}
		>
			{children}
		</div>
	);
}
