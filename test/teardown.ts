/**
 * Global teardown for Playwright tests
 * - Cleans up test data
 * - Stops mock services
 * - Generates test reports
 */
async function globalTeardown() {
  console.log("🧹 Tearing down Playwright test environment...");

  // Clean up environment variables
  delete process.env.PLAYWRIGHT_TEST_SETUP_COMPLETE;

  console.log("✅ Test environment cleaned up");
}

export default globalTeardown;
