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
      "Custom websites designed to look great, load fast, and turn visitors into customers. Built from scratch for your business.",
  },
  {
    name: "Website Rescue & Rebuild",
    path: "/services/website-rescue",
    description:
      "Fix a slow, outdated, or broken website. We rebuild for speed, mobile friendliness, and better Google rankings.",
  },
  {
    name: "Managed Hosting & Support",
    path: "/services/managed-hosting",
    description:
      "Fast, secure website hosting with hands-on support. We handle updates, security, and backups so you do not have to think about it.",
  },
  {
    name: "Local SEO & Google Rankings",
    path: "/services/local-seo",
    description:
      "Help your business show up when local customers search on Google. We optimize your website, manage your Google Business Profile, and track your rankings.",
  },
  {
    name: "Google Business Profile Management",
    path: "/services/google-business-profile",
    description:
      "Get more calls from Google Maps and local search. We manage your reviews, keep your business info accurate everywhere, and send you monthly reports.",
  },
  {
    name: "Google Workspace & Email Setup",
    path: "/services/workspace-setup",
    description:
      "Professional business email, calendars, and file sharing set up and ready to use. We handle the technical setup so your team can start working.",
  },
  {
    name: "Custom Business Tools",
    path: "/services/micro-saas",
    description:
      "Custom web apps and automation tools built for your business. From client portals to lead capture systems — built to save you time and grow your revenue.",
  },
] as const;

export type MarketingService = (typeof MARKETING_SERVICES)[number];
