export type GuideCopy = readonly [string, string];

export const guideSections: { id: string; title: GuideCopy; short: GuideCopy }[] = [
  { id: "getting-started", title: ["首次使用", "Getting started"], short: ["完成接入的五步", "Five steps to connect"] },
  { id: "usage-rules", title: ["使用限制", "Usage rules"], short: ["允许与禁止的接入方式", "Allowed ways to connect"] },
  { id: "troubleshooting", title: ["问题排查", "Troubleshooting"], short: ["先核对状态，再检查配置", "Check status and settings"] },
  { id: "guide-faq", title: ["常见疑问", "Common questions"], short: ["套餐、额度与账号", "Plans, usage and accounts"] },
  { id: "after-sales", title: ["售后说明", "After-sales support"], short: ["质保、退款与续费", "Coverage, refunds and renewals"] },
  { id: "guide-contact", title: ["联系客服", "Contact support"], short: ["准备好信息，减少来回沟通", "What to include in your request"] },
  { id: "community-rules", title: ["群内交流规则", "Community guidelines"], short: ["一起维护友好的交流环境", "Keep the community welcoming"] },
];

export const guideRestrictions: { action: GuideCopy; allowed: boolean; note: GuideCopy }[] = [
  { action: ["按项目教程配置 Claude Code", "Claude Code configured using our guide"], allowed: true, note: ["允许。", "Allowed."] },
  { action: ["按项目教程配置 Claude Desktop", "Claude Desktop configured using our guide"], allowed: true, note: ["允许，须使用项目确认的配置方式。", "Allowed only with the configuration confirmed by SunNeverSets."] },
  { action: ["接入第三方 Agent 或第三方调用工具", "Third-party agents or request tools"], allowed: false, note: ["禁止。", "Not allowed."] },
  { action: ["使用 cc-connect、cc-switch", "Using cc-connect or cc-switch"], allowed: false, note: ["禁止，不因只用于配置切换而例外。", "Not allowed, including use solely for switching configurations."] },
  { action: ["接入微信、QQ 远程调用或使用", "Remote use through WeChat or QQ"], allowed: false, note: ["禁止。", "Not allowed."] },
  { action: ["临时测试第三方接入、转发消息或远程调用", "Temporary tests of third-party access, message forwarding or remote calls"], allowed: false, note: ["同样禁止，不因使用时间短而豁免。", "Also not allowed. Brief tests are not exempt."] },
  { action: ["托管后绕开平台直接登录 Claude 网页版", "Bypassing the platform to sign in to Claude on the web after hosting"], allowed: false, note: ["禁止。托管授权或重新授权须按客服确认的流程操作。", "Not allowed. Follow the support-confirmed process for hosting authorization or reauthorization."] },
  { action: ["用原账号直接登录 Claude Desktop 或手机 App", "Signing in directly with the original account in Claude Desktop or the mobile app"], allowed: false, note: ["禁止。", "Not allowed."] },
  { action: ["讨论敏感、违法违规话题，尝试突破模型安全限制", "Discussing sensitive, illegal or prohibited topics, or attempting to bypass model safety limits"], allowed: false, note: ["禁止。", "Not allowed."] },
  { action: ["在群内或公开渠道发送账号凭证和完整密钥", "Sharing account credentials or complete keys in groups or public channels"], allowed: false, note: ["禁止。", "Not allowed."] },
];

