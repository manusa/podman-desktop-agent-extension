import extensionApi from '@podman-desktop/api';
import os from 'node:os';
import {findFreePort} from './extension-net';
import {spawnShellSync} from './extension-shell';

/**
 * @typedef Configuration
 * @type {Object}
 * @property {number} aiSdkPort - The port for the HTTP server where the AI SDK is exposed.
 * @property {string} mcpHost - Podman MCP server host.
 * @property {string | number} mcpPort - Podman MCP server port.
 * @property {Boolean} isWindows - Whether the host is Windows.
 * @property {string} podmanCli - The Podman CLI command.
 * @property {Object} containerConnection - The container connection object.
 * @property {string} provider - The provider for the agent.
 * @property {string} model - The model for the agent.
 * @property {string} googleApiKey - The Google API key for the agent.
 * @property {function: Promise<void>} load - Loads the configuration.
 * @property {function: Array} toEnv - Converts the configuration to environment variables.
 * @property {function: Array<string>} additionalHosts - Returns additional hosts for the container.
 */
/**
 * Creates a new configuration object.
 * @returns {Configuration}
 */
export const newConfiguration = () => {
  /** @type {Configuration} */
  const configuration = {
    aiSdkPort: null,
    mcpHost: 'host.containers.internal',
    mcpPort: null,
    isWindows: os.platform() === 'win32',
    podmanCli: os.platform() === 'win32' ? 'podman.exe' : 'podman',
    containerConnection: null,
    provider: null,
    model: null,
    googleApiKey: null,
    load: async () => {
      configuration.aiSdkPort = await findFreePort();
      // Find container engine
      const connections = extensionApi.provider.getContainerConnections() || [];
      configuration.containerConnection = connections.find(
        c => c && c.connection && c.connection.type === 'podman'
      );
      if (!configuration.containerConnection && connections.length > 0) {
        configuration.containerConnection = connections[0];
      }
      console.log(
        'Container connection:',
        configuration.containerConnection?.connection?.type ?? 'none'
      );
      ////////////////////////
      configuration.provider = await extensionApi.configuration
        .getConfiguration('agent.goose')
        .get('provider');
      configuration.model = await extensionApi.configuration
        .getConfiguration('agent.goose')
        .get('model');
      configuration.googleApiKey = await extensionApi.configuration
        .getConfiguration('agent.goose.provider.gemini')
        .get('googleApiKey');
      const configuredMcpPort = await extensionApi.configuration
        .getConfiguration('agent.mcp')
        .get('port');
      if (configuredMcpPort > 0) {
        configuration.mcpPort = configuredMcpPort;
      } else if (!configuration.mcpPort) {
        configuration.mcpPort = await findFreePort();
      }
    },
    toEnv: () => {
      return [
        '-e',
        `GOOSE_PROVIDER=${configuration.provider}`,
        '-e',
        `GOOSE_MODEL=${configuration.model}`,
        '-e',
        `GOOGLE_API_KEY=${configuration.googleApiKey}`,
        '-e',
        'SSE_ENABLED=true',
        '-e',
        `SSE_HOST=${configuration.mcpHost}`,
        '-e',
        `SSE_PORT=${configuration.mcpPort}`
      ];
    },
    // Can't access the host Windows network from a Container
    // https://stackoverflow.com/questions/79098571/podman-container-cannot-connect-to-windows-host/79099459#79099459
    // https://github.com/containers/podman/issues/14933
    // Workaround to add the WSL2 IP to the container's /etc/hosts
    additionalHosts: () => {
      if (!configuration.isWindows) {
        return [];
      }
      const result = spawnShellSync('powershell.exe', [
        `"Get-NetIpAddress | where { $_.InterfaceAlias -Like '*WSL*' -and $_.AddressFamily -EQ 'IPv4' } | select -ExpandProperty IPAddress"`
      ]);
      if (result.error || result.stdout.toString().trim() === '') {
        console.error('Error getting WSL2 IP', result.error);
        return [];
      }
      return [result.stdout.toString().trim()];
    }
  };
  return configuration;
};
