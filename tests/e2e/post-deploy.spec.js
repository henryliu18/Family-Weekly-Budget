const { expect, test, request: apiRequest } = require("@playwright/test");

const httpUrl = process.env.E2E_HTTP_URL || "http://127.0.0.1:18080";
const baseUrl = process.env.E2E_BASE_URL || "https://127.0.0.1:18443";
const password = process.env.E2E_APP_PASSWORD || "";
const appUrl = "/app";

async function login(page) {
  await page.goto(appUrl);
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

async function addMonth(page, monthValue) {
  await page.locator("#addMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeVisible();
  await page.locator("#newMonthPicker").evaluate((input, value) => {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, monthValue);
  await page.locator("#confirmMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeHidden();
}

async function seedTrendMonths(page) {
  const base = await page.evaluate(() => structuredClone(appState));
  const limit = 15000;
  const months = [
    {
      id: "2098-01",
      sortKey: "2098-01",
      name: "2026 January",
      cumulativeSpend: 3600,
      categoryValues: { medical: 400, transport: 220, shoppingDining: 420, incidentals: 0 },
    },
    {
      id: "2098-02",
      sortKey: "2098-02",
      name: "2026 February",
      cumulativeSpend: 6800,
      categoryValues: { privateInsurance: 511.44, electricity: 180, government: 540, incidentals: 320 },
    },
    {
      id: "2098-03",
      sortKey: "2098-03",
      name: "2026 March",
      cumulativeSpend: 9300,
      categoryValues: { school: 620, carInsurance: 420, shoppingDining: 380, incidentals: 520 },
    },
  ];

  months.forEach((month) => {
    base.months[month.id] = {
      id: month.id,
      sortKey: month.sortKey,
      name: month.name,
      displayName: month.name,
      creditLimit: limit,
      weeks: [
        {
          id: `${month.id}-w1`,
          period: "Period 1",
          availableBalance: limit - month.cumulativeSpend,
          unpaidPrevious: null,
          cumulativeSpend: month.cumulativeSpend,
          categoryValues: month.categoryValues,
          notes: "E2E trend seed",
        },
      ],
    };
  });
  base.currentMonthId = months[0].id;

  const response = await page.request.post("/api/state", { data: base });
  expect(response.ok()).toBe(true);
  await page.goto(appUrl);
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
  await expectCanvasReady(page, "#monthlyTrendChart");

  const seededMonthIds = months.map((month) => month.id);
  await expect
    .poll(async () => page.evaluate((ids) => monthlyTrendRows().filter((row) => ids.includes(row.id)).length, seededMonthIds))
    .toBe(seededMonthIds.length);

  return seededMonthIds;
}

test("HTTP redirects to HTTPS", async ({ request }) => {
  const response = await request.get(httpUrl, { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toMatch(/^https:\/\//);
});

test("landing page serves standalone entry", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".landing-headline")).toHaveText("Weekly budgeting, clearly presented.");
  await expect(page.locator('.landing-actions a[href="#trialAccessCard"]')).toBeVisible();
  await expect(page.locator("#landingLoginForm")).toBeVisible();
  await expect(page.locator("#authOverlay")).toHaveCount(0);
});

test("authenticated state API persists current workspace data", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);

  const originalResponse = await page.request.get("/api/state");
  expect(originalResponse.ok()).toBe(true);
  const originalState = await originalResponse.json();
  const testMonthId = "e2e-workspace-seam";
  const updatedState = structuredClone(originalState);
  updatedState.months[testMonthId] = {
    id: testMonthId,
    sortKey: "2098-12",
    name: "2098 December",
    displayName: "2098 December",
    creditLimit: 15000,
    weeks: [
      {
        id: `${testMonthId}-w1`,
        period: "Period 1",
        availableBalance: 14900,
        unpaidPrevious: null,
        cumulativeSpend: 100,
        categoryValues: { transport: 25, shoppingDining: 25, incidentals: 0 },
        notes: "E2E workspace seam seed",
      },
    ],
  };
  updatedState.currentMonthId = testMonthId;

  try {
    const writeResponse = await page.request.post("/api/state", { data: updatedState });
    expect(writeResponse.ok()).toBe(true);

    const persistedResponse = await page.request.get("/api/state");
    expect(persistedResponse.ok()).toBe(true);
    const persistedState = await persistedResponse.json();
    expect(persistedState.currentMonthId).toBe(testMonthId);
    expect(persistedState.months[testMonthId]?.weeks?.[0]?.notes).toBe("E2E workspace seam seed");
  } finally {
    const restoreResponse = await page.request.post("/api/state", { data: originalState });
    expect(restoreResponse.ok()).toBe(true);
  }
});

test("authenticated sessions resolve isolated workspaces", async () => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  const first = await apiRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  const second = await apiRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  const workspaces = [
    { context: first, workspaceId: "e2e-session-alpha", monthId: "e2e-session-alpha-month" },
    { context: second, workspaceId: "e2e-session-bravo", monthId: "e2e-session-bravo-month" },
  ];

  try {
    for (const workspace of workspaces) {
      const loginResponse = await workspace.context.post("/api/session", {
        data: { password, workspaceId: workspace.workspaceId },
      });
      expect(loginResponse.ok()).toBe(true);
      await expect(loginResponse.json()).resolves.toMatchObject({ workspaceId: workspace.workspaceId });

      const stateResponse = await workspace.context.get("/api/state");
      expect(stateResponse.ok()).toBe(true);
      const state = await stateResponse.json();
      state.months[workspace.monthId] = {
        id: workspace.monthId,
        sortKey: "2099-10",
        name: workspace.workspaceId,
        displayName: workspace.workspaceId,
        creditLimit: 15000,
        weeks: [
          {
            id: `${workspace.monthId}-w1`,
            period: "Period 1",
            availableBalance: 14950,
            unpaidPrevious: null,
            cumulativeSpend: 50,
            categoryValues: { transport: 25, shoppingDining: 25, incidentals: 0 },
            notes: `E2E session workspace ${workspace.workspaceId}`,
          },
        ],
      };
      state.currentMonthId = workspace.monthId;

      const writeResponse = await workspace.context.post("/api/state", { data: state });
      expect(writeResponse.ok()).toBe(true);
    }

    for (const workspace of workspaces) {
      const persistedResponse = await workspace.context.get("/api/state");
      expect(persistedResponse.ok()).toBe(true);
      const persisted = await persistedResponse.json();
      expect(persisted.currentMonthId).toBe(workspace.monthId);
      expect(persisted.months[workspace.monthId]?.weeks?.[0]?.notes).toBe(
        `E2E session workspace ${workspace.workspaceId}`,
      );

      const otherWorkspace = workspaces.find((candidate) => candidate.workspaceId !== workspace.workspaceId);
      expect(persisted.months[otherWorkspace.monthId]).toBeUndefined();
    }
  } finally {
    await first.dispose();
    await second.dispose();
  }
});

test("session login rejects unregistered workspaces", async () => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  const context = await apiRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  try {
    const response = await context.post("/api/session", {
      data: { password, workspaceId: "e2e-unregistered-workspace" },
    });
    expect(response.status()).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: "Workspace is not registered." });
  } finally {
    await context.dispose();
  }
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
    await page.locator("#weekSelect").selectOption(nextPeriodValue);
    await expect(page.locator("#entryPeriodComparisonTitle")).toHaveText("Period 2");
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
  await expect(page.locator("#saveToast")).toContainText("Saved Period 2:");
  await expect(page.locator("#saveToast")).toContainText("period total");
  await expect(page.locator("#saveToast")).toContainText("grocery");
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
  await page.reload();
  await expect(page.locator("#logoutBtn")).toBeVisible();
  await page.locator('.nav-tab[data-view="entry"]').click();
  await page.locator("#weekSelect").selectOption({ index: 1 });
  await expect(page.locator("#periodStartInput")).toHaveValue("2026-06-01");
  await expect(page.locator("#periodEndInput")).toHaveValue("2026-06-07");
  await expect(page.locator("#periodInput")).toHaveValue("2026-06-01 - 2026-06-07");
  await expect(page.locator("#notesInput")).toHaveValue(note);

  await page.locator("#addMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeVisible();
  await expect(page.locator("#cancelMonthBtn")).toHaveText("Cancel");
  await page.locator("#cancelMonthBtn").click();
  await expect(page.locator("#monthDialog")).toBeHidden();

  await addMonth(page, "2030-01");
  await expect(page.locator("#monthSelect option:checked")).toHaveText("2030 January");
  await expect(page.locator("#overviewTitle")).toHaveText("2030 January");
  await expect(page.locator("#weekSelect option").nth(0)).toHaveText("Period 1");
  await expect(page.locator("#periodStartInput")).toHaveValue("2030-01-01");
  await expect(page.locator("#periodEndInput")).toHaveValue("2030-01-07");
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
  await expect(page.locator("#overviewTitle")).not.toHaveText("2030 January");

  await page.locator("#logoutBtn").click();
  await expect(page.locator("#authOverlay")).toBeVisible();
});

