const { expect, test } = require("@playwright/test");

const httpUrl = process.env.E2E_HTTP_URL || "http://127.0.0.1:18080";
const password = process.env.E2E_APP_PASSWORD || "";

async function login(page) {
  await page.goto("/");
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
  await page.locator("#incidentalsDetails summary").click();
  await page.locator("#notesInput").fill(note);
  await page.locator("#saveWeekBtn").click();
  await expect(page.locator("#saveToast")).toContainText("Saved 2026-06-01 - 2026-06-07:");
  await expect(page.locator("#saveToast")).toContainText("period total");
  await expect(page.locator("#saveToast")).toContainText("grocery");
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
  await page.reload();
  await expect(page.locator("#logoutBtn")).toBeVisible();
  await page.locator('.nav-tab[data-view="entry"]').click();
  await expect(page.locator("#periodStartInput")).toHaveValue("2026-06-01");
  await expect(page.locator("#periodEndInput")).toHaveValue("2026-06-07");
  await expect(page.locator("#periodInput")).toHaveValue("2026-06-01 - 2026-06-07");
  await expect(page.locator("#notesInput")).toHaveValue(note);

  const monthName = `E2E Test ${Date.now()}`;
  await page.locator("#addMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeVisible();
  await page.locator("#newMonthName").fill(monthName);
  await page.locator("#confirmMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeHidden();
  await expect(page.locator("#monthSelect option:checked")).toHaveText(monthName);
  await expect(page.locator("#overviewTitle")).toHaveText(monthName);
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
  await expect(page.locator("#overviewTitle")).not.toHaveText(monthName);

  await page.locator("#logoutBtn").click();
  await expect(page.locator("#authOverlay")).toBeVisible();
});

test("transaction import draft filters, reviews, and applies rows", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  await page.locator("#languageSelect").selectOption("en");

  const monthName = `Import Draft ${Date.now()}`;
  await page.locator("#addMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeVisible();
  await page.locator("#newMonthName").fill(monthName);
  await page.locator("#confirmMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeHidden();
  await page.locator('.nav-tab[data-view="entry"]').click();
  await expect(page.locator("#entryView")).toHaveClass(/active/);

  await page.locator("#periodStartInput").fill("2026-06-13");
  await page.locator("#periodEndInput").fill("2026-06-17");
  await page.locator("#availableInput").fill("14420.20");
  await page.locator("#unpaidInput").fill("0");

  const csvRows = [
    '12/06/2026,"-1.00","COLES BEFORE PERIOD",""',
    '13/06/2026,"-36.35","COLES 7735 DONCASTER VIC",""',
    '14/06/2026,"-90.00","EDWARD WONG MEDICAL",""',
    '15/06/2026,"-123.45","AAMI INSURANCE",""',
    '15/06/2026,"-123.45","AAMI INSURANCE",""',
    '16/06/2026,"-88.00","HOLLARD HOME INSURANCE",""',
    '16/06/2026,"25.00","CARD PAYMENT THANK YOU",""',
    '17/06/2026,"-77.00","LUMO ENERGY",""',
    '17/06/2026,"-66.00","AGL SALES",""',
    '17/06/2026,"-55.00","DEPARTMENT OF TRANSPOR VIC",""',
    '17/06/2026,"-44.00","KOENIGMACHINERY",""',
    '17/06/2026,"-12.00","UNKNOWN MERCHANT",""',
    '18/06/2026,"-2.00","COLES AFTER PERIOD",""',
    '18/07/2026,"-3.00","COLES MISSING MONTH",""',
  ].join("\n");

  await page.locator("#transactionImportInput").fill(csvRows);
  await page.locator("#parseImportBtn").click();
  await expect(page.locator("#importSummary")).toContainText("Included");
  await expect(page.locator("#importSummary")).toContainText("8 transactions");
  await expect(page.locator("#importSummary")).toContainText("Needs review");
  await expect(page.locator("#importSummary")).toContainText("2 transactions");
  await expect(page.locator("#importSummary")).toContainText("Excluded");
  await expect(page.locator("#importSummary")).toContainText("4");
  await expect(page.locator("#importRows")).toContainText("COLES 7735");
  await expect(page.locator("#importRows")).toContainText("Grocery");
  await expect(page.locator("#importRows")).toContainText("EDWARD WONG");
  await expect(page.locator("#importRows")).toContainText("Medical out-of-pocket");
  await expect(page.locator("#importRows")).toContainText("AAMI");
  await expect(page.locator("#importRows")).toContainText("Car insurance");
  await expect(page.locator("#importRows")).toContainText("duplicate candidate");
  await expect(page.locator("#importRows")).toContainText("HOLLARD");
  await expect(page.locator("#importRows")).toContainText("Home insurance");
  await expect(page.locator("#importRows")).toContainText("LUMO");
  await expect(page.locator("#importRows")).toContainText("Electricity");
  await expect(page.locator("#importRows")).toContainText("AGL SALES");
  await expect(page.locator("#importRows")).toContainText("Gas");
  await expect(page.locator("#importRows")).toContainText("DEPARTMENT OF TRANSPOR");
  await expect(page.locator("#importRows")).toContainText("Transport");

  await page.locator('[data-import-tab="review"]').click();
  await expect(page.locator("#importRows")).toContainText("KOENIGMACHINERY");
  await expect(page.locator("#importRows")).toContainText("incidentals require confirmation");
  await expect(page.locator("#importRows")).toContainText("UNKNOWN MERCHANT");
  await expect(page.locator("#importRows")).toContainText("low confidence");
  await page
    .locator(".import-row-card", { hasText: "KOENIGMACHINERY" })
    .locator('[data-import-action="include"]')
    .click();

  await page.locator('[data-import-tab="excluded"]').click();
  await expect(page.locator("#importRows")).toContainText("outside selected period");
  await expect(page.locator("#importRows")).toContainText("positive amount / payment / refund");
  await expect(page.locator("#importRows")).toContainText("month not created");

  await page.locator("#applyImportBtn").click();
  await expect(page.locator("#importStatus")).toContainText("Applied 9 transactions");
  await expect(page.locator('input[data-category="medical"]')).toHaveValue("90");
  await expect(page.locator('input[data-category="carInsurance"]')).toHaveValue("246.9");
  await expect(page.locator('input[data-category="homeInsurance"]')).toHaveValue("88");
  await expect(page.locator('input[data-category="electricity"]')).toHaveValue("77");
  await expect(page.locator('input[data-category="gas"]')).toHaveValue("66");
  await expect(page.locator('input[data-category="transport"]')).toHaveValue("55");
  await expect(page.locator('input[data-category="incidentals"]')).toHaveValue("44");
  await expect(page.locator("#notesInput")).toHaveValue(/KOENIGMACHINERY/);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () =>
      page.evaluate(() => ({
        pageFits: document.documentElement.scrollWidth <= window.innerWidth + 1,
        importFits: document.querySelector(".transaction-import-panel").getBoundingClientRect().right <= window.innerWidth + 1,
      })),
    )
    .toEqual({ pageFits: true, importFits: true });

  await page.locator("#languageSelect").selectOption("zh");
  await expect(page.locator("#parseImportBtn")).not.toHaveText("Parse transactions");
  await page.locator("#languageSelect").selectOption("en");
  await page.setViewportSize({ width: 1280, height: 720 });

  page.on("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    await dialog.accept();
  });
  await page.locator('.nav-tab[data-view="overview"]').click();
  await page.locator("#deleteMonthBtn").click();
  await expect(page.locator("#overviewTitle")).not.toHaveText(monthName);
});

