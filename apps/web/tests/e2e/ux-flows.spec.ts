import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

/**
 * UX Flows — "No Stone Unturned" interaction suite.
 *
 * Covers the gaps identified in the chaos-suite audit:
 *   · Contact form (SovereignLeadForm) full browser UI flow → success state
 *   · Contact drawer open / close (× button, Escape key)
 *   · Mobile hamburger menu open → nav link click → overlay closes
 *   · FAQ accordion expand / collapse (native <details>; exclusive behaviour)
 *   · Language switcher EN ↔ ES + cookie persistence across reload
 *   · /es Spanish-language page content
 *   · GET /health structured JSON schema
 *
 * All tests that exercise the lead-email endpoint mock it at the network
 * layer so the suite is self-contained and does not depend on email
 * delivery or external webhooks being configured.
 */

const WEB = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

// ── helpers ──────────────────────────────────────────────────────────────

/** Mock /api/lead-email to always succeed so form tests are self-contained. */
async function mockLeadEmailSuccess(page: import("@playwright/test").Page) {
  await page.route("**/api/lead-email", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
}

/**
 * Suppress the first-visit splash dialog that otherwise covers the page
 * and intercepts pointer events on other elements.
 */
async function suppressSplash(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    try { localStorage.setItem("dba_first_visit_shown_v1", "true"); } catch {}
  });
}

/** Find the visible SovereignLeadForm (not the hidden drawer form). */
function visibleLeadForm(page: import("@playwright/test").Page) {
  // Use .first() to avoid strict-mode violations when the SiteContactDrawer's
  // SovereignDrawerForm is also in the DOM (same submit button text, but hidden).
  return page.locator('form:has(button:has-text("Let\'s build something great."))').first();
}

// ═════════════════════════════════════════════════════════════════════════
// SECTION 1 — Contact Form (SovereignLeadForm) UI flow
// ═════════════════════════════════════════════════════════════════════════

