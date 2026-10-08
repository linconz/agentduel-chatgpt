import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const uri = 'ui://agentduel-button-gate/probe.html';
const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font: 15px system-ui, sans-serif; margin: 18px; }
    main { border: 1px solid #aaa; border-radius: 12px; padding: 18px; max-width: 420px; }
    button { background: #bb3043; border: 0; border-radius: 8px; color: white; cursor: pointer; font: inherit; padding: 10px 18px; }
    #result { min-height: 24px; }
  </style>
</head>
<body>
  <main>
    <h1>AgentDuel 按钮验证</h1>
    <p>测试按钮不会创建对战或修改账户。</p>
    <button id="start" type="button">开始对战</button>
    <p id="result" role="status">等待点击</p>
  </main>
  <script>
    const button = document.getElementById('start');
    const result = document.getElementById('result');
    let sequence = 0;
    const pending = new Map();

    function request(method, params) {
      const id = ++sequence;
      window.parent.postMessage({ jsonrpc: '2.0', id, method, params }, '*');
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          pending.delete(id);
          reject(new Error('宿主未响应 MCP Apps 请求'));
        }, 10000);
        pending.set(id, { resolve, reject, timeout });
      });
    }

    window.addEventListener('message', event => {
      if (event.source !== window.parent || event.data?.jsonrpc !== '2.0') return;
      const reply = event.data;
      const item = pending.get(reply.id);
      if (!item) return;
      clearTimeout(item.timeout);
      pending.delete(reply.id);
      if (reply.error) item.reject(reply.error);
      else item.resolve(reply.result);
    });

    button.addEventListener('click', async () => {
      button.disabled = true;
      result.textContent = '正在调用验证工具';
      try {
        const response = await request('tools/call', {
          name: 'confirm_agentduel_button_probe',
          arguments: {}
        });
        result.textContent = response?.structuredContent?.confirmed === true
          ? '验证通过：按钮已调用 MCP 工具'
          : '工具已返回，但验证结果不正确';
      } catch (error) {
        result.textContent = '验证失败：' + (error?.message ?? '工具调用失败');
      } finally {
        button.disabled = false;
      }
    });

    request('ui/initialize', {
      protocolVersion: '2025-06-18',
      appInfo: { name: 'agentduel-button-gate', version: '0.1.1' },
      appCapabilities: { availableDisplayModes: ['inline'] }
    }).then(() => {
      window.parent.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/initialized' }, '*');
    }).catch(error => {
      result.textContent = '界面初始化失败：' + (error?.message ?? '宿主未响应');
    });
  </script>
</body>
</html>`;

const server = new McpServer({ name: 'agentduel-button-gate', version: '0.1.1' });

server.registerResource('agentduel-button-gate', uri, {}, async () => ({
  contents: [{ uri, mimeType: 'text/html;profile=mcp-app', text: html }]
}));

server.registerTool('open_agentduel_button_probe', {
  title: '打开 AgentDuel 按钮验证界面',
  description: '显示无副作用的开始对战测试按钮，验证宿主能否渲染 MCP Apps 界面。',
  _meta: { ui: { resourceUri: uri } },
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
}, async () => ({
  structuredContent: { ready: true },
  content: [{ type: 'text', text: '请点击界面中的“开始对战”测试按钮。' }]
}));

server.registerTool('confirm_agentduel_button_probe', {
  title: '确认 AgentDuel 按钮工具调用',
  description: '返回固定确认结果，不创建对战，也不访问 AgentDuel 账户。',
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
}, async () => ({
  structuredContent: { confirmed: true },
  content: [{ type: 'text', text: '按钮工具调用成功。' }]
}));

await server.connect(new StdioServerTransport());
