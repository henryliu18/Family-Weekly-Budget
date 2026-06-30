const DATA_CONFIG = window.BUDGET_DATA;
const CREDIT_LIMIT = DATA_CONFIG.creditLimit;
const categories = DATA_CONFIG.categories;
const LANGUAGE_KEY = "family-budget-language";
const DEFAULT_LANGUAGE = "en";
const META_FALLBACK = { buildVersion: "", buildTime: "", authEnabled: false };
const MONTH_NAMES_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DEFAULT_PERIOD_LABELS = ["Period 1", "Period 2", "Period 3", "Period 4"];
const i18n = {
  zh: {
    language: "語言",
    appTitle: "家庭週預算",
    appSubtitle: "Weekly budget tracker",
    titleUserFallback: "使用者",
    personalTitleSuffix: "的家庭週預算",
    periodControls: "期間",
    workspaceControls: "工作區",
    systemControls: "系統",
    month: "月份",
    selectMonth: "選擇月份",
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
    monthlyStatus: "本月狀態",
    statusOnTrack: "狀態良好",
    statusWatch: "需要留意",
    statusOver: "超出節奏",
    statusNoData: "等待資料",
    statusOnTrackCopy: "本月花費與上月可比進度相當或更低。",
    statusWatchCopy: "本月花費高於上月可比進度，建議留意主要支出來源。",
    statusOverCopy: "本月花費明顯高於上月可比進度，需要檢查主要支出來源。",
    statusNoDataCopy: "輸入本週資料後，這裡會顯示本月判斷。",
    spendingPace: (used, average, comparison) => `已用 ${used} · 平均每週 ${average} · ${comparison}`,
    samePeriodLower: (change) => `較上月同期 ${change}`,
    samePeriodHigher: (change) => `較上月同期 +${change}`,
    samePeriodUnavailable: "缺少上月同期資料",
    sameProgressLower: (change) => `較上月同進度 ${change}`,
    sameProgressHigher: (change) => `較上月同進度 +${change}`,
    sameProgressUnavailable: "缺少上月同進度資料",
    lastMonthLower: (change) => `較上月 ${change}`,
    lastMonthHigher: (change) => `較上月 +${change}`,
    lastMonthUnavailable: "缺少上月資料",
    selectedPeriodComparison: "所選週期比較",
    periodComparisonLower: (change) => `-${change} vs 上月同週期`,
    periodComparisonHigher: (change) => `+${change} vs 上月同週期`,
    periodComparisonFlat: "與上月同週期相同",
    periodComparisonUnavailable: "此週期沒有可比較的上月同週期資料。",
    latestPeriodChange: "最新週變化",
    comparedSamePeriod: "與上月同週相比",
    largestDriver: "本週顯著支出",
    topDriversLine: (first, second) => (second ? `本週顯著支出：${first} · ${second}` : `本週顯著支出：${first}`),
    noDriverYet: "本週尚無顯著支出",
    noPeriodDriverYet: "此週期尚無顯著支出",
    topMonthlyDriversLine: (first, second) =>
      second ? `本月顯著支出：${first} · ${second}` : `本月顯著支出：${first}`,
    noMonthlyDriverYet: "本月尚無顯著支出",
    nextAction: "下一步",
    nextActionUpdate: "更新本週資料",
    nextActionReview: (driver) => `檢查${driver}`,
    nextActionWatch: "留意下一週支出",
    openWeeklyEntry: "開啟週輸入",
    onboardingTitle: "歡迎使用",
    onboardingCopy: "歡迎使用。先新增月份並輸入第一週餘額，就能看到本月狀態。",
    emptyChartCopy: "輸入第一週餘額後，這裡會建立圖表。",
    emptyWeeksCopy: "目前還沒有完成的週紀錄。",
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
    updateThisWeek: "更新本週",
    updateThisWeekSub: "先輸入本週基本資料，再確認系統計算出的金額。",
    liveSummary: "即時計算",
    calculatedTotals: "計算結果",
    thisPeriodSpend: "本期支出",
    entryMonthSpend: "本月支出",
    liveSummaryCopy: "輸入可用餘額與上月待繳後，上方卡片會即時更新。",
    availableFormula: "信用卡總額度 - 可用餘額 - 上月待繳",
    periodFormula: "目前本月支出 - 前一期本月支出",
    weekData: "週資料",
    weekDataSub: "輸入累積值後，當週總支出會自動推算",
    editPeriod: "編輯週次",
    availableBalance: "可用餘額",
    cumulativeAfterUnpaid: "本月總支出(扣除上月待繳)",
    unpaidPrevious: "上月待繳(如有)",
    categoryAmounts: "分類金額",
    categoryAmountsSub: "保留完整明細分類；採買支出會依公式自動計算。",
    groceryExplainer: "採買會由本期總支出扣除明細非採買與意外支出後自動計算。",
    transactionImportTitle: "匯入交易草稿",
    transactionImportSub: "貼上銀行或信用卡交易，先審核草稿，再套用到目前週期。",
    currentPeriod: "目前週期",
    pasteTransactions: "貼上交易資料",
    parseTransactions: "解析交易",
    applyConfirmedRows: "套用已確認交易",
    includedRows: "已納入",
    needsReviewRows: "需審核",
    excludedRows: "已排除",
    importSummaryLine: (count, amount) => `${count} 筆 · ${amount}`,
    merchantDescription: "店家 / 說明",
    suggestedCategory: "建議分類",
    confidence: "信心",
    reason: "原因",
    action: "操作",
    includeTransaction: "納入",
    noImportRows: "這個區塊目前沒有交易。",
    importParseEmpty: "請先貼上交易資料。",
    importApplied: (count) => `已套用 ${count} 筆交易到目前草稿。`,
    importBalancesUpdated: "已從貼上內容更新可用餘額與未繳金額。",
    importNeedsPeriod: "請先設定 Period start 和 Period end。",
    importBalanceWarning: (importTotal, periodTotal) =>
      `匯入交易合計為 ${importTotal}，但目前餘額推算的本期支出為 ${periodTotal}。請檢查待入帳交易、退款或日期界線。`,
    importGroceryWarning: (importGrocery, residualGrocery) =>
      `匯入採買合計為 ${importGrocery}，目前公式推算採買為 ${residualGrocery}。採買仍會依既有公式計算。`,
    confidenceHigh: "高",
    confidenceMedium: "中",
    confidenceLow: "低",
    reasonLabels: {
      "outside selected period": "超出目前週期",
      "month not created": "月份尚未建立",
      "no matching existing period": "沒有符合的既有週期",
      "invalid date": "日期無效",
      "positive amount / payment / refund": "正數金額 / 繳款 / 退款",
      "duplicate candidate": "可能重複",
      "unsupported row format": "不支援的列格式",
      "low confidence": "低信心，需要確認",
      "incidentals require confirmation": "意外支出需要確認",
      "user excluded": "使用者排除",
    },
    otherDetails: "突發事件或少見意外支出備註",
    incidentalsDetailsTitle: "意外 / 少見事件備註",
    incidentalsDetailsSub: "只在少見、不可避免、突發事件時填寫。",
    incidentalsRareHint: "少見、不可避免、突發事件，例如緊急維修、突發醫療或事故相關費用。",
    searchEyebrow: "查詢",
    pastRecords: "過去紀錄",
    allMonths: "全部月份",
    allCategories: "全部分類",
    category: "分類",
    keyword: "關鍵字",
    keywordPlaceholder: "週期、備註、分類",
    notesPlaceholder: "例如：緊急維修 $金額\n突發費用 $金額",
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
    firstPeriod: "Period 1",
    secondPeriod: "Period 2",
    thirdPeriod: "Period 3",
    fourthPeriod: "Period 4",
    buildVersion: "Build version",
    editingPeriod: (period) => `正在編輯：${period}`,
    editingExistingPeriod: "正在編輯既有週期；儲存後會覆蓋目前數值。",
    saveSuccess: "已儲存本週資料",
    saveSuccessDetailed: (period, total, grocery) => `已儲存 ${period}：本期總支出 ${total}，採買 ${grocery}。`,
    loginRequired: "需要登入",
    loginTitle: "輸入密碼",
    loginSub: "這份家庭預算受密碼保護；請向家庭預算管理者取得密碼。",
    loginAccountId: "\u5e33\u865f ID\uff08\u9078\u586b\uff09",
    password: "密碼",
    login: "登入",
    logout: "登出",
    cancel: "取消",
    loginFailed: "密碼不正確，請再試一次。",
    workspace: "\u5de5\u4f5c\u5340",
    workspaceSwitching: "\u5207\u63db\u4e2d...",
    workspaceSwitched: "\u5df2\u5207\u63db\u5de5\u4f5c\u5340",
    workspaceSwitchFailed: "\u7121\u6cd5\u5207\u63db\u5de5\u4f5c\u5340\uff0c\u8acb\u518d\u8a66\u4e00\u6b21\u3002",
    createWorkspace: "\u65b0\u589e\u5de5\u4f5c\u5340",
    createWorkspacePrompt: "\u8acb\u8f38\u5165\u65b0\u5de5\u4f5c\u5340\u540d\u7a31",
    createWorkspaceFailed: "\u7121\u6cd5\u65b0\u589e\u5de5\u4f5c\u5340\uff0c\u8acb\u518d\u8a66\u4e00\u6b21\u3002",
    accountAdminTitle: "\u5e33\u865f\u7ba1\u7406",
    accountAdminSub: "\u5efa\u7acb\u64c1\u6709\u7368\u7acb\u7a7a\u767d\u5de5\u4f5c\u5340\u7684\u5bc6\u78bc\u5e33\u865f\u3002",
    accountId: "\u5e33\u865f ID",
    displayName: "\u986f\u793a\u540d\u7a31",
    emailOptional: "Email\uff08\u9078\u586b\uff09",
    workspaceName: "\u5de5\u4f5c\u5340\u540d\u7a31",
    temporaryPassword: "\u81e8\u6642\u5bc6\u78bc",
    createAccount: "\u5efa\u7acb\u5e33\u865f",
    accountCreateSaving: "\u5efa\u7acb\u4e2d...",
    accountCreateSuccess: (account, workspace) => `\u5df2\u5efa\u7acb ${account}\uff0c\u4e26\u958b\u555f\u5de5\u4f5c\u5340 ${workspace}\u3002`,
    accountCreateFailed: "\u7121\u6cd5\u5efa\u7acb\u5e33\u865f\uff0c\u8acb\u6aa2\u67e5\u8f38\u5165\u5167\u5bb9\u5f8c\u518d\u8a66\u4e00\u6b21\u3002",
    accountCreateDuplicate: "\u9019\u500b\u5e33\u865f ID \u5df2\u5b58\u5728\uff0c\u8acb\u6539\u7528\u5176\u4ed6 ID\u3002",
    accountLoginHint: "\u8acb\u5c07\u81e8\u6642\u5bc6\u78bc\u4ee5\u5b89\u5168\u9014\u5f91\u4ea4\u7d66\u4f7f\u7528\u8005\uff1b\u7cfb\u7d71\u4e0d\u6703\u986f\u793a\u6216\u5132\u5b58\u660e\u78bc\u3002",
  },
  en: {
    language: "Language",
    appTitle: "Family Weekly Budget",
    appSubtitle: "Weekly budget tracker",
    titleUserFallback: "User",
    personalTitleSuffix: "’s Family Weekly Budget",
    periodControls: "Period",
    workspaceControls: "Workspace",
    systemControls: "System",
    month: "Month",
    selectMonth: "Select month",
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
    monthlyStatus: "Monthly status",
    statusOnTrack: "On track",
    statusWatch: "Watch",
    statusOver: "Over pace",
    statusNoData: "Waiting for data",
    statusOnTrackCopy: "Monthly spending is in line with or below last month's comparable pace.",
    statusWatchCopy: "Monthly spending is higher than last month's comparable pace. Watch the main drivers.",
    statusOverCopy: "Monthly spending is meaningfully higher than last month's comparable pace.",
    statusNoDataCopy: "Enter this week's figures to see the monthly readout.",
    spendingPace: (used, average, comparison) => `${used} used · avg ${average}/period · ${comparison}`,
    samePeriodLower: (change) => `${change} vs same period last month`,
    samePeriodHigher: (change) => `+${change} vs same period last month`,
    samePeriodUnavailable: "No same-period data last month",
    sameProgressLower: (change) => `${change} vs last month same progress`,
    sameProgressHigher: (change) => `+${change} vs last month same progress`,
    sameProgressUnavailable: "No same-progress data last month",
    lastMonthLower: (change) => `${change} vs last month`,
    lastMonthHigher: (change) => `+${change} vs last month`,
    lastMonthUnavailable: "No last-month data",
    selectedPeriodComparison: "Selected period comparison",
    periodComparisonLower: (change) => `-${change} vs same period last month`,
    periodComparisonHigher: (change) => `+${change} vs same period last month`,
    periodComparisonFlat: "No change vs same period last month",
    periodComparisonUnavailable: "No same-period data last month for this selected period.",
    latestPeriodChange: "Latest period change",
    comparedSamePeriod: "Compared with same period last month",
    largestDriver: "Notable spending this period",
    topDriversLine: (first, second) => (second ? `Notable spending: ${first} · ${second}` : `Notable spending: ${first}`),
    noDriverYet: "No notable spending this period",
    noPeriodDriverYet: "No notable spending this selected period",
    topMonthlyDriversLine: (first, second) =>
      second ? `Notable spending this month: ${first} · ${second}` : `Notable spending this month: ${first}`,
    noMonthlyDriverYet: "No notable spending this month",
    nextAction: "Next action",
    nextActionUpdate: "Update this week",
    nextActionReview: (driver) => `Review ${driver}`,
    nextActionWatch: "Watch the next period",
    openWeeklyEntry: "Open weekly entry",
    onboardingTitle: "Welcome",
    onboardingCopy: "Welcome. Add a month and enter your first weekly balance to see the monthly status.",
    emptyChartCopy: "Enter your first completed weekly balance to build this chart.",
    emptyWeeksCopy: "No completed weekly records yet.",
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
    updateThisWeek: "Update this week",
    updateThisWeekSub: "Enter the weekly basics first, then review the calculated totals.",
    liveSummary: "Live summary",
    calculatedTotals: "Calculated totals",
    thisPeriodSpend: "This period spend",
    entryMonthSpend: "Month spend",
    liveSummaryCopy: "Totals update in the cards above as you enter the available balance and unpaid previous balance.",
    availableFormula: "Credit limit - available balance - unpaid previous balance",
    periodFormula: "Current monthly spend - previous period monthly spend",
    weekData: "Period data",
    weekDataSub: "Period total is calculated from the running monthly total",
    editPeriod: "Edit period",
    availableBalance: "Available balance",
    cumulativeAfterUnpaid: "Monthly spend after unpaid balance",
    unpaidPrevious: "Unpaid previous balance",
    categoryAmounts: "Category amounts",
    categoryAmountsSub: "Keep the full detailed category list; grocery spend is calculated automatically.",
    groceryExplainer: "Grocery is auto-calculated from period total minus detailed non-grocery and incidentals.",
    transactionImportTitle: "Import transactions",
    transactionImportSub: "Paste bank or card rows, review the draft, then apply confirmed rows to this period only.",
    currentPeriod: "Current period",
    pasteTransactions: "Paste transactions",
    parseTransactions: "Parse transactions",
    applyConfirmedRows: "Apply confirmed rows",
    includedRows: "Included",
    needsReviewRows: "Needs review",
    excludedRows: "Excluded",
    importSummaryLine: (count, amount) => `${count} transactions · ${amount}`,
    merchantDescription: "Merchant / description",
    suggestedCategory: "Suggested category",
    confidence: "Confidence",
    reason: "Reason",
    action: "Action",
    includeTransaction: "Include",
    noImportRows: "No transactions in this section.",
    importParseEmpty: "Paste transaction rows first.",
    importApplied: (count) => `Applied ${count} transactions to the current draft.`,
    importBalancesUpdated: "Updated available balance and unpaid amount from pasted text.",
    importNeedsPeriod: "Set Period start and Period end before importing.",
    importBalanceWarning: (importTotal, periodTotal) =>
      `Imported transaction total is ${importTotal}, but the current period spend from balances is ${periodTotal}. Check pending transactions, refunds, or date boundaries before saving.`,
    importGroceryWarning: (importGrocery, residualGrocery) =>
      `Imported grocery total is ${importGrocery}, while the current formula-derived grocery is ${residualGrocery}. Grocery will still use the existing formula.`,
    confidenceHigh: "High",
    confidenceMedium: "Medium",
    confidenceLow: "Low",
    reasonLabels: {
      "outside selected period": "outside selected period",
      "month not created": "month not created",
      "no matching existing period": "no matching existing period",
      "invalid date": "invalid date",
      "positive amount / payment / refund": "positive amount / payment / refund",
      "duplicate candidate": "duplicate candidate",
      "unsupported row format": "unsupported row format",
      "low confidence": "low confidence",
      "incidentals require confirmation": "incidentals require confirmation",
      "user excluded": "user excluded",
    },
    otherDetails: "Rare-event or incidental notes",
    incidentalsDetailsTitle: "Incidentals / rare-event notes",
    incidentalsDetailsSub: "Use only for unusual, unavoidable events.",
    incidentalsRareHint: "Rare, unavoidable events such as emergency repairs, sudden medical costs, or accident-related expenses.",
    searchEyebrow: "Search",
    pastRecords: "Past Records",
    allMonths: "All months",
    allCategories: "All categories",
    category: "Category",
    keyword: "Keyword",
    keywordPlaceholder: "Period, notes, category",
    notesPlaceholder: "e.g. emergency repair $amount\nunexpected fee $amount",
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
    editingPeriod: (period) => `Editing ${period}`,
    editingExistingPeriod: "Editing an existing period. Saving will replace these values.",
    saveSuccess: "Weekly entry saved",
    saveSuccessDetailed: (period, total, grocery) => `Saved ${period}: ${total} period total, ${grocery} grocery.`,
    loginRequired: "Login required",
    loginTitle: "Enter password",
    loginSub: "This family budget is password-protected. Ask the household budget owner for access.",
    loginAccountId: "Account ID (optional)",
    password: "Password",
    login: "Log in",
    logout: "Log out",
    cancel: "Cancel",
    loginFailed: "Incorrect password. Please try again.",
    workspace: "Workspace",
    workspaceSwitching: "Switching...",
    workspaceSwitched: "Workspace switched",
    workspaceSwitchFailed: "Unable to switch workspace. Please try again.",
    createWorkspace: "New workspace",
    createWorkspacePrompt: "Enter a name for the new workspace",
    createWorkspaceFailed: "Unable to create workspace. Please try again.",
    accountAdminTitle: "Account management",
    accountAdminSub: "Create a password account with its own clean workspace.",
    accountId: "Account ID",
    displayName: "Display name",
    emailOptional: "Email (optional)",
    workspaceName: "Workspace name",
    temporaryPassword: "Temporary password",
    createAccount: "Create account",
    accountCreateSaving: "Creating...",
    accountCreateSuccess: (account, workspace) => `Created ${account} with workspace ${workspace}.`,
    accountCreateFailed: "Unable to create account. Check the details and try again.",
    accountCreateDuplicate: "This account ID already exists. Choose another ID.",
    accountLoginHint: "Share the temporary password securely. The app will not show or store plaintext passwords.",
  },
};
let currentLanguage = localStorage.getItem(LANGUAGE_KEY) || DEFAULT_LANGUAGE;
let appMeta = META_FALLBACK;
let authState = { authEnabled: false, authenticated: true };
let accountState = null;

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
let importDraft = createEmptyImportDraft();

