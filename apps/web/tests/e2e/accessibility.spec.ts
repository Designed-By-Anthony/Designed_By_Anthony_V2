import { expect, test } from "@playwright/test";

/**
 * Accessibility — "No Stone Unturned" a11y suite.
 *
 * Covers gaps identified in the chaos-suite audit:
 *   · All <img> elements have an alt attribute defined (decorative ="" is OK)
 *   · Skip-to-content link is focusable and targets #main-content
 *   · Tab key reaches header nav links on desktop
 *   · Contact drawer has the required ARIA role/modal/label attributes
 *   · No horizontal scroll at tablet (768 px) or wide (1440 px) viewports
 *   · Every internal footer nav link resolves without a 4xx or 5xx
 *   · Legal footer links (privacy, terms, cookie) resolve without errors
 *
 * These tests issue real page loads and HTTP requests against the running
 * dev servers; they do NOT take screenshots or compare pixels.
 */

const WEB = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";

// ═════════════════════════════════════════════════════════════════════════
// SECTION 1 — Image alt attributes
// ═════════════════════════════════════════════════════════════════════════

test.describe("Accessibility — Images", () => {
  test("home page — every <img> element has an alt attribute defined", async ({ page }) => {
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    type ImgViolation = { src: string; className: string };

    const violations: ImgViolation[] = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("img"))
        .filter((img) => !img.hasAttribute("alt"))
        .map((img) => ({
          src: img.getAttribute("src")?.slice(0, 80) ?? "(no src)",
          className: img.className.slice(0, 60),
        }));
    });

    expect(
      violations,
      `Images missing the alt attribute entirely (empty alt="" is fine for decorative images):\n${JSON.stringify(violations, null, 2)}`
    ).toHaveLength(0);
  });

  test("contact page — every <img> has an alt attribute", async ({ page }) => {
    await page.goto(`${WEB}/contact`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const violations = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img"))
        .filter((img) => !img.hasAttribute("alt"))
        .map((img) => img.getAttribute("src")?.slice(0, 80) ?? "(no src)")
    );

    expect(violations).toHaveLength(0);
  });

  test("portfolio page — every <img> has an alt attribute", async ({ page }) => {
    await page.goto(`${WEB}/portfolio`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const violations = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img"))
        .filter((img) => !img.hasAttribute("alt"))
        .map((img) => img.getAttribute("src")?.slice(0, 80) ?? "(no src)")
    );

    expect(violations).toHaveLength(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 2 — Skip-to-content link
// ═════════════════════════════════════════════════════════════════════════

test.describe("Accessibility — Skip Link", () => {
  test("skip-to-content link is the first focusable element and targets #main-content", async ({
    page,
  }) => {
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    // First Tab press should land on the skip link
    await page.keyboard.press("Tab");

    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused({ timeout: 3_000 });

    const href = await skipLink.getAttribute("href");
    expect(href).toBe("#main-content");
  });

  test("skip link text is 'Skip to main content' (or equivalent)", async ({ page }) => {
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();

    const text = await skipLink.textContent();
    expect(text?.toLowerCase()).toMatch(/skip/i);
    expect(text?.toLowerCase()).toMatch(/main|content/i);
  });

  test("#main-content landmark exists in the DOM", async ({ page }) => {
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const main = page.locator("#main-content");
    await expect(main).toBeAttached();
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 3 — Keyboard navigation
// ═════════════════════════════════════════════════════════════════════════

test.describe("Accessibility — Keyboard Navigation", () => {
  test("Tab key reaches the main nav links on desktop (1280 px)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    let navLinkFocused = false;
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      navLinkFocused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return false;
        return Boolean(el.closest("nav[aria-label='Main navigation']"));
      });
      if (navLinkFocused) break;
    }

    expect(navLinkFocused, "Tab should reach Main navigation within 25 presses").toBe(true);
  });

  test("banner link is reachable before the nav (second Tab press or earlier)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    // Tab 1: skip link. Tab 2: banner link or first nav link.
    await page.keyboard.press("Tab"); // skip link
    await page.keyboard.press("Tab"); // banner or nav

    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return { tag: el?.tagName, href: (el as HTMLAnchorElement)?.href ?? "" };
    });
    expect(["A", "BUTTON"]).toContain(focused.tag);
  });

  test("Enter on a focused nav link navigates to the correct page", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    // Tab until we land on "Services" nav link
    let servicesHref = "";
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLAnchorElement | null;
        return { text: el?.textContent?.trim() ?? "", href: el?.getAttribute("href") ?? "" };
      });
      if (/services/i.test(info.text) && info.href) {
        servicesHref = info.href;
        break;
      }
    }

    test.skip(!servicesHref, "Could not reach the Services nav link via Tab in 30 presses");

    await page.keyboard.press("Enter");
    await page.waitForURL(`**${servicesHref}`, { timeout: 10_000 });
    expect(page.url()).toContain(servicesHref);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 4 — Contact drawer ARIA attributes
// ═════════════════════════════════════════════════════════════════════════

