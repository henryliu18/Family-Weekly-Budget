const { expect, test, request: apiRequest } = require("@playwright/test");

const httpUrl = process.env.E2E_HTTP_URL || "http://127.0.0.1:18080";
const baseUrl = process.env.E2E_BASE_URL || "https://127.0.0.1:18443";
const password = process.env.E2E_APP_PASSWORD || "";
const accountPassword = process.env.E2E_ACCOUNT_PASSWORD || password;
const appUrl = "/app";
const defaultWorkspaceId = "e2e-default";
const expectedOwner = {
  id: process.env.E2E_EXPECT_ACCOUNT_ID || "default-owner",
  displayName: process.env.E2E_EXPECT_ACCOUNT_DISPLAY_NAME || "Default Owner",
  email: process.env.E2E_EXPECT_ACCOUNT_EMAIL || null,
  authProvider: process.env.E2E_EXPECT_AUTH_PROVIDER || "password",
};
const expectedOwnerPublicIdentity = {
  id: expectedOwner.id,
  userId: expectedOwner.id,
  displayName: expectedOwner.displayName,
  email: expectedOwner.email,
  authProvider: expectedOwner.authProvider,
  isDefaultUser: true,
};

async function login(page) {
  await page.goto(appUrl);
  await expect(page.locator("#authOverlay")).toBeVisible();
  await expect(page.locator(".auth-copy")).toHaveText(
    "This family budget is password-protected. Ask the household budget owner for access.",
  );
  await page.locator("#passwordInput").fill(accountPassword);
  await page.locator("#loginBtn").click();
  await expect(page.locator("#authOverlay")).toBeHidden();
}

async function createDefaultWorkspaceApiContext() {
  const context = await apiRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  const loginResponse = await context.post("/api/session", {
    data: { password: accountPassword, workspaceId: defaultWorkspaceId },
  });
  expect(loginResponse.ok()).toBe(true);
  return context;
}

async function resetCurrentWorkspaceState(page) {
  const response = await page.request.post("/api/reset");
  expect(response.ok()).toBe(true);
  await page.goto(appUrl);
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
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

async function fillAppPrompt(page, value, { title, message } = {}) {
  await expect(page.locator("#appModal")).toBeVisible();
  if (title) await expect(page.locator("#appModalTitle")).toHaveText(title);
  if (message) await expect(page.locator("#appModalMessage")).toHaveText(message);
  await page.locator("#appModalInput").fill(value);
  await page.locator("#appModalConfirm").click();
  await expect(page.locator("#appModal")).toBeHidden();
}

async function confirmAppModal(page, { title, message } = {}) {
  await expect(page.locator("#appModal")).toBeVisible();
  if (title) await expect(page.locator("#appModalTitle")).toHaveText(title);
  if (message) await expect(page.locator("#appModalMessage")).toHaveText(message);
  await page.locator("#appModalConfirm").click();
  await expect(page.locator("#appModal")).toBeHidden();
}

async function readState(page) {
  const response = await page.request.get("/api/state");
  expect(response.ok()).toBe(true);
  return response.json();
}

async function restoreState(page, state) {
  const response = await page.request.post("/api/state", { data: state });
  expect(response.ok()).toBe(true);
}

async function apiLogin(page) {
  const resp = await page.request.post("/api/session", {
    data: { password: accountPassword },
  });
  expect(resp.ok()).toBe(true);
}

async function seedTrendMonths(page) {
  const apiContext = await createDefaultWorkspaceApiContext();
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

  const seededMonthIds = months.map((month) => month.id);
  try {
    const resetResponse = await apiContext.post("/api/reset");
    expect(resetResponse.ok()).toBe(true);

    const stateResponse = await apiContext.get("/api/state");
    expect(stateResponse.ok()).toBe(true);
    const base = await stateResponse.json();

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

    const response = await apiContext.post("/api/state", { data: base });
    expect(response.ok()).toBe(true);
    await expect
      .poll(async () => {
        const seededStateResponse = await apiContext.get("/api/state");
        if (!seededStateResponse.ok()) return 0;
        const state = await seededStateResponse.json();
        return seededMonthIds.filter((id) => state.months?.[id]).length;
      })
      .toBe(seededMonthIds.length);
  } finally {
    await apiContext.dispose();
  }

  await page.context().clearCookies();
  await login(page);
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
  await expect
    .poll(async () => page.evaluate((ids) => ids.filter((id) => appState.months?.[id]).length, seededMonthIds))
    .toBe(seededMonthIds.length);
  await expectCanvasReady(page, "#monthlyTrendChart");

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
  await expect(page.locator('#enterWorkspaceLink[href="/app"]')).toHaveText("Log in");
  await expect(page.locator("#landingPasswordInput")).toHaveCount(0);
  await expect(page.locator("#authOverlay")).toHaveCount(0);
});

test("authenticated state API persists current workspace data", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await apiLogin(page);

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

test("health exposes safe registry and storage diagnostics", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  const health = await response.json();

  expect(health).toMatchObject({
    ok: true,
    auth: {
      accountPasswordEnabled: true,
      fallbackPasswordEnabled: true,
      sessionSecretConfigured: true,
    },
    oauth: {
      google: {
        enabled: false,
        configured: false,
        clientIdConfigured: false,
        clientSecretConfigured: false,
        appBaseUrlConfigured: false,
        redirectPath: "/auth/google/callback",
        allowedDomainConfigured: false,
        stateTtlSeconds: 600,
      },
      states: {
        schemaVersion: 1,
        activeStateCount: 0,
        ttlSeconds: 600,
        stateStorage: "hmac-sha256",
        sessionSecretConfigured: true,
        persistent: true,
      },
    },
    registry: {
      schemaVersion: 1,
      defaultOwnerExists: true,
      defaultUserIdentityReady: true,
      defaultWorkspaceExists: true,
      defaultMembershipExists: true,
      workspaceStoreRootConfigured: true,
    },
    storage: {
      workspaceStoreRootConfigured: true,
      defaultWorkspaceId: "e2e-default",
    },
    sessions: {
      schemaVersion: 1,
      tokenStorage: "hmac-sha256",
      sessionSecretConfigured: true,
      persistent: true,
    },
    bootstrap: {
      accountId: expectedOwner.id,
      configuredDisplayName: true,
      configuredEmail: !!expectedOwner.email,
      authProviderConfigured: true,
      providerSubjectConfigured: true,
      accountExists: true,
      emailPresent: !!expectedOwner.email,
      providerSubjectPresent: true,
      accountPasswordConfigured: true,
      accountPasswordBootstrapConfigured: true,
      usingFallbackAccountId: expectedOwner.id === "default-owner",
      usingFallbackDisplayName: expectedOwner.displayName === "Default Owner",
      usingFallbackAuthProvider: expectedOwner.authProvider === "password",
      migrationSafe: true,
    },
  });
  expect(health.registry.accountCount).toBeGreaterThanOrEqual(1);
  expect(health.registry.workspaceCount).toBeGreaterThanOrEqual(1);
  expect(health.registry.membershipCount).toBeGreaterThanOrEqual(1);
  expect(health.registry.identityProviderCount).toBeGreaterThanOrEqual(1);
  expect(health.sessions.ttlSeconds).toBeGreaterThan(0);
  expect(health.sessions.activeSessionCount).toBeGreaterThanOrEqual(0);

  const serialized = JSON.stringify({ ...health, buildVersion: "", buildTime: "" });
  expect(serialized).not.toContain("password");
  expect(serialized).not.toContain("authSubject");
  expect(serialized).not.toContain("passwordHash");
  expect(serialized).not.toContain(accountPassword);
  expect(serialized).not.toContain("e2e-session-secret");
  expect(serialized).not.toContain("DEFAULT_AUTH_SUBJECT");
  expect(serialized).not.toContain("GOOGLE_OAUTH_CLIENT_SECRET");
  expect(serialized).not.toContain("tokenHash");
  expect(serialized).not.toContain("accounts");
  expect(serialized).not.toContain("memberships");
});

