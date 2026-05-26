// Node HTTP wrapper for the TanStack Start fetch handler.
//
// The build produces dist/server/server.js as an ES module exporting a
// { fetch(request, env, ctx) } object — the same shape Cloudflare Workers expects.
// To run on plain Node we bridge Node's http server to that fetch handler.
//
// Usage (from /opt/hastkala/web):
//   node ../scripts/web-server.mjs        # uses PORT env (default 3000)
import http from "node:http";
import { Readable } from "node:stream";

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "127.0.0.1";

// Resolve handler relative to a stable known location.
// Allow override via WEB_HANDLER_PATH for non-default deploys.
const handlerPath = process.env.WEB_HANDLER_PATH || "/opt/hastkala/web/dist/server/server.js";
const handlerModule = await import("file://" + handlerPath);
const handler = handlerModule.default ?? handlerModule;
if (typeof handler.fetch !== "function") {
  console.error("dist/server/server.js does not export a fetch handler");
  process.exit(1);
}

function buildRequest(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host || `${HOST}:${PORT}`;
  const url = `${proto}://${host}${req.url}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else if (value != null) {
      headers.set(key, String(value));
    }
  }
  const init = { method: req.method, headers };
  if (!["GET", "HEAD"].includes(req.method.toUpperCase())) {
    init.body = Readable.toWeb(req);
    init.duplex = "half";
  }
  return new Request(url, init);
}

async function writeResponse(webResponse, res) {
  res.statusCode = webResponse.status;
  webResponse.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  if (webResponse.body) {
    const nodeStream = Readable.fromWeb(webResponse.body);
    nodeStream.pipe(res);
    nodeStream.on("error", (err) => {
      console.error("response stream error:", err);
      res.destroy(err);
    });
  } else {
    res.end();
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const request = buildRequest(req);
    const response = await handler.fetch(request, {}, {});
    await writeResponse(response, res);
  } catch (error) {
    console.error("[web-server] handler error:", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "text/plain; charset=utf-8");
    }
    res.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[web-server] listening on http://${HOST}:${PORT}`);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    console.log(`[web-server] received ${sig}, shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
