const DATA_CONFIG = window.BUDGET_DATA;
const CREDIT_LIMIT = DATA_CONFIG.creditLimit;
const categories = DATA_CONFIG.categories;
const LANGUAGE_KEY = "family-budget-language";
const DEFAULT_LANGUAGE = "en";
const META_FALLBACK = { buildVersion: "", buildTime: "", authEnabled: false };
const i18n = {
  zh: {
    language: "語言",
    appTitle: "家庭週預算",
    appSubtitle: "Weekly budget tracker",
    month: "月份",
    addMonth: "新增月份",
    deleteMonth: "移除目前月份",
    overview: "總覽",
    entry: "本週輸入",
    history: "歷史查詢",
    settings: "分類設定",
    currentMonth: "目前月份",
    creditLimit: "信用卡總額度",
    monthSpend: "本月累積支出",
    latestAvailable: "最新可用餘額",
    latestWeekSpend: "最新週總支出",
    weeklyComposition: "每週支出組成",
    weeklyCompositionSub: "非採買、採買與意外支出堆疊比較",
    monthlyTrend: "月支出趨勢",
    monthlyTrendSub: "以月份比較採買、非採買與意外支出",
    needTwoMonths: "需要至少兩個月份才有趨勢",
    monthlyTotal: "月總支出",
    monthWeeks: "月份週紀錄",
    period: "週期",
    to: "至",
    cumulative: "本月累積",
    weeklyTotal: "當週總支出",
    nonGrocery: "非採買",
    grocery: "採買",
    incidentals: "意外",
    notes: "備註",
    edit: "編輯",
    unnamedPeriod: "未命名週次",
    entryEyebrow: "週次編輯",
    entryTitle: "本週輸入",
    saveWeek: "儲存週次",
    weekData: "週資料",
    weekDataSub: "輸入累積值後，當週總支出會自動推算",
    editPeriod: "編輯週次",
    availableBalance: "可用餘額",
    cumulativeAfterUnpaid: "本月總支出(扣除上月待繳)",
    unpaidPrevious: "上月待繳(如有)",
    categoryAmounts: "分類金額",
    categoryAmountsSub: "非採買合計與採買支出會依公式自動計算",
    otherDetails: "其他非帳單額外支出明細",
    searchEyebrow: "查詢",
    pastRecords: "過去紀錄",
    allMonths: "全部月份",
    allCategories: "全部分類",
    category: "分類",
    keyword: "關鍵字",
    keywordPlaceholder: "週期、備註、分類",
    minAmount: "最低金額",
    amount: "金額",
    noRecords: "沒有符合條件的紀錄",
    dataSettingsTitle: "資料與分類設定",
    monthData: "目前月份資料",
    monthDataSub: "這些設定會儲存在後端資料檔",
    saveSettings: "儲存設定",
    monthName: "月份名稱",
    backup: "資料備份",
    backupSub: "可將目前資料匯出，或匯入語言模型/備份產生的資料",
    exportJson: "匯出資料 JSON",
    importJson: "匯入資料 JSON",
    resetDefault: "重置成預設資料",
    categorySettings: "分類設定",
    categorySettingsSub: "語言模型分類時應輸出其中一個 key",
    type: "類型",
    ruleHint: "規則提示",
    autoCalculated: "自動計算",
    incidentalType: "意外支出",
    categoryLabels: {
      medical: "醫療自費",
      privateInsurance: "私保",
      electricity: "電費",
      gas: "瓦斯費",
      internetMobile: "網路手機費(含服務訂閱)",
      water: "水費",
      school: "學費",
      homeInsurance: "房屋險",
      carInsurance: "車險",
      transport: "交通費用",
      government: "政府費用",
      shoppingDining: "購物外食",
      incidentals: "當周意外支出",
    },
    deleteOnlyMonth: "至少需要保留一個月份。",
    deleteConfirm: (name) => `確定要移除「${name}」嗎？這會刪除該月份的所有週紀錄。`,
    importFailed: "匯入失敗，請確認 JSON 格式正確。",
    firstPeriod: "第一週",
    secondPeriod: "第二週",
    thirdPeriod: "第三週",
    fourthPeriod: "第四週",
    buildVersion: "Build version",
    loginRequired: "需要登入",
    loginTitle: "輸入密碼",
    loginSub: "這是受保護的家庭預算資料。",
    password: "密碼",
    login: "登入",
    logout: "登出",
    loginFailed: "密碼不正確，請再試一次。",
  },
  en: {
    language: "Language",
    appTitle: "Family Weekly Budget",
    appSubtitle: "Weekly budget tracker",
    month: "Month",
    addMonth: "Add month",
    deleteMonth: "Delete current month",
    overview: "Overview",
    entry: "Weekly entry",
    history: "History",
    settings: "Settings",
    currentMonth: "Current month",
    creditLimit: "Credit card limit",
    monthSpend: "Monthly spend to date",
    latestAvailable: "Latest available balance",
    latestWeekSpend: "Latest period spend",
    weeklyComposition: "Period Spend Breakdown",
    weeklyCompositionSub: "Stacked non-grocery, grocery, and incidental spending",
    monthlyTrend: "Monthly Spending Trend",
    monthlyTrendSub: "Compare grocery, non-grocery, and incidental spending by month",
    needTwoMonths: "At least two months are needed for a trend",
    monthlyTotal: "Monthly total",
    monthWeeks: "Month Period Records",
    period: "Period",
    to: "to",
    cumulative: "Monthly total",
    weeklyTotal: "Period total",
    nonGrocery: "Non-grocery",
    grocery: "Grocery",
    incidentals: "Incidentals",
    notes: "Notes",
    edit: "Edit",
    unnamedPeriod: "Untitled period",
    entryEyebrow: "Period editor",
    entryTitle: "Weekly Entry",
    saveWeek: "Save period",
    weekData: "Period data",
    weekDataSub: "Period total is calculated from the running monthly total",
    editPeriod: "Edit period",
    availableBalance: "Available balance",
    cumulativeAfterUnpaid: "Monthly spend after unpaid balance",
    unpaidPrevious: "Unpaid previous balance",
    categoryAmounts: "Category amounts",
    categoryAmountsSub: "Non-grocery total and grocery spend are calculated automatically",
    otherDetails: "Other incidental details",
    searchEyebrow: "Search",
    pastRecords: "Past Records",
    allMonths: "All months",
    allCategories: "All categories",
    category: "Category",
    keyword: "Keyword",
    keywordPlaceholder: "Period, notes, category",
    minAmount: "Minimum amount",
    amount: "Amount",
    noRecords: "No matching records",
    dataSettingsTitle: "Data and Category Settings",
    monthData: "Current month data",
    monthDataSub: "These settings are saved to the backend data file",
    saveSettings: "Save settings",
    monthName: "Month name",
    backup: "Data backup",
    backupSub: "Export current data or import data generated by a model/backup",
    exportJson: "Export JSON",
    importJson: "Import JSON",
    resetDefault: "Reset to default data",
    categorySettings: "Category Settings",
    categorySettingsSub: "Classification models should output one of these keys",
    type: "Type",
    ruleHint: "Rule hint",
    autoCalculated: "Auto calculated",
    incidentalType: "Incidental",
    categoryLabels: {
      medical: "Medical out-of-pocket",
      privateInsurance: "Private insurance",
      electricity: "Electricity",
      gas: "Gas",
      internetMobile: "Internet, mobile, subscriptions",
      water: "Water",
      school: "School fees",
      homeInsurance: "Home insurance",
      carInsurance: "Car insurance",
      transport: "Transport",
      government: "Government fees",
      shoppingDining: "Shopping and dining",
      incidentals: "Incidentals",
    },
    deleteOnlyMonth: "Keep at least one month.",
    deleteConfirm: (name) => `Delete "${name}" and all period records in it?`,
    importFailed: "Import failed. Please check the JSON format.",
    firstPeriod: "Period 1",
    secondPeriod: "Period 2",
    thirdPeriod: "Period 3",
    fourthPeriod: "Period 4",
    buildVersion: "Build version",
    loginRequired: "Login required",
    loginTitle: "Enter password",
    loginSub: "This family budget is protected.",
    password: "Password",
    login: "Log in",
    logout: "Log out",
    loginFailed: "Incorrect password. Please try again.",
  },
};
let currentLanguage = localStorage.getItem(LANGUAGE_KEY) || DEFAULT_LANGUAGE;
let appMeta = META_FALLBACK;
let authState = { authEnabled: false, authenticated: true };

