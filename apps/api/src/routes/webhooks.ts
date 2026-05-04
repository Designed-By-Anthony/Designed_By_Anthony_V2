import { createD1Client, purchases, users } from "@dba/shared/db/client";
import { leads, tryInsertLead, tryInsertTransaction } from "@dba/shared/lib/d1Leads";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import Stripe from "stripe";
import { upsertSharedUser } from "../db/users";

interface CfEnv {
  DB?: D1Database;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

export const webhooks = new Elysia({ prefix: "/webhooks" }).post(
  "/stripe",
  async ({ body, headers, store }) => {
    const cfEnv = (store as { env?: CfEnv }).env ?? {};

    const stripeSecretKey = cfEnv.STRIPE_SECRET_KEY;
    const stripeWebhookSecret = cfEnv.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !stripeWebhookSecret) {
      return new Response(JSON.stringify({ error: "Missing Stripe configuration" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });

    const sig = headers["stripe-signature"];
    if (!sig) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, stripeWebhookSecret);
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = cfEnv.DB as D1Database | undefined;

    // ── Idempotency guard ──────────────────────────────────────────────────────
    // Prevent duplicate processing of the same Stripe event.
    if (db) {
      const existing = await db
        .prepare("SELECT response_body, status_code FROM idempotency_keys WHERE key = ?")
        .bind(event.id)
        .first<{ response_body: string; status_code: number }>();

      if (existing) {
        return new Response(existing.response_body, {
          status: existing.status_code,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // ── Event handling ─────────────────────────────────────────────────────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_email;
      const amountTotal = session.amount_total;
      const stripeSessionId = session.id;

      if (!customerEmail) {
        const body400 = JSON.stringify({
          error: "Missing customer_email in session",
        });
        await persistIdempotencyKey(db, event.id, body400, 400);
        return new Response(body400, {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const leadId = crypto.randomUUID();
      await tryInsertLead({
        id: leadId,
        email: customerEmail,
        source: "Contact_Form",
        status: "Closed",
        turnstile_passed: null,
        metadata: JSON.stringify({
          stripeSessionId,
          plan: session.metadata?.plan ?? null,
        }),
        created_at: Date.now(),
      });

      // Resolve actual lead id (may differ if upsert hit existing row)
      let resolvedLeadId = leadId;
      try {
        if (db) {
          const drizzle = createD1Client(db);
          const existing = await drizzle
            .select({ id: leads.id })
            .from(leads)
            .where(eq(leads.email, customerEmail))
            .limit(1);
          if (existing[0]) resolvedLeadId = existing[0].id;
        }
      } catch {
        // best-effort — fall back to generated id
      }

      await tryInsertTransaction({
        stripe_session_id: stripeSessionId,
        customer_email: customerEmail,
        amount_total: amountTotal,
        plan_name: session.metadata?.plan ?? null,
        status: "completed",
        lead_id: resolvedLeadId,
        created_at: Date.now(),
      });

      if (db) {
        await upsertSharedUser(db, {
          email: customerEmail,
          plan: "paid",
          stripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : (session.customer?.id ?? null),
        });

        const productSlug = session.metadata?.product_slug;
        const tier = session.metadata?.tier;
        if (productSlug && tier) {
          try {
            const drizzle = createD1Client(db);
            const userRow = await drizzle
              .select({ id: users.id })
              .from(users)
              .where(eq(users.email, customerEmail.trim().toLowerCase()))
              .limit(1);
            if (userRow[0]) {
              await drizzle.insert(purchases).values({
                id: crypto.randomUUID(),
                user_id: userRow[0].id,
                product_slug: productSlug,
                tier,
                stripe_session_id: stripeSessionId,
                status: "active",
                created_at: Date.now(),
              });
            }
          } catch {
            // non-fatal — purchase record is best-effort
          }
        }
      }
    }

    const responseBody = JSON.stringify({ received: true });
    await persistIdempotencyKey(db, event.id, responseBody, 200);
    return new Response(responseBody, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
  {
    body: t.String(),
    headers: t.Object({
      "stripe-signature": t.String(),
    }),
  }
);

// ── Helpers ──────────────────────────────────────────────────────────────────

async function persistIdempotencyKey(
  db: D1Database | undefined,
  key: string,
  responseBody: string,
  statusCode: number
): Promise<void> {
  if (!db) return;
  try {
    await db
      .prepare(
        "INSERT OR IGNORE INTO idempotency_keys (key, response_body, status_code) VALUES (?, ?, ?)"
      )
      .bind(key, responseBody, statusCode)
      .run();
  } catch {
    // Non-fatal — idempotency is best-effort if D1 is unavailable
  }
}
