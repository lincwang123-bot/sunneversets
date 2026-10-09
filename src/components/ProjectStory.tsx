import { ArrowRight } from "lucide-react";
import { plans, getServiceBundle, type PlanId } from "../data/business";
import { useLanguage } from "../i18n";
import { pageHref } from "../routing";
import ContactOptions from "./ContactOptions";
import "../styles/story.css";

export default function ProjectStory({ onStart }: { onStart: (plan: PlanId) => void }) {
  const { locale, t } = useLanguage();
  return (
    <section className="project-story" aria-labelledby="story-heading">
      <div className="story-intro">
        <span className="story-eyebrow">02 / FROM IDEA TO PROJECT</span>
        <h2 id="story-heading">{t("把时间留给想法，", "More time for ideas.")}<br />{t("把准备交给我们。", "Let us handle the setup.")}</h2>
        <p>{t("想用 AI 写代码，第一步却卡在账号、订阅和接入配置上？我们把账号准备、KYC、订阅和托管一起安排，再按教程协助你在自己的电脑上开始使用。", "Want to build with AI, but stuck on accounts, subscriptions, and setup? We bring account preparation, KYC, the subscription, and hosting together, then help you get started on your own computer.")}</p>
        <div className="story-plan-preview">
          {plans.map(plan => <button key={plan.id} onClick={() => onStart(plan.id)}><span>{plan.name}</span><strong>¥{plan.price.toLocaleString("en-US")}</strong><small>{t("先导价 / 月 · 服务周期一个月", "Introductory / month · One month of service")}</small><ArrowRight size={16} /></button>)}
        </div>
        <p className="story-plan-note">{t("续费目前维持原价。不售卖独立托管服务或 Pro 一条龙套餐。", "Renewals currently remain at the same price. Standalone hosting and Pro packages are not offered.")}</p>
        <a className="story-detail-link" href={pageHref("pricing", locale)}>{t("查看套餐、交付与售后说明", "See plans, delivery and support terms")}<ArrowRight size={15} /></a>
        <ContactOptions />
      </div>
      <div className="story-reasons">
        <article><span>01</span><div><h3>{t("五项准备，打包完成。", "Five parts, one package.")}</h3><p>{getServiceBundle(locale).join(" + ")}{t("，由我们协助完成，无需逐项自行办理。", ", arranged with our assistance so you do not have to handle each part separately.")}</p></div></article>
        <article><span>02</span><div><h3>{t("在自己的电脑上，开始动手。", "Build on your own computer.")}</h3><p>{t("托管账号就绪后，创建接入点，使用控制台提供的地址与密钥配置 Claude Code 或 Claude Desktop。海外 Mac 机房是我们的基础设施，当前套餐不等于提供一台远程电脑。", "Once your hosted account is ready, create an endpoint and use its address and key to configure Claude Code or Claude Desktop. Our overseas Mac facility is infrastructure; this package does not provide you with a remote computer.")}</p></div></article>
        <article><span>03</span><div><h3>{t("规则说清楚，开始更有底。", "Know the rules before you start.")}</h3><p>{t("先阅读使用指南：仅允许按教程配置的两个客户端，同一账号同时不超过 6 个 session。订阅期限、交付安排、质保范围和退款手续费，都在付款前确认。", "Read the guide first: only the two approved, correctly configured clients are allowed, with no more than 6 simultaneous sessions per account. Confirm subscription dates, delivery, warranty coverage, and refund fees before payment.")}</p></div></article>
      </div>
      <div className="story-next"><div><h3>{t("从清楚的接入步骤开始。", "Start with a clear setup guide.")}</h3><p>{t("登录控制台、创建接入点、配置客户端；遇到问题，按指南逐项排查。", "Sign in to the console, create an endpoint, and configure your client. The guide also helps you troubleshoot.")}</p></div><a className="button" href={pageHref("guide", locale)}>{t("阅读用户指南", "Read the user guide")}<ArrowRight size={17} /></a></div>
      <nav className="story-resources" aria-label={t("配置与排查教程", "Setup and troubleshooting resources")}>
        <a href={pageHref("setup", locale)}><span>01 / SETUP</span><h3>{t("Claude Code 首次接入", "Your first Claude Code connection")}</h3><p>{t("Windows 与 macOS 配置路径、接入点设置，以及第一条测试消息。", "Windows and macOS settings, endpoint configuration, and your first test message.")}</p><ArrowRight size={19} /></a>
        <a href={pageHref("troubleshooting", locale)}><span>02 / TROUBLESHOOTING</span><h3>{t("连接与额度问题排查", "Connection and usage troubleshooting")}</h3><p>{t("从控制台状态开始，区分配置、额度和账号问题，准备有效的反馈。", "Check console status, distinguish configuration, usage and account issues, and prepare a useful support request.")}</p><ArrowRight size={19} /></a>
      </nav>
    </section>
  );
}