const money = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
});

let appState = normalizeState(structuredClone(DATA_CONFIG.initialState));
let currentMonthId = appState.currentMonthId;
let currentWeekId = appState.months[currentMonthId].weeks[0]?.id;
let chartBars = [];
let trendPoints = [];

const els = {};

document.addEventListener("DOMContentLoaded", async () => {
  bindElements();
  bindEvents();
  await bootstrapApp();
});

async function bootstrapApp() {
  await loadMeta();
  await loadSession();
  applyLanguage();
  updateBuildVersion();
  updateAuthUi();
  if (authState.authEnabled && !authState.authenticated) return;
  await loadState();
  renderAll();
}

async function loadMeta() {
  try {
    const response = await fetch("/api/meta", { cache: "no-store" });
    if (!response.ok) throw new Error("Meta request failed");
    appMeta = { ...META_FALLBACK, ...(await response.json()) };
  } catch {
    appMeta = META_FALLBACK;
  }
}

async function loadSession() {
  try {
    const response = await fetch("/api/session", { cache: "no-store" });
    if (!response.ok) throw new Error("Session request failed");
    authState = await response.json();
  } catch {
    authState = { authEnabled: false, authenticated: true };
  }
}

async function loadState() {
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (response.status === 401) {
      authState = { ...authState, authenticated: false };
      updateAuthUi();
      return;
    }
    if (!response.ok) throw new Error("State request failed");
    appState = normalizeState(await response.json());
  } catch {
    appState = normalizeState(structuredClone(DATA_CONFIG.initialState));
  }
  currentMonthId = appState.currentMonthId;
  currentWeekId = appState.months[currentMonthId].weeks[0]?.id;
}

function normalizeState(state) {
  const fallback = structuredClone(DATA_CONFIG.initialState);
  const next = state && state.months ? state : fallback;
  Object.values(next.months).forEach((month) => {
    month.creditLimit = numberOrZero(month.creditLimit) || CREDIT_LIMIT;
    month.weeks = Array.isArray(month.weeks) ? month.weeks.map((week) => createWeek(week)) : [];
    if (month.weeks.length === 0) {
      month.weeks = ["第一週", "第二週", "第三週", "第四週"].map((period) =>
        createWeek({ period, availableBalance: month.creditLimit }),
      );
    }
  });
  if (!next.currentMonthId || !next.months[next.currentMonthId]) {
    next.currentMonthId = Object.keys(next.months)[0];
  }
  return next;
}

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createWeek(input = {}) {
  return {
    id: input.id || createId(),
    period: input.period || "",
    availableBalance: numberOrNull(input.availableBalance),
    unpaidPrevious: numberOrNull(input.unpaidPrevious),
    cumulativeSpend: numberOrNull(input.cumulativeSpend),
    categoryValues: { ...(input.categoryValues || {}) },
    notes: input.notes || "",
  };
}

function saveState() {
  if (authState.authEnabled && !authState.authenticated) return;
  appState.currentMonthId = currentMonthId;
  fetch("/api/state", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(appState),
  }).catch((error) => {
    console.error("Unable to save budget data", error);
  });
}

