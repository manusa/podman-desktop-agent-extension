const extensionApi = require('@podman-desktop/api');
const express = require('express');
const http = require('http');
const {Server} = require('ws');
const os = require('node:os');
let pty;
if (os.platform() === 'win32' && os.arch() === 'x64') {
  pty = require('../node_modules_windows_x64/node-pty');
} else {
  pty = require('node-pty');
}
import {resourceLoader, uriFixer} from './extension-util';

const indexPathSegments = ['dist', 'browser', 'index.html'];

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

const spawnShell = () => {
  return pty.spawn(os.platform() === 'win32' ? 'cmd.exe' : 'sh', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
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
    const shell = spawnShell();
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
      console.log('user disconnected');
    });
  });
  server.listen(0, () => {
    console.log(`Websocket server started on port ${server.address().port}`);
  });
};
