import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy } from "lucide-react";
import { consoleUrl, contact, getServiceBundle, plans } from "../data/business";
import { guideConfig, guideSupportTemplate, guideTroubleshooting } from "../data/guide";
import { useLanguage } from "../i18n";
import { pageHref } from "../routing";
import ContactOptions from "./ContactOptions";
import "../styles/resources.css";

type ResourceKind = "pricing" | "setup" | "troubleshooting";
const resourceKinds: ResourceKind[] = ["pricing", "setup", "troubleshooting"];

function CopyText({ value, label }: { value: string; label: string }) {
  const { t } = useLanguage();
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  async function copy() {
    try { await navigator.clipboard.writeText(value); setState("copied"); }
    catch { setState("failed"); }
  }
  return <div className="resource-code">
    <div><span>{label}</span><button type="button" onClick={copy}>{state === "copied" ? <Check size={15} /> : <Copy size={15} />}{state === "copied" ? t("已复制", "Copied") : t("复制", "Copy")}</button></div>
    <pre tabIndex={0}><code>{value}</code></pre>
    <p role="status">{state === "failed" ? t("无法使用剪贴板，请选中文字手动复制。", "Clipboard access failed. Select the text and copy it manually.") : state === "copied" ? t("已复制到剪贴板。", "Copied to clipboard.") : ""}</p>
  </div>;
}

