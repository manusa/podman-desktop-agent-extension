/**
 * @typedef {import('./configuration.js')}.Configuration Configuration
 */
import extensionApi from '@podman-desktop/api';
import os from 'node:os';
import {spawnShell, spawnShellSync} from './extension-shell';

const monitorInterval = 2_500;

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

const killProcess = ({configuration, pid}) => {
  console.log(`MCP Server: closing server at PID ${pid}`);
  if (configuration.isWindows) {
    // For some reason the process exits but remains on Windows
    spawnShellSync('taskkill.exe', [`/PID ${pid}`, '/T', '/F']);
  } else {
    process.kill(pid);
  }
  // wait 2 seconds for the process to exit
  const start = Date.now();
  while (Date.now() - start < 2_000) {
    try {
      process.kill(pid);
    } catch {
      break;
    }
  }
};

/**
 * @typedef McpServer
 * @type {Object}
 * @property {Boolean} closing - Whether the MCP server is closing.
 * @property {String} binaryName - The name of the MCP server binary.
 * @property {String | Number} port - The port the MCP server is running on.
 * @property {Object} shell - The shell object used to spawn the MCP server.
 * @property {function: void} start - Starts the MCP server.
 * @property {function: void} close - Closes the MCP server.
 * @property {function: void} monitor - Monitor thread to ensure the MCP server is always running.
 */
/**
 * Creates a new MCP server instance.
 * @param {Object} options - The options for the MCP server.
 * @param {Configuration} options.configuration - The configuration object.
 * @param {import('@podman-desktop/api').ExtensionContext} options.extensionContext - The extension context.
 * @param {import('@podman-desktop/api').StatusBarItem} options.statusBar - The status bar item (If running in Podman Desktop).
 * @returns {McpServer} The MCP server instance.
 */
export const newMcpServer = async ({
  configuration,
  extensionContext,
  statusBar
}) => {
  /** @type {McpServer} */
  const mcpServer = {
    closing: false,
    binaryName: binaryName({configuration}),
    port: await configuration.mcpPort(),
    shell: null,
    start: () => {
      if (mcpServer.closing) {
        return;
      }
      console.log(
        `MCP Server: starting ${mcpServer.binaryName} in port ${mcpServer.port}`
      );
      const executableUri = extensionApi.Uri.joinPath(
        extensionContext.extensionUri,
        'dist',
        mcpServer.binaryName
      );
      const executablePath = executableUri.fsPath;
      const args = ['--sse-port', mcpServer.port];
      mcpServer.shell = spawnShell(executablePath, args);
      mcpServer.shell.onExit(code => {
        console.log(`MCP Server: exited with code ${code}`);
      });
      if (statusBar) {
        statusBar.text = `MCP Server: ${mcpServer.port}`;
        statusBar.tooltip = `Podman MCP Server listening on http://localhost:${mcpServer.port}/sse`;
        statusBar.iconClass = 'fa fa-plug';
      }
    },
    close: () => {
      console.log('MCP Server: closing...');
      if (!mcpServer.shell || mcpServer.closing) {
        console.log('MCP Server: already closed');
        return;
      }
      mcpServer.closing = true;
      killProcess({configuration, pid: mcpServer.shell.pid});
    },
    monitor: () => {
      if (mcpServer.closing) {
        return;
      }
      (async () => {
        const configuredPort = await configuration.mcpPort();
        if (configuredPort !== mcpServer.port && mcpServer.shell) {
          mcpServer.port = configuredPort;
          killProcess({configuration, pid: mcpServer.shell.pid});
          mcpServer.shell = null;
        }
        if (!mcpServer.shell || mcpServer.shell.closed) {
          mcpServer.start();
        }
      })()
        .catch(e => {
          console.error('MCP Server: error in monitor', e);
        })
        .finally(() => {
          setTimeout(() => mcpServer.monitor(), monitorInterval);
        });
    }
  };
  return mcpServer;
};
