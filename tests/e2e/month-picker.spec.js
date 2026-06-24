const { expect, test } = require("@playwright/test");

const httpUrl = process.env.E2E_HTTP_URL || "http://127.0.0.1:5173";
const password = process.env.E2E_APP_PASSWORD || "";

async function login(page) {
  if (!password) return;
  await page.goto(httpUrl);
  await expect(page.locator("#authOverlay")).toBeVisible();
  await page.locator("#passwordInput").fill(password);
  await page.locator("#loginBtn").click();
  await expect(page.locator("#authOverlay")).toBeHidden();
}

test.describe("Month picker, sorting, and date context", () => {
  test("adds a month via month picker with correct period names", async ({ page }) => {
    await login(page);
    await page.goto(httpUrl);
    await page.locator("#languageSelect").selectOption("en");

    await page.locator("#addMonthBtn").click();
    await expect(page.locator("#monthDialog")).toBeVisible();
    await page.locator("#newMonthPicker").evaluate((element) => {
      element.value = "2026-08";
    });
    await page.locator("#confirmMonthBtn").click();
    await expect(page.locator("#monthDialog")).toBeHidden();
    await expect(page.locator("#monthSelect option:checked")).toHaveText("2026 August");

    await page.locator('[data-view="entry"]').click();
    await expect(page.locator("#entryView")).toHaveClass(/active/);
    const periodOptions = await page.locator("#weekSelect option").allTextContents();
    expect(periodOptions).toEqual(["Period 1", "Period 2", "Period 3", "Period 4"]);
  });

  test("months appear sorted chronologically in dropdown", async ({ page }) => {
    await login(page);
    await page.goto(httpUrl);
    await page.locator("#languageSelect").selectOption("en");

    for (const monthValue of ["2025-06", "2025-01", "2026-03", "2025-09"]) {
      await page.locator("#addMonthBtn").click();
      await expect(page.locator("#monthDialog")).toBeVisible();
      await page.locator("#newMonthPicker").evaluate((element, value) => {
        element.value = value;
      }, monthValue);
      await page.locator("#confirmMonthBtn").click();
      await expect(page.locator("#monthDialog")).toBeHidden();
    }

    const texts = await page.locator("#monthSelect option").allTextContents();
    const testMonths = texts.filter((text) =>
      ["2025 January", "2025 June", "2025 September", "2026 March"].includes(text),
    );
    expect(testMonths).toEqual(["2025 January", "2025 June", "2025 September", "2026 March"]);
  });

  test("new month gets default dates based on month context", async ({ page }) => {
    await login(page);
    await page.goto(httpUrl);
    await page.locator("#languageSelect").selectOption("en");

    await page.locator("#addMonthBtn").click();
    await expect(page.locator("#monthDialog")).toBeVisible();
    await page.locator("#newMonthPicker").evaluate((element) => {
      element.value = "2023-03";
    });
    await page.locator("#confirmMonthBtn").click();
    await expect(page.locator("#monthDialog")).toBeHidden();

    await page.locator('[data-view="entry"]').click();
    await expect(page.locator("#entryView")).toHaveClass(/active/);
    await expect(page.locator("#periodStartInput")).toHaveValue("2023-03-01");
    await expect(page.locator("#periodEndInput")).toHaveValue("2023-03-07");
  });

  test("trend chart shows months in chronological order", async ({ page }) => {
    await login(page);
    await page.goto(httpUrl);
    await page.locator("#languageSelect").selectOption("en");

    for (const monthValue of ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"]) {
      await page.locator("#addMonthBtn").click();
      await expect(page.locator("#monthDialog")).toBeVisible();
      await page.locator("#newMonthPicker").evaluate((element, value) => {
        element.value = value;
      }, monthValue);
      await page.locator("#confirmMonthBtn").click();
      await expect(page.locator("#monthDialog")).toBeHidden();
    }

    const trendOrder = await page.evaluate(() => {
      try {
        return window.monthlyTrendRows().map((row) => row.name);
      } catch {
        return null;
      }
    });
    expect(trendOrder).not.toBeNull();
    const relevant = trendOrder.filter((name) =>
      ["2026 January", "2026 February", "2026 March", "2026 April", "2026 May"].includes(name),
    );
    expect(relevant).toEqual(["2026 January", "2026 February", "2026 March", "2026 April", "2026 May"]);
  });
});
