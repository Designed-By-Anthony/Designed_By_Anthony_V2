import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

/**
 * 🔥 CHAOS SUITE — "Trial by Fire" QA Protocol
 *
 * Attacks 4 pillars: Integration, Security, Visual Integrity, Data Stress.
 * Run with: bun run test:chaos
 *
 * ─── PRE-FLIGHT CHECKLIST ────────────────────────────────────────────────
 *
 * Environment variables to verify before launch:
 *
 * [REQUIRED — all pillars]
 *   NEXT_PUBLIC_API_URL       Worker base URL          (default: http://localhost:8787)
 *   NEXT_PUBLIC_WEB_URL       Marketing site URL        (default: http://localhost:3000)
 *
 * [REQUIRED — Pillar 2 security tests]
 *   ADMIN_PROMOTE_SECRET      Secret that guards POST /api/admin/promote.
 *                             If absent the route returns 503 instead of 401.
 *                             Set in apps/api/.dev.vars for local Wrangler.
 *
 *   CLERK_JWKS_URL            Clerk JWKS endpoint for GET /auth/verify.
 *                             Set in apps/api/.dev.vars  (e.g.
 *                             https://clerk.designedbyanthony.com/.well-known/jwks.json).
 *                             If absent the route returns 503 instead of 401.
 *
 * [OPTIONAL — enables Turnstile validation]
 *   TURNSTILE_SECRET_KEY      If set, /api/lead-email rejects requests without a
 *                             valid cf_turnstile_response token. Pillar 1 mocks
 *                             Turnstile in the browser, so this should NOT cause
 *                             failures unless the Worker is also reading the token.
 *
 * [OPTIONAL — Slack / Resend / Gmail notifications]
 *   SLACK_WEBHOOK_URL         If absent, Slack notifications are silently skipped.
 *   RESEND_API_KEY            Required for email delivery via Resend.
 *   LEAD_EMAIL_TO             Override default notification recipient.
 *
 * ─── FLAGGED GAPS (review before launch) ────────────────────────────────
 *
 * 🚨 GAP-1 · "Server is busy, trying again" copy does not exist.
 *    The current SovereignLeadForm / SovereignDrawerForm shows
 *    "Failed to submit form. Please try again." on any fetch failure.
 *    The spec below asserts on the actual copy. Update this string
 *    or update the component copy before launch if you want the
 *    exact phrase "Server is busy, trying again."
 *
 * 🚨 GAP-2 · ADMIN_CLERK_ID rate-limit bypass is NOT implemented.
 *    The problem statement references an "ADMIN_CLERK_ID" God Mode bypass
 *    that skips rate limits. This env var and the corresponding bypass
 *    logic do not exist anywhere in the API codebase. The rate-limit
 *    reset is done via DELETE /api/test/rate-limits. Implement and add
 *    the bypass before claiming this pillar fully green.
 *
 * 🚨 GAP-3 · /vault and /admin are NOT in Clerk's isProtectedRoute.
 *    apps/web/src/middleware.ts only guards /dashboard(.*) and /account(.*).
 *    /vault is protected at the edge by Cloudflare Access (cf-access-*
 *    headers). Confirm that CF Access is active in production before launch.
 *    Without it, the /vault page is publicly reachable in dev.
 *
 * 🚨 GAP-4 · Audit pipeline requires Cloudflare KV + Queue bindings.
 *    POST /api/audit returns 500 "Audit pipeline is not configured." in
 *    local Wrangler if AUDIT_REPORTS_KV or PDF_GEN_QUEUE bindings are
 *    absent. This is expected locally; the Chaos Suite asserts on
 *    structured JSON (not a raw Worker crash page).
 *
 * ─────────────────────────────────────────────────────────────────────────
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";
const WEB = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";

// ── named constants ───────────────────────────────────────────────────────

/** Characters to stress-test the message/metadata columns. */
const MAX_MESSAGE_STRESS_LENGTH = 5000;

/**
 * Delay in ms used to simulate a slow/hung API response.
 * 5.5 s exceeds a reasonable 5 s UX timeout and triggers the
 * "request aborted" code path in the form's fetch handler.
 */
const API_TIMEOUT_THRESHOLD_MS = 5500;

/**
 * Minimum z-index for a sticky site header to stay above scrolled content.
 * Values below 10 risk page sections painting on top of the nav bar;
 * 10 sits above default stacking contexts while leaving room for modals (100+).
 */
