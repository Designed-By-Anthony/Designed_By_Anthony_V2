import type { Metadata } from "next";
import { MarketingChrome } from "@/components/marketing/MarketingChrome";
import { buildToolsStoreJsonLd } from "@/lib/tools-jsonld";
import { ToolsPage } from "./ToolsPage";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Tools — Business Software for Local Service Companies",
  description:
    "Six tools built for small businesses: website reports, review management, client portals, SEO dashboards, testimonial collection, and social media content. Founding member pricing available.",
  openGraph: {
    title: "Business Tools | ANTHONY.",
    description:
      "Simple tools for local service businesses. Website reports, review management, client portals, and more. Founding member pricing available.",
    url: "https://designedbyanthony.com/tools",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Tools | ANTHONY.",
    description:
      "Simple tools for local service businesses. Website reports, review management, client portals, and more.",
  },
  alternates: { canonical: "/tools" },
};

export default function Tools() {
  let toolsGraph: ReturnType<typeof buildToolsStoreJsonLd> | null = null;
  try {
    toolsGraph = buildToolsStoreJsonLd();
  } catch (_err) {}
  return (
    <MarketingChrome>
      {toolsGraph ? (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsGraph) }}
        />
      ) : null}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <ToolsPage />
      </div>
    </MarketingChrome>
  );
}