function PricingContent() {
  const { locale, t } = useLanguage();
  return <>
    <section className="resource-section" aria-labelledby="resource-plans">
      <div className="resource-section-intro"><span className="resource-kicker">01 / PLANS</span><h2 id="resource-plans">{t("两档先导价，服务周期一个月。", "Two introductory plans. One month of service.")}</h2><p>{t("以下是日不落的一条龙服务价格，包含五项服务的统一交付。具体订阅起止时间与交付安排，在付款前和客服确认。", "These are SunNeverSets all-in-one service prices, covering the five bundled items. Confirm the exact subscription start and end dates and delivery arrangements with support before payment.")}</p></div>
      <div className="resource-plan-grid">{plans.map(plan => <article className="resource-plan" key={plan.id}>
        <span className="resource-kicker">{t("先导价", "INTRODUCTORY PRICE")}</span><h3>{plan.name}</h3><p className="resource-price"><strong>¥{plan.price.toLocaleString("en-US")}</strong><span>{t("/ 月", "/ month")}</span></p><p>{t("服务周期：一个月", "Service period: one month")}</p>
        <ul>{getServiceBundle(locale).map(item => <li key={item}><Check size={15} />{item}</li>)}</ul>
        <a className="resource-button" href={contact.link} target="_blank" rel="noopener noreferrer">{t("咨询与购买", "Ask about this plan")}<ArrowUpRight size={16} /></a>
      </article>)}</div>
      <p className="resource-note">{t("续费目前维持原价。当前不售卖独立托管服务或 Pro 一条龙套餐。", "Renewals currently remain at the same price. Standalone hosting and Pro all-in-one plans are not offered.")}</p>
    </section>
    <section className="resource-section" aria-labelledby="resource-choice">
      <span className="resource-kicker">02 / BEFORE YOU CHOOSE</span><h2 id="resource-choice">{t("先说清使用方式，再选套餐。", "Choose around the work you want to do.")}</h2>
      <div className="resource-two-column"><div><h3>{t("告诉客服你的实际需求", "Tell support about your workload")}</h3><p>{t("准备使用 Claude Code 还是 Claude Desktop？通常做什么任务、使用多长时间、需要同时进行多少个会话？带着这些信息咨询，比只看套餐名称更容易确认是否适合。", "Will you use Claude Code or Claude Desktop? What tasks do you run, for how long, and how many sessions need to run together? These details help support assess the fit beyond the plan name.")}</p></div><div><h3>{t("Max 不等于无限额度", "Max is not unlimited")}</h3><p>{t("调用消耗托管账号的订阅额度，实际额度窗口与重置提示以控制台为准。套餐不自动包含额外账号；同一账号最多同时 6 个 session。Max 前两天保持轻量使用，尤其是 20X。", "Requests consume the hosted account’s subscription quota. Check the console for usage windows and reset notices. Plans do not automatically include extra accounts; each account allows up to 6 concurrent sessions. Keep usage light for the first two days, especially on 20X.")}</p></div></div>
    </section>
    <section className="resource-section" aria-labelledby="resource-delivery">
      <span className="resource-kicker">03 / DELIVERY</span><h2 id="resource-delivery">{t("你在本机使用，我们安排服务接入。", "Use your own computer. We arrange service access.")}</h2>
      <ol className="resource-steps">
        <li><span>01</span><div><h3>{t("添加 Telegram 客服", "Contact support on Telegram")}</h3><p>{t("确认套餐、一个月服务的起止日期、付款方式、交付安排及售后范围，再付款。", "Confirm your plan, the start and end dates of the one-month service period, payment method, delivery and support terms before paying.")}</p></div></li>
        <li><span>02</span><div><h3>{t("完成账号与托管准备", "Complete account and hosting preparation")}</h3><p>{t("我们协助完成账号、订阅、KYC、托管席位与托管操作。客服确认交付情况、控制台登录邮箱及可开始使用的时间。", "We assist with the account, subscription, KYC, hosting seat and hosting setup. Support confirms delivery, your console sign-in email and when you can start.")}</p></div></li>
        <li><span>03</span><div><h3>{t("创建接入点，配置客户端", "Create an endpoint and configure your client")}</h3><p>{t("账号就绪后，从控制台取得地址与密钥，按本项目教程配置 Claude Code 或 Claude Desktop，发送测试消息并核对请求记录。", "Once the account is ready, get the address and key from the console. Configure Claude Code or Claude Desktop using our instructions, send a test message and check its request record.")}</p></div></li>
      </ol>
      <div className="resource-callout"><h3>{t("海外 Mac 机房是基础设施。", "Our overseas Mac facility is infrastructure.")}</h3><p>{t("当前套餐交付的是 Claude 一条龙服务。你在自己的电脑上使用客户端，平台承接账号托管与请求转发；套餐不包含供你远程操作的 Mac。", "The current package delivers an all-in-one Claude service. You use a client on your own computer; the platform handles account hosting and request forwarding. The package does not include a Mac for you to operate remotely.")}</p></div>
    </section>
    <section className="resource-section" aria-labelledby="resource-terms">
      <span className="resource-kicker">04 / SERVICE TERMS</span><h2 id="resource-terms">{t("付款前，确认这些使用与售后规则。", "Confirm usage and support terms before paying.")}</h2>
      <div className="resource-detail-list">
        <article><h3>{t("允许的客户端", "Approved clients")}</h3><p>{t("仅允许按项目教程配置的 Claude Code 和 Claude Desktop。禁止第三方 Agent、cc-connect、cc-switch、微信和 QQ 远程调用；不能绕开托管直接登录原账号。", "Only Claude Code and Claude Desktop configured using our guides are allowed. Third-party agents, cc-connect, cc-switch and remote calls through WeChat or QQ are prohibited. Do not bypass hosting to sign in directly with the original account.")}</p></article>
        <article><h3>{t("质保条件", "Warranty conditions")}</h3><p>{t("索取账号邮箱和密码的，不提供质保。日常配置使用平台地址与密钥，无需为此索取原账号凭证；请先确认订单的具体保障范围。", "Requesting the account email and password removes warranty coverage. Routine configuration uses the platform address and key, so the original credentials are not required. Confirm the exact coverage for your order first.")}</p></article>
        <article><h3>{t("封禁后的退款处理", "Refund review after suspension")}</h3><p>{t("对于享有质保的账号，经核查未发现违反使用条例，按剩余未使用的服务天数计算退款，并扣除相应手续费。退款方式和手续费金额，请在付款前确认。", "For an account with warranty coverage, if a review finds no breach of the usage rules, the refund is based on remaining unused service days, less a handling fee. Confirm the refund method and fee before payment.")}</p></article>
        <article><h3>{t("续费与服务日期", "Renewals and service dates")}</h3><p>{t("先导价对应一个月服务，续费目前维持原价。付款前核对具体起止日期、交付安排与可开始使用的时间。", "The introductory price covers one month of service, and renewals currently remain at the same price. Confirm the exact dates, delivery arrangements and when you may begin before payment.")}</p></article>
      </div>
      <a className="resource-text-link" href={`${pageHref("guide", locale)}#usage-rules`}>{t("阅读完整使用限制与售后说明", "Read the full usage and support terms")}<ArrowRight size={16} /></a>
    </section>
  </>;
}

