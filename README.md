# 简历编辑器 (Resume Builder)

免费在线简历制作工具：5 种模板、模块化编辑、实时预览、导出 PDF / TXT / 打印。数据保存在浏览器本地，无需注册。

## 功能特性

- **5 种模板** — 经典、现代、创意、侧栏、时间轴
- **模块化编辑** — 开关模块、拖拽排序
- **实时 A4 预览** — 分页提示、字号调节
- **本地自动保存** — localStorage，支持 JSON 导入/导出
- **导出** — 快速 PDF、TXT、浏览器打印（推荐打印另存为 PDF）

## 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:3000

高清 PDF（Puppeteer，仅开发模式）：

```bash
npm run setup:chrome   # 首次可选
npm run dev
```

## 部署免费站

### Vercel（推荐）

1. 将仓库推送到 GitHub
2. 在 [vercel.com](https://vercel.com) 导入项目
3. 框架预设选 **Vite**，构建命令 `npm run build`，输出目录 `dist`
4. 部署完成后绑定自定义域名（可选）

项目已包含 `vercel.json`，支持 SPA 路由。

### Netlify

1. 导入 Git 仓库
2. 构建命令：`npm run build`，发布目录：`dist`
3. 已包含 `netlify.toml`

### 本地预览构建结果

```bash
npm run build
npm run preview
```

## 上线检查清单

- [x] 替换 `index.html` 中 `og:*` 为站点域名（`resume-builder-bay-kappa.vercel.app`）
- [x] 在 `public/sitemap.xml` 中使用完整 URL
- [ ] 确认 `/privacy.html` 可访问
- [x] 手机端 Tab 切换（模板 / 编辑 / 预览）
- [ ] （可选）接入 [Umami](https://umami.is) / Google Analytics 统计

## 项目结构

```
resume-builder/
├── public/           # 静态资源（隐私页、robots、sitemap）
├── src/
│   ├── App.vue
│   ├── components/
│   │   ├── preview/  # 预览与模板渲染
│   └── data/templates.js
├── scripts/          # 开发环境高清 PDF（不上线）
├── vercel.json
└── netlify.toml
```

## 技术栈

Vue 3 · Vite 5 · Element Plus · html2pdf.js · vuedraggable

## 盈利化配置（Pro 版本）

项目已内置基础付费转化能力（免费额度限制、Pro 升级入口、模板锁定、高清 PDF 权益、埋点接口），并支持 Stripe Checkout 自动激活 Pro。

1. 复制 `.env.example` 为 `.env`
2. 配置支付与联系地址：

```bash
VITE_PRO_ENABLED=false
VITE_FREE_PROFILE_LIMIT=2
VITE_CONTACT_URL=https://your-contact-url

STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PRICE_ID=price_xxx
APP_BASE_URL=https://your-domain.com
PRO_TOKEN_SECRET=long-random-secret
PRO_TOKEN_EXPIRES_DAYS=3650
```

说明：

- `STRIPE_PRICE_ID` 使用你在 Stripe 创建的商品价格 ID。
- 支付成功后会回跳到站点首页并自动激活 Pro。
- `PRO_TOKEN_SECRET` 建议用高强度随机字符串（至少 32 位）。

详细商业化节奏见 `docs/profit-launch-playbook.md`。

## 许可证

MIT License