var CATEGORY_CHART_COLORS = Object.freeze({
  nonGrocery: "rgba(88, 80, 196, 0.74)",
  grocery: "rgba(15, 118, 168, 0.72)",
  incidentals: "rgba(168, 85, 247, 0.70)",
});

var CATEGORY_CHART_LABEL_COLORS = Object.freeze({
  nonGrocery: "#5850c4",
  grocery: "#0f76a8",
  incidentals: "#a855f7",
});

const IMPORT_STATUSES = {
  INCLUDED: "included",
  REVIEW: "review",
  EXCLUDED: "excluded",
};

const IMPORT_CONFIDENCE = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

const MERCHANT_RULES = [
  ...[
    "COLES",
    "WOOLWORTHS",
    "ALDI",
    "COLONIAL FRUIT",
    "S & S PRODUCE",
    "PACIFIC ASIAN MARKET",
    "SQ *FOODNESS ASIAN",
    "NO.1 CITY MART",
    "KT MART",
    "XIN HUA",
    "SAO SANG GROCERIES",
    "FISH PIER",
    "TUNSTALL FRESH",
    "SQ *DONCASTER",
    "KFL CONVENIENCE",
    "LECROIS BLACKBURN",
    "FRANKS QUALITY FRUIT",
    "HARRIS FARM",
    "COSTCO",
    "IGA",
    "FOODWORKS",
    "SUPABARN",
    "SPUDSHED",
    "FOODLAND",
    "FRIENDLY GROCER",
    "DRAKES",
    "RITCHIES",
    "THOMAS DUX",
    "NATURALLY ORGANIC",
    "NIGHT OWL",
    "PENGUIN",
  ].map((pattern) => ({ pattern, categoryKey: "grocery", confidence: IMPORT_CONFIDENCE.HIGH })),
  ...[
    "KFC",
    "MCDONALD",
    "HUNGRY JACKS",
    "HJS",
    "CAFE",
    "RESTAURANT",
    "CATERING",
    "SUSHI",
    "KEBAB",
    "PHO THIN",
    "SINO KITCHEN",
    "WONGS GOURMET",
    "MOLLY TEA",
    "STARBUCKS",
    "DAN MURPHYS",
    "KMART",
    "TARGET",
    "BUNNINGS",
    "IKEA",
    "TEMU",
    "TAOBAO",
    "PETBARN",
    "DAISO",
    "THE REJECT SHOP",
    "1382_WESTFIELD",
    "CIRCUM WASH",
    "NEW ELEMENT INVESTMENT",
    "SUPER CHEAP",
    "HONG HOT BREAD",
    "MITCHAM BADMINTON",
    "MEZE TABLE",
    "ECCO FOOD GROUP",
    "CORNWELL'S MITRE 10",
    "CENTRE COM",
    "JB HI-FI",
    "HARVEY NORMAN",
    "THE GOOD GUYS",
    "MYER",
    "DAVID JONES",
    "BIG W",
    "SPOTLIGHT",
    "BEST & LESS",
    "JAYCAR",
    "OFFICEWORKS",
    "REBEL SPORT",
    "ANACONDA",
    "BCF",
    "BOWRAL",
    "AUTOBARN",
    "AMART",
    "KITCHENWARE KINGDOM",
    "BED BATH N TABLE",
    "PILLOW TALK",
    "LINCRAFT",
    "LOWES",
    "EBAY",
    "AMAZON AU",
    "NANDOS",
    "DOMINOS",
    "PIZZA HUT",
    "GUZMAN Y GOMEZ",
    "GYG",
    "OPORTO",
    "GRILLD",
    "ZAMBARO",
    "BOOST JUICE",
    "JAMBA JUICE",
    "RED ROOSTER",
    "BAKERS DELIGHT",
    "BRUMBIES",
    "CHATIME",
    "DEGANI",
    "CRAZY CLARK",
    "RED DOT",
    "HOT DOLLAR",
    "DOLLAR KING",
    "GO LO",
    "EATALY",
    "SUBSY",
    "HARRYS CAFE DE WHEELS",
    "GELATO",
    "MADMEX",
    "MARRYBROWN",
    "SIMONS RICE",
    "LA MESA",
    "GYOZA DOBU",
    "SAKA",
    "HOYTS",
    "EVENT CINEMAS",
    "VILLAGE CINEMAS",
    "TICKETEK",
    "TICKETMASTER",
    "PAYPAL",
    "AFTERPAY",
    "ZIP PAY",
    "KLARNA",
    "HUMM",
    "BPAY",
    "SQUARE AU",
  ].map((pattern) => ({ pattern, categoryKey: "shoppingDining", confidence: IMPORT_CONFIDENCE.HIGH })),
  ...["CHEMIST WAREHOUSE", "PHARMACY", "PRICELINE", "AMCAL", "TERRYWHITE CHEMMART", "DENTAL", "MEDICAL", "MEDICAL CENTRE", "MEDICAL PRACTICE", "DR WING", "EDWARD WONG", "SPECSAVERS", "OSCAR WYLEE", "BAILEY NELSON", "PHYSIOTHERAPY", "CHIROPRACTIC", "DENTIST", "SULLIVAN NICOLAIDES", "DOUGLAS HANLY MOIR", "IMED", "CAPITAL RADIOLOGY", "MEDICARE"].map((pattern) => ({
    pattern,
    categoryKey: "medical",
    confidence: IMPORT_CONFIDENCE.HIGH,
  })),
  ...["BUPA", "MEDIBANK", "NIB", "HCF", "HBF", "GMHBA", "AUSTRALIAN UNITY", "DEFENCE HEALTH", "POLICE HEALTH", "TEACHERS HEALTH", "CBHS", "HIF", "WESTFUND", "AHM", "FRANK HEALTH"].map((pattern) => ({
      pattern,
      categoryKey: "privateInsurance",
      confidence: IMPORT_CONFIDENCE.HIGH,
    })),
  ...["AAMI", "BUDGET DIRECT", "NRMA", "RACV", "RACQ", "RAC INSURANCE", "RAA", "SUNCORP", "GIO", "ALLIANZ", "QBE", "COMMINSURE", "YOUI", "COLES INSURANCE", "WOOLWORTHS INSURANCE", "APIA", "VIRGIN MONEY INSURANCE", "REAL INSURANCE", "COVER-MORE", "TIO", "ZURICH", "CHUBB", "RACT", "IAG"].map((pattern) => ({
    pattern,
    categoryKey: "carInsurance",
    confidence: IMPORT_CONFIDENCE.HIGH,
  })),
  ...["HOLLARD", "CBA INSURANCE", "ALLIANZ", "SUNCORP", "CGU", "NRMA", "RACV", "BUDGET DIRECT", "YOU INSURANCE"].map((pattern) => ({
      pattern,
      categoryKey: "homeInsurance",
      confidence: IMPORT_CONFIDENCE.HIGH,
    })),
  ...["LUMO ENERGY", "ORIGIN ENERGY", "ENERGYAUSTRALIA", "RED ENERGY", "ALINTA", "SIMPLY ENERGY", "DODO POWER", "MOMENTUM ENERGY", "POWERSHOP", "SUMO POWER", "COVAU", "AMBER ELECTRIC", "TANGO ENERGY", "DISCOVER ENERGY", "GLOBIRD", "1ST ENERGY"].map((pattern) => ({
    pattern,
    categoryKey: "electricity",
    confidence: IMPORT_CONFIDENCE.HIGH,
  })),
  ...["AGL SALES", "ORIGIN ENERGY", "ENERGYAUSTRALIA"].map((pattern) => ({
    pattern,
    categoryKey: "gas",
    confidence: IMPORT_CONFIDENCE.HIGH,
  })),
  ...["YARRA VALLEY WATER", "SYDNEY WATER", "MELBOURNE WATER", "SOUTH EAST WATER", "SA WATER", "WATER CORPORATION", "ICON WATER", "HUNTER WATER", "GOLD COAST WATER", "URBAN UTILITIES", "BARWON WATER", "CITY WEST WATER", "TASWATER"].map((pattern) => ({
    pattern,
    categoryKey: "water",
    confidence: IMPORT_CONFIDENCE.HIGH,
  })),
  ...["TPG", "MORE TELECOM", "IINET", "TELSTRA", "OPTUS", "VODAFONE", "NETFLIX", "SPOTIFY", "APPLE", "GOOGLE", "MICROSOFT", "OPENAI", "GODADDY", "MATHSPACE", "AUSSIE BROADBAND", "SUPERLOOP", "LAUNTEL", "SPINTEL", "MATE COMMUNICATE", "FELIX MOBILE", "LEBARA", "ALDI MOBILE", "CATCH CONNECT", "KOALA MOBILE", "MOOSE MOBILE", "PENNYTEL", "BELONG", "PRIMUS", "SOUTHERN CROSS TELCO", "EXETEL", "BOOST MOBILE", "MYREPUBLIC", "VIRGIN MOBILE", "STAN", "BINGE", "KAYO", "DISNEY+", "DISNEY PLUS", "PARAMOUNT+", "AMAZON PRIME", "APPLE TV", "YOUTUBE PREMIUM", "XBOX", "PLAYSTATION", "NINTENDO"].map((pattern) => ({
      pattern,
      categoryKey: "internetMobile",
      confidence: IMPORT_CONFIDENCE.HIGH,
    })),
  ...["BP", "EG GROUP", "DGB PETRO", "SHELL", "CALTEX", "AMPOL", "EASTLINK", "MYKI", "PUBLIC TRANSPORT", "POINT PARKING", "DEPARTMENT OF TRANSPOR", "VOLVOCARS", "7-ELEVEN", "UNITED PETROLEUM", "LIBERTY OIL", "FREEDOM FUELS", "GULL", "PUMA ENERGY", "REDDY EXPRESS", "SOLO OIL", "EXXONMOBIL", "GOLDEN FLEECE", "NEPTUNE OIL", "METRO PETROLEUM", "SPEEDWAY", "COLES EXPRESS", "VIVA ENERGY", "UBER", "DIDI", "CHARGE FOX", "CHARGE FOX"].map((pattern) => ({
      pattern,
      categoryKey: "transport",
      confidence: IMPORT_CONFIDENCE.HIGH,
    })),
  ...["SCHOOL FEE", "SCHOOL FEES", "UNIVERSITY", "TAFE", "TUITION", "TUTORING",
    "PSW"].map((pattern) => ({
    pattern,
    categoryKey: "school",
    confidence: IMPORT_CONFIDENCE.HIGH,
  })),
  ...["VICROADS", "MANNINGHAM CITY", "ATO", "AUSTRALIAN TAXATION", "SERVICES AUSTRALIA", "CENTRELINK", "SERVICE NSW", "SERVICE SA", "MAIN ROADS WA", "AUSTRALIA POST", "AUSPOST", "CHILD SUPPORT", "COUNCIL RATES", "REVENUE NSW", "STATE REVENUE", "RTA", "HOME AFFAIRS", "BORDER FORCE", "FAIR WORK"].map((pattern) => ({
      pattern,
      categoryKey: "government",
      confidence: IMPORT_CONFIDENCE.HIGH,
    })),
  ...["KOENIGMACHINERY", "SNAZZI ALTERATIONS", "YARRA BOTANICA", "PET STOCK", "PETCIRCLE", "ANIMATE", "RSPCA", "VET", "VETERINARY", "ANIMAL HOSPITAL", "ANIMAL MEDICAL"].map((pattern) => ({
      pattern,
      categoryKey: "incidentals",
      confidence: IMPORT_CONFIDENCE.LOW,
      requiresReview: true,
    })),
];

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
  await loadAccountState();
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