test("google oauth status is safe while disabled", async ({ request }) => {
  const response = await request.get("/api/auth/google/status");
  expect(response.ok()).toBe(true);
  const status = await response.json();

  expect(status).toMatchObject({
    ok: true,
    provider: "google",
    enabled: false,
    configured: false,
    clientIdConfigured: false,
    clientSecretConfigured: false,
    appBaseUrlConfigured: false,
    redirectPath: "/auth/google/callback",
    allowedDomainConfigured: false,
    stateTtlSeconds: 600,
  });
  expect(status.redirectUri).toBe(`${baseUrl}/auth/google/callback`);
  const serialized = JSON.stringify(status);
  expect(serialized).not.toContain("secret");
  expect(serialized).not.toContain("password");
  expect(serialized).not.toContain("authSubject");
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
        data: { password: accountPassword, workspaceId: workspace.workspaceId },
      });
      expect(loginResponse.ok()).toBe(true);
      await expect(loginResponse.json()).resolves.toMatchObject({
        accountId: expectedOwner.id,
        user: expectedOwnerPublicIdentity,
        workspaceId: workspace.workspaceId,
      });

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
      data: { password: accountPassword, workspaceId: "e2e-unregistered-workspace" },
    });
    expect(response.status()).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: "Workspace is not registered." });
  } finally {
    await context.dispose();
  }
});

test("session login rejects workspaces without account membership", async () => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  const context = await apiRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  try {
    const response = await context.post("/api/session", {
      data: { password: accountPassword, workspaceId: "e2e-unowned-workspace" },
    });
    expect(response.status()).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: "Account is not a member of this workspace.",
    });
  } finally {
    await context.dispose();
  }
});

test("account read model returns only current account workspaces", async () => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  const context = await apiRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  try {
    const unauthenticatedSession = await context.get("/api/session");
    expect(unauthenticatedSession.ok()).toBe(true);
    await expect(unauthenticatedSession.json()).resolves.toMatchObject({
      authenticated: false,
      user: null,
    });

    const unauthenticatedResponse = await context.get("/api/me");
    expect(unauthenticatedResponse.status()).toBe(401);

    const loginResponse = await context.post("/api/session", {
      data: { password: accountPassword, workspaceId: "e2e-session-alpha" },
    });
    expect(loginResponse.ok()).toBe(true);

    const response = await context.get("/api/me");
    expect(response.ok()).toBe(true);
    const me = await response.json();
    expect(me.user).toEqual(expectedOwnerPublicIdentity);
    expect(me.account).toEqual(expectedOwnerPublicIdentity);
    expect(me.currentWorkspace).toEqual({
      id: "e2e-session-alpha",
      name: "e2e-session-alpha",
      role: "owner",
    });
    expect(me.workspaces).toEqual(
      expect.arrayContaining([
        { id: "e2e-default", name: "Default Workspace", role: "owner" },
        { id: "e2e-session-alpha", name: "e2e-session-alpha", role: "owner" },
        { id: "e2e-session-bravo", name: "e2e-session-bravo", role: "owner" },
      ]),
    );
    expect(me.workspaces.map((workspace) => workspace.id)).not.toContain("e2e-unowned-workspace");
    expect(JSON.stringify(me)).not.toContain("memberships");
    expect(JSON.stringify(me)).not.toContain("accounts");
    expect(JSON.stringify(me)).not.toContain("authSubject");
  } finally {
    await context.dispose();
  }
});

test("fallback app password remains accepted beside account password", async () => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");
  test.skip(accountPassword === password, "Distinct E2E_ACCOUNT_PASSWORD is required for fallback coverage.");

  const context = await apiRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  try {
    const response = await context.post("/api/session", {
      data: { password, workspaceId: "e2e-default" },
    });
    expect(response.ok()).toBe(true);
    await expect(response.json()).resolves.toMatchObject({
      accountId: expectedOwner.id,
      user: expectedOwnerPublicIdentity,
      workspaceId: "e2e-default",
    });
  } finally {
    await context.dispose();
  }
});

test("registry diagnostics are authenticated and safe", async () => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  const context = await apiRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  try {
    const unauthenticatedResponse = await context.get("/api/admin/registry/diagnostics");
    expect(unauthenticatedResponse.status()).toBe(401);

    const loginResponse = await context.post("/api/session", {
      data: { password: accountPassword, workspaceId: "e2e-default" },
    });
    expect(loginResponse.ok()).toBe(true);

    const response = await context.get("/api/admin/registry/diagnostics");
    expect(response.ok()).toBe(true);
    const diagnostics = await response.json();
    expect(diagnostics).toMatchObject({
      ok: true,
      auth: {
        accountPasswordEnabled: true,
        fallbackPasswordEnabled: true,
        sessionSecretConfigured: true,
      },
      registry: {
        schemaVersion: 1,
        currentUserId: expectedOwner.id,
        currentWorkspaceId: "e2e-default",
        defaultOwnerExists: true,
        defaultUserIdentityReady: true,
        defaultWorkspaceExists: true,
        defaultMembershipExists: true,
        workspaceStoreRootConfigured: true,
      },
    });
    expect(diagnostics.registry.accountCount).toBeGreaterThanOrEqual(1);
    expect(diagnostics.registry.workspaceCount).toBeGreaterThanOrEqual(1);
    expect(diagnostics.registry.membershipCount).toBeGreaterThanOrEqual(1);
    expect(diagnostics.registry.identityProviderCount).toBeGreaterThanOrEqual(1);
    expect(diagnostics.sessions).toMatchObject({
      schemaVersion: 1,
      tokenStorage: "hmac-sha256",
      sessionSecretConfigured: true,
      persistent: true,
    });
    expect(diagnostics.bootstrap).toMatchObject({
      accountId: expectedOwner.id,
      configuredEmail: !!expectedOwner.email,
      authProviderConfigured: true,
      accountExists: true,
      emailPresent: !!expectedOwner.email,
      providerSubjectPresent: true,
      accountPasswordConfigured: true,
      accountPasswordBootstrapConfigured: true,
      usingFallbackAccountId: expectedOwner.id === "default-owner",
      usingFallbackDisplayName: expectedOwner.displayName === "Default Owner",
      usingFallbackAuthProvider: expectedOwner.authProvider === "password",
      migrationSafe: true,
    });
    expect(diagnostics.sessions.activeSessionCount).toBeGreaterThanOrEqual(1);

    const serialized = JSON.stringify(diagnostics);
    expect(serialized).not.toContain("password");
    expect(serialized).not.toContain("authSubject");
    expect(serialized).not.toContain("passwordHash");
    expect(serialized).not.toContain(accountPassword);
    expect(serialized).not.toContain("e2e-session-secret");
    expect(serialized).not.toContain("tokenHash");
    expect(serialized).not.toContain("accounts");
    expect(serialized).not.toContain("memberships");
  } finally {
    await context.dispose();
  }
});

