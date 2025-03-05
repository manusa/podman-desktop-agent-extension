const os = require('node:os');
const extensionApi = require('@podman-desktop/api');
import {spawnShell} from './extension-shell.js';

export const startMcpServer = ({configuration, extensionContext}) => {
  let binaryName = 'podman-mcp-server-';
  if (os.platform() === 'win32') {
    binaryName += 'windows';
  } else {
    binaryName += os.platform();
  }
  binaryName += os.arch() === 'x64' ? '-amd64' : '-arm64';
  binaryName += os.platform() === 'win32' ? '.exe' : '';
  const executableUri = extensionApi.Uri.joinPath(
    extensionContext.extensionUri,
    'dist',
    binaryName
  );
  const executablePath = executableUri.fsPath;
  console.log(
    `Starting Podman MCP server at ${binaryName} in port ${configuration.mcpPort}`
  );
  const mcpServer = spawnShell(executablePath, [
    '--sse-port',
    configuration.mcpPort,
    '--sse-public-host',
    'host.containers.internal'
  ]);
  mcpServer.onExit(code => {
    console.log(`Podman MCP server exited with code ${code}`);
  });
  return mcpServer;
};
