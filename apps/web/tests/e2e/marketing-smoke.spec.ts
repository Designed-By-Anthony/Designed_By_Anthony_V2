import { expect, test } from "@playwright/test";
import { getAllMarketingPathnames } from "../../src/lib/marketing-routes";

/**
 * Broad HTTP surface checks — keeps Playwright fast by batching paths, while still
 * issuing real navigations (good for passive ZAP when PLAYWRIGHT_ZAP_PROXY is set).
 */

const WEB_BASE = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";

/** Routes not covered by `getAllMarketingPathnames()` (pSEO, tools, localized shells). */
const EXTRA_SMOKE_PATHS = [
  "/infrastructure/utica/hvac",
  "/calculator",
  "/tools",
  "/es",
  "/checkout/success",
  "/lighthouse",
] as const;

const BATCH_SIZE = 25;

test.describe.configure({ mode: "serial" });

function assertNoServerError(status: number | undefined, pathname: string) {
  expect.soft(status, `${pathname}: missing response`).toBeTruthy();
  expect.soft(status, `${pathname}: should not 5xx`).toBeLessThan(500);
}

test.describe("Marketing catalog (batched)", () => {
  const paths = getAllMarketingPathnames();

  for (let i = 0; i < paths.length; i += BATCH_SIZE) {
    const slice = paths.slice(i, i + BATCH_SIZE);
    const labelStart = i + 1;
    const labelEnd = i + slice.length;
    test(`paths ${labelStart}–${labelEnd} (${slice.length} URLs)`, async ({ page }) => {
      for (const pathname of slice) {
        await test.step(pathname, async () => {
          const res = await page.goto(`${WEB_BASE}${pathname}`, {
            waitUntil: "commit",
            timeout: 45000,
          });
          assertNoServerError(res?.status(), pathname);
        });
      }
    });
  }
});

test.describe("Extra routes (pSEO / apps)", () => {
  test("shell routes return < 500", async ({ page }) => {
    for (const pathname of EXTRA_SMOKE_PATHS) {
      await test.step(pathname, async () => {
        const res = await page.goto(`${WEB_BASE}${pathname}`, {
          waitUntil: "commit",
          timeout: 45000,
        });
        assertNoServerError(res?.status(), pathname);
      });
    }
  });
});
