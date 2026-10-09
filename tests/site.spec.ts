import {
  test as base,
  expect,
  type Locator,
  type Page,
  type TestInfo,
} from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const screenshotDirectory = path.resolve(process.env.PLAYWRIGHT_SCREENSHOT_DIR || "screenshots");

type Diagnostics = {
  consoleErrors: { text: string; url: string }[];
  pageErrors: string[];
  failedRequests: { url: string; reason: string | null }[];
  expectAssetFailure: boolean;
};

const test = base.extend<{ diagnostics: Diagnostics }>({
  diagnostics: [
    async ({ page }, use, testInfo) => {
      const diagnostics: Diagnostics = {
        consoleErrors: [],
        pageErrors: [],
        failedRequests: [],
        expectAssetFailure: false,
      };
      page.on("console", (message) => {
        if (message.type() === "error")
          diagnostics.consoleErrors.push({
            text: message.text(),
            url: message.location().url,
          });
      });
      page.on("pageerror", (error) =>
        diagnostics.pageErrors.push(error.message),
      );
      page.on("requestfailed", (request) =>
        diagnostics.failedRequests.push({
          url: request.url(),
          reason: request.failure()?.errorText ?? null,
        }),
      );
      await use(diagnostics);
      const images = page.isClosed()
        ? []
        : await page.evaluate(() =>
            Array.from(document.images, (image) => ({
              src: (image.currentSrc || image.src).slice(0, 180),
              alt: image.alt,
              complete: image.complete,
              naturalWidth: image.naturalWidth,
              naturalHeight: image.naturalHeight,
              loading: image.loading,
            })),
          );
      await testInfo.attach("browser-diagnostics", {
        body: Buffer.from(JSON.stringify({ ...diagnostics, images }, null, 2)),
        contentType: "application/json",
      });
      // Missing-asset coverage intentionally causes ERR_FAILED, but never ignores JS errors.
      const unexpectedConsole = diagnostics.consoleErrors.filter(
        (entry) =>
          !(
            diagnostics.expectAssetFailure &&
            /Failed to load resource: net::ERR_FAILED/.test(entry.text)
          ),
      );
      expect(diagnostics.pageErrors, "Unhandled browser errors").toEqual([]);
      expect(unexpectedConsole, "Unexpected console errors").toEqual([]);
    },
    { auto: true },
  ],
});

async function ready(page: Page, language: "zh" | "en" = "zh") {
  await expect(page.locator(".hero-scene")).toHaveAttribute(
    "data-state",
    "ready",
  );
  await expect(
    page.getByRole("heading", {
      name: language === "en" ? "Your ideas. Always on." : /让想法，.*始终在线/,
    }),
  ).toBeVisible();
  await expect
    .poll(
      () =>
        page.locator(".hero-scene img").evaluateAll(
          (images) =>
            images.length >= 2 &&
            images.every((node) => {
              const image = node as HTMLImageElement;
              return image.complete && image.naturalWidth > 0;
            }),
        ),
      { message: "Hero hardware assets should finish loading" },
    )
    .toBe(true);
}

async function noHorizontalOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(
    sizes.document,
    "Document should fit the viewport",
  ).toBeLessThanOrEqual(sizes.viewport + 1);
  expect(sizes.body, "Body should fit the viewport").toBeLessThanOrEqual(
    sizes.viewport + 1,
  );
}

async function noDialogOverflow(page: Page) {
  const sizes = await page
    .getByRole("dialog")
    .evaluate((dialog) => ({
      width: dialog.clientWidth,
      content: dialog.scrollWidth,
      left: dialog.getBoundingClientRect().left,
      right: dialog.getBoundingClientRect().right,
      viewport: window.innerWidth,
    }));
  expect(sizes.content).toBeLessThanOrEqual(sizes.width + 1);
  expect(sizes.left).toBeGreaterThanOrEqual(0);
  expect(sizes.right).toBeLessThanOrEqual(sizes.viewport);
}

async function contentFitsHorizontally(
  container: Locator,
  geometrySelectors: string,
  ignoredTextSelectors = "svg",
) {
  const clipped = await container.evaluate((root, options) => {
    const bounds = root.getBoundingClientRect();
    const dialog = root.getAttribute("role") === "dialog";
    const left = dialog ? Math.max(0, bounds.left) : 0;
    const right = dialog ? Math.min(window.innerWidth, bounds.right) : window.innerWidth;
    const failures: { kind: string; content: string; left: number; right: number; allowed: number[] }[] = [];
    const check = (rect: DOMRect, kind: string, content: string) => {
      if (rect.width > 0 && rect.height > 0 && (rect.left < left - 1 || rect.right > right + 1)) {
        failures.push({ kind, content: content.trim().slice(0, 100), left: rect.left, right: rect.right, allowed: [left, right] });
      }
    };
    for (const element of root.querySelectorAll(options.geometrySelectors)) {
      if (element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) {
        check(element.getBoundingClientRect(), "element", `${element.tagName}.${element.className}`);
      }
    }
    // Text ranges reveal clipping hidden by overflow:hidden even when scrollWidth looks correct.
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!node.textContent?.trim() || !parent || parent.closest(options.ignoredTextSelectors)) continue;
      if (!parent.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) check(rect, "text", node.textContent);
    }
    return failures;
  }, { geometrySelectors, ignoredTextSelectors });
  expect(clipped, "Readable content and controls must fit horizontally, including inside overflow:hidden containers").toEqual([]);
}

async function workspaceControlsFit(page: Page) {
  const geometry = await page.locator(".workspace").evaluate((workspace) => {
    const bounds = workspace.getBoundingClientRect();
    const outside = Array.from(workspace.querySelectorAll("button, input, select, textarea, table"))
      .filter((element) => element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }))
      .flatMap((element) => {
        const rect = element.getBoundingClientRect();
        // A conversation may scroll vertically; its controls must still stay inside
        // the monitor horizontally. Only the composer must remain in view vertically.
        const horizontallyClipped = rect.left < bounds.left - 1 || rect.right > bounds.right + 1;
        const composerClipped = element.closest(".workspace-input") &&
          (rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1);
        return horizontallyClipped || composerClipped
          ? [{ control: element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 80), rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom } }]
          : [];
      });
    return { width: workspace.clientWidth, contentWidth: workspace.scrollWidth, outside };
  });
  expect(geometry.contentWidth, "The app should fit inside the monitor screen").toBeLessThanOrEqual(geometry.width + 1);
  expect(geometry.outside, "Workspace controls and the composer should remain within the monitor").toEqual([]);
}

async function telegramLinksAreSafe(container: Locator) {
  const links = container.locator('a[href^="https://t.me/"]');
  expect(await links.count(), "This contact surface should expose the confirmed Telegram link").toBeGreaterThan(0);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("href", "https://t.me/CouCouYa");
    await expect(link).toHaveAttribute("target", "_blank");
    const rel = (await link.getAttribute("rel"))?.split(/\s+/) ?? [];
    expect(rel).toContain("noopener");
    expect(rel).toContain("noreferrer");
  }
}