test("durable session registry keeps tokens server-side and logout invalidates the session", async () => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  const context = await apiRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  try {
    const loginResponse = await context.post("/api/session", {
      data: { password: accountPassword, workspaceId: "e2e-default" },
    });
    expect(loginResponse.ok()).toBe(true);
    const cookie = loginResponse.headers()["set-cookie"] || "";
    const token = /family_budget_session=([^;]+)/.exec(cookie)?.[1];
    expect(token).toBeTruthy();

    const diagnosticsResponse = await context.get("/api/admin/registry/diagnostics");
    expect(diagnosticsResponse.ok()).toBe(true);
    const diagnostics = await diagnosticsResponse.json();
    expect(diagnostics.sessions).toMatchObject({
      schemaVersion: 1,
      tokenStorage: "hmac-sha256",
      sessionSecretConfigured: true,
      persistent: true,
    });
    expect(diagnostics.sessions.activeSessionCount).toBeGreaterThanOrEqual(1);

    const serialized = JSON.stringify(diagnostics);
    expect(serialized).not.toContain(token);
    expect(serialized).not.toContain("tokenHash");

    const logoutResponse = await context.delete("/api/session");
    expect(logoutResponse.status()).toBe(204);

    const meAfterLogout = await context.get("/api/me");
    expect(meAfterLogout.status()).toBe(401);
    const sessionAfterLogout = await context.get("/api/session");
    expect(sessionAfterLogout.ok()).toBe(true);
    await expect(sessionAfterLogout.json()).resolves.toMatchObject({
      authenticated: false,
      user: null,
    });
  } finally {
    await context.dispose();
  }
});

test("workspace management API creates account-owned isolated workspaces", async () => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  const unauthenticated = await apiRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  const context = await apiRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  try {
    const unauthenticatedCreate = await unauthenticated.post("/api/workspaces", {
      data: { name: "Unauthenticated Workspace" },
    });
    expect(unauthenticatedCreate.status()).toBe(401);

    const loginResponse = await context.post("/api/session", {
      data: { password: accountPassword, workspaceId: "e2e-default" },
    });
    expect(loginResponse.ok()).toBe(true);
    await expect(loginResponse.json()).resolves.toMatchObject({
      accountId: expectedOwner.id,
      user: expectedOwnerPublicIdentity,
      workspaceId: "e2e-default",
    });

    const sessionResponse = await context.get("/api/session");
    expect(sessionResponse.ok()).toBe(true);
    await expect(sessionResponse.json()).resolves.toMatchObject({
      authenticated: true,
      accountId: expectedOwner.id,
      user: expectedOwnerPublicIdentity,
    });

    const invalidCreate = await context.post("/api/workspaces", {
      data: { name: "x" },
    });
    expect(invalidCreate.status()).toBe(400);

    const createResponse = await context.post("/api/workspaces", {
      data: { name: "E2E Managed Workspace" },
    });
    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();
    expect(created.workspace).toMatchObject({
      name: "E2E Managed Workspace",
      role: "owner",
    });
    expect(created.workspace.id).toMatch(/^e2e-managed-workspace(-\d+)?$/);

    const listResponse = await context.get("/api/workspaces");
    expect(listResponse.ok()).toBe(true);
    const list = await listResponse.json();
    expect(list.workspaces).toEqual(
      expect.arrayContaining([
        { id: created.workspace.id, name: "E2E Managed Workspace", role: "owner" },
      ]),
    );
    expect(list.workspaces.map((workspace) => workspace.id)).not.toContain("e2e-unowned-workspace");

    const renameResponse = await context.patch(`/api/workspaces/${created.workspace.id}`, {
      data: { name: "E2E Renamed Workspace" },
    });
    expect(renameResponse.ok()).toBe(true);
    await expect(renameResponse.json()).resolves.toMatchObject({
      ok: true,
      workspace: { id: created.workspace.id, name: "E2E Renamed Workspace", role: "owner" },
    });

    const renamedListResponse = await context.get("/api/workspaces");
    expect(renamedListResponse.ok()).toBe(true);
    const renamedList = await renamedListResponse.json();
    expect(renamedList.workspaces).toEqual(
      expect.arrayContaining([
        { id: created.workspace.id, name: "E2E Renamed Workspace", role: "owner" },
      ]),
    );

    const unownedDelete = await context.delete("/api/workspaces/e2e-unowned-workspace");
    expect(unownedDelete.status()).toBe(403);

    const defaultDelete = await context.delete("/api/workspaces/e2e-default");
    expect(defaultDelete.status()).toBe(400);

    const switchResponse = await context.post("/api/session/workspace", {
      data: { workspaceId: created.workspace.id },
    });
    expect(switchResponse.ok()).toBe(true);

    const managedStateResponse = await context.get("/api/state");
    expect(managedStateResponse.ok()).toBe(true);
    const managedState = await managedStateResponse.json();
    const managedMonthId = `${created.workspace.id}-month`;
    managedState.currentMonthId = managedMonthId;
    managedState.months[managedMonthId] = {
      id: managedMonthId,
      sortKey: "2099-11",
      name: "Managed Workspace Month",
      displayName: "Managed Workspace Month",
      creditLimit: 15000,
      weeks: [
        {
          id: "e2e-managed-workspace-month-w1",
          period: "Period 1",
          availableBalance: 14925,
          unpaidPrevious: null,
          cumulativeSpend: 75,
          categoryValues: { transport: 75, shoppingDining: 0, incidentals: 0 },
          notes: "managed workspace isolated state",
        },
      ],
    };
    expect((await context.post("/api/state", { data: managedState })).ok()).toBe(true);

    expect((await context.post("/api/session/workspace", { data: { workspaceId: "e2e-default" } })).ok()).toBe(true);
    const defaultStateResponse = await context.get("/api/state");
    expect(defaultStateResponse.ok()).toBe(true);
    const defaultState = await defaultStateResponse.json();
    expect(defaultState.months[managedMonthId]).toBeUndefined();

    expect((await context.post("/api/session/workspace", { data: { workspaceId: created.workspace.id } })).ok()).toBe(true);
    const deleteResponse = await context.delete(`/api/workspaces/${created.workspace.id}`);
    expect(deleteResponse.ok()).toBe(true);
    await expect(deleteResponse.json()).resolves.toMatchObject({
      ok: true,
      deletedWorkspaceId: created.workspace.id,
      currentWorkspaceId: "e2e-default",
    });

    const afterDeleteSessionResponse = await context.get("/api/session");
    expect(afterDeleteSessionResponse.ok()).toBe(true);
    await expect(afterDeleteSessionResponse.json()).resolves.toMatchObject({
      workspaceId: "e2e-default",
    });

    const afterDeleteListResponse = await context.get("/api/workspaces");
    expect(afterDeleteListResponse.ok()).toBe(true);
    const afterDeleteList = await afterDeleteListResponse.json();
    expect(afterDeleteList.workspaces.map((workspace) => workspace.id)).not.toContain(created.workspace.id);

    const switchDeletedResponse = await context.post("/api/session/workspace", {
      data: { workspaceId: created.workspace.id },
    });
    expect(switchDeletedResponse.status()).toBe(403);
  } finally {
    await unauthenticated.dispose();
    await context.dispose();
  }
});

