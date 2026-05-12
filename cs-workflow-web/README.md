# CS Intel Workflow — Web

客服情报聚合工作流的 Vercel 网页版。包含 6 个模块：

- `intake` — 新需求分类
- `gameteam` — 游戏组发布物分析
- `botrules` — AI bot 规则更新建议
- `accounts` — Google / iOS 账号审计（永不写入密钥）
- `numbers` — 数值改动 Ship/Hold/Revise
- `wrap` — 当日汇总

## 部署到 Vercel

### 一键流程

1. 把 `cs-workflow-web/` 这个目录推到一个 GitHub 仓库
2. 打开 https://vercel.com/new ，从该仓库导入项目
3. Framework Preset 自动识别为 **Next.js** —— 保留默认
4. 在 **Environment Variables** 加：
   - `ANTHROPIC_API_KEY` = 你的 Anthropic API key
5. 点 **Deploy**

部署完成后会得到 `https://<project>.vercel.app`，把链接发给客服团队就能直接用。

### 本地试跑

```bash
cd cs-workflow-web
npm install
cp .env.example .env.local
# 编辑 .env.local 写入 ANTHROPIC_API_KEY
npm run dev
# 打开 http://localhost:3000
```

## 怎么用

1. 选模块（intake / gameteam / botrules / accounts / numbers / wrap）
2. 粘贴文本，或上传 .txt / .md / .csv 文件追加内容
3. 点 **运行模块** —— 报告会以 markdown 流式显示
4. 点 **下载 .md** 把报告保存到本地

## 安全说明

- API key 只放在 Vercel 的环境变量里，不会暴露到前端
- 每次请求互相独立，服务器不存储任何会话历史
- accounts 模块的系统提示明确要求 redact 任何密钥/邮箱
- 输入上限 200K 字符 / 5 MB
- 没有任何用户认证 —— 如果是公司内部使用，建议在 Vercel 项目设置里加 **Password Protection** 或 **Vercel Authentication**（Settings → Deployment Protection）

## Vercel 超时说明

`/api/process` 设置了 `maxDuration = 300` 秒。这个值在不同套餐下会被 Vercel 裁切：

| 套餐 | 实际上限 |
|---|---|
| Hobby（免费） | 60s（高 effort 长输入可能卡住） |
| Pro | 300s ✅ |
| Enterprise | 900s |

如果遇到 504 超时：把 `effort` 调成 `medium` 或 `low`，或拆短输入。

## 技术栈

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Anthropic SDK (`claude-opus-4-7`，adaptive thinking)
- Prompt caching 对系统提示进行缓存（同一模块的重复调用 input cost 降到约 10%）
- SSE 流式输出

## 想加什么

- 多用户 / 历史记录 → 加 Vercel Postgres + NextAuth
- 飞书 / 钉钉 / Slack 推送 → 在 `/api/process` 加 webhook
- 文件 PDF 上传 → 加 `@anthropic-ai/sdk` 的 Files API + `document` content block
- 定时跑 wrap → Vercel Cron Job + 调用 `/api/process` 服务端方法