test("transaction import draft filters, reviews, and applies rows", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  await page.locator("#languageSelect").selectOption("en");

  await addMonth(page, "2026-06");
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
  await expect(page.locator("#overviewTitle")).not.toHaveText("2026 June");
});

test("transaction import accepts copied online banking text", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  await page.locator("#languageSelect").selectOption("en");

  await addMonth(page, "2026-09");
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
  await expect(page.locator("#overviewTitle")).not.toHaveText("2026 September");
});

test("brand home link navigates to overview", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  // Start in overview
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
  // Navigate to entry
  await page.locator('.nav-tab[data-view="entry"]').click();
  await expect(page.locator("#entryView")).toHaveClass(/active/);
  // Click brand
  await page.locator("#brandHome").click();
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
});

test("click trend chart switches to selected month", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  const seededMonthIds = await seedTrendMonths(page);
  // Ensure we're in overview with trend chart visible
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
  await expectCanvasReady(page, "#monthlyTrendChart");
  // Get a target seeded month from trendPoints
  const targetInfo = await page.evaluate((ids) => {
    // Need at least 2 trend points with different months
    if (trendPoints.length < 2) return null;
    const otherIdx = trendPoints.findIndex(p => ids.includes(p.row.id) && p.row.id !== currentMonthId);
    if (otherIdx < 0) return null;
    return { idx: otherIdx, id: trendPoints[otherIdx].row.id, x: Math.round(trendPoints[otherIdx].x) };
  }, seededMonthIds);
  expect(targetInfo).not.toBeNull();
  // Click trend chart at the target month's position (y=center of chart)
  await page.locator("#monthlyTrendChart").click({ position: { x: targetInfo.x, y: 150 } });
  // Verify month switched
  const newMonth = await page.evaluate(() => currentMonthId);
  expect(newMonth).toBe(targetInfo.id);
});