export const guideTroubleshooting: { problem: GuideCopy; check: GuideCopy; next: GuideCopy }[] = [
  { problem: ["收不到控制台验证码", "No console verification code"], check: ["登录邮箱是否正确，垃圾邮件文件夹是否有邮件。", "Check the sign-in email address and your spam folder."], next: ["联系客服核查控制台登录信息。", "Ask support to verify your console sign-in details."] },
  { problem: ["账号未就绪", "Account is not ready"], check: ["控制台账号状态及页面提示。", "Check the account status and notices in the console."], next: ["联系客服并提交打码截图，不要接第三方重试。", "Send a redacted screenshot to support. Do not retry through third-party tools."] },
  { problem: ["配置后无法连接", "Cannot connect after setup"], check: ["地址和密钥是否完整，JSON 格式是否正确，客户端是否重启。", "Check the full address and key, valid JSON, and whether you restarted the client."], next: ["提交错误提示和客户端版本，不发送完整密钥。", "Send the error message and client version, without the full key."] },
  { problem: ["突然无法继续使用", "Access suddenly stops"], check: ["账号状态、5 小时和 7 天额度、服务有效期，以及群内故障通知。", "Check account status, 5-hour and 7-day limits, service expiry, and outage notices in the group."], next: ["将状态截图和出错时间交给客服。", "Send support a status screenshot and the time of the error."] },
  { problem: ["额度消耗看起来异常", "Usage seems unusual"], check: ["控制台对应时间的请求记录。", "Check console request records for the relevant time."], next: ["暂停任务并联系客服核查。", "Pause your tasks and contact support to investigate."] },
  { problem: ["收到封号邮件", "An account suspension email arrives"], check: ["邮件内容和收到时间。", "Check the message and the time it arrived."], next: ["暂停使用，通过客服入口提交打码后的通知。", "Stop using the account and send a redacted copy through the support channel."] },
];