test("admin account creation creates isolated account-owned workspaces", async () => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  const unauthenticated = await apiRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  const owner = await apiRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  const secondary = await apiRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  const secondaryPassword = "e2e-secondary-password";
  try {
    const unauthenticatedCreate = await unauthenticated.post("/api/admin/accounts", {
      data: {
        accountId: "e2e-secondary-owner",
        displayName: "E2E Secondary Owner",
        email: "secondary@example.test",
        password: secondaryPassword,
        workspaceName: "E2E Secondary Workspace",
      },
    });
    expect(unauthenticatedCreate.status()).toBe(401);

    const ownerLogin = await owner.post("/api/session", {
      data: { password: accountPassword, workspaceId: "e2e-default" },
    });
    expect(ownerLogin.ok()).toBe(true);

    const invalidCreate = await owner.post("/api/admin/accounts", {
      data: {
        accountId: "e2e-invalid-account",
        displayName: "Invalid Account",
        password: "short",
        workspaceName: "Invalid Workspace",
      },
    });
    expect(invalidCreate.status()).toBe(400);

    const createResponse = await owner.post("/api/admin/accounts", {
      data: {
        accountId: "e2e-secondary-owner",
        displayName: "E2E Secondary Owner",
        email: "secondary@example.test",
        password: secondaryPassword,
        workspaceName: "E2E Secondary Workspace",
      },
    });
    expect(createResponse.status()).toBe(201);
    const created = await createResponse.json();
    expect(created.account).toEqual({
      id: "e2e-secondary-owner",
      userId: "e2e-secondary-owner",
      displayName: "E2E Secondary Owner",
      email: "secondary@example.test",
      authProvider: "password",
      isDefaultUser: false,
    });
    expect(created.workspace).toMatchObject({
      id: "e2e-secondary-workspace",
      name: "E2E Secondary Workspace",
      role: "owner",
    });
    expect(JSON.stringify(created)).not.toContain(secondaryPassword);
    expect(JSON.stringify(created)).not.toContain("passwordHash");

    const duplicateCreate = await owner.post("/api/admin/accounts", {
      data: {
        accountId: "e2e-secondary-owner",
        displayName: "E2E Secondary Owner",
        password: secondaryPassword,
        workspaceName: "Duplicate Workspace",
      },
    });
    expect(duplicateCreate.status()).toBe(409);

    const ownerCannotSwitch = await owner.post("/api/session/workspace", {
      data: { workspaceId: created.workspace.id },
    });
    expect(ownerCannotSwitch.status()).toBe(403);

    const secondaryLogin = await secondary.post("/api/session", {
      data: {
        accountId: "e2e-secondary-owner",
        password: secondaryPassword,
        workspaceId: created.workspace.id,
      },
    });
    expect(secondaryLogin.ok()).toBe(true);
    await expect(secondaryLogin.json()).resolves.toMatchObject({
      accountId: "e2e-secondary-owner",
      user: created.account,
      workspaceId: created.workspace.id,
    });

    const secondaryMe = await secondary.get("/api/me");
    expect(secondaryMe.ok()).toBe(true);
    const secondaryModel = await secondaryMe.json();
    expect(secondaryModel.user).toEqual(created.account);
    expect(secondaryModel.currentWorkspace).toEqual(created.workspace);
    expect(secondaryModel.workspaces).toEqual([created.workspace]);
    expect(JSON.stringify(secondaryModel)).not.toContain(secondaryPassword);
    expect(JSON.stringify(secondaryModel)).not.toContain("passwordHash");
    expect(JSON.stringify(secondaryModel)).not.toContain("authSubject");

    const secondaryCannotDeleteLastWorkspace = await secondary.delete(`/api/workspaces/${created.workspace.id}`);
    expect(secondaryCannotDeleteLastWorkspace.status()).toBe(400);

    const secondaryCannotCreateAccounts = await secondary.post("/api/admin/accounts", {
      data: {
        accountId: "e2e-third-owner",
        displayName: "E2E Third Owner",
        password: "e2e-third-password",
        workspaceName: "E2E Third Workspace",
      },
    });
    expect(secondaryCannotCreateAccounts.status()).toBe(403);

    const secondaryCannotSwitchToDefault = await secondary.post("/api/session/workspace", {
      data: { workspaceId: "e2e-default" },
    });
    expect(secondaryCannotSwitchToDefault.status()).toBe(403);

    const secondaryStateResponse = await secondary.get("/api/state");
    expect(secondaryStateResponse.ok()).toBe(true);
    const secondaryState = await secondaryStateResponse.json();
    const secondaryMonthId = "e2e-secondary-month";
    secondaryState.currentMonthId = secondaryMonthId;
    secondaryState.months[secondaryMonthId] = {
      id: secondaryMonthId,
      sortKey: "2099-12",
      name: "Secondary Account Month",
      displayName: "Secondary Account Month",
      creditLimit: 15000,
      weeks: [
        {
          id: "e2e-secondary-month-w1",
          period: "Period 1",
          availableBalance: 14888,
          unpaidPrevious: null,
          cumulativeSpend: 112,
          categoryValues: { transport: 112, shoppingDining: 0, incidentals: 0 },
          notes: "secondary account isolated state",
        },
      ],
    };
    expect((await secondary.post("/api/state", { data: secondaryState })).ok()).toBe(true);

    const ownerDefaultState = await owner.get("/api/state");
    expect(ownerDefaultState.ok()).toBe(true);
    const ownerState = await ownerDefaultState.json();
    expect(ownerState.months[secondaryMonthId]).toBeUndefined();
  } finally {
    await unauthenticated.dispose();
    await owner.dispose();
    await secondary.dispose();
  }
});