function bindElements() {
  [
    "monthSelect",
    "languageSelect",
    "addMonthBtn",
    "deleteMonthBtn",
    "overviewTitle",
    "limitKpi",
    "monthSpendKpi",
    "availableKpi",
    "weekSpendKpi",
    "weeklyChart",
    "chartTooltip",
    "monthlyTrendChart",
    "trendTooltip",
    "weeksTable",
    "weekSelect",
    "periodInput",
    "periodStartInput",
    "periodEndInput",
    "availableInput",
    "cumulativeInput",
    "unpaidInput",
    "weeklyTotalInput",
    "categoryInputs",
    "notesInput",
    "saveWeekBtn",
    "historyMonthFilter",
    "historyCategoryFilter",
    "historySearchInput",
    "historyMinInput",
    "historyTable",
    "categoryTable",
    "monthNameInput",
    "creditLimitInput",
    "saveMonthSettingsBtn",
    "exportDataBtn",
    "importDataInput",
    "resetLocalDataBtn",
    "monthDialog",
    "newMonthName",
    "cancelMonthBtn",
    "confirmMonthBtn",
    "buildVersionValue",
    "authOverlay",
    "loginForm",
    "passwordInput",
    "loginError",
    "loginBtn",
    "logoutBtn",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  document.querySelectorAll(".nav-tab").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  els.languageSelect.addEventListener("change", () => {
    currentLanguage = els.languageSelect.value;
    localStorage.setItem(LANGUAGE_KEY, currentLanguage);
    renderAll();
  });

  els.monthSelect.addEventListener("change", () => {
    currentMonthId = els.monthSelect.value;
    currentWeekId = currentMonth().weeks[0]?.id;
    saveState();
    renderAll();
  });

  els.addMonthBtn.addEventListener("click", openMonthDialog);
  els.deleteMonthBtn.addEventListener("click", deleteCurrentMonth);
  els.confirmMonthBtn.addEventListener("click", addMonth);
  els.cancelMonthBtn?.addEventListener("click", closeMonthDialog);
  els.monthDialog?.addEventListener("click", (event) => {
    if (event.target === els.monthDialog) closeMonthDialog();
  });

  els.weekSelect.addEventListener("change", () => {
    currentWeekId = els.weekSelect.value;
    renderEntryForm();
  });

  [
    els.periodInput,
    els.periodStartInput,
    els.periodEndInput,
    els.availableInput,
    els.cumulativeInput,
    els.unpaidInput,
    els.notesInput,
  ].forEach((input) => input.addEventListener("input", renderLiveWeeklyTotal));

  els.categoryInputs.addEventListener("input", renderLiveWeeklyTotal);
  els.saveWeekBtn.addEventListener("click", saveWeekFromForm);

  [
    els.historyMonthFilter,
    els.historyCategoryFilter,
    els.historySearchInput,
    els.historyMinInput,
  ].forEach((input) => input.addEventListener("input", renderHistory));

  els.saveMonthSettingsBtn.addEventListener("click", saveMonthSettings);
  els.exportDataBtn.addEventListener("click", exportData);
  els.importDataInput.addEventListener("change", importData);
  els.resetLocalDataBtn.addEventListener("click", resetLocalData);
  els.loginForm?.addEventListener("submit", handleLogin);
  els.logoutBtn?.addEventListener("click", logout);

  els.weeklyChart.addEventListener("mousemove", showChartTooltip);
  els.weeklyChart.addEventListener("mouseleave", () => els.chartTooltip.classList.add("hidden"));
  els.weeklyChart.addEventListener("click", selectWeekFromChart);
  els.monthlyTrendChart.addEventListener("mousemove", showTrendTooltip);
  els.monthlyTrendChart.addEventListener("mouseleave", () => els.trendTooltip.classList.add("hidden"));
  window.addEventListener("resize", () => {
    drawChart();
    drawMonthlyTrendChart();
  });
}

function switchView(view) {
  document.querySelectorAll(".nav-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === `${view}View`);
  });
  if (view === "overview") {
    drawChart();
    drawMonthlyTrendChart();
  }
}

function currentMonth() {
  return appState.months[currentMonthId];
}

function currentWeek() {
  return currentMonth().weeks.find((week) => week.id === currentWeekId) || currentMonth().weeks[0];
}

function renderAll() {
  applyLanguage();
  updateBuildVersion();
  if (isAuthLocked()) {
    clearSensitiveUi();
    return;
  }
  renderMonthOptions();
  renderOverview();
  renderEntryForm();
  renderHistoryFilters();
  renderHistory();
  renderMonthSettings();
  renderCategoryTable();
  saveState();
}

function t(key, ...args) {
  const value = i18n[currentLanguage]?.[key] ?? i18n.zh[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}

function categoryLabel(category) {
  return t("categoryLabels")?.[category.key] || category.label;
}

function isAuthLocked() {
  return authState.authEnabled && !authState.authenticated;
}

function applyLanguage() {
  els.languageSelect.value = currentLanguage;
  document.documentElement.lang = currentLanguage === "en" ? "en" : "zh-Hant";
  document.title = t("appTitle");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  const textBySelector = {
    ".brand h1": "appTitle",
    ".brand p": "appSubtitle",
    'label.field span:not([data-i18n])': null,
    "#addMonthBtn": "addMonth",
    "#deleteMonthBtn": "deleteMonth",
    '[data-view="overview"]': "overview",
    '[data-view="entry"]': "entry",
    '[data-view="history"]': "history",
    '[data-view="settings"]': "settings",
    "#saveWeekBtn": "saveWeek",
    "#saveMonthSettingsBtn": "saveSettings",
    "#exportDataBtn": "exportJson",
    "#resetLocalDataBtn": "resetDefault",
    "#confirmMonthBtn": "addMonth",
    "#loginBtn": "login",
    "#logoutBtn": "logout",
  };

  Object.entries(textBySelector).forEach(([selector, key]) => {
    if (!key) return;
    const element = document.querySelector(selector);
    if (element) element.textContent = t(key);
  });

  const spans = {
    monthSelect: "month",
    periodInput: "period",
    availableInput: "availableBalance",
    cumulativeInput: "cumulativeAfterUnpaid",
    unpaidInput: "unpaidPrevious",
    weeklyTotalInput: "weeklyTotal",
    notesInput: "otherDetails",
    historySearchInput: "keyword",
    historyMinInput: "minAmount",
    monthNameInput: "monthName",
    creditLimitInput: "creditLimit",
    newMonthName: "monthName",
  };
  Object.entries(spans).forEach(([id, key]) => {
    const label = document.getElementById(id)?.closest("label")?.querySelector("span");
    if (label) label.textContent = t(key);
  });

  els.historySearchInput.placeholder = t("keywordPlaceholder");
  if (els.loginError?.dataset.key) {
    els.loginError.textContent = t(els.loginError.dataset.key);
  }
}

function updateBuildVersion() {
  if (!els.buildVersionValue) return;
  const display = formatBuildVersion(appMeta.buildVersion) || formatBuildTime(appMeta.buildTime);
  els.buildVersionValue.textContent = display;
  els.buildVersionValue.title = appMeta.buildVersion || appMeta.buildTime || "";
}

function updateAuthUi() {
  const shouldShowOverlay = isAuthLocked();
  els.authOverlay?.classList.toggle("hidden", !shouldShowOverlay);
  els.logoutBtn?.classList.toggle("hidden", !authState.authEnabled || !authState.authenticated);
  if (shouldShowOverlay) {
    document.body.classList.add("auth-locked");
    clearSensitiveUi();
    setTimeout(() => els.passwordInput?.focus(), 0);
  } else {
    document.body.classList.remove("auth-locked");
    clearLoginError();
  }
}

async function handleLogin(event) {
  event.preventDefault();
  clearLoginError();
  const password = els.passwordInput.value;
  try {
    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      showLoginError("loginFailed");
      return;
    }
    authState = { authEnabled: true, authenticated: true };
    els.passwordInput.value = "";
    updateAuthUi();
    await loadState();
    renderAll();
  } catch {
    showLoginError("loginFailed");
  }
}