async function facilityIsPositionedForReading(page: Page) {
  await expect.poll(() => page.evaluate(() => {
    const navbar = document.querySelector(".navbar")!.getBoundingClientRect();
    const section = document.querySelector("#services")!.getBoundingClientRect();
    const toolbar = document.querySelector(".service-diagram-toolbar")!.getBoundingClientRect();
    const visual = document.querySelector(".service-visual")!.getBoundingClientRect();
    const hardware = document.querySelector(".layer-object-hardware")!.getBoundingClientRect();
    const targetTop = Math.min(visual.top, toolbar.top);
    const targetBottom = Math.max(visual.bottom, toolbar.bottom);
    const available = window.innerHeight - navbar.bottom;
    const fits = targetBottom - targetTop <= available - 24;
    const failures: string[] = [];
    if (section.top > navbar.bottom + 1) failures.push("The previous hero should not remain between the navbar and facility");
    if (toolbar.top < navbar.bottom - 1) failures.push("Facility controls are hidden behind the navbar");
    if (toolbar.bottom > window.innerHeight) failures.push("Facility controls must be visible immediately");
    if (fits && hardware.bottom > window.innerHeight - 11) failures.push("The Mac is cut off although the diagram fits in this viewport");
    if (fits && Math.abs((targetTop + targetBottom) / 2 - (navbar.bottom + window.innerHeight) / 2) > 45) failures.push("The diagram should be centered in the available reading area");
    return failures;
  }), { message: "The facility navigation must show usable diagram content below the fixed header" }).toEqual([]);
}

async function capture(
  page: Page,
  testInfo: TestInfo,
  name: string,
  fullPage = true,
) {
  if (fullPage) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  }
  const directory = screenshotDirectory;
  await mkdir(directory, { recursive: true });
  const filename = path.join(directory, `e2e-${name}.png`);
  await page.screenshot({ path: filename, fullPage, animations: "allow" });
  await testInfo.attach(name, { path: filename, contentType: "image/png" });
}

async function revealServices(page: Page) {
  await page.locator(".service-visual").scrollIntoViewIfNeeded();
  await expect(page.locator(".service-layer-label").first()).toHaveCSS(
    "opacity",
    "1",
  );
}

for (const viewport of [
  { label: "desktop", width: 1440, height: 1000 },
  { label: "tablet", width: 768, height: 1024 },
  { label: "mobile", width: 390, height: 844 },
]) {
  test(`${viewport.label}: 页面内容、弹窗没有横向溢出`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/");
    await ready(page);
    await noHorizontalOverflow(page);
    await revealServices(page);
    await expect(
      page.getByRole("heading", { name: /海外 Mac 机房打底/ }),
    ).toBeVisible();
    await noHorizontalOverflow(page);
    await page.locator(".story-plan-preview").getByRole("button").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await noDialogOverflow(page);
    await page.keyboard.press("Escape");
    await noHorizontalOverflow(page);
    await page.locator("#product").scrollIntoViewIfNeeded();
    await capture(page, testInfo, `${viewport.label}-complete`);
    await page.getByRole("button", { name: "看看怎么用", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await noDialogOverflow(page);
    await page.getByRole("button", { name: "下一步", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "创建控制台接入点" }),
    ).toBeVisible();
    await noDialogOverflow(page);
    await page.keyboard.press("Escape");
    await page.locator(".story-plan-preview").getByRole("button", { name: /Claude Max 5X/ }).click();
    await noDialogOverflow(page);
    await page.getByRole("dialog").getByRole("button", { name: /Claude Max 20X/ }).click();
    await noDialogOverflow(page);
  });
}

test("三步演示、场景同步、焦点限制、Escape 与重新打开重置", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await ready(page);
  const trigger = page.getByRole("button", { name: "看看怎么用", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  const close = dialog.getByRole("button", { name: "关闭面板" });
  await expect(close).toBeFocused();
  await expect(
    dialog.getByRole("button", { name: "上一步", exact: true }),
  ).toBeDisabled();
  await expect(
    dialog.getByRole("button", { name: /01.*确认套餐与交付/ }),
  ).toHaveAttribute("aria-current", "step");
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("hidden");

  // Shift+Tab from the first dialog control wraps inside the modal.
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("link", { name: "阅读完整用户指南", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();

  await dialog.getByRole("button", { name: "下一步", exact: true }).click();
  await expect(
    dialog.getByRole("heading", { name: "创建控制台接入点" }),
  ).toBeVisible();
  await expect(dialog.getByRole("textbox")).toHaveCount(0);
  await dialog.getByRole("button", { name: "下一步", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "下一步", exact: true }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "AI 编程", exact: true }).click();
  await expect(
    dialog.getByText("Claude Code / Claude Desktop", { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "在本机配置并测试", exact: true }),
  ).toBeVisible();
  await capture(page, testInfo, "demo-modal", false);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .not.toBe("hidden");
  await expect(page.getByRole("combobox", { name: "工作场景" })).toHaveValue(
    "coding",
  );
  await expect(page.locator(".workspace-greeting")).toContainText(
    "先从一个可预览的版本开始",
  );

  await trigger.click();
  await expect(
    dialog.getByRole("button", { name: /01.*确认套餐与交付/ }),
  ).toHaveAttribute("aria-current", "step");
  await dialog.getByRole("button", { name: /03.*在本机配置并测试/ }).click();
  await expect(
    dialog.getByText("Claude Code / Claude Desktop", { exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "重播演示" }).click();
  await expect(
    dialog.getByRole("button", { name: /01.*确认套餐与交付/ }),
  ).toHaveAttribute("aria-current", "step");
  await dialog.getByRole("button", { name: "下一步", exact: true }).click();
  await dialog.getByRole("button", { name: "上一步", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: /01.*确认套餐与交付/ }),
  ).toHaveAttribute("aria-current", "step");
});

for (const locale of ["zh", "en"] as const) {
  test(`套餐清单：${locale} 两档套餐真实下载，价格与质保边界准确`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/?lang=${locale}`);
    await ready(page, locale);
    await page.locator(".story-plan-preview").getByRole("button", { name: /Claude Max 5X/ }).click();
    const dialog = page.getByRole("dialog");
    const choices = dialog.getByRole("group", { name: locale === "zh" ? "选择套餐" : "Choose a package" });
    await expect(choices.getByRole("button")).toHaveCount(2);
    for (const plan of [{ id: "max5x", name: "Claude Max 5X", price: 1299 }, { id: "max20x", name: "Claude Max 20X", price: 2299 }]) {
      const choice = choices.getByRole("button", { name: new RegExp(plan.name) });
      await choice.click();
      await expect(choice).toHaveAttribute("aria-pressed", "true");
      await expect(choice).toContainText(plan.price.toLocaleString("en-US"));
      const downloadPromise = page.waitForEvent("download");
      await dialog.getByRole("button", { name: locale === "zh" ? "保存准备清单" : "Save checklist" }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe(`SunNeverSets-${plan.id}-${locale}-setup-checklist.md`);
      const output = testInfo.outputPath(download.suggestedFilename());
      await download.saveAs(output);
      const contents = await readFile(output, "utf8");
      expect(contents).toContain(`${plan.name} · ¥${plan.price}`);
      expect(contents).toContain("Claude Code");
      expect(contents).toContain("Claude Desktop");
      expect(contents).toContain("KYC");
      expect(contents).toContain("cc-switch");
      expect(contents).toContain(`https://sunneversets.ai${locale === "en" ? "/en" : ""}/guide/`);
      expect(contents).toContain("https://t.me/CouCouYa");
      expect(contents).toContain("@CouCouYa");
      if (locale === "zh") {
        for (const text of ["先导价", "未提交给客服", "不构成订单", "托管席位", "最多同时 6 个 session", "前两天保持轻量", "剩余未使用天数退款并扣手续费", "邮箱和密码不提供质保", "不等于提供一台远程电脑", "不售卖独立托管服务或 Pro"]) expect(contents).toContain(text);
        expect(contents).not.toMatch(/每台 Mac 2 位|保留数据 7 天|10 分钟内|纯开发|工具订阅：与环境服务分开/);
      } else {
        expect(contents).not.toMatch(/\p{Script=Han}/u);
        for (const text of ["Introductory / month", "one month", "not sent to support", "not an order", "Hosting seat", "6 concurrent sessions", "first two days", "unused service days minus a fee", "removes warranty coverage", "does not provide a remote computer", "Standalone hosting and Pro packages are not offered"]) expect(contents).toContain(text);
      }
      await testInfo.attach(`checklist-${plan.id}-${locale}`, { path: output, contentType: "text/markdown" });
    }
    await expect(dialog.getByRole("status")).toContainText(locale === "zh" ? "已生成本地文件" : "Your checklist is ready");
    await noDialogOverflow(page);
  });
}