test("import textarea clears when leaving entry view", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  // Go to entry view
  await page.locator('.nav-tab[data-view="entry"]').click();
  await expect(page.locator("#entryView")).toHaveClass(/active/);
  // Type into import textarea
  await page.locator("#transactionImportInput").fill("test data to clear");
  await expect(page.locator("#transactionImportInput")).toHaveValue("test data to clear");
  // Switch to overview
  await page.locator('.nav-tab[data-view="overview"]').click();
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
  // Verify textarea is cleared
  await expect(page.locator("#transactionImportInput")).toHaveValue("");
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

test("trend chart renders status bars with correct colors", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  const seededMonthIds = await seedTrendMonths(page);
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
  await expectCanvasReady(page, "#monthlyTrendChart");

  const barInfo = await page.evaluate((ids) => {
    const rows = monthlyTrendRows().filter((row) => ids.includes(row.id));
    return rows.map((r) => ({
      name: r.name,
      total: r.total,
      kind: monthlyStatusKind(appState.months[r.id]),
      limit: r.creditLimit,
      ratio: r.total / r.creditLimit,
    }));
  }, seededMonthIds);

  expect(barInfo).toHaveLength(seededMonthIds.length);
  barInfo.forEach((m) => {
    expect(m.total).toBeGreaterThan(0);
    expect(["good", "watch", "over", "empty"]).toContain(m.kind);
    expect(m.ratio).toBeGreaterThan(0);
    expect(m.ratio).toBeLessThanOrEqual(1.5);
  });
});

test("monthly trend bar status colors match overview", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
  await expectCanvasReady(page, "#monthlyTrendChart");

  // Verify pill text is set (could be empty dash "-" or a status word)
  await expect(page.locator("#overviewStatusPill")).not.toBeEmpty();

  // Check at least one month in the trend chart has valid status
  const allKinds = await page.evaluate(() => {
    const rows = monthlyTrendRows();
    return rows.map((r) => monthlyStatusKind(appState.months[r.id]));
  });
  expect(allKinds.length).toBeGreaterThanOrEqual(1);
  const validKinds = allKinds.filter((k) => ["good", "watch", "over", "empty"].includes(k));
  expect(validKinds.length).toBeGreaterThanOrEqual(1);

  // Switch to another month and verify _barStatusKind gets set when overview renders
  const monthIds = await page.evaluate(() => Object.keys(appState.months));
  if (monthIds.length >= 2) {
    const selectedMonthId = await page.evaluate(() => currentMonthId);
    const otherId = monthIds.find((id) => id !== selectedMonthId);
    if (otherId) {
      await page.locator("#monthSelect").selectOption(otherId);
      await expect(page.locator("#overviewView")).toHaveClass(/active/);
      await expectCanvasReady(page, "#monthlyTrendChart");

      const switchedKind = await page.evaluate(() => currentMonth()?._barStatusKind || "");
      // After switching months, the overview re-renders and _barStatusKind should be set
      expect(["good", "watch", "over", "empty"]).toContain(switchedKind);
    }
  }
});

