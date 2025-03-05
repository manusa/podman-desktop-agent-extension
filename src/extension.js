const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Replace node_modules in Windows environments when deployed from Containerfile.extension
if (
  // I need to check if it works for windows/arm64 too
  os.platform() === 'win32' /*&& os.arch() === 'x64'*/ &&
  fs.existsSync(path.join(__dirname, '..', 'node_modules_windows_x64'))
) {
  fs.rmSync(path.join(__dirname, '..', 'node_modules'), {
    recursive: true,
    force: true
  });
  fs.renameSync(
    path.join(__dirname, '..', 'node_modules_windows_x64'),
    path.join(__dirname, '..', 'node_modules')
  );
}

const extensionApi = require('@podman-desktop/api');
const express = require('express');
const http = require('http');
const {Server} = require('ws');
const pty = require('node-pty');

import {resourceLoader, uriFixer} from './extension-util';

const indexPathSegments = ['dist', 'browser', 'index.html'];
const podmanCli = os.platform() === 'win32' ? 'podman.exe' : 'podman';
const agentContainerName = 'podman-desktop-agent-client';
const agentImageName = 'quay.io/manusa/podman-desktop-agent-client:latest';

let server;

export const activate = async extensionContext => {
  const wvp = extensionApi.window.createWebviewPanel(
    'podmanDesktopAgent',
    'Agent'
  );
  extensionContext.subscriptions.push(wvp);
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

const spawnShell = (file, args) => {
  return pty.spawn(file, args, {
    name: 'xterm-color',
    cwd: process.env.HOME,
    env: process.env
  });
};

const startWebSocketServer = () => {
  const app = express();
  server = http.createServer(app);
  const wss = new Server({server});
  wss.on('connection', ws => {
    console.log('user connected');
    const shell = spawnShell(podmanCli, [
      'run',
      '--rm',
      '-ti',
      '--name',
      agentContainerName,
      agentImageName
    ]);
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
    // ws.send('Greetings \x1B[1;3;31mProfessor Falken\x1B[0;0H\x1B[0m\n$ ');
    ws.on('close', () => {
      shell.kill();
      spawnShell(podmanCli, ['kill', agentContainerName]);
      console.log('user disconnected');
    });
  });
  server.listen(0, () => {
    console.log(`Websocket server started on port ${server.address().port}`);
  });
};
