import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, Clock3, Code2, FolderClosed, MessageSquare, PanelLeft, Plus, Sparkles } from "lucide-react";
import { getScenarios, tools } from "../data/content";
import { useLanguage } from "../i18n";
import ToolIcon from "./ToolIcon";
import "../styles/workspace.css";

export default function WorkspaceScreen({ scenario, onScenarioChange }: {
  scenario: string;
  onScenarioChange: (id: string) => void;
}) {
  const { locale, t } = useLanguage();
  const scenarios = getScenarios(locale);
  const current = scenarios.find((item) => item.id === scenario) ?? scenarios[0];
  const threads = [
    {
      id: "coding", label: t("搭建我的第一个产品", "Build my first product"),
      prompt: t("把这个想法做成一个网站：有产品介绍、功能展示，也能在手机上浏览。", "Turn my idea into a website with a product overview, feature demos, and a mobile-friendly layout."),
      summary: t("先从一个可预览的版本开始。页面结构、样式和交互入口，放在同一个项目里。", "Start with a version you can preview. Page structure, styles, and interactions, all in one project."),
      rows: [["src/App.tsx", t("产品首页与页面结构", "Product page and layout")], ["src/styles.css", t("桌面与移动端样式", "Desktop and mobile styles")], ["npm run dev", t("本地预览入口", "Local preview")]],
    },
    {
      id: "writing", label: t("整理产品研究与思路", "Research the product idea"),
      prompt: t("帮我整理这个产品的目标用户、使用场景和第一版需要做的功能。", "Help me define the audience, use cases, and features for the first version of this product."),
      summary: t("把想法拆成可以讨论的问题，再逐步补充资料。先明确做给谁，解决什么问题。", "Break the idea into questions you can explore. Start with who it is for and the problem it solves."),
      rows: [["audience.md", t("目标用户与使用场景", "Audience and use cases")], ["research.md", t("资料与待核实的来源", "Research and sources to verify")], ["outline.md", t("第一版功能提纲", "First-version feature outline")]],
    },
    {
      id: "workflow", label: t("检查项目，准备下一步", "Review the next steps"),
      prompt: t("整理一下项目接下来要做的事情，从开发、检查到预览，列成一份清单。", "Make a checklist of the next steps for this project, from development and checks to a preview."),
      summary: t("在本机完成客户端配置，发送一条测试消息，再去控制台核对账号和请求记录。", "Configure your client locally, send a test message, then check the account and request record in the console."),
      rows: [["Claude Code", t("在本机开始编程", "Code on your own computer")], ["Claude Desktop", t("按专用教程接入", "Follow the Desktop setup guide")], [t("中继控制台", "Relay console"), t("核对账号状态与用量", "Check account status and usage")]],
    },
  ];
  const thread = threads.find((item) => item.id === current.id) ?? threads[0];
  const preferredTool = current.tool;
  const [selectedTool, setSelectedTool] = useState<string>(preferredTool);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [result, setResult] = useState(false);
  const [newTask, setNewTask] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);
  const toolLabel = (tool: string) => tool === "更多工具" ? t("更多工具", "More tools") : tool;

  useEffect(() => {
    setSelectedTool(preferredTool);
    setInput("");
    setSubmitted("");
    setResult(false);
    setNewTask(false);
    if (conversationRef.current) conversationRef.current.scrollTop = 0;
  }, [current.id, preferredTool]);
  useEffect(() => {
    if (result && conversationRef.current) conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
  }, [result]);

  function chooseThread(id: string) {
    setNewTask(false);
    if (id === current.id) { setResult(false); setSubmitted(""); setInput(""); }
    onScenarioChange(id);
  }

  return (
    <div className="workspace" aria-label={t("可交互的本地工作环境演示", "Interactive local workspace demo")}>
      <aside className="workspace-sidebar">
        <div className="workspace-window-controls" aria-hidden="true">
          <span className="workspace-traffic"><i /><i /><i /></span>
          <PanelLeft /><ArrowLeft /><ArrowRight />
          <span className="workspace-code-mode"><Code2 /></span>
        </div>
        <div className="workspace-sidebar-scroll">
          <div className="workspace-sidebar-nav">
            <button type="button" onClick={() => { setNewTask(true); setInput(""); setSubmitted(""); setResult(false); }}>
              <Plus /><span>{t("新任务", "New task")}</span>
            </button>
            <button type="button" onClick={() => chooseThread("coding")}><FolderClosed /><span>{t("项目", "Projects")}</span></button>
            <button type="button" onClick={() => chooseThread("writing")}><Sparkles /><span>{t("研究与资料", "Research")}</span></button>
          </div>
          <div className="workspace-recents" aria-label={t("最近任务", "Recent tasks")}>
            <span className="workspace-section-label">{t("最近", "Recents")}</span>
            {threads.map((item) => (
              <button type="button" key={item.id} aria-pressed={!newTask && current.id === item.id} className={!newTask && current.id === item.id ? "active" : ""} onClick={() => chooseThread(item.id)}>
                {current.id === item.id && !newTask ? <Clock3 /> : <span className="workspace-session-dot" />}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="workspace-sidebar-footer">
          <div className="workspace-toolbar" aria-label={t("演示工具", "Demo tools")}>
            {tools.map((tool) => (
              <button type="button" key={tool} aria-label={toolLabel(tool)} title={toolLabel(tool)} aria-pressed={selectedTool === tool} className={selectedTool === tool ? "active" : ""} onClick={() => { setSelectedTool(tool); setResult(false); }}>
                <ToolIcon name={tool} size={13} />
              </button>
            ))}
          </div>
          <div className="workspace-account"><span>S</span><b>SunNeverSets</b><ChevronDown /></div>
        </div>
      </aside>

      <div className="workspace-content">
        <header className="workspace-project-header">
          <strong>sunneversets-web</strong><span className="workspace-breadcrumb-slash">/</span>
          <label className="workspace-scenario">
            <span className="sr-only">{t("工作场景", "Workspace scenario")}</span>
            <select aria-label={t("工作场景", "Workspace scenario")} value={scenario} onChange={(event) => chooseThread(event.target.value)}>
              {scenarios.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select><ChevronDown />
          </label>
        </header>

        <div className="workspace-conversation" ref={conversationRef}>
          {newTask && !result ? (
            <div className="workspace-empty"><ToolIcon name="Claude" size={25} /><p>{t("想把什么想法变成现实？", "What would you like to build?")}</p><span>{t("从下面输入一项任务，试试这个演示。", "Enter a task below to try the demo.")}</span></div>
          ) : (
            <>
              <div className="workspace-user-message">{result ? submitted : thread.prompt}</div>
              <div className="workspace-run-note"><Code2 /><span>{t("示例执行记录 · 3 个步骤", "Sample run · 3 steps")}</span><ChevronRight /></div>
              <p className="workspace-greeting">{thread.summary}</p>
              <table className="workspace-results-table" aria-label={t("任务结果示例", "Example task results")}>
                <thead><tr><th>{t("文件 / 工具", "File / tool")}</th><th>{t("工作内容", "Work")}</th></tr></thead>
                <tbody>{thread.rows.map(([file, action]) => <tr key={file}><td>{file}</td><td><Check />{action}</td></tr>)}</tbody>
              </table>
              <div className="workspace-response" aria-live="polite">{result && <p><Check />{current.result}</p>}</div>
            </>
          )}
        </div>

        <div className="workspace-composer">
          <form className="workspace-input" onSubmit={(event) => { event.preventDefault(); if (input.trim()) { setSubmitted(input.trim()); setResult(true); setInput(""); } }}>
            <input aria-label={t("输入演示内容", "Enter a demo prompt")} placeholder={t("描述一项任务或提出一个问题…", "Describe a task or ask a question…")} value={input} onChange={(event) => setInput(event.target.value)} maxLength={240} autoComplete="off" />
            <button aria-label={t("运行本地演示", "Run the local demo")} disabled={!input.trim()}><ArrowUp /></button>
          </form>
          <div className="workspace-composer-meta"><span><ToolIcon name={selectedTool} size={11} />{toolLabel(selectedTool)}<ChevronDown /></span><span><MessageSquare />{t("本地演示", "Local demo")}</span></div>
          <p className="workspace-demo-note">{t("仅本地预制演示 · 未连接真实 AI · 不发送数据", "Preset local demo · No live AI · No data sent")}</p>
        </div>
      </div>
    </div>
  );
}
