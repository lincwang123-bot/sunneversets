import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests", testMatch: "seo.spec.ts", timeout: 30_000,
  workers: 1, retries: 0, reporter: "list",
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || "/tmp/sunneversets-seo-results",
  use: { baseURL: "http://127.0.0.1:4174", channel: "chrome", viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference", screenshot: "only-on-failure" },
  webServer: { command: "node scripts/serve-built.mjs", url: "http://127.0.0.1:4174", reuseExistingServer: false, gracefulShutdown: { signal: "SIGTERM", timeout: 5000 } },
});
