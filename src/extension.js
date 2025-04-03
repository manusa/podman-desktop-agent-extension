/**
 * @typedef {import('./ai-sdk')}.AiSdk AiSdk
 * @typedef {import('./configuration')}.Configuration Configuration
 * @typedef {import('././extension-mcp-server')}.McpServer McpServer
 */
import extensionApi from '@podman-desktop/api';
import {resourceLoader, uriFixer} from './extension-util';
import {newConfiguration} from './configuration';
import {newMcpServer} from './mcp-server';
import {newAiSdk} from './ai-sdk';

const basePathSegments = ['dist', 'assistant-ui'];
const indexPathSegments = [...basePathSegments, 'index.html'];

/** @type {Configuration} */
let configuration;
/** @type {McpServer} */
let mcpServer;
/** @type {AiSdk} */
let aiSdk;

extensionApi.configuration.onDidChangeConfiguration(async event => {
  if (configuration) {
    await configuration.onChange(event);
  }
});
const statusBar = extensionApi.window.createStatusBarItem();

export const activate = async extensionContext => {
  configuration = await newConfiguration();
  mcpServer = newMcpServer({configuration, extensionContext});
  mcpServer.start();
  aiSdk = await newAiSdk({configuration});
  await aiSdk.start();
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
  const fixResource = uriFixer({
    extensionContext,
    basePathSegments,
    webView: wvp.webview
  });
  let indexHtml = fixResource(await loadResource(indexPathSegments));
  indexHtml = indexHtml.replace(
    "window.baseUrl='';",
    `window.baseUrl='http://localhost:${configuration.aiSdkPort}';`
  );
  wvp.webview.html = indexHtml;
};

export const deactivate = () => {
  console.log('Stopping Podman Desktop Agent extension');
  if (mcpServer) {
    mcpServer.close();
  }
  if (aiSdk) {
    aiSdk.close();
  }
};
