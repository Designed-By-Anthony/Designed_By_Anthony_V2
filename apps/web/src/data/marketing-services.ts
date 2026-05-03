/**
 * Public service pages under `/services/*`.
 * Lives in `src/data` so consumers (Playwright smoke tests, routers) avoid importing
 * `@/lib/seo`, which pulls brand assets (e.g. `.webp`) unsuitable for Node test loaders.
 */

export const MARKETING_SERVICES = [
  {
    name: "Custom Web Design",
    path: "/services/custom-web-design",
    description:
      "Strategic website design combining brand aesthetics with conversion-focused architecture. Engineered for performance, built for results.",
  },
  {
    name: "Website Recovery & Performance",
    path: "/services/website-rescue",
    description:
      "Comprehensive site remediation addressing technical debt, mobile experience, and conversion optimization. Restore performance, reclaim rankings.",
  },
  {
    name: "Enterprise Hosting & Support",
    path: "/services/managed-hosting",
    description:
      "Premium managed infrastructure on Cloudflare's edge network with dedicated technical support. Enterprise-grade security, global performance, zero maintenance overhead.",
  },
  {
    name: "Local SEO & Search Strategy",
    path: "/services/local-seo",
    description:
      "Data-driven local search optimization and Google Business Profile management. Strategic entity alignment for service-area businesses seeking market dominance.",
  },
  {
    name: "Local Marketing Intelligence",
    path: "/services/google-business-profile",
    description:
      "Comprehensive local presence management integrating reputation systems, citation networks, and AI-powered visibility optimization. Full-funnel reporting included.",
  },
  {
    name: "Business Systems Integration",
    path: "/services/workspace-setup",
    description:
      "Enterprise workspace architecture and business system integration. Seamless email, collaboration, and workflow automation deployment.",
  },
  {
    name: "Micro SaaS Development",
    path: "/services/micro-saas",
    description:
      "Bespoke web applications and marketing automation systems for scaling businesses. From custom CRMs to lead generation platforms — engineered for growth.",
  },
] as const;

export type MarketingService = (typeof MARKETING_SERVICES)[number];
