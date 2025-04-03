import extensionApi from '@podman-desktop/api';
import os from 'node:os';
import {findFreePort} from './net';
import {spawnShellSync} from './extension-shell';

/**
 * @typedef Configuration
 * @type {Object}
 * @property {Number} aiSdkPort - The port for the HTTP server where the AI SDK is exposed.
 * @property {String} mcpHost - Podman MCP server host.
 * @property {String | number} mcpPort - Podman MCP server port.
 * @property {Boolean} isWindows - Whether the host is Windows.
 * @property {String} podmanCli - The Podman CLI command.
 * @property {String} provider - The AI model provider.
 * @property {String} googleModel - The Google model.
 * @property {String} googleApiKey - The Google API key.
 * @property {String} openAiModel - The OpenAI model.
 * @property {String} openAiBaseUrl - The OpenAI base URL.
 * @property {String} openAiApiKey - The OpenAI API key.
 * @property {function: Promise<void>} load - Loads the configuration.
 * @property {function: Array} toEnv - Converts the configuration to environment variables.
 * @property {function: Array<string>} additionalHosts - Returns additional hosts for the container.
 */
/**
 * Creates a new configuration object.
 * @returns {Promise<Configuration>}
 */
export const newConfiguration = async () => {
  /** @type {Configuration} */
  const configuration = {
    aiSdkPort: await findFreePort(),
    mcpHost: 'host.containers.internal',
    mcpPort: null,
    isWindows: os.platform() === 'win32',
    podmanCli: os.platform() === 'win32' ? 'podman.exe' : 'podman',
    provider: null,
    googleModel: null,
    googleApiKey: null,
    openAiModel: null,
    openAiBaseUrl: null,
    openAiApiKey: null,
    load: async () => {
      configuration.provider = await extensionApi.configuration
        .getConfiguration('agent.ai')
        .get('provider');
      configuration.googleModel = await extensionApi.configuration
        .getConfiguration('agent.ai.google')
        .get('model');
      configuration.googleApiKey = await extensionApi.configuration
        .getConfiguration('agent.ai.google')
        .get('apiKey');
      configuration.openAiModel = await extensionApi.configuration
        .getConfiguration('agent.ai.openAi')
        .get('model');
      configuration.openAiBaseUrl = await extensionApi.configuration
        .getConfiguration('agent.ai.openAi')
        .get('baseUrl');
      configuration.openAiApiKey = await extensionApi.configuration
        .getConfiguration('agent.ai.openAi')
        .get('apiKey');
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
