import type { Config } from "tailwindcss";

/**
 * Tailwind v4 — supplemental JS config (palette hard-coded for tooling / IntelliSense).
 * Runtime utilities resolve via `@theme` in `tailwind-v4-bridge.css`.
 */
export default {
	content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			colors: {
				"brand-linen": "#F8F9FA",
				"brand-indigo": "#1A2A40",
				"brand-charcoal": "#333333",
				"brand-accent": "#5B7C99",
				"brand-surface": "#FFFFFF",
				"brand-border": "rgba(26, 42, 64, 0.1)",
				"accent-bronze": "#5B7C99",
			},
			letterSpacing: {
				tighter: "-0.05em",
			},
		},
	},
} satisfies Config;
