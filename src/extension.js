import {replaceNodeModules} from './extension-setup.js';
replaceNodeModules();
const extensionApi = require('@podman-desktop/api');

import {resourceLoader, uriFixer} from './extension-util';
import {startWebSocketServer} from './extension-ws-server';
import {startMcpServer} from './extension-mcp-server.js';

const indexPathSegments = ['dist', 'browser', 'index.html'];

let webSocketServer;
let mcpServer;

const configuration = {
  mcpHost: 'host.containers.internal',
  load: async () => {
    configuration.provider = await extensionApi.configuration
      .getConfiguration('agent.goose')
      .get('provider');
    configuration.model = await extensionApi.configuration
      .getConfiguration('agent.goose')
      .get('model');
    configuration.googleApiKey = await extensionApi.configuration
      .getConfiguration('agent.goose.provider.gemini')
      .get('googleApiKey');
    configuration.mcpPort = await extensionApi.configuration
      .getConfiguration('agent.mcp')
      .get('port');
  },
  toEnv: () => {
    return [
      '-e',
      `GOOSE_PROVIDER=${configuration.provider}`,
      '-e',
      `GOOSE_MODEL=${configuration.model}`,
      '-e',
      `GOOGLE_API_KEY=${configuration.googleApiKey}`,
      '-e',
      'SSE_ENABLED=true',
      '-e',
      `SSE_HOST=${configuration.mcpHost}`,
      '-e',
      `SSE_PORT=${configuration.mcpPort}`
    ];
  }
};

export const activate = async extensionContext => {
  const wvp = extensionApi.window.createWebviewPanel(
    'podmanDesktopAgent',
    'Agent'
  );
  extensionContext.subscriptions.push(wvp);
  await configuration.load();
  mcpServer = startMcpServer({configuration, extensionContext});
  webSocketServer = startWebSocketServer(configuration);
  // Set up the webview
  const loadResource = resourceLoader(extensionContext);
  const fixResource = uriFixer({extensionContext, webView: wvp.webview});
  let indexHtml = fixResource(await loadResource(indexPathSegments));
  indexHtml = indexHtml.replace(
    '<body>',
    `<body><script>window.wsAddress = 'ws://localhost:${webSocketServer.address().port}/';</script>`
  );
  wvp.webview.html = indexHtml;
};

export const deactivate = () => {
  console.log('Stopping Podman Desktop Agent extension');
  if (mcpServer) {
    console.log('Stopping MCP');
    mcpServer.kill();
    process.kill(mcpServer.pid);
  }
  if (webSocketServer) {
    console.log('Stopping Web Socket Server');
    webSocketServer.close();
  }
};