function SetupContent() {
  const { locale, t } = useLanguage();
  return <>
    <section className="resource-section" aria-labelledby="resource-setup-before">
      <span className="resource-kicker">BEFORE YOU BEGIN</span><h2 id="resource-setup-before">{t("适用于已开通日不落的用户。", "For users with an active SunNeverSets service.")}</h2>
      <p>{t("这份教程说明如何把日不落控制台提供的接入点配置到 Claude Code。开始前，确认客服已完成交付、账号已就绪，并告知可以开始使用的时间；电脑上需要先安装 Claude Code。", "This tutorial connects Claude Code to an endpoint provided by the SunNeverSets console. Before starting, confirm that support has completed delivery, the account is ready, and you may begin. Claude Code must already be installed on your computer.")}</p>
      <div className="resource-callout"><h3>{t("还没有安装，或需要 Claude Desktop？", "Not installed yet, or using Claude Desktop?")}</h3><p>{t("请向客服获取安装协助，或领取与你的操作系统和版本匹配的 Desktop 专用教程。下面的 settings.json 步骤适用于 Claude Code，不要直接套用到 Desktop，也不要用第三方切换工具替代。", "Ask support for installation help or a Desktop guide matched to your operating system and app version. The settings.json steps below are for Claude Code. Do not apply them to Desktop or substitute a third-party switching tool.")}</p></div>
    </section>
    <section className="resource-section" aria-labelledby="resource-code-steps">
      <span className="resource-kicker">CONFIGURATION</span><h2 id="resource-code-steps">{t("从控制台到第一条测试消息。", "From your console to the first test message.")}</h2>
      <ol className="resource-steps">
        <li><span>01</span><div><h3>{t("确认交付与等待要求", "Confirm delivery and any waiting requirement")}</h3><p>{t("以客服确认的交付情况和可使用时间为准。需要账号邮箱和密码的用户，收到账号后先静默等待半小时，不登录 Claude、不发起请求；索取该凭证不提供质保。不需要邮箱账号和密码的，可按用户指南跳过这一步。", "Follow the delivery status and start time confirmed by support. Users who need the account email and password must wait 30 minutes after receiving the account without signing in to Claude or sending requests; requesting those credentials removes warranty coverage. The user guide allows users who do not need them to skip this step.")}</p></div></li>
        <li><span>02</span><div><h3>{t("登录控制台，确认账号就绪", "Sign in and confirm the account is ready")}</h3><p>{t("使用客服确认的控制台登录邮箱，获取并输入验证码。进入账号管理，核对目标账号的状态为「已就绪」。控制台登录邮箱和托管的 Claude 账号是不同概念。", "Use the console sign-in email confirmed by support and enter its verification code. In account management, check that the intended account is Ready. The console sign-in email and hosted Claude account are different concepts.")}</p><a className="resource-text-link" href={consoleUrl} target="_blank" rel="noopener noreferrer">{t("进入控制台", "Open console")}<ArrowUpRight size={15} /></a></div></li>
        <li><span>03</span><div><h3>{t("创建接入点，复制自己的配置", "Create an endpoint and copy your configuration")}</h3><p>{t("在「接入点」中选择「新建接入点」，起一个易识别的名称，选择或核对可调用的账号。创建后打开详情，复制完整 Base URL 和 API Key，或控制台生成的配置。不要自行增删地址末尾的路径。", "Under Endpoints, choose Create endpoint, give it a recognizable name, and select or check its callable accounts. Open its details and copy the full Base URL and API Key, or the console-generated configuration. Do not add or remove any trailing path.")}</p></div></li>
        <li><span>04</span><div><h3>{t("备份并编辑 settings.json", "Back up and edit settings.json")}</h3><p>{t("先备份已有配置文件，再打开用户目录下的文件。将控制台给出的两个字段合并到 env 中，保留其他设置；如果已有 env，不要重复创建同名字段。", "Back up your existing file, then open it in your user directory. Merge the two fields from the console into env and preserve other settings. If env already exists, do not create a duplicate field.")}</p><div className="resource-paths"><div><span>Windows</span><code>%USERPROFILE%\.claude\settings.json</code></div><div><span>macOS</span><code>~/.claude/settings.json</code></div></div><p>{t("下面只展示字段结构，必须把占位文字替换为自己的控制台配置。", "This example shows the structure only. Replace the placeholders with your own console settings.")}</p><CopyText key={`config-${locale}`} value={guideConfig[locale === "en" ? 1 : 0]} label="settings.json" /><p>{t("使用英文双引号，不添加注释和多余逗号，检查文件确实保存为 settings.json。保存后，退出并重新打开 Claude Code。", "Use straight double quotes, no comments or trailing commas, and ensure the file is named settings.json. Save, quit Claude Code, and reopen it.")}</p><a className="resource-text-link" href="https://code.claude.com/docs/en/settings" target="_blank" rel="noopener noreferrer">{t("Claude Code 官方配置文件说明", "Official Claude Code settings documentation")}<ArrowUpRight size={15} /></a></div></li>
        <li><span>05</span><div><h3>{t("发一条简单消息，核对请求记录", "Send a simple message and check its record")}</h3><p>{t("例如发送「你好，请简短回复」。确认客户端收到回复，再回到控制台核对对应时间的请求记录。测试通过后再开始自己的任务；Max 前两天保持轻量使用。", "For example, send “Hello, please reply briefly.” Confirm the response, then check the matching request record and time in the console. Begin your own work after the test succeeds; keep Max usage light for the first two days.")}</p></div></li>
      </ol>
    </section>
    <section className="resource-section" aria-labelledby="resource-setup-check">
      <span className="resource-kicker">CHECK YOUR CONNECTION</span><h2 id="resource-setup-check">{t("没有接通时，先核对三件事。", "If the connection fails, check three things first.")}</h2>
      <ul className="resource-checklist"><li><Check size={17} />{t("控制台账号是否已就绪，服务是否仍在有效期。", "Is the account ready, and is the service still active?")}</li><li><Check size={17} />{t("地址与密钥是否来自同一个接入点，是否完整。", "Are the full address and key from the same endpoint?")}</li><li><Check size={17} />{t("JSON 是否有效，修改后是否重启 Claude Code。", "Is the JSON valid, and did you restart Claude Code after editing it?")}</li></ul>
      <a className="resource-text-link" href={pageHref("troubleshooting", locale)}>{t("按问题类型继续排查", "Continue by issue type")}<ArrowRight size={16} /></a>
      <p className="resource-note">{t("不要在群聊、公开仓库或故障截图中暴露完整密钥。报错时提交打码信息，并说明客户端版本和发生时间。", "Do not expose complete keys in group chats, public repositories or screenshots. Send redacted error details, your client version and the time of the issue.")}</p>
    </section>
  </>;
}

