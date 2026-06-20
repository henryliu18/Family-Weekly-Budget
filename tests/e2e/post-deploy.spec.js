const { expect, test } = require("@playwright/test");

const httpUrl = process.env.E2E_HTTP_URL || "http://127.0.0.1:18080";
const password = process.env.E2E_APP_PASSWORD || "";

async function login(page) {
  await page.goto("/");
  await expect(page.locator("#authOverlay")).toBeVisible();
  await page.locator("#passwordInput").fill(password);
  await page.locator("#loginBtn").click();
  await expect(page.locator("#authOverlay")).toBeHidden();
}

async function expectCanvasReady(page, selector) {
  const canvas = page.locator(selector);
  await expect(canvas).toBeVisible();
  await expect
    .poll(async () =>
      canvas.evaluate((element) => ({
        ready:
          element.width > 0 &&
          element.height > 0 &&
          element.clientWidth > 0 &&
          element.clientHeight > 0 &&
          element.toDataURL("image/png").length > "data:image/png;base64,".length,
      })),
    )
    .toEqual({ ready: true });
}

async function expectTableHasRows(page, selector) {
  await expect
    .poll(async () => page.locator(`${selector} tbody tr`).count())
    .toBeGreaterThan(0);
}

test("HTTP redirects to HTTPS", async ({ request }) => {
  const response = await request.get(httpUrl, { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toMatch(/^https:\/\//);
});

test("post-deploy app smoke and workflow checks", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);

  await expect(page.locator("#monthSelect")).toBeVisible();
  await expect(page.locator("#limitKpi")).toContainText("$");
  await expect(page.locator("#monthSpendKpi")).toContainText("$");
  await expect(page.locator("#availableKpi")).toContainText("$");
  await expect(page.locator("#weekSpendKpi")).toContainText("$");
  await expect(page.locator("#buildVersionValue")).not.toHaveText("-");
  await expect(page.locator("#addMonthBtn")).toBeEnabled();
  await expect(page.locator("#deleteMonthBtn")).toBeEnabled();
  await expect(page.locator("#saveWeekBtn")).toBeEnabled();
  await expectCanvasReady(page, "#weeklyChart");
  await expectCanvasReady(page, "#monthlyTrendChart");
  await expectTableHasRows(page, "#weeksTable");

  for (const view of ["entry", "history", "settings", "overview"]) {
    await page.locator(`.nav-tab[data-view="${view}"]`).click();
    await expect(page.locator(`#${view}View`)).toHaveClass(/active/);
  }

  await page.locator('.nav-tab[data-view="entry"]').click();
  await expect(page.locator("#entryView")).toHaveClass(/active/);
  const note = `e2e note ${Date.now()}`;
  await page.locator("#periodInput").fill("E2E Period");
  await page.locator("#availableInput").fill("12345.67");
  await page.locator("#unpaidInput").fill("12.34");
  await page.locator("#notesInput").fill(note);
  await page.locator("#saveWeekBtn").click();
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
  await page.reload();
  await expect(page.locator("#logoutBtn")).toBeVisible();
  await page.locator('.nav-tab[data-view="entry"]').click();
  await expect(page.locator("#periodInput")).toHaveValue("E2E Period");
  await expect(page.locator("#notesInput")).toHaveValue(note);

  const monthName = `E2E Test ${Date.now()}`;
  await page.locator("#addMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeVisible();
  await page.locator("#newMonthName").fill(monthName);
  await page.locator("#confirmMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeHidden();
  await expect(page.locator("#monthSelect")).toHaveValue(monthName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  await expect(page.locator("#overviewTitle")).toHaveText(monthName);

  page.on("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    await dialog.accept();
  });
  await page.locator("#deleteMonthBtn").click();
  await expect(page.locator("#overviewTitle")).not.toHaveText(monthName);

  await page.locator("#logoutBtn").click();
  await expect(page.locator("#authOverlay")).toBeVisible();
});
