import { useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowUp, ArrowUpRight, BookOpen, Check, ChevronDown, Copy, Info, Minus } from "lucide-react";
import { useLanguage } from "../i18n";
import { guideCommunity, guideConfig, guideFaq, guideRestrictions, guideSections, guideSupportTemplate, guideTroubleshooting, type GuideCopy } from "../data/guide";
import "../styles/guide.css";
import ContactOptions from "./ContactOptions";
import { consoleUrl } from "../data/business";
import { pageHref } from "../routing";

function Notice({ children, tone = "note" }: { children: ReactNode; tone?: "note" | "important" }) {
  return <div className={`guide-notice guide-notice-${tone}`}><Info size={17} aria-hidden="true" /><div>{children}</div></div>;
}

function CopyBlock({ value, kind, label }: { value: string; kind: string; label: string }) {
  const { t } = useLanguage();
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const operation = useRef(0);
  async function copy() {
    const current = ++operation.current;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(value);
      if (operation.current === current) setState("copied");
    } catch {
      if (operation.current === current) setState("failed");
    }
  }
  return <div className="guide-code-block">
    <div className="guide-code-toolbar"><span>{kind}</span><button type="button" onClick={copy} aria-label={label}>{state === "copied" ? <Check size={14} /> : <Copy size={14} />}{state === "copied" ? t("已复制", "Copied") : t("复制", "Copy")}</button></div>
    <pre tabIndex={0} aria-label={label}><code>{value}</code></pre>
    <p className={`guide-copy-status ${state === "failed" ? "is-error" : ""}`} role="status" aria-live="polite">{state === "failed" ? t("未能访问剪贴板，请选中上方文本手动复制。", "Could not access the clipboard. Select the text above and copy it manually.") : state === "copied" ? t("已复制到剪贴板。", "Copied to clipboard.") : ""}</p>
  </div>;
}

function GuideHeading({ number, children, subtitle }: { number: string; children: ReactNode; subtitle: string }) {
  return <header className="guide-section-heading"><span className="guide-section-number">{number}</span><div><h2>{children}</h2><p>{subtitle}</p></div></header>;
}

