/**
 * Global setup for Playwright tests
 * - Installs browsers
 * - Sets up test environment variables
 * - Configures mock services
 */
import { execFileSync } from "node:child_process";
import path from "node:path";

async function globalSetup() {
  console.log('🚀 Setting up Playwright test environment...');

  const apiDir = path.join(process.cwd(), "apps", "api");

  // Ensure local D1 exists before the suite starts. This keeps `bun run test`
  // self-contained on a fresh checkout or after the dev database is reset.
  execFileSync(
    "bunx",
    ["wrangler", "d1", "migrations", "apply", "dba-ledger", "--local", "-c", "wrangler.json"],
    { cwd: apiDir, stdio: "inherit" },
  );

  // Set default environment variables if not provided
  process.env.NEXT_PUBLIC_WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
  process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

  console.log('✅ Test environment configured');
  console.log(`🌐 Web URL: ${process.env.NEXT_PUBLIC_WEB_URL}`);
  console.log(`🔌 API URL: ${process.env.NEXT_PUBLIC_API_URL}`);
  if (process.env.PLAYWRIGHT_ZAP_PROXY?.trim()) {
    console.log(`🔒 ZAP proxy (Playwright): ${process.env.PLAYWRIGHT_ZAP_PROXY.trim()}`);
  }

  // Store environment variables for use in tests
  process.env.PLAYWRIGHT_TEST_SETUP_COMPLETE = 'true';
}

export default globalSetup;
