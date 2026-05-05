import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

/**
 * API Surface — "No Stone Unturned" validation & security suite.
 *
 * Covers the gaps identified in the chaos-suite audit that were not
 * addressed by the existing fuzzer.spec.ts:
 *
 *   · Missing required fields on /api/lead-email → 400 with structured errors
 *   · Missing required fields on /api/audit → 400
 *   · Invalid email format → 400 with field-level error
 *   · Empty body {} → 400/422
 *   · null values for required fields → not 500
 *   · Requests without Content-Type → not 500
 *   · HTTP method enforcement (PUT / PATCH / DELETE on read-only routes)
 *   · /api/audit rate-limit enforcement (6th rapid POST → 429)
 *   · Security: path traversal in URL fields
 *   · Security: unicode / emoji stress in all string fields
 *   · Security: very long X-Source-Origin header (10 KB)
 *   · Security: deeply nested JSON body (prototype pollution guard)
 *   · GET /health returns structured JSON { ok: true, service: "dba-api" }
 *
 * Run with: bun run test
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";
const RATE_RESET = `${API}/api/test/rate-limits`;

// ── helpers ───────────────────────────────────────────────────────────────

/** Generate a unique IP-style string so every test gets a fresh rate-limit bucket. */
function makeTestIp(): string {
  const hex = randomUUID().replaceAll("-", "");
  const a = Number.parseInt(hex.slice(0, 2), 16);
  const b = Number.parseInt(hex.slice(2, 4), 16);
  const c = Number.parseInt(hex.slice(4, 6), 16);
  return `203.${a}.${b}.${c}`;
}

function jsonHeaders(ip?: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(ip ? { "X-Forwarded-For": ip } : {}),
  };
}

// ═════════════════════════════════════════════════════════════════════════
// SECTION 1 — Input validation: POST /api/lead-email
// ═════════════════════════════════════════════════════════════════════════

