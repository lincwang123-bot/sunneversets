import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { pageHref, resolveRoute, type Locale, type PageId } from "./routing";
import { updatePageMetadata } from "./data/seo";
export type { Locale } from "./routing";

const LanguageContext = createContext<{
  locale: Locale;
  page: PageId;
  setLocale: (locale: Locale) => void;
  t: (zh: string, en: string) => string;
} | null>(null);

export function LanguageProvider({ children, initialLocale = "zh", page = "home" }: { children: ReactNode; initialLocale?: Locale; page?: PageId }) {
  const [locale, updateLocale] = useState<Locale>(initialLocale);
  const setLocale = useCallback((next: Locale) => {
    if (window.location.protocol === "file:") { updateLocale(next); return; }
    const url = new URL(window.location.href);
    url.pathname = pageHref(page, next);
    url.searchParams.delete("lang");
    window.history.pushState(null, "", url);
    updateLocale(next);
  }, [page]);

  useEffect(() => {
    updatePageMetadata(page, locale);
    try { localStorage.setItem("sunneversets-language", locale); } catch { /* Storage is optional. */ }
  }, [locale, page]);

  useEffect(() => {
    const restore = () => updateLocale(resolveRoute(window.location.pathname)?.locale ?? "zh");
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  const t = useCallback((zh: string, en: string) => locale === "en" ? en : zh, [locale]);
  return <LanguageContext.Provider value={{ locale, page, setLocale, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const language = useContext(LanguageContext);
  if (!language) throw new Error("useLanguage requires LanguageProvider");
  return language;
}
