#!/usr/bin/env node
import express from 'express';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {newConfiguration} from '../src/configuration.js';
import {newMcpServer} from '../src/mcp-server.js';
import {newAiSdk} from '../src/ai-sdk.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = 8000;

try {
  /** @type {import('@podman-desktop/api').ExtensionContext} */
  const extensionContext = {
    extensionUri: {fsPath: resolve(__dirname, '..')}
  };

  const configuration = await newConfiguration();
  configuration.provider = async () => 'google';
  configuration.googleModel = async () => 'gemini-flash-latest';
  configuration.googleApiKey = async () => process.env['GOOGLE_API_KEY'];

  const mcpServer = await newMcpServer({
    configuration,
    extensionContext,
    statusBar: null
  });
  await mcpServer.monitor();

  const aiSdk = await newAiSdk({configuration});
  await aiSdk.start();

  const app = express();
  app.use(express.static(resolve(__dirname, '..', 'dist', 'assistant-ui'))); // Serves resources from public folder

  app.use(express.json());
  app.use((req, res) => {
    const aiSdkUrl = `http://localhost:${configuration.aiSdkPort}${req.url}`;
    fetch(aiSdkUrl, {
      method: req.method,
      headers: req.headers,
      body: JSON.stringify(req.body)
    })
      .then(response => {
        response.body.pipeTo(
          new WritableStream({
            start() {
              res.statusCode = response.status;
              response.headers.forEach((v, n) => res.setHeader(n, v));
            },
            write(chunk) {
              res.write(chunk);
            },
            close() {
              res.end();
            }
          })
        );
      })
      .catch(e => {
        res.status(500).send(e);
      });
  });

  const server = app.listen(port);
  console.log(`Server started, http://localhost:${port}/`);
  process.on('SIGINT', () => {
    server.close();
    mcpServer && mcpServer.close();
    aiSdk && aiSdk.close();
    console.log('Server closed');
    process.exit(0);
  });
} catch (e) {
  console.error('Error starting server:', e);
  process.exit(1);
}
