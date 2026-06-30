const http = require("http");
const https = require("https");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = process.env.APP_ROOT || path.resolve(__dirname, "..", "..");
const PUBLIC_ROOT = process.env.PUBLIC_ROOT || path.join(ROOT, "src", "public");
const STORE_PATH = process.env.STORE_PATH || path.join(ROOT, "budget-store.json");
const WORKSPACE_STORE_ROOT = process.env.WORKSPACE_STORE_ROOT || "";
const DEFAULT_WORKSPACE_ID = process.env.DEFAULT_WORKSPACE_ID || "default";
const ACCOUNT_REGISTRY_PATH =
  process.env.ACCOUNT_REGISTRY_PATH ||
  path.join(WORKSPACE_STORE_ROOT || path.dirname(STORE_PATH), "account-registry.json");
const SESSION_REGISTRY_PATH =
  process.env.SESSION_REGISTRY_PATH ||
  path.join(WORKSPACE_STORE_ROOT || path.dirname(STORE_PATH), "session-registry.json");
const WORKSPACE_REGISTRY_SEED_IDS = (process.env.WORKSPACE_REGISTRY_SEED_IDS || "")
  .split(",")
  .map((workspaceId) => workspaceId.trim())
  .filter(Boolean);
const WORKSPACE_REGISTRY_UNOWNED_SEED_IDS = (process.env.WORKSPACE_REGISTRY_UNOWNED_SEED_IDS || "")
  .split(",")
  .map((workspaceId) => workspaceId.trim())
  .filter(Boolean);
const ACCOUNT_REGISTRY_SCHEMA_VERSION = 1;
const SESSION_REGISTRY_SCHEMA_VERSION = 1;
const DEFAULT_ACCOUNT_ID = process.env.DEFAULT_ACCOUNT_ID || "default-owner";
const DEFAULT_ACCOUNT_DISPLAY_NAME = process.env.DEFAULT_ACCOUNT_DISPLAY_NAME || "Default Owner";
const DEFAULT_ACCOUNT_EMAIL = process.env.DEFAULT_ACCOUNT_EMAIL || "";
const DEFAULT_AUTH_PROVIDER = process.env.DEFAULT_AUTH_PROVIDER || "password";
const DEFAULT_AUTH_SUBJECT = process.env.DEFAULT_AUTH_SUBJECT || DEFAULT_ACCOUNT_ID;
const DEFAULT_PORT = 5173;
const DEFAULT_HTTPS_PORT = 5443;
const AUTH_COOKIE = "family_budget_session";
const APP_PASSWORD = process.env.APP_PASSWORD || "";
const BUILD_VERSION = process.env.APP_BUILD_VERSION || "";
const BUILD_TIME = process.env.APP_BUILD_TIME || new Date().toISOString();
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || "";
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || "";
const REDIRECT_HTTP_TO_HTTPS = process.env.REDIRECT_HTTP_TO_HTTPS === "true";
const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 60 * 60 * 24 * 14);
const sessions = new Map();
let sessionRegistryWriteQueue = Promise.resolve();

class StorePathError extends Error {
  constructor(message) {
    super(message);
    this.name = "StorePathError";
  }
}

class AccountRegistryError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "AccountRegistryError";
    this.status = status;
  }
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

