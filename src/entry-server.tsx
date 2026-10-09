import React from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { LanguageProvider } from "./i18n";
import type { Locale, PageId } from "./routing";
export { pagePaths, pageHref, siteOrigin } from "./routing";
export { getPageMetadata } from "./data/seo";

export function render(page: PageId, locale: Locale) {
  return renderToString(
    <React.StrictMode>
      <LanguageProvider initialLocale={locale} page={page}><App /></LanguageProvider>
    </React.StrictMode>,
  );
}
