import { expect, test } from "@playwright/test";

/**
 * Smoke coverage: every route must render without a crash or a console error.
 *
 * This is the functional floor. It does not assert behaviour — it asserts the
 * app is not broken, which is the failure mode that matters most when changes
 * land quickly.
 */

const ROUTES = [
  { path: "/", name: "dashboard" },
  { path: "/track", name: "track" },
  { path: "/conditions", name: "conditions" },
  { path: "/report", name: "report" },
  { path: "/timeline", name: "timeline" },
  { path: "/journal", name: "journal" },
  { path: "/dna", name: "dna report" },
  { path: "/settings", name: "settings" },
];

/**
 * The app fetches live weather from open-meteo. On an offline machine, or a CI
 * runner without egress, those requests fail and log a console error that says
 * nothing about whether our code works. Filter transport-level failures out of
 * the console assertion; uncaught exceptions are never filtered.
 */
const NETWORK_NOISE =
  /Failed to load resource|net::ERR_|ERR_CONNECTION|Failed to fetch|NetworkError/i;

for (const route of ROUTES) {
  test(`${route.name} renders without errors`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error" && !NETWORK_NOISE.test(msg.text())) {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const response = await page.goto(route.path);
    expect(response?.status(), `${route.path} should not 4xx/5xx`).toBeLessThan(400);

    // The app mounts into #root; a crashed render leaves it empty.
    await expect(page.locator("#root")).not.toBeEmpty();

    expect(pageErrors, `uncaught exceptions on ${route.path}`).toEqual([]);
    expect(consoleErrors, `console errors on ${route.path}`).toEqual([]);
  });
}

test("unknown route shows the not-found page", async ({ page }) => {
  await page.goto("/definitely-not-a-real-route");
  await expect(page.locator("#root")).not.toBeEmpty();
});
