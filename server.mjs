import http from "node:http";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url));
const tracks = [
  { id: "night-drive", title: "Night Drive", artist: "Backstage Sessions" },
  { id: "first-light", title: "First Light", artist: "Backstage Sessions" },
];
export function createServer(dataDir = path.join(root, "data")) {
  const json = (res, status, body) => {
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(body));
  };
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      if (req.method === "GET" && url.pathname === "/api/health")
        return json(res, 200, { status: "ok", version: "0.1.0" });
      if (req.method === "GET" && url.pathname === "/api/tracks")
        return json(res, 200, tracks);
      if (req.method === "GET" && url.pathname === "/api/encore")
        return json(res, 200, {
          title: "Encore: Moonrise",
          artist: "Backstage Sessions",
        });
      const session = url.pathname.match(
        /^\/api\/sessions\/([a-zA-Z0-9-]{1,80})$/,
      );
      if (session && req.method === "GET") {
        try {
          return json(
            res,
            200,
            JSON.parse(
              await readFile(path.join(dataDir, session[1] + ".json"), "utf8"),
            ),
          );
        } catch (e) {
          if (e.code === "ENOENT")
            return json(res, 404, { error: "NOT_FOUND" });
          throw e;
        }
      }
      if (
        req.method === "POST" &&
        (session || url.pathname === "/api/events")
      ) {
        let body = "";
        for await (const chunk of req) {
          body += chunk;
          if (Buffer.byteLength(body) > 1048576)
            return json(res, 413, { error: "TOO_LARGE" });
        }
        let value;
        try {
          value = JSON.parse(body);
        } catch {
          return json(res, 400, { error: "INVALID_JSON" });
        }
        if (session) {
          if (value.id !== session[1] || !Array.isArray(value.missions))
            return json(res, 422, { error: "INVALID_SESSION" });
          await mkdir(dataDir, { recursive: true });
          const target = path.join(dataDir, session[1] + ".json");
          const temp = target + "." + crypto.randomUUID() + ".tmp";
          await writeFile(temp, JSON.stringify(value, null, 2));
          await rename(temp, target);
          return json(res, 200, {
            saved: true,
            receivedAt: new Date().toISOString(),
          });
        }
        if (
          value.type !== "play" ||
          typeof value.visitorId !== "string" ||
          !value.visitorId.trim() ||
          !tracks.some((t) => t.id === value.trackId)
        )
          return json(res, 422, { accepted: false, error: "INVALID_EVENT" });
        return json(res, 202, {
          accepted: true,
          receiptId: crypto.randomUUID(),
        });
      }
      if (req.method !== "GET")
        return json(res, 405, { error: "METHOD_NOT_ALLOWED" });
      const file = path.resolve(
        root,
        "public",
        "." +
          decodeURIComponent(
            url.pathname === "/" ? "/index.html" : url.pathname,
          ),
      );
      if (!file.startsWith(path.join(root, "public") + path.sep))
        return json(res, 403, { error: "FORBIDDEN" });
      try {
        const content = await readFile(file);
        res.writeHead(200, {
          "Content-Type":
            {
              ".html": "text/html",
              ".js": "text/javascript",
              ".css": "text/css",
              ".json": "application/json",
            }[path.extname(file)] + "; charset=utf-8",
          "Cache-Control": "no-store",
        });
        res.end(content);
      } catch (e) {
        if (e.code === "ENOENT") return json(res, 404, { error: "NOT_FOUND" });
        throw e;
      }
    } catch {
      if (!res.headersSent) json(res, 500, { error: "SERVER_ERROR" });
      else res.end();
    }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  createServer().listen(
    Number(process.env.PORT) || 3000,
    process.env.HOST || "127.0.0.1",
    () =>
      console.log("Backstage: http://localhost:" + (process.env.PORT || 3000)),
  );
