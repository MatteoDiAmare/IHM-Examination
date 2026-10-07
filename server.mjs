import http from "node:http";
import { randomUUID } from "node:crypto";
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
        return json(res, 200, {
          status: "ok",
          app: "backstage-exam",
          version: "0.1.0",
        });
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
        if (!/^application\/json\b/i.test(req.headers["content-type"] || ""))
          return json(res, 415, { error: "UNSUPPORTED_MEDIA_TYPE" });
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 1048576) return json(res, 413, { error: "TOO_LARGE" });
          chunks.push(chunk);
        }
        let value;
        try {
          value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        } catch {
          return json(res, 400, { error: "INVALID_JSON" });
        }
        if (!value || typeof value !== "object" || Array.isArray(value))
          return json(res, 422, {
            error: session ? "INVALID_SESSION" : "INVALID_EVENT",
          });
        if (session) {
          if (value.id !== session[1] || !Array.isArray(value.missions))
            return json(res, 422, { error: "INVALID_SESSION" });
          await mkdir(dataDir, { recursive: true });
          const target = path.join(dataDir, session[1] + ".json");
          const temp = target + "." + randomUUID() + ".tmp";
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
          receiptId: randomUUID(),
        });
      }
      if (req.method !== "GET" && req.method !== "HEAD")
        return json(res, 405, { error: "METHOD_NOT_ALLOWED" });
      let pathname;
      try {
        pathname = decodeURIComponent(url.pathname);
      } catch {
        return json(res, 400, { error: "BAD_REQUEST" });
      }
      if (pathname.endsWith("/")) pathname += "index.html";
      const file = path.resolve(root, "public", "." + pathname);
      if (!file.startsWith(path.join(root, "public") + path.sep))
        return json(res, 403, { error: "FORBIDDEN" });
      try {
        const content = await readFile(file);
        const type = {
          ".html": "text/html; charset=utf-8",
          ".js": "text/javascript; charset=utf-8",
          ".css": "text/css; charset=utf-8",
          ".json": "application/json; charset=utf-8",
        }[path.extname(file)];
        res.writeHead(200, {
          "Content-Type": type || "application/octet-stream",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "no-store",
        });
        res.end(content);
      } catch (e) {
        if (e.code === "ENOENT" || e.code === "EISDIR" || e.code === "ENOTDIR")
          return json(res, 404, { error: "NOT_FOUND" });
        throw e;
      }
    } catch (error) {
      console.error("Backstage:", error);
      if (!res.headersSent) json(res, 500, { error: "SERVER_ERROR" });
      else res.end();
    }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 3000;
  const server = createServer();
  server.on("error", (error) => {
    console.error(
      error.code === "EADDRINUSE"
        ? `Port ${port} används redan (kanske en annan server). Stäng den först så att dina sparade svar hittas på samma adress. / Port ${port} is already in use. Stop the other server first so your saved answers stay on the same address.`
        : error,
    );
    process.exit(1);
  });
  server.listen(port, process.env.HOST || "127.0.0.1", () =>
    console.log("Backstage: http://localhost:" + port),
  );
}
