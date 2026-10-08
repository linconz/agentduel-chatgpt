# AgentDuel ChatGPT/Codex 插件

AgentDuel 的 MCP（模型上下文协议）服务直接运行在 `AgentDuel/BackEnd` 的 Fastify 进程中。本仓库只保存插件清单、远程 MCP 连接配置和指导 Codex 编写策略代码的技能，不再运行独立服务。

## 代码位置

| 内容 | 位置 |
| --- | --- |
| MCP 工具和编译版本检查 | `../AgentDuel/BackEnd/src/mcp/mcpTools.ts` |
| `POST /mcp` 路由 | `../AgentDuel/BackEnd/src/mcp/mcpRoutes.ts` |
| AgentDuel 用户授权 | `../AgentDuel/BackEnd/src/oauth/` |
| 持久化请求编号 | `../AgentDuel/BackEnd/src/mcp/mcpIdempotency.ts` |
| 对话中的开战与回放卡片 | `../AgentDuel/BackEnd/src/mcp/battle-entry.html`、`../AgentDuel/BackEnd/ui/replayWidget.tsx` |
| 路由测试 | `../AgentDuel/BackEnd/src/tests/mcp.test.ts` |
| 接口契约 | `../AgentDuel/docs/RESTful API.md` |

`mcp.json` 指向 `https://api.agentduel.app/mcp`。该地址只有在新版 AgentDuel 后端部署后才会提供 MCP 服务；修改本仓库的清单不会自动部署后端。

## 当前源码状态

- 公开读取：最近对战、角色和团队搜索、公开资料、公开历史与对战详情。
- 账户读取：本人角色和团队、源码模板与历史版本、编译诊断、个人历史和对战资格。
- 账户写入：创建或修改角色和团队、徽章展示、版本切换、源码提交，以及练习赛或排位赛。源码提交和对战创建使用持久化请求编号。
- MCP Apps 卡片：编译成功且版本生效后，在对话中展示“开始对战”按钮，搜索对手、读取地图并调用创建对战工具；随后查询对战进度，并在回放就绪后加载 AgentDuel 回放播放器。

账户工具只接受 OAuth 2.1（开放授权协议）访问令牌；网站会话 cookie 只用于登录及授权同意页。后端源码已有授权服务，但还没有执行数据库迁移、配置客户端允许名单和签名私钥，也没有部署到生产域名。**正式插件仍不能连接线上 AgentDuel 服务。**

Codex 桌面端的独立按钮验证插件已显示对话内按钮，并在点击后成功调用 MCP 工具。正式 AgentDuel 卡片、ChatGPT 显示、OAuth 连接、编译 Worker、回放和完整对战流程尚未通过真实环境端到端验证。插件不要求用户在对话中提供角色 API 密钥或集成 App Key。

## 本地验证

在 `../AgentDuel/BackEnd` 运行 `npx vitest run src/tests/mcp.test.ts`、`npm run typecheck`、`npm run build`。插件清单使用 `plugin.json`、`mcp.json`；本仓库没有 `npm start` 或本机 MCP 端口。

公开审核所需的图标、页面、审核账户、演示素材和文案，应在真实连接和界面验证后按实际功能准备。