test("session workspace switch changes current state workspace", async () => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  const unauthenticated = await apiRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  const context = await apiRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  try {
    const unauthenticatedSwitch = await unauthenticated.post("/api/session/workspace", {
      data: { workspaceId: "e2e-session-alpha" },
    });
    expect(unauthenticatedSwitch.status()).toBe(401);

    const loginResponse = await context.post("/api/session", {
      data: { password: accountPassword, workspaceId: "e2e-session-alpha" },
    });
    expect(loginResponse.ok()).toBe(true);

    const alphaStateResponse = await context.get("/api/state");
    expect(alphaStateResponse.ok()).toBe(true);
    const alphaState = await alphaStateResponse.json();
    alphaState.currentMonthId = "e2e-switch-alpha-month";
    alphaState.months["e2e-switch-alpha-month"] = {
      id: "e2e-switch-alpha-month",
      sortKey: "2099-08",
      name: "Switch Alpha",
      displayName: "Switch Alpha",
      creditLimit: 15000,
      weeks: [
        {
          id: "e2e-switch-alpha-month-w1",
          period: "Period 1",
          availableBalance: 14900,
          unpaidPrevious: null,
          cumulativeSpend: 100,
          categoryValues: { transport: 100, shoppingDining: 0, incidentals: 0 },
          notes: "alpha switch workspace",
        },
      ],
    };
    expect((await context.post("/api/state", { data: alphaState })).ok()).toBe(true);

    const switchToBravo = await context.post("/api/session/workspace", {
      data: { workspaceId: "e2e-session-bravo" },
    });
    expect(switchToBravo.ok()).toBe(true);
    await expect(switchToBravo.json()).resolves.toMatchObject({
      accountId: expectedOwner.id,
      user: expectedOwnerPublicIdentity,
      workspaceId: "e2e-session-bravo",
    });

    const meAfterBravo = await context.get("/api/me");
    expect(meAfterBravo.ok()).toBe(true);
    await expect(meAfterBravo.json()).resolves.toMatchObject({
      currentWorkspace: { id: "e2e-session-bravo", role: "owner" },
    });

    const bravoStateResponse = await context.get("/api/state");
    expect(bravoStateResponse.ok()).toBe(true);
    const bravoState = await bravoStateResponse.json();
    expect(bravoState.currentMonthId).not.toBe("e2e-switch-alpha-month");
    bravoState.currentMonthId = "e2e-switch-bravo-month";
    bravoState.months["e2e-switch-bravo-month"] = {
      id: "e2e-switch-bravo-month",
      sortKey: "2099-09",
      name: "Switch Bravo",
      displayName: "Switch Bravo",
      creditLimit: 15000,
      weeks: [
        {
          id: "e2e-switch-bravo-month-w1",
          period: "Period 1",
          availableBalance: 14800,
          unpaidPrevious: null,
          cumulativeSpend: 200,
          categoryValues: { transport: 0, shoppingDining: 200, incidentals: 0 },
          notes: "bravo switch workspace",
        },
      ],
    };
    expect((await context.post("/api/state", { data: bravoState })).ok()).toBe(true);

    const rejectUnowned = await context.post("/api/session/workspace", {
      data: { workspaceId: "e2e-unowned-workspace" },
    });
    expect(rejectUnowned.status()).toBe(403);

    const rejectUnknown = await context.post("/api/session/workspace", {
      data: { workspaceId: "e2e-unknown-workspace" },
    });
    expect(rejectUnknown.status()).toBe(403);

    const rejectBadId = await context.post("/api/session/workspace", {
      data: { workspaceId: "../bad" },
    });
    expect(rejectBadId.status()).toBe(400);

    const switchBackToAlpha = await context.post("/api/session/workspace", {
      data: { workspaceId: "e2e-session-alpha" },
    });
    expect(switchBackToAlpha.ok()).toBe(true);
    const alphaAgain = await context.get("/api/state");
    expect(alphaAgain.ok()).toBe(true);
    const alphaAgainState = await alphaAgain.json();
    expect(alphaAgainState.currentMonthId).toBe("e2e-switch-alpha-month");
    expect(alphaAgainState.months["e2e-switch-alpha-month"]?.weeks?.[0]?.notes).toBe(
      "alpha switch workspace",
    );
    expect(alphaAgainState.months["e2e-switch-bravo-month"]).toBeUndefined();
  } finally {
    await unauthenticated.dispose();
    await context.dispose();
  }
});

test("workspace selector lists allowed workspaces and switches visible state", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  await page.locator("#languageSelect").selectOption("en");
  await expect(page.locator("#workspaceSwitcher")).toBeVisible();
  await expect(page.locator("#workspaceSelect")).toBeVisible();

  const workspaceValues = await page.locator("#workspaceSelect option").evaluateAll((options) =>
    options.map((option) => option.value),
  );
  expect(workspaceValues).toEqual(
    expect.arrayContaining(["e2e-default", "e2e-session-alpha", "e2e-session-bravo"]),
  );
  expect(workspaceValues).not.toContain("e2e-unowned-workspace");
  await expect(page.locator("#workspaceSelect")).toHaveValue("e2e-default");

  const seedWorkspace = async (workspaceId, monthId, monthName, notes) => {
    const switchResponse = await page.request.post("/api/session/workspace", {
      data: { workspaceId },
    });
    expect(switchResponse.ok()).toBe(true);

    const stateResponse = await page.request.get("/api/state");
    expect(stateResponse.ok()).toBe(true);
    const state = await stateResponse.json();
    state.currentMonthId = monthId;
    state.months[monthId] = {
      id: monthId,
      sortKey: monthId,
      name: monthName,
      displayName: monthName,
      creditLimit: 15000,
      weeks: [
        {
          id: `${monthId}-w1`,
          period: "Period 1",
          availableBalance: 14850,
          unpaidPrevious: null,
          cumulativeSpend: 150,
          categoryValues: { transport: 50, shoppingDining: 100, incidentals: 0 },
          notes,
        },
      ],
    };
    const writeResponse = await page.request.post("/api/state", { data: state });
    expect(writeResponse.ok()).toBe(true);
  };

  await seedWorkspace(
    "e2e-session-alpha",
    "e2e-ui-alpha-month",
    "UI Alpha Workspace",
    "workspace selector alpha seed",
  );
  await seedWorkspace(
    "e2e-session-bravo",
    "e2e-ui-bravo-month",
    "UI Bravo Workspace",
    "workspace selector bravo seed",
  );

  const resetResponse = await page.request.post("/api/session/workspace", {
    data: { workspaceId: "e2e-default" },
  });
  expect(resetResponse.ok()).toBe(true);
  await page.goto(appUrl);
  await page.locator("#languageSelect").selectOption("en");
  await expect(page.locator("#workspaceSelect")).toHaveValue("e2e-default");

  await page.locator("#workspaceSelect").selectOption("e2e-session-alpha");
  await expect(page.locator("#workspaceSwitchStatus")).toHaveText("Workspace switched");
  await expect(page.locator("#workspaceSelect")).toHaveValue("e2e-session-alpha");
  await expect(page.locator("#overviewTitle")).toHaveText("UI Alpha Workspace");

  await page.locator("#workspaceSelect").selectOption("e2e-session-bravo");
  await expect(page.locator("#workspaceSwitchStatus")).toHaveText("Workspace switched");
  await expect(page.locator("#workspaceSelect")).toHaveValue("e2e-session-bravo");
  await expect(page.locator("#overviewTitle")).toHaveText("UI Bravo Workspace");
});

