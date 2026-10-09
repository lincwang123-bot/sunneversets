<p align="center">
  <a href="https://sunneversets.ai/">
    <img src="docs/images/sunneversets-logo.png" width="112" height="112" alt="SunNeverSets 日不落 Logo" />
  </a>
</p>

<h1 align="center">SunNeverSets 日不落</h1>

<p align="center"><strong>让想法，始终在线。</strong><br />Claude Max 订阅与托管服务 · Claude Code / Claude Desktop 接入</p>

<p align="center">
  <a href="https://sunneversets.ai/">访问官网</a> ·
  <a href="https://sunneversets.ai/pricing/">查看套餐</a> ·
  <a href="https://sunneversets.ai/guide/">用户指南</a> ·
  <a href="https://t.me/CouCouYa">咨询与购买</a> ·
  <a href="README.en.md">English</a>
</p>

---

## 从一个想法，到开始构建

想用 AI 编程做产品，却卡在账号、订阅和接入配置上？**SunNeverSets 日不落**将 Claude 账号、订阅、KYC、托管席位与托管操作统一打包，协助完成使用前的准备。

海外 Mac 机房提供基础设施支持。完成开通后，你在自己的电脑上，按用户指南配置 **Claude Code** 或 **Claude Desktop**，把更多时间用在写代码、验证想法和迭代产品上。

这里是 [sunneversets.ai](https://sunneversets.ai/) 官方网站的源码仓库，包含中英文产品介绍、套餐说明、接入教程与问题排查页面。

## 服务与使用方式

| 你需要了解的内容 | 日不落提供的支持 |
| --- | --- |
| 账号与订阅准备 | Claude 账号、订阅、KYC、托管席位与托管操作五项打包 |
| 在自己的电脑上开始使用 | 按项目教程配置 Claude Code 或 Claude Desktop |
| 海外基础设施 | 海外 Mac 机房支持平台服务 |
| 从开通到日常使用 | 套餐说明、用户指南、配置步骤和问题排查 |
| 咨询与购买 | 统一通过 Telegram 客服 [@CouCouYa](https://t.me/CouCouYa) 联系 |

当前提供 **Claude Max 5X** 与 **Claude Max 20X** 套餐。价格、服务周期与交付范围见 [套餐与交付](https://sunneversets.ai/pricing/)，使用范围、额度和售后条件见 [用户指南](https://sunneversets.ai/guide/)。

## 产品与文档

| 页面 | 中文 | English |
| --- | --- | --- |
| 产品首页 | [日不落官网](https://sunneversets.ai/) | [Home](https://sunneversets.ai/en/) |
| 套餐与交付 | [Claude Max 套餐](https://sunneversets.ai/pricing/) | [Plans & delivery](https://sunneversets.ai/en/pricing/) |
| 用户指南 | [首次使用与使用规则](https://sunneversets.ai/guide/) | [User guide](https://sunneversets.ai/en/guide/) |
| Claude Code 接入 | [Windows / macOS 配置教程](https://sunneversets.ai/guides/claude-code-setup/) | [Claude Code setup](https://sunneversets.ai/en/guides/claude-code-setup/) |
| 问题排查 | [连接、额度与账号问题](https://sunneversets.ai/guides/troubleshooting/) | [Troubleshooting](https://sunneversets.ai/en/guides/troubleshooting/) |

## 网站技术

使用 **React、TypeScript、Vite、Tailwind CSS、Motion 和 Lucide** 构建。

- **中英双语**：中文路径与 `/en/` 英文路径，覆盖 5 类页面、共 10 个独立页面。
- **可直接读取的正文**：构建时预渲染 HTML，浏览器加载后接管交互。
- **搜索与分享信息**：每页独立标题、描述、canonical、hreflang、Open Graph、Twitter Card 和结构化数据。
- **抓取入口**：自动生成 [sitemap.xml](https://sunneversets.ai/sitemap.xml) 与 [robots.txt](https://sunneversets.ai/robots.txt)。
- **响应式交互**：桌面与移动端布局、键盘操作、减少动态效果支持，以及 Mac 机房分层展示。
- **静态部署**：Nginx 提供静态文件，通过 Cloudflare Tunnel 对外提供 HTTPS。

## 本地开发

需要 **Node.js 22.12+** 或兼容版本。

```sh
git clone https://github.com/lincwang123-bot/sunneversets.git
cd sunneversets
npm ci
npm run dev
```

打开终端输出的本地地址。完成开发后，用以下命令检查和构建：

```sh
npm run typecheck
npm run build
```

构建产物位于 `dist/`。自动化验证可运行 `npm run test:seo` 或 `npm run test:e2e`；浏览器依赖和部署方式见 [构建与部署](docs/deploying.md)。

## 项目结构

```text
src/
  components/     页面与交互组件
  data/           套餐、指南和页面元信息
  styles/         页面样式与响应式布局
  routing.ts      域名、路由与语言路径
public/           网站图片与 favicon
scripts/          预渲染、离线预览与测试服务
tests/            页面交互和 SEO 检查
deploy/nginx/     静态服务配置
docs/             部署、视觉资源与品牌说明
```

视觉资源见 [品牌与网站素材](docs/assets.md)。此仓库提供网站前端源码；账号托管平台和订单处理由独立服务承担。

## 联系日不落

**[访问官网](https://sunneversets.ai/)** · **[查看套餐](https://sunneversets.ai/pricing/)** · **[Telegram 咨询与购买](https://t.me/CouCouYa)**

SunNeverSets 日不落 · *Your ideas. Always on.*
