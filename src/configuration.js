/**
 * @typedef {import('@podman-desktop/api').ConfigurationChangeEvent} ConfigurationChangeEvent
 * @typedef {import('express').RequestHandler} RequestHandler
 */
import extensionApi from '@podman-desktop/api';
import os from 'node:os';
import {findFreePort} from './net';

/**
 * @typedef Configuration
 * @type {Object}
 * @property {Number} aiSdkPort - The port for the HTTP server where the AI SDK is exposed.
 * @property {String} mcpHost - Podman MCP server host.
 * @property {function: Promise<String | number>} mcpPort - Podman MCP server port.
 * @property {Boolean} isWindows - Whether the host is Windows.
 * @property {String} podmanCli - The Podman CLI command.
 * @property {function: Promise<String>} provider - The AI model provider.
 * @property {function: Promise<String>} googleModel - The Google model.
 * @property {function: Promise<String>} googleApiKey - The Google API key.
 * @property {function: Promise<String>} openAiModel - The OpenAI model.
 * @property {function: Promise<String>} openAiBaseUrl - The OpenAI base URL.
 * @property {function: Promise<String>} openAiApiKey - The OpenAI API key.
 * @property {function(ConfigurationChangeEvent)} onChange - A function to call when the configuration changes.
 */
/**
 * Creates a new configuration object.
 * @returns {Promise<Configuration>}
 */
export const newConfiguration = async () => {
  const defaultMcpPort = await findFreePort();
  /** @type {Configuration} */
  const configuration = {
    aiSdkPort: await findFreePort(),
    mcpHost: 'host.containers.internal',
    mcpPort: async () => {
      const configuredMcpPort = await extensionApi.configuration
        .getConfiguration('agent.mcp')
        .get('port');
      if (configuredMcpPort > 0) {
        return configuredMcpPort;
      }
      return defaultMcpPort;
    },
    isWindows: os.platform() === 'win32',
    podmanCli: os.platform() === 'win32' ? 'podman.exe' : 'podman',
    provider: async () =>
      extensionApi.configuration.getConfiguration('agent.ai').get('provider'),
    googleModel: async () =>
      extensionApi.configuration
        .getConfiguration('agent.ai.google')
        .get('model'),
    googleApiKey: async () =>
      extensionApi.configuration
        .getConfiguration('agent.ai.google')
        .get('apiKey'),
    openAiModel: async () =>
      extensionApi.configuration
        .getConfiguration('agent.ai.openAi')
        .get('model'),
    openAiBaseUrl: async () =>
      extensionApi.configuration
        .getConfiguration('agent.ai.openAi')
        .get('baseUrl'),
    openAiApiKey: async () =>
      extensionApi.configuration
        .getConfiguration('agent.ai.openAi')
        .get('apiKey'),
    onChange: event => {
      if (event.affectsConfiguration('agent')) {
        console.log('Configuration changed');
        console.log(JSON.stringify(event));
      }
    }
    //   if (event.affectsConfiguration('agent.mcp') && configuration) {
    //     if (
    //       mcpServer &&
    //       parseInt(mcpServer.port) !== parseInt(configuration.mcpPort)
    //     ) {
    //       mcpServer.close();
    //       mcpServer = newMcpServer({
    //         configuration,
    //         extensionContext: mcpServer.extensionContext
    //       });
    //       mcpServer.start();
    //       statusBar.text = `MCP Server: ${configuration.mcpPort}`;
    //       statusBar.tooltip = `MCP Server listening on http://localhost:${configuration.mcpPort}/sse`;
    //     }
    //   }
    // }
  };
  return configuration;
};
