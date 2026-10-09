# 品牌与网站素材

## 品牌标识

**SunNeverSets 日不落** 以橙色太阳与石墨色弧线作为品牌标识。中文口号为「让想法，始终在线。」，英文口号为「Your ideas. Always on.」。

| 文件 | 用途 |
| --- | --- |
| [`public/assets/sunneversets-logo.png`](../public/assets/sunneversets-logo.png) | 网站使用的透明品牌图标 |
| [`public/favicon.svg`](../public/favicon.svg) | 浏览器标签页图标 |
| [`docs/images/sunneversets-logo.png`](images/sunneversets-logo.png) | 带浅色底的品牌图标，用于 README 展示 |

## 页面素材

| 文件 | 尺寸 | 用途 |
| --- | --- | --- |
| `public/assets/city-desk.webp` | 1672 × 941 | 首屏城市窗景与桌面背景 |
| `public/assets/monitor.webp` | 1536 × 1024 | 透明显示器与支架 |
| `public/assets/mac-mini.webp` | 1774 × 887 | 透明 Mac mini 硬件示意 |

图片用于品牌和产品场景展示；页面文字、工具界面及机房服务分层通过 HTML、CSS 与 React 实现。硬件图是视觉示意，实际服务配置以官网的套餐和交付说明为准。

## 维护约定

- 保持 Logo 比例与原有配色，不拉伸、不替换口号。
- 替换硬件图时保留透明背景，并同时检查显示器内部界面的贴合位置。
- 运行图片优先使用 WebP；透明 Logo 使用 PNG，favicon 使用 SVG。
- 新增图片后检查桌面与移动端的显示效果，并更新本页中的资源说明。
- 不在仓库中保存账号信息、密钥或客户资料。