test.describe("API Surface — Input Validation (/api/lead-email)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ request }) => {
    await request.delete(RATE_RESET);
  });

  test("missing name → 400 with structured { errors } array", async ({ request }) => {
    const res = await request.post(`${API}/api/lead-email`, {
      headers: jsonHeaders(makeTestIp()),
      data: { email: `missing-name-${randomUUID()}@test.example` },
    });

    expect(res.status()).toBe(400);
    const body = (await res.json()) as { errors?: Array<{ message: string }> };
    expect(Array.isArray(body.errors), "Body must have an errors array").toBe(true);
    expect(body.errors!.length).toBeGreaterThan(0);
    expect(typeof body.errors![0].message).toBe("string");
  });

  test("missing email → 400 with structured { errors } array", async ({ request }) => {
    const res = await request.post(`${API}/api/lead-email`, {
      headers: jsonHeaders(makeTestIp()),
      data: { name: "No Email Provided" },
    });

    expect(res.status()).toBe(400);
    const body = (await res.json()) as { errors?: Array<{ message: string }> };
    expect(Array.isArray(body.errors)).toBe(true);
  });

  test("invalid email format → 400 with an email-related error message", async ({ request }) => {
    const res = await request.post(`${API}/api/lead-email`, {
      headers: jsonHeaders(makeTestIp()),
      data: { name: "Format Tester", email: "this-is-not-an-email" },
    });

    expect(res.status()).toBe(400);
    const body = (await res.json()) as { errors?: Array<{ field?: string; message: string }> };
    expect(Array.isArray(body.errors)).toBe(true);
    const hasEmailError = body.errors!.some((e) => /email/i.test(e.message) || e.field === "email");
    expect(hasEmailError, "At least one error must reference the email field").toBe(true);
  });

  test("empty body {} → 400 or 422, never 500", async ({ request }) => {
    const res = await request.post(`${API}/api/lead-email`, {
      headers: jsonHeaders(makeTestIp()),
      data: {},
    });

    expect([400, 422]).toContain(res.status());
    const body = (await res.json()) as { errors?: unknown[] };
    expect(body.errors).toBeTruthy();
  });

  test("null values for required fields → not 500, structured JSON", async ({ request }) => {
    const res = await request.post(`${API}/api/lead-email`, {
      headers: jsonHeaders(makeTestIp()),
      data: { name: null, email: null },
    });

    expect(res.status()).not.toBe(500);
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toContain("application/json");
  });

  test("body is a JSON array (not an object) → not 500", async ({ request }) => {
    const res = await request.fetch(`${API}/api/lead-email`, {
      method: "POST",
      headers: jsonHeaders(makeTestIp()),
      data: JSON.stringify([{ name: "a", email: "b@c.com" }]),
    });

    expect(res.status()).not.toBe(500);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 2 — Input validation: POST /api/audit
// ═════════════════════════════════════════════════════════════════════════

test.describe("API Surface — Input Validation (/api/audit)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ request }) => {
    await request.delete(RATE_RESET);
  });

  const validBase = {
    email: `audit-valid-${randomUUID()}@test.example`,
    name: "Audit Tester",
    company: "Test Co.",
  };

  test("missing URL → 400 with structured error", async ({ request }) => {
    const res = await request.post(`${API}/api/audit`, {
      headers: jsonHeaders(makeTestIp()),
      data: { ...validBase },
    });

    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBeTruthy();
    expect(body.error).not.toMatch(/TypeError|at Object\.|at Module\./);
  });

  test("missing email → 400", async ({ request }) => {
    const res = await request.post(`${API}/api/audit`, {
      headers: jsonHeaders(makeTestIp()),
      data: { url: "https://example.com", name: "Audit Tester", company: "Test Co." },
    });

    expect(res.status()).toBe(400);
  });

  test("missing name → 400", async ({ request }) => {
    const res = await request.post(`${API}/api/audit`, {
      headers: jsonHeaders(makeTestIp()),
      data: {
        url: "https://example.com",
        email: `no-name-${randomUUID()}@test.example`,
        company: "Test Co.",
      },
    });

    expect(res.status()).toBe(400);
  });

  test("missing company → 400", async ({ request }) => {
    const res = await request.post(`${API}/api/audit`, {
      headers: jsonHeaders(makeTestIp()),
      data: {
        url: "https://example.com",
        email: `no-company-${randomUUID()}@test.example`,
        name: "Audit Tester",
      },
    });

    expect(res.status()).toBe(400);
  });

  test("non-http(s) URL (ftp://) → 400", async ({ request }) => {
    const res = await request.post(`${API}/api/audit`, {
      headers: jsonHeaders(makeTestIp()),
      data: {
        url: "ftp://example.com",
        email: `ftp-${randomUUID()}@test.example`,
        name: "FTP Tester",
        company: "FTP Co.",
      },
    });

    expect(res.status()).toBe(400);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 3 — Content-Type & body edge cases
// ═════════════════════════════════════════════════════════════════════════

test.describe("API Surface — Content-Type & Body Edge Cases", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ request }) => {
    await request.delete(RATE_RESET);
  });

  test("POST /leads without Content-Type header → not 500", async ({ request }) => {
    // Elysia must not crash the Worker on an unexpected content type
    const res = await request.fetch(`${API}/leads`, {
      method: "POST",
      headers: { "X-Forwarded-For": makeTestIp() },
      data: "this is not JSON",
    });

    expect(res.status()).not.toBe(500);
  });

  test("POST /api/lead-email without Content-Type → not 500", async ({ request }) => {
    const res = await request.fetch(`${API}/api/lead-email`, {
      method: "POST",
      headers: { "X-Forwarded-For": makeTestIp() },
      data: "plaintext body",
    });

    expect(res.status()).not.toBe(500);
  });

  test("POST /api/audit with text/plain body → not 500", async ({ request }) => {
    const res = await request.fetch(`${API}/api/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "X-Forwarded-For": makeTestIp(),
      },
      data: "not JSON at all",
    });

    expect(res.status()).not.toBe(500);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 4 — HTTP method enforcement
// ═════════════════════════════════════════════════════════════════════════

test.describe("API Surface — HTTP Method Enforcement", () => {
  test("PUT /leads → not 2xx (method not defined on this route)", async ({ request }) => {
    const res = await request.put(`${API}/leads`, {
      headers: jsonHeaders(makeTestIp()),
      data: { email: `put-probe@test.example` },
    });

    expect(
      res.status(),
      `PUT /leads should not return 2xx — got ${res.status()}`
    ).toBeGreaterThanOrEqual(400);
  });

  test("PATCH /leads → not 2xx", async ({ request }) => {
    const res = await request.patch(`${API}/leads`, {
      headers: jsonHeaders(makeTestIp()),
      data: {},
    });

    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("PATCH /api/lead-email → not 2xx", async ({ request }) => {
    const res = await request.patch(`${API}/api/lead-email`, {
      headers: jsonHeaders(makeTestIp()),
      data: {},
    });

    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("DELETE /api/lead-email → not 2xx", async ({ request }) => {
    const res = await request.delete(`${API}/api/lead-email`);

    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("POST /health → not 500 (may be 404 or 405, must not crash)", async ({ request }) => {
    const res = await request.post(`${API}/health`);

    expect(res.status()).not.toBe(500);
  });

  test("DELETE /api/audit → not 2xx", async ({ request }) => {
    const res = await request.delete(`${API}/api/audit`);

    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 5 — Rate limiting: POST /api/audit
// ═════════════════════════════════════════════════════════════════════════

test.describe("API Surface — Rate Limiting (/api/audit)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ request }) => {
    await request.delete(RATE_RESET);
  });

  test("6th rapid POST → 429 with Retry-After header and structured error", async ({ request }) => {
    const ip = makeTestIp();
    const headers = jsonHeaders(ip);

    // Send 5 requests to consume the budget
    // (each will 400 due to missing audit bindings locally — that's expected)
    for (let i = 1; i <= 5; i++) {
      const res = await request.post(`${API}/api/audit`, {
        headers,
        data: {
          url: `https://example-${i}-${randomUUID()}.com`,
          email: `rl-audit-${i}@test.example`,
          name: "Rate Limit Tester",
          company: "RL Audit Co.",
        },
      });
      // Allow 200, 400, 503 (missing bindings) — just not 429 on the first 5
      expect(res.status(), `POST ${i}/5 to /api/audit should not yet be rate-limited`).not.toBe(
        429
      );
    }

    // 6th request must be rejected
    const blocked = await request.post(`${API}/api/audit`, {
      headers,
      data: {
        url: "https://example-final.com",
        email: "rl-audit-6@test.example",
        name: "Rate Limit Tester",
        company: "RL Audit Co.",
      },
    });

    expect(blocked.status()).toBe(429);

    const retryAfter = blocked.headers()["retry-after"];
    expect(retryAfter, "Retry-After header must be present on 429").toBeTruthy();
    expect(Number(retryAfter)).toBeGreaterThan(0);

    const body = (await blocked.json()) as { error?: string };
    expect(body.error).toMatch(/too many|rate limit/i);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 6 — Security probes
