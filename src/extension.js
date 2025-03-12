import extensionApi from '@podman-desktop/api';
import {resourceLoader, uriFixer} from './extension-util';
import {newConfiguration} from './extension-configuration';
import {startMcpServer} from './extension-mcp-server.js';
import {startWebSocketServer} from './extension-net';
import {spawnShellSync} from './extension-shell.js';

const indexPathSegments = ['dist', 'browser', 'index.html'];

let webSocketServer;
let mcpServer;

const configuration = newConfiguration();

export const activate = async extensionContext => {
  await configuration.load();
  mcpServer = startMcpServer({configuration, extensionContext});
  webSocketServer = startWebSocketServer(configuration);
  // Set up the statusbar
  const statusBar = extensionApi.window.createStatusBarItem();
  extensionContext.subscriptions.push(statusBar);
  statusBar.text = `MCP Server: ${configuration.mcpPort}`;
  statusBar.tooltip = `MCP Server listening on http://${configuration.mcpPort}/sse`;
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
    console.log('Stopping MCP');
    if (configuration.isWindows) {
      // For some reason the process exits but remains on Windows
      spawnShellSync('taskkill.exe', [`/PID ${mcpServer.pid}`, '/T', '/F']);
    } else {
      process.kill(mcpServer.pid);
    }
  }
  if (webSocketServer) {
    console.log('Stopping Web Socket Server');
    webSocketServer.close();
  }
};
