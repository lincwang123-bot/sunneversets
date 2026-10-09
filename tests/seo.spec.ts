import { test, expect } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";

const routes = ["/", "/guide/", "/pricing/", "/guides/claude-code-setup/", "/guides/troubleshooting/"];
const origin = "https://sunneversets.ai";
const screenshots = "/tmp/sunneversets-seo-screenshots";

test("all ten public pages contain HTML content, unique metadata, language alternates and valid schema without JS", async ({ browser, request }) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    for (const prefix of ["", "/en"]) for (const route of routes) {
      const url = prefix + route;
      const response = await request.get(url);
      expect(response.status()).toBe(200);
      const raw = await response.text();
      expect(raw.length).toBeGreaterThan(10_000);
      expect(raw).toContain('data-prerendered="true"');
      expect(raw).not.toContain('<div id="root"></div>');
      await page.goto(url);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("lang", prefix ? "en" : "zh-CN");
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", origin + url);
      await expect(page.locator('link[hreflang="zh-CN"]')).toHaveAttribute("href", origin + route);
      await expect(page.locator('link[hreflang="en"]')).toHaveAttribute("href", origin + "/en" + route);
      await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute("href", origin + route);
      const title = await page.title();
      const description = (await page.locator('meta[name="description"]').getAttribute("content"))!;
      expect(titles.has(title)).toBe(false); titles.add(title);
      expect(descriptions.has(description)).toBe(false); descriptions.add(description);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", origin + url);
      const schema = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
      expect(schema["@graph"].find((item: { "@type": string }) => item["@type"] === "WebPage").url).toBe(origin + url);
      expect(await page.locator("main").innerText()).not.toMatch(/暂定价|未指定计费周期|billing period has not|provisionally CNY/i);
      await expect(page.locator('a[href="https://t.me/CouCouYa"]').first()).toBeVisible();
    }
  } finally { await context.close(); }
});

test("sitemap, robots, real 404 and legacy language URLs preserve campaign parameters", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect((await sitemap.text()).match(/<loc>/g)).toHaveLength(10);
  expect(await (await request.get("/robots.txt")).text()).toContain(`Sitemap: ${origin}/sitemap.xml`);
  expect((await request.get("/does-not-exist/")).status()).toBe(404);
  for (const [from, destination] of [
    ["/?lang=en", "/en/"], ["/guide/?lang=en&utm_source=test", "/en/guide/?utm_source=test"],
    ["/en/pricing/?utm_source=test&lang=zh", "/pricing/?utm_source=test"],
    ["/guides/troubleshooting?lang=en", "/en/guides/troubleshooting/"],
  ]) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers().location).toBe(destination);
  }
});

for (const locale of ["zh", "en"]) for (const width of [320, 390, 1440]) {
  test(`${locale} ${width}px: pages hydrate, pricing and tutorial content fit the viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    const prefix = locale === "en" ? "/en" : "";
    for (const route of routes) {
      await page.goto(prefix + route);
      await expect(page.locator("h1")).toBeVisible();
      if (route === "/") await expect(page.locator(".hero-scene")).toHaveAttribute("data-state", "ready", { timeout: 12_000 });
      // Opening the menu proves that hydration attached handlers to the pre-rendered tree.
      if (width < 1025) {
        await page.locator(".mobile-toggle").click();
        await expect(page.locator(".nav-links")).toHaveClass(/is-open/);
        await page.locator(".mobile-toggle").click();
      } else {
        await page.locator(".language-button").click();
        await expect(page.locator("#language-menu")).toBeVisible();
        await page.keyboard.press("Escape");
      }
      const clipping = await page.locator(".resource-page, .project-story, .user-guide").evaluateAll(roots => roots.flatMap(root => {
        const errors: string[] = [];
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (!node.textContent?.trim() || !node.parentElement?.checkVisibility({ checkVisibilityCSS: true })) continue;
          const range = document.createRange(); range.selectNodeContents(node);
          for (const rect of range.getClientRects()) if (rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1)) errors.push(node.textContent.slice(0, 60));
        }
        return errors;
      }));
      expect(clipping).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      if (route === "/pricing/") {
        await expect(page.locator(".resource-plan")).toHaveCount(2);
        await expect(page.locator(".resource-plan").first()).toContainText("1,299");
        await expect(page.locator(".resource-plan").last()).toContainText("2,299");
        for (const plan of await page.locator(".resource-plan").all()) await expect(plan).toContainText(locale === "zh" ? "一个月" : "one month");
      }
      if (route !== "/guide/") {
        await mkdir(screenshots, { recursive: true });
        await page.screenshot({ path: `${screenshots}/${locale}-${width}-${route.replaceAll("/", "_") || "home"}.png`, fullPage: route !== "/" });
      }
    }
    expect(errors).toEqual([]);
  });
}

test("language links preserve demo input, URL parameters and history; reload keeps the URL language", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.goto("/?utm_source=qa#product");
  await expect(page.locator(".hero-scene")).toHaveAttribute("data-state", "ready");
  const prompt = page.locator(".workspace input, .workspace textarea").first();
  await prompt.fill("SEO language check");
  await page.locator(".language-button").click();
  await page.locator('#language-menu a[lang="en"]').click();
  await expect(page).toHaveURL(/\/en\/\?utm_source=qa#product$/);
  await expect(prompt).toHaveValue("SEO language check");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${origin}/en/`);
  await page.goBack();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await page.goForward(); await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/"); await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  expect(errors).toEqual([]);
});

test("navigation, resource links, clipboard and monthly purchase checklist work", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("navigation", { name: "主导航" }).getByRole("link", { name: "费用说明" }).click();
  await expect(page).toHaveURL(/\/pricing\/$/);
  await page.locator(".resource-related").getByRole("link", { name: "Claude Code 接入教程" }).click();
  await page.locator(".resource-code button").click();
  await expect(page.locator(".resource-code [role=status]")).toContainText("已复制");
  const configuration = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()));
  expect(configuration.env).toHaveProperty("ANTHROPIC_BASE_URL");
  await page.locator(".resource-related").getByRole("link", { name: "连接与额度问题排查" }).click();
  await expect(page.locator(".resource-issue-list article")).toHaveCount(6);
  await page.goto("/");
  await page.locator(".story-plan-preview button").first().click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "保存准备清单" }).click();
  const text = await readFile((await (await download).path())!, "utf8");
  expect(text).toContain("先导价"); expect(text).toContain("一个月"); expect(text).toContain("1299");
  expect(text).not.toContain("暂定价");
});

test("reduced-motion SSR hydrates without mismatches and hardware still expands", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/");
  await expect(page.locator(".hero-scene")).toHaveAttribute("data-state", "ready");
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("button", { name: "Mac facility" }).click();
  await expect(page.locator(".service-visual")).toBeInViewport();
  expect(errors).toEqual([]);
});
