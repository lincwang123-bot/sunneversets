import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LanguageProvider } from "./i18n";
import { pageHref, resolveRoute } from "./routing";
import "./styles/global.css";
import "./styles/english.css";

const route = resolveRoute(window.location.pathname) ?? { page: "home", locale: "zh" };
const url = new URL(window.location.href);
const legacyLocale = url.searchParams.get("lang");
let redirecting = false;
if ((legacyLocale === "en" || legacyLocale === "zh") && url.protocol !== "file:") {
  url.searchParams.delete("lang");
  const pathname = pageHref(route.page, legacyLocale);
  if (url.pathname !== pathname) {
    url.pathname = pathname;
    window.location.replace(url);
    redirecting = true;
  } else window.history.replaceState(null, "", url);
}
const root = document.getElementById("root")!;
const app = (
  <React.StrictMode>
    <LanguageProvider initialLocale={route.locale} page={route.page}><App /></LanguageProvider>
  </React.StrictMode>
);
if (!redirecting) {
  if (root.dataset.prerendered === "true") ReactDOM.hydrateRoot(root, app);
  else ReactDOM.createRoot(root).render(app);
}