function TroubleshootingContent() {
  const { locale, t } = useLanguage();
  const copyIndex = locale === "en" ? 1 : 0;
  return <>
    <section className="resource-section" aria-labelledby="resource-triage">
      <span className="resource-kicker">START HERE</span><h2 id="resource-triage">{t("连接失败、额度用完、账号封禁，分别处理。", "Connection errors, usage limits and suspensions need different responses.")}</h2>
      <p>{t("先打开控制台查看账号状态、额度窗口与服务有效期，再记录具体报错和发生时间。客户端无法继续使用，不一定意味着账号被封；不要通过第三方工具重复尝试。", "Start with the console account status, usage windows and service expiry, then record the error and its time. A client that stops working does not necessarily mean the account is suspended. Do not retry through third-party tools.")}</p>
      <div className="resource-two-column"><div><h3>{t("达到额度限制", "Usage limit reached")}</h3><p>{t("查看 5 小时、7 天额度窗口及控制台重置提示。调用消耗所托管账号的订阅额度；套餐不包含无限用量，也不自动获得额外账号。", "Check the 5-hour and 7-day usage windows and console reset notices. Requests use the hosted account’s subscription quota. A plan does not provide unlimited usage or extra accounts automatically.")}</p></div><div><h3>{t("收到封禁通知", "Suspension notice received")}</h3><p>{t("暂停使用，保留通知和收到时间，将打码内容交给客服核查。是否适用质保和退款，按订单保障范围及使用记录审核。", "Stop using the account, keep the notice and arrival time, and send a redacted copy to support. Warranty and refund eligibility depend on the order’s coverage and a review of usage records.")}</p></div></div>
    </section>
    <section className="resource-section" aria-labelledby="resource-issues">
      <span className="resource-kicker">SIX COMMON ISSUES</span><h2 id="resource-issues">{t("找到你遇到的情况。", "Find the issue you are seeing.")}</h2>
      <div className="resource-issue-list">{guideTroubleshooting.map((item, index) => <article key={item.problem[0]} id={`issue-${index + 1}`}><header><span>0{index + 1}</span><h3>{item.problem[copyIndex]}</h3></header><div><h4>{t("先检查", "Check first")}</h4><p>{item.check[copyIndex]}</p></div><div><h4>{t("下一步", "Next step")}</h4><p>{item.next[copyIndex]}</p></div></article>)}</div>
    </section>
    <section className="resource-section" aria-labelledby="resource-support-details">
      <span className="resource-kicker">MAKE YOUR REPORT USEFUL</span><h2 id="resource-support-details">{t("一次说清情况，减少来回沟通。", "Give support the context to investigate.")}</h2><p>{t("复制下面的模板，填好后通过 Telegram 发给客服。截图需打码，不提交完整密钥、账号密码、无关的私人对话或完整代码。", "Copy this template, fill it in and send it to support on Telegram. Redact screenshots and omit full keys, account passwords, unrelated private conversations and complete source code.")}</p>
      <CopyText key={`support-${locale}`} value={guideSupportTemplate[copyIndex]} label={t("故障反馈模板", "Support request template")} />
    </section>
  </>;
}