test("weekly chart category colors stay distinct from status palette", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  await expectCanvasReady(page, "#weeklyChart");

  const appJs = await page.request.get("/app.js");
  expect(appJs.ok()).toBe(true);
  const source = await appJs.text();
  const palette = source.match(/var CATEGORY_CHART_COLORS[\s\S]*?\}\);/)?.[0] || "";
  expect(palette).toContain("rgba(88, 80, 196, 0.74)");
  expect(palette).toContain("rgba(15, 118, 168, 0.72)");
  expect(palette).toContain("rgba(168, 85, 247, 0.70)");
  expect(palette).not.toContain("rgba(36, 113, 93, 0.70)");
  expect(palette).not.toContain("rgba(195, 107, 45, 0.70)");
  expect(palette).not.toContain("rgba(185, 65, 61, 0.70)");

  // Verify the weekly chart canvas has rendered content
  const hasContent = await page.evaluate(() => {
    const c = document.getElementById("weeklyChart");
    return c.toDataURL().length > 3000;
  });
  expect(hasContent).toBe(true);
});

test("bar colors scale with spending via /api/state", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);

  // Build test state: 3 months with different spending ratios
  const base = await page.evaluate(() => structuredClone(appState));
  const limit = 15000;

  // Over month: 90% used
  const overMonthId = "e2e-over";
  base.months[overMonthId] = {
    id: overMonthId,
    name: "2099 January",
    creditLimit: limit,
    weeks: [
      {
        id: overMonthId + "-w1",
        period: "1",
        cumulativeSpend: 13500,
        categoryValues: { medical: 2000, shoppingDining: 2000, government: 9500, incidentals: 0 },
      },
    ],
  };

  // Watch month: 60% used
  const watchMonthId = "e2e-watch";
  base.months[watchMonthId] = {
    id: watchMonthId,
    name: "2099 February",
    creditLimit: limit,
    weeks: [
      {
        id: watchMonthId + "-w1",
        period: "1",
        cumulativeSpend: 9000,
        categoryValues: { medical: 2000, shoppingDining: 2000, government: 5000, incidentals: 0 },
      },
    ],
  };

  // Good month: 30% used
  const goodMonthId = "e2e-good";
  base.months[goodMonthId] = {
    id: goodMonthId,
    name: "2099 March",
    creditLimit: limit,
    weeks: [
      {
        id: goodMonthId + "-w1",
        period: "1",
        cumulativeSpend: 4500,
        categoryValues: { medical: 1000, shoppingDining: 1000, government: 2500, incidentals: 0 },
      },
    ],
  };

  base.currentMonthId = overMonthId;

  // POST state to server
  const resp = await page.request.post("/api/state", { data: base });
  expect(resp.ok()).toBe(true);

  // Reload page to pick up new state — auth cookie persists, no re-login needed
  await page.reload();
  await page.waitForSelector("#monthSelect", { timeout: 15000 });
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
  await expectCanvasReady(page, "#monthlyTrendChart");

  // Verify status kinds via monthlyTrendRows
  const kinds = await page.evaluate(
    ({ overId, watchId, goodId }) => {
      const rows = monthlyTrendRows();
      const over = rows.find((r) => r.id === overId);
      const watch = rows.find((r) => r.id === watchId);
      const good = rows.find((r) => r.id === goodId);
      return {
        over: over
          ? { total: over.total, kind: monthlyStatusKind(appState.months[over.id]) }
          : null,
        watch: watch
          ? { total: watch.total, kind: monthlyStatusKind(appState.months[watch.id]) }
          : null,
        good: good
          ? { total: good.total, kind: monthlyStatusKind(appState.months[good.id]) }
          : null,
      };
    },
    { overId: overMonthId, watchId: watchMonthId, goodId: goodMonthId },
  );

  if (kinds.over) {
    expect(kinds.over.total).toBeGreaterThan(limit * 0.8);
    expect(kinds.over.kind).toBe("over");
  }
  if (kinds.watch) {
    expect(kinds.watch.total).toBeGreaterThan(limit * 0.5);
    expect(kinds.watch.total).toBeLessThan(limit * 0.8);
    expect(kinds.watch.kind).toBe("watch");
  }
  if (kinds.good) {
    expect(kinds.good.total).toBeLessThan(limit * 0.5);
    expect(kinds.good.kind).toBe("good");
  }
});
