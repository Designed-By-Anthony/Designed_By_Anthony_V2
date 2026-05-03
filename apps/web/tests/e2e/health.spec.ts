import { expect, test } from "@playwright/test";

const WEB_BASE = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";
const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3100";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

test.describe("Stack health", () => {
  test("web root responds", async ({ request }) => {
    const res = await request.get(`${WEB_BASE}/`);
    expect(res.status()).toBeLessThan(500);
  });

  test("API /health responds OK", async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    expect(res.ok()).toBeTruthy();
  });

  test("admin app serves pipeline shell", async ({ request }) => {
    const res = await request.get(`${ADMIN_BASE}/`);
    expect(res.status()).toBeLessThan(500);
  });
});
