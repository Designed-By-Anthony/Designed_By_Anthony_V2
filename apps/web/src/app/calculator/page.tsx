import type { Metadata } from "next";
import { MarketingChrome } from "@/components/marketing/MarketingChrome";
import { homeFooterCta } from "@/data/home";
import { CalculatorClient } from "./CalculatorClient";

export const revalidate = 86400;

const TITLE = "Website Cost Calculator | ANTHONY. — Project Estimator";
const DESCRIPTION =
  "Get a quick ballpark for your custom website — adjust pages, integrations, and engagement level to see an estimated investment range.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/calculator" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://designedbyanthony.com/calculator",
    type: "website",
  },
};

export default function CalculatorPage() {
  return (
    <MarketingChrome footerCta={homeFooterCta}>
      <section className="section-shell section-shell--wash marketing-page-hero">
        <div className="section-container max-w-[56rem]">
          <p className="text-[0.72rem] font-[family-name:var(--font-inter)] uppercase tracking-[0.22em] text-brand-accent mb-3">
            Cost estimator
          </p>
          <h1 className="page-title">Website Cost Calculator</h1>
          <p className="page-lead max-w-[40rem]">
            A fast, transparent ballpark for a custom-built site — adjust pages, integrations, and
            engagement tier to see an indicative investment range.
          </p>
        </div>
      </section>
      <section className="section-shell pb-24">
        <div className="section-container max-w-[56rem]">
          <CalculatorClient />
        </div>
      </section>
    </MarketingChrome>
  );
}
