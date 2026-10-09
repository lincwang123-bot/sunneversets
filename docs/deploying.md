# 构建与静态部署

## 本地开发

需要 Node.js 22.12+ 或兼容版本。

```sh
npm ci
npm run dev
```

Vite 默认仅监听本机。需要结束预览时在终端按 `Control+C`。

## 生产构建

```sh
npm run build
```

输出在 `dist/`：中文和英文共 10 个预渲染页面、资源文件、`robots.txt`、`sitemap.xml`，以及可双击打开的离线预览 `SunNeverSets-preview.html`。服务器只需提供静态文件，无需运行 Node.js。

站点正式域名定义在 `src/routing.ts`，页面标题和描述定义在 `src/data/seo.ts`；更换域名时需同步调整路由配置和 Nginx 的域名，再重新构建。

## 验证

```sh
npm run typecheck
npm run test:seo
npm run test:e2e
```

浏览器测试默认使用本机 Google Chrome。`test:e2e` 支持先安装 Playwright Chromium，再通过 `PLAYWRIGHT_CHANNEL=chromium npm run test:e2e` 执行；`test:seo` 使用 Google Chrome。测试自行启动并关闭临时静态服务。

## Nginx 与 Cloudflare Tunnel

`deploy/nginx/sunneversets.conf` 提供本站静态服务配置，包含语言旧链接重定向、缓存控制、目录路由和真实 404。使用前根据目标环境调整 `server_name`、`root`、日志路径和监听端口；配置中的 `map` 位于 Nginx `http` 上下文。

当前架构由 Nginx 监听本地回环端口，经 Cloudflare Tunnel 对外提供 HTTPS。Tunnel 凭据、DNS 记录、SSH 密钥和服务器实例信息需由部署者独立配置，不保存在源码仓库中。

发布时使用新的版本目录保存构建产物，经验证后切换站点根目录指针，并保留上一版以便回滚。仅发布页面实际使用的 HTML、JS、CSS、WebP、Logo PNG、favicon、robots 和 sitemap；无需公开离线预览、原始硬件 PNG、源码、设计资料或测试报告。静态文件通常使用目录 `755`、文件 `644` 权限。

修改 Nginx 配置后先执行 `nginx -t`，通过后再重新加载。验证首页、内页、语言切换、资源加载、HTTPS 和不存在路径的 404 响应。

GitHub 仓库用于源码管理，未配置自动部署。推送代码不会自动修改线上 VPS。
