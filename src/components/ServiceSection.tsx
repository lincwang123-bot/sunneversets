import { useEffect, useRef, useState, type ButtonHTMLAttributes } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import {
  Apple,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Globe2,
  Layers3,
  Monitor,
  Settings2,
  Terminal,
  Wifi,
} from "lucide-react";
import {
  getServiceLayers,
  getServiceSummaries,
  type ServiceLayerId,
} from "../data/services";
import ToolIcon from "./ToolIcon";
import { useLanguage } from "../i18n";
import "../styles/service.css";

const layerIcons = {
  monitor: Monitor,
  apple: Apple,
  terminal: Terminal,
  globe: Globe2,
  settings: Settings2,
};
const layerTools = ["Claude", "Claude Code", "Claude Desktop"] as const;

function scrollToHardware() {
  const section = document.getElementById("services");
  const layout = section?.querySelector(".service-layout");
  const visual = section?.querySelector(".service-visual");
  const toolbar = section?.querySelector(".service-diagram-toolbar");
  if (!section || !layout || !visual || !toolbar) return;

  // The scrolled navbar is 70px tall; scrollIntoView would add both the page's
  // scroll-padding and the section's margin, leaving part of the hero visible.
  const navHeight = 70;
  const availableHeight = window.innerHeight - navHeight;
  const layoutRect = layout.getBoundingClientRect();
  const visualRect = visual.getBoundingClientRect();
  const toolbarRect = toolbar.getBoundingClientRect();
  const layoutTop = Math.min(layoutRect.top, toolbarRect.top);
  const wholeLayoutFits = window.innerWidth > 900
    && layoutRect.bottom - layoutTop <= availableHeight - 24;
  const top = wholeLayoutFits ? layoutTop : Math.min(visualRect.top, toolbarRect.top);
  const bottom = wholeLayoutFits ? layoutRect.bottom : visualRect.bottom;
  const inset = Math.max(12, (availableHeight - (bottom - top)) / 2);
  const target = Math.max(
    window.scrollY + top - navHeight - inset,
    window.scrollY + section.getBoundingClientRect().top - navHeight,
  );
  window.scrollTo({
    top: Math.max(0, target),
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
}

function LayerToolIcon({ name, size }: { name: (typeof layerTools)[number]; size: number }) {
  if (name === "Claude") return <ToolIcon name="Claude" size={size} />;
  const Icon = name === "Claude Code" ? Terminal : Monitor;
  return <Icon size={size} strokeWidth={1.6} aria-hidden="true" />;
}

function LayerContent({
  id,
  buttonProps,
}: {
  id: ServiceLayerId;
  buttonProps: ButtonHTMLAttributes<HTMLButtonElement>;
}) {
  const { t } = useLanguage();
  if (id === "hardware")
    return (
      <button {...buttonProps} className="layer-hardware-button">
        <img
          className="layer-hardware-image"
          src="/assets/mac-mini.webp"
          alt={t("银色 Mac mini 硬件示意", "Silver Mac mini hardware illustration")}
          loading="lazy"
          draggable="false"
        />
      </button>
    );
  if (id === "macos")
    return (
      <button {...buttonProps} className="layer-plane layer-os-surface">
        <div className="layer-os-menubar">
          <Apple size={9} fill="currentColor" />
          <span>Finder</span>
          <span>{t("文件", "File")}</span>
          <span>{t("编辑", "Edit")}</span>
          <span>{t("显示", "View")}</span>
          <span className="layer-os-menu-right">
            <Wifi size={8} /> macOS
          </span>
        </div>
        <div className="layer-os-wordmark">{t("海外 Mac 机房基础设施", "Overseas Mac infrastructure.")}</div>
        <div className="layer-os-desktop-file">
          <span />
          <small>{t("机房运行", "Operations")}</small>
        </div>
        <div className="layer-os-dock">
          {layerTools.map((name) => (
            <span key={name}>
              <LayerToolIcon name={name} size={15} />
            </span>
          ))}
        </div>
      </button>
    );
  if (id === "tools")
    return (
      <button {...buttonProps} className="layer-plane layer-tools-surface">
        <div className="layer-tools-path">
          <span className="layer-window-dots">
            <i />
            <i />
            <i />
          </span>
          <span>{t("CLAUDE 一条龙服务", "COMPLETE CLAUDE SERVICE")}</span>
        </div>
        <div className="layer-tool-dock">
          {layerTools.map((name) => (
            <span
              className={`layer-tool-app layer-tool-${name.replace(/\s/g, "").toLowerCase()}`}
              key={name}
            >
              <LayerToolIcon name={name} size={31} />
              <small>{name}</small>
            </span>
          ))}
        </div>
        <div className="layer-tools-bottom">
          <span>{t("账号 · 订阅 · KYC · 席位 · 托管", "ACCOUNT · PLAN · KYC · SLOT · SETUP")}</span>
          <span>{t("五项打包", "ONE BUNDLE")}</span>
        </div>
      </button>
    );
  if (id === "network")
    return (
      <button {...buttonProps} className="layer-plane layer-network-surface">
        <div className="layer-network-label">
          <Globe2 size={10} />
          <span>{t("按教程配置客户端", "GUIDED CLIENT ACCESS")}</span>
          <span className="layer-network-demo">{t("示意", "Illustration")}</span>
        </div>
        <svg
          className="layer-world-map"
          viewBox="0 0 380 172"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="service-map-grid"
              width="19"
              height="19"
              patternUnits="userSpaceOnUse"
            >
              <path d="M19 0H0V19" stroke="#465365" strokeWidth=".5" />
            </pattern>
            <linearGradient id="service-route-gradient">
              <stop stopColor="#a8bacd" stopOpacity=".2" />
              <stop offset=".5" stopColor="#fff" />
              <stop offset="1" stopColor="#e1a976" />
            </linearGradient>
          </defs>
          <rect
            width="380"
            height="172"
            fill="url(#service-map-grid)"
            opacity=".32"
          />
          <g fill="#324151" stroke="#657586" strokeWidth=".7">
            <path d="M43 36 63 23 88 25 101 36 127 29 138 42 123 56 108 56 106 70 90 78 82 92 66 88 62 68 48 65 40 51Z" />
            <path d="m93 90 17 3 12 17-1 18-9 26-8-5-3-27-13-17Z" />
            <path d="m161 33 21-9 14 11 17-5 10 8 29-8 35 8 11 17 23 3 13 15-8 15-28-4-14 7-15-11-12-1-5 15-17-4-9-19-20-4-6-14-20 3-12-10Z" />
            <path d="m182 65 22 6 14 20-10 24-9 17-12-6-6-22-10-19Z" />
            <path d="m292 118 23-5 17 14-5 13-22 3-15-12Z" />
            <path d="m135 17 15-6 11 10-10 15-13-1Z" />
            <path d="m274 89 10 14 10 1 7 11-7 2-15-15-10-8Z" />
          </g>
          <g stroke="url(#service-route-gradient)" strokeWidth="1.5">
            <path d="M77 64Q161-20 270 76" />
            <path d="M77 64Q106 35 187 57" />
            <path d="M187 57Q239 18 270 76" />
            <path d="M270 76Q305 82 310 125" />
          </g>
          {[
            [77, 64],
            [187, 57],
            [270, 76],
            [310, 125],
          ].map(([x, y]) => (
            <g key={x}>
              <circle cx={x} cy={y} r="5" fill="#eac096" opacity=".16" />
              <circle cx={x} cy={y} r="2" fill="#eac096" />
            </g>
          ))}
        </svg>
        <div className="layer-network-bottom">
          <span>{t("本机客户端", "LOCAL CLIENT")}</span>
          <span>{t("控制台地址与密钥", "CONSOLE URL & KEY")}</span>
        </div>
      </button>
    );
  return (
    <button {...buttonProps} className="layer-plane layer-support-surface">
      <div className="layer-support-top">
        <span className="layer-window-dots">
          <i />
          <i />
          <i />
        </span>
        <span>{t("配置与支持", "SETUP & SUPPORT")}</span>
        <Settings2 size={11} />
      </div>
      <div className="layer-support-dashboard">
        <div className="layer-support-nav">
          <span className="layer-support-nav-active" />
          <span />
          <span />
          <span />
        </div>
        <div className="layer-support-main">
          <div className="layer-support-greeting">
            {t("每一步，都有配置说明。", "Guidance for every step.")}
          </div>
          <div className="layer-support-lines">
            <i />
            <i />
          </div>
          <div className="layer-support-checks">
            <span>
              <Check size={9} /> {t("交付确认", "Delivery confirmed")}
            </span>
            <span>
              <Check size={9} /> {t("配置说明", "Setup guidance")}
            </span>
            <span>
              <Check size={9} /> {t("问题排查", "Troubleshooting")}
            </span>
          </div>
        </div>
        <div className="layer-support-detail">
          <Settings2 size={18} />
          <span>{t("按步骤开始", "Start with guidance.")}</span>
          <small>{t("先确认，再配置。", "Confirm, then configure.")}</small>
        </div>
      </div>
      <div className="layer-support-footer">
        {t("配置支持", "Setup support")}<span>{t("交付说明 · 客户端配置 · 打码反馈", "Delivery · Client setup · Redacted reports")}</span>
      </div>
    </button>
  );
}

export default function ServiceSection({
  onLearnMore,
  hardwareFocusToken,
}: {
  onLearnMore: () => void;
  hardwareFocusToken: number;
}) {
  const { locale, t } = useLanguage();
  const serviceLayers = getServiceLayers(locale);
  const serviceSummaries = getServiceSummaries(locale);
  const diagramRef = useRef<HTMLDivElement>(null);
  const inView = useInView(diagramRef, { once: true, amount: 0.25 });
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState<ServiceLayerId>("hardware");
  const [hovered, setHovered] = useState<ServiceLayerId | null>(null);
  const hasEntered = inView || reducedMotion;
  const active = serviceLayers.find((layer) => layer.id === selected)!;
  const environmentOpen = Boolean(hasEntered && expanded);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!hardwareFocusToken) return;
    setSelected("hardware");
    setExpanded(true);
    // Measure after selection and the mobile navigation have updated their DOM.
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(scrollToHardware);
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [hardwareFocusToken]);

  function selectLayer(id: ServiceLayerId) {
    setSelected(id);
    if (id !== "hardware") setExpanded(true);
  }

  function toggleEnvironment() {
    if (expanded) {
      setSelected("hardware");
      setHovered(null);
      // A layer that is returning inside the Mac must not retain keyboard focus.
      if (document.activeElement?.closest(".layer-object")) toggleRef.current?.focus();
    }
    setExpanded(value => !value);
  }
  return (
    <section
      id="services"
      className="service-section"
      aria-labelledby="service-heading"
    >
      <div className="service-layout">
        <div className="service-copy">
          <p className="service-eyebrow">
            01 <span>/</span> WHAT YOU GET
          </p>
          <h2 id="service-heading">
            {t("海外 Mac 机房打底。", "Overseas Mac infrastructure.")}
            <br />
            {t("Claude 服务，五项打包。", "A complete Claude bundle.")}
          </h2>
          <p className="service-description">
            {t("账号、订阅、KYC、托管席位与操作一起准备。", "Your account, subscription, KYC, hosting slot, and setup come together.")}
            <br />
            {t("你在自己的电脑上，按教程配置 Code 或 Desktop。", "Configure Code or Desktop on your own computer with our guides.")}
          </p>
          <ol className="service-use-steps" aria-label={t("Claude 服务开通步骤", "Steps to start using the Claude service")}>
            <li><span>01</span><div><strong>{t("确认套餐与交付", "Confirm your package and delivery")}</strong><p>{t("选择 Max 5X 或 Max 20X，付款前确认订阅起止、交付安排与质保范围。", "Choose Max 5X or Max 20X. Confirm subscription dates, delivery arrangements, and warranty coverage before paying.")}</p></div></li>
            <li><span>02</span><div><strong>{t("在控制台创建接入点", "Create an access point in the console")}</strong><p>{t("用客服确认的邮箱登录，核对账号已就绪，再创建接入点并取得地址与密钥。", "Sign in with the email confirmed by support, check that the account is ready, then create an access point for its address and key.")}</p></div></li>
            <li><span>03</span><div><strong>{t("在本机配置客户端", "Configure your local client")}</strong><p>{t("仅按项目教程配置 Claude Code 或 Claude Desktop，先发一条简单消息确认接入。", "Follow the project guide for Claude Code or Claude Desktop, then send a simple message to verify the connection.")}</p></div></li>
          </ol>
          <button className="service-learn-button" onClick={onLearnMore}>
            {t("查看开通前的问题", "Before you get started")} <ArrowRight size={17} />
          </button>
          <div className="service-summaries">
            {serviceSummaries.map((item) => (
              <div className="service-summary" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="service-visual" ref={diagramRef}>
          <div className="service-diagram-toolbar">
            <span>
              <Layers3 size={13} /> {t("从机房基础，到套餐交付", "From infrastructure to your service")}
            </span>
            <button
              ref={toggleRef}
              onClick={toggleEnvironment}
              aria-expanded={expanded}
              aria-controls="service-layer-stack"
            >
              {expanded ? <ChevronDown size={13} /> : <ChevronUp size={13} />}{" "}
              {expanded ? t("收回机身", "Fold into Mac") : t("展开服务构成", "Explore the service")}
            </button>
          </div>
          <div
            className={`service-diagram ${expanded ? "service-diagram-expanded" : "service-diagram-collapsed"}`}
            id="service-layer-stack"
          >
            <div className="layer-floor-shadow" />
            {serviceLayers.map((layer, index) => {
              const isHardware = layer.id === "hardware";
              const isActive = selected === layer.id;
              const isHighlighted = (hovered ?? selected) === layer.id;
              return (
                <motion.div
                  key={layer.id}
                  className={`layer-object layer-object-${layer.id} ${isHighlighted ? "layer-is-highlighted" : ""}`}
                  aria-hidden={!isHardware && !environmentOpen}
                  inert={!isHardware && !environmentOpen}
                  data-layer={layer.id}
                  initial={false}
                  animate={isHardware ? {} : { "--emerge": environmentOpen ? 1 : 0 }}
                  transition={{
                    duration: reducedMotion ? 0 : environmentOpen ? 0.9 : 0.6,
                    delay: reducedMotion || isHardware ? 0 : environmentOpen ? (index - 1) * 0.13 : (4 - index) * 0.055,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <LayerContent
                    id={layer.id}
                    buttonProps={{
                      type: "button",
                      "aria-label": t(`查看${layer.title}`, `Explore ${layer.title}`),
                      "aria-pressed": isActive,
                      tabIndex: isHardware || environmentOpen ? 0 : -1,
                      disabled: !isHardware && !environmentOpen,
                      onClick: () => selectLayer(layer.id),
                      onMouseEnter: () => setHovered(layer.id),
                      onMouseLeave: () => setHovered(null),
                      onFocus: () => setHovered(layer.id),
                      onBlur: () => setHovered(null),
                    }}
                  />
                </motion.div>
              );
            })}
            <div className="service-layer-labels">
              {[...serviceLayers].reverse().map((layer, index) => {
                const Icon = layerIcons[layer.icon];
                return (
                  <motion.button
                    key={layer.id}
                    className={`service-layer-label ${selected === layer.id ? "service-layer-label-selected" : ""} ${(hovered ?? selected) === layer.id ? "service-layer-label-highlighted" : ""}`}
                    onClick={() => selectLayer(layer.id)}
                    onMouseEnter={() => setHovered(layer.id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(layer.id)}
                    onBlur={() => setHovered(null)}
                    aria-pressed={selected === layer.id}
                    initial={false}
                    animate={{
                      opacity: hasEntered ? 1 : 0,
                      x: hasEntered ? 0 : 8,
                    }}
                    transition={{
                      duration: reducedMotion ? 0 : 0.45,
                      delay: reducedMotion ? 0 : (4 - index) * 0.06,
                    }}
                  >
                    <span className="service-layer-connector" />
                    <Icon size={18} strokeWidth={1.65} />
                    <span>
                      <strong>{layer.title}</strong>
                      <small>{layer.description}</small>
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
          <div
            className="service-selected-detail"
            aria-live="polite"
            aria-atomic="true"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={{
                  opacity: reducedMotion ? 1 : 0,
                  y: reducedMotion ? 0 : 3,
                }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: reducedMotion ? 1 : 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.15 }}
              >
                <span>{active.eyebrow}</span>
                <p>{active.detail}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
