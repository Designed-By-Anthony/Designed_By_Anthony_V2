import {
  ENTERPRISE_WEBSITE_STARTING_PRICE,
  FOUNDING_PARTNER_BUILD_SLOTS,
  FOUNDING_PARTNER_SEO_LABEL,
  FOUNDING_PARTNER_SEO_MONTHLY,
  PUBLIC_LAUNCH_BUNDLE_COPY,
  PUBLIC_STANDARD_PAYMENT_PLAN,
  STANDARD_WEBSITE_STARTING_PRICE,
  STANDARD_WEBSITE_TYPICAL_RANGE,
} from "@/lib/offers";

export const whyStackCards = [
  {
    tech: "Fast on every phone",
    plain: "Your site opens the moment a customer taps.",
    why: "When your site loads fast on a phone, fewer people leave, more people call, and Google ranks you higher. That matters when someone is searching from a job site, a parking lot, or the front desk.",
  },
  {
    tech: "Ranks higher on Google",
    plain: "Google grades every website. We build yours to pass.",
    why: "Google scores every website on speed, mobile friendliness, and SEO. We build your site to score well from day one so customers find you when they search for what you do.",
  },
  {
    tech: "Stays up, year after year",
    plain: "No plugin maze. No surprise maintenance bills.",
    why: "Most small-business sites slow down or break because of dozens of plugins drifting out of date. Our sites have fewer moving parts, almost nothing to maintain, and are a lot harder to hack.",
  },
];

export const homeFaqEntries = [
  {
    question: "How much does a custom website cost in Central New York?",
    answer: `Most Central NY service-business websites land in the ${STANDARD_WEBSITE_TYPICAL_RANGE} range for a 5–10 page site. ${PUBLIC_STANDARD_PAYMENT_PLAN} ${PUBLIC_LAUNCH_BUNDLE_COPY} Simple single-page sites start at ${STANDARD_WEBSITE_STARTING_PRICE}. Larger or multi-location projects start from ${ENTERPRISE_WEBSITE_STARTING_PRICE}. Founding partner spots include a free custom build with a ${FOUNDING_PARTNER_SEO_MONTHLY}/mo ${FOUNDING_PARTNER_SEO_LABEL} — ${FOUNDING_PARTNER_BUILD_SLOTS} spots left.`,
  },
  {
    question: "How long does it take to build a service-business website?",
    answer:
      "Most websites are live in two to four weeks once we agree on the plan and you send your content. Smaller fixes and single pages can be faster. Bigger projects with multiple locations take longer. You see the timeline in writing before any work starts, and nothing goes live until you approve it.",
  },
  {
    question: "Why not just use WordPress or Wix?",
    answer:
      "Our sites load faster than WordPress or Wix, score higher on Google’s own website test, and do not need dozens of plugins patched every week. For a local service business, that means fewer visitors leaving, better search rankings, and fewer things that can break. We explain the details on our Our Edge page if you want the full story.",
  },
  {
    question: "Do you handle local SEO and Google Business Profile too?",
    answer: `Yes. Every website includes the SEO work you need to rank — clean structure, proper headings, mobile-friendly pages, and the tags Google reads to understand your business. The first three months of hosting, security, and local SEO are included. After that you can continue on the ${FOUNDING_PARTNER_SEO_MONTHLY}/mo ${FOUNDING_PARTNER_SEO_LABEL} , or add the full Google Business Profile program for reviews, posts, and map rankings. No long-term contracts.`,
  },
  {
    question: "Do you only work with businesses in Central New York?",
    answer:
      "Based in Rome, NY, with clients across Utica, Syracuse, Watertown, and greater Central New York. We also take remote projects outside Upstate NY when the fit is right.",
  },
  {
    question: "What happens when I request the free audit?",
    answer:
      "Send us your website address. Anthony reviews your site by hand, checking speed, mobile friendliness, and SEO. He replies within one business day with the most important fixes and an honest opinion on whether a rebuild is worth it.",
  },
  {
    question: "Do I actually own my website when it is done?",
    answer: `Yes. The code, the design, and the content are all yours. We hand over everything at launch. Most agencies keep the code and your site disappears when you stop paying them. The ${FOUNDING_PARTNER_SEO_MONTHLY}/month ${FOUNDING_PARTNER_SEO_LABEL} covers hosting, security, and SEO — not permission to keep your own site. If you ever leave, you take your site with you.`,
  },
];

export const processSteps = [
  {
    title: "Send us your website for a free review",
    description:
      "Share your URL and we review your site by hand — speed, mobile friendliness, SEO, and more. No sales pitch, no commitment.",
  },
  {
    title: "Anthony reviews and follows up",
    description:
      "Anthony sends you a clear summary of the biggest fixes and what they could do for your business. If a rebuild makes sense, the quote is based on what he actually found.",
  },
  {
    title: "You see the site before it goes live",
    description: `Nothing launches until you approve it. ${PUBLIC_STANDARD_PAYMENT_PLAN} Standard custom builds start at ${STANDARD_WEBSITE_STARTING_PRICE}, or ask about a founding partner spot while any remain (${FOUNDING_PARTNER_SEO_MONTHLY}/mo ${FOUNDING_PARTNER_SEO_LABEL}).`,
  },
];

export const homeFooterCta = {
  eyebrow: "Free Website Review",
  title: "Curious how your website is really doing?",
  description:
    "Send us your URL and get an honest report on speed, mobile friendliness, and SEO. No sign-up, no sales pitch.",
  primaryHref: "/lighthouse",
  primaryLabel: "Get Your Free Review",
  secondaryHref: "/contact",
  secondaryLabel: "Or send us a message",
  note: "Anthony usually replies within one business day.",
};