test("桌面导航、价格、帮助、语言菜单与本地演示输入可用", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  const navigation = page.getByRole("navigation", { name: "主导航" });
  await navigation.getByRole("link", { name: "费用说明", exact: true }).click();
  await expect(page.locator(".resource-page h1")).toContainText("套餐与交付");
  await expect(page.locator(".resource-plan-grid")).toContainText("¥1,299");
  await expect(page.locator(".resource-plan-grid")).toContainText("¥2,299");
  await expect(page.locator(".resource-plan-grid")).toContainText("先导价");
  await expect(page.locator(".resource-plan-grid")).toContainText("一个月");
  await page.goto("/"); await ready(page);
  const dialog = page.getByRole("dialog");
  await navigation
    .getByRole("button", { name: "常见问题", exact: true })
    .click();
  await dialog.locator("summary").filter({ hasText: "一个账号最多多少个人使用？" }).click();
  await expect(dialog.locator("details[open]").filter({ hasText: "一个账号最多" })).toContainText("不要超过 6 个");
  await dialog.locator("summary").filter({ hasText: "账号被封后可以退款吗？" }).click();
  await expect(dialog.locator("details[open]").filter({ hasText: "账号被封后" })).toContainText("剩余未使用的服务天数");
  await expect(dialog.locator("details[open]").filter({ hasText: "账号被封后" })).toContainText("扣除相应手续费");
  await page.keyboard.press("Escape");
  for (const plan of ["Claude Max 20X", "Claude Max 5X"]) {
    await page.locator(".story-plan-preview").getByRole("button", { name: new RegExp(plan) }).click();
    await expect(dialog.getByRole("group", { name: "选择套餐" }).getByRole("button", { name: new RegExp(plan) })).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Escape");
  }
  await page.getByRole("button", { name: "简体中文", exact: true }).click();
  await expect(
    page
      .locator("#language-menu")
      .getByRole("link", { name: "English", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator("#language-menu").getByRole("link", { name: "English", exact: true }),
  ).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(
    page
      .locator("#language-menu")
      .getByRole("link", { name: "English", exact: true }),
  ).not.toBeVisible();
  await navigation.getByRole("button", { name: "如何使用" }).click();
  await expect(
    dialog.getByRole("heading", { name: "在自己的电脑上，开始使用 Claude。" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await navigation.getByRole("button", { name: "海外机房" }).click();
  await expect(page.getByRole("button", { name: "查看机房基础设施", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".service-visual")).toBeInViewport();
  await navigation.getByRole("link", { name: "产品", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /让想法，.*始终在线/ }),
  ).toBeInViewport();
  await page
    .getByRole("combobox", { name: "工作场景" })
    .selectOption("workflow");
  await page
    .getByRole("textbox", { name: "输入演示内容" })
    .fill("整理今天的工作流程");
  await page.getByRole("button", { name: "运行本地演示" }).click();
  await expect(page.locator(".workspace-response")).toContainText("示例工作流");
});

test("真实工作区：侧栏会话、结果表、场景与工具同步，新任务可本地演示", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?lang=zh");
  await ready(page);
  const workspace = page.locator(".workspace");
  const scenario = workspace.getByRole("combobox", { name: "工作场景" });
  const recents = workspace.locator(".workspace-recents");
  const table = workspace.getByRole("table", { name: "任务结果示例" });
  await expect(scenario).toHaveValue("coding");
  await expect(recents.getByRole("button", { name: "搭建我的第一个产品" })).toHaveAttribute("aria-pressed", "true");
  await expect(table.getByRole("row")).toHaveCount(4);
  await expect(table).toContainText("src/App.tsx");
  await expect(workspace.locator(".workspace-toolbar button")).toHaveCount(2);
  await expect(workspace.getByRole("button", { name: "Claude Code", exact: true })).toHaveAttribute("aria-pressed", "true");

  await recents.getByRole("button", { name: "整理产品研究与思路" }).click();
  await expect(scenario).toHaveValue("writing");
  await expect(table).toContainText("audience.md");
  await expect(table).not.toContainText("src/App.tsx");
  await scenario.selectOption("workflow");
  await expect(recents.getByRole("button", { name: "检查项目，准备下一步" })).toHaveAttribute("aria-pressed", "true");
  await expect(workspace.getByRole("button", { name: "Claude Code", exact: true })).toHaveAttribute("aria-pressed", "true");
  await workspace.getByRole("button", { name: "Claude Desktop", exact: true }).click();
  await expect(workspace.locator(".workspace-composer-meta")).toContainText("Claude Desktop");

  await workspace.getByRole("button", { name: "新任务", exact: true }).click();
  await expect(workspace.locator(".workspace-empty")).toContainText("想把什么想法变成现实？");
  await expect(table).not.toBeVisible();
  const input = workspace.getByRole("textbox", { name: "输入演示内容" });
  const submit = workspace.getByRole("button", { name: "运行本地演示" });
  await expect(submit).toBeDisabled();
  await input.fill("   ");
  await expect(submit).toBeDisabled();

  const prompt = "Local-only test: plan the first product release";
  const transmitted: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" || decodeURIComponent(request.url()).includes(prompt)) transmitted.push(request.url());
  });
  await input.fill(prompt);
  await input.press("Enter");
  await expect(workspace.locator(".workspace-user-message")).toHaveText(prompt);
  await expect(workspace.locator(".workspace-response")).toContainText("示例工作流");
  await expect(table).toBeVisible();
  await expect(input).toHaveValue("");
  await expect(submit).toBeDisabled();
  await expect(workspace.locator(".workspace-demo-note")).toContainText("未连接真实 AI · 不发送数据");
  expect(transmitted, "The monitor demo must not submit the visitor's prompt to a backend").toEqual([]);
  await workspaceControlsFit(page);
  await capture(page, testInfo, "workspace-conversation-zh", false);
});

test("真实工作区：切换英文保留当前工具、输入和演示结果，界面完整翻译", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?lang=zh");
  await ready(page);
  const workspace = page.locator(".workspace");
  await workspace.getByRole("combobox", { name: "工作场景" }).selectOption("writing");
  await workspace.getByRole("button", { name: "Claude Desktop", exact: true }).click();
  await workspace.getByRole("textbox", { name: "输入演示内容" }).fill("Outline my product research");
  await workspace.getByRole("button", { name: "运行本地演示" }).click();
  await workspace.getByRole("textbox", { name: "输入演示内容" }).fill("A draft to continue later");
  await page.getByRole("button", { name: "简体中文", exact: true }).click();
  await page.locator("#language-menu").getByRole("link", { name: "English", exact: true }).click();
  await expect(workspace.getByRole("combobox", { name: "Workspace scenario" })).toHaveValue("writing");
  await expect(workspace.getByRole("button", { name: "Claude Desktop", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(workspace.getByRole("textbox", { name: "Enter a demo prompt" })).toHaveValue("A draft to continue later");
  await expect(workspace.locator(".workspace-user-message")).toHaveText("Outline my product research");
  await expect(workspace.locator(".workspace-response")).toContainText("Sample research outline");
  await expect(workspace.getByRole("table", { name: "Example task results" })).toContainText("Audience and use cases");
  expect(await workspace.innerText()).not.toMatch(/\p{Script=Han}/u);
  await workspaceControlsFit(page);
});

for (const width of [320, 390, 768, 1440]) {
  test(`真实工作区：${width}px 中英文显示器内控件适配且输入可用`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const locale of ["zh", "en"] as const) {
      await page.goto(`/?lang=${locale}`);
      await ready(page, locale);
      const workspace = page.locator(".workspace");
      await workspaceControlsFit(page);
      await noHorizontalOverflow(page);
      await workspace.getByRole("combobox", { name: locale === "zh" ? "工作场景" : "Workspace scenario" }).selectOption("workflow");
      await workspace.getByRole("button", { name: "Claude Desktop", exact: true }).click();
      await expect(workspace.locator(".workspace-composer-meta")).toContainText("Claude Desktop");
      await workspace.getByRole("textbox", { name: locale === "zh" ? "输入演示内容" : "Enter a demo prompt" }).fill("A long project idea with research, implementation, mobile layout, and a release checklist. ".repeat(2));
      await workspace.getByRole("button", { name: locale === "zh" ? "运行本地演示" : "Run the local demo" }).click();
      await expect(workspace.locator(".workspace-response")).toContainText(locale === "zh" ? "示例工作流" : "Sample workflow");
      await workspaceControlsFit(page);
      await noHorizontalOverflow(page);
      await workspace.scrollIntoViewIfNeeded();
      await capture(page, testInfo, `workspace-${locale}-${width}`, false);
    }
  });
}

for (const width of [320, 390, 760, 761, 768, 960, 961, 1024, 1025, 1200, 1201, 1280, 1440, 1920]) {
  test(`参数卡避让：${width}px 双语参数不挡屏幕、导航、标题或购买入口`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const locale of ["zh", "en"] as const) {
      await page.goto(`/?lang=${locale}`);
      await ready(page, locale);
      await expect(page.locator(".device-card")).toBeVisible();
      const geometry = await page.evaluate(() => {
        const card = document.querySelector(".device-card")!.getBoundingClientRect();
        const screen = document.querySelector(".screen-plane")!.getBoundingClientRect();
        const navbar = document.querySelector(".navbar")!.getBoundingClientRect();
        const intersection = (rect: DOMRect) => Math.max(0, Math.min(card.right, rect.right) - Math.max(card.left, rect.left)) * Math.max(0, Math.min(card.bottom, rect.bottom) - Math.max(card.top, rect.top));
        const textOverlaps: string[] = [];
        // The hero copy box contains intentional whitespace, so compare only actual
        // title/description text lines and the interactive action rectangles.
        for (const root of document.querySelectorAll("#hero-title, .hero-description")) {
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const node = walker.currentNode;
            if (!node.textContent?.trim() || !node.parentElement?.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
            const range = document.createRange(); range.selectNodeContents(node);
            if (Array.from(range.getClientRects()).some(rect => intersection(rect) > 1)) textOverlaps.push(node.textContent.trim());
          }
        }
        const actionOverlaps = Array.from(document.querySelectorAll(".hero-actions > a, .hero-actions > button"))
          .filter(element => intersection(element.getBoundingClientRect()) > 1)
          .map(element => element.textContent?.trim());
        return { screenOverlap: intersection(screen), navGap: card.top - navbar.bottom, left: card.left, right: card.right, viewport: window.innerWidth, textOverlaps, actionOverlaps };
      });
      expect(geometry.screenOverlap, "The specification card must leave the whole screen unobstructed").toBeLessThanOrEqual(1);
      expect(geometry.navGap, "The card needs breathing room below the fixed navigation").toBeGreaterThanOrEqual(8);
      expect(geometry.left).toBeGreaterThanOrEqual(0);
      expect(geometry.right).toBeLessThanOrEqual(geometry.viewport);
      expect(geometry.textOverlaps, "The card must not cover any visible headline or description").toEqual([]);
      expect(geometry.actionOverlaps, "The card must not cover the sales or demo controls").toEqual([]);
      await noHorizontalOverflow(page);
      if ([320, 390, 768, 1024, 1280, 1440, 1920].includes(width)) await capture(page, testInfo, `card-clearance-${locale}-${width}`, false);
    }
  });
}

