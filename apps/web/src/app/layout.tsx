import "@/design-system/dba-global.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import type { CSSProperties, ReactNode } from "react";
import { CrispBootstrap } from "@/components/CrispBootstrap";
import { JsonLd } from "@/components/JsonLd";

/** Mobile-first: correct scaling on phones/tablets; safe areas for notched devices. */
export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
	interactiveWidget: "resizes-content",
	themeColor: "#f8f9fa",
	colorScheme: "light",
};

const SITE_TITLE = "ANTHONY. | Digital Infrastructure Architect";
const SITE_DESCRIPTION =
	"Bespoke digital estates and high-performance infrastructure for the Mohawk Valley (315), Capital Region (518), and Central New York — engineered in Rome, NY.";

export const metadata: Metadata = {
	metadataBase: new URL("https://designedbyanthony.com"),
	title: {
		default: SITE_TITLE,
		template: "%s | ANTHONY.",
	},
	description: SITE_DESCRIPTION,
	manifest: "/manifest.webmanifest",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: SITE_TITLE,
	},
	formatDetection: {
		telephone: false,
		email: false,
		address: false,
	},
	generator: "Next.js",
	authors: [{ name: "Anthony Jones — ANTHONY." }],
	other: {
		"business-type": "B2B",
		industry: "Professional Services / Web Design & Local SEO",
	},
	openGraph: {
		siteName: "ANTHONY.",
		type: "website",
		locale: "en_US",
		url: "https://designedbyanthony.com",
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		images: [
			{
				url: "/images/og-site-premium.png",
				width: 2400,
				height: 1260,
				alt: "ANTHONY. — Mohawk Valley digital infrastructure",
				type: "image/png",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		images: ["/images/og-site-premium.png"],
	},
	icons: {
		icon: [
			{ url: "/favicon.svg", type: "image/svg+xml" },
			{ url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
			{ url: "/favicon.png", sizes: "32x32", type: "image/png" },
		],
		shortcut: "/favicon.ico",
		apple: [
			{
				url: "/apple-touch-icon.png",
				sizes: "180x180",
				type: "image/png",
			},
		],
	},
};

const DEFAULT_LEAD_WEBHOOK =
	"https://tremendous-emu-522.convex.site/webhook/lead";

const fontVariables: CSSProperties = {
	"--font-inter": '"Inter Variable"',
	"--font-playfair": '"Fraunces Variable"',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	const leadWebhookDefault =
		process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL?.trim() || DEFAULT_LEAD_WEBHOOK;
	return (
		<html
			lang="en"
			prefix="og: https://ogp.me/ns#"
			data-scroll-behavior="smooth"
			data-lead-webhook={leadWebhookDefault || undefined}
			style={fontVariables}
		>
			<head>
				<JsonLd />
			</head>
			<body>
				{/* Google Tag Manager (noscript) */}
				<noscript>
					<iframe
						src="https://www.googletagmanager.com/ns.html?id=GTM-W2JBTH5L"
						height="0"
						width="0"
						style={{ display: "none", visibility: "hidden" }}
						title="GTM-NoScript"
					/>
				</noscript>
				{children}
				<CrispBootstrap />
				{/* Stripe v3 — loaded eagerly so Wappalyzer/BuiltWith detect "Payment Processing" */}
				<Script
					src="https://js.stripe.com/v3/"
					strategy="afterInteractive"
					id="stripe-js"
				/>
			</body>
		</html>
	);
}
