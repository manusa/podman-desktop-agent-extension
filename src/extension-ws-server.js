const express = require('express');
const http = require('http');
const {Server} = require('ws');
import {startAgentContainer, stopAgentContainer} from './extension-agent';

export const startWebSocketServer = configuration => {
  const app = express();
  const webSocketServer = http.createServer(app);
  const wss = new Server({server: webSocketServer});
  wss.on('connection', ws => {
    console.log('user connected');
    // if (true) {
    //   ws.send('Configuration is missing');
    //   ws.close();
    // }
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
  webSocketServer.listen(0, () => {
    console.log(
      `Websocket server started on port ${webSocketServer.address().port}`
    );
  });
  return webSocketServer;
};