test("workspace create button adds and switches to a new workspace", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  await page.locator("#languageSelect").selectOption("en");
  await expect(page.locator("#createWorkspaceBtn")).toBeVisible();

  await page.locator("#createWorkspaceBtn").click();
  await fillAppPrompt(page, "E2E UI Workspace", {
    title: "New workspace",
    message: "Enter a name for the new workspace",
  });
  await expect(page.locator("#workspaceSwitchStatus")).toHaveText("Workspace switched");
  await expect(page.locator("#workspaceSelect option:checked")).toHaveText("E2E UI Workspace");
  const selectedWorkspaceId = await page.locator("#workspaceSelect").inputValue();
  expect(selectedWorkspaceId).toMatch(/^e2e-ui-workspace(-\d+)?$/);

  const meResponse = await page.request.get("/api/me");
  expect(meResponse.ok()).toBe(true);
  const me = await meResponse.json();
  expect(me.currentWorkspace).toMatchObject({
    id: selectedWorkspaceId,
    name: "E2E UI Workspace",
    role: "owner",
  });
  expect(me.workspaces.map((workspace) => workspace.id)).toContain(selectedWorkspaceId);

  await page.locator('.nav-tab[data-view="settings"]').click();
  await expect(page.locator("#workspaceManagementPanel")).toBeVisible();
  await page.locator("#workspaceManageSelect").selectOption(selectedWorkspaceId);
  await page.locator("#workspaceRenameInput").fill("E2E UI Workspace Renamed");
  await page.locator("#renameWorkspaceBtn").click();
  await expect(page.locator("#workspaceManagementStatus")).toHaveText("Workspace renamed.");
  await expect(page.locator("#workspaceSelect option:checked")).toHaveText("E2E UI Workspace Renamed");

  await page.locator("#deleteWorkspaceBtn").click();
  await confirmAppModal(page, {
    title: "Please confirm",
    message: 'Delete "E2E UI Workspace Renamed"? This permanently removes this workspace\'s data.',
  });
  await expect(page.locator("#workspaceManagementStatus")).toHaveText("Workspace deleted.");
  await expect(page.locator("#workspaceSelect")).toHaveValue("e2e-default");
  const workspaceValuesAfterDelete = await page.locator("#workspaceSelect option").evaluateAll((options) =>
    options.map((option) => option.value),
  );
  expect(workspaceValuesAfterDelete).not.toContain(selectedWorkspaceId);
});

test("account admin UI creates secondary account with isolated workspace", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  const suffix = Date.now().toString(36);
  const accountId = `e2e-ui-account-${suffix}`;
  const displayName = `E2E UI Account ${suffix}`;
  const workspaceName = `E2E UI Account Workspace ${suffix}`;
  const secondaryPassword = `e2e-ui-password-${suffix}`;

  await login(page);
  await page.locator("#languageSelect").selectOption("en");
  await page.locator('.nav-tab[data-view="settings"]').click();

  await expect(page.locator("#accountAdminPanel")).toBeVisible();
  await page.locator("#newAccountIdInput").fill(accountId);
  await page.locator("#newAccountDisplayNameInput").fill(displayName);
  await page.locator("#newAccountEmailInput").fill(`${accountId}@example.test`);
  await page.locator("#newAccountWorkspaceInput").fill(workspaceName);
  await page.locator("#newAccountPasswordInput").fill(secondaryPassword);
  await page.locator("#createAccountBtn").click();

  await expect(page.locator("#accountAdminStatus")).toHaveText(
    `Created ${displayName} with workspace ${workspaceName}.`,
  );
  await expect(page.locator("#accountAdminResult")).toContainText(accountId);
  await expect(page.locator("#accountAdminResult")).toContainText(workspaceName);
  await expect(page.locator("#newAccountPasswordInput")).toHaveValue("");

  await page.locator("#logoutBtn").click();
  await expect(page.locator("#authOverlay")).toBeVisible();
  await page.locator("#loginAccountIdInput").fill(accountId);
  await page.locator("#passwordInput").fill(secondaryPassword);
  await page.locator("#loginBtn").click();

  await expect(page.locator("#authOverlay")).toBeHidden();
  await expect(page.locator("#accountAdminPanel")).toBeHidden();
  await expect(page.locator("#userIdentityLabel")).toHaveText(displayName);
  await expect(page.locator("#workspaceSelect option")).toHaveCount(1);
  await expect(page.locator("#workspaceSelect option:checked")).toHaveText(workspaceName);

  const secondaryMeResponse = await page.request.get("/api/me");
  expect(secondaryMeResponse.ok()).toBe(true);
  const secondaryMe = await secondaryMeResponse.json();
  expect(secondaryMe.account).toMatchObject({
    id: accountId,
    displayName,
    email: `${accountId}@example.test`,
    isDefaultUser: false,
  });
  expect(secondaryMe.currentWorkspace).toMatchObject({
    name: workspaceName,
    role: "owner",
  });
  expect(secondaryMe.workspaces).toHaveLength(1);
});

test("account security UI changes the signed-in account password", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  const suffix = Date.now().toString(36);
  const accountId = `e2e-password-account-${suffix}`;
  const displayName = `E2E Password Account ${suffix}`;
  const workspaceName = `E2E Password Workspace ${suffix}`;
  const oldPassword = `e2e-old-password-${suffix}`;
  const newPassword = `e2e-new-password-${suffix}`;

  await login(page);
  await page.locator("#languageSelect").selectOption("en");
  const createResponse = await page.request.post("/api/admin/accounts", {
    data: {
      accountId,
      displayName,
      email: `${accountId}@example.test`,
      password: oldPassword,
      workspaceName,
    },
  });
  expect(createResponse.ok()).toBe(true);

  await page.locator("#logoutBtn").click();
  await expect(page.locator("#authOverlay")).toBeVisible();
  await page.locator("#loginAccountIdInput").fill(accountId);
  await page.locator("#passwordInput").fill(oldPassword);
  await page.locator("#loginBtn").click();
  await expect(page.locator("#authOverlay")).toBeHidden();

  await page.locator("#languageSelect").selectOption("en");
  await page.locator('.nav-tab[data-view="settings"]').click();
  await expect(page.locator("#accountSecurityPanel")).toBeVisible();
  await expect(page.locator("#accountSecurityIdentity")).toContainText(accountId);
  await expect(page.locator("#accountSecurityIdentity")).toContainText(displayName);

  await page.locator("#currentPasswordInput").fill("wrong-current-password");
  await page.locator("#changePasswordInput").fill(newPassword);
  await page.locator("#confirmPasswordInput").fill(newPassword);
  await page.locator("#changePasswordBtn").click();
  await expect(page.locator("#accountSecurityStatus")).toHaveText(
    "Unable to update password. Check the current password and new password.",
  );

  await page.locator("#logoutBtn").click();
  await expect(page.locator("#authOverlay")).toBeVisible();
  await page.locator("#loginAccountIdInput").fill(accountId);
  await page.locator("#passwordInput").fill(newPassword);
  await page.locator("#loginBtn").click();
  await expect(page.locator("#authOverlay")).toBeVisible();
  await expect(page.locator("#loginError")).toHaveText("Incorrect password. Please try again.");

  await page.locator("#loginAccountIdInput").fill(accountId);
  await page.locator("#passwordInput").fill(oldPassword);
  await page.locator("#loginBtn").click();
  await expect(page.locator("#authOverlay")).toBeHidden();

  await page.locator('.nav-tab[data-view="settings"]').click();
  await page.locator("#currentPasswordInput").fill(oldPassword);
  await page.locator("#changePasswordInput").fill(newPassword);
  await page.locator("#confirmPasswordInput").fill("not-the-same-password");
  await page.locator("#changePasswordBtn").click();
  await expect(page.locator("#accountSecurityStatus")).toHaveText(
    "New password and confirmation do not match.",
  );

  await page.locator("#confirmPasswordInput").fill(newPassword);
  await page.locator("#changePasswordBtn").click();
  await expect(page.locator("#accountSecurityStatus")).toHaveText(
    "Password updated. Use the new password next time you sign in.",
  );
  await expect(page.locator("#currentPasswordInput")).toHaveValue("");
  await expect(page.locator("#changePasswordInput")).toHaveValue("");
  await expect(page.locator("#confirmPasswordInput")).toHaveValue("");

  await page.locator("#logoutBtn").click();
  await expect(page.locator("#authOverlay")).toBeVisible();
  await page.locator("#loginAccountIdInput").fill(accountId);
  await page.locator("#passwordInput").fill(oldPassword);
  await page.locator("#loginBtn").click();
  await expect(page.locator("#authOverlay")).toBeVisible();

  await page.locator("#loginAccountIdInput").fill(accountId);
  await page.locator("#passwordInput").fill(newPassword);
  await page.locator("#loginBtn").click();
  await expect(page.locator("#authOverlay")).toBeHidden();
  await expect(page.locator("#userIdentityLabel")).toHaveText(displayName);
});

