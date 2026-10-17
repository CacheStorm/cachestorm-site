import http from "node:http";
import path from "node:path";
import fs from "node:fs/promises";
const root = path.resolve("out");
const port = Number(process.env.PORT || 3018);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".json": "application/json",
  ".txt": "text/plain",
  ".xml": "application/xml",
};
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", "http://localhost");
      const file = path.resolve(root, "." + decodeURIComponent(url.pathname));
      if (file !== root && !file.startsWith(root + path.sep)) {
        res.writeHead(403).end();
        return;
      }
      let target = file;
      try {
        if ((await fs.stat(file)).isDirectory())
          target = path.join(file, "index.html");
      } catch {
        /* Use the branded 404 below. */
      }
      let data;
      try {
        data = await fs.readFile(target);
      } catch {
        target = path.join(root, "404.html");
        data = await fs.readFile(target);
        res.statusCode = 404;
      }
      res.setHeader(
        "Content-Type",
        types[path.extname(target)] || "application/octet-stream",
      );
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      res.writeHead(400).end();
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Static export: http://127.0.0.1:${port}`),
  );
