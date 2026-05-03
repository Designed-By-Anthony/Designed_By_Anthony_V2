import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

/** Run `bun run test` from the monorepo root (Playwright loads this config via CJS interop). */
const repoRoot = process.cwd();

/** When set (e.g. `http://127.0.0.1:8080`), browser + APIRequest traffic goes through OWASP ZAP. */
const zapProxyServer = process.env.PLAYWRIGHT_ZAP_PROXY?.trim();

/**
 * Playwright — E2E (apps/web) + API fuzzer (apps/api).
 * Starts Next.js web, Next.js admin, and Wrangler API locally (no Docker).
 *
 * Tips:
 * - Stdout defaults to "ignore" in Playwright → looks like a hang; we use "pipe" so you see compile logs.
 * - Three separate `turbo run dev` processes can contend; each server runs `bun run dev` in its app folder.
 * - Set PLAYWRIGHT_SKIP_WEBSERVER=1 if you already ran `bun run dev` (stack) manually.
 */
const skipWebServer = !!process.env.PLAYWRIGHT_SKIP_WEBSERVER;

export default defineConfig({
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  /** One worker: E2E and fuzzer share the live API (rate limits, D1). */
  workers: 1,
  fullyParallel: false,

  testDir: "./apps",

  testMatch: ["**/tests/e2e/**/*.spec.ts", "**/tests/security/**/*.spec.ts"],

  projects: [
    {
      name: "fortress",
      testMatch: ["**/tests/e2e/**/*.spec.ts", "**/tests/security/**/*.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
        trace: "on-first-retry",
      },
    },
  ],

  retries: process.env.CI ? 2 : 0,

  reporter: [["list"], ["html", { open: "never" }]],

  webServer: skipWebServer
    ? undefined
    : [
        {
          name: "web",
          command: "bun run dev",
          cwd: path.join(repoRoot, "apps/web"),
          url: "http://localhost:3000",
          reuseExistingServer: !process.env.CI,
          timeout: 240000,
          stdout: "pipe",
          stderr: "pipe",
        },
        {
          name: "admin",
          command: "bun run dev",
          cwd: path.join(repoRoot, "apps/admin"),
          url: "http://localhost:3100",
          reuseExistingServer: !process.env.CI,
          timeout: 240000,
          stdout: "pipe",
          stderr: "pipe",
        },
        {
          name: "api",
          command: "bun run dev",
          cwd: path.join(repoRoot, "apps/api"),
          url: "http://localhost:8787/health",
          reuseExistingServer: !process.env.CI,
          timeout: 240000,
          stdout: "pipe",
          stderr: "pipe",
        },
      ],

  use: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787",
    extraHTTPHeaders: {
      Accept: "application/json",
    },
    ignoreHTTPSErrors: true,
    ...(zapProxyServer
      ? {
          proxy: {
            server: zapProxyServer,
          },
        }
      : {}),
  },

  outputDir: "test-results/",

  globalSetup: "./test/setup.ts",
  globalTeardown: "./test/teardown.ts",
});
