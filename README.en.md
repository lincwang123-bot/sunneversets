<p align="center">
  <a href="https://sunneversets.ai/en/">
    <img src="docs/images/sunneversets-logo.png" width="112" height="112" alt="SunNeverSets logo" />
  </a>
</p>

<h1 align="center">SunNeverSets</h1>

<p align="center"><strong>Your ideas. Always on.</strong><br />Claude Max subscription and hosting services · Claude Code / Claude Desktop setup</p>

<p align="center">
  <a href="https://sunneversets.ai/en/">Website</a> ·
  <a href="https://sunneversets.ai/en/pricing/">Plans</a> ·
  <a href="https://sunneversets.ai/en/guide/">User guide</a> ·
  <a href="https://t.me/CouCouYa">Contact us</a> ·
  <a href="README.md">简体中文</a>
</p>

---

## From an idea to building

**SunNeverSets** helps people who want to build products with AI get through account preparation, subscriptions and connection setup. Each service package combines a Claude account, subscription, KYC, hosting seat and hosting setup.

Our overseas Mac infrastructure supports the platform. After activation, follow the user guide to configure **Claude Code** or **Claude Desktop** on your own computer, so you can spend more time writing code, testing ideas and improving your product.

This repository contains the official [sunneversets.ai](https://sunneversets.ai/en/) website: product information, plans, setup guides and troubleshooting in Chinese and English.

## Services and getting started

| What you need | How SunNeverSets helps |
| --- | --- |
| Account and subscription preparation | A package covering the Claude account, subscription, KYC, hosting seat and setup |
| Working on your own computer | Guided configuration for Claude Code or Claude Desktop |
| Overseas infrastructure | Mac infrastructure supporting the platform service |
| Help from setup through daily use | Plans, user guides, connection instructions and troubleshooting |
| Questions and purchases | Contact [@CouCouYa on Telegram](https://t.me/CouCouYa) |

Current packages include **Claude Max 5X** and **Claude Max 20X**. See [Plans & delivery](https://sunneversets.ai/en/pricing/) for pricing, service periods and delivery details, and the [User guide](https://sunneversets.ai/en/guide/) for permitted use, usage limits and support terms.

## Product and documentation

- [Official website](https://sunneversets.ai/en/)
- [Claude Max plans and delivery](https://sunneversets.ai/en/pricing/)
- [User guide and usage rules](https://sunneversets.ai/en/guide/)
- [Claude Code setup for Windows and macOS](https://sunneversets.ai/en/guides/claude-code-setup/)
- [Connection, usage and account troubleshooting](https://sunneversets.ai/en/guides/troubleshooting/)

## Website architecture

Built with **React, TypeScript, Vite, Tailwind CSS, Motion and Lucide**.

- **Chinese and English:** five page types with separate language paths, for ten pages in total.
- **Prerendered HTML:** readable page content at build time, with client-side hydration for interactions.
- **Search and sharing metadata:** per-page titles, descriptions, canonical URLs, hreflang, Open Graph, Twitter Cards and structured data.
- **Crawl discovery:** generated [sitemap.xml](https://sunneversets.ai/sitemap.xml) and [robots.txt](https://sunneversets.ai/robots.txt).
- **Responsive interactions:** desktop and mobile layouts, keyboard navigation, reduced-motion support and a layered Mac infrastructure illustration.
- **Static hosting:** Nginx serves the generated files, with HTTPS through Cloudflare Tunnel.

## Local development

Requires **Node.js 22.12+** or a compatible version.

```sh
git clone https://github.com/lincwang123-bot/sunneversets.git
cd sunneversets
npm ci
npm run dev
```

Open the local URL shown in the terminal. To check types and create the production build:

```sh
npm run typecheck
npm run build
```

The output is written to `dist/`. Run `npm run test:seo` or `npm run test:e2e` for automated checks. Browser dependencies and static hosting are documented in [Build and deployment](docs/deploying.md).

## Repository structure

```text
src/
  components/     Pages and interactive components
  data/           Plans, guides and page metadata
  styles/         Styles and responsive layouts
  routing.ts      Site origin, routes and language paths
public/           Website images and favicon
scripts/          Prerendering, offline preview and test server
tests/            Interaction and SEO checks
deploy/nginx/     Static hosting configuration
docs/             Deployment, visual assets and brand notes
```

See [Brand and website assets](docs/assets.md) for the visual resources. This repository contains the website frontend; account hosting and order processing are handled by separate services.

## Contact SunNeverSets

**[Visit the website](https://sunneversets.ai/en/)** · **[Explore plans](https://sunneversets.ai/en/pricing/)** · **[Contact us on Telegram](https://t.me/CouCouYa)**

SunNeverSets 日不落 · *Your ideas. Always on.*
