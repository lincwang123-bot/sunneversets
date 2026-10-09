import { pageHref, siteOrigin, type Locale, type PageId } from "../routing";

const copy: Record<PageId, Record<Locale, { title: string; description: string; name: string }>> = {
  home: {
    zh: { title: "Claude Max 订阅与托管服务｜SunNeverSets 日不落", name: "日不落首页", description: "想用 AI 编程做产品，把账号与接入准备交给日不落。Claude Max 账号、订阅、KYC、托管席位与操作五项打包；海外 Mac 机房支持，在自己的电脑上使用 Claude Code 或 Desktop。" },
    en: { title: "Claude Max Subscription & Hosting Packages | SunNeverSets", name: "SunNeverSets home", description: "Build with AI on your own computer. SunNeverSets bundles a Claude Max account, subscription, KYC, hosting seat and setup, supported by overseas Mac infrastructure. Explore plans and connection guides." },
  },
  guide: {
    zh: { title: "日不落用户指南：接入、使用限制与售后｜SunNeverSets", name: "用户指南", description: "日不落用户使用指南：控制台登录、接入点创建、Claude Code 配置、Desktop 接入说明、会话与额度限制、故障排查及退款质保条件。" },
    en: { title: "User Guide: Setup, Usage Rules & Support | SunNeverSets", name: "User guide", description: "The SunNeverSets user guide covers console sign-in, endpoints, Claude Code configuration, Desktop setup guidance, session limits, troubleshooting, warranty and refund conditions." },
  },
  pricing: {
    zh: { title: "Claude Max 5X / 20X 套餐价格与交付｜日不落", name: "套餐与交付", description: "日不落 Claude Max 5X 先导价 1299 元、Max 20X 先导价 2299 元，服务周期均为一个月。查看五项打包内容、开通流程、使用范围与售后条件，咨询购买先联系 Telegram 客服。" },
    en: { title: "Claude Max 5X / 20X Pricing & Delivery | SunNeverSets", name: "Plans and delivery", description: "Introductory pricing: Claude Max 5X at CNY 1,299 and Max 20X at CNY 2,299, each for one month. Review the five-part package, delivery process and support terms. Contact sales on Telegram." },
  },
  setup: {
    zh: { title: "Claude Code 接入教程：Windows / macOS 配置｜日不落", name: "Claude Code 接入教程", description: "日不落用户专用 Claude Code 接入教程：从控制台取得地址与密钥，在 Windows 或 macOS 合并 settings.json 配置，再发送测试消息核对调用记录。" },
    en: { title: "Claude Code Setup for Windows & macOS | SunNeverSets", name: "Claude Code setup", description: "A connection guide for SunNeverSets customers: get your endpoint URL and key, merge settings.json on Windows or macOS, then test Claude Code and confirm the request in your console." },
  },
  troubleshooting: {
    zh: { title: "Claude Code 无法连接、额度与账号问题排查｜日不落", name: "问题排查", description: "日不落接入问题排查：收不到验证码、账号未就绪、Claude Code 无法连接、额度用完、用量异常和封号通知。按控制台状态定位问题，并准备客服所需信息。" },
    en: { title: "Claude Code Connection & Usage Troubleshooting | SunNeverSets", name: "Troubleshooting", description: "Troubleshoot SunNeverSets verification codes, account readiness, Claude Code connections, usage limits and suspension notices. Check console status and prepare the right details for support." },
  },
};

export function getPageMetadata(page: PageId, locale: Locale) {
  const details = copy[page][locale];
  const canonical = siteOrigin + pageHref(page, locale);
  const language = locale === "en" ? "en" : "zh-CN";
  const organization = { "@type": "Organization", "@id": `${siteOrigin}/#organization`, name: "SunNeverSets 日不落", url: `${siteOrigin}/`, logo: `${siteOrigin}/assets/sunneversets-logo.png` };
  const graph: object[] = [organization,
    { "@type": "WebSite", "@id": `${siteOrigin}/#website`, name: "SunNeverSets", alternateName: "日不落", url: `${siteOrigin}/`, inLanguage: ["zh-CN", "en"], publisher: { "@id": organization["@id"] } },
    { "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: details.title, description: details.description, inLanguage: language, isPartOf: { "@id": `${siteOrigin}/#website` }, publisher: { "@id": organization["@id"] }, ...(page !== "home" ? { breadcrumb: { "@id": `${canonical}#breadcrumb` } } : {}) },
  ];
  if (page !== "home") graph.push({ "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [
    { "@type": "ListItem", position: 1, name: copy.home[locale].name, item: siteOrigin + pageHref("home", locale) },
    { "@type": "ListItem", position: 2, name: details.name, item: canonical },
  ] });
  return { ...details, canonical, language, alternates: { zh: siteOrigin + pageHref(page, "zh"), en: siteOrigin + pageHref(page, "en") }, structuredData: { "@context": "https://schema.org", "@graph": graph } };
}

export function updatePageMetadata(page: PageId, locale: Locale) {
  const meta = getPageMetadata(page, locale);
  document.title = meta.title;
  document.documentElement.lang = meta.language;
  const description = document.querySelector('meta[name="description"]');
  description?.setAttribute("content", meta.description);
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", meta.canonical);
  const properties = {
    "og:title": meta.title, "og:description": meta.description, "og:url": meta.canonical,
    "og:locale": locale === "en" ? "en_US" : "zh_CN",
    "og:locale:alternate": locale === "en" ? "zh_CN" : "en_US",
  };
  for (const [key, content] of Object.entries(properties)) document.querySelector(`meta[property="${key}"]`)?.setAttribute("content", content);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", meta.title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", meta.description);
  const structuredData = document.querySelector('script[type="application/ld+json"]');
  if (structuredData) structuredData.textContent = JSON.stringify(meta.structuredData);
}
