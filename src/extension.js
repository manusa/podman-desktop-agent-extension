const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
if (
  // I need to check if it works for windows/arm64 too
  os.platform() === 'win32' /*&& os.arch() === 'x64'*/ &&
  fs.existsSync(path.join(__dirname, 'node_modules_windows_x64'))
) {
  fs.rmSync(path.join(__dirname, 'node_modules'), {
    recursive: true,
    force: true
  });
  fs.renameSync(
    path.join(__dirname, 'node_modules_windows_x64'),
    path.join(__dirname, 'node_modules')
  );
}
// Lazy load dependencies to allow for the above platform-specific code to run
let server;
const indexPathSegments = ['dist', 'browser', 'index.html'];

export const activate = async extensionContext => {
  const extensionApi = require('@podman-desktop/api');
  const {resourceLoader, uriFixer} = await import('./extension-util');

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
  return require('node-pty').spawn(
    os.platform() === 'win32' ? 'cmd.exe' : 'sh',
    [],
    {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.env.HOME,
      env: process.env
    }
  );
};

const startWebSocketServer = () => {
  const express = require('express');
  const http = require('http');
  const {Server} = require('ws');
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
