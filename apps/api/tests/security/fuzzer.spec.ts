import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

/**
 * Native security fuzzer — hits the live Wrangler worker (no Docker / ZAP).
 * Endpoint: POST /leads (worker mounts `/leads`, not `/api/leads`).
 */

const API_LEADS = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787"}/leads`;
const API_RATE_LIMITS = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787"}/api/test/rate-limits`;

function ipHeaders(ip: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Forwarded-For": ip,
  };
}

function makeTestIp(): string {
  const hex = randomUUID().replaceAll("-", "");
  const octetA = Number.parseInt(hex.slice(0, 2), 16);
  const octetB = Number.parseInt(hex.slice(2, 4), 16);
  const octetC = Number.parseInt(hex.slice(4, 6), 16);
  return `203.${octetA}.${octetB}.${octetC}`;
}

test.describe.configure({ mode: "serial" });

test.describe("Sovereign Fortress — API fuzzer", () => {
  test.beforeEach(async ({ request }) => {
    await request.delete(API_RATE_LIMITS);
  });

  test("rate limit — 6th rapid POST returns 429", async ({ request }) => {
    const ip = makeTestIp();
    const headers = ipHeaders(ip);

    for (let i = 1; i <= 5; i++) {
      const res = await request.post(API_LEADS, {
        headers,
        data: {
          email: `rate-fuzz-${i}-${randomUUID()}@test.example.com`,
          company: "Rate test",
          website: "https://example.com",
        },
      });
      expect(res.status(), `POST ${i} should succeed`).toBe(200);
    }

    const blocked = await request.post(API_LEADS, {
      headers,
      data: {
        email: `rate-fuzz-6-${randomUUID()}@test.example.com`,
        company: "Rate test",
        website: "https://example.com",
      },
    });
    expect(blocked.status()).toBe(429);
  });

  test("SQLi — malicious email rejected or sanitized, never 500", async ({ request }) => {
    const res = await request.post(API_LEADS, {
      headers: ipHeaders(makeTestIp()),
      data: {
        email: "' OR 1=1 --",
        company: "Inject",
        website: "https://example.com",
      },
    });

    expect(res.status()).not.toBe(500);
    expect([200, 400, 422, 429]).toContain(res.status());
  });

  test("XSS payload in company — no server error", async ({ request }) => {
    const res = await request.post(API_LEADS, {
      headers: ipHeaders(makeTestIp()),
      data: {
        email: `xss-${randomUUID()}@test.example.com`,
        company: "<script>alert('xss')</script>",
        website: "https://example.com",
      },
    });

    expect(res.status()).not.toBe(500);
    expect([200, 400, 422, 429]).toContain(res.status());
  });
});
