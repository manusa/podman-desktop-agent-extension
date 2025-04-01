import extensionApi from '@podman-desktop/api';
import os from 'node:os';
import {spawnShell, spawnShellSync} from './extension-shell';

const binaryName = ({configuration}) => {
  let ret = 'podman-mcp-server-';
  if (configuration.isWindows) {
    ret += 'windows';
  } else {
    ret += os.platform();
  }
  ret += os.arch() === 'x64' ? '-amd64' : '-arm64';
  ret += configuration.isWindows ? '.exe' : '';
  return ret;
};

/**
 * @typedef McpServer
 * @type {Object}
 * @property {import('@podman-desktop/api').ExtensionContext} extensionContext - The extension context.
 * @property {String} binaryName - The name of the MCP server binary.
 * @property {Number} port - The port the MCP server is running on.
 * @property {Object} shell - The shell object used to spawn the MCP server.
 * @property {Function} start - Starts the MCP server.
 * @property {Function} close - Closes the MCP server.
 */
/**
 * Creates a new MCP server instance.
 * @param {Object} options - The options for the MCP server.
 * @param {Object} options.configuration - The configuration object.
 * @param {import('@podman-desktop/api').ExtensionContext} options.extensionContext - The extension context.
 * @returns {McpServer} The MCP server instance.
 */
export const newMcpServer = ({configuration, extensionContext}) => {
  /** @type {McpServer} */
  const mcpServer = {
    extensionContext,
    binaryName: binaryName({configuration}),
    port: configuration.mcpPort
  };

  mcpServer.start = () => {
    console.log(
      `Starting Podman MCP server at ${mcpServer.binaryName} in port ${mcpServer.port}`
    );

    const executableUri = extensionApi.Uri.joinPath(
      extensionContext.extensionUri,
      'dist',
      mcpServer.binaryName
    );
    const executablePath = executableUri.fsPath;
    const args = ['--sse-port', configuration.mcpPort];
    mcpServer.shell = spawnShell(executablePath, args);
    mcpServer.shell.onExit(code => {
      console.log(`Podman MCP server exited with code ${code}`);
    });
  };

  mcpServer.close = () => {
    if (!mcpServer.shell) {
      return;
    }
    console.log(`Closing MCP server at PID ${mcpServer.shell.pid}`);
    if (configuration.isWindows) {
      // For some reason the process exits but remains on Windows
      spawnShellSync('taskkill.exe', [
        `/PID ${mcpServer.shell.pid}`,
        '/T',
        '/F'
      ]);
    } else {
      process.kill(mcpServer.shell.pid);
    }
    // wait 2 seconds for the process to exit
    const start = Date.now();
    while (Date.now() - start < 2_000) {
      try {
        process.kill(mcpServer.shell.pid);
      } catch {
        break;
      }
    }
  };
  return mcpServer;
};