async function loadAccountState() {
  if (authState.authEnabled && !authState.authenticated) {
    accountState = null;
    return;
  }
  try {
    const response = await fetch("/api/me", { cache: "no-store" });
    if (response.status === 401) {
      accountState = null;
      authState = { ...authState, authenticated: false };
      updateAuthUi();
      return;
    }
    if (!response.ok) throw new Error("Account request failed");
    accountState = await response.json();
  } catch {
    accountState = null;
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
    ensureMonthMetadata(month);
    month.creditLimit = numberOrZero(month.creditLimit) || CREDIT_LIMIT;
    month.weeks = Array.isArray(month.weeks)
      ? month.weeks.map((week, index) => createWeek({ ...week, period: normalizePeriodLabel(week.period, index) }))
      : [];
    if (month.weeks.length === 0) {
      month.weeks = DEFAULT_PERIOD_LABELS.map((period) =>
        createWeek({ period, availableBalance: month.creditLimit }),
      );
    }
  });
  if (!next.currentMonthId || !next.months[next.currentMonthId]) {
    next.currentMonthId = Object.values(next.months).sort(compareMonths)[0]?.id;
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
    "overviewStatusTitle",
    "overviewStatusCopy",
    "overviewStatusPill",
    "overviewStatusDot",
    "statusMetricsLine",
    "overviewDriverLine",
    "nextActionValue",
    "overviewActionBtn",
    "overviewOnboarding",
    "emptyAddMonthBtn",
    "emptyOpenEntryBtn",
    "weeklyChart",
    "weeklyChartEmpty",
    "chartTooltip",
    "monthlyTrendChart",
    "monthlyTrendEmpty",
    "trendTooltip",
    "weeksTable",
    "weeksTableEmpty",
    "weekSelect",
    "entryEditBanner",
    "entryMonthKpi",
    "entryPeriodSpendKpi",
    "entryMonthSpendKpi",
    "entryPeriodComparison",
    "entryPeriodComparisonTitle",
    "entryPeriodComparisonCopy",
    "entryPeriodDrivers",
    "entryPeriodComparisonPill",
    "periodInput",
    "periodStartInput",
    "periodEndInput",
    "availableInput",
    "cumulativeInput",
    "unpaidInput",
    "weeklyTotalInput",
    "importPeriodLabel",
    "transactionImportInput",
    "parseImportBtn",
    "applyImportBtn",
    "importStatus",
    "importSummary",
    "importWarning",
    "importReview",
    "importRows",
    "categoryInputs",
    "notesInput",
    "saveWeekBtn",
    "saveStatus",
    "saveToast",
    "incidentalsDetails",
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
    "newMonthPicker",
    "cancelMonthBtn",
    "confirmMonthBtn",
    "brandHome",
    "userIdentityLabel",
    "personalTitleSuffix",
    "buildVersionValue",
    "authOverlay",
    "loginForm",
    "loginAccountIdInput",
    "passwordInput",
    "loginError",
    "loginBtn",
    "enterWorkspaceBtn",
    "logoutBtn",
    "workspaceSwitcher",
    "workspaceSelect",
    "workspaceSwitchStatus",
    "createWorkspaceBtn",
    "accountAdminPanel",
    "accountAdminForm",
    "newAccountIdInput",
    "newAccountDisplayNameInput",
    "newAccountEmailInput",
    "newAccountWorkspaceInput",
    "newAccountPasswordInput",
    "createAccountBtn",
    "accountAdminStatus",
    "accountAdminResult",
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

  els.workspaceSelect?.addEventListener("change", switchWorkspace);
  els.createWorkspaceBtn?.addEventListener("click", createWorkspace);

  els.monthSelect.addEventListener("change", () => {
    currentMonthId = els.monthSelect.value;
    currentWeekId = currentMonth().weeks[0]?.id;
    importDraft = createEmptyImportDraft();
    saveState();
    renderAll();
  });

  els.addMonthBtn.addEventListener("click", openMonthDialog);
  els.deleteMonthBtn.addEventListener("click", deleteCurrentMonth);
  els.overviewActionBtn?.addEventListener("click", () => switchView("entry"));
  els.emptyAddMonthBtn?.addEventListener("click", openMonthDialog);
  els.emptyOpenEntryBtn?.addEventListener("click", () => switchView("entry"));
  els.confirmMonthBtn.addEventListener("click", addMonth);
  els.cancelMonthBtn?.addEventListener("click", closeMonthDialog);
  els.monthDialog?.addEventListener("click", (event) => {
    if (event.target === els.monthDialog) closeMonthDialog();
  });
  els.brandHome?.addEventListener("click", () => switchView("overview"));

  els.weekSelect.addEventListener("change", () => {
    currentWeekId = els.weekSelect.value;
    importDraft = createEmptyImportDraft();
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
  els.parseImportBtn?.addEventListener("click", parseTransactionImport);
  els.applyImportBtn?.addEventListener("click", applyTransactionImport);
  document.querySelectorAll(".import-tab").forEach((button) => {
    button.addEventListener("click", () => {
      importDraft.activeTab = button.dataset.importTab;
      renderImportDraft();
    });
  });
  els.importRows?.addEventListener("click", handleImportRowAction);
  els.importRows?.addEventListener("change", handleImportCategoryChange);

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
  els.accountAdminForm?.addEventListener("submit", createAccountFromForm);

  els.weeklyChart.addEventListener("mousemove", showChartTooltip);
  els.weeklyChart.addEventListener("mouseleave", () => els.chartTooltip.classList.add("hidden"));
  els.weeklyChart.addEventListener("click", selectWeekFromChart);
  els.monthlyTrendChart.addEventListener("mousemove", showTrendTooltip);
  els.monthlyTrendChart.addEventListener("mouseleave", () => els.trendTooltip.classList.add("hidden"));
  els.monthlyTrendChart.addEventListener("click", selectMonthFromTrend);
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
  // Clear import textarea when leaving entry view
  if (view !== "entry" && els.transactionImportInput) {
    els.transactionImportInput.value = "";
  }
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

function validMonthSortKey(value) {
  return /^\d{4}-\d{2}$/.test(String(value || ""));
}

function formatMonthSortKey(year, month) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return "";
  return `${year}-${String(month).padStart(2, "0")}`;
}

function monthTokenToNumber(token) {
  const text = String(token || "").trim();
  if (!text) return 0;
  if (/^\d{1,2}$/.test(text)) {
    const value = Number(text);
    return value >= 1 && value <= 12 ? value : 0;
  }
  const short = text.slice(0, 3).toLowerCase();
  return {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  }[short] || 0;
}

function formatMonthDisplay(sortKey) {
  if (!validMonthSortKey(sortKey)) return "";
  const [yearText, monthText] = sortKey.split("-");
  return `${yearText} ${MONTH_NAMES_EN[Number(monthText) - 1]}`;
}

function isLegacyGeneratedMonthName(value) {
  const text = String(value || "").trim();
  return (
    /^\d{4}\s+\d{1,2}(?:-\d{1,2})?$/.test(text) ||
    /^\d{4}\s+[A-Za-z]+(?:-[A-Za-z]+)?$/.test(text)
  );
}

function inferMonthSortKey(month) {
  if (validMonthSortKey(month?.sortKey)) return month.sortKey;
  if (validMonthSortKey(month?.displayName)) return month.displayName;

  const label = String(month?.displayName || month?.name || "").trim();
  let match = label.match(/^(\d{4})\s+([A-Za-z]+)(?:\s*-\s*([A-Za-z]+))?$/);
  if (match) {
    const year = Number(match[1]);
    const monthNumber = monthTokenToNumber(match[3] || match[2]);
    return formatMonthSortKey(year, monthNumber);
  }
  match = label.match(/^(\d{4})\s+(\d{1,2})(?:-(\d{1,2}))?$/);
  if (match) {
    const year = Number(match[1]);
    const monthNumber = Number(match[3] || match[2]);
    return formatMonthSortKey(year, monthNumber);
  }

  const idText = String(month?.id || "");
  match = idText.match(/^(\d{4})-(\d{2})$/);
  if (match) return formatMonthSortKey(Number(match[1]), Number(match[2]));
  match = idText.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:-|$)/);
  if (match) return formatMonthSortKey(Number(match[1]), Number(match[3]));

  const ranges = monthDateRanges(month);
  const latestRange = ranges[ranges.length - 1];
  if (latestRange?.end) return latestRange.end.slice(0, 7);

  const today = new Date();
  return formatMonthSortKey(today.getFullYear(), today.getMonth() + 1);
}

function ensureMonthMetadata(month) {
  month.sortKey = inferMonthSortKey(month);
  month.displayName = month.displayName?.trim() || formatMonthDisplay(month.sortKey);
  if (!month.name || isLegacyGeneratedMonthName(month.name)) {
    month.name = month.displayName;
  }
}

function monthDisplayName(month) {
  return month?.displayName?.trim() || month?.name?.trim() || formatMonthDisplay(inferMonthSortKey(month)) || "";
}

function compareMonths(a, b) {
  const aKey = inferMonthSortKey(a);
  const bKey = inferMonthSortKey(b);
  if (aKey !== bKey) return aKey.localeCompare(bKey);
  return monthDisplayName(a).localeCompare(monthDisplayName(b));
}

function orderedMonths() {
  return Object.values(appState.months).sort(compareMonths);
}

function monthIdForSortKey(sortKey) {
  return orderedMonths().find((month) => inferMonthSortKey(month) === sortKey)?.id || "";
}

function normalizePeriodLabel(period, index) {
  const text = String(period || "").trim();
  if (!text) return DEFAULT_PERIOD_LABELS[index] || "";
  if (/^(week|period)\s*\d+$/i.test(text) || /^第[一二三四1234]週$/.test(text)) {
    return DEFAULT_PERIOD_LABELS[index] || text;
  }
  return text;
}

