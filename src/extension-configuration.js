const extensionApi = require('@podman-desktop/api');
const os = require('node:os');

export const newConfiguration = () => {
  const configuration = {
    mcpHost: 'host.containers.internal',
    isWindows: os.platform() === 'win32',
    podmanCli: os.platform() === 'win32' ? 'podman.exe' : 'podman',
    load: async () => {
      configuration.provider = await extensionApi.configuration
        .getConfiguration('agent.goose')
        .get('provider');
      configuration.model = await extensionApi.configuration
        .getConfiguration('agent.goose')
        .get('model');
      configuration.googleApiKey = await extensionApi.configuration
        .getConfiguration('agent.goose.provider.gemini')
        .get('googleApiKey');
      configuration.mcpPort = await extensionApi.configuration
        .getConfiguration('agent.mcp')
        .get('port');
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
    }
  };
  return configuration;
};
