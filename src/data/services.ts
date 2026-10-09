export const serviceLayers = [
  {
    id: "hardware",
    title: "机房基础设施",
    description: "海外 Mac 机房，作为平台基础。",
    detail: "海外 Mac 机房是日不落的基础设施。当前套餐交付的是 Claude 一条龙服务，不包含供用户远程操作的 Mac；整机规格也不代表用户可用资源。",
    eyebrow: "MAC INFRASTRUCTURE",
    icon: "monitor",
  },
  {
    id: "macos",
    title: "运行基础",
    description: "机房端的 Mac 与 macOS 环境。",
    detail: "Mac 与 macOS 构成机房端的运行基础。你在自己的电脑上配置 Claude 客户端使用服务，无需操作图中的机房桌面。",
    eyebrow: "OPERATING FOUNDATION",
    icon: "apple",
  },
  {
    id: "tools",
    title: "托管服务",
    description: "账号、订阅、KYC 与托管一起交付。",
    detail: "Claude 账号、订阅、KYC、托管席位和托管操作五项统一打包。Max 5X 先导价 1299 元 / 月，Max 20X 先导价 2299 元 / 月；服务周期均为一个月，续费目前维持原价。订阅起止时间与交付安排请在付款前确认。",
    eyebrow: "FIVE-PART BUNDLE",
    icon: "terminal",
  },
  {
    id: "network",
    title: "客户端接入",
    description: "在本机配置 Code 或 Desktop。",
    detail: "账号就绪后，在控制台创建接入点，取得地址与 API Key。仅允许按项目教程配置的 Claude Code 和 Claude Desktop；其他工具、第三方接入与原账号直接登录不在允许范围内。",
    eyebrow: "LOCAL CLIENT ACCESS",
    icon: "globe",
  },
  {
    id: "support",
    title: "配置与支持",
    description: "按教程配置，按记录排查。",
    detail: "提供安装与配置协助。遇到问题，先核对控制台状态、客户端配置和额度窗口，再向指定客服提交打码后的报错。使用规则和质保范围请在付款前确认。",
    eyebrow: "SETUP & SUPPORT",
    icon: "settings",
  },
] as const;

export type ServiceLayerId = (typeof serviceLayers)[number]["id"];

export const serviceSummaries = [
  { title: "机房基础", description: "海外 Mac 基础设施" },
  { title: "五项打包", description: "Claude 一条龙服务" },
  { title: "本机使用", description: "Code 与 Desktop" },
  { title: "规则明确", description: "接入范围与质保" },
] as const;

const englishServiceLayers = [
  {
    ...serviceLayers[0], title: "Mac infrastructure", description: "Overseas Macs form our infrastructure.",
    detail: "Our overseas Mac facility is part of SunNeverSets infrastructure. The current package delivers a complete Claude service, not a Mac for you to operate remotely. Whole-device specifications do not describe resources allocated to you.",
  },
  {
    ...serviceLayers[1], title: "macOS foundation", description: "Mac hardware and macOS at the facility.",
    detail: "Mac hardware and macOS form the facility's operating foundation. You configure a Claude client on your own computer to use the service; you do not need to operate the facility desktop shown here.",
  },
  {
    ...serviceLayers[2], title: "Managed service", description: "Account, subscription, KYC, and hosting.",
    detail: "Five items are bundled together: a Claude account, subscription, KYC, hosting slot, and managed hosting setup. Introductory prices are CNY 1,299 for Max 5X and CNY 2,299 for Max 20X, each for one month of service. Renewals currently keep the same price. Confirm subscription dates and delivery arrangements before paying.",
  },
  {
    ...serviceLayers[3], title: "Client access", description: "Configure Code or Desktop locally.",
    detail: "Once the account is ready, create an access point in the console to obtain its address and API Key. Only Claude Code and Claude Desktop configured with the project guides are permitted. Other tools, third-party connections, and direct sign-in with the original account are outside the permitted scope.",
  },
  {
    ...serviceLayers[4], title: "Setup & support", description: "Guided setup. Record-based troubleshooting.",
    detail: "Installation and configuration assistance is available. For issues, check console status, client settings, and usage windows, then send redacted error details to the designated support contact. Confirm usage rules and warranty coverage before paying.",
  },
] as const;
const englishServiceSummaries = [
  { title: "Mac infrastructure", description: "An overseas Mac facility" },
  { title: "Five-part bundle", description: "A complete Claude service" },
  { title: "Local clients", description: "Code and Desktop" },
  { title: "Clear rules", description: "Access and warranty terms" },
] as const;
export const getServiceLayers = (locale: "zh" | "en") => locale === "en" ? englishServiceLayers : serviceLayers;
export const getServiceSummaries = (locale: "zh" | "en") => locale === "en" ? englishServiceSummaries : serviceSummaries;