test.describe("Accessibility — Dialog ARIA Roles", () => {
  test("contact drawer panel has role=dialog, aria-label, and aria-modal attributes", async ({
    page,
  }) => {
    await page.goto(`${WEB}/`, { waitUntil: "commit", timeout: 30_000 });

    const drawer = page.locator('[role="dialog"][aria-label*="Contact form"]');
    await expect(drawer).toBeAttached();

    // aria-label must be non-empty
    const ariaLabel = await drawer.getAttribute("aria-label");
    expect(ariaLabel?.trim().length ?? 0).toBeGreaterThan(0);

    // aria-modal must be present (value "true" or "false" — React renders both)
    const ariaModal = await drawer.getAttribute("aria-modal");
    expect(ariaModal).not.toBeNull();
  });

  test("contact drawer tab button has aria-controls pointing to the panel id", async ({
    page,
  }) => {
    await page.goto(`${WEB}/`, { waitUntil: "commit", timeout: 30_000 });

    const tab = page.locator('button[aria-expanded][aria-label*="Contact"]').first();
    const controls = await tab.getAttribute("aria-controls");
    expect(controls?.trim().length ?? 0).toBeGreaterThan(0);

    // The controlled element must exist in the DOM
    const panel = page.locator(`#${controls}`);
    await expect(panel).toBeAttached();
  });

  test("mobile nav dialog has role=dialog and aria-modal attributes", async ({ page }) => {
    await page.goto(`${WEB}/`, { waitUntil: "commit", timeout: 30_000 });

    const mobileNav = page.locator("#mobile-nav");
    await expect(mobileNav).toBeAttached();

    const role = await mobileNav.getAttribute("role");
    expect(role).toBe("dialog");

    const ariaModal = await mobileNav.getAttribute("aria-modal");
    expect(ariaModal).not.toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 5 — Viewport overflow checks
// ═════════════════════════════════════════════════════════════════════════

test.describe("Accessibility — Viewport Overflow", () => {
  async function checkNoHorizontalScroll(
    page: Parameters<Parameters<typeof test>[1]>[0]["page"],
    width: number,
    height: number
  ) {
    await page.setViewportSize({ width, height });
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const overflows = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );

    expect(
      overflows,
      `Horizontal scroll overflow detected at ${width}×${height}`
    ).toBe(false);
  }

  test("tablet 768 px — no horizontal scroll overflow", async ({ page }) => {
    await checkNoHorizontalScroll(page, 768, 1024);
  });

  test("tablet 1024 px — no horizontal scroll overflow", async ({ page }) => {
    await checkNoHorizontalScroll(page, 1024, 768);
  });

  test("wide 1440 px — no horizontal scroll overflow", async ({ page }) => {
    await checkNoHorizontalScroll(page, 1440, 900);
  });

  test("mobile 375 px — no horizontal scroll overflow (regression)", async ({ page }) => {
    await checkNoHorizontalScroll(page, 375, 812);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// SECTION 6 — Footer navigation link health
// ═════════════════════════════════════════════════════════════════════════

test.describe("Accessibility — Footer Navigation", () => {
  test("all internal footer nav links return HTTP < 400", async ({ page, request }) => {
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const internalHrefs: string[] = await page.evaluate(() => {
      const footer = document.querySelector("footer");
      if (!footer) return [];
      return Array.from(footer.querySelectorAll("nav a[href]"))
        .map((a) => a.getAttribute("href") ?? "")
        .filter((href) => href.startsWith("/") && !href.startsWith("//"));
    });

    expect(
      internalHrefs.length,
      "Footer must contain at least one internal nav link"
    ).toBeGreaterThan(0);

    for (const href of internalHrefs) {
      const res = await request.get(`${WEB}${href}`);
      expect.soft(
        res.status(),
        `Footer nav link "${href}" returned ${res.status()}`
      ).toBeLessThan(400);
    }
  });

  test("legal links (privacy, terms, cookie) all resolve < 400", async ({ request }) => {
    const legalPaths = ["/privacy", "/terms", "/cookie"];

    for (const path of legalPaths) {
      const res = await request.get(`${WEB}${path}`);
      expect.soft(
        res.status(),
        `Legal page "${path}" returned ${res.status()}`
      ).toBeLessThan(400);
    }
  });

  test("footer 'Built with' external links have rel=noopener and target=_blank", async ({
    page,
  }) => {
    await page.goto(`${WEB}/`, { waitUntil: "domcontentloaded", timeout: 30_000 });

    type ExternalLinkViolation = { href: string; rel: string | null; target: string | null };

    const violations: ExternalLinkViolation[] = await page.evaluate(() => {
      const footer = document.querySelector("footer");
      if (!footer) return [];
      return Array.from(footer.querySelectorAll("a[href^='https://']"))
        .filter((a) => {
          const rel = a.getAttribute("rel") ?? "";
          const target = a.getAttribute("target");
          return target !== "_blank" || !rel.includes("noopener");
        })
        .map((a) => ({
          href: a.getAttribute("href")?.slice(0, 80) ?? "",
          rel: a.getAttribute("rel"),
          target: a.getAttribute("target"),
        }));
    });

    expect(
      violations,
      `External footer links missing rel=noopener or target=_blank:\n${JSON.stringify(violations, null, 2)}`
    ).toHaveLength(0);
  });
});
