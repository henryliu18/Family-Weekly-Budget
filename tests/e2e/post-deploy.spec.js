const { expect, test } = require("@playwright/test");

const httpUrl = process.env.E2E_HTTP_URL || "http://127.0.0.1:5173";
const password = process.env.E2E_APP_PASSWORD || "";

async function login(page) {
  if (!password) {
    await page.goto(httpUrl);
    return;
  }
  await page.goto(httpUrl);
  await expect(page.locator("#authOverlay")).toBeVisible();
  await expect(page.locator(".auth-copy")).toHaveText(
    "This family budget is password-protected. Ask the household budget owner for access.",
  );
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
  await page.locator("#languageSelect").selectOption("en");

  await expect(page.locator("#monthSelect")).toBeVisible();
  await expect(page.locator("#limitKpi")).toContainText("$");
  await expect(page.locator("#monthSpendKpi")).toContainText("$");
  await expect(page.locator("#availableKpi")).toContainText("$");
  await expect(page.locator("#weekSpendKpi")).toContainText("$");
  await expect(page.locator("#overviewStatusTitle")).not.toBeEmpty();
  await expect(page.locator("#overviewStatusPill")).not.toBeEmpty();
  await expect(page.locator("#statusMetricsLine")).toContainText("%");
  await expect(page.locator("#statusMetricsLine")).toContainText(
    /vs last month same progress|vs last month|No same-progress data last month|No last-month data/,
  );
  await expect(page.locator("#overviewDriverLine")).not.toBeEmpty();
  await expect(page.locator("#overviewDriverLine")).toContainText("month");
  await expect(page.locator("#nextActionValue")).not.toBeEmpty();
  await expect(page.locator("#overviewActionBtn")).toHaveText("Open weekly entry");
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
  await expect(page.locator("#entryPeriodComparison")).toBeVisible();
  await expect(page.locator("#entryPeriodComparisonTitle")).not.toBeEmpty();
  await expect(page.locator("#entryPeriodComparisonCopy")).toContainText(/same period last month|No same-period data last month/);
  await expect(page.locator("#entryPeriodDrivers")).not.toBeEmpty();
  await expect(page.locator("#entryPeriodComparisonPill")).not.toBeEmpty();
  const entryPeriodOptions = await page.locator("#weekSelect option").count();
  if (entryPeriodOptions > 1) {
    const nextPeriodValue = await page.locator("#weekSelect option").nth(1).getAttribute("value");
    const nextPeriodLabel = await page.locator("#weekSelect option").nth(1).textContent();
    await page.locator("#weekSelect").selectOption(nextPeriodValue);
    await expect(page.locator("#entryPeriodComparisonTitle")).toHaveText(nextPeriodLabel.trim());
  }

  for (const label of [
    "Medical out-of-pocket",
    "Private insurance",
    "Electricity",
    "Gas",
    "Internet, mobile, subscriptions",
    "Water",
    "School fees",
    "Home insurance",
    "Car insurance",
    "Transport",
    "Government fees",
    "Shopping and dining",
    "Incidentals",
  ]) {
    await expect(page.locator("#categoryInputs")).toContainText(label);
  }

  await expect(page.locator(".grocery-explainer")).toHaveText(
    "Grocery is auto-calculated from period total minus detailed non-grocery and incidentals.",
  );
  await expect(page.locator("#entryEditBanner")).toContainText(
    "Editing an existing period. Saving will replace these values.",
  );
  await expect(page.locator(".category-input-card-rare")).toContainText("Rare, unavoidable events");
  await expect(page.locator("#notesInput")).toHaveAttribute("placeholder", /emergency repair/);

  await page.locator("#languageSelect").selectOption("zh");
  await expect(page.locator(".grocery-explainer")).toContainText("採買會由本期總支出");
  await expect(page.locator("#entryEditBanner")).toContainText("正在編輯既有週期");
  await expect(page.locator("#notesInput")).toHaveAttribute("placeholder", /緊急維修/);
  await page.locator("#languageSelect").selectOption("en");

  const note = `e2e note ${Date.now()}`;
  await page.locator("#periodStartInput").fill("2026-06-01");
  await page.locator("#periodEndInput").fill("2026-06-07");
  await page.locator("#availableInput").fill("12345.67");
  await page.locator("#unpaidInput").fill("12.34");
  const incidentalsOpen = await page.locator("#incidentalsDetails").evaluate((element) => element.open);
  if (!incidentalsOpen) {
    await page.locator("#incidentalsDetails summary").click();
  }
  await page.locator("#notesInput").fill(note);
  await page.locator("#saveWeekBtn").click();
  await expect(page.locator("#saveToast")).toContainText("Saved 2026-06-01 - 2026-06-07:");
  await expect(page.locator("#saveToast")).toContainText("period total");
  await expect(page.locator("#saveToast")).toContainText("grocery");
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
  await page.reload();
  await expect(page.locator("#logoutBtn")).toBeVisible();
  await page.locator('.nav-tab[data-view="entry"]').click();
  await page.locator("#weekSelect").selectOption({ label: "2026-06-01 - 2026-06-07" });
  await expect(page.locator("#periodStartInput")).toHaveValue("2026-06-01");
  await expect(page.locator("#periodEndInput")).toHaveValue("2026-06-07");
  await expect(page.locator("#periodInput")).toHaveValue("2026-06-01 - 2026-06-07");
  await expect(page.locator("#notesInput")).toHaveValue(note);

  await page.locator("#addMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeVisible();
  await page.locator("#newMonthPicker").evaluate((element, value) => {
    element.value = value;
  }, "2026-06");
  await page.locator("#confirmMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeHidden();
  await expect(page.locator("#monthSelect option:checked")).toContainText("2026");
  await expect(page.locator("#overviewTitle")).toContainText("2026");
  await page.locator('.nav-tab[data-view="overview"]').click();
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
  await expect(page.locator("#overviewOnboarding")).toBeVisible();
  await expect(page.locator("#weeklyChartEmpty")).toBeVisible();
  await expect(page.locator("#monthlyTrendEmpty")).toBeVisible();
  await expect(page.locator("#weeksTableEmpty")).toBeVisible();

  page.on("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    await dialog.accept();
  });
  await page.locator("#deleteMonthBtn").click();
  await expect(page.locator("#overviewTitle")).not.toContainText("2026");

  await page.locator("#logoutBtn").click();
  await expect(page.locator("#authOverlay")).toBeVisible();
});

