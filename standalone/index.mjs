#!/usr/bin/env node
import express from 'express';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {newConfiguration} from '../src/extension-configuration.js';
import {newMcpServer} from '../src/extension-mcp-server.js';
import {findFreePort} from '../src/extension-net.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = 8000;

try {
  /** @type {import('@podman-desktop/api').ExtensionContext} */
  const extensionContext = {
    extensionUri: {fsPath: resolve(__dirname, '..')}
  };

  const configuration = await newConfiguration();
  configuration.provider = 'google';
  configuration.model = 'gemini-2.0-flash';
  configuration.mcpPort = await findFreePort();
  await configuration.load();

  const mcpServer = await newMcpServer({configuration, extensionContext});
  await mcpServer.start();

  const app = express();
  app.use(express.static(resolve(__dirname, '..', 'dist', 'browser'))); // Serves resources from public folder
  const server = app.listen(port);
  console.log(`Server started, http://localhost:${port}/`);
  process.on('SIGINT', () => {
    server.close();
    mcpServer && mcpServer.close();
    console.log('Server closed');
    process.exit(0);
  })
} catch (e) {
  console.error('Error starting server:', e);
  process.exit(1);
}
