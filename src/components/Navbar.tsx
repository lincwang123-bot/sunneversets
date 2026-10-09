import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe2, Menu, X } from "lucide-react";
import type { PanelKind } from "./Panels";
import BrandMark from "./BrandMark";
import { useLanguage, type Locale } from "../i18n";
import { contact } from "../data/business";
import { pageHref } from "../routing";

export default function Navbar({ onOpen, onHardware }: {
  onOpen: (kind: PanelKind) => void;
  onHardware: () => void;
}) {
  const { locale, page, setLocale, t } = useLanguage();
  const isInterior = page !== "home";
  const home = isInterior ? pageHref("home", locale) : "";
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [language, setLanguage] = useState(false);
  const languageButton = useRef<HTMLButtonElement>(null);
  const mobileButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 35);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mobile) mobileButton.current?.focus();
        else if (language) languageButton.current?.focus();
        setMobile(false);
        setLanguage(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [mobile, language]);
  function open(kind: PanelKind) {
    setMobile(false);
    setLanguage(false);
    onOpen(kind);
  }
  function choose(next: Locale, fromMobile = false) {
    setLocale(next);
    setLanguage(false);
    if (fromMobile) {
      setMobile(false);
      mobileButton.current?.focus();
    } else languageButton.current?.focus();
  }
  function options(fromMobile = false) {
    return ([['zh', '简体中文'], ['en', 'English']] as const).map(([value, label]) => (
      <a key={value} href={pageHref(page, value)} hrefLang={value === 'zh' ? 'zh-CN' : 'en'} lang={value === 'zh' ? 'zh-CN' : 'en'}
        aria-current={locale === value ? "true" : undefined} onClick={(event) => {
          if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
            event.preventDefault(); choose(value, fromMobile);
          }
        }}>
        {label}{locale === value && <Check size={14} aria-hidden="true" />}
      </a>
    ));
  }
  return (
    <header className={`navbar ${scrolled || isInterior ? "is-scrolled" : ""}`}>
      <a className="brand" href={`${home}#product`} aria-label={t("SunNeverSets 日不落计划，返回首页", "SunNeverSets, back to home")}>
        <BrandMark /><b>SunNeverSets</b>
        {locale === "zh" && <span className="brand-chinese">日不落</span>}
      </a>
      <nav aria-label={t("主导航", "Main navigation")} className={mobile ? "nav-links is-open" : "nav-links"}>
        <a href={`${home}#product`} onClick={() => setMobile(false)}>{t("产品", "Product")}</a>
        <button onClick={() => open("demo")}>{t("如何使用", "How it works")}</button>
        <button onClick={() => { setMobile(false); onHardware(); }}>{t("海外机房", "Mac facility")}</button>
        <a href={pageHref("pricing", locale)} onClick={() => setMobile(false)}>{t("费用说明", "Pricing")}</a>
        <a href={pageHref("guide", locale)} onClick={() => setMobile(false)}>{t("用户指南", "User guide")}</a>
        <button onClick={() => open("help")}>{t("常见问题", "FAQ")}</button>
        <button className="nav-mobile-language" aria-expanded={language} aria-controls="mobile-language-menu"
          onClick={() => setLanguage(!language)}>{t("语言：简体中文", "Language: English")}</button>
        {language && <div className="nav-mobile-language mobile-language-options" id="mobile-language-menu"
          role="group" aria-label={t("选择语言", "Choose language")}>{options(true)}</div>}
      </nav>
      <div className="nav-actions">
        <div className="language-wrapper" onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setLanguage(false);
        }}>
          <button ref={languageButton} className="language-button" aria-label={t("简体中文", "English")}
            aria-expanded={language} aria-controls="language-menu" onClick={() => setLanguage(!language)}>
            <Globe2 size={16} aria-hidden="true" /><span>{t("简体中文", "English")}</span><ChevronDown size={12} aria-hidden="true" />
          </button>
          {language && <div className="language-menu" id="language-menu" role="group" aria-label={t("选择语言", "Choose language")}>{options()}</div>}
        </div>
        <a className="button button-light nav-start" href={contact.link} target="_blank" rel="noopener noreferrer">{t("联系客服", "Contact sales")}</a>
        <button ref={mobileButton} className="mobile-toggle" aria-label={mobile ? t("关闭导航", "Close navigation") : t("打开导航", "Open navigation")}
          aria-expanded={mobile} onClick={() => { setMobile(!mobile); setLanguage(false); }}>
          {mobile ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
