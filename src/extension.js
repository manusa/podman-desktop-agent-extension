import {replaceNodeModules} from './extension-setup.js';
replaceNodeModules();
const extensionApi = require('@podman-desktop/api');

const express = require('express');
const http = require('http');
const {Server} = require('ws');

import {resourceLoader, uriFixer} from './extension-util';
import {startAgentContainer, stopAgentContainer} from './extension-agent';

const indexPathSegments = ['dist', 'browser', 'index.html'];

let server;

const configuration = {
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
  },
  toEnv: () => {
    return [
      '-e',
      `GOOSE_PROVIDER=${configuration.provider}`,
      '-e',
      `GOOSE_MODEL=${configuration.model}`,
      '-e',
      `GOOGLE_API_KEY=${configuration.googleApiKey}`
    ];
  }
};

export const activate = async extensionContext => {
  const wvp = extensionApi.window.createWebviewPanel(
    'podmanDesktopAgent',
    'Agent'
  );
  extensionContext.subscriptions.push(wvp);
  // Set up the webview
  const loadResource = resourceLoader(extensionContext);
  const fixResource = uriFixer({extensionContext, webView: wvp.webview});
  startWebSocketServer();
  let indexHtml = fixResource(await loadResource(indexPathSegments));
  indexHtml = indexHtml.replace(
    '<body>',
    `<body><script>window.wsAddress = 'ws://localhost:${server.address().port}/';</script>`
  );
  wvp.webview.html = indexHtml;
};

export const deactivate = () => {
  console.log('Stopping Podman Desktop Agent extension');
  if (server) {
    server.close();
  }
};

const startWebSocketServer = () => {
  const app = express();
  server = http.createServer(app);
  const wss = new Server({server});
  wss.on('connection', ws => {
    console.log('user connected');
    startAgentContainer({configuration, ws}).then(agent => {
      ws.send('\x1B[2J\x1B[H');
      agent.onData(data => {
        ws.send(data);
      });
      agent.onExit(({exitCode}) => {
        ws.send(`shell exited with code ${exitCode}`);
        ws.close();
      });
      ws.on('message', message => {
        agent.write(message);
      });
      ws.on('close', () => {
        stopAgentContainer();
        console.log('user disconnected');
      });
    });
  });
  server.listen(0, () => {
    console.log(`Websocket server started on port ${server.address().port}`);
  });
};
