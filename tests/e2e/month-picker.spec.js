const { expect, test } = require("@playwright/test");

const httpUrl = process.env.E2E_HTTP_URL || "http://127.0.0.1:5173";
const password = process.env.E2E_APP_PASSWORD || "";

async function login(page) {
  if (!password) return; // no auth
  await page.goto(httpUrl);
  await expect(page.locator("#authOverlay")).toBeVisible();
  await page.locator("#passwordInput").fill(password);
  await page.locator("#loginBtn").click();
  await expect(page.locator("#authOverlay")).toBeHidden();
}

test.describe("Month picker, sorting, and date context", () => {

  test("adds a month via month picker with correct name and periods", async ({ page }) => {
    await login(page);
    await page.goto(httpUrl);
    await page.locator("#languageSelect").selectOption("en");

    // Click Add month
    await page.locator("#addMonthBtn").click();
    await expect(page.locator("#monthDialog")).toBeVisible();

    // Set month picker to a unique test month
    const stamp = Date.now();
    const monthVal = stamp % 2 === 0 ? "2026-08" : "2026-09";
    await page.locator("#newMonthPicker").evaluate((el, v) => { el.value = v; }, monthVal);
    await page.locator("#confirmMonthBtn").click();
    await expect(page.locator("#monthDialog")).toBeHidden();

    // Month should appear in dropdown with new format name
    const expectedName = monthVal === "2026-08" ? "2026 August" : "2026 September";
    await expect(page.locator("#monthSelect option:checked")).toHaveText(expectedName);

    // Go to Weekly Entry to check period names
    await page.locator('[data-view="entry"]').click();
    await expect(page.locator("#entryView")).toHaveClass(/active/);

    // New months should have "Period 1", "Period 2", etc.
    const periodOptions = await page.locator("#weekSelect option").allTextContents();
    expect(periodOptions).toEqual(["Period 1", "Period 2", "Period 3", "Period 4"]);
  });

  test("months appear sorted chronologically in dropdown", async ({ page }) => {
    await login(page);
    await page.goto(httpUrl);
    await page.locator("#languageSelect").selectOption("en");

    // Add months out of order
    for (const mv of ["2025-06", "2025-01", "2026-03", "2025-09"]) {
      await page.locator("#addMonthBtn").click();
      await expect(page.locator("#monthDialog")).toBeVisible();
      await page.locator("#newMonthPicker").evaluate((el, v) => { el.value = v; }, mv);
      await page.locator("#confirmMonthBtn").click();
      await expect(page.locator("#monthDialog")).toBeHidden();
    }

    // Verify the new months appear in chronological order
    const texts = await page.locator("#monthSelect option").allTextContents();
    const testMonths = texts.filter((t) =>
      ["2025 January", "2025 June", "2025 September", "2026 March"].includes(t)
    );
    expect(testMonths).toEqual(["2025 January", "2025 June", "2025 September", "2026 March"]);
  });

  test("new month gets default dates based on month context", async ({ page }) => {
    await login(page);
    await page.goto(httpUrl);
    await page.locator("#languageSelect").selectOption("en");

    // Create a month in the past via month picker
    await page.locator("#addMonthBtn").click();
    await expect(page.locator("#monthDialog")).toBeVisible();
    await page.locator("#newMonthPicker").evaluate((el) => { el.value = "2023-03"; });
    await page.locator("#confirmMonthBtn").click();
    await expect(page.locator("#monthDialog")).toBeHidden();

    // Go to Weekly Entry
    await page.locator('[data-view="entry"]').click();
    await expect(page.locator("#entryView")).toHaveClass(/active/);

    // Empty periods should get dates based on the month context (March 2023)
    await expect(page.locator("#periodStartInput")).toHaveValue("2023-03-01");
    await expect(page.locator("#periodEndInput")).toHaveValue("2023-03-07");
  });

  test("trend chart shows months in chronological order", async ({ page }) => {
    await login(page);
    await page.goto(httpUrl);
    await page.locator("#languageSelect").selectOption("en");

    // Create several test months
    for (const mv of ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"]) {
      await page.locator("#addMonthBtn").click();
      await expect(page.locator("#monthDialog")).toBeVisible();
      await page.locator("#newMonthPicker").evaluate((el, v) => { el.value = v; }, mv);
      await page.locator("#confirmMonthBtn").click();
      await expect(page.locator("#monthDialog")).toBeHidden();
    }

    // Verify trend chart data order via in-page function
    const trendOrder = await page.evaluate(() => {
      try {
        const rows = window.monthlyTrendRows ? window.monthlyTrendRows() : [];
        return rows.map((r) => r.name);
      } catch {
        return null;
      }
    });
    expect(trendOrder).not.toBeNull();
    const relevant = trendOrder.filter((n) =>
      ["2026 January", "2026 February", "2026 March", "2026 April", "2026 May"].includes(n)
    );
    expect(relevant).toEqual(["2026 January", "2026 February", "2026 March", "2026 April", "2026 May"]);
  });
});