test("transaction import accepts copied online banking text", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  await page.locator("#languageSelect").selectOption("en");

  const monthName = `Open Text Import ${Date.now()}`;
  await page.locator("#addMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeVisible();
  await page.locator("#newMonthName").fill(monthName);
  await page.locator("#confirmMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeHidden();
  await page.locator('.nav-tab[data-view="entry"]').click();
  await expect(page.locator("#entryView")).toHaveClass(/active/);

  await page.locator("#periodStartInput").fill("2026-06-22");
  await page.locator("#periodEndInput").fill("2026-06-23");
  await page.locator("#availableInput").fill("14800");
  await page.locator("#unpaidInput").fill("0");

  const copiedRows = [
    "Available",
    "+$10,956.21",
    "",
    "Total owing$3,687.95",
    "23 Jun 2026",
    "Open transaction detailsPENDING - Department of Transpor Melbourne AUS",
    "-$20.00",
    "23 Jun 2026",
    "Open transaction detailsPENDING - Public Transport Victo Melbourne AUS",
    "",
    "23 Jun 2026",
    "Open transaction detailsPENDING - SQ *DONCASTER Doncaster Eas AUS",
    "-$26.50",
    "23 Jun 2026",
    "Open transaction detailsPENDING - ALDI STORES THE PINES AUS",
    "-$42.55",
    "22 Jun 2026",
    "Open transaction detailsPENDING - POINT PARKING Dandenong Rd AUS",
    "-$4.06",
    "22 Jun 2026",
    "Open transaction detailsPENDING - Daiso (Chadstone SC) Chadstone AUS",
    "-$3.30",
  ].join("\n");

  await page.locator("#transactionImportInput").fill(copiedRows);
  await page.locator("#parseImportBtn").click();
  await expect(page.locator("#importSummary")).toContainText("Included");
  await expect(page.locator("#importSummary")).toContainText("5 transactions");
  await expect(page.locator("#importSummary")).toContainText("Excluded");
  await expect(page.locator("#importSummary")).toContainText("1");
  await expect(page.locator("#availableInput")).toHaveValue("10956.21");
  await expect(page.locator("#unpaidInput")).toHaveValue("3687.95");
  await expect(page.locator("#importRows")).toContainText("Department of Transpor");
  await expect(page.locator("#importRows")).toContainText("Transport");
  await expect(page.locator("#importRows")).toContainText("SQ *DONCASTER");
  await expect(page.locator("#importRows")).toContainText("Grocery");
  await expect(page.locator("#importRows")).toContainText("ALDI STORES");
  await expect(page.locator("#importRows")).toContainText("POINT PARKING");
  await expect(page.locator("#importRows")).toContainText("Daiso");
  await expect(page.locator("#importRows")).toContainText("Shopping and dining");

  await page.locator('[data-import-tab="excluded"]').click();
  await expect(page.locator("#importRows")).toContainText("Public Transport Victo");
  await expect(page.locator("#importRows")).toContainText("unsupported row format");

  await page.locator("#applyImportBtn").click();
  await expect(page.locator("#importStatus")).toContainText("Applied 5 transactions");
  await expect(page.locator('input[data-category="transport"]')).toHaveValue("24.06");
  await expect(page.locator('input[data-category="shoppingDining"]')).toHaveValue("3.3");

  page.on("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    await dialog.accept();
  });
  await page.locator('.nav-tab[data-view="overview"]').click();
  await page.locator("#deleteMonthBtn").click();
  await expect(page.locator("#overviewTitle")).not.toHaveText(monthName);
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