test("mobile overview stays within the viewport", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
  await expectCanvasReady(page, "#weeklyChart");
  await expectCanvasReady(page, "#monthlyTrendChart");
  await expectTableHasRows(page, "#weeksTable");

  await expect
    .poll(async () =>
      page.evaluate(() => {
        const weeklyRight = document.querySelector("#weeklyChart").getBoundingClientRect().right;
        const trendRight = document.querySelector("#monthlyTrendChart").getBoundingClientRect().right;
        const decisionRight = document.querySelector(".overview-decision").getBoundingClientRect().right;
        return {
          pageFits: document.documentElement.scrollWidth <= window.innerWidth + 1,
          chartsFit: weeklyRight <= window.innerWidth + 1 && trendRight <= window.innerWidth + 1,
          dashboardFits: decisionRight <= window.innerWidth + 1,
          recordCards: window.getComputedStyle(document.querySelector("#weeksTable tbody tr")).display === "block",
        };
      }),
    )
    .toEqual({
      pageFits: true,
      chartsFit: true,
      dashboardFits: true,
      recordCards: true,
    });

  await page.locator('.nav-tab[data-view="entry"]').click();
  await expect(page.locator("#entryView")).toHaveClass(/active/);
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const comparisonRight = document.querySelector("#entryPeriodComparison").getBoundingClientRect().right;
        return {
          pageFits: document.documentElement.scrollWidth <= window.innerWidth + 1,
          comparisonFits: comparisonRight <= window.innerWidth + 1,
        };
      }),
    )
    .toEqual({
      pageFits: true,
      comparisonFits: true,
    });
});