async function logout() {
  try {
    await fetch("/api/session", { method: "DELETE" });
  } catch {}
  authState = { ...authState, authenticated: false };
  updateAuthUi();
}

function clearSensitiveUi() {
  [
    els.limitKpi,
    els.monthSpendKpi,
    els.availableKpi,
    els.weekSpendKpi,
    els.overviewTitle,
  ].forEach((element) => {
    if (element) element.textContent = "-";
  });

  [
    els.monthSelect,
    els.weeksTable,
    els.weekSelect,
    els.historyMonthFilter,
    els.historyCategoryFilter,
    els.historyTable,
    els.categoryTable,
    els.categoryInputs,
  ].forEach((element) => {
    if (element) element.innerHTML = "";
  });

  [
    els.periodInput,
    els.periodStartInput,
    els.periodEndInput,
    els.availableInput,
    els.cumulativeInput,
    els.unpaidInput,
    els.weeklyTotalInput,
    els.notesInput,
    els.historySearchInput,
    els.historyMinInput,
    els.monthNameInput,
    els.creditLimitInput,
    els.newMonthName,
  ].forEach((element) => {
    if (element) element.value = "";
  });

  [els.chartTooltip, els.trendTooltip].forEach((element) => element?.classList.add("hidden"));
  clearCanvas(els.weeklyChart);
  clearCanvas(els.monthlyTrendChart);
}

function clearCanvas(canvas) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  context?.clearRect(0, 0, canvas.width, canvas.height);
}

function showLoginError(key) {
  if (!els.loginError) return;
  els.loginError.dataset.key = key;
  els.loginError.textContent = t(key);
  els.loginError.classList.remove("hidden");
}

function clearLoginError() {
  if (!els.loginError) return;
  delete els.loginError.dataset.key;
  els.loginError.textContent = "";
  els.loginError.classList.add("hidden");
}

function renderMonthOptions() {
  const months = Object.values(appState.months);
  els.monthSelect.innerHTML = months
    .map((month) => `<option value="${month.id}">${escapeHtml(month.name)}</option>`)
    .join("");
  els.monthSelect.value = currentMonthId;

  els.historyMonthFilter.innerHTML = [
    `<option value="all">${escapeHtml(t("allMonths"))}</option>`,
    ...months.map((month) => `<option value="${month.id}">${escapeHtml(month.name)}</option>`),
  ].join("");
}

function renderOverview() {
  const month = currentMonth();
  const rows = computedWeeks(month);
  const latest = [...rows].reverse().find((row) => row.week.cumulativeSpend !== null) || rows[0];

  els.overviewTitle.textContent = month.name;
  els.limitKpi.textContent = formatMoney(month.creditLimit);
  els.monthSpendKpi.textContent = formatMoney(latest?.cumulativeSpend || 0);
  els.availableKpi.textContent = formatMoney(latest?.week.availableBalance || month.creditLimit);
  els.weekSpendKpi.textContent = formatMoney(latest?.weeklyTotal || 0);

  renderWeeksTable(rows);
  requestAnimationFrame(() => {
    drawChart();
    drawMonthlyTrendChart();
  });
}

function computedWeeks(month) {
  return month.weeks.map((week, index) => {
    const previous = month.weeks[index - 1];
    const previousCumulative = numberOrZero(previous?.cumulativeSpend);
    const cumulativeSpend = numberOrNull(week.cumulativeSpend);
    const weeklyTotal =
      cumulativeSpend === null ? 0 : index === 0 ? cumulativeSpend : cumulativeSpend - previousCumulative;
    const nonGrocery = sumNonGrocery(week);
    const incidentals = numberOrZero(week.categoryValues.incidentals);
    const grocery = weeklyTotal === 0 ? 0 : weeklyTotal - nonGrocery - incidentals;

    return {
      week,
      cumulativeSpend: cumulativeSpend || 0,
      weeklyTotal: roundCurrency(weeklyTotal),
      nonGrocery: roundCurrency(nonGrocery),
      grocery: roundCurrency(grocery),
      incidentals: roundCurrency(incidentals),
    };
  });
}

function renderWeeksTable(rows) {
  const labels = {
    period: escapeHtml(t("period")),
    cumulative: escapeHtml(t("cumulative")),
    weeklyTotal: escapeHtml(t("weeklyTotal")),
    nonGrocery: escapeHtml(t("nonGrocery")),
    grocery: escapeHtml(t("grocery")),
    incidentals: escapeHtml(t("incidentals")),
    notes: escapeHtml(t("notes")),
    edit: escapeHtml(t("edit")),
  };

  els.weeksTable.innerHTML = `
    <thead>
      <tr>
        <th>${labels.period}</th>
        <th class="amount">${labels.cumulative}</th>
        <th class="amount">${labels.weeklyTotal}</th>
        <th class="amount">${labels.nonGrocery}</th>
        <th class="amount">${labels.grocery}</th>
        <th class="amount">${labels.incidentals}</th>
        <th>${labels.notes}</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (row) => `
            <tr>
              <td data-label="${labels.period}">${escapeHtml(row.week.period || t("unnamedPeriod"))}</td>
              <td class="amount" data-label="${labels.cumulative}">${formatMoney(row.cumulativeSpend)}</td>
              <td class="amount" data-label="${labels.weeklyTotal}">${formatMoney(row.weeklyTotal)}</td>
              <td class="amount" data-label="${labels.nonGrocery}">${formatMoney(row.nonGrocery)}</td>
              <td class="amount" data-label="${labels.grocery}">${formatMoney(row.grocery)}</td>
              <td class="amount" data-label="${labels.incidentals}">${formatMoney(row.incidentals)}</td>
              <td data-label="${labels.notes}">${escapeHtml(row.week.notes || "")}</td>
              <td data-label="${labels.edit}"><button class="ghost-btn" type="button" onclick="editWeek('${row.week.id}')">${labels.edit}</button></td>
            </tr>
          `,
        )
        .join("")}
    </tbody>
  `;
}

