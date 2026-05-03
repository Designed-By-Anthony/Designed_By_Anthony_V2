/** Extra sections for `/services/[slug]` — core title/description stay in `MARKETING_SERVICES`. */

export type ServiceExtraSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export const SERVICE_PAGE_EXTRA_SECTIONS: Record<string, ServiceExtraSection[]> = {
  "custom-web-design": [
    {
      heading: "What you get",
      paragraphs: [
        "A website that looks great on phones, is easy to read, and lets your team update services and photos without anything breaking.",
      ],
      bullets: [
        "Fast loading even with large photos from the job site.",
        "Clear buttons and forms so customers can call, text, or book easily.",
        "Built-in SEO so Google understands your business and what you offer.",
      ],
    },
    {
      heading: "Who it is for",
      paragraphs: [
        "Service businesses that win on trust and clarity: contractors, home services, medspas, salons, and boutique retail with a story worth telling.",
      ],
    },
  ],
  "local-seo": [
    {
      heading: "What moves the needle",
      paragraphs: [
        "Local SEO is not a plugin you install. It is about making sure your website, your Google Business Profile, and your service areas all tell the same story.",
      ],
      bullets: [
        "Service pages that match what your customers are actually searching for.",
        "Clean website structure so Google can read and index every page.",
        "Monthly reports you can understand: where you rank, how many people visited, and what to focus on next.",
      ],
    },
  ],
  "website-rescue": [
    {
      heading: "When a rescue makes sense",
      paragraphs: [
        "If your website is slow on phones, your contact forms do not work reliably, or you have outgrown your website builder, a full rebuild can be faster than trying to fix things one at a time.",
      ],
      bullets: [
        "We figure out exactly what needs to move over: pages, forms, analytics, and embeds.",
        "Rebuild your site without losing the Google rankings you already have.",
        "Give you a site you can update yourself for years to come.",
      ],
    },
  ],
  "managed-hosting": [
    {
      heading: "Hosting with real support",
      paragraphs: [
        "Managed hosting means we handle updates, backups, and monitoring. When something looks off, you call us directly — no support tickets, no waiting.",
      ],
    },
  ],
  "google-business-profile": [
    {
      heading: "Your Google profile, managed for you",
      paragraphs: [
        "We keep your reviews, photos, services, Q&A, and posts consistent with your website. You get clear reports showing what changed and how it affected your visibility.",
      ],
    },
  ],
  "workspace-setup": [
    {
      heading: "Professional email without the headache",
      paragraphs: [
        "We set up Google Workspace for your team: professional email addresses, shared calendars, file storage, and security settings so everyone can work together without mistakes.",
      ],
    },
  ],
  "ai-automation": [
    {
      heading: "Smart forms and chat that sound like you",
      paragraphs: [
        "We build chat and form tools that ask the right questions, send leads to the right person, and cut down on repetitive follow-up — without sounding like a robot.",
      ],
    },
  ],
};
