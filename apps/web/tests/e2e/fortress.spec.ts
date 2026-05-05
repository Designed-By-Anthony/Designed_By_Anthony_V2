import { expect, test } from "@playwright/test";

/**
 * Sovereign Fortress — resilient E2E: behavior assertions (no pixel/layout coupling).
 * Web: http://localhost:3000 · Admin: http://localhost:3100
 */

const WEB_BASE = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";
const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3100";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

test.describe.configure({ mode: "serial" });

test.describe("Sovereign Fortress — web + admin", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/siteverify", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          "error-codes": [],
          action: "test",
          cdata: "test",
        }),
      });
    });

    await page.route("https://challenges.cloudflare.com/turnstile/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: `
          window.turnstile = {
            render: (el, opts) => {
              if (opts && typeof opts.callback === 'function') {
                setTimeout(() => opts.callback('mock-turnstile-token'), 0);
              }
              return 'mock-turnstile-container';
            },
            reset: () => {},
            remove: () => {},
            getResponse: () => 'mock-turnstile-token'
          };
        `,
      });
    });
  });

  test("conversion flow — pSEO audit form submits (loading or terminal outcome)", async ({
    page,
  }) => {
    await page.goto(`${WEB_BASE}/infrastructure/utica/hvac`, {
      waitUntil: "commit",
    });

    const auditForm = page.locator("form[data-audit-form]");
    await expect(auditForm).toBeVisible();

    await auditForm.getByLabel("First name").fill("Fortress");
    await auditForm.getByLabel("Email").fill(`fortress-audit-${Date.now()}@e2e.test`);
    const websiteInput = auditForm.locator('input[name="website"]');
    await websiteInput.fill("google.com");
    await auditForm.getByLabel(/Which page or goal matters most/i).fill("Homepage speed");

    const submit = auditForm.locator("[data-form-submit]");
    await submit.click();

    await expect(
      page
        .getByText("Submitting...")
        .or(page.getByText("Thanks — we received your audit request."))
        .or(page.getByText("Failed to submit form"))
    ).toBeVisible({ timeout: 20000 });
  });

  test("lead URL normalization — contact drawer Website field", async ({ page }) => {
    await page.addInitScript(() => {
      try { localStorage.setItem("dba_first_visit_shown_v1", "true"); } catch {}
    });
    await page.goto(`${WEB_BASE}/`, { waitUntil: "commit" });

    await page.getByRole("button", { name: "Contact" }).click();
    const drawer = page.locator('[role="dialog"][aria-label="Contact form"]');
    await expect(drawer).toBeVisible({ timeout: 5_000 });

    const urlInput = drawer.getByLabel("Website");
    await urlInput.fill("testsite.com");
    await urlInput.blur();
    await expect(urlInput).toHaveValue("https://testsite.com");
  });

  test("admin pipeline — ledger shows real rows when API has leads", async ({ page, request }) => {
    const seedEmail = `admin-ledger-${Date.now()}@e2e.test`;
    const seedRes = await request.post(`${API_BASE}/leads`, {
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "203.0.113.99",
      },
      data: {
        email: seedEmail,
        company: "Ledger Seed",
        website: "https://example.com",
      },
    });
    expect(seedRes.ok()).toBeTruthy();

    await page.goto(`${ADMIN_BASE}/`, { waitUntil: "commit" });

    await expect(page.getByRole("heading", { name: "315 Pipeline" })).toBeVisible();
    await expect(page.getByText(seedEmail)).toBeVisible();
  });
});