// ═════════════════════════════════════════════════════════════════════════

test.describe("API Surface — Security Probes", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ request }) => {
    await request.delete(RATE_RESET);
  });

  test("path traversal in website field → not 500 (must not reach filesystem)", async ({
    request,
  }) => {
    const res = await request.post(`${API}/leads`, {
      headers: jsonHeaders(makeTestIp()),
      data: {
        email: `traverse-${randomUUID()}@test.example`,
        company: "Traverse Corp",
        website: "../../etc/passwd",
      },
    });

    expect(res.status()).not.toBe(500);
  });

  test("path traversal in /api/audit URL field → 400 (normalizeHttpUrl rejects it)", async ({
    request,
  }) => {
    const res = await request.post(`${API}/api/audit`, {
      headers: jsonHeaders(makeTestIp()),
      data: {
        url: "../../etc/passwd",
        email: `traverse-audit-${randomUUID()}@test.example`,
        name: "Traverse Tester",
        company: "Traverse Co.",
      },
    });

    // normalizeHttpUrl strips non-http(s) schemes; should return 400
    expect(res.status()).not.toBe(500);
    expect([400, 403]).toContain(res.status());
  });

  test("unicode and emoji in /leads string fields → not 500", async ({ request }) => {
    const res = await request.post(`${API}/leads`, {
      headers: jsonHeaders(makeTestIp()),
      data: {
        email: `unicode-${randomUUID()}@test.example`,
        company: "😂🔥 <script>Co.</script>",
        website: "https://example.com",
        description: "Ñoño 日本語 العربية 🎯🔒 zero-width\u200Bspace \uFEFF BOM",
      },
    });

    expect(res.status()).not.toBe(500);
  });

  test("unicode and emoji in /api/lead-email fields → not 500", async ({ request }) => {
    const res = await request.post(`${API}/api/lead-email`, {
      headers: jsonHeaders(makeTestIp()),
      data: {
        name: "Ûñíçödê Tëstër 🎭",
        email: `unicode-email-${randomUUID()}@test.example`,
        message: "🔒🔓 <script>unicode</script> 日本語テスト\u200B",
      },
    });

    expect(res.status()).not.toBe(500);
  });

  test("very long X-Source-Origin header (10 KB) → not 500", async ({ request }) => {
    const longHeaderValue = "A".repeat(10_000);

    const res = await request.post(`${API}/leads`, {
      headers: {
        ...jsonHeaders(makeTestIp()),
        "X-Source-Origin": longHeaderValue,
      },
      data: {
        email: `long-header-${randomUUID()}@test.example`,
        company: "Header Stress Corp",
      },
    });

    // Worker may reject with 400 / 413 / 431 — must not crash with 500
    expect(res.status()).not.toBe(500);
  });

  test("deeply nested JSON body (50 levels) → not 500 (prototype-pollution guard)", async ({
    request,
  }) => {
    // Build a 50-level deep object
    type DeepObj = { nested?: DeepObj } & Record<string, unknown>;
    const root: DeepObj = {};
    let cursor: DeepObj = root;
    for (let i = 0; i < 50; i++) {
      cursor.nested = {};
      cursor = cursor.nested;
    }
    cursor.value = "leaf";

    const res = await request.post(`${API}/leads`, {
      headers: jsonHeaders(makeTestIp()),
      data: {
        email: `deep-nest-${randomUUID()}@test.example`,
        company: "Nested Corp",
        custom: root,
      },
    });

    expect(res.status()).not.toBe(500);
  });

  test("JSON with __proto__ key → not 500 (prototype pollution must not crash)", async ({
    request,
  }) => {
    const res = await request.fetch(`${API}/leads`, {
      method: "POST",
      headers: jsonHeaders(makeTestIp()),
      data: JSON.stringify({
        email: `proto-${randomUUID()}@test.example`,
        company: "Proto Corp",
        // biome-ignore format: intentional prototype pollution probe
        "__proto__": { polluted: true },
        constructor: { prototype: { polluted: true } },
      }),
    });

    expect(res.status()).not.toBe(500);
  });

  test("null byte in string field → not 500", async ({ request }) => {
    const res = await request.fetch(`${API}/leads`, {
      method: "POST",
      headers: jsonHeaders(makeTestIp()),
      data: JSON.stringify({
        email: `null-byte-${randomUUID()}@test.example`,
        company: "Null\u0000Corp",
        website: "https://exam\u0000ple.com",
      }),
    });

    expect(res.status()).not.toBe(500);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 7 — Health check schema validation
// ═════════════════════════════════════════════════════════════════════════

test.describe("API Surface — Health Check Schema", () => {
  test("GET /health → 200, Content-Type: application/json, { ok: true, service: 'dba-api' }", async ({
    request,
  }) => {
    const res = await request.get(`${API}/health`);
    expect(res.ok()).toBeTruthy();

    const ct = res.headers()["content-type"] ?? "";
    expect(ct, "Content-Type must be application/json").toContain("application/json");

    const body = (await res.json()) as { ok?: boolean; service?: string };
    expect(body.ok).toBe(true);
    expect(body.service).toBe("dba-api");
  });

  test("GET /health has Cache-Control: no-store header", async ({ request }) => {
    const res = await request.get(`${API}/health`);

    const cc = res.headers()["cache-control"] ?? "";
    expect(cc).toContain("no-store");
  });
});