window.editWeek = (weekId) => {
  currentWeekId = weekId;
  renderEntryForm();
  switchView("entry");
};

function renderEntryForm() {
  const month = currentMonth();
  if (!currentWeekId && month.weeks.length) currentWeekId = month.weeks[0].id;
  const week = currentWeek();

  els.weekSelect.innerHTML = month.weeks
    .map((item) => `<option value="${item.id}">${escapeHtml(item.period || t("unnamedPeriod"))}</option>`)
    .join("");
  if (week) els.weekSelect.value = week.id;

  const periodRange = parsePeriodRange(week?.period || "");
  els.periodStartInput.value = periodRange.start;
  els.periodEndInput.value = periodRange.end;
  els.periodInput.value = formatPeriodFromDates() || week?.period || "";
  els.availableInput.value = valueForInput(week?.availableBalance);
  els.cumulativeInput.value = formatMoney(computeCumulativeFromAvailable(week, currentMonth()));
  els.unpaidInput.value = valueForInput(week?.unpaidPrevious);
  els.notesInput.value = week?.notes || "";

  els.categoryInputs.innerHTML = categories
    .map(
      (category) => `
        <label class="field">
          <span>${escapeHtml(categoryLabel(category))}</span>
          <input data-category="${category.key}" type="number" min="0" step="0.01" value="${valueForInput(
            week?.categoryValues?.[category.key],
          )}" />
        </label>
      `,
    )
    .join("");

  renderLiveWeeklyTotal();
}

function renderLiveWeeklyTotal() {
  const preview = previewWeekFromForm();
  const month = currentMonth();
  const index = month.weeks.findIndex((week) => week.id === currentWeekId);
  const previous = month.weeks[index - 1];
  const previousCumulative = numberOrZero(previous?.cumulativeSpend);
  const cumulative = numberOrNull(preview.cumulativeSpend);
  const weeklyTotal =
    cumulative === null ? 0 : index <= 0 ? cumulative : cumulative - previousCumulative;
  els.cumulativeInput.value = cumulative === null ? "" : formatMoney(cumulative);
  els.weeklyTotalInput.value = formatMoney(weeklyTotal);
}

function previewWeekFromForm() {
  const categoryValues = {};
  els.categoryInputs.querySelectorAll("input[data-category]").forEach((input) => {
    categoryValues[input.dataset.category] = numberOrZero(input.value);
  });
  const period = formatPeriodFromDates() || els.periodInput.value.trim();
  els.periodInput.value = period;

  return createWeek({
    id: currentWeekId,
    period,
    availableBalance: numberOrNull(els.availableInput.value),
    unpaidPrevious: numberOrNull(els.unpaidInput.value),
    cumulativeSpend: computeCumulativeFromAvailable({
      availableBalance: numberOrNull(els.availableInput.value),
      unpaidPrevious: numberOrNull(els.unpaidInput.value),
    }, currentMonth()),
    categoryValues,
    notes: els.notesInput.value.trim(),
  });
}

function saveWeekFromForm() {
  const month = currentMonth();
  const index = month.weeks.findIndex((week) => week.id === currentWeekId);
  const next = previewWeekFromForm();
  if (index >= 0) {
    month.weeks[index] = next;
  } else {
    month.weeks.push(next);
  }
  currentWeekId = next.id;
  renderAll();
  switchView("overview");
}

function supportsModalDialog(dialog) {
  return !!dialog && typeof dialog.showModal === "function" && typeof dialog.close === "function";
}

function openMonthDialog() {
  if (!els.monthDialog) return;
  if (supportsModalDialog(els.monthDialog)) {
    try {
      els.monthDialog.showModal();
      return;
    } catch (error) {
      console.warn("Falling back to non-modal month dialog.", error);
    }
  }

  els.monthDialog.setAttribute("open", "open");
  els.monthDialog.classList.add("dialog-fallback-open");
  document.body.classList.add("dialog-open");
}

function closeMonthDialog() {
  if (!els.monthDialog) return;
  if (supportsModalDialog(els.monthDialog) && els.monthDialog.open) {
    try {
      els.monthDialog.close();
    } catch (error) {
      console.warn("Closing month dialog via fallback.", error);
    }
  }
  els.monthDialog.classList.remove("dialog-fallback-open");
  els.monthDialog.removeAttribute("open");
  document.body.classList.remove("dialog-open");
}

function addMonth() {
  const name = els.newMonthName.value.trim();
  if (!name) return;
  const id = slugify(name);
  if (appState.months[id]) return;
  appState.months[id] = {
    id,
    name,
    creditLimit: CREDIT_LIMIT,
    weeks: [t("firstPeriod"), t("secondPeriod"), t("thirdPeriod"), t("fourthPeriod")].map((period) =>
      createWeek({ period, availableBalance: CREDIT_LIMIT, unpaidPrevious: null }),
    ),
  };
  currentMonthId = id;
  currentWeekId = appState.months[id].weeks[0].id;
  els.newMonthName.value = "";
  closeMonthDialog();
  renderAll();
}

function deleteCurrentMonth() {
  const monthIds = Object.keys(appState.months);
  if (monthIds.length <= 1) {
    alert(t("deleteOnlyMonth"));
    return;
  }

  const month = currentMonth();
  const ok = confirm(t("deleteConfirm", month.name));
  if (!ok) return;

  const currentIndex = monthIds.indexOf(currentMonthId);
  delete appState.months[currentMonthId];
  const remainingIds = Object.keys(appState.months);
  currentMonthId = remainingIds[Math.max(0, Math.min(currentIndex, remainingIds.length - 1))];
  appState.currentMonthId = currentMonthId;
  currentWeekId = currentMonth().weeks[0]?.id;
  renderAll();
}

