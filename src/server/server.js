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
const WORKSPACE_REGISTRY_SEED_IDS = (process.env.WORKSPACE_REGISTRY_SEED_IDS || "")
  .split(",")
  .map((workspaceId) => workspaceId.trim())
  .filter(Boolean);
const DEFAULT_PORT = 5173;
const DEFAULT_HTTPS_PORT = 5443;
const AUTH_COOKIE = "family_budget_session";
const APP_PASSWORD = process.env.APP_PASSWORD || "";
const BUILD_VERSION = process.env.APP_BUILD_VERSION || "";
const BUILD_TIME = process.env.APP_BUILD_TIME || new Date().toISOString();
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || "";
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || "";
const REDIRECT_HTTP_TO_HTTPS = process.env.REDIRECT_HTTP_TO_HTTPS === "true";
const sessions = new Map();

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

function emptyAccountRegistry() {
  return {
    version: 1,
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
    createdAt: new Date().toISOString(),
  };
}

function ensureWorkspaceRecord(registry, workspaceId, name = workspaceId) {
  const id = normalizeWorkspaceId(workspaceId);
  if (!registry.workspaces[id]) {
    registry.workspaces[id] = registeredWorkspace(id, name);
  }
  return registry.workspaces[id];
}

function buildDefaultAccountRegistry() {
  const registry = emptyAccountRegistry();
  ensureWorkspaceRecord(registry, DEFAULT_WORKSPACE_ID, "Default Workspace");
  WORKSPACE_REGISTRY_SEED_IDS.forEach((workspaceId) => ensureWorkspaceRecord(registry, workspaceId));
  return registry;
}

async function readAccountRegistry() {
  try {
    const text = await fs.readFile(ACCOUNT_REGISTRY_PATH, "utf8");
    const registry = JSON.parse(text);
    registry.version = registry.version || 1;
    registry.accounts = registry.accounts || {};
    registry.workspaces = registry.workspaces || {};
    registry.memberships = Array.isArray(registry.memberships) ? registry.memberships : [];
    return registry;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return buildDefaultAccountRegistry();
}

async function writeAccountRegistry(registry) {
  await fs.mkdir(path.dirname(ACCOUNT_REGISTRY_PATH), { recursive: true });
  await fs.writeFile(ACCOUNT_REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
}

async function ensureAccountRegistry() {
  const registry = await readAccountRegistry();
  let changed = false;
  [DEFAULT_WORKSPACE_ID, ...WORKSPACE_REGISTRY_SEED_IDS].forEach((workspaceId) => {
    const id = normalizeWorkspaceId(workspaceId);
    if (!registry.workspaces[id]) {
      ensureWorkspaceRecord(registry, id, id === DEFAULT_WORKSPACE_ID ? "Default Workspace" : id);
      changed = true;
    }
  });
  if (changed || !fsSync.existsSync(ACCOUNT_REGISTRY_PATH)) {
    await writeAccountRegistry(registry);
  }
  return registry;
}

async function registeredWorkspaceId(workspaceId) {
  const id = normalizeWorkspaceId(workspaceId || DEFAULT_WORKSPACE_ID);
  const registry = await ensureAccountRegistry();
  if (!registry.workspaces[id]) {
    throw new AccountRegistryError("Workspace is not registered.", 403);
  }
  return id;
}

function sessionForRequest(req) {
  if (!APP_PASSWORD) return { workspaceId: DEFAULT_WORKSPACE_ID };
  const token = parseCookies(req)[AUTH_COOKIE];
  return token ? sessions.get(token) || null : null;
}

function workspaceIdForRequest(req) {
  // Real account sessions will resolve this from the user's workspace membership.
  return sessionForRequest(req)?.workspaceId || DEFAULT_WORKSPACE_ID;
}

function storePathForWorkspace(workspaceId) {
  if (!WORKSPACE_STORE_ROOT) return STORE_PATH;
  return path.join(WORKSPACE_STORE_ROOT, normalizeWorkspaceId(workspaceId), "budget-store.json");
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
  const session = {
    workspaceId: await registeredWorkspaceId(workspaceId),
    createdAt: new Date().toISOString(),
  };
  sessions.set(token, session);
  return { token, session };
}

function sessionCookie(token, maxAge = 60 * 60 * 24 * 14) {
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
    await ensureAccountRegistry();
    await ensureStoreFile();
    sendJson(res, 200, {
      ok: true,
      buildVersion: BUILD_VERSION,
      buildTime: BUILD_TIME,
      authEnabled: !!APP_PASSWORD,
    });
    return true;
  }

  if (pathname === "/api/session" && req.method === "GET") {
    const session = sessionForRequest(req);
    sendJson(res, 200, {
      authenticated: !APP_PASSWORD || !!session,
      authEnabled: !!APP_PASSWORD,
      workspaceId: session?.workspaceId || DEFAULT_WORKSPACE_ID,
    });
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
      { ok: true, authEnabled: true, workspaceId: created.session.workspaceId },
      sessionCookie(created.token),
    );
    return true;
  }

  if (pathname === "/api/session" && req.method === "DELETE") {
    const token = parseCookies(req)[AUTH_COOKIE];
    if (token) sessions.delete(token);
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
