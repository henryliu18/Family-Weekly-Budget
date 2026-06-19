const http = require("http");
const https = require("https");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const STORE_PATH = path.join(ROOT, "budget-store.json");
const DEFAULT_PORT = 5173;
const DEFAULT_HTTPS_PORT = 5443;
const AUTH_COOKIE = "family_budget_session";
const APP_PASSWORD = process.env.APP_PASSWORD || "";
const BUILD_VERSION = process.env.APP_BUILD_VERSION || "";
const BUILD_TIME = process.env.APP_BUILD_TIME || new Date().toISOString();
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || "";
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || "";
const REDIRECT_HTTP_TO_HTTPS = process.env.REDIRECT_HTTP_TO_HTTPS === "true";
const sessions = new Set();

class StorePathError extends Error {
  constructor(message) {
    super(message);
    this.name = "StorePathError";
  }
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
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

async function readStore() {
  await ensureStoreFile();
  const text = await fs.readFile(STORE_PATH, "utf8");
  return JSON.parse(text);
}

async function writeStore(state) {
  await ensureStoreFile();
  await fs.writeFile(STORE_PATH, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

async function loadDefaultState() {
  const script = await fs.readFile(path.join(ROOT, "budget-data.js"), "utf8");
  const sandbox = { window: {} };
  Function("window", script)(sandbox.window);
  return sandbox.window.BUDGET_DATA.initialState;
}

async function ensureStoreFile() {
  try {
    const stats = await fs.stat(STORE_PATH);
    if (stats.isDirectory()) {
      throw new StorePathError(
        "budget-store.json is a directory. Replace it with a JSON file before starting the app.",
      );
    }
    return;
  } catch (error) {
    if (error instanceof StorePathError) throw error;
    if (error.code !== "ENOENT") throw error;
  }

  const state = await loadDefaultState();
  await fs.writeFile(STORE_PATH, `${JSON.stringify(state, null, 2)}\n`, "utf8");
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
  const token = parseCookies(req)[AUTH_COOKIE];
  return !!token && sessions.has(token);
}

function authRequired(res) {
  sendJson(res, 401, { error: "Authentication required" });
}

function createSessionToken() {
  return crypto.randomBytes(24).toString("hex");
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

  if (pathname === "/api/session" && req.method === "GET") {
    sendJson(res, 200, {
      authenticated: isAuthenticated(req),
      authEnabled: !!APP_PASSWORD,
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
    const token = createSessionToken();
    sessions.add(token);
    sendJsonWithCookie(res, 200, { ok: true, authEnabled: true }, sessionCookie(token));
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
    sendJson(res, 200, await readStore());
    return true;
  }

  if (pathname === "/api/state" && req.method === "POST") {
    const body = await readBody(req);
    const state = JSON.parse(body);
    await writeStore(state);
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (pathname === "/api/reset" && req.method === "POST") {
    const state = await loadDefaultState();
    await writeStore(state);
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

  const requested = pathname === "/" ? "/index.html" : pathname;
  const resolved = path.normalize(path.join(ROOT, requested));

  if (!resolved.startsWith(ROOT)) {
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