function defaultPeriodRangeForMonth(month, weekIndex, totalWeeks) {
  const sortKey = inferMonthSortKey(month);
  if (!validMonthSortKey(sortKey)) return { start: "", end: "" };
  const [yearText, monthText] = sortKey.split("-");
  const year = Number(yearText);
  const monthNumber = Number(monthText);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  const startDay = Math.min(lastDay, weekIndex * 7 + 1);
  const endDay = weekIndex >= totalWeeks - 1 ? lastDay : Math.min(lastDay, startDay + 6);
  return {
    start: toIsoDate(year, monthNumber, startDay),
    end: toIsoDate(year, monthNumber, endDay),
  };
}

function editingRangeForWeek(month, week, weekIndex) {
  const parsed = parseFlexiblePeriodRange(week?.period || "", monthDisplayName(month));
  if (parsed.start || parsed.end) return parsed;
  return defaultPeriodRangeForMonth(month, weekIndex, month.weeks.length);
}

function renderAll() {
  applyLanguage();
  updateBuildVersion();
  if (isAuthLocked()) {
    clearSensitiveUi();
    return;
  }
  renderWorkspaceSwitcher();
  renderAccountAdminPanel();
  renderPersonalTitle();
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
    'label.field span:not([data-i18n])': null,
    "#addMonthBtn": "addMonth",
    "#deleteMonthBtn": "deleteMonth",
    '[data-view="overview"]': "overview",
    '[data-view="entry"]': "entry",
    '[data-view="history"]': "history",
    '[data-view="settings"]': "settings",
    "#saveWeekBtn": "saveWeek",
    "#overviewActionBtn": "openWeeklyEntry",
    "#parseImportBtn": "parseTransactions",
    "#applyImportBtn": "applyConfirmedRows",
    "#saveMonthSettingsBtn": "saveSettings",
    "#exportDataBtn": "exportJson",
    "#resetLocalDataBtn": "resetDefault",
    "#confirmMonthBtn": "addMonth",
    "#cancelMonthBtn": "cancel",
    "#loginBtn": "login",
    "#logoutBtn": "logout",
    "#createWorkspaceBtn": "createWorkspace",
    "#createAccountBtn": "createAccount",
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
    newMonthPicker: "selectMonth",
    loginAccountIdInput: "loginAccountId",
    newAccountIdInput: "accountId",
    newAccountDisplayNameInput: "displayName",
    newAccountEmailInput: "emailOptional",
    newAccountWorkspaceInput: "workspaceName",
    newAccountPasswordInput: "temporaryPassword",
  };
  Object.entries(spans).forEach(([id, key]) => {
    const label = document.getElementById(id)?.closest("label")?.querySelector("span");
    if (label) label.textContent = t(key);
  });

  els.historySearchInput.placeholder = t("keywordPlaceholder");
  els.notesInput.placeholder = t("notesPlaceholder");
  if (els.transactionImportInput) {
    els.transactionImportInput.placeholder = '20/06/2026,"-36.35","COLES 7735 DONCASTER VIC",""';
  }
  if (els.loginError?.dataset.key) {
    els.loginError.textContent = t(els.loginError.dataset.key);
  }
  renderWorkspaceSwitcher();
  renderAccountAdminPanel();
  renderPersonalTitle();
  renderImportDraft();
}

function renderPersonalTitle() {
  if (!els.userIdentityLabel || !els.personalTitleSuffix) return;
  const displayName =
    accountState?.account?.displayName ||
    accountState?.user?.displayName ||
    accountState?.account?.id ||
    t("titleUserFallback");
  els.userIdentityLabel.textContent = displayName;
  els.personalTitleSuffix.textContent = t("personalTitleSuffix");
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
  renderWorkspaceSwitcher();
  renderAccountAdminPanel();
  renderPersonalTitle();
  document.body.classList.toggle("landing-open", shouldShowOverlay);
  document.body.classList.toggle("auth-locked", isAuthLocked());
  const authCopy = els.authOverlay?.querySelector(".auth-copy");
  if (authCopy) authCopy.textContent = t("loginSub");
  if (shouldShowOverlay) {
    clearSensitiveUi();
    if (isAuthLocked()) {
      setTimeout(() => els.passwordInput?.focus(), 0);
    }
  } else {
    clearLoginError();
  }
}

async function handleLogin(event) {
  event.preventDefault();
  clearLoginError();
  const password = els.passwordInput.value;
  const accountId = els.loginAccountIdInput?.value.trim();
  const payload = accountId ? { accountId, password } : { password };
  try {
    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      showLoginError("loginFailed");
      return;
    }
    authState = { authEnabled: true, authenticated: true };
    els.passwordInput.value = "";
    if (els.loginAccountIdInput) els.loginAccountIdInput.value = "";
    updateAuthUi();
    await loadAccountState();
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
  accountState = null;
  updateAuthUi();
}

function renderWorkspaceSwitcher() {
  if (!els.workspaceSwitcher || !els.workspaceSelect) return;
  const workspaces = Array.isArray(accountState?.workspaces) ? accountState.workspaces : [];
  const currentWorkspaceId = accountState?.currentWorkspace?.id || "";
  const shouldShow = !isAuthLocked() && workspaces.length > 0;
  els.workspaceSwitcher.classList.toggle("hidden", !shouldShow);
  els.createWorkspaceBtn?.classList.toggle("hidden", !shouldShow);
  if (!shouldShow) {
    els.workspaceSelect.innerHTML = "";
    if (els.workspaceSwitchStatus) els.workspaceSwitchStatus.textContent = "";
    return;
  }

  const selectedValue = els.workspaceSelect.value;
  els.workspaceSelect.innerHTML = "";
  workspaces.forEach((workspace) => {
    const option = document.createElement("option");
    option.value = workspace.id;
    option.textContent = workspace.name || workspace.id;
    option.dataset.workspaceId = workspace.id;
    els.workspaceSelect.append(option);
  });
  els.workspaceSelect.value =
    workspaces.some((workspace) => workspace.id === currentWorkspaceId)
      ? currentWorkspaceId
      : selectedValue;
  els.workspaceSelect.disabled = workspaces.length < 2;
}

function renderAccountAdminPanel() {
  if (!els.accountAdminPanel) return;
  const shouldShow = !isAuthLocked() && accountState?.account?.isDefaultUser === true;
  els.accountAdminPanel.classList.toggle("hidden", !shouldShow);
  if (!shouldShow) {
    clearAccountAdminStatus();
    clearAccountAdminResult();
  }
}

async function createAccountFromForm(event) {
  event.preventDefault();
  if (!els.accountAdminForm) return;
  clearAccountAdminStatus();
  clearAccountAdminResult();
  const payload = {
    accountId: els.newAccountIdInput.value.trim(),
    displayName: els.newAccountDisplayNameInput.value.trim(),
    email: els.newAccountEmailInput.value.trim(),
    password: els.newAccountPasswordInput.value,
    workspaceName: els.newAccountWorkspaceInput.value.trim(),
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === "") delete payload[key];
  });

  setAccountAdminStatus("accountCreateSaving");
  if (els.createAccountBtn) els.createAccountBtn.disabled = true;
  try {
    const response = await fetch("/api/admin/accounts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setAccountAdminStatus(response.status === 409 ? "accountCreateDuplicate" : "accountCreateFailed", true);
      return;
    }

    els.newAccountPasswordInput.value = "";
    setAccountAdminStatus(
      "accountCreateSuccess",
      false,
      result.account?.displayName || result.account?.id || payload.displayName,
      result.workspace?.name || result.workspace?.id || payload.workspaceName,
    );
    renderAccountAdminResult(result);
  } catch {
    setAccountAdminStatus("accountCreateFailed", true);
  } finally {
    if (els.createAccountBtn) els.createAccountBtn.disabled = false;
  }
}

function renderAccountAdminResult(result) {
  if (!els.accountAdminResult) return;
  const account = result.account || {};
  const workspace = result.workspace || {};
  els.accountAdminResult.innerHTML = `
    <strong>${escapeHtml(account.displayName || account.id || "-")}</strong>
    <dl>
      <div><dt>${escapeHtml(t("accountId"))}</dt><dd>${escapeHtml(account.id || "-")}</dd></div>
      <div><dt>${escapeHtml(t("emailOptional"))}</dt><dd>${escapeHtml(account.email || "-")}</dd></div>
      <div><dt>${escapeHtml(t("workspaceName"))}</dt><dd>${escapeHtml(workspace.name || workspace.id || "-")}</dd></div>
    </dl>
    <p>${escapeHtml(t("accountLoginHint"))}</p>
  `;
  els.accountAdminResult.classList.remove("hidden");
}

function setAccountAdminStatus(key, isError = false, ...args) {
  if (!els.accountAdminStatus) return;
  els.accountAdminStatus.dataset.key = key;
  els.accountAdminStatus.dataset.status = isError ? "error" : "ok";
  els.accountAdminStatus.textContent = t(key, ...args);
  els.accountAdminStatus.classList.remove("hidden");
}

function clearAccountAdminStatus() {
  if (!els.accountAdminStatus) return;
  delete els.accountAdminStatus.dataset.key;
  delete els.accountAdminStatus.dataset.status;
  els.accountAdminStatus.textContent = "";
  els.accountAdminStatus.classList.add("hidden");
}

function clearAccountAdminResult() {
  if (!els.accountAdminResult) return;
  els.accountAdminResult.innerHTML = "";
  els.accountAdminResult.classList.add("hidden");
}

async function createWorkspace() {
  const name = window.prompt(t("createWorkspacePrompt"));
  if (!name || !name.trim()) return;
  if (els.workspaceSwitchStatus) els.workspaceSwitchStatus.textContent = t("workspaceSwitching");
  if (els.createWorkspaceBtn) els.createWorkspaceBtn.disabled = true;
  try {
    const response = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error("Workspace create failed");
    const result = await response.json();
    const workspaceId = result.workspace?.id;
    await loadAccountState();
    renderWorkspaceSwitcher();
    if (workspaceId) {
      els.workspaceSelect.value = workspaceId;
      await switchWorkspace();
    } else {
      renderAll();
    }
  } catch {
    if (els.workspaceSwitchStatus) els.workspaceSwitchStatus.textContent = t("createWorkspaceFailed");
  } finally {
    if (els.createWorkspaceBtn) els.createWorkspaceBtn.disabled = false;
  }
}

async function switchWorkspace() {
  const workspaceId = els.workspaceSelect?.value;
  if (!workspaceId || workspaceId === accountState?.currentWorkspace?.id) return;
  const previousWorkspaceId = accountState?.currentWorkspace?.id || "";
  if (els.workspaceSwitchStatus) els.workspaceSwitchStatus.textContent = t("workspaceSwitching");
  els.workspaceSelect.disabled = true;
  try {
    const response = await fetch("/api/session/workspace", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    });
    if (!response.ok) throw new Error("Workspace switch failed");
    await loadAccountState();
    await loadState();
    importDraft = createEmptyImportDraft();
    renderAll();
    if (els.workspaceSwitchStatus) els.workspaceSwitchStatus.textContent = t("workspaceSwitched");
  } catch {
    els.workspaceSelect.value = previousWorkspaceId;
    if (els.workspaceSwitchStatus) els.workspaceSwitchStatus.textContent = t("workspaceSwitchFailed");
    renderWorkspaceSwitcher();
  }
}

function clearSensitiveUi() {
  [
    els.limitKpi,
    els.monthSpendKpi,
    els.availableKpi,
    els.weekSpendKpi,
    els.overviewStatusTitle,
    els.overviewStatusCopy,
    els.overviewStatusPill,
    els.statusMetricsLine,
    els.overviewDriverLine,
    els.nextActionValue,
    els.entryMonthKpi,
    els.entryPeriodSpendKpi,
    els.entryMonthSpendKpi,
    els.entryPeriodComparisonTitle,
    els.entryPeriodComparisonCopy,
    els.entryPeriodDrivers,
    els.entryPeriodComparisonPill,
    els.overviewTitle,
  ].forEach((element) => {
    if (element) element.textContent = "-";
  });
  if (els.entryPeriodComparison) {
    els.entryPeriodComparison.className = "entry-period-comparison status-empty";
  }
  if (els.entryPeriodComparisonPill) {
    els.entryPeriodComparisonPill.className = "status-pill status-empty";
  }

  [
    els.monthSelect,
    els.weeksTable,
    els.weekSelect,
    els.historyMonthFilter,
    els.historyCategoryFilter,
    els.historyTable,
    els.categoryTable,
    els.categoryInputs,
    els.importSummary,
    els.importRows,
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
    els.transactionImportInput,
    els.notesInput,
    els.historySearchInput,
    els.historyMinInput,
    els.monthNameInput,
    els.creditLimitInput,
    els.newMonthPicker,
  ].forEach((element) => {
    if (element) element.value = "";
  });

  [
    els.chartTooltip,
    els.trendTooltip,
    els.overviewOnboarding,
    els.weeklyChartEmpty,
    els.monthlyTrendEmpty,
    els.weeksTableEmpty,
    els.importStatus,
    els.importWarning,
    els.importReview,
  ].forEach((element) => element?.classList.add("hidden"));
  if (els.applyImportBtn) els.applyImportBtn.disabled = true;
  if (els.importPeriodLabel) els.importPeriodLabel.textContent = "-";
  importDraft = createEmptyImportDraft();
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
  const months = orderedMonths();
  const selectedHistoryMonth = els.historyMonthFilter.value || "all";
  els.monthSelect.innerHTML = months
    .map((month) => `<option value="${month.id}">${escapeHtml(monthDisplayName(month))}</option>`)
    .join("");
  els.monthSelect.value = currentMonthId;

  els.historyMonthFilter.innerHTML = [
    `<option value="all">${escapeHtml(t("allMonths"))}</option>`,
    ...months.map((month) => `<option value="${month.id}">${escapeHtml(monthDisplayName(month))}</option>`),
  ].join("");
  els.historyMonthFilter.value = appState.months[selectedHistoryMonth] ? selectedHistoryMonth : "all";
}

