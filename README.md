# Smart Article

面向本科生的多 Agent 中文学术论文写作助手。通过纯聊天界面，由多个 AI Agent 协作完成从选题到导出 Word 的全流程。

## 功能

- **选题辅助** — 通过对话收集专业、研究方向等信息，确认论文题目
- **文献检索** — 从 Semantic Scholar 和 CrossRef 检索真实文献，HTTP 验证 DOI 有效性
- **大纲生成** — 根据题目和文献自动生成论文大纲，支持用户修改后确认
- **逐章撰写** — 按大纲逐章写作，每章完成后等待用户确认
- **全文审校** — 检查逻辑一致性、引用规范，生成审校报告
- **降 AIGC 率** — 基于规则集对段落进行改写，展示前后对比
- **导出 Word** — 生成格式规范的 `.docx` 文件供下载

## 技术栈

| 层 | 技术 |
|---|---|
| 运行时 | Bun + TypeScript |
| 前端 | Next.js 16 (App Router) |
| 多 Agent | LangGraph.js + `@langchain/langgraph-supervisor` |
| 认证 | better-auth |
| 数据库 | libsql (`@libsql/client`) + Drizzle ORM |
| LLM 接入 | OpenAI / Claude / Gemini（用户自行配置） |
| 文档导出 | docx |

## 支持的 LLM 供应商

在设置页面配置 Base URL、API Key 和模型名称，支持：

- **OpenAI Chat API**（兼容任意 OpenAI 格式第三方服务）
- **OpenAI Responses API**
- **Anthropic Claude**
- **Google Gemini**

## 快速开始

**环境要求**：Bun 1.0+

```bash
# 安装依赖
bun install

# 复制环境变量文件
cp .env.example .env
# 编辑 .env，填写 BETTER_AUTH_SECRET 和 ENCRYPTION_KEY

# 初始化数据库
bun run db:migrate

# 启动开发服务器
bun run dev
```

访问 `http://localhost:3000`，注册账号后在设置页配置 LLM 供应商即可开始使用。

## 环境变量

复制 `.env.example` 并填写：

```env
BETTER_AUTH_SECRET=       # 随机字符串，用于 session 签名
BETTER_AUTH_URL=          # 应用地址，如 http://localhost:3000
ENCRYPTION_KEY=           # 32 字节十六进制字符串，用于加密存储的 API Key
DATABASE_URL=             # 可选，默认 ./smart-article.db
SEMANTIC_SCHOLAR_API_KEY= # 可选，有 key 时享有更高 API 配额
```

## 项目结构

```
src/
├── agents/          # LangGraph 多 Agent 系统
│   ├── supervisor.ts          # 主图，createSupervisor 配置
│   ├── orchestrator/          # 主控 Agent（流程控制）
│   ├── literature/            # 文献检索 Agent
│   ├── writing/               # 撰写 Agent
│   ├── review/                # 审校 Agent
│   └── aigc-reduction/        # 降 AIGC 率 Agent
├── app/
│   ├── api/chat/route.ts      # SSE 流式端点
│   └── (main)/                # 主应用页面
├── db/                        # Drizzle schema + 数据库连接
├── lib/                       # auth、crypto、常量
└── services/                  # Semantic Scholar、CrossRef、docx 导出
```

## License

MIT
