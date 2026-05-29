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

- [ ] 替换 `index.html` 中 `og:*` 为你的站点域名（部署后）
- [ ] 在 `public/sitemap.xml` 中将 `<loc>/</loc>` 改为完整 URL
- [ ] 确认 `/privacy.html` 可访问
- [ ] 手机端试编辑与导出
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

## 许可证

MIT License
