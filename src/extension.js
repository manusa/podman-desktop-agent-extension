import {replaceNodeModules} from './extension-setup.js';
replaceNodeModules();
const extensionApi = require('@podman-desktop/api');
const os = require('node:os');
const express = require('express');
const http = require('http');
const {Server} = require('ws');

import {resourceLoader, uriFixer} from './extension-util';
import {spawnShell} from './extension-shell.js';

const indexPathSegments = ['dist', 'browser', 'index.html'];
const podmanCli = os.platform() === 'win32' ? 'podman.exe' : 'podman';
const agentContainerName = 'podman-desktop-agent-client';
const agentImageName = 'quay.io/manusa/podman-desktop-agent-client:latest';

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

const startAgentContainer = async () => {
  // User might have changed the configuration but the extension is not reloaded
  await configuration.load();
  return spawnShell(podmanCli, [
    'run',
    '--tty',
    '--rm',
    '-ti',
    ...configuration.toEnv(),
    '--name',
    agentContainerName,
    '--replace',
    agentImageName
  ]);
};

const startWebSocketServer = () => {
  const app = express();
  server = http.createServer(app);
  const wss = new Server({server});
  wss.on('connection', ws => {
    console.log('user connected');
    ws.send('Greetings \x1B[1;3;31mProfessor Falken\x1B[0;0H\x1B[0m\n');
    ws.send('Starting Goose...');
    startAgentContainer().then(shell => {
      ws.send('\x1B[H');
      shell.onData(data => {
        ws.send(data);
      });
      shell.onExit(({exitCode}) => {
        ws.send(`shell exited with code ${exitCode}`);
        ws.close();
      });
      ws.on('message', message => {
        shell.write(message);
      });
      ws.on('close', () => {
        console.log('user disconnected');
        spawnShell(podmanCli, ['kill', agentContainerName]).then(() =>
          console.log('Agent container stopped')
        );
      });
    });
  });
  server.listen(0, () => {
    console.log(`Websocket server started on port ${server.address().port}`);
  });
};