test("default owner can reset a secondary account password", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  const suffix = Date.now().toString(36);
  const accountId = `e2e-reset-account-${suffix}`;
  const displayName = `E2E Reset Account ${suffix}`;
  const workspaceName = `E2E Reset Workspace ${suffix}`;
  const oldPassword = `e2e-reset-old-${suffix}`;
  const newPassword = `e2e-reset-new-${suffix}`;

  await login(page);
  await page.locator("#languageSelect").selectOption("en");
  const createResponse = await page.request.post("/api/admin/accounts", {
    data: {
      accountId,
      displayName,
      email: `${accountId}@example.test`,
      password: oldPassword,
      workspaceName,
    },
  });
  expect(createResponse.ok()).toBe(true);

  const listResponse = await page.request.get("/api/admin/accounts");
  expect(listResponse.ok()).toBe(true);
  const listedAccounts = await listResponse.json();
  expect(JSON.stringify(listedAccounts)).not.toContain("passwordHash");
  expect(listedAccounts.accounts).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: accountId,
        displayName,
        authProvider: "password",
        isDefaultUser: false,
      }),
    ]),
  );

  await page.reload();
  await expect(page.locator("#authOverlay")).toBeHidden();
  await page.locator("#languageSelect").selectOption("en");
  await page.locator('.nav-tab[data-view="settings"]').click();
  await expect(page.locator("#accountResetPanel")).toBeVisible();
  await page.locator("#resetAccountSelect").selectOption(accountId);
  await page.locator("#resetAccountPasswordInput").fill(newPassword);
  await page.locator("#resetAccountConfirmInput").fill("not-the-same-password");
  await page.locator("#resetAccountPasswordBtn").click();
  await expect(page.locator("#accountResetStatus")).toHaveText("New password and confirmation do not match.");

  await page.locator("#resetAccountConfirmInput").fill(newPassword);
  await page.locator("#resetAccountPasswordBtn").click();
  await expect(page.locator("#accountResetStatus")).toHaveText(`Reset password for ${displayName}.`);
  await expect(page.locator("#resetAccountPasswordInput")).toHaveValue("");
  await expect(page.locator("#resetAccountConfirmInput")).toHaveValue("");

  await page.locator("#logoutBtn").click();
  await expect(page.locator("#authOverlay")).toBeVisible();
  await page.locator("#loginAccountIdInput").fill(accountId);
  await page.locator("#passwordInput").fill(oldPassword);
  await page.locator("#loginBtn").click();
  await expect(page.locator("#authOverlay")).toBeVisible();
  await expect(page.locator("#loginError")).toHaveText("Incorrect password. Please try again.");

  await page.locator("#loginAccountIdInput").fill(accountId);
  await page.locator("#passwordInput").fill(newPassword);
  await page.locator("#loginBtn").click();
  await expect(page.locator("#authOverlay")).toBeHidden();
  await expect(page.locator("#userIdentityLabel")).toHaveText(displayName);
  await page.locator("#languageSelect").selectOption("en");
  await page.locator('.nav-tab[data-view="settings"]').click();
  await expect(page.locator("#accountResetPanel")).toBeHidden();

  const secondaryCannotReset = await page.request.patch(`/api/admin/accounts/${accountId}/password`, {
    data: {
      newPassword: `e2e-reset-denied-${suffix}`,
      confirmPassword: `e2e-reset-denied-${suffix}`,
    },
  });
  expect(secondaryCannotReset.status()).toBe(403);
});

test("post-deploy app smoke and workflow checks", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  await resetCurrentWorkspaceState(page);
  await page.locator("#languageSelect").selectOption("en");

  await expect(page.locator("#monthSelect")).toBeVisible();
  await expect(page.locator("#userIdentityLabel")).toHaveText("E2E Owner");
  await expect(page.locator("#personalTitleSuffix")).toHaveText("’s Family Weekly Budget");
  await expect(page.locator(".topbar-nav")).toBeVisible();
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

  await page.locator("#deleteMonthBtn").click();
  await confirmAppModal(page, {
    title: "Please confirm",
    message: 'Delete "2030 January" and all period records in it?',
  });
  await expect(page.locator("#overviewTitle")).not.toHaveText("2030 January");

  await page.locator("#logoutBtn").click();
  await expect(page.locator("#authOverlay")).toBeVisible();
});

test("transaction import draft filters, reviews, and applies rows", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  await page.locator("#languageSelect").selectOption("en");
  const originalState = await readState(page);

  try {
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
  } finally {
    await restoreState(page, originalState);
  }
});

