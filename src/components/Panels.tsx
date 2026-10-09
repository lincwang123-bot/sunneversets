import { useLayoutEffect, useRef, useState } from "react";
import { ArrowDownToLine, ArrowLeft, ArrowRight, Check, ChevronDown, Code2, RotateCcw, ShieldCheck, X } from "lucide-react";
import { getScenarios } from "../data/content";
import { contact, consoleUrl, getServiceBundle, plans, type PlanId } from "../data/business";
import { getGuideFaq } from "../data/guide";
import { useLanguage } from "../i18n";
import { pageHref } from "../routing";
import ContactOptions from "./ContactOptions";
import "../styles/panels.css";
export type PanelKind = "demo" | "start" | "pricing" | "help" | null;
type PanelsProps = { initialPlan?: PlanId; kind: PanelKind; onClose: () => void; scenario: string; onScenarioChange: (id: string) => void };

function GuideLink() {
  const { locale, t } = useLanguage();
  return <a className="panel-guide-link" href={pageHref("guide", locale)}>{t("阅读完整用户指南", "Read the full user guide")}<ArrowRight size={16} /></a>;
}

function DemoPanel({ scenario, onScenarioChange }: Pick<PanelsProps, "scenario" | "onScenarioChange">) {
  const { locale, t } = useLanguage();
  const [step, setStep] = useState(0);
  const [replay, setReplay] = useState(0);
  const scenarios = getScenarios(locale);
  const steps = [
    { title: t("确认套餐与交付", "Confirm your package"), body: t("先添加 Telegram 客服，选择 Max 5X 或 Max 20X，确认订阅起止时间、交付安排与质保范围后再付款。", "Contact support on Telegram to choose Max 5X or Max 20X, then confirm subscription dates, delivery, and warranty coverage before paying.") },
    { title: t("创建控制台接入点", "Create a console endpoint"), body: t("用确认过的邮箱登录中继控制台。核对账号已就绪，再创建接入点，取得地址与密钥。", "Sign in to the relay console with your confirmed email. Check the account is ready, then create an endpoint for your address and key.") },
    { title: t("在本机配置并测试", "Configure and test locally"), body: t("按教程配置 Claude Code 或 Claude Desktop，发送简单测试消息，并在控制台核对请求记录。", "Follow the setup guide for Claude Code or Claude Desktop. Send a simple test message and check its record in the console.") },
  ];
  return <>
    <div className="panel-eyebrow">FROM SETUP TO YOUR FIRST REQUEST</div>
    <h2 id="panel-title" className="panel-heading">{t("在自己的电脑上，开始使用 Claude。", "Start using Claude on your own computer.")}</h2>
    <p className="panel-subtitle">{t("我们协助完成账号、订阅、KYC、席位与托管操作。你按指南配置两个允许的客户端。", "We help with the account, subscription, KYC, seat, and hosting setup. You configure one of the two approved clients using the guide.")}</p>
    <div className="panel-scenario-picker" role="group" aria-label={t("选择演示场景", "Choose a demo scenario")}>{scenarios.map(item => <button key={item.id} aria-pressed={scenario === item.id} onClick={() => onScenarioChange(item.id)}><Code2 size={15} />{item.label}</button>)}</div>
    <div className="panel-demo-layout">
      <div className="panel-step-list" role="group" aria-label={t("演示步骤", "Demo steps")}>{steps.map((item,index) => <button key={item.title} className={`panel-step ${step===index ? "panel-step-active" : ""}`} aria-current={step===index ? "step" : undefined} onClick={() => setStep(index)}><span className="panel-step-number">0{index+1}</span><span><strong>{item.title}</strong><small>{item.body}</small></span></button>)}</div>
      <div className="panel-demo-screen" aria-live="polite"><div className="panel-screen-chrome"><span className="panel-window-dots"><i/><i/><i/></span><span>{t("SunNeverSets · 接入流程示意", "SunNeverSets · Setup preview")}</span></div><div className="panel-preview-enter package-step-preview" key={`${step}-${replay}`}>
        <span>0{step+1}</span><h3>{steps[step].title}</h3><p>{steps[step].body}</p>
        {step===0 && <ul>{getServiceBundle(locale).map(item => <li key={item}><Check size={14}/>{item}</li>)}</ul>}
        {step===1 && <><code>Base URL + API Key</code><p>{t("使用你自己的控制台配置，不要照抄示意值或公开密钥。", "Use your own console-generated settings. Never copy sample values or share keys.")}</p><a href={consoleUrl} target="_blank" rel="noopener noreferrer">{t("进入控制台", "Open console")} ↗</a></>}
        {step===2 && <><code>Claude Code / Claude Desktop</code><p>{t("Desktop 需领取匹配系统与版本的专用教程，不使用原账号直接登录。", "Desktop requires the dedicated guide for your OS and version. Do not sign in directly with the original account.")}</p></>}
      </div></div>
    </div>
    <div className="panel-demo-controls"><button className="panel-text-button" onClick={() => {setStep(0);setReplay(value=>value+1);}}><RotateCcw size={14}/>{t("重播演示", "Replay demo")}</button><div className="panel-navigation"><button className="panel-secondary-button" disabled={step===0} onClick={()=>setStep(step-1)}><ArrowLeft size={15}/>{t("上一步", "Previous")}</button><button className="panel-primary-button" disabled={step===2} onClick={()=>setStep(step+1)}>{t("下一步", "Next")}<ArrowRight size={15}/></button></div></div><GuideLink/>
  </>;
}

