const { expect, test } = require("@playwright/test");

const httpUrl = process.env.E2E_HTTP_URL || "http://127.0.0.1:5173";
const password = process.env.E2E_APP_PASSWORD || "";

async function login(page) {
  if (!password) {
    // Unauthenticated mode — navigate and proceed
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

// ── HTTP redirect test (no auth needed) ──

test("HTTP redirects to HTTPS", async ({ request }) => {
  const response = await request.get(httpUrl, { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toMatch(/^https:\/\//);
});

// ── Smoke / workflow test ──

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

  // Create a new month via month picker and verify it can be deleted
  await page.locator("#addMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeVisible();
  await page.locator("#newMonthPicker").evaluate((el, v) => { el.value = v; }, "2026-06");
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

// ── Month picker tests (work with or without auth) ──

test("adds a month via month picker with correct period names", async ({ page }) => {
  await login(page);
  await page.locator("#languageSelect").selectOption("en");

  await page.locator("#addMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeVisible();
  await page.locator("#newMonthPicker").evaluate((el) => { el.value = "2026-08"; });
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
  await page.locator("#languageSelect").selectOption("en");

  for (const mv of ["2025-06", "2025-01", "2026-03", "2025-09"]) {
    await page.locator("#addMonthBtn").click();
    await expect(page.locator("#monthDialog")).toBeVisible();
    await page.locator("#newMonthPicker").evaluate((el, v) => { el.value = v; }, mv);
    await page.locator("#confirmMonthBtn").click();
    await expect(page.locator("#monthDialog")).toBeHidden();
  }

  const texts = await page.locator("#monthSelect option").allTextContents();
  const testMonths = texts.filter((t) =>
    ["2025 January", "2025 June", "2025 September", "2026 March"].includes(t)
  );
  expect(testMonths).toEqual(["2025 January", "2025 June", "2025 September", "2026 March"]);
});

test("new month gets default dates based on month context", async ({ page }) => {
  await login(page);
  await page.locator("#languageSelect").selectOption("en");

  await page.locator("#addMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeVisible();
  await page.locator("#newMonthPicker").evaluate((el) => { el.value = "2023-03"; });
  await page.locator("#confirmMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeHidden();

  await page.locator('[data-view="entry"]').click();
  await expect(page.locator("#entryView")).toHaveClass(/active/);
  await expect(page.locator("#periodStartInput")).toHaveValue("2023-03-01");
  await expect(page.locator("#periodEndInput")).toHaveValue("2023-03-07");
});

test("trend chart shows months in chronological order", async ({ page }) => {
  await login(page);
  await page.locator("#languageSelect").selectOption("en");

  for (const mv of ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"]) {
    await page.locator("#addMonthBtn").click();
    await expect(page.locator("#monthDialog")).toBeVisible();
    await page.locator("#newMonthPicker").evaluate((el, v) => { el.value = v; }, mv);
    await page.locator("#confirmMonthBtn").click();
    await expect(page.locator("#monthDialog")).toBeHidden();
  }

  const trendOrder = await page.evaluate(() => {
    try {
      return window.monthlyTrendRows().map((r) => r.name);
    } catch { return null; }
  });
  expect(trendOrder).not.toBeNull();
  const relevant = trendOrder.filter((n) =>
    ["2026 January", "2026 February", "2026 March", "2026 April", "2026 May"].includes(n)
  );
  expect(relevant).toEqual(["2026 January", "2026 February", "2026 March", "2026 April", "2026 May"]);
});

// ── Mobile viewport test ──

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