for (const locale of ["zh", "en"] as const) {
  test(`Telegram购买：${locale} 首页、套餐弹窗和指南使用同一客服且不自动发送请求`, async ({ page }) => {
    const telegramRequests: string[] = [];
    page.on("request", request => { if (new URL(request.url()).hostname === "t.me") telegramRequests.push(request.url()); });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/?lang=${locale}`);
    await ready(page, locale);
    await expect(page.locator(".hero-actions").getByRole("link", { name: locale === "zh" ? "联系客服购买" : "Contact sales", exact: true })).toBeVisible();
    await telegramLinksAreSafe(page.locator(".hero-actions"));
    await telegramLinksAreSafe(page.locator(".navbar"));
    await telegramLinksAreSafe(page.locator(".project-story .contact-options"));
    await expect(page.locator(".project-story .contact-options")).toContainText("@CouCouYa");
    await page.locator(".story-plan-preview").getByRole("button", { name: /Claude Max 20X/ }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("group", { name: locale === "zh" ? "选择套餐" : "Choose a package" }).getByRole("button", { name: /Claude Max 20X/ })).toHaveAttribute("aria-pressed", "true");
    await telegramLinksAreSafe(dialog.locator(".contact-options"));
    await expect(dialog.locator(".panel-subtitle")).toContainText("Telegram");
    await page.keyboard.press("Escape");
    const navigation = page.getByRole("navigation", { name: locale === "zh" ? "主导航" : "Main navigation" });
    await navigation.getByRole("link", { name: locale === "zh" ? "费用说明" : "Pricing", exact: true }).click();
    await telegramLinksAreSafe(page.locator(".resource-contact .contact-options"));
    await navigation.getByRole("button", { name: locale === "zh" ? "常见问题" : "FAQ", exact: true }).click();
    await telegramLinksAreSafe(dialog.locator(".contact-options"));
    await page.keyboard.press("Escape");
    await navigation.getByRole("link", { name: locale === "zh" ? "用户指南" : "User guide", exact: true }).click();
    await telegramLinksAreSafe(page.locator("#guide-contact"));
    await expect(page.locator("#guide-contact")).toContainText("@CouCouYa");
    expect(telegramRequests, "Contact links should wait for the user's click and never send a message or open Telegram automatically").toEqual([]);
  });
}

test("英文：切换后刷新保持语言，页面地址决定语言且保留其他 URL 参数", async ({ page }) => {
  await page.goto("/?source=language-check#product");
  await ready(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await page.getByRole("button", { name: "简体中文", exact: true }).click();
  await page.locator("#language-menu").getByRole("link", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const switchedUrl = new URL(page.url());
  expect(switchedUrl.pathname).toBe("/en/");
  expect(switchedUrl.searchParams.has("lang")).toBe(false);
  expect(switchedUrl.searchParams.get("source")).toBe("language-check");
  expect(switchedUrl.hash).toBe("#product");
  await expect(page.locator("#language-menu")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "English", exact: true })).toBeFocused();
  await page.reload();
  await ready(page, "en");
  await page.goto("/");
  await ready(page);
  await page.goto("/?lang=zh");
  await ready(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await page.goto("/");
  await ready(page);
});

test("英文：分享链接、页面元信息、工作区与设备说明完整可用", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?lang=en");
  await ready(page, "en");
  await expect(page).toHaveTitle("Claude Max Subscription & Hosting Packages | SunNeverSets");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Claude Max account/);
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(navigation.getByRole("link", { name: "Product", exact: true })).toBeVisible();
  for (const name of ["How it works", "Mac facility", "FAQ"]) {
    await expect(navigation.getByRole("button", { name, exact: true })).toBeVisible();
  }
  await page.getByRole("combobox", { name: "Workspace scenario" }).selectOption("workflow");
  await page.getByRole("textbox", { name: "Enter a demo prompt" }).fill("Plan my product launch");
  await page.getByRole("button", { name: "Run the local demo" }).click();
  await expect(page.locator(".workspace-response")).toContainText("Sample workflow");
  await navigation.getByRole("button", { name: "Mac facility", exact: true }).click();
  await expect(page.locator(".service-visual")).toBeInViewport();
  expect(await page.locator("main").innerText(), "Visible English page copy should not contain untranslated Chinese").not.toMatch(/\p{Script=Han}/u);
  await noHorizontalOverflow(page);
  await capture(page, testInfo, "english-desktop-complete");
});

test("英文：三步演示、价格和所有 FAQ 答案使用英文并保留业务边界", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?lang=en");
  await ready(page, "en");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await navigation.getByRole("button", { name: "How it works", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: "Previous", exact: true })).toBeDisabled();
  for (let step = 0; step < 3; step += 1) {
    expect(await dialog.innerText()).not.toMatch(/\p{Script=Han}/u);
    await noDialogOverflow(page);
    if (step < 2) await dialog.getByRole("button", { name: "Next", exact: true }).click();
  }
  await expect(dialog.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
  await dialog.getByRole("button", { name: "AI coding", exact: true }).click();
  await expect(dialog.getByText("Claude Code / Claude Desktop", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await navigation.getByRole("link", { name: "Pricing", exact: true }).click();
  await expect(page.locator(".resource-page h1")).toBeVisible();
  expect(await page.locator("main").innerText()).not.toMatch(/\p{Script=Han}/u);
  await navigation.getByRole("button", { name: "FAQ", exact: true }).click();
  // Keep a stable collection: filtering by [open] would change nth() targets after each click.
  for (const question of await dialog.locator("details").all()) {
    if ((await question.getAttribute("open")) === null) {
      await question.locator("summary").click();
    }
  }
  expect(await dialog.innerText()).not.toMatch(/\p{Script=Han}/u);
  await expect(dialog.locator("details")).toHaveCount(15);
  for (const text of ["Claude Max 5X", "CNY 1,299", "CNY 2,299", "6 simultaneous sessions", "cc-switch and cc-connect", "handling fee", "Coverage is not provided", "do not include an overseas remote computer"]) await expect(dialog).toContainText(text);
  await noDialogOverflow(page);
});

test("英文：手机可切换两种语言，导航及弹窗无横向溢出", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await ready(page);
  await page.getByRole("button", { name: "打开导航", exact: true }).click();
  await page.getByRole("button", { name: "语言：简体中文", exact: true }).click();
  await page.locator("#mobile-language-menu").getByRole("link", { name: "English", exact: true }).click();
  await ready(page, "en");
  await expect(page).toHaveURL(/\/en\/$/);
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(navigation).not.toBeVisible();
  await noHorizontalOverflow(page);
  await capture(page, testInfo, "english-mobile-complete");
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await noHorizontalOverflow(page);
  await navigation.getByRole("link", { name: "Pricing", exact: true }).click();
  await expect(page.locator(".resource-page h1")).toBeVisible();
  expect(await page.locator("main").innerText()).not.toMatch(/\p{Script=Han}/u);
  await noHorizontalOverflow(page);
  await page.goto("/en/"); await ready(page, "en");
  const dialog = page.getByRole("dialog");
  await page.locator(".story-plan-preview").getByRole("button", { name: /Claude Max 5X/ }).click();
  await expect(dialog).toBeVisible();
  await noDialogOverflow(page);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await navigation.getByRole("button", { name: "Language: English", exact: true }).click();
  await page.locator("#mobile-language-menu").getByRole("link", { name: "简体中文", exact: true }).click();
  await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/$/);
  await page.reload();
  await ready(page);
  await noHorizontalOverflow(page);
});

for (const width of [320, 390, 768]) {
  test(`英文：${width}px 首屏、设备说明和面板正文不被裁剪`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?lang=en");
    await ready(page, "en");
    await contentFitsHorizontally(page.locator(".hero-copy"), "h1, p, .hero-actions, button, a");
    await contentFitsHorizontally(page.locator(".feature-row"), ".feature, strong, span");
    await revealServices(page);
    await contentFitsHorizontally(
      page.locator("#services"),
      ".service-copy, .service-visual, .service-diagram-toolbar, .service-diagram-toolbar button, .service-layer-label, .service-selected-detail",
      "svg, .layer-object, .layer-floor-shadow",
    );
    await noHorizontalOverflow(page);
    await capture(page, testInfo, `english-${width}-complete`);
    const dialog = page.getByRole("dialog");
    const checkPanel = async () => {
      await noDialogOverflow(page);
      await contentFitsHorizontally(dialog, "h2, h3, p, button, summary, input, select, .panel-paths, .panel-demo-controls");
    };
    await page.getByRole("button", { name: "Explore the demo", exact: true }).click();
    for (let step = 0; step < 3; step += 1) {
      await checkPanel();
      if (step < 2) await dialog.getByRole("button", { name: "Next", exact: true }).click();
    }
    await capture(page, testInfo, `english-${width}-demo`, false);
    await page.keyboard.press("Escape");
    await page.locator(".story-plan-preview").getByRole("button", { name: /Claude Max 5X/ }).click();
    await checkPanel();
    await dialog.getByRole("button", { name: /Claude Max 20X/ }).click();
    await checkPanel();
    await capture(page, testInfo, `english-${width}-signup`, false);
    await page.keyboard.press("Escape");
    const mobileToggle = page.getByRole("button", { name: "Open navigation", exact: true });
    if (await mobileToggle.isVisible()) await mobileToggle.click();
    await page.getByRole("navigation", { name: "Main navigation" }).getByRole("button", { name: "FAQ", exact: true }).click();
    for (const question of await dialog.locator("details").all()) {
      if ((await question.getAttribute("open")) === null) await question.locator("summary").click();
    }
    await checkPanel();
    await capture(page, testInfo, `english-${width}-faq`, false);
  });
}

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1440, height: 1000 },
  { width: 1440, height: 700 },
]) {
  test(`机房导航定位：${viewport.width}x${viewport.height} 双语点击与指南返回均展示完整可用图组`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const locale of ["zh", "en"] as const) {
      const openFacility = async () => {
        const toggle = page.getByRole("button", { name: locale === "zh" ? "打开导航" : "Open navigation", exact: true });
        if (await toggle.isVisible()) await toggle.click();
        await page.getByRole("navigation", { name: locale === "zh" ? "主导航" : "Main navigation" }).getByRole("button", { name: locale === "zh" ? "海外机房" : "Mac facility", exact: true }).click();
      };
      await page.goto(`/?lang=${locale}`);
      await ready(page, locale);
      await openFacility();
      await expect(page.getByRole("button", { name: locale === "zh" ? "查看机房基础设施" : "Explore Mac infrastructure", exact: true })).toHaveAttribute("aria-pressed", "true");
      await facilityIsPositionedForReading(page);
      await noHorizontalOverflow(page);
      await page.goto(`/guide/?lang=${locale}`);
      await expect(page.locator(".user-guide")).toBeVisible();
      await openFacility();
      await expect(page).toHaveURL(new RegExp(`${locale === "en" ? "/en" : ""}/#services$`));
      await ready(page, locale);
      await facilityIsPositionedForReading(page);
      await page.reload();
      await ready(page, locale);
      await facilityIsPositionedForReading(page);
      await capture(page, testInfo, `facility-position-${locale}-${viewport.width}x${viewport.height}`, false);
    }
  });
}

