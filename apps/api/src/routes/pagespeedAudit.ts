import { checkLocalRateLimit } from "@dba/shared/lighthouse/lib/http";
import { Elysia } from "elysia";

/**
 * Public PageSpeed proxy for the .com marketing lead-gen audit.
 * IP-based rate limiting protects Google API quota from bot abuse.
 */
export const pagespeedAuditRoute = new Elysia({ aot: false }).post(
  "/public/pagespeed-audit",
  async ({ body: rawBody, request, set, store }) => {
    set.headers["Cache-Control"] = "no-store";

    const clientIp =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for") ||
      "unknown";

    const retryAfterSeconds = checkLocalRateLimit(`psi:${clientIp}`, 3, 600_000);
    if (retryAfterSeconds) {
      set.status = 429;
      set.headers["Retry-After"] = String(retryAfterSeconds);
      return {
        error: `Too many PageSpeed requests. Please wait ${retryAfterSeconds} seconds.`,
      };
    }

    if (!rawBody || typeof rawBody !== "object") {
      set.status = 400;
      return { error: "Invalid request body." };
    }
    const body = rawBody as Record<string, unknown>;
    const targetUrl = typeof body.url === "string" ? body.url.trim() : "";
    if (!targetUrl) {
      set.status = 400;
      return { error: "Missing required field: url" };
    }

    const strategy = typeof body.strategy === "string" ? body.strategy : "mobile";
    const categories = Array.isArray(body.categories)
      ? (body.categories as string[])
      : ["PERFORMANCE", "ACCESSIBILITY", "BEST_PRACTICES", "SEO"];
    const categoryParams = categories.map((c) => `category=${encodeURIComponent(c)}`).join("&");

    const env = (store as { env?: Record<string, unknown> }).env;
    const apiKey =
      typeof env?.GOOGLE_PAGESPEED_API_KEY === "string"
        ? env.GOOGLE_PAGESPEED_API_KEY.trim()
        : undefined;

    let psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&strategy=${encodeURIComponent(strategy)}&${categoryParams}`;
    if (apiKey) {
      psiUrl += `&key=${encodeURIComponent(apiKey)}`;
    }

    const psiRes = await fetch(psiUrl, {
      headers: { Accept: "application/json" },
    });

    set.status = psiRes.status;
    set.headers["Content-Type"] = "application/json";
    return psiRes.json();
  }
);
