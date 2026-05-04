import { Elysia } from "elysia";
import { createRemoteJWKSet, type JWTPayload, jwtVerify } from "jose";

type SharedToolPlan = "free" | "paid" | "client" | "admin";

interface CfEnv {
  DB?: D1Database;
  CLERK_JWKS_URL?: string;
}

type SharedUserRow = {
  id: string;
  clerk_id: string | null;
  email: string;
  plan: SharedToolPlan;
};

type EmailRow = {
  email: string;
};

type TransactionRow = {
  plan_name: string | null;
};

let cachedJWKS: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS(jwksUrl: string) {
  if (!cachedJWKS) cachedJWKS = createRemoteJWKSet(new URL(jwksUrl));
  return cachedJWKS;
}

function normalizeEmail(value: string | null | undefined): string | null {
  const email = value?.trim().toLowerCase();
  return email ? email : null;
}

function payloadEmail(payload: JWTPayload): string | null {
  const candidate = payload.email;
  return typeof candidate === "string" ? normalizeEmail(candidate) : null;
}

function planFromTransaction(planName: string | null | undefined): SharedToolPlan {
  return planName ? "paid" : "free";
}

async function findSharedUserByClerkId(db: D1Database, clerkId: string) {
  return db
    .prepare("SELECT id, clerk_id, email, plan FROM users WHERE clerk_id = ? LIMIT 1")
    .bind(clerkId)
    .first<SharedUserRow>();
}

async function findSharedUserByEmail(db: D1Database, email: string) {
  return db
    .prepare("SELECT id, clerk_id, email, plan FROM users WHERE lower(email) = ? LIMIT 1")
    .bind(email)
    .first<SharedUserRow>();
}

async function findClientByEmail(db: D1Database, email: string) {
  return db
    .prepare("SELECT email FROM clients WHERE lower(email) = ? LIMIT 1")
    .bind(email)
    .first<EmailRow>();
}

async function findCompletedTransactionByEmail(db: D1Database, email: string) {
  return db
    .prepare(
      "SELECT plan_name FROM transactions WHERE lower(customer_email) = ? AND status = 'completed' ORDER BY created_at DESC LIMIT 1"
    )
    .bind(email)
    .first<TransactionRow>();
}

async function resolvePlan(db: D1Database, payload: JWTPayload) {
  const clerkId = typeof payload.sub === "string" ? payload.sub : null;
  const email = payloadEmail(payload);

  if (clerkId) {
    const user = await findSharedUserByClerkId(db, clerkId);
    if (user) {
      return {
        userId: user.id,
        plan: user.plan,
        email: normalizeEmail(user.email),
      };
    }
  }

  if (email) {
    const user = await findSharedUserByEmail(db, email);
    if (user) {
      return {
        userId: user.id,
        plan: user.plan,
        email: normalizeEmail(user.email),
      };
    }

    const client = await findClientByEmail(db, email);
    if (client) {
      return { userId: email, plan: "client" as const, email };
    }

    const transaction = await findCompletedTransactionByEmail(db, email);
    if (transaction) {
      return {
        userId: email,
        plan: planFromTransaction(transaction.plan_name),
        email,
      };
    }
  }

  return { userId: clerkId, plan: "free" as const, email };
}

export const authRoute = new Elysia({ prefix: "/auth" }).get(
  "/verify",
  async ({ request, set, store }) => {
    set.headers["Cache-Control"] = "no-store";

    const env = (store as { env?: CfEnv }).env;
    const db = env?.DB;
    const jwksUrl = env?.CLERK_JWKS_URL?.trim();

    if (!db) {
      set.status = 503;
      return { error: "Database not available." };
    }

    if (!jwksUrl) {
      set.status = 503;
      return { error: "CLERK_JWKS_URL is not configured." };
    }

    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

    if (!token) {
      set.status = 401;
      return { error: "Missing bearer token.", plan: "free" };
    }

    try {
      const jwks = getJWKS(jwksUrl);
      const { payload } = await jwtVerify(token, jwks);
      const resolved = await resolvePlan(db, payload);
      return {
        ok: true,
        userId: resolved.userId,
        email: resolved.email,
        plan: resolved.plan,
      };
    } catch {
      set.status = 401;
      return { error: "Invalid token.", plan: "free" };
    }
  }
);