function renderMonthSettings() {
  const month = currentMonth();
  els.monthNameInput.value = month.name;
  els.creditLimitInput.value = valueForInput(month.creditLimit);
}

function saveMonthSettings() {
  const month = currentMonth();
  const nextName = els.monthNameInput.value.trim();
  const nextLimit = numberOrNull(els.creditLimitInput.value);
  if (nextName) month.name = nextName;
  if (nextLimit !== null && nextLimit > 0) month.creditLimit = nextLimit;
  month.weeks = month.weeks.map((week) => ({
    ...week,
    cumulativeSpend: computeCumulativeFromAvailable(week, month),
  }));
  renderAll();
}

function exportData() {
  const blob = new Blob([JSON.stringify(appState, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `family-budget-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      appState = normalizeState(JSON.parse(String(reader.result)));
      currentMonthId = appState.currentMonthId;
      currentWeekId = currentMonth().weeks[0]?.id;
      renderAll();
    } catch {
      alert(t("importFailed"));
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

async function resetLocalData() {
  try {
    const response = await fetch("/api/reset", { method: "POST", cache: "no-store" });
    if (!response.ok) throw new Error("Reset request failed");
    appState = normalizeState(await response.json());
  } catch {
    appState = normalizeState(structuredClone(DATA_CONFIG.initialState));
  }
  currentMonthId = appState.currentMonthId;
  currentWeekId = currentMonth().weeks[0]?.id;
  renderAll();
}

function prepareCanvas(canvas, fallbackHeight) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, rect.width);
  const height = canvas.clientHeight || fallbackHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return { ctx, width, height };
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

function drawChart() {
  const canvas = els.weeklyChart;
  if (!canvas) return;
  const { ctx, width, height } = prepareCanvas(canvas, 360);
  if (!ctx) return;
  const rows = computedWeeks(currentMonth());
  const maxValue = Math.max(100, ...rows.map((row) => Math.max(row.weeklyTotal, row.nonGrocery + row.grocery + row.incidentals)));
  const top = 28;
  const compact = width < 460;
  const right = compact ? 12 : 20;
  const bottom = 54;
  const left = compact ? 54 : 76;
  const chartWidth = Math.max(1, width - left - right);
  const chartHeight = Math.max(1, height - top - bottom);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#d8e0d8";
  ctx.fillStyle = "#66736b";
  ctx.font = "12px Microsoft JhengHei, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= 4; i += 1) {
    const value = (maxValue / 4) * i;
    const y = top + chartHeight - (value / maxValue) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(width - right, y);
    ctx.stroke();
    ctx.fillText(formatCompactMoney(value), left - 10, y);
  }

  chartBars = [];
  const gap = compact ? 10 : 26;
  const minBarWidth = compact ? 20 : 34;
  const barWidth = Math.max(minBarWidth, (chartWidth - gap * (rows.length + 1)) / Math.max(rows.length, 1));
  const colors = {
    nonGrocery: "#24715d",
    grocery: "#2f5e9e",
    incidentals: "#c36b2d",
  };

  rows.forEach((row, index) => {
    const x = left + gap + index * (barWidth + gap);
    let yBase = top + chartHeight;
    const segments = [
      ["nonGrocery", t("nonGrocery"), row.nonGrocery],
      ["grocery", t("grocery"), Math.max(0, row.grocery)],
      ["incidentals", t("incidentals"), row.incidentals],
    ];

    segments.forEach(([key, label, value]) => {
      const h = (value / maxValue) * chartHeight;
      ctx.fillStyle = colors[key];
      ctx.fillRect(x, yBase - h, barWidth, h);
      drawSegmentLabel(ctx, label, value, x, yBase - h, barWidth, h);
      yBase -= h;
    });

    ctx.fillStyle = "#17201b";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(compact ? `P${index + 1}` : shortPeriod(row.week.period), x + barWidth / 2, top + chartHeight + 10);

    chartBars.push({ x, y: top, width: barWidth, height: chartHeight, row });
  });

  drawLegend(ctx, width, colors);
}

function drawSegmentLabel(ctx, label, value, x, y, width, height) {
  if (value <= 0 || height < 28 || width < 42) return;
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 12px Microsoft JhengHei, sans-serif";
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const text = height >= 48 ? `${label}\n${formatCompactMoney(value)}` : label;
  const lines = width < 72 ? [formatCompactMoney(value)] : text.split("\n");
  if (lines.length === 1) {
    ctx.fillText(lines[0], centerX, centerY);
  } else {
    ctx.fillText(lines[0], centerX, centerY - 8);
    ctx.font = "700 11px Microsoft JhengHei, sans-serif";
    ctx.fillText(lines[1], centerX, centerY + 9);
  }
  ctx.restore();
}

function drawLegend(ctx, width, colors) {
  const items = [
    [t("nonGrocery"), colors.nonGrocery],
    [t("grocery"), colors.grocery],
    [t("incidentals"), colors.incidentals],
  ];
  let x = Math.max(8, width - 250);
  items.forEach(([label, color]) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, 8, 12, 12);
    ctx.fillStyle = "#66736b";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + 18, 14);
    x += 76;
  });
}

function monthlyTrendRows() {
  return Object.values(appState.months).map((month) => {
    const rows = computedWeeks(month);
    const nonGrocery = rows.reduce((sum, row) => sum + numberOrZero(row.nonGrocery), 0);
    const grocery = rows.reduce((sum, row) => sum + Math.max(0, numberOrZero(row.grocery)), 0);
    const incidentals = rows.reduce((sum, row) => sum + numberOrZero(row.incidentals), 0);
    return {
      id: month.id,
      name: month.name,
      nonGrocery: roundCurrency(nonGrocery),
      grocery: roundCurrency(grocery),
      incidentals: roundCurrency(incidentals),
      total: roundCurrency(nonGrocery + grocery + incidentals),
    };
  });
}

function drawMonthlyTrendChart() {
  const canvas = els.monthlyTrendChart;
  if (!canvas) return;
  const { ctx, width, height } = prepareCanvas(canvas, 340);
  if (!ctx) return;
  const rows = monthlyTrendRows();
  const top = 34;
  const compact = width < 460;
  const right = compact ? 12 : 24;
  const bottom = 62;
  const left = compact ? 54 : 76;
  const chartWidth = Math.max(1, width - left - right);
  const chartHeight = Math.max(1, height - top - bottom);
  const colors = {
    nonGrocery: "#24715d",
    grocery: "#2f5e9e",
    incidentals: "#c36b2d",
  };

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  if (rows.length < 2) {
    ctx.fillStyle = "#66736b";
    ctx.font = "700 14px Microsoft JhengHei, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t("needTwoMonths"), width / 2, height / 2);
    trendPoints = [];
    drawTrendLegend(ctx, width, colors);
    return;
  }

  const maxValue = Math.max(
    100,
    ...rows.flatMap((row) => [row.nonGrocery, row.grocery, row.incidentals]),
  );

  ctx.strokeStyle = "#d8e0d8";
  ctx.fillStyle = "#66736b";
  ctx.font = "12px Microsoft JhengHei, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= 4; i += 1) {
    const value = (maxValue / 4) * i;
    const y = top + chartHeight - (value / maxValue) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(width - right, y);
    ctx.stroke();
    ctx.fillText(formatCompactMoney(value), left - 10, y);
  }

  const xForIndex = (index) => left + (chartWidth / Math.max(rows.length - 1, 1)) * index;
  const yForValue = (value) => top + chartHeight - (value / maxValue) * chartHeight;
  trendPoints = rows.map((row, index) => ({
    row,
    x: xForIndex(index),
    nonGroceryY: yForValue(row.nonGrocery),
    groceryY: yForValue(row.grocery),
    incidentalsY: yForValue(row.incidentals),
  }));

  drawTrendLine(ctx, trendPoints, "nonGroceryY", colors.nonGrocery);
  drawTrendLine(ctx, trendPoints, "groceryY", colors.grocery);
  drawTrendLine(ctx, trendPoints, "incidentalsY", colors.incidentals);

  ctx.fillStyle = "#17201b";
  ctx.font = "12px Microsoft JhengHei, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  rows.forEach((row, index) => {
    const x = xForIndex(index);
    ctx.fillText(shortMonthName(row.name), x, top + chartHeight + 12);
  });

  drawTrendLegend(ctx, width, colors);
}

function drawTrendLine(ctx, points, yKey, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point[yKey]);
    else ctx.lineTo(point.x, point[yKey]);
  });
  ctx.stroke();

  points.forEach((point) => {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(point.x, point[yKey], 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  ctx.restore();
}

function drawTrendLegend(ctx, width, colors) {
  const items = [
    [t("nonGrocery"), colors.nonGrocery],
    [t("grocery"), colors.grocery],
    [t("incidentals"), colors.incidentals],
  ];
  let x = Math.max(8, width - 290);
  items.forEach(([label, color]) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, 10, 12, 12);
    ctx.fillStyle = "#66736b";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "12px Microsoft JhengHei, sans-serif";
    ctx.fillText(label, x + 18, 16);
    x += 92;
  });
}

function showTrendTooltip(event) {
  if (!trendPoints.length) {
    els.trendTooltip.classList.add("hidden");
    return;
  }
  const rect = els.monthlyTrendChart.getBoundingClientRect();
  const point = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
  const nearest = trendPoints.reduce((best, item) => {
    const distance = Math.abs(item.x - point.x);
    return !best || distance < best.distance ? { item, distance } : best;
  }, null);
  if (!nearest || nearest.distance > 36) {
    els.trendTooltip.classList.add("hidden");
    return;
  }

  const row = nearest.item.row;
  els.trendTooltip.innerHTML = `
    <strong>${escapeHtml(row.name)}</strong><br />
    ${escapeHtml(t("monthlyTotal"))}：${formatMoney(row.total)}<br />
    ${escapeHtml(t("nonGrocery"))}：${formatMoney(row.nonGrocery)}<br />
    ${escapeHtml(t("grocery"))}：${formatMoney(row.grocery)}<br />
    ${escapeHtml(t("incidentals"))}：${formatMoney(row.incidentals)}
  `;
  els.trendTooltip.style.left = `${Math.min(point.x + 12, els.monthlyTrendChart.clientWidth - 220)}px`;
  els.trendTooltip.style.top = `${Math.max(point.y - 20, 8)}px`;
  els.trendTooltip.classList.remove("hidden");
}

function showChartTooltip(event) {
  const point = chartPoint(event);
  const bar = chartBars.find((item) => point.x >= item.x && point.x <= item.x + item.width);
  if (!bar) {
    els.chartTooltip.classList.add("hidden");
    return;
  }

  els.chartTooltip.innerHTML = `
    <strong>${escapeHtml(bar.row.week.period || "未命名週次")}</strong><br />
    ${escapeHtml(t("weeklyTotal"))}：${formatMoney(bar.row.weeklyTotal)}<br />
    ${escapeHtml(t("nonGrocery"))}：${formatMoney(bar.row.nonGrocery)}<br />
    ${escapeHtml(t("grocery"))}：${formatMoney(bar.row.grocery)}<br />
    ${escapeHtml(t("incidentals"))}：${formatMoney(bar.row.incidentals)}
  `;
  els.chartTooltip.style.left = `${Math.min(point.x + 12, els.weeklyChart.clientWidth - 210)}px`;
  els.chartTooltip.style.top = `${Math.max(point.y - 20, 8)}px`;
  els.chartTooltip.classList.remove("hidden");
}

function selectWeekFromChart(event) {
  const point = chartPoint(event);
  const bar = chartBars.find((item) => point.x >= item.x && point.x <= item.x + item.width);
  if (!bar) return;
  currentWeekId = bar.row.week.id;
  renderEntryForm();
  switchView("entry");
}

function chartPoint(event) {
  const rect = els.weeklyChart.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function renderHistoryFilters() {
  els.historyCategoryFilter.innerHTML = [
    `<option value="all">${escapeHtml(t("allCategories"))}</option>`,
    `<option value="weeklyTotal">${escapeHtml(t("weeklyTotal"))}</option>`,
    `<option value="nonGrocery">${escapeHtml(t("nonGrocery"))}</option>`,
    `<option value="grocery">${escapeHtml(t("grocery"))}</option>`,
    ...categories.map((category) => `<option value="${category.key}">${escapeHtml(categoryLabel(category))}</option>`),
  ].join("");
}

function renderHistory() {
  const monthFilter = els.historyMonthFilter.value || "all";
  const categoryFilter = els.historyCategoryFilter.value || "all";
  const search = (els.historySearchInput.value || "").trim().toLowerCase();
  const minAmount = numberOrZero(els.historyMinInput.value);
  const labels = {
    month: escapeHtml(t("month")),
    period: escapeHtml(t("period")),
    category: escapeHtml(t("category")),
    amount: escapeHtml(t("amount")),
    notes: escapeHtml(t("notes")),
  };

  const rows = [];
  Object.values(appState.months).forEach((month) => {
    if (monthFilter !== "all" && month.id !== monthFilter) return;
    computedWeeks(month).forEach((row) => {
      const values = historyValues(row);
      Object.entries(values).forEach(([key, item]) => {
        if (categoryFilter !== "all" && key !== categoryFilter) return;
        if (Math.abs(item.amount) < minAmount) return;
        const haystack = `${month.name} ${row.week.period} ${item.label} ${row.week.notes}`.toLowerCase();
        if (search && !haystack.includes(search)) return;
        rows.push({ month, row, label: item.label, amount: item.amount });
      });
    });
  });

  els.historyTable.innerHTML = `
    <thead>
      <tr>
        <th>${labels.month}</th>
        <th>${labels.period}</th>
        <th>${labels.category}</th>
        <th class="amount">${labels.amount}</th>
        <th>${labels.notes}</th>
      </tr>
    </thead>
    <tbody>
      ${
        rows.length
          ? rows
              .map(
                (item) => `
                  <tr>
                    <td data-label="${labels.month}">${escapeHtml(item.month.name)}</td>
                    <td data-label="${labels.period}">${escapeHtml(item.row.week.period || "")}</td>
                    <td data-label="${labels.category}">${escapeHtml(item.label)}</td>
                    <td class="amount" data-label="${labels.amount}">${formatMoney(item.amount)}</td>
                    <td data-label="${labels.notes}">${escapeHtml(item.row.week.notes || "")}</td>
                  </tr>
                `,
              )
              .join("")
          : `<tr><td colspan="5">${escapeHtml(t("noRecords"))}</td></tr>`
      }
    </tbody>
  `;
}

function historyValues(row) {
  const values = {
    weeklyTotal: { label: t("weeklyTotal"), amount: row.weeklyTotal },
    nonGrocery: { label: t("nonGrocery"), amount: row.nonGrocery },
    grocery: { label: t("grocery"), amount: row.grocery },
  };
  categories.forEach((category) => {
    values[category.key] = {
      label: categoryLabel(category),
      amount: category.key === "incidentals" ? row.incidentals : numberOrZero(row.week.categoryValues[category.key]),
    };
  });
  return values;
}

function renderCategoryTable() {
  els.categoryTable.innerHTML = `
    <thead>
      <tr>
        <th>分類</th>
        <th>Key</th>
        <th>${escapeHtml(t("category"))}</th>
        <th>${escapeHtml(t("type"))}</th>
        <th>${escapeHtml(t("ruleHint"))}</th>
      </tr>
    </thead>
    <tbody>
      ${categories
        .map(
          (category) => `
            <tr>
              <td>${escapeHtml(category.key)}</td>
              <td>${escapeHtml(categoryLabel(category))}</td>
              <td>${categoryTypePill(category.type)}</td>
              <td>${escapeHtml(category.hint)}</td>
            </tr>
          `,
        )
        .join("")}
      <tr>
        <td>grocery</td>
        <td>${escapeHtml(t("grocery"))}</td>
        <td><span class="pill">${escapeHtml(t("autoCalculated"))}</span></td>
        <td>${escapeHtml(t("weeklyTotal"))} - ${escapeHtml(t("nonGrocery"))} - ${escapeHtml(t("incidentals"))}</td>
      </tr>
    </tbody>
  `;
}

function categoryTypePill(type) {
  if (type === "incidental") return `<span class="pill warn">${escapeHtml(t("incidentalType"))}</span>`;
  return `<span class="pill">${escapeHtml(t("nonGrocery"))}</span>`;
}

function sumNonGrocery(week) {
  return categories
    .filter((category) => category.type === "nonGrocery")
    .reduce((sum, category) => sum + numberOrZero(week.categoryValues?.[category.key]), 0);
}

function computeCumulativeFromAvailable(week, month = currentMonth()) {
  const available = numberOrNull(week?.availableBalance);
  if (available === null) return null;
  const unpaidPrevious = numberOrZero(week?.unpaidPrevious);
  return Math.max(0, roundCurrency(month.creditLimit - available - unpaidPrevious));
}

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function roundCurrency(value) {
  return Math.round((numberOrZero(value) + Number.EPSILON) * 100) / 100;
}

function formatMoney(value) {
  return money.format(roundCurrency(value));
}

function formatCompactMoney(value) {
  if (value >= 1000) return `$${Math.round(value / 100) / 10}k`;
  return `$${Math.round(value)}`;
}

function valueForInput(value) {
  return value === null || value === undefined ? "" : String(value);
}

function shortPeriod(period) {
  if (!period) return "";
  return period.replace(/\s+/g, " ").replace(" - ", "-");
}

function parsePeriodRange(period) {
  const match = String(period || "").match(
    /^\s*(\d{4}-\d{2}-\d{2})(?:\s*(?:-|to|至)\s*(\d{4}-\d{2}-\d{2}))?\s*$/i,
  );
  return {
    start: match?.[1] || "",
    end: match?.[2] || "",
  };
}

function formatPeriodFromDates() {
  const start = els.periodStartInput?.value || "";
  const end = els.periodEndInput?.value || "";
  if (start && end) return `${start} - ${end}`;
  return start || end;
}

function shortMonthName(name) {
  if (!name) return "";
  const cleaned = name.replace(/\s+/g, " ").trim();
  return cleaned.length > 14 ? `${cleaned.slice(0, 13)}…` : cleaned;
}

function slugify(value) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "month"}-${Date.now().toString(36)}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatBuildTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function formatBuildVersion(value) {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  const digestSource = trimmed.includes("@sha256:")
    ? trimmed.slice(trimmed.indexOf("@sha256:") + 1)
    : trimmed;
  if (!digestSource.startsWith("sha256:")) return trimmed;
  const digest = digestSource.slice("sha256:".length);
  return `sha256:${digest.slice(0, 12)}`;
}
