export const scenarios = [
  {
    id: "writing",
    label: "AI 写作与研究",
    short: "写作与研究",
    tool: "Claude Desktop",
    title: "Welcome back.",
    subtitle: "Let’s build something great.",
    placeholder: "今天，想从哪个好想法开始？",
    result:
      "示例研究提纲已准备好：明确问题 → 整理资料 → 对照观点 → 完成初稿。你可以在自己的工作环境中继续展开。",
  },
  {
    id: "coding",
    label: "AI 编程",
    short: "AI 编程",
    tool: "Claude Code",
    title: "An idea. A first commit.",
    subtitle: "Your next project starts here.",
    placeholder: "描述你想实现的小项目…",
    result:
      "示例项目计划：初始化应用 → 拆分组件 → 实现交互 → 测试并预览。这里展示预制内容，没有创建真实项目。",
  },
  {
    id: "workflow",
    label: "接入与使用",
    short: "接入与使用",
    tool: "Claude Code",
    title: "Everything, in its place.",
    subtitle: "One workspace. Your whole workflow.",
    placeholder: "试着描述你的工作流程…",
    result:
      "示例工作流：确认控制台账号就绪 → 按教程配置 Claude Code 或 Claude Desktop → 发送测试消息 → 核对控制台请求记录。",
  },
] as const;
export const tools = ["Claude Code", "Claude Desktop"] as const;
export const device = {
  name: "海外 Mac 机房",
  status: "基础设施",
  location: "海外",
  chip: "M6（暂定）",
  memory: "16 GB",
  storage: "512 GB",
};
export const assets = {
  background: "/assets/city-desk.webp",
  monitor: "/assets/monitor.webp",
  mac: "/assets/mac-mini.webp",
};
export const motionConfig = {
  duration: 2.2,
  easing: [0.22, 1, 0.36, 1] as const,
  parallax: 4,
};

const englishScenarios = [
  {
    ...scenarios[0], label: "AI writing & research", short: "Writing & research",
    placeholder: "What idea would you like to explore?",
    result: "Sample research outline: define the question → gather sources → compare perspectives → draft your first version. Continue developing it in your own workspace.",
  },
  {
    ...scenarios[1], label: "AI coding", short: "AI coding",
    placeholder: "Describe the product you want to build…",
    result: "Sample project plan: initialize the app → break it into components → build interactions → test and preview. This is a preset example; no real project has been created.",
  },
  {
    ...scenarios[2], label: "Setup & usage", short: "Setup & usage",
    placeholder: "Describe your workflow…",
    result: "Sample workflow: check the hosted account is ready → configure Claude Code or Claude Desktop as instructed → send a test message → verify the request in the console.",
  },
] as const;
const englishDevice = {
  ...device, name: "Overseas Mac facility", status: "Infrastructure",
  location: "Overseas", chip: "M6 (provisional)",
};
export const getScenarios = (locale: "zh" | "en") => locale === "en" ? englishScenarios : scenarios;
export const getDevice = (locale: "zh" | "en") => locale === "en" ? englishDevice : device;