const STICKY_HEADER_MIN_Z_INDEX = 10;

/** Brand-indigo color values used to detect ghost-button regressions. */
const BRAND_INDIGO_RGB = "26, 42, 64";
const BRAND_INDIGO_HEX = "#1a2a40";

// ── type aliases ─────────────────────────────────────────────────────────

type TestContext = Parameters<Parameters<typeof test>[1]>[0];
type PlaywrightRequest = TestContext["request"];

// ── helpers ───────────────────────────────────────────────────────────────

function randomEmail(): string {
  return `chaos-${randomUUID()}@example.test`;
}

/** Generate a string of `length` repeated characters for stress tests. */
function stressMessage(length: number, char = "A"): string {
  return char.repeat(length);
}

/** Reset in-memory rate-limit buckets so tests don't bleed into each other. */
async function resetRateLimits(request: PlaywrightRequest) {
  await request.delete(`${API}/api/test/rate-limits`);
}

// ═════════════════════════════════════════════════════════════════════════
// PILLAR 1 — The "Heavy Cross" Integration Gauntlet
// ═════════════════════════════════════════════════════════════════════════

test.describe("Chaos · Pillar 1 — Integration Gauntlet", () => {
  test.describe.configure({ mode: "serial" });

  test("CORS preflight handshake — OPTIONS returns 204 with wildcard CORS headers", async ({
    request,
  }) => {
    const res = await request.fetch(`${API}/api/lead-email`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://designedbyanthony.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type, X-Source-Origin",
      },
    });

    // The global CORS wrapper in apps/api/src/index.ts must return 204
    expect(res.status()).toBe(204);

    const acao = res.headers()["access-control-allow-origin"];
    expect(acao, "CORS must allow all origins (or the marketing domain)").toBeTruthy();

    const acah = res.headers()["access-control-allow-headers"];
    expect(acah, "X-Source-Origin must be whitelisted in CORS").toBeTruthy();
    // Wildcard "*" or an explicit enumeration both satisfy the spec
    const acceptsCustomHeader = acah === "*" || acah.toLowerCase().includes("x-source-origin");
    expect(acceptsCustomHeader, `Access-Control-Allow-Headers: ${acah}`).toBe(true);
  });

  test("Lead submission → POST /leads → D1 write-back verified via GET /leads", async ({
    request,
  }) => {
    await resetRateLimits(request);

    const email = randomEmail();
    const metadata = { widget: "chaos-suite", score: 42, nested: { fire: true } };

    const postRes = await request.post(`${API}/leads`, {
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": `203.${Math.floor(Math.random() * 254)}.1.1`,
        "X-Source-Origin": "chaos-suite",
      },
      data: {
        email,
        company: "Chaos Fire Co.",
        website: "https://chaos.fire.test",
        sourceId: "chaos-suite",
        ...metadata,
      },
    });

    expect(
      postRes.ok(),
      `POST /leads should succeed — got ${postRes.status()}: ${await postRes.text()}`
    ).toBeTruthy();

    const body = (await postRes.json()) as { success?: boolean; lead?: { metadata?: string } };
    expect(body.success).toBe(true);

    // Verify D1 write: metadata JSON must be stored (GET /leads reads D1 directly)
    const getRes = await request.get(`${API}/leads`);
    expect(getRes.ok()).toBeTruthy();

    const leads = (await getRes.json()) as { leads?: Array<{ email: string; metadata: string }> };
    const inserted = leads.leads?.find((l) => l.email === email);

    expect(inserted, `Lead with email ${email} must appear in GET /leads`).toBeTruthy();

    // Metadata JSON round-trip: the "JSON packer" in leadsRoute must preserve custom fields
    expect(inserted?.metadata, "metadata column must be a non-null JSON string").not.toBeNull();

    const parsedMeta = JSON.parse(inserted?.metadata ?? "{}") as Record<string, unknown>;
    expect(parsedMeta.widget).toBe("chaos-suite");
    expect(parsedMeta.score).toBe(42);
  });

  test("API timeout → UI shows graceful error, not a crash or silent hang", async ({ page }) => {
    // Mock Turnstile so the form can reach the submit handler
    await page.route("https://challenges.cloudflare.com/turnstile/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: `
          window.turnstile = {
            render: (el, opts) => {
              if (opts?.callback) setTimeout(() => opts.callback("mock-token"), 0);
              return "mock-container";
            },
            reset: () => {}, remove: () => {},
            getResponse: () => "mock-token",
          };
        `,
      });
    });

    // Intercept the lead-email API call and delay it beyond a realistic timeout
    await page.route(`${API}/api/lead-email`, async (route) => {
      // Simulate a slow/broken response then abort
      await new Promise((r) => setTimeout(r, API_TIMEOUT_THRESHOLD_MS));
      route.abort("timedout");
    });

    await page.addInitScript(() => {
    try { localStorage.setItem('dba_first_visit_shown_v1', 'true'); } catch (e) {}
  });
  await page.goto(`${WEB}/contact`, { waitUntil: "commit", timeout: 30000 });

    // Fill required fields — works for SovereignLeadForm at /contact
    const form = page.locator('form:has(button:has-text("Let\'s build something great."))');
    await form.getByLabel(/first name/i).fill("Chaos Tester");
    await form.getByLabel(/email/i).fill(randomEmail());
    await form.getByLabel(/message/i).fill("Trial by fire — timeout test.");

    await form.locator("[type=submit]").click();

    // After the timeout the form must show a user-friendly error — NOT a blank
    // page, NOT a generic "500", NOT a stack trace.
    //
    // 🚨 GAP-1 reminder: current copy is "Failed to submit form. Please try again."
    // Update the regex below to match "Server is busy" once the copy is updated.
    await expect(
      page
        .getByText(/failed to submit|please try again|something went wrong|server is busy/i)
        .first()
    ).toBeVisible({ timeout: 12000 });

    // Assert no unhandled JS error surfaced as a Next.js error overlay
    const errorOverlay = page.locator("[data-nextjs-dialog], #__next_error__");
    await expect(errorOverlay).not.toBeVisible();
  });
});

// ═════════════════════════════════════════════════════════════════════════
// PILLAR 2 — Security & Auth "Infiltrator" Suite
// ═════════════════════════════════════════════════════════════════════════

test.describe("Chaos · Pillar 2 — Security & Auth Infiltration", () => {
  test.describe.configure({ mode: "serial" });

  test("GET /api/vault/project without CF-Access header → 401", async ({ request }) => {
    // No cf-access-authenticated-user-email header → vault route must reject
    const res = await request.get(`${API}/api/vault/project`);
    expect(res.status(), "Vault API must return 401 when CF Access header is absent").toBe(401);

    const body = (await res.json()) as { error?: string };
    expect(body.error).toBeTruthy();
  });

  test("POST /api/vault/message without CF-Access header → 401", async ({ request }) => {
    const res = await request.post(`${API}/api/vault/message`, {
      headers: { "Content-Type": "application/json" },
      data: { message_text: "Infiltrator probe." },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /auth/verify without Bearer token → 401", async ({ request }) => {
    const res = await request.get(`${API}/auth/verify`);
    // 401 (no token) or 503 (CLERK_JWKS_URL not configured locally)
    expect([401, 503]).toContain(res.status());
    const body = (await res.json()) as { error?: string; plan?: string };
    expect(body.error).toBeTruthy();
  });

  test("GET /auth/verify with garbage Bearer token → 401", async ({ request }) => {
    const res = await request.get(`${API}/auth/verify`, {
      headers: { Authorization: "Bearer this.is.not.a.real.jwt" },
    });
    expect([401, 503]).toContain(res.status());
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBeTruthy();
  });

  test("Vertical privilege escalation — POST /api/admin/promote without secret → 401 or 503", async ({
    request,
  }) => {
    // Standard user (no Bearer) attempts to promote a lead — must be rejected
    const res = await request.post(`${API}/api/admin/promote`, {
      headers: { "Content-Type": "application/json" },
      data: { lead_id: randomUUID() },
    });

    // 401 = ADMIN_PROMOTE_SECRET is set and bearer doesn't match
    // 503 = ADMIN_PROMOTE_SECRET not configured (still safe; route is inoperable)
    expect(
      [401, 503].includes(res.status()),
      `Expected 401 or 503, got ${res.status()} — route must NOT return 2xx to an unauthenticated caller`
    ).toBe(true);

    // Must never silently succeed
    const body = (await res.json()) as { ok?: boolean; error?: string };
    expect(body.ok).not.toBe(true);
    expect(body.error).toBeTruthy();
  });

  test("Vertical privilege escalation — POST /api/admin/promote with fake Bearer → 401 or 503", async ({
    request,
  }) => {
    const res = await request.post(`${API}/api/admin/promote`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer FAKE_ATTACKER_TOKEN_" + randomUUID(),
      },
      data: { lead_id: randomUUID() },
    });

    expect(
      [401, 503].includes(res.status()),
      `Fake Bearer must not gain admin access — got ${res.status()}`
    ).toBe(true);

    const body = (await res.json()) as { ok?: boolean };
    expect(body.ok).not.toBe(true);
  });

  test("DELETE /api/test/rate-limits resets buckets (rate-limit bypass mechanism)", async ({
    request,
  }) => {
    // This is the legitimate in-test bypass. Verify it works so Pillar 4 tests
    // are reliable.
    //
    // 🚨 GAP-2 reminder: ADMIN_CLERK_ID God Mode bypass is NOT implemented.
    // If you need a production-safe bypass, implement it in testRateLimits.ts
    // gated by a secret header before enabling in production Workers.
    const res = await request.delete(`${API}/api/test/rate-limits`);
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { success?: boolean };
    expect(body.success).toBe(true);
  });

  test("Web /vault page — middleware does NOT redirect unauthenticated users (GAP-3 confirmation)", async ({
    page,
  }) => {
    // 🚨 GAP-3: Clerk middleware only protects /dashboard and /account.
    // /vault is NOT in isProtectedRoute. Cloudflare Access is the actual guard
    // in production, but locally the page is reachable without auth.
    // This test DOCUMENTS that gap so the team is aware.
    const res = await page.goto(`${WEB}/vault`, { waitUntil: "commit" });
    // We don't assert a redirect — we assert the gap exists by checking the
    // page actually loads (no Clerk redirect to /sign-in).
    const status = res?.status() ?? 0;
    expect(
      status,
      "If this fails with a 302/auth-redirect it means GAP-3 has been fixed ✅"
    ).toBeLessThan(400);
    // Flag the gap explicitly in the test output using Playwright's annotation API.
    test.info().annotations.push({
      type: "GAP-3",
      description:
        "⚠️  /vault loaded without Clerk auth. Ensure Cloudflare Access is active in production.",
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════
// PILLAR 3 — UX "Ghost" & Visual Integrity Check
// ═════════════════════════════════════════════════════════════════════════

test.describe("Chaos · Pillar 3 — UX Ghost & Visual Integrity", () => {
  test.describe.configure({ mode: "serial" });

  test("Button contrast — no ghost buttons (text color ≠ background color)", async ({ page }) => {
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded" });

    type ButtonContrast = {
      text: string;
      color: string;
      bgColor: string;
      isGhost: boolean;
    };

    const results: ButtonContrast[] = await page.evaluate(() => {
      // Select all elements that carry the shared `.btn` marker class added by the
      // design-system (btnPrimary, btnOutline, btnSecondary, btnWhite all include "btn ").
      const buttons = Array.from(document.querySelectorAll(".btn"));
      return buttons.map((el) => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;
        return {
          text: el.textContent?.trim().slice(0, 40) ?? "",
          color,
          bgColor,
          // "Ghost" = text and background resolve to identical computed color
          isGhost: color === bgColor,
        };
      });
    });

    // If no .btn elements exist on the page the suite itself is broken
    expect(
      results.length,
      "At least one .btn element must be present on the home page"
    ).toBeGreaterThan(0);

    const ghosts = results.filter((b) => b.isGhost);
    expect(
      ghosts,
      `Ghost buttons detected (text === background):\n${JSON.stringify(ghosts, null, 2)}`
    ).toHaveLength(0);
  });

  test("btnPrimary — text is #FFFFFF on slate-blue background (not brand-indigo on brand-indigo)", async ({
    page,
  }) => {
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded" });

    type PrimaryContrast = {
      text: string;
      color: string;
      bgColor: string;
    };

    const primaryButtons: PrimaryContrast[] = await page.evaluate(() => {
      // btnPrimary injects bg-[#486D8A]; select all .btn elements that are NOT outline/secondary
      const all = Array.from(document.querySelectorAll(".btn"));
      return all.map((el) => {
        const s = window.getComputedStyle(el);
        return {
          text: el.textContent?.trim().slice(0, 40) ?? "",
          color: s.color,
          bgColor: s.backgroundColor,
        };
      });
    });

    for (const btn of primaryButtons) {
      // No button should have #1A2A40 text on a #1A2A40 background (the classic ghost)
      const colorLower = btn.color.toLowerCase();
      const bgLower = btn.bgColor.toLowerCase();

      // Convert rgb(26, 42, 64) → the indigo brand color
      const isIndigoText = colorLower.includes(BRAND_INDIGO_RGB) || colorLower === BRAND_INDIGO_HEX;
      const isIndigoBg = bgLower.includes(BRAND_INDIGO_RGB) || bgLower === BRAND_INDIGO_HEX;

      expect(
        isIndigoText && isIndigoBg,
        `Button "${btn.text}" has brand-indigo on brand-indigo — invisible ghost detected!\n  color: ${btn.color}\n  background: ${btn.bgColor}`
      ).toBe(false);
    }
  });

  test("Mobile 375 px — no horizontal scrollbar, hero text legible", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded" });

    // Wait for hero entrance animations to settle (h1 uses a CSS animation with backwards
    // fill-mode that holds opacity:0 during the delay; allow up to 2 s for it to resolve).
    await page
      .waitForFunction(
        () => {
          const h1 = document.querySelector("[data-hero-h1]") ?? document.querySelector("h1");
          if (!h1) return false;
          return Number.parseFloat(window.getComputedStyle(h1).opacity) > 0;
        },
        { timeout: 2000 }
      )
      .catch(() => {
        // Best-effort — if the wait times out the assertion below surfaces the real failure.
      });

    // No horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(
      hasHorizontalScroll,
      "Horizontal scrollbar detected at 375 px — layout is overflowing!"
    ).toBe(false);

    // Hero text must exist and not be invisible (opacity > 0, non-empty)
    const heroVisible = await page.evaluate(() => {
      const candidates = [
        document.querySelector("h1"),
        document.querySelector("[data-hero-headline]"),
        document.querySelector(".hero-headline"),
      ].filter(Boolean);

      for (const el of candidates) {
        if (!el) continue;
        const s = window.getComputedStyle(el);
        const notHidden =
          s.visibility !== "hidden" &&
          s.display !== "none" &&
          Number.parseFloat(s.opacity) > 0 &&
          (el.textContent?.trim().length ?? 0) > 0;
        if (notHidden) return true;
      }
      return false;
    });

    expect(heroVisible, "No legible h1/hero headline found on mobile viewport").toBe(true);
  });

  test("Mobile 375 px — sticky header does not bleed through scroll content", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded" });

    // Header must have a z-index that keeps it above page content
    const headerZIndex = await page.evaluate(() => {
      const header =
        document.querySelector("header") ||
        document.querySelector("nav") ||
        document.querySelector("[data-site-header]");
      if (!header) return null;
      return Number.parseInt(window.getComputedStyle(header).zIndex, 10) || 0;
    });

    // A z-index of at least STICKY_HEADER_MIN_Z_INDEX is the minimum to be considered sticky
    if (headerZIndex !== null) {
      expect(
        headerZIndex,
        `Sticky header z-index is ${headerZIndex} — it may be overlapped by page content`
      ).toBeGreaterThanOrEqual(STICKY_HEADER_MIN_Z_INDEX);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════
// PILLAR 4 — Data "Stress" Test
// ═════════════════════════════════════════════════════════════════════════

test.describe("Chaos · Pillar 4 — Data Stress", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ request }) => {
    await resetRateLimits(request);
  });

  test("POST /leads with 5 000-char message — no 500, D1 does not truncate", async ({
    request,
  }) => {
    const junkMessage = stressMessage(MAX_MESSAGE_STRESS_LENGTH);
    const email = randomEmail();

    const res = await request.post(`${API}/leads`, {
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "203.0.113.42",
      },
      data: {
        email,
        company: "Stress Corp.",
        website: "https://stress.test",
        // 'description' goes into custom fields → metadata JSON column (unlimited)
        description: junkMessage,
        sourceId: "chaos-stress",
      },
    });

    // Must NOT crash the Worker
    expect(
      res.status(),
      `POST /leads with ${MAX_MESSAGE_STRESS_LENGTH}-char body should not 5xx — got ${res.status()}`
    ).not.toBe(500);

    if (res.ok()) {
      // Verify D1 preserved the full payload
      const getRes = await request.get(`${API}/leads`);
      const leads = (await getRes.json()) as { leads?: Array<{ email: string; metadata: string }> };
      const row = leads.leads?.find((l) => l.email === email);

      if (row?.metadata) {
        const meta = JSON.parse(row.metadata) as { description?: string };
        expect(
          meta.description?.length,
          `D1 must not silently truncate a ${MAX_MESSAGE_STRESS_LENGTH}-char message`
        ).toBe(MAX_MESSAGE_STRESS_LENGTH);
      }
    }
  });

  test("POST /api/audit with non-existent URL — returns structured JSON error, not a Worker crash", async ({
    request,
  }) => {
    const res = await request.post(`${API}/api/audit`, {
      headers: { "Content-Type": "application/json" },
      data: {
        url: "https://this-is-not-a-real-site-that-exists-chaos-123.com",
        email: randomEmail(),
        name: "Chaos Tester",
        company: "Chaos Inc.",
      },
    });

    // The route must return JSON — never a raw Cloudflare "Uncaught Exception" HTML page
    const contentType = res.headers()["content-type"] ?? "";
    expect(
      contentType.includes("application/json"),
      `Expected application/json but got: ${contentType}\nThis indicates an unhandled Worker exception!`
    ).toBe(true);

    // Must not 5xx with an unstructured body
    if (res.status() >= 500) {
      const body = (await res.json()) as { error?: string };
      expect(
        body.error,
        "A 5xx response must still return a structured { error } object — no raw crashes allowed"
      ).toBeTruthy();
    }
  });

  test("POST /api/audit with missing required fields — returns structured 400", async ({
    request,
  }) => {
    const res = await request.post(`${API}/api/audit`, {
      headers: { "Content-Type": "application/json" },
      data: { url: "not-even-a-url" }, // missing email, name, company
    });

    expect(res.status()).toBe(400);

    const body = (await res.json()) as { error?: string };
    expect(body.error).toBeTruthy();
    // Must be a human-readable message, not an exception stack trace
    expect(body.error).not.toMatch(/TypeError|Error:|at Object\.|at Module\./);
  });

  test("POST /api/lead-email with 5 000-char message — no 500, structured response", async ({
    request,
  }) => {
    const junkMessage = stressMessage(MAX_MESSAGE_STRESS_LENGTH, "B");

    const res = await request.post(`${API}/api/lead-email`, {
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "203.0.113.43",
      },
      data: {
        name: "Stress Tester",
        email: randomEmail(),
        message: junkMessage,
      },
    });

    // 200/ok or 503 (no email delivery configured locally) are acceptable.
    // 400 (validation) is also fine. 500 is NOT.
    expect(
      res.status(),
      `POST /api/lead-email with ${MAX_MESSAGE_STRESS_LENGTH}-char message must not 5xx — got ${res.status()}`
    ).not.toBe(500);

    const contentType = res.headers()["content-type"] ?? "";
    expect(
      contentType.includes("application/json"),
      "Response must be JSON regardless of outcome"
    ).toBe(true);
  });

  test("POST /api/audit with XSS in URL field — sanitized or rejected, never 500", async ({
    request,
  }) => {
    const res = await request.post(`${API}/api/audit`, {
      headers: { "Content-Type": "application/json" },
      data: {
        url: "javascript:alert(document.cookie)",
        email: randomEmail(),
        name: "XSS Tester",
        company: "Inject Inc.",
      },
    });

    // normalizeHttpUrl strips non-http(s) schemes → 400 expected
    expect(
      res.status(),
      `XSS URL must not reach the audit pipeline — got ${res.status()}`
    ).not.toBe(500);

    expect([400, 403]).toContain(res.status());
  });

  test("POST /leads with SQL injection in email — rejected or sanitized, never 500", async ({
    request,
  }) => {
    const res = await request.post(`${API}/leads`, {
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "203.0.113.44",
      },
      data: {
        email: "' OR '1'='1'; DROP TABLE leads; --",
        company: "Inject Corp.",
        website: "https://inject.test",
      },
    });

    // Drizzle/D1 uses parameterized queries — this must NOT crash
    expect(res.status()).not.toBe(500);
  });
});