function renderOverview() {
  const month = currentMonth();
  const rows = computedWeeks(month);
  const completedRows = rows.filter((row) => row.week.cumulativeSpend !== null);
  const hasCompletedWeeks = completedRows.length > 0;
  const latest = completedRows[completedRows.length - 1] || rows[0];

  els.overviewTitle.textContent = monthDisplayName(month);
  els.limitKpi.textContent = formatMoney(month.creditLimit);
  els.monthSpendKpi.textContent = formatMoney(latest?.cumulativeSpend || 0);
  els.availableKpi.textContent = formatMoney(latest?.week.availableBalance || month.creditLimit);
  els.weekSpendKpi.textContent = formatMoney(latest?.weeklyTotal || 0);

  renderOverviewDecision(month, rows);
  renderWeeksTable(rows);
  renderOverviewEmptyState(hasCompletedWeeks);

  if (hasCompletedWeeks) {
    requestAnimationFrame(() => {
      drawChart();
      drawMonthlyTrendChart();
    });
  } else {
    clearCanvas(els.weeklyChart);
    clearCanvas(els.monthlyTrendChart);
    els.chartTooltip?.classList.add("hidden");
    els.trendTooltip?.classList.add("hidden");
  }
}

function renderOverviewEmptyState(hasCompletedWeeks) {
  els.overviewOnboarding?.classList.toggle("hidden", hasCompletedWeeks);
  els.weeklyChart?.classList.toggle("hidden", !hasCompletedWeeks);
  els.monthlyTrendChart?.classList.toggle("hidden", !hasCompletedWeeks);
  els.weeklyChartEmpty?.classList.toggle("hidden", hasCompletedWeeks);
  els.monthlyTrendEmpty?.classList.toggle("hidden", hasCompletedWeeks);
  els.weeksTableEmpty?.classList.toggle("hidden", hasCompletedWeeks);
  els.weeksTable?.closest(".table-scroll")?.classList.toggle("hidden", !hasCompletedWeeks);
}

function renderOverviewDecision(month, rows) {
  const completedRows = rows.filter((row) => row.week.cumulativeSpend !== null);
  const latest = completedRows[completedRows.length - 1];
  const limit = numberOrZero(month.creditLimit || CREDIT_LIMIT);

  if (!latest) {
    setOverviewStatus("empty", t("statusNoData"), t("statusNoDataCopy"));
    setText(els.statusMetricsLine, t("spendingPace", formatPercent(0), formatMoney(0), t("sameProgressUnavailable")));
    setText(els.overviewDriverLine, t("noMonthlyDriverYet"));
    setText(els.nextActionValue, t("nextActionUpdate"));
    return;
  }

  const latestIndex = rows.findIndex((row) => row.week.id === latest.week.id);
  const elapsedShare = Math.min(1, Math.max((latestIndex + 1) / Math.max(rows.length, 1), 0));
  const cumulative = numberOrZero(latest.cumulativeSpend);
  const usedShare = limit > 0 ? cumulative / limit : 0;
  const projected = elapsedShare > 0 ? cumulative / elapsedShare : cumulative;
  const paceRatio = elapsedShare > 0 && limit > 0 ? usedShare / elapsedShare : 0;
  const monthComplete = latestIndex >= rows.length - 1;
  const comparison = monthProgressComparison(month, rows, latestIndex, latest);
  const drivers = topMonthlySpendingDrivers(completedRows, 2);
  const mainDriver = drivers[0];

  if (comparison?.ratio > 0.15 || (!comparison && projected > limit)) {
    setOverviewStatus("over", t("statusOver"), t("statusOverCopy"));
  } else if (comparison?.ratio > 0 || (!comparison && (paceRatio >= 0.9 || usedShare >= 0.85))) {
    setOverviewStatus("watch", t("statusWatch"), t("statusWatchCopy"));
  } else {
    setOverviewStatus("good", t("statusOnTrack"), t("statusOnTrackCopy"));
  }

  const averagePerPeriod = cumulative / Math.max(latestIndex + 1, 1);
  setText(
    els.statusMetricsLine,
    t("spendingPace", formatPercent(usedShare), formatMoney(averagePerPeriod), monthComparisonLabel(comparison, monthComplete)),
  );

  setText(els.overviewDriverLine, drivers.length ? topMonthlyDriversLine(drivers) : t("noMonthlyDriverYet"));

  const action =
    mainDriver && (comparison?.ratio > 0 || paceRatio >= 0.9) ? t("nextActionReview", mainDriver.label) : t("nextActionUpdate");
  setText(els.nextActionValue, action);
}

function setOverviewStatus(kind, title, copy) {
  const month = currentMonth();
  if (month) month._barStatusKind = kind;
  setText(els.overviewStatusTitle, title);
  setText(els.overviewStatusCopy, copy);
  if (!els.overviewStatusPill) return;
  els.overviewStatusPill.textContent = title;
  els.overviewStatusPill.className = `status-pill status-${kind}`;
  if (els.overviewStatusDot) {
    els.overviewStatusDot.className = `status-dot status-${kind}`;
  }
}

function previousMonthFor(month) {
  const months = orderedMonths();
  const currentIndex = months.findIndex((item) => item.id === month.id);
  return currentIndex > 0 ? months[currentIndex - 1] : null;
}

function monthProgressComparison(month, rows, latestIndex, latest) {
  const previousMonth = previousMonthFor(month);
  if (!previousMonth) return null;
  const previousRows = computedWeeks(previousMonth);
  const monthComplete = latestIndex >= rows.length - 1;
  const previousRow = monthComplete ? previousRows[previousRows.length - 1] : previousRows[latestIndex];
  if (!previousRow || previousRow.week.cumulativeSpend === null) return null;

  const currentAmount = numberOrZero(latest.cumulativeSpend);
  const previousAmount = numberOrZero(previousRow.cumulativeSpend);
  if (previousAmount <= 0) return null;
  const change = currentAmount - previousAmount;
  return {
    amount: roundCurrency(change),
    ratio: change / previousAmount,
    scope: monthComplete ? "full" : "sameProgress",
  };
}

function monthComparisonLabel(comparison, monthComplete) {
  if (!comparison) return monthComplete ? t("lastMonthUnavailable") : t("sameProgressUnavailable");
  const value = formatPercent(Math.abs(comparison.ratio));
  const displayValue = comparison.amount < 0 ? `-${value}` : value;
  if (comparison.scope === "full") {
    return comparison.amount > 0 ? t("lastMonthHigher", value) : t("lastMonthLower", displayValue);
  }
  return comparison.amount > 0 ? t("sameProgressHigher", value) : t("sameProgressLower", displayValue);
}

function samePeriodComparisonRow(month, weekIndex) {
  const previousMonth = previousMonthFor(month);
  if (!previousMonth) return null;
  return computedWeeks(previousMonth)[weekIndex] || null;
}

function samePeriodComparison(latest, samePeriodRow) {
  if (!samePeriodRow || samePeriodRow.week.cumulativeSpend === null) return null;
  const previousAmount = numberOrZero(samePeriodRow.weeklyTotal);
  if (previousAmount <= 0) return null;
  const change = latest.weeklyTotal - previousAmount;
  return {
    amount: roundCurrency(change),
    ratio: change / previousAmount,
  };
}

function comparisonLabel(comparison) {
  if (!comparison) return t("samePeriodUnavailable");
  const value = formatPercent(Math.abs(comparison.ratio));
  return comparison.amount <= 0 ? t("samePeriodLower", `-${value}`) : t("samePeriodHigher", value);
}

function topPeriodSpendingDrivers(row, count) {
  const drivers = [
    { label: t("grocery"), amount: Math.max(0, numberOrZero(row.grocery)) },
    ...categories.map((category) => ({
      label: categoryLabel(category),
      amount: Math.max(0, numberOrZero(row.week.categoryValues?.[category.key])),
    })),
  ];
  return drivers
    .filter((driver) => driver.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, count);
}

function topMonthlySpendingDrivers(rows, count) {
  const categoryTotals = new Map(categories.map((category) => [category.key, 0]));
  let groceryTotal = 0;
  rows.forEach((row) => {
    groceryTotal += Math.max(0, numberOrZero(row.grocery));
    categories.forEach((category) => {
      categoryTotals.set(
        category.key,
        numberOrZero(categoryTotals.get(category.key)) + Math.max(0, numberOrZero(row.week.categoryValues?.[category.key])),
      );
    });
  });

  const drivers = [
    { label: t("grocery"), amount: roundCurrency(groceryTotal) },
    ...categories
      .map((category) => ({
        label: categoryLabel(category),
        amount: roundCurrency(numberOrZero(categoryTotals.get(category.key))),
      })),
  ];
  return drivers
    .filter((driver) => driver.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, count);
}

function topMonthlyDriversLine(drivers) {
  const [first, second] = drivers.map((driver) => `${driver.label} ${formatMoney(driver.amount)}`);
  return t("topMonthlyDriversLine", first, second);
}

function topPeriodDriversLine(drivers) {
  if (!drivers.length) return t("noPeriodDriverYet");
  const [first, second] = drivers.map((driver) => `${driver.label} ${formatMoney(driver.amount)}`);
  return t("topDriversLine", first, second);
}

function setText(element, value) {
  if (element) element.textContent = value;
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
          (row, index) => {
            const periodDisplay = formatPeriodDisplay(row.week.period) || t("unnamedPeriod");
            const periodCode = `P${index + 1}`;
            return `
            <tr>
              <td data-label="${labels.period}">
                <span class="period-chip" tabindex="0" aria-label="${escapeHtml(`${periodCode}: ${periodDisplay}`)}">
                  <span class="period-chip-code">${escapeHtml(periodCode)}</span>
                  <span class="period-tooltip" role="tooltip">${escapeHtml(periodDisplay)}</span>
                </span>
              </td>
              <td class="amount" data-label="${labels.cumulative}">${formatMoney(row.cumulativeSpend)}</td>
              <td class="amount" data-label="${labels.weeklyTotal}">${formatMoney(row.weeklyTotal)}</td>
              <td class="amount" data-label="${labels.nonGrocery}">${formatMoney(row.nonGrocery)}</td>
              <td class="amount" data-label="${labels.grocery}">${formatMoney(row.grocery)}</td>
              <td class="amount" data-label="${labels.incidentals}">${formatMoney(row.incidentals)}</td>
              <td data-label="${labels.notes}">${escapeHtml(row.week.notes || "")}</td>
              <td data-label="${labels.edit}"><button class="ghost-btn" type="button" onclick="editWeek('${row.week.id}')">${labels.edit}</button></td>
            </tr>
          `;
          },
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
  const weekIndex = Math.max(
    0,
    month.weeks.findIndex((item) => item.id === week?.id),
  );
  const incidentalsWasOpen = !!els.incidentalsDetails?.open;

  els.weekSelect.innerHTML = month.weeks
    .map((item) => {
      var idx = month.weeks.findIndex(function(w) { return w.id === item.id; });
      var label = idx >= 0 ? "Period " + (idx + 1) : (item.period || t("unnamedPeriod"));
      return '<option value="' + item.id + '">' + escapeHtml(label) + "</option>";
    })
    .join("");
  if (week) els.weekSelect.value = week.id;

  const periodRange = editingRangeForWeek(month, week, weekIndex);
  els.periodStartInput.value = periodRange.start;
  els.periodEndInput.value = periodRange.end;
  els.periodInput.value = formatPeriodFromDates() || week?.period || "";
  renderEntryEditBanner(week);
  renderEntrySummary(monthDisplayName(month), 0, computeCumulativeFromAvailable(week, month));
  els.availableInput.value = valueForInput(week?.availableBalance);
  els.cumulativeInput.value = formatMoney(computeCumulativeFromAvailable(week, currentMonth()));
  els.unpaidInput.value = valueForInput(week?.unpaidPrevious);
  els.notesInput.value = week?.notes || "";
  if (els.incidentalsDetails) {
    els.incidentalsDetails.open = incidentalsWasOpen || !!week?.notes;
  }

  els.categoryInputs.innerHTML = categories
    .map(
      (category) => {
        const rareHint =
          category.key === "incidentals"
            ? `<small class="category-hint">${escapeHtml(t("incidentalsRareHint"))}</small>`
            : "";
        const rareClass = category.key === "incidentals" ? " category-input-card-rare" : "";
        return `
        <label class="field category-input-card${rareClass}">
          <span>${escapeHtml(categoryLabel(category))}</span>
          <input data-category="${category.key}" type="number" min="0" step="0.01" value="${valueForInput(
            week?.categoryValues?.[category.key],
          )}" />
          ${rareHint}
        </label>
      `;
      },
    )
    .join("");

  renderLiveWeeklyTotal();
}

function renderEntryEditBanner(week) {
  if (!els.entryEditBanner) return;
  els.entryEditBanner.textContent = t("editingExistingPeriod");
  els.entryEditBanner.classList.toggle("hidden", !weekHasSavedValues(week));
}

function weekHasSavedValues(week) {
  if (!week) return false;
  const hasCategoryValues = Object.values(week.categoryValues || {}).some((value) => numberOrZero(value) !== 0);
  return (
    numberOrNull(week.availableBalance) !== null ||
    numberOrNull(week.cumulativeSpend) !== null ||
    numberOrNull(week.unpaidPrevious) !== null ||
    hasCategoryValues ||
    !!week.notes?.trim()
  );
}