export const guideFaq: { question: GuideCopy; answer: GuideCopy[] }[] = [
  { question: ["日不落提供什么服务？", "What does SunNeverSets provide?"], answer: [
    ["当前提供一条龙服务，将 Claude 普通账号、Claude 订阅、KYC、托管席位和托管操作一起打包，协助你完成从账号准备到托管的各项工作。", "Our current all-in-one service bundles a standard Claude account, a Claude subscription, KYC, a hosting seat, and the hosting setup. We assist with the process from account preparation to hosting."],
    ["你在自己的电脑上使用客户端，平台承接账号托管与请求转发。当前套餐不等于提供一台海外远程电脑。", "You use the client on your own computer; the platform handles account hosting and request forwarding. The current plans do not include an overseas remote computer."],
  ] },
  { question: ["现在可以买哪些套餐？", "Which plans are available?"], answer: [
    ["Claude Max 5X 一条龙服务：先导价 1299 元 / 月。Claude Max 20X 一条龙服务：先导价 2299 元 / 月。服务周期均为一个月，续费目前维持原价。", "Claude Max 5X all-in-one service: introductory price CNY 1,299 per month. Claude Max 20X: introductory price CNY 2,299 per month. Each plan covers one month of service. Renewals currently retain the original price."],
    ["一条龙服务包含 Claude 普通账号、Claude 订阅、KYC、托管席位和托管操作，五项统一打包，由我们协助完成，无需逐项自行办理。", "Each plan bundles all five items: a standard Claude account, a Claude subscription, KYC, a hosting seat, and the hosting setup. We assist with these together, so you do not need to arrange each item separately."],
    ["具体订阅起止时间、交付安排和售后范围，请在付款前确认。不再售卖单独的托管服务，也不再提供 Pro 账号一条龙套餐。", "Confirm the subscription start and end dates, delivery arrangements, and after-sales coverage before paying. Standalone hosting and Pro all-in-one plans are no longer sold."],
  ] },
  { question: ["拿到账号后能马上登录吗？", "Can I sign in as soon as I receive the account?"], answer: [["不能。先静默等待半小时，期间不要登录 Claude 或发起请求。可以通过已经持有的邮箱访问方式查看有无封号邮件；如有异常，先联系客服。", "No. First wait quietly for 30 minutes without signing in to Claude or sending requests. If you already have access to the email account, check for a suspension notice. Contact support first if anything is wrong."]] },
  { question: ["我需要索取邮箱和密码才能使用吗？", "Do I need to request the account email and password?"], answer: [["日常调用使用平台提供的地址与密钥，无需为了配置客户端索取原账号的邮箱和密码。如需获取账号的邮箱和密码，则不提供质保。在索取前先确认本次订单的质保范围。", "Day-to-day requests use the platform-provided address and key. You do not need the original account email and password to configure your client. If you request the account email and password, warranty coverage is not provided. Confirm your order’s coverage before requesting them."]] },
  { question: ["需要一直开着 VPN 吗？", "Do I need to keep a VPN on?"], answer: [["平台说明，托管完成后经平台接入日常使用不需要 VPN。如果你的客户端仍无法连接，请联系客服排查。", "The platform states that routine use through its connection does not require a VPN once hosting is complete. If your client still cannot connect, contact support for troubleshooting."]] },
  { question: ["为什么允许 Desktop，却不允许直接登录？", "Why is Desktop allowed, but direct sign-in is not?"], answer: [["允许的是按项目教程配置后，经平台地址与密钥接入。用原账号直接登录桌面版、网页版或手机 App，会走另一种使用路径，不在当前允许范围内。", "The permitted setup uses the platform address and key, configured according to our guide. Signing in directly with the original account in the desktop, web or mobile app uses a different access path and is outside the currently allowed scope."]] },
  { question: ["cc-switch 只用来切换配置也不可以吗？", "Can I use cc-switch just to switch configurations?"], answer: [["不可以。当前使用条例明确禁止 cc-switch 和 cc-connect，不因用途不同或只是临时测试而例外。", "No. The current rules explicitly prohibit cc-switch and cc-connect. A different purpose or a temporary test does not create an exception."]] },
  { question: ["可以接到微信或 QQ 随时使用吗？", "Can I connect it to WeChat or QQ?"], answer: [["不可以。微信、QQ 等第三方平台的远程调用、转发使用同样属于禁止范围。", "No. Remote calls and forwarded use through third-party platforms such as WeChat or QQ are also prohibited."]] },
  { question: ["平台技术介绍中的其他客户端也能用吗？", "Can I use other clients mentioned in the platform’s technical information?"], answer: [["日不落当前套餐仅允许 Claude Code 和 Claude Desktop。平台的技术能力介绍不等于本套餐允许的接入范围，不能据此接入 Codex 或其他客户端。", "Current SunNeverSets plans allow only Claude Code and Claude Desktop. Descriptions of the platform’s technical capabilities do not define the access allowed by your plan. They do not authorize connecting Codex or other clients."]] },
  { question: ["一个账号最多多少个人使用？", "How many people can use one account?"], answer: [["没有人数限制，但有 session（会话）并发限制：同一个账号同时进行的 session 总数不要超过 6 个。多人使用时，请共同控制该账号的并发 session 数量。", "There is no limit on the number of people, but there is a concurrent-session limit: do not exceed 6 simultaneous sessions on the same account. If several people share an account, coordinate its total concurrent sessions."]] },
  { question: ["Max 20X 可以一开始就大量运行任务吗？", "Can I run heavy workloads immediately on Max 20X?"], answer: [["请先轻量使用两天，避免长时间连续运行、大量并发或集中消耗额度，再逐步增加用量。Max 20X 也不意味着无限额度，额度情况请查看控制台。", "Use it lightly for the first two days. Avoid long continuous runs, heavy concurrency or consuming large amounts of quota at once, then gradually increase usage. Max 20X does not mean unlimited usage. Check your limits in the console."]] },
  { question: ["控制台显示美元金额，是否会另外扣费？", "Will the dollar amounts shown in the console be charged separately?"], answer: [["现有教程中的用量金额用于按 API 价格折算统计，教程标注不用于扣费。不要把统计金额直接理解为额外账单；如实际订单出现其他费用，请先联系客服核对。", "In the current guide, usage amounts are statistical estimates based on API prices and are marked as not used for billing. Do not interpret them as an additional bill. If other charges appear on your actual order, confirm them with support first."]] },
  { question: ["为什么额度用满后不能继续使用？", "Why does access stop when the quota is used up?"], answer: [["调用消耗的是所托管账号的订阅额度。查看控制台的额度窗口与重置提示；额度限制和封号是不同情况。平台有多账号接力能力，但单个套餐不代表自动获得额外账号或无限额度。", "Requests consume the hosted account’s subscription quota. Check the usage windows and reset notices in the console; reaching a limit is different from an account suspension. The platform supports routing across multiple accounts, but a single plan does not automatically provide extra accounts or unlimited quota."]] },
  { question: ["平台是否保存对话内容？", "Does the platform store conversations?"], answer: [["平台公开说明是不保存对话内容，但会记录模型、token 数和时间等用量信息。反馈故障时，也请避免提交无关的私人对话、完整代码或密钥。", "The platform publicly states that it does not store conversation content, but records usage information such as model, token counts and time. When reporting a problem, avoid including unrelated private conversations, full source code or keys."]] },
  { question: ["账号被封后可以退款吗？", "Can I get a refund if an account is suspended?"], answer: [["对于享有质保的账号，经核查未发现违反使用条例的情况，按剩余未使用的服务天数计算退款，并扣除相应手续费。索取账号邮箱和密码的，不提供质保。具体退款方式和手续费请在付款前确认。", "For accounts covered by the warranty, if a review finds no breach of the usage rules, the refund is calculated from the remaining unused service days, less the applicable handling fee. Coverage is not provided if you request the account email and password. Confirm the refund method and handling fee before paying."]] },
];

