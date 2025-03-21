import extensionApi from '@podman-desktop/api';
import os from 'node:os';
import {findFreePort} from './extension-net';
import {spawnShellSync} from './extension-shell';

export const newConfiguration = () => {
  const configuration = {
    // Podman MCP server host
    mcpHost: 'host.containers.internal',
    // Podman MCP server port
    mcpPort: null,
    isWindows: os.platform() === 'win32',
    podmanCli: os.platform() === 'win32' ? 'podman.exe' : 'podman',
    load: async () => {
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
