import { createD1Client, purchases, users } from "@dba/shared/db/client";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { createRemoteJWKSet, jwtVerify } from "jose";

interface CfEnv {
  DB?: D1Database;
  CLERK_JWKS_URL?: string;
}

let cachedJWKS: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS(jwksUrl: string) {
  if (!cachedJWKS) cachedJWKS = createRemoteJWKSet(new URL(jwksUrl));
  return cachedJWKS;
}

export const meRoute = new Elysia({ prefix: "/me" }).get("/", async ({ request, set, store }) => {
  set.headers["Cache-Control"] = "no-store";

  const env = (store as { env?: CfEnv }).env;
  const db = env?.DB;
  const jwksUrl = env?.CLERK_JWKS_URL?.trim();

  if (!db || !jwksUrl) {
    set.status = 503;
    return { error: "Service not configured." };
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token) {
    set.status = 401;
    return { error: "Missing bearer token." };
  }

  try {
    const jwks = getJWKS(jwksUrl);
    const { payload } = await jwtVerify(token, jwks);
    const clerkId = typeof payload.sub === "string" ? payload.sub : null;
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : null;

    if (!clerkId) {
      set.status = 401;
      return { error: "Invalid token claims." };
    }

    const drizzle = createD1Client(db);

    let userRow = (
      await drizzle.select().from(users).where(eq(users.clerk_id, clerkId)).limit(1)
    )[0];

    if (!userRow && email) {
      userRow = (await drizzle.select().from(users).where(eq(users.email, email)).limit(1))[0];

      if (userRow && !userRow.clerk_id) {
        await drizzle
          .update(users)
          .set({ clerk_id: clerkId, updated_at: Date.now() })
          .where(eq(users.id, userRow.id));
      }
    }

    if (!userRow && email) {
      const newId = crypto.randomUUID();
      await drizzle.insert(users).values({
        id: newId,
        clerk_id: clerkId,
        email,
        plan: "free",
        created_at: Date.now(),
        updated_at: Date.now(),
      });
      userRow = {
        id: newId,
        clerk_id: clerkId,
        email,
        plan: "free",
        stripe_customer_id: null,
        created_at: Date.now(),
        updated_at: Date.now(),
      };
    }

    if (!userRow) {
      set.status = 401;
      return { error: "Unable to resolve user." };
    }

    const userPurchases = await drizzle
      .select({
        id: purchases.id,
        product_slug: purchases.product_slug,
        tier: purchases.tier,
        status: purchases.status,
        created_at: purchases.created_at,
        expires_at: purchases.expires_at,
      })
      .from(purchases)
      .where(eq(purchases.user_id, userRow.id));

    return {
      ok: true,
      user: {
        id: userRow.id,
        email: userRow.email,
        plan: userRow.plan,
        created_at: userRow.created_at,
      },
      purchases: userPurchases.map((p) => ({
        id: p.id,
        product_slug: p.product_slug,
        tier: p.tier,
        status: p.status,
        created_at: p.created_at,
        expires_at: p.expires_at,
      })),
    };
  } catch {
    set.status = 401;
    return { error: "Invalid token." };
  }
});