function sendJson(res, status, value) {
  const body = JSON.stringify(value, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(body);
}

function sendText(res, status, value) {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(value);
}

function sendEmpty(res, status, headers = {}) {
  res.writeHead(status, headers);
  res.end();
}

function nowIso() {
  return new Date().toISOString();
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function normalizeWorkspaceId(workspaceId) {
  const value = String(workspaceId || "").trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
    throw new StorePathError("Workspace id contains unsupported characters.");
  }
  return value;
}

function normalizeWorkspaceName(name) {
  const value = String(name || "").trim().replace(/\s+/g, " ");
  if (value.length < 2 || value.length > 80) {
    throw new AccountRegistryError("Workspace name must be between 2 and 80 characters.", 400);
  }
  return value;
}

function workspaceSlugFromName(name) {
  const slug = normalizeWorkspaceName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return slug || "workspace";
}

function emptyAccountRegistry() {
  return {
    version: ACCOUNT_REGISTRY_SCHEMA_VERSION,
    accounts: {},
    workspaces: {},
    memberships: [],
  };
}

function registeredWorkspace(workspaceId, name = workspaceId) {
  const id = normalizeWorkspaceId(workspaceId);
  return {
    id,
    name,
    createdAt: nowIso(),
  };
}

function registeredAccount(accountId, displayName = accountId) {
  const id = normalizeWorkspaceId(accountId);
  const now = nowIso();
  return {
    id,
    userId: id,
    displayName,
    email: id === DEFAULT_ACCOUNT_ID ? DEFAULT_ACCOUNT_EMAIL || null : null,
    authProvider: DEFAULT_AUTH_PROVIDER,
    authSubject: id === DEFAULT_ACCOUNT_ID ? DEFAULT_AUTH_SUBJECT : id,
    isDefaultUser: id === DEFAULT_ACCOUNT_ID,
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeAccountRecord(account, accountId) {
  const id = normalizeWorkspaceId(account?.id || accountId);
  const provider = account?.authProvider || DEFAULT_AUTH_PROVIDER;
  const now = nowIso();
  return {
    ...account,
    id,
    userId: account?.userId || id,
    displayName: account?.displayName || id,
    email: account?.email || null,
    authProvider: provider,
    authSubject: account?.authSubject || (id === DEFAULT_ACCOUNT_ID ? DEFAULT_AUTH_SUBJECT : id),
    isDefaultUser: account?.isDefaultUser ?? id === DEFAULT_ACCOUNT_ID,
    createdAt: account?.createdAt || now,
    updatedAt: account?.updatedAt || now,
  };
}

function ensureAccountRecord(registry, accountId, displayName = accountId) {
  const id = normalizeWorkspaceId(accountId);
  if (!registry.accounts[id]) {
    registry.accounts[id] = registeredAccount(id, displayName);
  } else {
    registry.accounts[id] = normalizeAccountRecord(registry.accounts[id], id);
  }
  return registry.accounts[id];
}

function ensureWorkspaceRecord(registry, workspaceId, name = workspaceId) {
  const id = normalizeWorkspaceId(workspaceId);
  if (!registry.workspaces[id]) {
    registry.workspaces[id] = registeredWorkspace(id, name);
  }
  return registry.workspaces[id];
}

function hasMembership(registry, accountId, workspaceId) {
  return registry.memberships.some(
    (membership) =>
      membership.accountId === accountId &&
      membership.workspaceId === workspaceId,
  );
}

function ensureMembershipRecord(registry, accountId, workspaceId, role = "owner") {
  if (!hasMembership(registry, accountId, workspaceId)) {
    registry.memberships.push({
      accountId,
      workspaceId,
      role,
      createdAt: nowIso(),
    });
  }
}

function ensureDefaultIdentity(registry) {
  const account = ensureAccountRecord(registry, DEFAULT_ACCOUNT_ID, DEFAULT_ACCOUNT_DISPLAY_NAME);
  [DEFAULT_WORKSPACE_ID, ...WORKSPACE_REGISTRY_SEED_IDS].forEach((workspaceId) => {
    const workspace = ensureWorkspaceRecord(
      registry,
      workspaceId,
      workspaceId === DEFAULT_WORKSPACE_ID ? "Default Workspace" : workspaceId,
    );
    ensureMembershipRecord(registry, account.id, workspace.id, "owner");
  });
}

function buildDefaultAccountRegistry() {
  const registry = emptyAccountRegistry();
  ensureDefaultIdentity(registry);
  WORKSPACE_REGISTRY_UNOWNED_SEED_IDS.forEach((workspaceId) => ensureWorkspaceRecord(registry, workspaceId));
  return registry;
}

async function readAccountRegistry() {
  try {
    const text = await fs.readFile(ACCOUNT_REGISTRY_PATH, "utf8");
    const registry = JSON.parse(text);
    registry.version = registry.version || ACCOUNT_REGISTRY_SCHEMA_VERSION;
    if (registry.version > ACCOUNT_REGISTRY_SCHEMA_VERSION) {
      throw new AccountRegistryError("Account registry schema is newer than this server supports.", 500);
    }
    registry.accounts = registry.accounts || {};
    Object.entries(registry.accounts).forEach(([accountId, account]) => {
      registry.accounts[accountId] = normalizeAccountRecord(account, accountId);
    });
    registry.workspaces = registry.workspaces || {};
    registry.memberships = Array.isArray(registry.memberships) ? registry.memberships : [];
    return registry;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return buildDefaultAccountRegistry();
}

function registryHealthSummary(registry, session = null) {
  const defaultOwnerExists = !!registry.accounts[DEFAULT_ACCOUNT_ID];
  const defaultAccount = registry.accounts[DEFAULT_ACCOUNT_ID] || {};
  const defaultWorkspaceExists = !!registry.workspaces[DEFAULT_WORKSPACE_ID];
  const defaultMembershipExists = hasMembership(registry, DEFAULT_ACCOUNT_ID, DEFAULT_WORKSPACE_ID);
  const identityProviderCount = new Set(
    Object.values(registry.accounts)
      .map((account) => account.authProvider)
      .filter(Boolean),
  ).size;

  return {
    schemaVersion: registry.version,
    accountCount: Object.keys(registry.accounts).length,
    workspaceCount: Object.keys(registry.workspaces).length,
    membershipCount: registry.memberships.length,
    identityProviderCount,
    defaultOwnerExists,
    defaultUserIdentityReady: !!(
      defaultAccount.userId &&
      defaultAccount.displayName &&
      defaultAccount.authProvider &&
      defaultAccount.authSubject &&
      defaultAccount.createdAt &&
      defaultAccount.updatedAt
    ),
    defaultWorkspaceExists,
    defaultMembershipExists,
    workspaceStoreRootConfigured: !!WORKSPACE_STORE_ROOT,
    currentUserId: session?.accountId || null,
    currentWorkspaceId: session?.workspaceId || null,
  };
}

function publicUserIdentity(account) {
  return {
    id: account.id,
    userId: account.userId || account.id,
    displayName: account.displayName,
    email: account.email || null,
    authProvider: account.authProvider,
    isDefaultUser: !!account.isDefaultUser,
  };
}

function emptySessionRegistry() {
  return {
    version: SESSION_REGISTRY_SCHEMA_VERSION,
    sessions: {},
  };
}

function sessionTokenHash(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}

function sessionExpiresAt(createdAt) {
  return new Date(new Date(createdAt).getTime() + SESSION_TTL_SECONDS * 1000).toISOString();
}

function isSessionExpired(session, at = Date.now()) {
  return !session?.expiresAt || new Date(session.expiresAt).getTime() <= at;
}

function normalizeSessionRecord(record, tokenHash) {
  const createdAt = record?.createdAt || nowIso();
  return {
    id: record?.id || tokenHash,
    tokenHash,
    accountId: record?.accountId || DEFAULT_ACCOUNT_ID,
    workspaceId: record?.workspaceId || DEFAULT_WORKSPACE_ID,
    createdAt,
    lastSeenAt: record?.lastSeenAt || createdAt,
    expiresAt: record?.expiresAt || sessionExpiresAt(createdAt),
  };
}

async function readSessionRegistry() {
  try {
    const text = await fs.readFile(SESSION_REGISTRY_PATH, "utf8");
    const registry = JSON.parse(text);
    registry.version = registry.version || SESSION_REGISTRY_SCHEMA_VERSION;
    if (registry.version > SESSION_REGISTRY_SCHEMA_VERSION) {
      throw new AccountRegistryError("Session registry schema is newer than this server supports.", 500);
    }
    registry.sessions = registry.sessions || {};
    return registry;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return emptySessionRegistry();
}

async function writeSessionRegistry() {
  const registry = emptySessionRegistry();
  sessions.forEach((session, tokenHash) => {
    registry.sessions[tokenHash] = {
      ...session,
      tokenHash,
    };
  });
  await fs.mkdir(path.dirname(SESSION_REGISTRY_PATH), { recursive: true });
  await fs.writeFile(SESSION_REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
}

function scheduleSessionRegistryWrite() {
  sessionRegistryWriteQueue = sessionRegistryWriteQueue
    .then(() => writeSessionRegistry())
    .catch((error) => {
      console.error("Failed to write session registry", error);
    });
  return sessionRegistryWriteQueue;
}

async function loadSessionRegistry() {
  const registry = await readSessionRegistry();
  const now = Date.now();
  let changed = false;
  sessions.clear();
  Object.entries(registry.sessions).forEach(([tokenHash, record]) => {
    const session = normalizeSessionRecord(record, tokenHash);
    if (isSessionExpired(session, now)) {
      changed = true;
      return;
    }
    sessions.set(tokenHash, session);
    if (JSON.stringify(session) !== JSON.stringify(record)) changed = true;
  });
  if (changed || !fsSync.existsSync(SESSION_REGISTRY_PATH)) {
    await writeSessionRegistry();
  }
}

function sessionRegistrySummary() {
  return {
    schemaVersion: SESSION_REGISTRY_SCHEMA_VERSION,
    activeSessionCount: sessions.size,
    ttlSeconds: SESSION_TTL_SECONDS,
    tokenStorage: "sha256",
    persistent: true,
  };
}

async function writeAccountRegistry(registry) {
  await fs.mkdir(path.dirname(ACCOUNT_REGISTRY_PATH), { recursive: true });
  await fs.writeFile(ACCOUNT_REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
}

async function ensureAccountRegistry() {
  const registry = await readAccountRegistry();
  const before = JSON.stringify(registry);
  ensureDefaultIdentity(registry);
  WORKSPACE_REGISTRY_UNOWNED_SEED_IDS.forEach((workspaceId) => ensureWorkspaceRecord(registry, workspaceId));
  const changed = before !== JSON.stringify(registry);
  if (changed || !fsSync.existsSync(ACCOUNT_REGISTRY_PATH)) {
    await writeAccountRegistry(registry);
  }
  return registry;
}

async function registeredWorkspaceIdForAccount(accountId, workspaceId) {
  const account = normalizeWorkspaceId(accountId || DEFAULT_ACCOUNT_ID);
  const id = normalizeWorkspaceId(workspaceId || DEFAULT_WORKSPACE_ID);
  const registry = await ensureAccountRegistry();
  if (!registry.accounts[account]) {
    throw new AccountRegistryError("Account is not registered.", 403);
  }
  if (!registry.workspaces[id]) {
    throw new AccountRegistryError("Workspace is not registered.", 403);
  }
  if (!hasMembership(registry, account, id)) {
    throw new AccountRegistryError("Account is not a member of this workspace.", 403);
  }
  return id;
}

async function accountReadModelForSession(session) {
  if (!session) {
    throw new AccountRegistryError("Authentication required", 401);
  }
  const registry = await ensureAccountRegistry();
  const account = registry.accounts[session.accountId];
  if (!account) {
    throw new AccountRegistryError("Account is not registered.", 403);
  }

  const memberships = registry.memberships.filter(
    (membership) => membership.accountId === account.id,
  );
  const workspaces = memberships
    .map((membership) => {
      const workspace = registry.workspaces[membership.workspaceId];
      if (!workspace) return null;
      return {
        id: workspace.id,
        name: workspace.name,
        role: membership.role,
      };
    })
    .filter(Boolean);
  const currentWorkspace =
    workspaces.find((workspace) => workspace.id === session.workspaceId) || null;
  const user = publicUserIdentity(account);

  return {
    user,
    account: {
      ...user,
    },
    currentWorkspace,
    workspaces,
  };
}

function uniqueWorkspaceId(registry, name) {
  const base = workspaceSlugFromName(name);
  let candidate = base;
  let index = 2;
  while (registry.workspaces[candidate]) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  return normalizeWorkspaceId(candidate);
}

async function ensureFreshWorkspaceStore(workspaceId) {
  const storePath = storePathForWorkspace(workspaceId);
  try {
    await fs.stat(storePath);
    return;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const state = await loadDefaultState();
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

async function createWorkspaceForSession(session, name) {
  if (!session) {
    throw new AccountRegistryError("Authentication required", 401);
  }
  const registry = await ensureAccountRegistry();
  const account = registry.accounts[session.accountId];
  if (!account) {
    throw new AccountRegistryError("Account is not registered.", 403);
  }

  const workspaceName = normalizeWorkspaceName(name);
  const workspaceId = uniqueWorkspaceId(registry, workspaceName);
  const workspace = ensureWorkspaceRecord(registry, workspaceId, workspaceName);
  ensureMembershipRecord(registry, account.id, workspace.id, "owner");
  await ensureFreshWorkspaceStore(workspace.id);
  await writeAccountRegistry(registry);

  return {
    id: workspace.id,
    name: workspace.name,
    role: "owner",
  };
}

function sessionForRequest(req) {
  if (!APP_PASSWORD) return { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID };
  const token = parseCookies(req)[AUTH_COOKIE];
  if (!token) return null;
  const tokenHash = sessionTokenHash(token);
  const session = sessions.get(tokenHash);
  if (!session) return null;
  if (isSessionExpired(session)) {
    sessions.delete(tokenHash);
    scheduleSessionRegistryWrite();
    return null;
  }
  session.lastSeenAt = nowIso();
  sessions.set(tokenHash, session);
  scheduleSessionRegistryWrite();
  return session;
}

async function userForSession(session) {
  if (!session) return null;
  const registry = await ensureAccountRegistry();
  const account = registry.accounts[session.accountId];
  if (!account) return null;
  return {
    ...publicUserIdentity(account),
  };
}

async function switchSessionWorkspace(req, workspaceId) {
  if (!APP_PASSWORD) {
    return { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID };
  }
  const session = sessionForRequest(req);
  if (!session) {
    throw new AccountRegistryError("Authentication required", 401);
  }
  session.workspaceId = await registeredWorkspaceIdForAccount(session.accountId, workspaceId);
  session.lastSeenAt = nowIso();
  scheduleSessionRegistryWrite();
  return session;
}

function workspaceIdForRequest(req) {
  // Real account sessions will resolve this from the user's workspace membership.
  return sessionForRequest(req)?.workspaceId || DEFAULT_WORKSPACE_ID;
}

function storePathForWorkspace(workspaceId) {
  const id = normalizeWorkspaceId(workspaceId);
  if (WORKSPACE_STORE_ROOT) return path.join(WORKSPACE_STORE_ROOT, id, "budget-store.json");
  if (id === DEFAULT_WORKSPACE_ID) return STORE_PATH;
  return path.join(path.dirname(STORE_PATH), "workspace-stores", id, "budget-store.json");
}

async function readBudgetState(workspaceId) {
  const storePath = storePathForWorkspace(workspaceId);
  await ensureStoreFile(storePath);
  const text = await fs.readFile(storePath, "utf8");
  return JSON.parse(text);
}

async function writeBudgetState(workspaceId, state) {
  const storePath = storePathForWorkspace(workspaceId);
  await ensureStoreFile(storePath);
  await fs.writeFile(storePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

async function loadDefaultState() {
  const script = await fs.readFile(path.join(PUBLIC_ROOT, "budget-data.js"), "utf8");
  const sandbox = { window: {} };
  Function("window", script)(sandbox.window);
  return sandbox.window.BUDGET_DATA.initialState;
}

async function loadSeedState(storePath) {
  if (path.resolve(storePath) !== path.resolve(STORE_PATH)) {
    try {
      const stats = await fs.stat(STORE_PATH);
      if (!stats.isDirectory()) {
        return JSON.parse(await fs.readFile(STORE_PATH, "utf8"));
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return loadDefaultState();
}

async function ensureStoreFile(storePath = storePathForWorkspace(DEFAULT_WORKSPACE_ID)) {
  try {
    const stats = await fs.stat(storePath);
    if (stats.isDirectory()) {
      throw new StorePathError(
        `${path.basename(storePath)} is a directory. Replace it with a JSON file before starting the app.`,
      );
    }
    return;
  } catch (error) {
    if (error instanceof StorePathError) throw error;
    if (error.code !== "ENOENT") throw error;
  }

  const state = await loadSeedState(storePath);
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        if (index < 0) return [part, ""];
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

function isAuthenticated(req) {
  if (!APP_PASSWORD) return true;
  return !!sessionForRequest(req);
}

function authRequired(res) {
  sendJson(res, 401, { error: "Authentication required" });
}

function createSessionToken() {
  return crypto.randomBytes(24).toString("hex");
}

async function createSession(workspaceId) {
  const token = createSessionToken();
  const tokenHash = sessionTokenHash(token);
  const createdAt = nowIso();
  const session = {
    id: tokenHash,
    tokenHash,
    accountId: DEFAULT_ACCOUNT_ID,
    workspaceId: await registeredWorkspaceIdForAccount(DEFAULT_ACCOUNT_ID, workspaceId),
    createdAt,
    lastSeenAt: createdAt,
    expiresAt: sessionExpiresAt(createdAt),
  };
  sessions.set(tokenHash, session);
  await writeSessionRegistry();
  return { token, session };
}

function sessionCookie(token, maxAge = SESSION_TTL_SECONDS) {
  const parts = [
    `${AUTH_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  return parts.join("; ");
}

async function serveApi(req, res, pathname) {
  if (pathname === "/api/meta" && req.method === "GET") {
    sendJson(res, 200, {
      buildVersion: BUILD_VERSION,
      buildTime: BUILD_TIME,
      authEnabled: !!APP_PASSWORD,
    });
    return true;
  }

  if (pathname === "/api/health" && req.method === "GET") {
    const registry = await ensureAccountRegistry();
    await ensureStoreFile();
    sendJson(res, 200, {
      ok: true,
      buildVersion: BUILD_VERSION,
      buildTime: BUILD_TIME,
      authEnabled: !!APP_PASSWORD,
      registry: registryHealthSummary(registry),
      sessions: sessionRegistrySummary(),
      storage: {
        workspaceStoreRootConfigured: !!WORKSPACE_STORE_ROOT,
        defaultWorkspaceId: DEFAULT_WORKSPACE_ID,
      },
    });
    return true;
  }

  if (pathname === "/api/admin/registry/diagnostics" && req.method === "GET") {
    const session = sessionForRequest(req);
    if (!session) {
      authRequired(res);
      return true;
    }
    const registry = await ensureAccountRegistry();
    sendJson(res, 200, {
      ok: true,
      registry: registryHealthSummary(registry, session),
      sessions: sessionRegistrySummary(),
    });
    return true;
  }

  if (pathname === "/api/session" && req.method === "GET") {
    const session = sessionForRequest(req);
    const user = await userForSession(session);
    sendJson(res, 200, {
      authenticated: !APP_PASSWORD || !!session,
      authEnabled: !!APP_PASSWORD,
      accountId: session?.accountId || DEFAULT_ACCOUNT_ID,
      user,
      workspaceId: session?.workspaceId || DEFAULT_WORKSPACE_ID,
    });
    return true;
  }

  if (pathname === "/api/me" && req.method === "GET") {
    const session = sessionForRequest(req);
    if (!session) {
      authRequired(res);
      return true;
    }
    sendJson(res, 200, await accountReadModelForSession(session));
    return true;
  }

  if (pathname === "/api/session" && req.method === "POST") {
    const body = JSON.parse((await readBody(req)) || "{}");
    if (!APP_PASSWORD) {
      sendJson(res, 200, { ok: true, authEnabled: false });
      return true;
    }
    if ((body.password || "") !== APP_PASSWORD) {
      sendJson(res, 401, { error: "Invalid password" });
      return true;
    }
    let created;
    try {
      created = await createSession(body.workspaceId);
    } catch (error) {
      if (error instanceof StorePathError || error instanceof AccountRegistryError) {
        sendJson(res, error.status || 400, { error: error.message });
        return true;
      }
      throw error;
    }
    sendJsonWithCookie(
      res,
      200,
      {
        ok: true,
        authEnabled: true,
        accountId: created.session.accountId,
        user: await userForSession(created.session),
        workspaceId: created.session.workspaceId,
      },
      sessionCookie(created.token),
    );
    return true;
  }

  if (pathname === "/api/session/workspace" && req.method === "POST") {
    const body = JSON.parse((await readBody(req)) || "{}");
    try {
      const session = await switchSessionWorkspace(req, body.workspaceId);
      sendJson(res, 200, {
        ok: true,
        accountId: session.accountId,
        user: await userForSession(session),
        workspaceId: session.workspaceId,
      });
    } catch (error) {
      if (error instanceof StorePathError || error instanceof AccountRegistryError) {
        sendJson(res, error.status || 400, { error: error.message });
        return true;
      }
      throw error;
    }
    return true;
  }

  if (pathname === "/api/workspaces" && req.method === "GET") {
    try {
      const model = await accountReadModelForSession(sessionForRequest(req));
      sendJson(res, 200, {
        currentWorkspace: model.currentWorkspace,
        workspaces: model.workspaces,
      });
    } catch (error) {
      if (error instanceof AccountRegistryError) {
        sendJson(res, error.status || 400, { error: error.message });
        return true;
      }
      throw error;
    }
    return true;
  }

  if (pathname === "/api/workspaces" && req.method === "POST") {
    const body = JSON.parse((await readBody(req)) || "{}");
    try {
      const workspace = await createWorkspaceForSession(sessionForRequest(req), body.name);
      sendJson(res, 201, { ok: true, workspace });
    } catch (error) {
      if (error instanceof StorePathError || error instanceof AccountRegistryError) {
        sendJson(res, error.status || 400, { error: error.message });
        return true;
      }
      throw error;
    }
    return true;
  }

  if (pathname === "/api/session" && req.method === "DELETE") {
    const token = parseCookies(req)[AUTH_COOKIE];
    if (token) {
      sessions.delete(sessionTokenHash(token));
      await writeSessionRegistry();
    }
    sendEmpty(res, 204, {
      "set-cookie": sessionCookie("", 0),
      "cache-control": "no-store",
    });
    return true;
  }

  if (
    ["/api/state", "/api/reset"].includes(pathname) &&
    !isAuthenticated(req)
  ) {
    authRequired(res);
    return true;
  }

  if (pathname === "/api/state" && req.method === "GET") {
    sendJson(res, 200, await readBudgetState(workspaceIdForRequest(req)));
    return true;
  }

  if (pathname === "/api/state" && req.method === "POST") {
    const body = await readBody(req);
    const state = JSON.parse(body);
    await writeBudgetState(workspaceIdForRequest(req), state);
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (pathname === "/api/reset" && req.method === "POST") {
    const state = await loadDefaultState();
    await writeBudgetState(workspaceIdForRequest(req), state);
    sendJson(res, 200, state);
    return true;
  }

  return false;
}

function sendJsonWithCookie(res, status, value, cookie) {
  const body = JSON.stringify(value, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "set-cookie": cookie,
  });
  res.end(body);
}

async function serveStatic(req, res, pathname) {
  if (pathname === "/budget-store.json") {
    sendText(res, 403, "Forbidden");
    return;
  }

  let requested = pathname;
  if (pathname === "/") requested = "/landing.html";
  else if (pathname === "/app" || pathname === "/app/") requested = "/index.html";
  const resolved = path.normalize(path.join(PUBLIC_ROOT, requested));

  if (path.relative(PUBLIC_ROOT, resolved).startsWith("..")) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    res.writeHead(200, {
      "content-type": mimeTypes[ext] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendText(res, 404, "Not found");
      return;
    }
    throw error;
  }
}

async function handleRequest(req, res) {
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    if (await serveApi(req, res, url.pathname)) return;
    await serveStatic(req, res, decodeURIComponent(url.pathname));
  } catch (error) {
    console.error(error);
    if (error instanceof StorePathError) {
      sendJson(res, 500, { error: error.message });
      return;
    }
    if (error instanceof AccountRegistryError) {
      sendJson(res, error.status || 500, { error: error.message });
      return;
    }
    sendJson(res, 500, { error: "Internal server error" });
  }
}

function redirectToHttps(req, res) {
  const hostHeader = req.headers.host || "";
  const hostName = hostHeader.split(":")[0];
  const location = `https://${hostName}${req.url || "/"}`;
  res.writeHead(308, {
    location,
    "cache-control": "no-store",
  });
  res.end();
}

const port = Number(process.env.PORT) || DEFAULT_PORT;
const httpsPort = Number(process.env.HTTPS_PORT) || DEFAULT_HTTPS_PORT;
const host = process.env.HOST || "127.0.0.1";
const server = http.createServer(REDIRECT_HTTP_TO_HTTPS ? redirectToHttps : handleRequest);

async function start() {
  try {
    await ensureStoreFile();
    await loadSessionRegistry();
  } catch (error) {
    console.error(error.message || error);
  }

  server.listen(port, host, () => {
    const mode = REDIRECT_HTTP_TO_HTTPS ? "redirecting HTTP to HTTPS" : `running at http://${host}:${port}`;
    console.log(`Budget app ${mode}`);
  });

  if (SSL_CERT_PATH && SSL_KEY_PATH && fsSync.existsSync(SSL_CERT_PATH) && fsSync.existsSync(SSL_KEY_PATH)) {
    const httpsOptions = {
      cert: fsSync.readFileSync(SSL_CERT_PATH),
      key: fsSync.readFileSync(SSL_KEY_PATH),
    };
    const httpsServer = https.createServer(httpsOptions, handleRequest);
    httpsServer.listen(httpsPort, host, () => {
      console.log(`Budget app running at https://${host}:${httpsPort}`);
    });
  } else if (SSL_CERT_PATH || SSL_KEY_PATH) {
    console.warn("HTTPS certificate/key not found. Starting HTTP only.");
  }
}

start();
