import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: "list",
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || "/tmp/sunneversets-e2e-results",
  use: {
    baseURL: "http://127.0.0.1:4174",
    browserName: "chromium",
    // Use the locally installed Chrome; set PLAYWRIGHT_CHANNEL=chromium if needed.
    channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
    viewport: { width: 1440, height: 1000 },
    locale: "zh-CN",
    timezoneId: "Asia/Shanghai",
    acceptDownloads: true,
    reducedMotion: "no-preference",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "node scripts/serve-built.mjs",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: false,
    timeout: 30_000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
  },
});
