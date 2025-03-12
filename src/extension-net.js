import express from 'express';
import http from 'http';
import {WebSocketServer} from 'ws';
import {startAgentContainer, stopAgentContainer} from './extension-agent';
import {ansiLineBreak} from './extension-ansi';

export const findFreePort = async () => {
  const server = http.createServer();
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  server.close();
  return port;
};

export const startWebSocketServer = configuration => {
  const app = express();
  const webSocketServer = http.createServer(app);
  const wss = new WebSocketServer({server: webSocketServer});
  wss.on('connection', ws => {
    console.log('user connected');
    // if (true) {
    //   ws.send('Configuration is missing');
    //   ws.close();
    // }
    ws.send(`Greetings \x1B[1;3;31mProfessor Falken\x1B[0m${ansiLineBreak}`);
    ws.send(`Starting Goose...${ansiLineBreak}`);
    startAgentContainer({configuration, ws})
      .then(agent => {
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
          stopAgentContainer({configuration});
          console.log('user disconnected');
        });
      })
      .catch(e => {
        ws.send(`Error starting Goose: ${e.message}${ansiLineBreak}`);
        ws.close();
      });
  });
  webSocketServer.listen(0, () => {
    console.log(
      `Websocket server started on port ${webSocketServer.address().port}`
    );
  });
  return webSocketServer;
};
