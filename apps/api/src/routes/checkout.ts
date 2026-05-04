import { Elysia, t } from "elysia";
import Stripe from "stripe";

interface CfEnv {
  STRIPE_SECRET_KEY?: string;
}

/**
 * POST /checkout — create a Stripe Checkout session for selected tools.
 *
 * Expects JSON body: { tools: string[] }
 * Each tool slug maps to a line item with the tool's monthly price.
 * On success returns { url: "<stripe checkout url>" }.
 */

const TOOL_PRICES: Record<string, { name: string; unitAmount: number }> = {
  "construction-calculator": { name: "Construction Calculator", unitAmount: 2900 },
  "lead-form-builder": { name: "Contact Form Builder", unitAmount: 4900 },
  "site-speed-monitor": { name: "Website Speed Test", unitAmount: 2900 },
  "seo-audit": { name: "Local SEO Checker", unitAmount: 4900 },
  "cold-outreach": { name: "Follow-Up Email Writer", unitAmount: 7900 },
  "service-area-map": { name: "Service Area Map", unitAmount: 2900 },
  "lighthouse-scanner": { name: "Website Speed Grader", unitAmount: 4900 },
};

export const checkoutRoute = new Elysia().post(
  "/checkout",
  async ({ body, store }) => {
    const cfEnv = (store as { env?: CfEnv }).env ?? {};
    const stripeKey = cfEnv.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const { tools } = body as { tools: string[] };
    if (!tools || tools.length === 0) {
      return new Response(
        JSON.stringify({ error: "No tools selected" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    for (const slug of tools) {
      const tool = TOOL_PRICES[slug];
      if (!tool) continue;
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: tool.name,
            metadata: { product_slug: slug },
          },
          unit_amount: tool.unitAmount,
          recurring: { interval: "month" },
        },
        quantity: 1,
      });
    }

    if (lineItems.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid tools selected" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: lineItems,
      success_url: "https://designedbyanthony.online/dashboard?checkout=success",
      cancel_url: "https://designedbyanthony.online/shop?checkout=cancelled",
      metadata: {
        product_slug: tools.join(","),
        tier: "pro",
      },
    });

    return { url: session.url };
  },
  {
    body: t.Object({
      tools: t.Array(t.String()),
    }),
  },
);
