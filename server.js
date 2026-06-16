const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const ROOT = __dirname;
const STORE_PATH = path.join(ROOT, "budget-store.json");
const DEFAULT_PORT = 5173;

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

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function readStore() {
  const text = await fs.readFile(STORE_PATH, "utf8");
  return JSON.parse(text);
}

async function writeStore(state) {
  await fs.writeFile(STORE_PATH, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

async function loadDefaultState() {
  const script = await fs.readFile(path.join(ROOT, "budget-data.js"), "utf8");
  const sandbox = { window: {} };
  Function("window", script)(sandbox.window);
  return sandbox.window.BUDGET_DATA.initialState;
}

async function serveApi(req, res, pathname) {
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

async function serveStatic(req, res, pathname) {
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

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    if (await serveApi(req, res, url.pathname)) return;
    await serveStatic(req, res, decodeURIComponent(url.pathname));
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Internal server error" });
  }
});

const port = Number(process.env.PORT) || DEFAULT_PORT;
const host = process.env.HOST || "127.0.0.1";
server.listen(port, host, () => {
  console.log(`Budget app running at http://${host}:${port}`);
});
