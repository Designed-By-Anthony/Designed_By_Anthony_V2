import { Elysia, t } from "elysia";
import Stripe from "stripe";

interface CfEnv {
  STRIPE_SECRET_KEY?: string;
}

/**
 * POST /checkout — create a Stripe Checkout session for selected tools.
 *
 * Body: { tools: [{ slug: string, tier: "starter"|"pro"|"agency", interval?: "month"|"year" }] }
 * Returns: { url: string } pointing to Stripe Checkout.
 *
 * Slug → Stripe price mapping uses the real Price IDs from Stripe.
 */

type Tier = "starter" | "pro" | "agency";
type Interval = "month" | "year";

interface ToolPriceMap {
  productId: string;
  name: string;
  prices: Record<Tier, Record<Interval, string>>;
}

const TOOLS: Record<string, ToolPriceMap> = {
  sitescan: {
    productId: "prod_UQm4hOc8DgljEG",
    name: "SiteScan — Website Health Reports",
    prices: {
      starter: { month: "price_1TRugXDAc5rCuqvSZRHfOerZ", year: "price_1TRugaDAc5rCuqvSS348Ixt9" },
      pro: { month: "price_1TRugZDAc5rCuqvSHP9lhpuy", year: "price_1TRugZDAc5rCuqvSlg24TlEG" },
      agency: { month: "price_1TRugaDAc5rCuqvS5mbcOrsS", year: "price_1TRugbDAc5rCuqvSjJP8bRSB" },
    },
  },
  reviewpilot: {
    productId: "prod_UQm4B7KtGjmQ95",
    name: "ReviewPilot — AI Review Response",
    prices: {
      starter: { month: "price_1TRugcDAc5rCuqvShUsE2y0Q", year: "price_1TRugdDAc5rCuqvSf7nzpPDK" },
      pro: { month: "price_1TRugeDAc5rCuqvS8IRJrMHq", year: "price_1TRugfDAc5rCuqvSfvWANZig" },
      agency: { month: "price_1TRuggDAc5rCuqvSG3yqHpPj", year: "price_1TRuggDAc5rCuqvSVpITfU4b" },
    },
  },
  clienthub: {
    productId: "prod_UQm4drPW7eZhTG",
    name: "ClientHub — Client Portal",
    prices: {
      starter: { month: "price_1TRughDAc5rCuqvSNBypmQAU", year: "price_1TRugiDAc5rCuqvS4x9ScTRJ" },
      pro: { month: "price_1TRugjDAc5rCuqvSpIBVqnHB", year: "price_1TRugkDAc5rCuqvSPKN3baKz" },
      agency: { month: "price_1TRuglDAc5rCuqvSdI4UzfTK", year: "price_1TRuglDAc5rCuqvSkJ0XtBrJ" },
    },
  },
  localrank: {
    productId: "prod_UQm4R30L9CQBza",
    name: "LocalRank — Local SEO Dashboard",
    prices: {
      starter: { month: "price_1TRugwDAc5rCuqvSocRfirwb", year: "price_1TRugxDAc5rCuqvSUYODyR8n" },
      pro: { month: "price_1TRuh0DAc5rCuqvSCqvri7af", year: "price_1TRuh2DAc5rCuqvS4khG3vjG" },
      agency: { month: "price_1TRuh3DAc5rCuqvSapSSGI7u", year: "price_1TRuh5DAc5rCuqvS9IUZ561H" },
    },
  },
  testiflow: {
    productId: "prod_UQm4TZqmxESg8W",
    name: "TestiFlow — Testimonial Collector",
    prices: {
      starter: { month: "price_1TRuh6DAc5rCuqvSgSQfGLL3", year: "price_1TRuh8DAc5rCuqvS4dnc27qN" },
      pro: { month: "price_1TRuhADAc5rCuqvSD9y22d4T", year: "price_1TRuhCDAc5rCuqvSBgSrrND7" },
      agency: { month: "price_1TRuhEDAc5rCuqvS6XlK7M8u", year: "price_1TRuhGDAc5rCuqvS8N83MjJm" },
    },
  },
  contentmill: {
    productId: "prod_UQm4hjcUkqUEap",
    name: "ContentMill — AI Social Content",
    prices: {
      starter: { month: "price_1TRuhIDAc5rCuqvSk1BfMjXg", year: "price_1TRuhKDAc5rCuqvSECVgMWF6" },
      pro: { month: "price_1TRuhLDAc5rCuqvSnX9sUnQh", year: "price_1TRuhNDAc5rCuqvSUmNcYPPx" },
      agency: { month: "price_1TRuhODAc5rCuqvS8esr92s7", year: "price_1TRuhQDAc5rCuqvS2Y3inl5E" },
    },
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

    const { tools } = body as {
      tools: { slug: string; tier?: Tier; interval?: Interval }[];
    };
    if (!tools || tools.length === 0) {
      return new Response(JSON.stringify({ error: "No tools selected" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const slugs: string[] = [];
    const tiers: string[] = [];
    for (const item of tools) {
      const tool = TOOLS[item.slug];
      if (!tool) continue;
      const tier: Tier = item.tier ?? "pro";
      const interval: Interval = item.interval ?? "month";
      const priceId = tool.prices[tier]?.[interval];
      if (!priceId) continue;
      lineItems.push({ price: priceId, quantity: 1 });
      slugs.push(item.slug);
      tiers.push(tier);
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
        product_slug: slugs.join(","),
        tier: tiers.join(","),
      },
    });

    return { url: session.url };
  },
  {
    body: t.Object({
      tools: t.Array(
        t.Object({
          slug: t.String(),
          tier: t.Optional(t.Union([t.Literal("starter"), t.Literal("pro"), t.Literal("agency")])),
          interval: t.Optional(t.Union([t.Literal("month"), t.Literal("year")])),
        })
      ),
    }),
  }
);
