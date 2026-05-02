import type { MetadataRoute } from "next";

/** Shared PWA manifest for `/manifest.webmanifest` and legacy `/site.webmanifest`. */
export const webAppManifest: MetadataRoute.Manifest = {
	name: "ANTHONY.",
	short_name: "ANTHONY.",
	description:
		"Bespoke digital estates and high-performance infrastructure for the Mohawk Valley (315), Capital Region (518), and Central New York.",
	start_url: "/",
	scope: "/",
	display: "standalone",
	background_color: "#f8f9fa",
	theme_color: "#5b7c99",
	icons: [
		{
			src: "/favicon.svg",
			sizes: "any",
			type: "image/svg+xml",
			purpose: "any",
		},
		{
			src: "/site-icon-48.png",
			sizes: "48x48",
			type: "image/png",
			purpose: "any",
		},
		{
			src: "/apple-touch-icon.png",
			sizes: "180x180",
			type: "image/png",
			purpose: "any",
		},
		{
			src: "/site-icon-192.png",
			sizes: "192x192",
			type: "image/png",
			purpose: "maskable",
		},
		{
			src: "/site-icon-512.png",
			sizes: "512x512",
			type: "image/png",
			purpose: "maskable",
		},
	],
};