test("手机导航能展开、跳转、打开面板并关闭菜单", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await ready(page);
  const navigation = page.getByRole("navigation", { name: "主导航" });
  await expect(navigation).not.toBeVisible();
  await page.getByRole("button", { name: "打开导航" }).click();
  await expect(navigation).toBeVisible();
  await navigation.getByRole("link", { name: "费用说明", exact: true }).click();
  await expect(page.locator(".resource-page h1")).toBeVisible();
  await expect(navigation).not.toBeVisible();
  await page.getByRole("button", { name: "打开导航" }).click();
  await navigation.getByRole("button", { name: "海外机房" }).click();
  await expect(page.locator(".service-visual")).toBeInViewport();
  await expect(navigation).not.toBeVisible();
  await page.getByRole("button", { name: "打开导航" }).click();
  await navigation.getByRole("link", { name: "产品", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /让想法，.*始终在线/ }),
  ).toBeInViewport();
  await noHorizontalOverflow(page);
});

test("说明选择、图层鼠标与键盘选择双向同步，图层可收起和展开", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  await revealServices(page);
  const labels = page.locator(".service-layer-labels");
  const toolLabel = labels.getByRole("button", { name: /托管服务/ });
  await toolLabel.click();
  await expect(toolLabel).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "查看托管服务", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".service-selected-detail")).toContainText(
    "五项统一打包",
  );
  const macosLayer = page.getByRole("button", {
    name: "查看运行基础",
    exact: true,
  });
  await macosLayer.click();
  await expect(macosLayer).toHaveAttribute("aria-pressed", "true");
  await expect(
    labels.getByRole("button", { name: /运行基础/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".service-selected-detail")).toContainText(
    "你在自己的电脑上配置 Claude 客户端",
  );
  const toolsLayer = page.getByRole("button", {
    name: "查看托管服务",
    exact: true,
  });
  await toolsLayer.click();
  await expect(toolsLayer).toHaveAttribute("aria-pressed", "true");
  await expect(toolLabel).toHaveAttribute("aria-pressed", "true");
  // Keyboard users can also select a layer without using its perspective surface.
  const networkLayer = page.getByRole("button", {
    name: "查看客户端接入",
    exact: true,
  });
  await networkLayer.focus();
  await page.keyboard.press("Enter");
  await expect(networkLayer).toHaveAttribute("aria-pressed", "true");
  await expect(
    labels.getByRole("button", { name: /客户端接入/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".service-selected-detail")).toContainText(
    "仅允许按项目教程配置的 Claude Code 和 Claude Desktop",
  );
  await page.getByRole("button", { name: "收回机身" }).click();
  await expect(page.getByRole("button", { name: "展开服务构成" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await page.getByRole("button", { name: "展开服务构成" }).click();
  await expect(page.getByRole("button", { name: "收回机身" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
});

test("reduced-motion 显示最终工作环境，所有关键操作可用", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await ready(page);
  await expect(page.locator(".assembly-stack")).toHaveCount(0);
  await expect(
    page.getByRole("textbox", { name: "输入演示内容" }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "输入演示内容" })
    .fill("整理一个研究提纲");
  await page.getByRole("button", { name: "运行本地演示" }).click();
  await expect(page.locator(".workspace-response")).toContainText(
    "示例项目计划",
  );
  await revealServices(page);
  await page
    .locator(".service-layer-labels")
    .getByRole("button", { name: /配置与支持/ })
    .click();
  await expect(page.locator(".service-selected-detail")).toContainText(
    "使用规则和质保范围请在付款前确认",
  );
  await page.getByRole("button", { name: "收回机身" }).click();
  await page.getByRole("button", { name: "展开服务构成" }).click();
  await page.locator("#product").scrollIntoViewIfNeeded();
  await capture(page, testInfo, "reduced-motion");
  await page.getByRole("button", { name: "看看怎么用", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "下一步", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "创建控制台接入点" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
});

test("素材延迟六秒时标题与 CTA 立即可用", async ({ page }) => {
  let released = false;
  let releaseAssets!: () => void;
  const gate = new Promise<void>((resolve) => {
    releaseAssets = resolve;
  });
  await page.route("**/assets/**", async (route) => {
    await gate;
    await route.continue();
  });
  const timer = setTimeout(() => {
    released = true;
    releaseAssets();
  }, 6_000);
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".hero-scene")).toHaveAttribute(
      "data-state",
      "loading",
    );
    await expect(
      page.getByRole("heading", { name: /让想法，.*始终在线/ }),
    ).toBeVisible();
    await page.getByRole("button", { name: "看看怎么用", exact: true }).click();
    await expect(
      page
        .getByRole("dialog")
        .getByRole("heading", { name: "在自己的电脑上，开始使用 Claude。" }),
    ).toBeVisible();
    expect(released, "CTA was usable before assets were released").toBe(false);
    await page.keyboard.press("Escape");
    await ready(page);
  } finally {
    clearTimeout(timer);
    releaseAssets();
    await page.unrouteAll({ behavior: "wait" });
  }
});

test("缺失素材时保留标题、开通路径与本地工作区控制", async ({
  page,
  diagnostics,
}) => {
  diagnostics.expectAssetFailure = true;
  await page.route("**/assets/mac-mini.webp", (route) => route.abort("failed"));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /让想法，.*始终在线/ }),
  ).toBeVisible();
  await expect(
    page.getByText("部分视觉素材暂不可用，演示功能仍可使用。", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".hero-scene")).toHaveAttribute(
    "data-state",
    "ready",
  );
  await page.locator(".story-plan-preview").getByRole("button", { name: /Claude Max 5X/ }).click();
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: "开通前，逐项确认。" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("textbox", { name: "输入演示内容" })
    .fill("素材异常时仍能继续操作");
  await page.getByRole("button", { name: "运行本地演示" }).click();
  await expect(page.locator(".workspace-response")).toContainText(
    "示例项目计划",
  );
  expect(
    diagnostics.failedRequests.some((request) =>
      request.url.endsWith("/assets/mac-mini.webp"),
    ),
  ).toBe(true);
});

test("开场存在组装过程，保存两张中间态并回到完成态", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await ready(page);
  await page.getByRole("button", { name: "重播开场" }).click();
  const sampleStart = performance.now();
  await expect(page.locator(".hero-scene")).toHaveAttribute(
    "data-state",
    "assembling",
  );
  // These are visual inspection samples, not exact frame or timing assertions.
  await page.waitForTimeout(500);
  await capture(page, testInfo, "assembly-about-0.5s", false);
  await page.waitForTimeout(
    Math.max(0, 1200 - (performance.now() - sampleStart)),
  );
  await capture(page, testInfo, "assembly-about-1.2s", false);
  await expect(page.locator(".hero-scene")).toHaveAttribute(
    "data-state",
    "ready",
  );
  await expect(page.locator(".assembly-stack")).toHaveCount(0);
});