function renderEntrySummary(monthName, weeklyTotal, cumulative) {
  if (els.entryMonthKpi) els.entryMonthKpi.textContent = monthName || "-";
  if (els.entryPeriodSpendKpi) els.entryPeriodSpendKpi.textContent = formatMoney(weeklyTotal);
  if (els.entryMonthSpendKpi) els.entryMonthSpendKpi.textContent = cumulative === null ? "-" : formatMoney(cumulative);
}

function renderEntryPeriodComparison(month, week, weeklyTotal) {
  if (!els.entryPeriodComparison) return;
  const periodIndex = month.weeks.findIndex((item) => item.id === currentWeekId);
  const periodLabel = periodIndex >= 0 ? "Period " + (periodIndex + 1) : (week?.period || t("unnamedPeriod"));
  const samePeriodRow = samePeriodComparisonRow(month, periodIndex);
  const comparison = samePeriodComparison({ weeklyTotal }, samePeriodRow);
  const previewRow = {
    week: {
      categoryValues: week?.categoryValues || {},
    },
    grocery: week ? weeklyTotal - sumNonGrocery(week) - numberOrZero(week.categoryValues?.incidentals) : 0,
  };
  const drivers = topPeriodSpendingDrivers(previewRow, 2);
  const driversLine = topPeriodDriversLine(drivers);
  if (!comparison) {
    setEntryPeriodComparison("empty", periodLabel, t("periodComparisonUnavailable"), driversLine, t("statusNoData"));
    return;
  }

  const kind = comparison.ratio > 0.15 ? "over" : comparison.ratio > 0 ? "watch" : "good";
  const pill = kind === "over" ? t("statusOver") : kind === "watch" ? t("statusWatch") : t("statusOnTrack");
  const change = formatMoney(Math.abs(comparison.amount));
  const copy =
    comparison.amount > 0
      ? t("periodComparisonHigher", change)
      : comparison.amount < 0
        ? t("periodComparisonLower", change)
        : t("periodComparisonFlat");
  setEntryPeriodComparison(kind, periodLabel, copy, driversLine, pill);
}

function setEntryPeriodComparison(kind, title, copy, drivers, pill) {
  setText(els.entryPeriodComparisonTitle, title);
  setText(els.entryPeriodComparisonCopy, copy);
  setText(els.entryPeriodDrivers, drivers);
  if (els.entryPeriodComparison) {
    els.entryPeriodComparison.className = `entry-period-comparison status-${kind}`;
  }
  if (els.entryPeriodComparisonPill) {
    els.entryPeriodComparisonPill.textContent = pill;
    els.entryPeriodComparisonPill.className = `status-pill status-${kind}`;
  }
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
  renderEntrySummary(monthDisplayName(month), weeklyTotal, cumulative);
  renderEntryPeriodComparison(month, preview, weeklyTotal);
  updateImportPeriodLabel();
  renderImportWarnings();
}

function createEmptyImportDraft() {
  return {
    rows: [],
    activeTab: "included",
    parsed: false,
  };
}

function updateImportPeriodLabel() {
  if (!els.importPeriodLabel) return;
  const range = currentImportPeriodRange();
  els.importPeriodLabel.textContent = range.start && range.end ? formatDateRangeDisplay(range.start, range.end) : "-";
}

function currentImportPeriodRange() {
  return {
    start: els.periodStartInput?.value || "",
    end: els.periodEndInput?.value || "",
  };
}

function parseTransactionImport() {
  const source = els.transactionImportInput?.value || "";
  const range = currentImportPeriodRange();
  if (!source.trim()) {
    showImportStatus(t("importParseEmpty"));
    return;
  }
  const balanceHints = parseBalanceHints(source);
  applyBalanceHints(balanceHints);
  if (!range.start || !range.end) {
    showImportStatus(t("importNeedsPeriod"));
    return;
  }

  importDraft = {
    rows: buildImportRows(source, range),
    activeTab: IMPORT_STATUSES.INCLUDED,
    parsed: true,
  };
  renderImportDraft();
  if (balanceHints.available !== null || balanceHints.unpaid !== null) {
    showImportStatus(t("importBalancesUpdated"));
  }
}

function buildImportRows(source, range) {
  const parsedRows = parseTransactionRows(source);
  const duplicateKeys = new Set();
  return parsedRows.map((row, index) => {
    const base = {
      id: `import-${Date.now()}-${index}`,
      sourceLine: row.sourceLine,
      dateIso: row.dateIso,
      displayDate: row.dateIso || row.rawDate || "-",
      amount: row.amount,
      expenseAmount: row.amount < 0 ? roundCurrency(Math.abs(row.amount)) : 0,
      description: row.description || row.sourceLine,
      normalizedMerchant: normalizeMerchant(row.description || row.sourceLine),
      categoryKey: "",
      confidence: IMPORT_CONFIDENCE.LOW,
      reason: "",
      status: IMPORT_STATUSES.EXCLUDED,
    };

    const exclusionReason = importExclusionReason(base, row, range);
    if (exclusionReason) {
      return { ...base, reason: exclusionReason };
    }

    const duplicateKey = `${base.dateIso}|${base.normalizedMerchant}|${base.expenseAmount}`;
    const duplicateReason = duplicateKeys.has(duplicateKey) ? "duplicate candidate" : "";
    duplicateKeys.add(duplicateKey);

    const classification = classifyTransaction(base.normalizedMerchant);
    const status =
      classification.requiresReview || classification.confidence === IMPORT_CONFIDENCE.LOW
        ? IMPORT_STATUSES.REVIEW
        : IMPORT_STATUSES.INCLUDED;
    const reason =
      classification.requiresReview && classification.categoryKey === "incidentals"
        ? "incidentals require confirmation"
        : duplicateReason ||
          (classification.confidence === IMPORT_CONFIDENCE.LOW
            ? "low confidence"
            : classification.reason);

    return {
      ...base,
      categoryKey: classification.categoryKey,
      confidence: classification.confidence,
      reason,
      status,
    };
  });
}

function parseTransactionRows(source) {
  const transactionSource = stripBalanceHintLines(source);
  const looseRows = parseLooseTransactionText(transactionSource);
  if (looseRows.length) return looseRows;

  return transactionSource
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const columns = parseCsvLine(line);
      if (columns.length < 3) {
        return { sourceLine: line, error: "unsupported row format", rawDate: columns[0] || "", amount: 0, description: line };
      }
      const dateIso = parseImportDate(columns[0]);
      const amount = parseImportAmount(columns[1]);
      return {
        sourceLine: line,
        rawDate: columns[0],
        dateIso,
        amount,
        description: columns[2] || columns[3] || line,
        error: Number.isNaN(amount) ? "unsupported row format" : "",
      };
    });
}

function parseBalanceHints(source) {
  const lines = source.split(/\r?\n/).map((line) => line.trim());
  return lines.reduce(
    (hints, line, index) => {
      const label = line.toLowerCase();
      if (label.includes("available")) {
        const amount = parseLooseAmount(line);
        const nextAmount = Number.isNaN(amount) ? parseLooseAmount(nextNonEmptyLine(lines, index)) : amount;
        if (!Number.isNaN(nextAmount)) hints.available = Math.abs(nextAmount);
      }
      if (label.includes("total owing") || label.includes("unpaid")) {
        const amount = parseLooseAmount(line);
        const nextAmount = Number.isNaN(amount) ? parseLooseAmount(nextNonEmptyLine(lines, index)) : amount;
        if (!Number.isNaN(nextAmount)) hints.unpaid = Math.abs(nextAmount);
      }
      return hints;
    },
    { available: null, unpaid: null },
  );
}

function applyBalanceHints(hints) {
  let changed = false;
  if (hints.available !== null) {
    els.availableInput.value = valueForInput(roundCurrency(hints.available));
    changed = true;
  }
  if (hints.unpaid !== null) {
    els.unpaidInput.value = valueForInput(roundCurrency(hints.unpaid));
    changed = true;
  }
  if (changed) renderLiveWeeklyTotal();
}

function nextNonEmptyLine(lines, index) {
  return lines.slice(index + 1).find((line) => line.trim()) || "";
}

function stripBalanceHintLines(source) {
  const lines = source.split(/\r?\n/);
  const skip = new Set();
  lines.forEach((line, index) => {
    const label = line.trim().toLowerCase();
    if (!label.includes("available") && !label.includes("total owing") && !label.includes("unpaid")) return;
    skip.add(index);
    if (Number.isNaN(parseLooseAmount(line))) {
      const nextIndex = lines.findIndex((candidate, candidateIndex) => candidateIndex > index && candidate.trim());
      if (nextIndex > index) skip.add(nextIndex);
    }
  });
  return lines.filter((_, index) => !skip.has(index)).join("\n");
}

function parseLooseTransactionText(source) {
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const rows = [];
  let current = null;

  const flush = () => {
    if (!current) return;
    const description = cleanLooseDescription(current.descriptionParts.join(" "));
    rows.push({
      sourceLine: current.sourceLines.join(" "),
      rawDate: current.rawDate,
      dateIso: current.dateIso,
      amount: current.amount,
      description: description || current.sourceLines.join(" "),
      error: Number.isNaN(current.amount) ? "unsupported row format" : "",
    });
    current = null;
  };

  lines.forEach((line) => {
    const dateIso = parseImportDate(line);
    if (dateIso) {
      flush();
      current = {
        rawDate: line,
        dateIso,
        amount: NaN,
        descriptionParts: [],
        sourceLines: [line],
      };
      return;
    }

    if (!current) return;
    current.sourceLines.push(line);
    const amount = parseLooseAmount(line);
    if (!Number.isNaN(amount)) {
      current.amount = amount;
      return;
    }
    current.descriptionParts.push(line);
  });

  flush();
  return rows.filter((row) => row.dateIso || row.description || !Number.isNaN(row.amount));
}

function parseCsvLine(line) {
  const columns = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];
    if (character === '"' && next === '"' && inQuotes) {
      current += '"';
      index += 1;
    } else if (character === '"') {
      inQuotes = !inQuotes;
    } else if (character === "," && !inQuotes) {
      columns.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  columns.push(current.trim());
  return columns.map((value) => value.replace(/^"|"$/g, "").trim());
}

function parseImportDate(value) {
  const trimmed = String(value || "").trim();
  const dmy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) return toIsoDate(Number(dmy[3]), Number(dmy[2]), Number(dmy[1]));
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return toIsoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  const named = trimmed.match(/^(\d{1,2})\s+([a-z]{3,9})\s+(\d{4})$/i);
  if (named) return toIsoDate(Number(named[3]), monthNameToNumber(named[2]), Number(named[1]));
  return "";
}

function monthNameToNumber(value) {
  const key = String(value || "").slice(0, 3).toLowerCase();
  return {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  }[key] || 0;
}

function toIsoDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseImportAmount(value) {
  const cleaned = String(value || "").replace(/[$,\s"]/g, "");
  if (!cleaned) return NaN;
  const bracketed = cleaned.match(/^\((.+)\)$/);
  return Number(bracketed ? `-${bracketed[1]}` : cleaned);
}

function parseLooseAmount(value) {
  const match = String(value || "").match(/[+-]?\$?\s*\d[\d,]*(?:\.\d{2})?/);
  return match ? parseImportAmount(match[0]) : NaN;
}

function cleanLooseDescription(value) {
  return String(value || "")
    .replace(/Open transaction details/gi, "")
    .replace(/\bPENDING\s*-\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function importExclusionReason(base, row, range) {
  if (row.error) return row.error;
  if (!base.dateIso) return "invalid date";
  if (!Number.isFinite(base.amount)) return "unsupported row format";
  if (base.amount >= 0) return "positive amount / payment / refund";
  if (!monthExistsForImportDate(base.dateIso, range)) return "month not created";
  if (!currentWeek()) return "no matching existing period";
  if (!range.start || !range.end) return "no matching existing period";
  if (base.dateIso < range.start || base.dateIso > range.end) return "outside selected period";
  return "";
}

function monthExistsForImportDate(dateIso, range) {
  const yearMonth = dateIso.slice(0, 7);
  const periodMonths = new Set([range.start?.slice(0, 7), range.end?.slice(0, 7)].filter(Boolean));
  if (periodMonths.has(yearMonth)) return true;
  return Object.values(appState.months).some((month) => monthDateRanges(month).some((item) => dateIso >= item.start && dateIso <= item.end));
}

function monthDateRanges(month) {
  const ranges = [];
  month.weeks.forEach((week) => {
    const range = parseFlexiblePeriodRange(week.period, monthDisplayName(month));
    if (range.start && range.end) ranges.push(range);
  });
  return ranges;
}

function parseFlexiblePeriodRange(period, monthName) {
  const iso = parsePeriodRange(period);
  if (iso.start && iso.end) return iso;
  const match = String(period || "").match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\s*(?:-|to|至)\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/i);
  if (!match) return { start: "", end: "" };
  const fallbackYear = Number(String(monthName || "").match(/20\d{2}/)?.[0]) || new Date().getFullYear();
  const startYear = normalizeYear(match[3], fallbackYear);
  let endYear = normalizeYear(match[6], startYear);
  if (!match[6] && Number(match[5]) < Number(match[2])) endYear += 1;
  return {
    start: toIsoDate(startYear, Number(match[2]), Number(match[1])),
    end: toIsoDate(endYear, Number(match[5]), Number(match[4])),
  };
}

function normalizeYear(value, fallback) {
  if (!value) return fallback;
  const year = Number(value);
  return year < 100 ? 2000 + year : year;
}

function normalizeMerchant(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/^PAYPAL \*+/, "")
    .replace(/##.*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function classifyTransaction(normalizedMerchant) {
  const rule = MERCHANT_RULES.find((item) => normalizedMerchant.includes(normalizeMerchant(item.pattern)));
  if (!rule) {
    return {
      categoryKey: "shoppingDining",
      confidence: IMPORT_CONFIDENCE.LOW,
      reason: "low confidence",
      requiresReview: true,
    };
  }
  return {
    categoryKey: rule.categoryKey,
    confidence: rule.confidence,
    reason: rule.pattern,
    requiresReview: !!rule.requiresReview || rule.categoryKey === "incidentals",
  };
}

function renderImportDraft() {
  updateImportPeriodLabel();
  renderImportTabs();
  if (!els.importSummary || !els.importReview || !els.importRows) return;

  els.importSummary.classList.toggle("hidden", !importDraft.parsed);
  els.importReview.classList.toggle("hidden", !importDraft.parsed);
  if (!importDraft.parsed) {
    els.importRows.innerHTML = "";
    renderImportWarnings();
    return;
  }

  const summary = summarizeImportDraft(importDraft.rows);
  els.importSummary.innerHTML = `
    <article class="import-summary-item">
      <span>${escapeHtml(t("includedRows"))}</span>
      <strong>${escapeHtml(t("importSummaryLine", summary.included.count, formatMoney(summary.included.amount)))}</strong>
    </article>
    <article class="import-summary-item">
      <span>${escapeHtml(t("needsReviewRows"))}</span>
      <strong>${escapeHtml(t("importSummaryLine", summary.review.count, formatMoney(summary.review.amount)))}</strong>
    </article>
    <article class="import-summary-item">
      <span>${escapeHtml(t("excludedRows"))}</span>
      <strong>${escapeHtml(String(summary.excluded.count))}</strong>
    </article>
  `;

  const rows = importDraft.rows.filter((row) => row.status === importDraft.activeTab);
  els.importRows.innerHTML = rows.length
    ? rows.map((row) => renderImportRow(row)).join("")
    : `<div class="import-empty">${escapeHtml(t("noImportRows"))}</div>`;

  if (els.applyImportBtn) {
    els.applyImportBtn.disabled = summary.included.count === 0;
  }
  renderImportWarnings();
}

function renderImportTabs() {
  document.querySelectorAll(".import-tab").forEach((button) => {
    const key =
      button.dataset.importTab === IMPORT_STATUSES.INCLUDED
        ? "includedRows"
        : button.dataset.importTab === IMPORT_STATUSES.REVIEW
          ? "needsReviewRows"
          : "excludedRows";
    button.textContent = t(key);
    button.classList.toggle("active", button.dataset.importTab === importDraft.activeTab);
  });
}

function renderImportRow(row) {
  const rowClass =
    row.status === IMPORT_STATUSES.REVIEW
      ? " import-row-review"
      : row.status === IMPORT_STATUSES.EXCLUDED
        ? " import-row-excluded"
        : "";
  return `
    <article class="import-row-card${rowClass}" data-import-row-id="${escapeHtml(row.id)}">
      <div class="import-cell">
        <span>${escapeHtml(t("period"))}</span>
        <strong>${escapeHtml(row.displayDate)}</strong>
      </div>
      <div class="import-cell">
        <span>${escapeHtml(t("merchantDescription"))}</span>
        <p>${escapeHtml(row.description)}</p>
      </div>
      <div class="import-cell">
        <span>${escapeHtml(t("amount"))}</span>
        <strong>${escapeHtml(formatMoney(row.expenseAmount || Math.abs(row.amount || 0)))}</strong>
      </div>
      <div class="import-cell">
        <span>${escapeHtml(t("suggestedCategory"))}</span>
        ${renderImportCategorySelect(row)}
      </div>
      <div class="import-cell">
        <span>${escapeHtml(t("confidence"))}</span>
        <p>${escapeHtml(confidenceLabel(row.confidence))}</p>
        <span>${escapeHtml(t("reason"))}</span>
        <p>${escapeHtml(reasonLabel(row.reason))}</p>
        ${renderImportRowActions(row)}
      </div>
    </article>
  `;
}

function renderImportCategorySelect(row) {
  const disabled = row.status === IMPORT_STATUSES.EXCLUDED ? " disabled" : "";
  const options = [
    `<option value="grocery"${row.categoryKey === "grocery" ? " selected" : ""}>${escapeHtml(t("grocery"))}</option>`,
    ...categories.map(
      (category) =>
        `<option value="${escapeHtml(category.key)}"${row.categoryKey === category.key ? " selected" : ""}>${escapeHtml(categoryLabel(category))}</option>`,
    ),
  ];
  return `<select data-import-category${disabled}>${options.join("")}</select>`;
}

function renderImportRowActions(row) {
  if (row.status === IMPORT_STATUSES.EXCLUDED) return "";
  const includeButton =
    row.status === IMPORT_STATUSES.REVIEW
      ? `<button class="ghost-btn" type="button" data-import-action="include">${escapeHtml(t("includeTransaction"))}</button>`
      : "";
  return includeButton ? `<div class="import-row-actions">${includeButton}</div>` : "";
}

function confidenceLabel(value) {
  if (value === IMPORT_CONFIDENCE.HIGH) return t("confidenceHigh");
  if (value === IMPORT_CONFIDENCE.MEDIUM) return t("confidenceMedium");
  return t("confidenceLow");
}

function reasonLabel(reason) {
  if (!reason) return "-";
  return t("reasonLabels")?.[reason] || reason;
}

function summarizeImportDraft(rows) {
  return {
    included: summarizeRows(rows.filter((row) => row.status === IMPORT_STATUSES.INCLUDED)),
    review: summarizeRows(rows.filter((row) => row.status === IMPORT_STATUSES.REVIEW)),
    excluded: summarizeRows(rows.filter((row) => row.status === IMPORT_STATUSES.EXCLUDED)),
  };
}

function summarizeRows(rows) {
  return {
    count: rows.length,
    amount: roundCurrency(rows.reduce((total, row) => total + numberOrZero(row.expenseAmount), 0)),
  };
}

function handleImportRowAction(event) {
  const button = event.target.closest("[data-import-action]");
  if (!button) return;
  const card = button.closest("[data-import-row-id]");
  const row = importDraft.rows.find((item) => item.id === card?.dataset.importRowId);
  if (!row) return;
  if (button.dataset.importAction === "include") {
    row.status = IMPORT_STATUSES.INCLUDED;
    row.reason = row.reason === "low confidence" || row.reason === "incidentals require confirmation" ? "" : row.reason;
  }
  renderImportDraft();
}

function handleImportCategoryChange(event) {
  const select = event.target.closest("[data-import-category]");
  if (!select) return;
  const card = select.closest("[data-import-row-id]");
  const row = importDraft.rows.find((item) => item.id === card?.dataset.importRowId);
  if (!row) return;
  row.categoryKey = select.value;
  if (row.status === IMPORT_STATUSES.REVIEW && row.confidence !== IMPORT_CONFIDENCE.LOW && row.categoryKey !== "incidentals") {
    row.reason = "";
  }
  renderImportDraft();
}

function renderImportWarnings() {
  if (!els.importWarning) return;
  const warnings = importWarningMessages();
  els.importWarning.classList.toggle("hidden", warnings.length === 0);
  els.importWarning.innerHTML = warnings.map((warning) => `<p>${escapeHtml(warning)}</p>`).join("");
}

function importWarningMessages() {
  if (!importDraft.parsed) return [];
  const included = importDraft.rows.filter((row) => row.status === IMPORT_STATUSES.INCLUDED);
  if (!included.length) return [];
  const totals = aggregateImportRows(included);
  const periodTotal = currentWeeklyTotalFromForm();
  const warnings = [];
  if (Math.abs(totals.importedTotal - periodTotal) >= 0.01) {
    warnings.push(t("importBalanceWarning", formatMoney(totals.importedTotal), formatMoney(periodTotal)));
  }
  const residualGrocery = roundCurrency(periodTotal - totals.nonGroceryTotal - totals.incidentalsTotal);
  if (Math.abs(totals.groceryTotal - residualGrocery) >= 0.01) {
    warnings.push(t("importGroceryWarning", formatMoney(totals.groceryTotal), formatMoney(residualGrocery)));
  }
  return warnings;
}

function aggregateImportRows(rows) {
  return rows.reduce(
    (totals, row) => {
      const amount = numberOrZero(row.expenseAmount);
      totals.importedTotal = roundCurrency(totals.importedTotal + amount);
      if (row.categoryKey === "grocery") {
        totals.groceryTotal = roundCurrency(totals.groceryTotal + amount);
      } else if (row.categoryKey === "incidentals") {
        totals.incidentalsTotal = roundCurrency(totals.incidentalsTotal + amount);
        totals.categoryValues.incidentals = roundCurrency(numberOrZero(totals.categoryValues.incidentals) + amount);
        totals.incidentalNotes.push(`${row.displayDate} ${row.description} ${formatMoney(amount)}`);
      } else if (categories.some((category) => category.key === row.categoryKey)) {
        totals.nonGroceryTotal = roundCurrency(totals.nonGroceryTotal + amount);
        totals.categoryValues[row.categoryKey] = roundCurrency(numberOrZero(totals.categoryValues[row.categoryKey]) + amount);
      }
      return totals;
    },
    { importedTotal: 0, groceryTotal: 0, nonGroceryTotal: 0, incidentalsTotal: 0, categoryValues: {}, incidentalNotes: [] },
  );
}

function currentWeeklyTotalFromForm() {
  const month = currentMonth();
  const index = month.weeks.findIndex((week) => week.id === currentWeekId);
  const previous = month.weeks[index - 1];
  const previousCumulative = numberOrZero(previous?.cumulativeSpend);
  const cumulative = computeCumulativeFromAvailable(
    {
      availableBalance: numberOrNull(els.availableInput.value),
      unpaidPrevious: numberOrNull(els.unpaidInput.value),
    },
    month,
  );
  return cumulative === null ? 0 : roundCurrency(index <= 0 ? cumulative : cumulative - previousCumulative);
}

function applyTransactionImport() {
  const included = importDraft.rows.filter((row) => row.status === IMPORT_STATUSES.INCLUDED);
  if (!included.length) return;
  const totals = aggregateImportRows(included);
  els.categoryInputs.querySelectorAll("input[data-category]").forEach((input) => {
    input.value = valueForInput(totals.categoryValues[input.dataset.category] || 0);
  });
  if (totals.incidentalNotes.length) {
    const currentNotes = els.notesInput.value.trim();
    const importNotes = totals.incidentalNotes.join("\n");
    els.notesInput.value = currentNotes ? `${currentNotes}\n${importNotes}` : importNotes;
    if (els.incidentalsDetails) els.incidentalsDetails.open = true;
  }
  renderLiveWeeklyTotal();
  showImportStatus(t("importApplied", included.length));
}

function showImportStatus(message) {
  if (!els.importStatus) return;
  els.importStatus.textContent = message;
  els.importStatus.classList.remove("hidden");
  clearTimeout(showImportStatus.timeoutId);
  showImportStatus.timeoutId = setTimeout(() => {
    els.importStatus?.classList.add("hidden");
  }, 2600);
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
  const savedRow = computedWeeks(month).find((row) => row.week.id === next.id);
  const feedback = {
    period: index >= 0 ? "Period " + (index + 1) : (next.period || t("unnamedPeriod")),
    total: formatMoney(savedRow?.weeklyTotal || 0),
    grocery: formatMoney(savedRow?.grocery || 0),
  };
  renderAll();
  switchView("overview");
  showSaveFeedback(feedback);
}

function showSaveFeedback(feedback = {}) {
  const message =
    feedback.period && feedback.total && feedback.grocery
      ? t("saveSuccessDetailed", feedback.period, feedback.total, feedback.grocery)
      : t("saveSuccess");
  if (els.saveStatus) {
    els.saveStatus.textContent = message;
    els.saveStatus.classList.remove("hidden");
    setTimeout(() => els.saveStatus?.classList.add("hidden"), 2200);
  }
  if (!els.saveToast) return;
  els.saveToast.textContent = message;
  els.saveToast.classList.remove("hidden");
  clearTimeout(showSaveFeedback.timeoutId);
  showSaveFeedback.timeoutId = setTimeout(() => {
    els.saveToast?.classList.add("hidden");
  }, 2200);
}

function supportsModalDialog(dialog) {
  return !!dialog && typeof dialog.showModal === "function" && typeof dialog.close === "function";
}

function openMonthDialog() {
  if (!els.monthDialog) return;
  const selectedSortKey = inferMonthSortKey(currentMonth());
  if (els.newMonthPicker) {
    const today = new Date();
    els.newMonthPicker.value = validMonthSortKey(selectedSortKey)
      ? selectedSortKey
      : formatMonthSortKey(today.getFullYear(), today.getMonth() + 1);
  }
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
  const sortKey = String(els.newMonthPicker?.value || "").trim();
  if (!validMonthSortKey(sortKey)) return;
  const existingId = monthIdForSortKey(sortKey);
  if (existingId) {
    currentMonthId = existingId;
    appState.currentMonthId = currentMonthId;
    currentWeekId = currentMonth().weeks[0]?.id;
    closeMonthDialog();
    renderAll();
    return;
  }
  const displayName = formatMonthDisplay(sortKey);
  const id = sortKey;
  appState.months[id] = {
    id,
    sortKey,
    displayName,
    name: displayName,
    creditLimit: CREDIT_LIMIT,
    weeks: DEFAULT_PERIOD_LABELS.map((period) =>
      createWeek({ period, availableBalance: CREDIT_LIMIT, unpaidPrevious: null }),
    ),
  };
  currentMonthId = id;
  appState.currentMonthId = currentMonthId;
  currentWeekId = appState.months[id].weeks[0].id;
  if (els.newMonthPicker) els.newMonthPicker.value = "";
  closeMonthDialog();
  renderAll();
}

function deleteCurrentMonth() {
  const monthIds = orderedMonths().map((month) => month.id);
  if (monthIds.length <= 1) {
    alert(t("deleteOnlyMonth"));
    return;
  }

  const month = currentMonth();
  const ok = confirm(t("deleteConfirm", monthDisplayName(month)));
  if (!ok) return;

  const currentIndex = monthIds.indexOf(currentMonthId);
  delete appState.months[currentMonthId];
  const remainingIds = orderedMonths().map((item) => item.id);
  currentMonthId = remainingIds[Math.max(0, Math.min(currentIndex, remainingIds.length - 1))];
  appState.currentMonthId = currentMonthId;
  currentWeekId = currentMonth().weeks[0]?.id;
  renderAll();
}

function renderMonthSettings() {
  const month = currentMonth();
  els.monthNameInput.value = monthDisplayName(month);
  els.creditLimitInput.value = valueForInput(month.creditLimit);
}

function saveMonthSettings() {
  const month = currentMonth();
  const nextName = els.monthNameInput.value.trim();
  const nextLimit = numberOrNull(els.creditLimitInput.value);
  if (nextName) {
    month.displayName = nextName;
    month.name = nextName;
  } else {
    month.displayName = formatMonthDisplay(inferMonthSortKey(month));
    month.name = month.displayName;
  }
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
  const bottom = 60;
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
  const colors = CATEGORY_CHART_COLORS;
  const labelColors = CATEGORY_CHART_LABEL_COLORS;

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
      const segmentX = x;
      const segmentY = yBase - h;
      ctx.save();
      ctx.fillStyle = colors[key];
      ctx.beginPath();
      ctx.roundRect(segmentX, segmentY, barWidth, h, 2);
      ctx.fill();
      ctx.restore();
      drawSegmentLabel(ctx, label, value, segmentX, segmentY, barWidth, h);
      yBase -= h;
    });

    drawCalendarBadge(ctx, x + barWidth / 2, top + chartHeight + 14, `P${index + 1}`, colors.nonGrocery, compact ? 0.9 : 1);

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

function drawCalendarBadge(ctx, centerX, topY, label, accentColor, scale = 1) {
  const width = 34 * scale;
  const height = 30 * scale;
  const x = centerX - width / 2;
  const y = topY;
  const radius = 7 * scale;

  ctx.save();
  ctx.shadowColor = "rgba(23, 32, 27, 0.12)";
  ctx.shadowBlur = 8 * scale;
  ctx.shadowOffsetY = 2 * scale;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.roundRect(x, y, width, 9 * scale, radius);
  ctx.fill();

  ctx.strokeStyle = "rgba(23, 32, 27, 0.14)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);

  ctx.fillStyle = "#17201b";
  ctx.font = `700 ${11 * scale}px Microsoft JhengHei, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, centerX, y + 20 * scale);
  ctx.restore();
}

function drawMonthBadge(ctx, centerX, topY, label, accentColor, selected) {
  const radius = selected ? 15 : 13;

  ctx.save();
  ctx.shadowColor = selected ? "rgba(88, 80, 196, 0.22)" : "rgba(23, 32, 27, 0.10)";
  ctx.shadowBlur = selected ? 10 : 6;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = selected ? "#f8f7ff" : "#ffffff";
  ctx.beginPath();
  ctx.arc(centerX, topY + radius, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = selected ? accentColor : "rgba(23, 32, 27, 0.16)";
  ctx.lineWidth = selected ? 2 : 1;
  ctx.stroke();

  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(centerX, topY + 6, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#17201b";
  ctx.font = "700 11px Microsoft JhengHei, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, centerX, topY + radius + 2);
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
  return orderedMonths().map((month) => {
    const rows = computedWeeks(month);
    const nonGrocery = rows.reduce((sum, row) => sum + numberOrZero(row.nonGrocery), 0);
    const grocery = rows.reduce((sum, row) => sum + Math.max(0, numberOrZero(row.grocery)), 0);
    const incidentals = rows.reduce((sum, row) => sum + numberOrZero(row.incidentals), 0);
    return {
      id: month.id,
      name: monthDisplayName(month),
      nonGrocery: roundCurrency(nonGrocery),
      grocery: roundCurrency(grocery),
      incidentals: roundCurrency(incidentals),
      total: roundCurrency(nonGrocery + grocery + incidentals),
      creditLimit: month.creditLimit || CREDIT_LIMIT,
      sortKey: inferMonthSortKey(month),
    };
  });
}


function monthlyStatusKind(month) {
  const limit = numberOrZero(month.creditLimit);
  if (!limit) return "empty";
  const rows = computedWeeks(month).filter((r) => r.week.cumulativeSpend !== null);
  if (rows.length === 0) return "empty";
  const nonGrocery = rows.reduce((sum, r) => sum + numberOrZero(r.nonGrocery), 0);
  const grocery = rows.reduce((sum, r) => sum + Math.max(0, numberOrZero(r.grocery)), 0);
  const incidentals = rows.reduce((sum, r) => sum + numberOrZero(r.incidentals), 0);
  const total = nonGrocery + grocery + incidentals;
  const ratio = total / limit;
  if (ratio >= 0.8) return "over";
  if (ratio >= 0.5) return "watch";
  return "good";
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
  const bottom = 66;
  const left = compact ? 54 : 76;
  const chartWidth = Math.max(1, width - left - right);
  const chartHeight = Math.max(1, height - top - bottom);
  const colors = CATEGORY_CHART_COLORS;
  const labelColors = CATEGORY_CHART_LABEL_COLORS;

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
    ...rows.flatMap((row) => [row.nonGrocery, row.grocery, row.incidentals, row.total]),
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

  // Highlight current month with yellow highlighter band
  var currentMonthTrendIndex = rows.findIndex(function(r) { return r.id === currentMonthId; });
  if (currentMonthTrendIndex >= 0) {
    var highlightX, highlightW;
    if (rows.length === 1) {
      highlightX = left;
      highlightW = chartWidth;
    } else {
      var spacing = chartWidth / (rows.length - 1);
      highlightX = xForIndex(currentMonthTrendIndex) - spacing / 2;
      highlightW = spacing;
    }
    ctx.save();
    ctx.fillStyle = "rgba(255, 240, 100, 0.25)"; // yellow highlighter
    ctx.fillRect(highlightX, top, highlightW, chartHeight);
    ctx.restore();
  }

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

  // ── Monthly total bar ──
  const statusBarColors = {
    good: "rgba(36, 113, 93, 0.70)",
    watch: "rgba(195, 107, 45, 0.70)",
    over: "rgba(185, 65, 61, 0.70)",
    empty: "rgba(102, 115, 107, 0.30)",
  };

  rows.forEach((row, index) => {
    const kind = appState.months[row.id]._barStatusKind || monthlyStatusKind(appState.months[row.id]);
    const barColor = statusBarColors[kind] || statusBarColors.empty;
    const barValue = row.total;
    const barTop = yForValue(barValue);
    const barBottom = top + chartHeight;
    const barWidth = rows.length > 1 ? chartWidth / (rows.length - 1) * 0.45 : chartWidth * 0.35;
    const barX = xForIndex(index) - barWidth / 2;

    ctx.save();
    ctx.fillStyle = barColor;
    ctx.beginPath();
    ctx.roundRect(barX, barTop, barWidth, barBottom - barTop, 4);
    ctx.fill();
    ctx.restore();
  });

  // ── Value indicators for selected month ──
  if (currentMonthTrendIndex >= 0 && trendPoints[currentMonthTrendIndex]) {
    const pt = trendPoints[currentMonthTrendIndex];
    const categories = [
      { y: pt.nonGroceryY, value: rows[currentMonthTrendIndex]?.nonGrocery, color: colors.nonGrocery, key: "nonGrocery" },
      { y: pt.groceryY, value: rows[currentMonthTrendIndex]?.grocery, color: colors.grocery, key: "grocery" },
      { y: pt.incidentalsY, value: rows[currentMonthTrendIndex]?.incidentals, color: colors.incidentals, key: "incidentals" },
    ];
    categories.forEach((cat) => {
      if (!cat.value || cat.value <= 0) return;
      ctx.save();
      ctx.font = "bold 11px Microsoft JhengHei, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      const label = formatCompactMoney(cat.value);
      const txtX = pt.x;
      const txtY = cat.y - 8;
      const metrics = ctx.measureText(label);
      const pad = 4;
      const bw = metrics.width + pad * 2;
      const bh = 16;
      const bx = txtX - bw / 2;
      const by = txtY - bh;
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 3);
      ctx.fill();
      ctx.fillStyle = labelColors[cat.key];
      ctx.fillText(label, txtX, txtY);
      ctx.restore();
    });
  }


  rows.forEach((row, index) => {
    drawMonthBadge(ctx, xForIndex(index), top + chartHeight + 14, monthAxisLabel(row), colors.nonGrocery, row.id === currentMonthId);
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

function selectMonthFromTrend(event) {
  if (!trendPoints.length) return;
  const rect = els.monthlyTrendChart.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  // Find nearest point within half-spacing distance
  const spacing = trendPoints.length > 1
    ? (trendPoints[trendPoints.length - 1].x - trendPoints[0].x) / (trendPoints.length - 1)
    : 0;
  const maxDist = spacing > 0 ? spacing / 2 : 36;
  var nearest = null;
  var nearestDist = Infinity;
  trendPoints.forEach(function(item) {
    var d = Math.abs(item.x - clickX);
    if (d < nearestDist) { nearest = item; nearestDist = d; }
  });
  if (!nearest || nearestDist > maxDist) return;
  var monthId = nearest.row.id;
  if (monthId && monthId !== currentMonthId) {
    currentMonthId = monthId;
    appState.currentMonthId = monthId;
    currentWeekId = currentMonth().weeks[0]?.id;
    renderAll();
  }
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
    <strong>${escapeHtml(formatPeriodDisplay(bar.row.week.period) || t("unnamedPeriod"))}</strong><br />
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
  orderedMonths().forEach((month) => {
    if (monthFilter !== "all" && month.id !== monthFilter) return;
    computedWeeks(month).forEach((row) => {
      const values = historyValues(row);
      Object.entries(values).forEach(([key, item]) => {
        if (categoryFilter !== "all" && key !== categoryFilter) return;
        if (Math.abs(item.amount) < minAmount) return;
        const haystack = `${monthDisplayName(month)} ${row.week.period} ${item.label} ${row.week.notes}`.toLowerCase();
        if (search && !haystack.includes(search)) return;
        rows.push({ month, row, label: item.label, amount: item.amount, categoryKey: key });
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
                    <td data-label="${labels.month}">${escapeHtml(monthDisplayName(item.month))}</td>
                    <td data-label="${labels.period}">${escapeHtml(item.row.week.period || "")}</td>
                    <td data-label="${labels.category}">${escapeHtml(item.label)}</td>
                    <td class="amount" data-label="${labels.amount}">${formatMoney(item.amount)}</td>
                    <td data-label="${labels.notes}">${item.categoryKey === "incidentals" ? escapeHtml(item.row.week.notes || "") : ""}</td>
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

function formatSignedMoney(value) {
  const rounded = roundCurrency(value);
  if (rounded === 0) return formatMoney(0);
  return `${rounded > 0 ? "+" : "-"}${formatMoney(Math.abs(rounded))}`;
}

function formatPercent(value) {
  const percent = Math.max(0, numberOrZero(value)) * 100;
  return `${Math.round(percent)}%`;
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

function parseIsoDateParts(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function monthShortName(monthNumber) {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthNumber - 1] || "";
}

function formatIsoDateDisplay(value) {
  const date = parseIsoDateParts(value);
  if (!date) return value || "";
  if (currentLanguage === "zh") {
    return `${date.year}/${String(date.month).padStart(2, "0")}/${String(date.day).padStart(2, "0")}`;
  }
  return `${date.day} ${monthShortName(date.month)} ${date.year}`;
}

function formatDateRangeDisplay(startValue, endValue) {
  const start = parseIsoDateParts(startValue);
  const end = parseIsoDateParts(endValue);
  if (!start && !end) return "";
  if (!end) return formatIsoDateDisplay(startValue);
  if (!start) return formatIsoDateDisplay(endValue);
  if (start.year === end.year && start.month === end.month && start.day === end.day) {
    return formatIsoDateDisplay(startValue);
  }
  if (currentLanguage === "zh") {
    if (start.year === end.year && start.month === end.month) {
      return `${start.year}/${String(start.month).padStart(2, "0")}/${String(start.day).padStart(2, "0")}-${String(end.day).padStart(2, "0")}`;
    }
    if (start.year === end.year) {
      return `${start.year}/${String(start.month).padStart(2, "0")}/${String(start.day).padStart(2, "0")}-${String(end.month).padStart(2, "0")}/${String(end.day).padStart(2, "0")}`;
    }
    return `${formatIsoDateDisplay(startValue)}-${formatIsoDateDisplay(endValue)}`;
  }
  if (start.year === end.year && start.month === end.month) {
    return `${start.day}-${end.day} ${monthShortName(start.month)} ${start.year}`;
  }
  if (start.year === end.year) {
    return `${start.day} ${monthShortName(start.month)} - ${end.day} ${monthShortName(end.month)} ${start.year}`;
  }
  return `${formatIsoDateDisplay(startValue)} - ${formatIsoDateDisplay(endValue)}`;
}

function formatPeriodDisplay(period) {
  const range = parsePeriodRange(period);
  if (range.start || range.end) return formatDateRangeDisplay(range.start, range.end);
  return shortPeriod(period);
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

function monthAxisLabel(row) {
  const sortKey = row?.sortKey || row?.id || "";
  const match = String(sortKey).match(/^\d{4}-(\d{2})$/);
  if (match) return match[1];
  return shortMonthName(row?.name || "").slice(0, 2).toUpperCase();
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
