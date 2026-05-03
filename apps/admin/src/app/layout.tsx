import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const SITE_TITLE = "ANTHONY. | Digital Infrastructure Architect";
const SITE_DESCRIPTION =
  "Bespoke digital estates and high-performance infrastructure for the 315 and beyond.";

export const metadata: Metadata = {
  title: { default: SITE_TITLE, template: "%s | ANTHONY." },
  description: SITE_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_TITLE,
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
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-brand-linen text-brand-charcoal antialiased">{children}</body>
    </html>
  );
}