test("首屏离开视口暂停循环，返回不重复组装", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 650 });
  await page.goto("/");
  await ready(page);
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(page.locator(".hero")).toHaveClass(/animation-paused/);
  await expect(page.locator(".screen-glow")).toHaveCSS(
    "animation-play-state",
    "paused",
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page.locator(".hero")).not.toHaveClass(/animation-paused/);
  await expect(page.locator(".hero-scene")).toHaveAttribute(
    "data-state",
    "ready",
  );
  await expect(page.locator(".assembly-stack")).toHaveCount(0);
});

for (const locale of ["zh", "en"] as const) {
  test(`用户指南：${locale} 独立链接、接入配置复制、使用限制与售后完整`, async ({ page, context }, testInfo) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/?lang=${locale}`);
    await ready(page, locale);
    await page.getByRole("navigation", { name: locale === "zh" ? "主导航" : "Main navigation" }).getByRole("link", { name: locale === "zh" ? "用户指南" : "User guide", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${locale === "en" ? "/en" : ""}/guide/$`));
    await page.reload();
    await expect(page).toHaveTitle(locale === "zh" ? "日不落用户指南：接入、使用限制与售后｜SunNeverSets" : "User Guide: Setup, Usage Rules & Support | SunNeverSets");
    const guide = page.locator(".user-guide");
    await expect(guide.getByRole("heading", { level: 1 })).toHaveText(locale === "zh" ? "日不落用户使用指南" : "Your SunNeverSets guide");
    await expect(guide.locator(".guide-step")).toHaveCount(5);
    await expect(guide.locator(".guide-faq-list details")).toHaveCount(15);
    await expect(guide.locator(".guide-hero-actions").getByRole("link", { name: locale === "zh" ? "进入控制台" : "Open console", exact: true })).toHaveAttribute("href", "https://cc-proxy.site/login");
    await expect(guide.locator("#guide-step-1")).toContainText(locale === "zh" ? "可直接跳过第一步" : "you can skip step 1");
    await expect(guide.locator("#guide-step-4")).toContainText("~/.claude/settings.json");
    await expect(guide.locator("#guide-step-4")).toContainText("%USERPROFILE%\\.claude\\settings.json");
    const configCopy = guide.getByRole("button", { name: locale === "zh" ? "复制配置结构" : "Copy configuration structure" });
    await configCopy.click();
    const copiedConfig = await page.evaluate(() => navigator.clipboard.readText());
    const parsed = JSON.parse(copiedConfig);
    expect(Object.keys(parsed.env)).toEqual(["ANTHROPIC_BASE_URL", "ANTHROPIC_AUTH_TOKEN"]);
    expect(parsed.env.ANTHROPIC_BASE_URL).toMatch(locale === "zh" ? /替换为控制台/ : /REPLACE_WITH/);
    await expect(configCopy).toContainText(locale === "zh" ? "已复制" : "Copied");
    const rules = guide.locator(".guide-rules-table");
    await expect(rules.locator(".is-allowed")).toHaveCount(2);
    await expect(rules.locator(".is-prohibited")).toHaveCount(8);
    for (const forbidden of ["cc-connect", "第三方 Agent", "微信", "手机 App"]) {
      if (locale === "zh") await expect(rules.getByRole("row").filter({ hasText: forbidden }).first()).toContainText("禁止");
    }
    for (const index of [0, 1, 9, 14]) await guide.locator(".guide-faq-list details").nth(index).locator("summary").click();
    await expect(guide.locator("#guide-faq")).toContainText(locale === "zh" ? "不要超过 6 个" : "6 simultaneous sessions");
    await expect(guide.locator("#guide-faq")).toContainText(locale === "zh" ? "一个月" : "one month");
    await expect(guide.locator("#after-sales")).toContainText(locale === "zh" ? "扣除相应手续费" : "less the applicable handling fee");
    await expect(guide.locator("#after-sales")).toContainText(locale === "zh" ? "邮箱和密码，则不提供质保" : "Warranty coverage is not provided");
    const supportCopy = guide.getByRole("button", { name: locale === "zh" ? "复制客服反馈模板" : "Copy support request template" });
    await supportCopy.click();
    const supportTemplate = await page.evaluate(() => navigator.clipboard.readText());
    expect(supportTemplate).toContain(locale === "zh" ? "客户端名称与版本" : "Client name and version");
    expect(supportTemplate).toContain(locale === "zh" ? "打码后的报错或状态截图" : "Redacted error or status screenshots");
    expect(supportTemplate).not.toMatch(/ANTHROPIC_AUTH_TOKEN|password|密码/);
    if (locale === "en") expect(await guide.innerText()).not.toMatch(/\p{Script=Han}/u);
    await noHorizontalOverflow(page);
    await capture(page, testInfo, `guide-${locale}-support`, false);
    if (locale === "en") await guide.getByRole("link", { name: "Back to top", exact: true }).click();
    await guide.getByRole("link", { name: locale === "zh" ? "返回首页" : "Back to home", exact: true }).click();
    await ready(page, locale);
  });
}