function StartPanel({ scenario, initialPlan = "max5x" }: Pick<PanelsProps,"scenario" | "initialPlan">) {
  const { locale, t } = useLanguage();
  const [planId,setPlanId] = useState<string>(initialPlan);
  const [downloaded,setDownloaded] = useState(false);
  const plan = plans.find(item=>item.id===planId) ?? plans[0];
  const preparation = [
    t("确认套餐、订阅起止时间、交付安排及可开始使用的时间。", "Confirm the package, subscription dates, delivery, and when you can begin."),
    t("准备能收取验证码的控制台登录邮箱，确认席位已开通。", "Prepare a console login email that can receive verification codes, and confirm the seat is active."),
    t("确认电脑系统与客户端版本，按专用教程配置 Code 或 Desktop。", "Confirm your OS and client version, then follow the dedicated Code or Desktop setup guide."),
    t("付款前确认质保范围、退款方式与手续费；索取账号邮箱和密码不提供质保。", "Confirm warranty coverage, refund terms, and fees before payment. Requesting the account email and password removes warranty coverage."),
  ];
  function downloadSummary() {
    const selected=getScenarios(locale).find(item=>item.id===scenario);
    const contents=[t("# 日不落 · 开通准备清单", "# SunNeverSets · Setup checklist"),"",t("> 本地生成，未提交给客服，不构成订单。", "> Generated locally, not sent to support, and not an order."),"",`${plan.name} · ¥${plan.price} · ${t("先导价 / 月", "Introductory / month")}`,t("服务周期为一个月；具体订阅起止时间与交付安排付款前确认。续费目前维持原价。", "The service period is one month. Confirm subscription start and end dates and delivery before payment. Renewals currently remain at the same price."),getServiceBundle(locale).join(" + "),"",...preparation.map(item=>`- ${item}`),"",t("- 仅限按教程配置的 Claude Code 与 Claude Desktop，不允许第三方 Agent、cc-connect、cc-switch、微信或 QQ 远程调用。", "- Only correctly configured Claude Code and Claude Desktop are allowed. Third-party agents, cc-connect, cc-switch, and remote calls through WeChat or QQ are prohibited."),t("- 同一账号最多同时 6 个 session；Max 前两天保持轻量使用，尤其 20X。", "- No more than 6 concurrent sessions per account. Keep usage light for the first two days, especially on Max 20X."),t("- 不绕过托管直接登录原账号。需要账号邮箱和密码的，不提供质保。", "- Do not bypass hosting to sign in directly with the original account. Requesting its email and password removes warranty coverage."),t("- 享有质保且核查无违规的封禁账号，按剩余未使用天数退款并扣手续费，具体金额付款前确认。", "- For a banned account with warranty coverage and no verified rule violations, refunds are based on unused service days minus a fee. Confirm the fee before payment."),t("- 海外 Mac 机房是基础设施，本套餐不等于提供一台远程电脑。", "- Our overseas Mac facility is infrastructure. This package does not provide a remote computer."),t("- 不售卖独立托管服务或 Pro 一条龙套餐。", "- Standalone hosting and Pro packages are not offered."),"",`${t("演示场景", "Demo scenario")}: ${selected?.label}`,`${t("用户指南", "User guide")}: https://sunneversets.ai${pageHref("guide", locale)}`,`${t("咨询与购买：先添加 Telegram 客服", "Inquiries and purchases: contact us on Telegram")} ${contact.handle} · ${contact.link}`,""].join("\n");
    const url=URL.createObjectURL(new Blob([contents],{type:"text/markdown;charset=utf-8"}));
    const link=document.createElement("a");link.href=url;link.download=`SunNeverSets-${plan.id}-${locale}-setup-checklist.md`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setDownloaded(true);
  }
  return <><div className="panel-eyebrow">YOUR FIRST STEP</div><h2 id="panel-title" className="panel-heading">{t("开通前，逐项确认。", "Confirm the details before you start.")}</h2><p className="panel-subtitle">{t("选择想了解的套餐，添加 Telegram 客服咨询和购买。客服会与你确认付款、订阅期限和交付安排；准备清单可按需保存。", "Choose a package, then contact support on Telegram to ask questions or buy. Support will confirm payment, subscription dates and delivery. Save the checklist if useful.")}</p>
    <div className="panel-paths" role="group" aria-label={t("选择套餐", "Choose a package")}>{plans.map(item=><button key={item.id} aria-pressed={planId===item.id} onClick={()=>{setPlanId(item.id);setDownloaded(false);}}><Check size={20}/><strong>{item.name}</strong><span>¥{item.price.toLocaleString("en-US")} · {t("先导价 / 月", "Introductory / month")}</span></button>)}</div>
    <div className="panel-start-details"><div><h3>{t("你需要确认", "What to confirm")}</h3><ul className="panel-checklist">{preparation.map(item=><li key={item}><Check size={15}/><span>{item}</span></li>)}</ul></div></div>
    <p className="panel-pending-note">{t("先导价包含一个月的账号、Claude 订阅、KYC、托管席位与托管操作服务。具体订阅起止时间、交付安排和退款手续费，请付款前确认。", "The introductory price covers one month of the account, Claude subscription, KYC, hosting seat, and hosting setup service. Confirm subscription start and end dates, delivery, and refund fees before payment.")}</p>
    <ContactOptions/><div className="panel-start-footer"><p role="status">{downloaded?t("已生成本地文件，请查看浏览器下载。", "Your checklist is ready. Check your browser downloads."):t("保存清单，方便与客服逐项核对。", "Save a checklist to review with support.")}</p><button className="panel-secondary-button" onClick={downloadSummary}><ArrowDownToLine size={16}/>{t("保存准备清单", "Save checklist")}</button></div><GuideLink/>
  </>;
}
function PricingPanel() {
  const {locale,t}=useLanguage();
  return <><div className="panel-eyebrow">FIVE PARTS. ONE PACKAGE.</div><h2 id="panel-title" className="panel-heading">{t("Claude Max，一次安排好。", "Your Claude Max package, arranged.")}</h2><p className="panel-subtitle">{getServiceBundle(locale).join(" + ")}</p><div className="panel-pricing-list">{plans.map(plan=><div className="panel-pricing-row" key={plan.id}><Code2 size={23}/><div><h3>{plan.name}</h3><p>{t("一条龙服务 · 以上五项统一打包", "Full-service package · Includes all five parts")}</p></div><strong>¥{plan.price.toLocaleString("en-US")}<small>{t("先导价 / 月", "Introductory / month")}</small></strong></div>)}</div><div className="panel-pricing-bottom"><span>{t("续费目前维持原价", "Renewals currently remain at the same price")}</span><p>{t("服务周期为一个月。具体订阅起止时间、交付安排与售后范围，付款前确认。不再售卖单独的托管服务或 Pro 账号一条龙套餐。Max 也不代表无限额度。", "Each plan covers one month of service. Confirm subscription dates, delivery, and after-sales coverage before payment. Standalone hosting and Pro packages are no longer offered. Max does not mean unlimited usage.")}</p></div><a className="panel-guide-link" href={pageHref("pricing", locale)}>{t("查看完整套餐与交付说明", "Read full plan and delivery details")}<ArrowRight size={16}/></a><GuideLink/><ContactOptions/></>;
}
function HelpPanel() {
  const {locale,t}=useLanguage();
  return <><div className="panel-eyebrow">KNOW BEFORE YOU START</div><h2 id="panel-title" className="panel-heading">{t("开通前，把这些说清楚。", "Know the details before you start.")}</h2><p className="panel-subtitle">{t("服务内容、客户端限制、额度与售后，均以用户指南为准。", "Service details, client restrictions, usage, and support terms follow the user guide.")}</p><div className="panel-faq-list">{getGuideFaq(locale).map((item,index)=><details className="panel-faq" key={index} open={index===0?true:undefined}><summary>{item.question}<ChevronDown size={18}/></summary><p style={{whiteSpace:"pre-line"}}>{item.answer}</p></details>)}</div><div className="panel-help-note"><ShieldCheck size={18}/><p>{t("有海外 Mac 机房基础设施；当前套餐不等于提供一台远程电脑。", "We have overseas Mac infrastructure; the current package does not provide a remote computer.")}</p></div><a className="panel-guide-link" href={pageHref("pricing", locale)}>{t("查看完整套餐与交付说明", "Read full plan and delivery details")}<ArrowRight size={16}/></a><GuideLink/><ContactOptions/></>;
}
export default function Panels({
  initialPlan,
  kind,
  onClose,
  scenario,
  onScenarioChange,
}: PanelsProps) {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!kind || !dialog) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, [kind]);

  return (
    <dialog
      ref={dialogRef}
      className={`modal-dialog ${kind === "demo" ? "modal-dialog-wide" : ""}`}
      aria-labelledby="panel-title"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const focusable = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((element) => element.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            onClose();
        }
      }}
    >
      {kind && (
        <div className="modal-content" key={kind}>
          <button
            type="button"
            className="modal-close"
            aria-label={t("关闭面板", "Close panel")}
            onClick={onClose}
            autoFocus
          >
            <X size={21} strokeWidth={1.5} />
          </button>
          {kind === "demo" && (
            <DemoPanel
              scenario={scenario}
              onScenarioChange={onScenarioChange}
            />
          )}
          {kind === "start" && <StartPanel scenario={scenario} initialPlan={initialPlan} />}
          {kind === "pricing" && <PricingPanel />}
          {kind === "help" && <HelpPanel />}
          <p className="panel-disclaimer">
            {t("交互示意，未连接真实设备或调用 AI。保存清单不会提交需求或创建订单。", "Interactive preview only; no real device or AI is connected. Saving a checklist does not submit a request or create an order.")}
          </p>
        </div>
      )}
    </dialog>
  );
}
