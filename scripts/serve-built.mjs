import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

// A finite static server for production-build tests: missing routes stay 404.
const root = path.resolve("dist");
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".xml": "application/xml", ".txt": "text/plain" };
const pages = ["/", "/guide/", "/pricing/", "/guides/claude-code-setup/", "/guides/troubleshooting/"];
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    const filename = path.resolve(root, `.${pathname}`);
    if (!filename.startsWith(`${root}/`) && filename !== root) { response.writeHead(404).end(); return; }
    const normalized = pathname.replace(/\/index\.html$/, "/").replace(/\/?$/, "/");
    const base = normalized.startsWith("/en/") ? normalized.slice(3) : normalized;
    const language = url.searchParams.get("lang");
    if (pages.includes(base) && (language === "zh" || language === "en")) {
      url.pathname = (language === "en" ? "/en" : "") + base;
      url.searchParams.delete("lang");
      response.writeHead(301, { Location: url.pathname + url.search }).end(); return;
    }
    const info = await stat(filename);
    if (info.isDirectory() && !pathname.endsWith("/")) { response.writeHead(301, { Location: pathname + "/" + url.search }).end(); return; }
    const file = info.isDirectory() ? path.join(filename, "index.html") : filename;
    const data = await readFile(file);
    response.writeHead(200, { "Content-Type": mime[path.extname(file)] ?? "application/octet-stream", "Cache-Control": "no-cache" }).end(data);
  } catch { response.writeHead(404).end("Not found"); }
});
server.listen(4174, "127.0.0.1", () => console.log(`Built-site test server PID ${process.pid}: http://127.0.0.1:4174`));
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => server.close(() => process.exit(0)));
