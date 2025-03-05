const os = require('node:os');
import {spawnShell} from './extension-shell.js';

const podmanCli = os.platform() === 'win32' ? 'podman.exe' : 'podman';
const agentContainerName = 'podman-desktop-agent-client';
const agentImageName = 'quay.io/manusa/podman-desktop-agent-client:latest';

export const startAgentContainer = async ({configuration, ws}) => {
  // User might have changed the configuration but the extension is not reloaded
  await configuration.load();
  ws.send('Greetings \x1B[1;3;31mProfessor Falken\x1B[0;0H\x1B[0m\n');
  ws.send('Starting Goose...\n');
  await new Promise(resolve => {
    const pullImage = spawnShell(podmanCli, ['pull', agentImageName], {
      tty: true
    });
    ws.send('\x1B[3;1H');
    pullImage.onData(data => {
      ws.send(data);
    });
    pullImage.onExit(resolve);
  });
  return spawnShell(podmanCli, [
    'run',
    '--tty',
    '--rm',
    '-ti',
    ...configuration.toEnv(),
    '--name',
    agentContainerName,
    '--replace',
    agentImageName
  ]);
};

export const stopAgentContainer = () => {
  spawnShell(podmanCli, ['kill', agentContainerName]);
  console.log('Agent container stopped');
};
