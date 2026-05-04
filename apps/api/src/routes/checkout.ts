import { Elysia, t } from "elysia";
import Stripe from "stripe";

interface CfEnv {
  STRIPE_SECRET_KEY?: string;
}

/**
 * POST /checkout — create a Stripe Checkout session for selected tools.
 *
 * Body: { tools: string[] }   — array of tool slugs from .online pseo catalog
 * Returns: { url: string }    — Stripe Checkout URL
 *
 * Slug → Stripe Price mapping uses real Price IDs created from .online's
 * TOOL_PRICES (pseo.ts). .online is the source of truth for pricing.
 */

const TOOL_PRICES: Record<string, { priceId: string; name: string }> = {
  "construction-calculator": {
    priceId: "price_1TTJiUDAc5rCuqvS72phFkeW",
    name: "Construction Calculator",
  },
  "lead-form-builder": {
    priceId: "price_1TTJibDAc5rCuqvSCB8rHNWh",
    name: "Contact Form Builder",
  },
  "site-speed-monitor": {
    priceId: "price_1TTJitDAc5rCuqvSnOhV6PFc",
    name: "Website Speed Test",
  },
  "seo-audit": {
    priceId: "price_1TTJiuDAc5rCuqvSdrj2Bz8r",
    name: "Local SEO Checker",
  },
  "cold-outreach": {
    priceId: "price_1TTJiuDAc5rCuqvSSNyfBsKT",
    name: "Follow-Up Email Writer",
  },
  "service-area-map": {
    priceId: "price_1TTJivDAc5rCuqvSVtunof6y",
    name: "Service Area Map",
  },
  "lighthouse-scanner": {
    priceId: "price_1TTJivDAc5rCuqvSPRHP8Txv",
    name: "Website Speed Grader",
  },
};

export const checkoutRoute = new Elysia().post(
  "/checkout",
  async ({ body, store }) => {
    const cfEnv = (store as { env?: CfEnv }).env ?? {};
    const stripeKey = cfEnv.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { tools } = body as { tools: string[] };
    if (!tools || tools.length === 0) {
      return new Response(JSON.stringify({ error: "No tools selected" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const validSlugs: string[] = [];
    for (const slug of tools) {
      const tool = TOOL_PRICES[slug];
      if (!tool) continue;
      lineItems.push({ price: tool.priceId, quantity: 1 });
      validSlugs.push(slug);
    }

    if (lineItems.length === 0) {
      return new Response(JSON.stringify({ error: "No valid tools selected" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: lineItems,
      success_url: "https://designedbyanthony.online/dashboard?checkout=success",
      cancel_url: "https://designedbyanthony.online/shop?checkout=cancelled",
      metadata: {
        product_slug: validSlugs.join(","),
        tier: "pro",
      },
    });

    return { url: session.url };
  },
  {
    body: t.Object({
      tools: t.Array(t.String()),
    }),
  }
);
