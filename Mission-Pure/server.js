import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number.parseInt(process.env.PORT || "8000", 10);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function safePathFromUrl(urlPathname) {
  const cleaned = decodeURIComponent(urlPathname.split("?")[0] || "/");
  const rel = cleaned === "/" ? "/index.html" : cleaned;
  const fsPath = path.normalize(path.join(__dirname, rel));
  if (!fsPath.startsWith(__dirname)) return null;
  return fsPath;
}

const server = http.createServer(async (req, res) => {
  try {
    const fsPath = safePathFromUrl(req.url || "/");
    if (!fsPath) {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Bad request");
      return;
    }

    const fileStat = await stat(fsPath).catch(() => null);
    if (!fileStat || !fileStat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(fsPath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    const body = await readFile(fsPath);

    res.writeHead(200, { "Content-Type": contentType });
    res.end(body);
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server error");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  // Intentionally no console output requirements.
});
