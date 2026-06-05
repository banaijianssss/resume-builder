# 简历编辑器盈利化上线作战手册

## 1) 商业模型（先跑通，再优化）

- 免费版：基础模板 + 标清导出，吸引自然流量。
- Pro 版（一次性或订阅）：解锁全部模板、高清 PDF、多档案管理。
- ToB 服务：企业校招批量模板定制（后续扩展）。

## 2) 本项目已落地能力

- Pro 升级入口（顶部 CTA + 侧边栏转化位）。
- 免费额度限制（简历档案数量上限）。
- 部分模板锁定（引导升级）。
- 高清 PDF 设为 Pro 权益。
- 事件埋点入口（支持 gtag / umami）。

## 3) 上线前必须配置

在 `.env` 中配置：

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

- `STRIPE_PRICE_ID`：Stripe 商品价格 ID，前端点击升级后由后端创建 Checkout Session。
- `VITE_CONTACT_URL`：支付异常时的兜底联系地址（飞书/邮箱/微信落地页）。

## 4) 上线 14 天冲刺节奏

- D1-D2：部署正式域名 + 打通支付链接 + 绑定统计。
- D3-D5：投放 10 篇内容（小红书/B站/知乎）引流到落地页。
- D6-D10：按埋点优化漏斗（进入站点 -> 点击导出 -> 点击升级 -> 支付）。
- D11-D14：A/B 测试价格和权益文案，目标提升支付转化。

## 5) 核心指标（每天盯）

- UV（访客数）
- 导出率（导出点击 / UV）
- 升级点击率（升级点击 / UV）
- 支付转化率（支付用户 / 升级点击）
- 客单价（ARPPU）

## 6) 下一步建议

- 接入账户体系和云存储，支撑跨设备。
- 增加 AI 润色与岗位匹配报告（高级付费点）。
- 增加企业版模板和团队协作，拉高客单价。
