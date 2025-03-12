import extensionApi from '@podman-desktop/api';
import os from 'node:os';
import {spawnShell} from './extension-shell';

export const startMcpServer = ({configuration, extensionContext}) => {
  let binaryName = 'podman-mcp-server-';
  if (configuration.isWindows) {
    binaryName += 'windows';
  } else {
    binaryName += os.platform();
  }
  binaryName += os.arch() === 'x64' ? '-amd64' : '-arm64';
  binaryName += configuration.isWindows ? '.exe' : '';
  const executableUri = extensionApi.Uri.joinPath(
    extensionContext.extensionUri,
    'dist',
    binaryName
  );
  const executablePath = executableUri.fsPath;
  const args = [
    '--sse-port',
    configuration.mcpPort,
    '--sse-public-host',
    configuration.mcpHost
  ];
  console.log(
    `Starting Podman MCP server at ${binaryName} in port ${configuration.mcpPort}`
  );
  const mcpServer = spawnShell(executablePath, args);
  mcpServer.onExit(code => {
    console.log(`Podman MCP server exited with code ${code}`);
  });
  return mcpServer;
};
