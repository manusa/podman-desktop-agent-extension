import extensionApi from '@podman-desktop/api';
import os from 'node:os';
import {spawnShell, spawnShellSync} from './extension-shell';

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
  const args = ['--sse-port', configuration.mcpPort];
  console.log(
    `Starting Podman MCP server at ${binaryName} in port ${configuration.mcpPort}`
  );
  const mcpServer = spawnShell(executablePath, args);
  mcpServer.extensionContext = extensionContext;
  mcpServer.port = configuration.mcpPort;
  mcpServer.onExit(code => {
    console.log(`Podman MCP server exited with code ${code}`);
  });
  mcpServer.close = () => {
    console.log(`Closing MCP server at PID ${mcpServer.pid}`);
    if (configuration.isWindows) {
      // For some reason the process exits but remains on Windows
      spawnShellSync('taskkill.exe', [`/PID ${mcpServer.pid}`, '/T', '/F']);
    } else {
      process.kill(mcpServer.pid);
    }
    // wait 2 seconds for the process to exit
    const start = Date.now();
    while (Date.now() - start < 2_000) {
      try {
        process.kill(mcpServer.pid);
      } catch {
        break;
      }
    }
  };
  return mcpServer;
};