export default function UserGuide() {
  const { locale, t } = useLanguage();
  const mobileToc = useRef<HTMLDetailsElement>(null);
  const copy = (value: GuideCopy) => t(value[0], value[1]);
  function contents(mobile = false) {
    return <nav aria-label={t(mobile ? "移动端指南目录" : "用户指南目录", mobile ? "Mobile guide contents" : "User guide contents")}>
      {guideSections.map((section, index) => <a key={section.id} href={`#${section.id}`} onClick={() => { if (mobile && mobileToc.current) mobileToc.current.open = false; }}><span>{String(index + 1).padStart(2, "0")}</span>{copy(section.title)}</a>)}
    </nav>;
  }

  return <div className="user-guide" id="guide-top">
    <div className="guide-hero">
      <div className="guide-hero-inner">
        <a className="guide-back" href={pageHref("home", locale)}><ArrowLeft size={15} />{t("返回首页", "Back to home")}</a>
        <div className="guide-eyebrow"><span />{t("从接入到日常使用", "FROM SETUP TO EVERYDAY USE")}</div>
        <h1>{t("日不落用户使用指南", "Your SunNeverSets guide")}</h1>
        <p className="guide-hero-description">{t("先完成托管，再开始使用。接入步骤、使用限制和常见问题，都在这里。", "Complete your hosting setup, then start building. Connection steps, usage rules and answers, all in one place.")}</p>
        <div className="guide-hero-meta"><span>v0.1</span><span>{t("更新于 2026.10.09", "Updated October 9, 2026")}</span><span>{t("首次阅读约 10 分钟", "About 10 minutes to read")}</span></div>
        <div className="guide-hero-actions"><a className="guide-button guide-button-primary" href="#getting-started">{t("开始首次配置", "Start your setup")}<ArrowUpRight size={16} /></a><a className="guide-button guide-button-secondary" href={consoleUrl} target="_blank" rel="noopener noreferrer">{t("进入控制台", "Open console")}<ArrowUpRight size={16} /></a></div>
      </div>
      <div className="guide-hero-art" aria-hidden="true"><div className="guide-sun" /><span className="guide-horizon" /><span className="guide-art-caption">YOUR IDEAS. ALWAYS ON.</span></div>
    </div>

    <div className="guide-layout">
      <aside className="guide-sidebar">
        <div className="guide-sidebar-sticky"><p className="guide-toc-label"><BookOpen size={15} />{t("阅读导航", "IN THIS GUIDE")}</p>{contents()}
          <div className="guide-sidebar-help"><span>{t("已经完成配置？", "Already configured?")}</span><a href="#troubleshooting">{t("直接查看问题排查", "Go to troubleshooting")}<ArrowUpRight size={14} /></a></div>
        </div>
      </aside>
      <div className="guide-content">
        <details className="guide-mobile-toc" ref={mobileToc}><summary><BookOpen size={16} />{t("阅读导航", "In this guide")}<ChevronDown size={16} /></summary>{contents(true)}</details>
        <section className="guide-overview" aria-labelledby="guide-overview-title">
          <div className="guide-overview-intro"><span className="guide-kicker">{t("开始之前", "BEFORE YOU BEGIN")}</span><h2 id="guide-overview-title">{t("先记住这四件事。", "Four things to remember.")}</h2><p>{t("本指南帮助你完成账号托管、在本机开始使用 Claude，并了解使用限制与售后处理方式。首次使用从下面五步开始，已经配置过的用户可直接查阅相应章节。", "This guide helps you set up account hosting, start using Claude on your own computer, and understand the rules and after-sales process. Start with the five steps below, or jump to the section you need.")}</p></div>
          <div className="guide-essentials">
            {[
              ["30 min", "收到账号后先静默半小时", "Wait 30 minutes after receiving the account", "期间不要登录 Claude 或发起请求；第一步的适用说明见下文。", "Do not sign in to Claude or send requests during this period. See step 1 for when it applies."],
              ["2 clients", "只使用教程允许的客户端", "Use only the approved clients", "仅限按项目教程配置的 Claude Code 与 Claude Desktop。", "Only Claude Code and Claude Desktop, configured according to our guide."],
              ["0 shortcuts", "不要自行接入第三方工具", "Do not connect third-party tools", "禁止第三方 Agent、cc-connect、cc-switch 及微信、QQ 远程接入。", "No third-party agents, cc-connect, cc-switch, or remote access through WeChat or QQ."],
              ["2 days", "Max 用户前两天轻量使用", "Keep Max usage light for two days", "尤其是 Max 20X，之后再逐步增加用量；不代表账号安全保证。", "Especially on Max 20X. Increase usage gradually; this is not a guarantee of account safety."],
            ].map(([metric, zhTitle, enTitle, zhBody, enBody]) => <article key={metric}><span className="guide-essential-metric">{metric}</span><h3>{t(zhTitle, enTitle)}</h3><p>{t(zhBody, enBody)}</p></article>)}
          </div>
          <div className="guide-quick-links" aria-label={t("快速查找", "Quick links")}><span>{t("快速查找", "Quick links")}</span><a href="#usage-rules">{t("哪些操作不允许", "What is not allowed")}<ArrowUpRight size={13} /></a><a href="#guide-faq">{t("套餐与额度", "Plans and limits")}<ArrowUpRight size={13} /></a><a href="#after-sales">{t("质保与退款", "Coverage and refunds")}<ArrowUpRight size={13} /></a><a href="#guide-contact">{t("联系客服", "Contact support")}<ArrowUpRight size={13} /></a></div>
        </section>

        <section id="getting-started" className="guide-section">
          <GuideHeading number="01" subtitle={t("确认交付和等待时间 → 登录控制台 → 创建接入点 → 配置客户端 → 测试使用。", "Confirm delivery and waiting time → Sign in → Create an endpoint → Configure your client → Test.")}>{t("首次使用", "Getting started")}</GuideHeading>
          <Notice>{t("登录控制台后，还需创建接入点并配置客户端，才能开始使用。", "Signing in to the console is only one step. You also need to create an endpoint and configure your client before use.")}</Notice>
          <div className="guide-steps">
            <article className="guide-step" id="guide-step-1"><span className="guide-step-marker">1</span><div className="guide-step-body"><h3>{t("确认交付并静默半小时", "Confirm delivery and wait 30 minutes")}</h3>
              <p className="guide-step-intro">{t("如果不需要邮箱的账号和密码，可直接跳过第一步。", "If you do not need the email account and password, you can skip step 1.")}</p>
              <p>{t("收到账号后，先静默等待半小时。期间不要登录 Claude，也不要发起使用请求。已经持有邮箱访问方式的用户，可以查看邮箱是否收到封号邮件；如有异常，暂停后续操作并联系客服。", "After receiving the account, wait quietly for 30 minutes. Do not sign in to Claude or send requests. If you already have access to the email account, check for a suspension notice. If anything is wrong, pause setup and contact support.")}</p>
              <p>{t("开始使用前，请确认：", "Before you start, confirm that:")}</p><ul className="guide-checklist">
                <li>{t("客服已确认你的账号交付情况和可开始使用的时间。", "Support has confirmed delivery and when you may start using the account.")}</li>
                <li>{t("已明确用哪个邮箱登录中继控制台，并能收取验证码。", "You know which email to use for console sign-in and can receive its verification codes.")}</li>
                <li>{t("控制台席位已经开通。", "Your console hosting seat is active.")}</li>
                <li>{t("已确认订阅起止时间、交付安排和质保范围。", "You have confirmed subscription dates, delivery arrangements and warranty coverage.")}</li>
              </ul>
              <Notice tone="important"><strong>{t("索取账号的邮箱和密码，将不提供质保。", "Requesting the account email and password means no warranty coverage.")}</strong><p>{t("索取前请确认本次订单的质保范围。半小时结束且未发现异常后，再继续后续步骤。静默等待不是账号安全保证。", "Confirm your order’s coverage before requesting them. Continue after the 30-minute wait if no issue is found. Waiting does not guarantee account safety.")}</p></Notice>
            </div></article>
            <article className="guide-step" id="guide-step-2"><span className="guide-step-marker">2</span><div className="guide-step-body"><h3>{t("登录中继控制台", "Sign in to the relay console")}</h3>
              <ol><li><a className="guide-inline-link" href={consoleUrl} target="_blank" rel="noopener noreferrer"><span>{t("进入控制台", "Open console")}</span><ArrowUpRight size={14} aria-hidden="true" /></a></li><li>{t("使用客服确认的控制台登录邮箱，获取并输入邮箱验证码。", "Use the console sign-in email confirmed by support, then request and enter the email verification code.")}</li><li>{t("进入控制台，查看账号管理。", "Open account management in the console.")}</li></ol>
              <dl className="guide-definition-list"><div><dt>{t("账号", "Account")}</dt><dd>{t("你托管的 Claude 账号，完成授权并显示「已就绪」后才开始接收请求。", "Your hosted Claude account. It receives requests only after authorization is complete and its status is Ready.")}</dd></div><div><dt>{t("席位", "Seat")}</dt><dd>{t("托管容量单位，每个尚未删除的托管账号占一个席位。", "A unit of hosting capacity. Each hosted account occupies one seat until it is deleted.")}</dd></div><div><dt>{t("接入点", "Endpoint")}</dt><dd>{t("一组接入地址与 API Key，以及它可以调用的账号。", "A connection address and API Key, together with the accounts it can call.")}</dd></div></dl>
              <Notice>{t("控制台登录邮箱与被托管的 Claude 账号不是同一个概念，操作时请核对。", "The console sign-in email and the hosted Claude account are different concepts. Check which one you are using.")}</Notice>
            </div></article>
            <article className="guide-step" id="guide-step-3"><span className="guide-step-marker">3</span><div className="guide-step-body"><h3>{t("创建接入点并取得配置", "Create an endpoint and get your configuration")}</h3>
              <ol><li>{t("在控制台找到「接入点」，选择「新建接入点」。", "Find Endpoints in the console and select Create endpoint.")}</li><li>{t("输入便于自己识别的名称，例如「我的电脑」。", "Give it a recognizable name, such as My computer.")}</li><li>{t("按页面提示选择或核对可调用的账号，确认目标账号已就绪。", "Follow the page prompts to select or check the callable accounts. Confirm that your intended account is ready.")}</li><li>{t("创建后，打开接入点详情，复制平台提供的 Base URL 和 API Key，或直接复制控制台生成的配置。", "Open the new endpoint’s details and copy its Base URL and API Key, or copy the configuration generated by the console.")}</li></ol>
              <Notice><strong>{t("Base URL 是接入地址，API Key 是调用凭证。", "The Base URL is your connection address; the API Key is your credential.")}</strong><p>{t("请以自己的控制台为准，不要照抄教程截图中的地址或密钥，也不要自行添加或删除地址末尾的路径。不要把完整密钥发到群内、第三方工具或公开的代码仓库。", "Use the values in your own console. Do not copy addresses or keys from tutorial screenshots, or add or remove the path at the end of the address. Do not share the full key in a group, a third-party tool or a public code repository.")}</p></Notice>
            </div></article>
            <article className="guide-step" id="guide-step-4"><span className="guide-step-marker">4</span><div className="guide-step-body"><h3>{t("配置 Claude Code", "Configure Claude Code")}</h3>
              <p>{t("本节适用于本机已安装 Claude Code 的用户。尚未安装或不熟悉配置文件的用户，请联系客服获取安装与配置协助，不要使用第三方切换工具代替。", "These steps assume Claude Code is installed on your computer. If it is not installed, or you are unfamiliar with configuration files, ask support for installation and setup help. Do not substitute a third-party switching tool.")}</p>
              <ol><li><strong>{t("先备份已有配置文件。", "Back up your existing configuration first.")}</strong></li><li>{t("打开用户目录下的", "Open ")} <code>.claude/settings.json</code>{t("。", " in your user directory.")}</li><li>{t("将控制台生成的接入配置填入文件。已有配置时，只合并需要的字段，保留其他设置。", "Add the configuration generated by your console. If the file already has settings, merge only the required fields and preserve the others.")}</li><li>{t("保存文件，退出并重新打开 Claude Code。", "Save the file, quit Claude Code and reopen it.")}</li></ol>
              <div className="guide-file-paths"><div><span>Windows</span><code>%USERPROFILE%\.claude\settings.json</code></div><div><span>macOS</span><code>~/.claude/settings.json</code></div></div>
              <p className="guide-config-caption"><strong>{t("下面只展示字段结构。", "This example shows the structure only.")}</strong>{t("不要原样复制占位文字；实际值必须来自你的控制台。", " Replace the placeholders with the actual values from your console.")}</p>
              <CopyBlock key={`config-${locale}`} value={copy(guideConfig)} kind="settings.json" label={t("复制配置结构", "Copy configuration structure")} />
              <p>{t("文件名是 settings.json。保存时使用英文双引号，不要加入注释或多余逗号。如果原来已有 env，将这两个字段合并到原有 env 中，不要重复创建同名字段。", "The filename must be settings.json. Use straight double quotes, with no comments or trailing commas. If an env object already exists, merge these two fields into it instead of creating another env field.")}</p>
              <p className="guide-muted">{t("配置文件位置和 JSON 格式可查阅", "For file locations and JSON format, see the ")} <a className="guide-inline-link" href="https://code.claude.com/docs/en/settings" target="_blank" rel="noopener noreferrer"><span>{t("Claude Code 官方设置说明", "official Claude Code settings documentation")}</span><ArrowUpRight size={12} aria-hidden="true" /></a>{t("。官方说明用于核对软件配置，不代表日不落允许使用其中介绍的所有接入方式。", ". This reference explains software configuration; it does not mean that every connection method described there is allowed by SunNeverSets.")}</p>
              <div className="guide-desktop-note"><span className="guide-kicker">CLAUDE DESKTOP</span><h4>{t("Desktop 需要项目专用教程。", "Desktop needs our specific setup guide.")}</h4><p>{t("Claude Desktop 在允许使用的客户端范围内，但需要按照日不落提供的方式配置。请向客服领取与你的操作系统和版本匹配的配置教程，使用平台提供的地址与密钥。", "Claude Desktop is an approved client, but must be configured using the SunNeverSets method. Ask support for instructions matched to your operating system and app version, and use the platform-provided address and key.")}</p><p><strong>{t("不要把「支持 Claude Desktop」理解为可以用原账号的邮箱和密码直接登录。", "Support for Claude Desktop does not permit signing in directly with the original account email and password.")}</strong></p><p>{t("尚未取得项目专用 Desktop 教程时，请先使用已完成配置的 Claude Code，或等待客服协助。", "Until you have the project-specific Desktop guide, use a correctly configured Claude Code client or wait for support.")}</p></div>
            </div></article>
            <article className="guide-step" id="guide-step-5"><span className="guide-step-marker">5</span><div className="guide-step-body"><h3>{t("测试并确认可以使用", "Test and confirm your connection")}</h3>
              <ol><li>{t("在完成配置的客户端中发送一条简单测试消息，例如「你好，请简短回复」。", "Send a simple message in the configured client, such as “Hello, please reply briefly.”")}</li><li>{t("确认客户端收到正常回复。", "Confirm that the client receives a normal response.")}</li><li>{t("返回控制台，核对该账号或接入点是否出现对应时间的请求记录。", "Return to the console and look for the matching request record under the account or endpoint.")}</li><li>{t("确认调用的是预期账号，再开始日常使用。", "Confirm that the intended account was used before starting regular work.")}</li></ol>
              <p>{t("如果仍要求你直接登录原账号，或客户端虽有回复但控制台没有对应记录，请先联系客服核查，不要立即启动大量任务。", "If you are still asked to sign in directly with the original account, or the client replies but the console has no matching record, contact support before starting a large workload.")}</p>
              <Notice tone="important"><strong>{t("前两天保持轻量使用，尤其是 Max 20X 用户。", "Keep usage light for the first two days, especially on Max 20X.")}</strong><p>{t("避免长时间连续运行、大量并发和集中消耗额度，之后再逐步增加使用量。此建议不代表不会发生账号风险。", "Avoid long continuous runs, heavy concurrency and concentrated quota consumption, then increase usage gradually. This recommendation does not eliminate account risk.")}</p></Notice>
            </div></article>
          </div>
        </section>

        <section id="usage-rules" className="guide-section"><GuideHeading number="02" subtitle={t("允许范围只有按项目教程配置的 Claude Code 和 Claude Desktop。", "Only Claude Code and Claude Desktop, configured according to our guide, are allowed.")}>{t("使用限制", "Usage rules")}</GuideHeading>
          <div className="guide-table-wrap"><table className="guide-table guide-rules-table"><thead><tr><th scope="col">{t("操作", "Action")}</th><th scope="col">{t("是否允许及注意事项", "Permission and conditions")}</th></tr></thead><tbody>{guideRestrictions.map((rule, index) => <tr key={index}><th scope="row">{copy(rule.action)}</th><td><span className={`guide-permission ${rule.allowed ? "is-allowed" : "is-prohibited"}`}>{rule.allowed ? <Check size={13} /> : <Minus size={13} />}{rule.allowed ? t("允许", "Allowed") : t("禁止", "Prohibited")}</span><span className="guide-rule-note">{copy(rule.note)}</span></td></tr>)}</tbody></table></div>
          <Notice tone="important">{t("其他客户端或接入方式，不要因为技术上能够连接就自行使用；不确定时先咨询客服。接入限制也适用于临时测试，不因使用时间短而豁免。", "Do not use another client or connection method just because it can technically connect. Ask support first when uncertain. The same rules apply to temporary tests, however brief.")}</Notice>
        </section>

        <section id="troubleshooting" className="guide-section"><GuideHeading number="03" subtitle={t("先看控制台的账号状态，再核对客户端配置。单次报错不能直接判断为封号。", "Check your console account status first, then the client settings. A single error does not establish that an account is suspended.")}>{t("问题排查", "Troubleshooting")}</GuideHeading>
          <div className="guide-troubleshooting-list">{guideTroubleshooting.map((item, index) => <article key={index}><h3><span>{String(index + 1).padStart(2, "0")}</span>{copy(item.problem)}</h3><div><span>{t("先检查", "CHECK FIRST")}</span><p>{copy(item.check)}</p></div><div><span>{t("仍未解决", "IF UNRESOLVED")}</span><p>{copy(item.next)}</p></div></article>)}</div>
          <Notice>{t("不要通过更换第三方 Agent、反复切换接入方式或绕开平台登录来排查问题。", "Do not troubleshoot by switching to third-party agents, repeatedly changing connection methods or signing in outside the platform.")}</Notice>
        </section>

        <section id="guide-faq" className="guide-section"><GuideHeading number="04" subtitle={t("关于套餐、账号、额度与使用方式的具体说明。", "Specific answers about plans, accounts, usage limits and access.")}>{t("常见疑问", "Common questions")}</GuideHeading>
          <div className="guide-faq-list">{guideFaq.map((faq, index) => <details key={index}><summary>{copy(faq.question)}<ChevronDown size={18} /></summary><div>{faq.answer.map((paragraph, p) => <p key={p}>{copy(paragraph)}</p>)}</div></details>)}</div>
        </section>

        <section id="after-sales" className="guide-section"><GuideHeading number="05" subtitle={t("付款前确认覆盖范围；出现异常后分别核查原因。", "Confirm coverage before paying. Different types of issues need separate checks.")}>{t("售后说明", "After-sales support")}</GuideHeading>
          <Notice tone="important"><strong>{t("如需获取账号的邮箱和密码，则不提供质保。", "Warranty coverage is not provided if you request the account email and password.")}</strong><p>{t("请在索取前确认该选择对本次订单售后的影响。", "Confirm how this choice affects your order’s after-sales coverage before requesting them.")}</p></Notice>
          <div className="guide-after-sales"><article><span>01</span><div><h3>{t("质保内的封禁处理", "Suspension within warranty coverage")}</h3><p>{t("对于享有质保的账号，如发生封禁，请及时联系客服。经核查未发现违反使用条例的情况，按剩余未使用的服务天数计算退款，并扣除相应手续费。", "If an account covered by the warranty is suspended, contact support promptly. If a review finds no breach of the usage rules, a refund is calculated from the remaining unused service days, less the applicable handling fee.")}</p></div></article><article><span>02</span><div><h3>{t("退款条件与手续费", "Refund conditions and handling fees")}</h3><p>{t("退款计算方式及手续费的具体金额或比例，请在付款前向客服确认。账号异常、额度用满、网络问题和封禁需要分别核查，不以一次连接失败直接认定退款条件已经成立。", "Confirm the refund calculation and the exact handling fee or percentage with support before paying. Account issues, exhausted quota, network problems and suspensions require separate investigation. One failed connection does not by itself establish refund eligibility.")}</p></div></article><article><span>03</span><div><h3>{t("续费与订单跟进", "Renewals and order follow-up")}</h3><p>{t("续费目前维持原价。续费办理、订阅起止时间和交付进度，请通过订单对应的客服入口确认。", "Renewals currently retain the original price. Confirm renewal arrangements, subscription dates and delivery progress through the support contact associated with your order.")}</p></div></article></div>
        </section>

        <section id="guide-contact" className="guide-section"><GuideHeading number="06" subtitle={t("把关键信息一次说明白，能减少来回追问。", "Include the key details up front to reduce back-and-forth.")}>{t("联系客服", "Contact support")}</GuideHeading>
          <div className="guide-contact-card"><span className="guide-kicker">{t("官方客服", "OFFICIAL SUPPORT")}</span><h3>{t("咨询、购买与售后，都从这里联系。", "One contact for questions, purchases and support.")}</h3><p>{t("先添加 Telegram 客服，确认套餐、付款与交付安排；已有订单的问题也可在这里跟进。共性问题可在群内反馈，截图先打码。", "Contact us on Telegram to confirm your package, payment and delivery. You can also follow up on an existing order here. General issues may be raised in the group, with screenshots redacted first.")}</p><ContactOptions /></div>
          <p>{t("复制下面的模板，按实际情况填写：", "Copy this template and fill in your details:")}</p>
          <CopyBlock key={`support-${locale}`} value={copy(guideSupportTemplate)} kind={t("客服反馈模板", "Support request template")} label={t("复制客服反馈模板", "Copy support request template")} />
          <Notice>{t("不要在模板里填写密码、验证码、Cookie 或完整 API Key。订单凭证仅按客服需要，通过确认过的客服入口提交。", "Do not include passwords, verification codes, cookies or a full API Key. Submit order receipts only when support requests them, through a verified support channel.")}</Notice>
        </section>

        <section id="community-rules" className="guide-section"><GuideHeading number="07" subtitle={t("欢迎提问、分享经验，也欢迎反馈不满意的体验。", "Questions, shared experiences and feedback about problems are welcome.")}>{t("群内交流规则", "Community guidelines")}</GuideHeading>
          <ol className="guide-community-list">{guideCommunity.map((rule, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span><p>{copy(rule)}</p></li>)}</ol>
        </section>
        <nav className="guide-related" aria-label={t("相关说明", "Related guides")}>
          <a href={pageHref("pricing", locale)}>{t("套餐价格与交付", "Plans and delivery")} ↗</a>
          <a href={pageHref("setup", locale)}>{t("Claude Code 接入教程", "Claude Code setup")} ↗</a>
          <a href={pageHref("troubleshooting", locale)}>{t("连接与额度问题排查", "Connection and usage troubleshooting")} ↗</a>
        </nav>
        <div className="guide-bottom"><span>{t("日不落用户使用指南 · v0.1", "SunNeverSets user guide · v0.1")}</span><a href="#guide-top">{t("返回顶部", "Back to top")}<ArrowUp size={14} /></a></div>
      </div>
    </div>
  </div>;
}
