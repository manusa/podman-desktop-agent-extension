import extensionApi from '@podman-desktop/api';
import {resourceLoader, uriFixer} from './extension-util';
import {newConfiguration} from './extension-configuration';
import {newMcpServer} from './extension-mcp-server.js';
import {startWebSocketServer} from './extension-net';

const indexPathSegments = ['dist', 'browser', 'index.html'];

let webSocketServer;
let mcpServer;

const configuration = newConfiguration();
extensionApi.configuration.onDidChangeConfiguration(async event => {
  if (event.affectsConfiguration('agent.mcp')) {
    await configuration.load();
    if (
      mcpServer &&
      parseInt(mcpServer.port) !== parseInt(configuration.mcpPort)
    ) {
      mcpServer.close();
      mcpServer = newMcpServer({
        configuration,
        extensionContext: mcpServer.extensionContext
      });
      mcpServer.start();
      statusBar.text = `MCP Server: ${configuration.mcpPort}`;
      statusBar.tooltip = `MCP Server listening on http://localhost:${configuration.mcpPort}/sse`;
    }
  }
});
const statusBar = extensionApi.window.createStatusBarItem();

export const activate = async extensionContext => {
  await configuration.load();
  mcpServer = newMcpServer({configuration, extensionContext});
  mcpServer.start();
  webSocketServer = startWebSocketServer(configuration);
  // Set up the statusbar
  extensionContext.subscriptions.push(statusBar);
  statusBar.text = `MCP Server: ${configuration.mcpPort}`;
  statusBar.tooltip = `MCP Server listening on http://localhost:${configuration.mcpPort}/sse`;
  statusBar.iconClass = 'fa fa-plug';
  statusBar.show();
  // Set up the webview
  const wvp = extensionApi.window.createWebviewPanel(
    'podmanDesktopAgent',
    'Agent'
  );
  extensionContext.subscriptions.push(wvp);
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
    mcpServer.close();
  }
  if (webSocketServer) {
    webSocketServer.close();
  }
};