for (const width of [320, 390, 768, 1440]) {
  test(`用户指南：${width}px 中英文正文、导航与代码块适配`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const locale of ["zh", "en"] as const) {
      await page.goto(`/guide/?lang=${locale}`);
      const guide = page.locator(".user-guide");
      await expect(guide.getByRole("heading", { level: 1 })).toBeVisible();
      await noHorizontalOverflow(page);
      await contentFitsHorizontally(guide, "h1, h2, h3, h4, button, .guide-hero-actions, .guide-rules-table", "svg, pre");
      await capture(page, testInfo, `guide-${locale}-${width}-top`, false);
      const mobileToc = guide.locator(".guide-mobile-toc");
      if (await mobileToc.isVisible()) {
        await mobileToc.locator("summary").click();
        await mobileToc.getByRole("link", { name: locale === "zh" ? /使用限制/ : /Usage rules/ }).click();
        await expect(mobileToc).not.toHaveAttribute("open");
      } else {
        await guide.getByRole("navigation", { name: locale === "zh" ? "用户指南目录" : "User guide contents", exact: true }).getByRole("link", { name: locale === "zh" ? /使用限制/ : /Usage rules/ }).click();
      }
      await expect(page).toHaveURL(/#usage-rules$/);
      await expect(guide.locator("#usage-rules")).toBeInViewport();
      await noHorizontalOverflow(page);
      await capture(page, testInfo, `guide-${locale}-${width}-rules`, false);
    }
  });
}

