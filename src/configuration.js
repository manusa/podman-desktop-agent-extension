import extensionApi from '@podman-desktop/api';
import os from 'node:os';
import {findFreePort} from './net';

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
 */
/**
 * Creates a new configuration object.
 * @returns {Promise<Configuration>}
 */
export const newConfiguration = async () => {
  const configuredMcpPort = await extensionApi.configuration
    .getConfiguration('agent.mcp')
    .get('port');
  /** @type {Configuration} */
  const configuration = {
    aiSdkPort: await findFreePort(),
    mcpHost: 'host.containers.internal',
    mcpPort: configuredMcpPort > 0 ? configuredMcpPort : await findFreePort(),
    isWindows: os.platform() === 'win32',
    podmanCli: os.platform() === 'win32' ? 'podman.exe' : 'podman',
    provider: await extensionApi.configuration
      .getConfiguration('agent.ai')
      .get('provider'),
    googleModel: await extensionApi.configuration
      .getConfiguration('agent.ai.google')
      .get('model'),
    googleApiKey: await extensionApi.configuration
      .getConfiguration('agent.ai.google')
      .get('apiKey'),
    openAiModel: await extensionApi.configuration
      .getConfiguration('agent.ai.openAi')
      .get('model'),
    openAiBaseUrl: await extensionApi.configuration
      .getConfiguration('agent.ai.openAi')
      .get('baseUrl'),
    openAiApiKey: await extensionApi.configuration
      .getConfiguration('agent.ai.openAi')
      .get('apiKey')
  };
  return configuration;
};
