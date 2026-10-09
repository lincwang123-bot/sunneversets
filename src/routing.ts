export type Locale = "zh" | "en";
export const pagePaths = {
  home: "/",
  guide: "/guide/",
  pricing: "/pricing/",
  setup: "/guides/claude-code-setup/",
  troubleshooting: "/guides/troubleshooting/",
} as const;
export type PageId = keyof typeof pagePaths;
export const siteOrigin = "https://sunneversets.ai";

export function pageHref(page: PageId, locale: Locale): string {
  return `${locale === "en" ? "/en" : ""}${pagePaths[page]}`;
}

export function resolveRoute(pathname: string): { page: PageId; locale: Locale } | null {
  let path = pathname.replace(/\/index\.html$/, "/");
  if (!path.endsWith("/")) path += "/";
  const locale: Locale = path.startsWith("/en/") ? "en" : "zh";
  if (locale === "en") path = path.slice(3);
  const page = (Object.keys(pagePaths) as PageId[]).find(key => pagePaths[key] === path);
  return page ? { page, locale } : null;
}