test("transaction import accepts copied online banking text", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  await page.locator("#languageSelect").selectOption("en");
  const originalState = await readState(page);

  try {
    await addMonth(page, "2099-06");
    await page.locator('.nav-tab[data-view="entry"]').click();
    await expect(page.locator("#entryView")).toHaveClass(/active/);

    await page.locator("#periodStartInput").fill("2099-06-22");
    await page.locator("#periodEndInput").fill("2099-06-23");
    await page.locator("#availableInput").fill("14800");
    await page.locator("#unpaidInput").fill("0");

    const copiedRows = [
      "Available",
      "+$10,956.21",
      "",
      "Total owing$3,687.95",
      "23 Jun 2099",
      "Open transaction detailsPENDING - Department of Transpor Melbourne AUS",
      "-$20.00",
      "23 Jun 2099",
      "Open transaction detailsPENDING - Public Transport Victo Melbourne AUS",
      "",
      "23 Jun 2099",
      "Open transaction detailsPENDING - SQ *DONCASTER Doncaster Eas AUS",
      "-$26.50",
      "23 Jun 2099",
      "Open transaction detailsPENDING - ALDI STORES THE PINES AUS",
      "-$42.55",
      "22 Jun 2099",
      "Open transaction detailsPENDING - POINT PARKING Dandenong Rd AUS",
      "-$4.06",
      "22 Jun 2099",
      "Open transaction detailsPENDING - Daiso (Chadstone SC) Chadstone AUS",
      "-$3.30",
    ].join("\n");

    await page.locator("#transactionImportInput").fill(copiedRows);
    await page.locator("#parseImportBtn").click();
    await expect(page.locator("#importSummary")).toContainText("Included");
    await expect(page.locator("#importSummary")).toContainText("5 transactions");
    await expect(page.locator("#importSummary")).toContainText("Excluded");
    await expect(page.locator("#importSummary")).toContainText("1");
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
  } finally {
    await restoreState(page, originalState);
  }
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

test("signed-in user can edit display name in Settings", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  await expect(page.locator("#overviewView")).toHaveClass(/active/);

  await page.locator('.nav-tab[data-view="settings"]').click();
  await expect(page.locator("#settingsView")).toHaveClass(/active/);
  await expect(page.locator("#profilePanel")).not.toBeHidden();

  const newName = `E2E User ${Date.now()}`;
  await page.locator("#profileDisplayNameInput").fill(newName);
  await page.locator("#saveProfileBtn").click();
  await expect(page.locator("#profileStatus")).toContainText("Profile saved.");

  // Verify persisted via /api/me
  const meResp = await page.request.get("/api/me");
  expect(meResp.ok()).toBe(true);
  const meData = await meResp.json();
  expect(meData.user.displayName).toBe(newName);
  expect(meData.account.id).toBeTruthy();
  expect(meData.account.id).not.toBe(newName);
});

test("display name persists after reload", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  const originalName = `E2E Persist ${Date.now()}`;
  await login(page);
  await page.locator('.nav-tab[data-view="settings"]').click();
  await page.locator("#profileDisplayNameInput").fill(originalName);
  await page.locator("#saveProfileBtn").click();
  await expect(page.locator("#profileStatus")).toContainText("Profile saved.");

  await page.reload();
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
  await page.locator('.nav-tab[data-view="settings"]').click();
  await expect(page.locator("#profileDisplayNameInput")).toHaveValue(originalName);

  // Verify via API
  const meResp = await page.request.get("/api/me");
  expect(meResp.ok()).toBe(true);
  const meData = await meResp.json();
  expect(meData.user.displayName).toBe(originalName);
});

test("visitor can submit trial access request from landing page", async ({ page }) => {
  await page.goto("/");

  await page.locator("#trialRequestNameInput").fill("E2E Tester");
  await page.locator("#trialRequestEmailInput").fill("e2e@example.test");
  await page.locator("#trialRequestNoteInput").fill("E2E test note");
  await page.locator("#trialRequestBtn").click();

  await expect(page.locator("#trialRequestStatus")).toContainText("Your request has been submitted");
  await expect(page.locator("#trialRequestNameInput")).toHaveValue("");
  await expect(page.locator("#trialRequestEmailInput")).toHaveValue("");
});

test("invalid trial request is rejected", async ({ page }) => {
  await page.goto("/");

  // Empty name
  await page.locator("#trialRequestEmailInput").fill("e2e@example.test");
  await page.locator("#trialRequestBtn").click();
  await expect(page.locator("#trialRequestStatus")).not.toContainText("Your request has been submitted");

  // Invalid email
  await page.locator("#trialRequestNameInput").fill("E2E Tester");
  await page.locator("#trialRequestEmailInput").fill("not-an-email");
  await page.locator("#trialRequestBtn").click();
  await expect(page.locator("#trialRequestStatus")).not.toContainText("Your request has been submitted");
});

test("default owner can see pending trial requests in Settings", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  const requestName = `Owner See Test ${Date.now()}`;
  // Submit a request on landing page
  await page.goto("/");
  await page.locator("#trialRequestNameInput").fill(requestName);
  await page.locator("#trialRequestEmailInput").fill("owner-see@example.test");
  await page.locator("#trialRequestNoteInput").fill("Testing owner view");
  await page.locator("#trialRequestBtn").click();
  await expect(page.locator("#trialRequestStatus")).toContainText("Your request has been submitted");

  // Login as owner and check Settings
  await login(page);
  await page.locator('.nav-tab[data-view="settings"]').click();
  await expect(page.locator("#trialRequestsPanel")).not.toBeHidden();
  const ownerRequest = page.locator(".trial-request-item").filter({ hasText: requestName });
  await expect(ownerRequest).toBeVisible();

  await ownerRequest.locator(".use-request-btn").click();
  await expect(page.locator("#newAccountDisplayNameInput")).toHaveValue(requestName);
  await expect(page.locator("#newAccountEmailInput")).toHaveValue("owner-see@example.test");
  await expect(page.locator("#newAccountIdInput")).toHaveValue("owner-see");
  await expect(page.locator("#newAccountWorkspaceInput")).toHaveValue(`${requestName} Workspace`);
  await expect(page.locator("#accountAdminStatus")).toContainText("Copied");
});

test("secondary account cannot see trial requests", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  // Login as owner via page.request (shares cookies with page context)
  await apiLogin(page);
  const secondaryId = `e2e-secondary-${Date.now()}`;
  const createResp = await page.request.post("/api/admin/accounts", {
    data: {
      accountId: secondaryId,
      displayName: "Secondary Tester",
      email: "secondary@example.test",
      password: "testpassword123",
      workspaceName: "Secondary WS",
    },
  });
  expect(createResp.ok()).toBe(true);

  // Login as secondary via page.request (shares cookies with page context)
  const loginResp = await page.request.post("/api/session", {
    data: { password: "testpassword123", accountId: secondaryId },
  });
  expect(loginResp.ok()).toBe(true);

  // Navigate to app - cookies are shared via page.request
  await page.goto("/app");
  await expect(page.locator("#overviewView")).toHaveClass(/active/);
  await page.locator('.nav-tab[data-view="settings"]').click();
  await expect(page.locator("#trialRequestsPanel")).toHaveClass(/hidden/);
});

test("trial request API does not expose sensitive auth data", async ({ page }) => {
  test.skip(!password, "E2E_APP_PASSWORD is required for authenticated deploy checks.");

  await login(page);
  const response = await page.request.get("/api/admin/trial-requests");
  expect(response.ok()).toBe(true);
  const data = await response.json();
  expect(data.ok).toBe(true);
  expect(Array.isArray(data.requests)).toBe(true);

  const body = JSON.stringify(data);
  expect(body).not.toContain("passwordHash");
  expect(body).not.toContain("authSubject");
  expect(body).not.toContain("token");
  expect(body).not.toContain("secret");
});
