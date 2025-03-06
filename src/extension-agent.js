import {spawnShell, waitExit} from './extension-shell.js';

const agentContainerName = 'podman-desktop-agent-client';
const agentImageName = 'quay.io/manusa/podman-desktop-agent-client:latest';

export const startAgentContainer = async ({configuration, ws}) => {
  // User might have changed the configuration but the extension is not reloaded
  await configuration.load();
  ws.send('Greetings \x1B[1;3;31mProfessor Falken\x1B[0;0H\x1B[0m\n');
  ws.send('Starting Goose...\n');
  ws.send('\x1B[3;1H');
  const imageExists = await waitExit(
    spawnShell(configuration.podmanCli, ['image', 'exists', agentImageName])
  );
  if (imageExists === 0) {
    ws.send('Agent image already exists\n');
  } else {
    const pullImage = spawnShell(
      configuration.podmanCli,
      ['pull', agentImageName],
      {
        tty: true
      }
    );
    pullImage.onData(data => {
      ws.send(data);
    });
    await waitExit(pullImage);
  }
  return spawnShell(configuration.podmanCli, [
    'run',
    '--tty',
    '--rm',
    '-ti',
    ...configuration.toEnv(),
    ...configuration
      .additionalHosts()
      .map(h => `--add-host=host.containers.internal:${h}`),
    '--name',
    agentContainerName,
    '--replace',
    agentImageName
  ]);
};

export const stopAgentContainer = ({configuration}) => {
  spawnShell(configuration.podmanCli, ['kill', agentContainerName]);
  console.log('Agent container stopped');
};