test("离线文件静态检查：资源全部内嵌", async () => {
  const html = await readFile(path.resolve("dist/SunNeverSets-preview.html"), "utf8");
  expect(html).toContain('data:image/webp;base64,');
  expect(html).toContain('data:image/svg+xml;base64,');
  expect(html).not.toMatch(/<script[^>]+src=/);
  expect(html).not.toMatch(/<link[^>]+rel="stylesheet"/);
  expect(html).not.toContain('/assets/');
  expect(html).toContain('<script type="module">');
  expect(html).toContain('让想法，');
  const guideEntry = await readFile(path.resolve("dist/guide/index.html"), "utf8");
  expect(guideEntry).toMatch(/<script[^>]+src="\/assets\//);
  expect(guideEntry).toContain('id="root"');
});

for (const mode of [
  { name: 'desktop', width: 1440, height: 1000, reduced: false },
  { name: 'tablet', width: 768, height: 1024, reduced: false },
  { name: 'mobile', width: 390, height: 844, reduced: false },
  { name: 'reduced', width: 1440, height: 1000, reduced: true },
]) {
  test(`${mode.name}: 工作环境收回机内，原地重新展开`, async ({page}, testInfo) => {
    await mkdir(screenshotDirectory, { recursive: true });
    await page.setViewportSize({width: mode.width, height: mode.height});
    if (mode.reduced) await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/');
    await ready(page);
    await revealServices(page);
    const software = page.locator('.layer-object:not(.layer-object-hardware)');
    const hardware = page.locator('.layer-object-hardware');
    const diagram = page.locator('.service-diagram');
    const toggle = page.locator('.service-diagram-toolbar button');
    await expect.poll(() => software.evaluateAll(nodes => nodes.every(node => getComputedStyle(node).getPropertyValue('--emerge').trim() === '1'))).toBe(true);
    const before = await hardware.boundingBox();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    await expect.poll(() => software.evaluateAll(nodes => nodes.every(node => getComputedStyle(node).getPropertyValue('--emerge').trim() === '0' && getComputedStyle(node).opacity === '0'))).toBe(true);
    for (const layer of await software.all()) {
      await expect(layer).toHaveAttribute('aria-hidden','true');
      await expect(layer.locator('button')).toBeDisabled();
      await expect(layer.locator('button')).toHaveAttribute('tabindex','-1');
    }
    const after = await hardware.boundingBox();
    expect(Math.abs(after!.y - before!.y)).toBeLessThan(1);
    expect(Math.abs(after!.width - before!.width)).toBeLessThan(1);
    const centers = await software.evaluateAll(nodes => nodes.map(node => {const r=node.getBoundingClientRect();return r.y+r.height/2}));
    expect(Math.max(...centers)-Math.min(...centers)).toBeLessThan(1);
    await noHorizontalOverflow(page);
    if (mode.name === 'desktop' || mode.name === 'mobile') {
      const shot=path.join(screenshotDirectory, `e2e-service-${mode.name}-retracted.png`);
      await diagram.screenshot({path:shot});
      await testInfo.attach('收回机身',{path:shot,contentType:'image/png'});
    }
    // Descriptions remain useful when the graphical layers are stored inside the Mac.
    const toolsLabel=page.locator('.service-layer-labels').getByRole('button',{name:/托管服务/});
    await toolsLabel.click();
    await expect(toggle).toHaveAttribute('aria-expanded','true');
    await expect(toolsLabel).toHaveAttribute('aria-pressed','true');
    if (mode.name === 'desktop') {
      await page.waitForTimeout(260);
      const clip = await diagram.boundingBox();
      if (clip) await page.screenshot({path:path.join(screenshotDirectory, 'e2e-service-emerging.png'),clip});
    }
    await expect.poll(() => software.evaluateAll(nodes => nodes.every(node => getComputedStyle(node).getPropertyValue('--emerge').trim() === '1'))).toBe(true);
    await page.getByRole('button',{name:'查看运行基础',exact:true}).click();
    await expect(page.getByRole('button',{name:'查看运行基础',exact:true})).toHaveAttribute('aria-pressed','true');
    if (mode.name === 'desktop' || mode.name === 'mobile') {
      await diagram.screenshot({path:path.join(screenshotDirectory, `e2e-service-${mode.name}-expanded.png`)});
    }
    // Interrupt both directions. The most recent action must win without a stale callback.
    await toggle.click(); await toggle.click(); await toggle.click();
    await expect.poll(() => software.evaluateAll(nodes => nodes.every(node => getComputedStyle(node).getPropertyValue('--emerge').trim() === '0' && getComputedStyle(node).opacity === '0'))).toBe(true);
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    await toggle.click();
    await expect.poll(() => software.evaluateAll(nodes => nodes.every(node => getComputedStyle(node).getPropertyValue('--emerge').trim() === '1'))).toBe(true);
  });
}