export default function ResourcePage({ page }: { page: ResourceKind }) {
  const { locale, t } = useLanguage();
  const titles: Record<ResourceKind, string> = {
    pricing: t("Claude Max 套餐与交付说明", "Claude Max plans and delivery"),
    setup: t("Claude Code 接入教程", "Claude Code setup guide"),
    troubleshooting: t("连接与额度问题排查", "Connection and usage troubleshooting"),
  };
  const descriptions: Record<ResourceKind, string> = {
    pricing: t("账号、订阅、KYC、托管席位与操作，五项一起安排。先看清价格、交付和使用规则，再决定是否适合。", "Account, subscription, KYC, hosting seat and setup, arranged together. Understand the price, delivery and usage rules before choosing."),
    setup: t("日不落服务专用教程：在 Windows 或 macOS 上，把控制台的接入配置填入 Claude Code，完成第一条请求。", "For SunNeverSets service users: configure Claude Code on Windows or macOS with your console endpoint and send your first request."),
    troubleshooting: t("日不落服务的六类常见问题：从登录验证码到接入配置、额度与账号状态，按步骤检查。", "Six common SunNeverSets service issues, from verification codes and connection settings to usage limits and account status."),
  };
  return <div className={`resource-page resource-page-${page}`}>
    <header className="resource-hero"><div className="resource-container"><nav className="resource-breadcrumb" aria-label={t("当前位置", "Breadcrumb")}><a href={pageHref("home", locale)}><ArrowLeft size={14} />{t("首页", "Home")}</a><span>/</span><span aria-current="page">{titles[page]}</span></nav><span className="resource-hero-kicker">SUNNEVERSETS / {page === "pricing" ? "PLANS" : "GUIDES"}</span><h1>{titles[page]}</h1><p>{descriptions[page]}</p><div className="resource-hero-meta"><span>{t("更新于 2026.10.09", "Updated October 9, 2026")}</span><span>{t("日不落服务说明", "SunNeverSets service information")}</span></div></div></header>
    <div className="resource-container resource-body">
      {page === "pricing" ? <PricingContent /> : page === "setup" ? <SetupContent /> : <TroubleshootingContent />}
      <section className="resource-contact" aria-labelledby="resource-contact-title"><div><span className="resource-kicker">LET’S GET STARTED</span><h2 id="resource-contact-title">{t("咨询、购买和使用问题，都先联系客服。", "Questions, purchases and support start here.")}</h2><p>{t("说明你想做什么、使用什么电脑，以及当前遇到的问题。客服会与你核对套餐与下一步。", "Tell us what you want to do, which computer you use and where you need help. Support will review the plan and next steps with you.")}</p></div><ContactOptions /></section>
      <nav className="resource-related" aria-label={t("继续阅读", "Continue reading")}><span className="resource-kicker">{t("继续阅读", "CONTINUE READING")}</span>{resourceKinds.filter(item => item !== page).map(item => <a key={item} href={pageHref(item, locale)}>{titles[item]}<ArrowRight size={17} /></a>)}<a href={pageHref("guide", locale)}>{t("完整用户指南", "Full user guide")}<ArrowRight size={17} /></a></nav>
    </div>
  </div>;
}
