import {replaceNodeModules} from './extension-setup.js';
replaceNodeModules();
const extensionApi = require('@podman-desktop/api');

import {resourceLoader, uriFixer} from './extension-util';
import {newConfiguration} from './extension-configuration';
import {startMcpServer} from './extension-mcp-server.js';
import {startWebSocketServer} from './extension-ws-server';
import {spawnShellSync} from './extension-shell.js';

const indexPathSegments = ['dist', 'browser', 'index.html'];

let webSocketServer;
let mcpServer;

const configuration = newConfiguration();

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
