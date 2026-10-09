import { useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ServiceSection from "./components/ServiceSection";
import ProjectStory from "./components/ProjectStory";
import Panels from "./components/Panels";
import type { PlanId } from "./data/business";
import UserGuide from "./components/UserGuide";
import type { PanelKind } from "./components/Panels";
import BrandMark from "./components/BrandMark";
import { useLanguage } from "./i18n";
import { pageHref } from "./routing";
import ResourcePage from "./components/ResourcePage";

export default function App() {
  const { locale, page, t } = useLanguage();
  const isHome = page === "home";
  const [panel, setPanel] = useState<PanelKind>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("max5x");
  const [scenario, setScenario] = useState("coding");
  const [hardwareFocusToken, setHardwareFocusToken] = useState(0);
  function showHardware() {
    if (!isHome) { window.location.href = `${pageHref("home", locale)}#services`; return; }
    setHardwareFocusToken((value) => value + 1);
  }
  useEffect(() => {
    if (!isHome) return;
    const focusHardwareHash = () => {
      if (window.location.hash === "#services") {
        setHardwareFocusToken((value) => value + 1);
      }
    };
    window.addEventListener("hashchange", focusHardwareHash);
    // Run after the browser's initial fragment jump, including guide → home links.
    if (document.readyState === "complete") focusHardwareHash();
    else window.addEventListener("load", focusHardwareHash, { once: true });
    return () => {
      window.removeEventListener("hashchange", focusHardwareHash);
      window.removeEventListener("load", focusHardwareHash);
    };
  }, [isHome]);
  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="skip-link">
        {t("跳至主要内容", "Skip to main content")}
      </a>
      <Navbar onOpen={setPanel} onHardware={showHardware} />
      <main id="main">
        {page === "guide" ? <UserGuide /> : !isHome ? <ResourcePage page={page as "pricing" | "setup" | "troubleshooting"} /> : <>
        <HeroSection
          onOpen={setPanel}
          scenario={scenario}
          onScenarioChange={setScenario}
        />
        <ServiceSection
          onLearnMore={() => setPanel("help")}
          hardwareFocusToken={hardwareFocusToken}
        />
        <ProjectStory onStart={(plan) => { setSelectedPlan(plan); setPanel("start"); }} />
        </>}
      </main>
      <footer className="site-footer">
        <a className="footer-brand" href={`${pageHref("home", locale)}#product`} aria-label={t("SunNeverSets 日不落，返回首页", "SunNeverSets, back to home")}>
          <BrandMark />
          <b>SunNeverSets</b>{locale === "zh" && <span className="brand-chinese">日不落</span>}
        </a>
        <span>{t("海外 Mac 机房 · Claude Max 一条龙服务 · 设备与工具画面为使用示意", "Overseas Mac facility · Claude Max packages · Device and tool screens are illustrative")}</span>
        <nav className="footer-links" aria-label={t("网站目录", "Site links")}>
          <a href={pageHref("pricing", locale)}>{t("套餐与交付", "Plans")}</a>
          <a href={pageHref("setup", locale)}>{t("接入教程", "Setup")}</a>
          <a href={pageHref("troubleshooting", locale)}>{t("问题排查", "Troubleshooting")}</a>
          <a href={`${pageHref("guide", locale)}#guide-faq`}>{t("常见问题", "FAQ")}</a>
          <a href={pageHref(page, locale === "zh" ? "en" : "zh")} hrefLang={locale === "zh" ? "en" : "zh-CN"}>{locale === "zh" ? "English" : "简体中文"}</a>
        </nav>
      </footer>
      <Panels
        initialPlan={selectedPlan}
        kind={panel}
        onClose={() => setPanel(null)}
        scenario={scenario}
        onScenarioChange={setScenario}
      />
    </MotionConfig>
  );
}
