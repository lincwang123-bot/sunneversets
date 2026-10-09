import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

// Produce a genuinely offline, double-clickable demo from the tested Vite build.
const output = path.resolve("dist");
const files = await readdir(path.join(output, "assets"));
const images = new Map();
for (const name of files.filter((name) => /\.(webp|png)$/.test(name))) {
  const bytes = await readFile(path.join(output, "assets", name));
  images.set(
    `/assets/${name}`,
    `data:image/${name.endsWith(".webp") ? "webp" : "png"};base64,${bytes.toString("base64")}`,
  );
}
function inlineImages(source) {
  for (const [url, data] of images) source = source.replaceAll(url, data);
  return source;
}
let html = await readFile(path.join(output, "index.html"), "utf8");
const script = html.match(/<script[^>]*src="([^"]+)"[^>]*><\/script>/)?.[1];
const style = html.match(
  /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/,
)?.[1];
if (!script || !style)
  throw new Error("Expected one Vite entry script and stylesheet");
const js = inlineImages(
  await readFile(path.join(output, script.replace(/^\//, "")), "utf8"),
);
const css = inlineImages(
  await readFile(path.join(output, style.replace(/^\//, "")), "utf8"),
);
html = html.replace(
  /<script[^>]*src="[^"]+"[^>]*><\/script>/,
  () =>
    `<script type="module">${js.replaceAll("</script", "<\\/script")}</script>`,
);
html = html.replace(
  /<link[^>]*rel="stylesheet"[^>]*href="[^"]+"[^>]*>/,
  () => `<style>${css}</style>`,
);
const favicon = Buffer.from(await readFile("public/favicon.svg")).toString(
  "base64",
);
html = inlineImages(html).replace(
  /\/favicon\.svg(?:\?[^"\s]*)?/,
  `data:image/svg+xml;base64,${favicon}`,
);
await writeFile(path.join(output, "SunNeverSets-preview.html"), html);
console.log(
  `Offline preview: dist/SunNeverSets-preview.html (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB)`,
);