export const guideCommunity: GuideCopy[] = [
  ["欢迎提问、分享使用经验和反馈不满意的体验；不讨论敏感、违法违规话题，不辱骂或进行人身攻击。", "Questions, experience sharing and feedback about unsatisfactory experiences are welcome. Do not discuss sensitive, illegal or prohibited topics, use abuse or make personal attacks."],
  ["不刷屏、不发无关广告、不私自拉人推销、不冒充客服或骚扰群友。", "Do not spam, post unrelated ads, solicit members for sales, impersonate support or harass other members."],
  ["未经同意，不公开他人的个人资料或聊天记录；账号凭证及付款截图需要打码。", "Do not publish others’ personal information or chat records without consent. Redact account credentials and payment screenshots."],
  ["一般违规先提醒，重复违规可移出群聊；诈骗、冒充客服、恶意泄露他人信息等严重行为可直接移出。", "Ordinary violations receive a warning first; repeated violations may lead to removal. Serious behavior such as fraud, support impersonation or malicious disclosure of personal information may lead to immediate removal."],
  ["群聊管理与订单售后分别处理，未解决的订单问题仍可通过客服入口继续跟进。", "Group moderation and order support are handled separately. Unresolved order issues can still be followed up through the support channel."],
];

export const guideConfig: GuideCopy = [
  '{\n  "env": {\n    "ANTHROPIC_BASE_URL": "替换为控制台提供的完整地址",\n    "ANTHROPIC_AUTH_TOKEN": "替换为控制台提供的密钥"\n  }\n}',
  '{\n  "env": {\n    "ANTHROPIC_BASE_URL": "REPLACE_WITH_FULL_URL_FROM_YOUR_CONSOLE",\n    "ANTHROPIC_AUTH_TOKEN": "REPLACE_WITH_KEY_FROM_YOUR_CONSOLE"\n  }\n}',
];

export const guideSupportTemplate: GuideCopy = [
  "问题类型：首次开通 / 授权 / 配置 / 额度 / 封号 / 其他\n电脑系统：Windows / macOS / 其他\n客户端名称与版本：\n发生时间：\n当前进行到哪一步：\n控制台账号状态：\n具体报错：\n已经尝试的操作：\n附件：打码后的报错或状态截图",
  "Issue type: First setup / Authorization / Configuration / Quota / Suspension / Other\nOperating system: Windows / macOS / Other\nClient name and version:\nTime of the issue:\nCurrent setup step:\nConsole account status:\nExact error message:\nWhat you have already tried:\nAttachments: Redacted error or status screenshots",
];

export function getGuideFaq(locale: "zh" | "en") {
  const index = locale === "en" ? 1 : 0;
  return guideFaq.map(({ question, answer }) => ({
    question: question[index],
    answer: answer.map(paragraph => paragraph[index]).join("\n\n"),
  }));
}
