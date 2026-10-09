import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  Headphones,
  Monitor,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { assets, getDevice, motionConfig } from "../data/content";
import { useLanguage } from "../i18n";
import { contact } from "../data/business";
import WorkspaceScreen from "./WorkspaceScreen";
import ToolIcon from "./ToolIcon";
import type { PanelKind } from "./Panels";
import "../styles/hero.css";

export default function HeroSection({
  onOpen,
  scenario,
  onScenarioChange,
}: {
  onOpen: (kind: PanelKind) => void;
  scenario: string;
  onScenarioChange: (id: string) => void;
}) {
  const { locale, t } = useLanguage();
  const device = getDevice(locale);
  const features = [
    { icon: Zap, title: t("五项打包", "One complete package"), description: t("账号、订阅、KYC 与托管", "Account, plan, KYC & hosting") },
    { icon: Monitor, title: t("海外 Mac 机房", "Overseas Mac facility"), description: t("我们维护的硬件基础设施", "Our hardware infrastructure") },
    { icon: Headphones, title: t("本机使用", "Use your own computer"), description: t("Claude Code / Desktop", "Claude Code / Desktop") },
    { icon: ShieldCheck, title: t("明确的售后规则", "Clear support terms"), description: t("付款前确认质保与服务范围", "Confirm coverage before payment") },
  ];
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const visible = useInView(heroRef, { amount: 0.15 });
  const [pageVisible, setPageVisible] = useState(true);
  const [assetsReady, setAssetsReady] = useState(false);
  const [failedAssets, setFailedAssets] = useState(false);
  const [replay, setReplay] = useState(0);
  const [settled, setSettled] = useState(false);
  const [skipIntro, setSkipIntro] = useState(false);
  const staticScene = reduced || skipIntro || failedAssets;
  useEffect(() => {
    let active = true;
    const loads = Object.values(assets).map(
      (src) =>
        new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = src;
          if (img.complete) resolve(img.naturalWidth > 0);
        }),
    );
    Promise.all(loads).then((results) => {
      if (active) {
        setFailedAssets(results.some((loaded) => !loaded));
        setAssetsReady(true);
      }
    });
    const timeout = window.setTimeout(() => {
      if (active) {
        setAssetsReady(true);
        setSkipIntro(true);
      }
    }, 6000);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, []);
  useEffect(() => {
    const update = () => {
      setPageVisible(!document.hidden);
      if (document.hidden) setSkipIntro(true);
    };
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!visible && settled) setSkipIntro(true);
  }, [visible, settled]);
  useEffect(() => {
    if (!assetsReady) return;
    const timer = setTimeout(
      () => setSettled(true),
      staticScene ? 0 : motionConfig.duration * 1000,
    );
    return () => clearTimeout(timer);
  }, [assetsReady, replay, staticScene]);
  const enter = (delay: number, offset = 16) => ({
    initial: staticScene ? (false as const) : { opacity: 0, y: offset },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: staticScene ? 0 : 0.65,
      delay: staticScene ? 0 : delay,
      ease: motionConfig.easing,
    },
  });
  return (
    <section
      id="product"
      ref={heroRef}
      className={`hero ${visible && pageVisible ? "" : "animation-paused"}`}
      aria-labelledby="hero-title"
    >
      <div className="hero-background" aria-hidden="true" />
      <div className="hero-copy">
        <h1 id="hero-title">
          {t("让想法，", "Your ideas.")}
          <br />
          {t("始终在线。", "Always on.")}
        </h1>
        <p className="hero-description">
          {t("Claude 账号、Max 订阅与托管，一次安排好。", "Your Claude account, Max plan, and hosting, prepared together. ")}
          <br className="desktop-break" />
          {t("在你自己的电脑上，用 Claude Code 与 Desktop 开始创作。", "Build on your own computer with Claude Code and Claude Desktop.")}
        </p>
        <div className="hero-actions">
          <a
            className="button button-light"
            href={contact.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("联系客服购买", "Contact sales")} <ArrowRight size={18} />
          </a>
          <button
            className="button button-outline"
            onClick={() => onOpen("demo")}
          >
            {t("看看怎么用", "Explore the demo")} <Play size={15} />
          </button>
        </div>
      </div>
      <div
        className="hero-scene"
        data-state={
          !assetsReady
            ? "loading"
            : settled || staticScene
              ? "ready"
              : "assembling"
        }

      >
        {assetsReady && (
          <motion.div
            key={replay}
            className="hero-scene-inner"
          >
            <motion.div className="hero-mini" {...enter(0, -8)}>
              <img
                src={assets.mac}
                alt={t("独立呈现的银色 Mac mini 演示硬件", "Silver Mac mini shown as example hardware")}
                fetchPriority="high"
              />
            </motion.div>
            <motion.div className="hero-monitor" {...enter(0.3, -16)}>
              <img
                className="monitor-image"
                src={assets.monitor}
                alt={t("桌面显示器与银色支架", "Desktop monitor with a silver stand")}
                fetchPriority="high"
              />
              <div className="screen-plane">
                <div className="screen-glow" />
                <motion.div className="screen-ui" {...enter(1.4, 4)}>
                  <WorkspaceScreen
                    scenario={scenario}
                    onScenarioChange={onScenarioChange}
                  />
                </motion.div>
              </div>
            </motion.div>
            {!staticScene && !settled && (
              <div className="assembly-stack" aria-hidden="true">
                {["macOS", t("AI 工具环境", "AI tools"), t("你的工作空间", "Your workspace")].map((name, index) => (
                  <motion.div
                    key={name}
                    className={`assembly-sheet assembly-sheet-${index}`}
                    initial={{ opacity: 0, y: 28, scale: 0.9, rotateX: 48 }}
                    animate={{
                      opacity: [0, 0.96, 0.96, 0],
                      y: [28, -80 + index * 60, -80 + index * 60, 0],
                      rotateX: [48, 48, 48, 0],
                      scale: [0.9, 0.96, 0.96, 1],
                    }}
                    transition={{
                      duration: 1.2,
                      delay: 0.55 + index * 0.15,
                      times: [0, 0.2, 0.72, 1],
                      ease: motionConfig.easing,
                    }}
                  >
                    <span>{name}</span>
                    <div>
                      {index === 1 ? (
                        ["Claude Code", "Claude Desktop"].map(
                          (tool) => (
                            <ToolIcon key={tool} name={tool} size={26} />
                          ),
                        )
                      ) : (
                        <>
                          <i />
                          <i />
                          <i />
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            <motion.aside
              className="device-card"
              aria-label={t("演示设备信息", "Example device specifications")}
              {...enter(1.6, 10)}
            >
              <div className="device-card-head">
                <strong>{device.name}</strong>
                <span>
                  <i className="status-dot" />
                  {device.status}
                </span>
              </div>
              <div className="device-demo-label">{t("机房整机示意 · 配置暂定", "Facility hardware · Provisional specs")}</div>
              <dl>
                <div>
                  <dt>{t("部署地区", "Location")}</dt>
                  <dd>{device.location}</dd>
                </div>
                <div>
                  <dt>{t("计划机型", "Planned chip")}</dt>
                  <dd>{device.chip}</dd>
                </div>
                <div>
                  <dt>{t("计划内存", "Planned memory")}</dt>
                  <dd>{device.memory}</dd>
                </div>
                <div>
                  <dt>{t("计划存储", "Planned storage")}</dt>
                  <dd>{device.storage}</dd>
                </div>
              </dl>
            </motion.aside>
          </motion.div>
        )}
        {!assetsReady && (
          <div className="scene-loading" role="status">
            {t("正在准备工作环境演示…", "Preparing your workspace demo…")}
          </div>
        )}
        {failedAssets && (
          <span className="asset-warning">
            {t("部分视觉素材暂不可用，演示功能仍可使用。", "Some images are unavailable. You can still use the demo.")}
          </span>
        )}
        <span className="scene-handwriting" aria-hidden="true">
          Your ideas.
          <br />
          Always on.
        </span>
      </div>
      <div className="feature-row">
        {features.map(({ icon: Icon, title, description }) => (
          <div className="feature" key={title}>
            <Icon size={24} strokeWidth={1.5} />
            <div>
              <strong>{title}</strong>
              <span>{description}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="hero-bottom">
        <a href="#services">
          <span>SCROLL</span> {t("探索更多", "Discover more")} <ArrowDown size={15} />
        </a>
        <button
          className="replay-button"
          disabled={!assetsReady}
          onClick={() => {
            setSkipIntro(false);
            setSettled(false);
            setReplay((value) => value + 1);
          }}
        >
          <RotateCcw size={12} /> {t("重播开场", "Replay intro")}
        </button>
      </div>
    </section>
  );
}