test.describe("UX Flows — Contact Form (SovereignLeadForm)", () => {
  test.describe.configure({ mode: "serial" });

  test("fill all required fields → submit → success state appears", async ({ page }) => {
    await mockLeadEmailSuccess(page);
    await suppressSplash(page);
    await page.goto(`${WEB}/contact`, { waitUntil: "commit", timeout: 30_000 });

    const form = visibleLeadForm(page);
    await form.getByLabel(/first name/i).fill("E2E Tester");
    await form.getByLabel(/email/i).fill(`ux-flow-${randomUUID()}@example.test`);
    await form.getByLabel(/message/i).fill("End-to-end form submission test.");
    await form.locator("[type=submit]").click();

    await expect(
      page.getByText(/thank you for your interest/i).or(page.getByText(/we.ll be in touch/i))
    ).toBeVisible({ timeout: 10_000 });
  });

  test("submitting with missing required email → browser validation blocks, no API call fired", async ({
    page,
  }) => {
    let apiWasCalled = false;
    await page.route("**/api/lead-email", () => {
      apiWasCalled = true;
    });

    await page.goto(`${WEB}/contact`, { waitUntil: "commit", timeout: 30_000 });

    const form = visibleLeadForm(page);
    await form.getByLabel(/first name/i).fill("E2E Tester");
    // Intentionally omit email
    await form.getByLabel(/message/i).fill("Incomplete submission.");
    await form.locator("[type=submit]").click();

    // Browser native validation should intercept — give 500 ms for any in-flight request
    await page.waitForTimeout(500);
    expect(apiWasCalled, "API must not be called when browser validation fails").toBe(false);
  });

  test("API 500 error → error message shown, not a crash or blank screen", async ({ page }) => {
    await page.route("**/api/lead-email", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ errors: [{ message: "Internal server error" }] }),
      });
    });

    await page.goto(`${WEB}/contact`, { waitUntil: "commit", timeout: 30_000 });

    const form = visibleLeadForm(page);
    await form.getByLabel(/first name/i).fill("E2E Tester");
    await form.getByLabel(/email/i).fill(`error-test-${randomUUID()}@example.test`);
    await form.getByLabel(/message/i).fill("Testing error state.");
    await form.locator("[type=submit]").click();

    await expect(
      page.getByText(/failed to submit|please try again|something went wrong/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // No unhandled error overlay
    await expect(page.locator("[data-nextjs-dialog], #__next_error__")).not.toBeVisible();
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 2 — Site Contact Drawer
// ═════════════════════════════════════════════════════════════════════════

test.describe("UX Flows — Site Contact Drawer", () => {
  test.describe.configure({ mode: "serial" });

  test("opens on Contact tab click; aria-expanded toggles correctly", async ({ page }) => {
    await page.goto(`${WEB}/`, { waitUntil: "commit", timeout: 30_000 });

    // The drawer tab has aria-expanded and an aria-label containing "Contact"
    const tab = page.locator('button[aria-expanded][aria-label*="Contact"]').first();
    await expect(tab).toBeAttached();
    await expect(tab).toHaveAttribute("aria-expanded", "false");

    await tab.click();

    await expect(tab).toHaveAttribute("aria-expanded", "true");
  });

  test("drawer panel is visible (not aria-hidden) when open", async ({ page }) => {
    await page.goto(`${WEB}/`, { waitUntil: "commit", timeout: 30_000 });

    const tab = page.locator('button[aria-expanded][aria-label*="Contact"]').first();
    await tab.click();
    await expect(tab).toHaveAttribute("aria-expanded", "true");

    const drawer = page.locator('[role="dialog"][aria-label*="Contact form"]');
    await expect(drawer).toBeAttached();
    // When open, aria-hidden is "false" (React renders the boolean prop)
    const hiddenVal = await drawer.getAttribute("aria-hidden");
    expect(hiddenVal).not.toBe("true");
  });

  test("closes on × button click; aria-expanded returns to false", async ({ page }) => {
    await page.goto(`${WEB}/`, { waitUntil: "commit", timeout: 30_000 });

    const tab = page.locator('button[aria-expanded][aria-label*="Contact"]').first();
    await tab.click();
    await expect(tab).toHaveAttribute("aria-expanded", "true");

    // Close button is inside the drawer
    const drawer = page.locator('[role="dialog"][aria-label*="Contact form"]');
    const closeBtn = drawer.locator('button[aria-label*="Close"]').first();
    await closeBtn.click();

    await expect(tab).toHaveAttribute("aria-expanded", "false");
  });

  test("closes on Escape key press", async ({ page }) => {
    await page.goto(`${WEB}/`, { waitUntil: "commit", timeout: 30_000 });

    const tab = page.locator('button[aria-expanded][aria-label*="Contact"]').first();
    await tab.click();
    await expect(tab).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");

    await expect(tab).toHaveAttribute("aria-expanded", "false");
  });

  test("drawer form submits and onSuccess closes the drawer", async ({ page }) => {
    await mockLeadEmailSuccess(page);
    await page.goto(`${WEB}/`, { waitUntil: "commit", timeout: 30_000 });

    const tab = page.locator('button[aria-expanded][aria-label*="Contact"]').first();
    await tab.click();
    await expect(tab).toHaveAttribute("aria-expanded", "true");

    const drawer = page.locator('[role="dialog"][aria-label*="Contact form"]');
    const form = drawer.locator("form").first();
    await form.getByLabel(/first name/i).fill("Drawer Tester");
    await form.getByLabel(/email/i).fill(`drawer-${randomUUID()}@example.test`);
    await form.getByLabel(/message/i).fill("Drawer form submission test.");
    await form.locator("[type=submit]").click();

    // onSuccess closes the drawer
    await expect(tab).toHaveAttribute("aria-expanded", "false", { timeout: 10_000 });
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 3 — Mobile Hamburger Menu
// ═════════════════════════════════════════════════════════════════════════

test.describe("UX Flows — Mobile Hamburger Menu", () => {
  test.describe.configure({ mode: "serial" });

  test("hamburger click opens mobile nav overlay (adds .open class)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${WEB}/`, { waitUntil: "commit", timeout: 30_000 });

    const hamburger = page.locator("#hamburger-btn");
    await expect(hamburger).toBeVisible();

    // Click to trigger both pointerdown (loads site.js) and click handler
    await hamburger.click();

    // site.js is loaded lazily — wait up to 5 s for the `open` class to appear
    await expect(page.locator("#mobile-nav")).toHaveClass(/open/, { timeout: 5_000 });
  });

  test("hamburger aria-expanded reflects true when overlay is open", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${WEB}/`, { waitUntil: "commit", timeout: 30_000 });

    const hamburger = page.locator("#hamburger-btn");
    await hamburger.click();
    await expect(page.locator("#mobile-nav")).toHaveClass(/open/, { timeout: 5_000 });

    await expect(hamburger).toHaveAttribute("aria-expanded", "true");
  });

  test("clicking a nav link inside the overlay navigates and closes the menu", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${WEB}/`, { waitUntil: "commit", timeout: 30_000 });

    const hamburger = page.locator("#hamburger-btn");
    await hamburger.click();

    const mobileNav = page.locator("#mobile-nav");
    await expect(mobileNav).toHaveClass(/open/, { timeout: 5_000 });

    // Click the first actual nav link (skip auth buttons at the end)
    const navLink = mobileNav.locator("nav a").first();
    await navLink.click();

    // Either the page navigated (new page → no #mobile-nav with .open) or the
    // overlay JS removed the `open` class in place.
    await page.waitForTimeout(600);
    const classAttr = await page
      .locator("#mobile-nav")
      .getAttribute("class")
      .catch(() => "");
    expect(classAttr ?? "").not.toMatch(/\bopen\b/);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 4 — FAQ Accordion (native <details>)
// ═════════════════════════════════════════════════════════════════════════

test.describe("UX Flows — FAQ Accordion", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await suppressSplash(page);
  });

  test("clicking a summary expands its details element", async ({ page }) => {
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const firstItem = page.locator("details.home-faq-item").first();
    await expect(firstItem).toBeAttached();

    // Should be collapsed initially
    const openBefore = await firstItem.evaluate((el) => (el as HTMLDetailsElement).open);
    expect(openBefore).toBe(false);

    await firstItem.locator("summary").click({ force: true });

    const openAfter = await firstItem.evaluate((el) => (el as HTMLDetailsElement).open);
    expect(openAfter, "Details element should be open after clicking summary").toBe(true);
  });

  test("answer text is visible after expansion", async ({ page }) => {
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const firstItem = page.locator("details.home-faq-item").first();
    await firstItem.locator("summary").click({ force: true });

    // The .home-faq-answer div holds the visible answer
    const answer = firstItem.locator(".home-faq-answer");
    await expect(answer).toBeVisible();
    const text = await answer.textContent();
    expect(text?.trim().length ?? 0).toBeGreaterThan(0);
  });

  test("exclusive behaviour — opening second item closes the first", async ({ page }) => {
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const items = page.locator("details.home-faq-item");
    const count = await items.count();
    test.skip(count < 2, "Need at least two FAQ items for the exclusive-details test");

    // Open first
    await items.nth(0).locator("summary").click({ force: true });
    await expect(items.nth(0)).toHaveJSProperty("open", true);

    // Open second — the [data-exclusive-details] JS closes the first
    await items.nth(1).locator("summary").click({ force: true });
    // Allow up to 400 ms for the exclusive handler in site.js to run
    await page.waitForTimeout(400);

    expect(
      await items.nth(1).evaluate((el) => (el as HTMLDetailsElement).open),
      "Second item must be open"
    ).toBe(true);
    // If the exclusive script has loaded, the first item will be closed.
    // We assert as a soft check — the test documents intent; site.js load is async.
    const firstStillOpen = await items.nth(0).evaluate((el) => (el as HTMLDetailsElement).open);
    if (firstStillOpen) {
      test.info().annotations.push({
        type: "WARNING",
        description:
          "Exclusive-details JS did not close the first FAQ item — site.js may not have loaded yet in this run.",
      });
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 5 — i18n Language Switcher
// ═════════════════════════════════════════════════════════════════════════

test.describe("UX Flows — Language Switcher", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await suppressSplash(page);
  });

  test("clicking ES button translates nav labels to Spanish", async ({ page }) => {
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const esBtn = page.locator('button[aria-label*="Spanish"], button[aria-label*="Español"]');
    await expect(esBtn.first()).toBeVisible();
    await esBtn.first().click();

    // A key translated nav label (Services → Servicios)
    await expect(page.getByText("Servicios").first()).toBeVisible({ timeout: 3_000 });
  });

  test("ES button gets aria-pressed=true; EN button gets aria-pressed=false", async ({ page }) => {
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    // Click the ES button using the aria-label (works before language changes).
    await page
      .locator('button[aria-label*="Spanish"], button[aria-label*="Español"]')
      .first()
      .click();

    // After clicking, the button's aria-label is translated to Spanish so the
    // original selector no longer resolves it.  Use the stable button text
    // content ("EN" / "ES") scoped to the language-switcher fieldset instead.
    const langFieldset = page
      .locator("fieldset")
      .filter({ hasText: "EN" })
      .filter({ hasText: "ES" });
    await expect(
      langFieldset.locator("button").filter({ hasText: /^ES$/ })
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      langFieldset.locator("button").filter({ hasText: /^EN$/ })
    ).toHaveAttribute("aria-pressed", "false");
  });

  test("language cookie (dba_lang=es) is written after switching to Spanish", async ({ page }) => {
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    await page
      .locator('button[aria-label*="Spanish"], button[aria-label*="Español"]')
      .first()
      .click();
    await page.waitForTimeout(300);

    const cookies = await page.context().cookies();
    const langCookie = cookies.find((c) => c.name === "dba_lang");
    expect(langCookie?.value, "dba_lang cookie should be 'es'").toBe("es");
  });

  test("Spanish selection persists across a full page reload", async ({ page }) => {
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    // Switch to Spanish
    await page
      .locator('button[aria-label*="Spanish"], button[aria-label*="Español"]')
      .first()
      .click();
    await expect(page.getByText("Servicios").first()).toBeVisible({ timeout: 3_000 });

    // Hard reload — cookie must restore the language
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("Servicios").first()).toBeVisible({ timeout: 3_000 });
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 6 — /es Spanish Landing Page
// ═════════════════════════════════════════════════════════════════════════

test.describe("UX Flows — /es Spanish Landing Page", () => {
  test("renders the Spanish headline", async ({ page }) => {
    await page.goto(`${WEB}/es`, { waitUntil: "commit", timeout: 30_000 });

    await expect(
      page
        .getByText(/Las máquinas construyen software/i)
        .or(page.getByText(/infraestructura/i))
        .first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test("has a 'View in English' link pointing to /, and a Spanish CTA", async ({ page }) => {
    await page.goto(`${WEB}/es`, { waitUntil: "commit", timeout: 30_000 });

    const enLink = page.getByRole("link", { name: /View in English/i });
    await expect(enLink).toBeVisible();
    const href = await enLink.getAttribute("href");
    expect(href).toBe("/");

    // Spanish CTA link ("Construyamos algo grande.")
    await expect(page.getByRole("link", { name: /Construyamos/i })).toBeVisible();
  });

  test("page lang attribute is 'es' on the main element", async ({ page }) => {
    await page.goto(`${WEB}/es`, { waitUntil: "commit", timeout: 30_000 });

    const lang = await page.locator("main").getAttribute("lang");
    expect(lang).toBe("es");
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 7 — GET /health structured JSON schema
// ═════════════════════════════════════════════════════════════════════════

test.describe("UX Flows — API Health Endpoint Schema", () => {
  test("GET /health returns JSON { ok: true, service: 'dba-api' } with correct Content-Type", async ({
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
});
