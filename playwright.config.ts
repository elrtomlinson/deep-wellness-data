import { defineConfig, devices } from "@playwright/test";

const PORT = 8080;
const HOST = "127.0.0.1";
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://${HOST}:${PORT}`;

// Some sandboxed environments ship a pre-provisioned Chromium whose build
// number doesn't match this Playwright version, so the usual download path
// finds nothing. Point PLAYWRIGHT_CHROMIUM_PATH at that binary to use it.
// Unset (the normal case) this is a no-op and Playwright resolves its own.
const launchOverride = process.env.PLAYWRIGHT_CHROMIUM_PATH
  ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } }
  : {};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], ...launchOverride } },
    { name: "mobile", use: { ...devices["Pixel 7"], ...launchOverride } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        // vite.config.ts binds "::" (IPv6) for Lovable's preview. Pin the test
        // server to IPv4 so it also starts in containers and CI runners that
        // have no IPv6 stack.
        command: `npm run dev -- --host ${HOST} --port ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
