import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";

// Render the same React tree visitors hydrate; no separate crawler-only content.
const output = path.resolve("dist");
const template = await readFile(path.join(output, "index.html"), "utf8");
const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: "custom" });
try {
  const { render, getPageMetadata, pagePaths, pageHref, siteOrigin } = await server.ssrLoadModule("/src/entry-server.tsx");
  const urls = [];
  for (const page of Object.keys(pagePaths)) {
    for (const locale of ["zh", "en"]) {
      const meta = getPageMetadata(page, locale);
      const tags = [
        `<link rel="canonical" href="${meta.canonical}" />`,
        `<link rel="alternate" hreflang="zh-CN" href="${meta.alternates.zh}" />`,
        `<link rel="alternate" hreflang="en" href="${meta.alternates.en}" />`,
        `<link rel="alternate" hreflang="x-default" href="${meta.alternates.zh}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="SunNeverSets 日不落" />`,
        `<meta property="og:title" content="${escape(meta.title)}" />`,
        `<meta property="og:description" content="${escape(meta.description)}" />`,
        `<meta property="og:url" content="${meta.canonical}" />`,
        `<meta property="og:locale" content="${locale === "en" ? "en_US" : "zh_CN"}" />`,
        `<meta property="og:locale:alternate" content="${locale === "en" ? "zh_CN" : "en_US"}" />`,
        `<meta property="og:image" content="${siteOrigin}/assets/sunneversets-logo.png" />`,
        `<meta property="og:image:alt" content="SunNeverSets 日不落" />`,
        `<meta name="twitter:card" content="summary" />`,
        `<meta name="twitter:title" content="${escape(meta.title)}" />`,
        `<meta name="twitter:description" content="${escape(meta.description)}" />`,
        `<meta name="twitter:image" content="${siteOrigin}/assets/sunneversets-logo.png" />`,
        `<script type="application/ld+json">${JSON.stringify(meta.structuredData).replaceAll("<", "\\u003c")}</script>`,
      ].join("\n    ");
      let html = template
        .replace(/<html lang="[^"]+">/, `<html lang="${meta.language}">`)
        .replace(/<title>[^<]*<\/title>/, () => `<title>${escape(meta.title)}</title>`)
        .replace(/<meta name="description" content="[^"]*"\s*\/>/, () => `<meta name="description" content="${escape(meta.description)}" />`)
        .replace("</head>", `${tags}\n  </head>`)
        .replace('<div id="root"></div>', () => `<div id="root" data-prerendered="true">${render(page, locale)}</div>`);
      if (page !== "home") html = html.replace(/\s*<link rel="preload" as="image" href="\/assets\/city-desk.webp"\s*\/>/, "");
      if (!html.includes("<h1") || html.includes('<div id="root"></div>')) throw new Error(`Empty prerender: ${page}/${locale}`);
      const directory = path.join(output, pageHref(page, locale));
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, "index.html"), html);
      urls.push(`<url><loc>${meta.canonical}</loc><xhtml:link rel="alternate" hreflang="zh-CN" href="${meta.alternates.zh}"/><xhtml:link rel="alternate" hreflang="en" href="${meta.alternates.en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${meta.alternates.zh}"/></url>`);
    }
  }
  await writeFile(path.join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`);
  await writeFile(path.join(output, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`);
  console.log(`Prerendered ${urls.length} bilingual pages, sitemap.xml and robots.txt.`);
} finally {
  await server.close();
}
