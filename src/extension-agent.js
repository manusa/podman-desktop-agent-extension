const extensionApi = require('@podman-desktop/api');

import {spawnShell, waitExit} from './extension-shell.js';

const agentContainerName = 'podman-desktop-agent-client';
const agentImageName = 'quay.io/manusa/podman-desktop-agent-client:latest';
// https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797
const ansiLineBreak = '\n\x1B[1G';

export const startAgentContainer = async ({configuration, ws}) => {
  // User might have changed the configuration but the extension is not reloaded
  await configuration.load();
  ws.send(`Greetings \x1B[1;3;31mProfessor Falken\x1B[0m${ansiLineBreak}`);
  ws.send(`Starting Goose...${ansiLineBreak}`);
  if (!configuration.containerConnection) {
    ws.send(`No Container engine found${ansiLineBreak}`);
    return;
  }
  const images = await extensionApi.containerEngine
    .listImages({provider: configuration.containerConnection.connection});
  let imageExists = false;
  images.forEach(image => {
    if (image.RepoTags.some(rt => rt === agentImageName)) {
      imageExists = true;
    }
  });
  if (imageExists) {
    ws.send(`Agent image exists, starting Goose now!${ansiLineBreak}`);
  } else {
    ws.send(`Pulling image ${agentImageName}${ansiLineBreak}`);
    await extensionApi.containerEngine.pullImage(
      configuration.containerConnection.connection,
      agentImageName,
      pe => ws.send(`${pe.status} ${pe.progress ?? ''}${ansiLineBreak}`)
    );
  }
  const args = [
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
  ];
  console.log(
    `Starting agent container with: ${configuration.podmanCli} ${args.join(' ')}`
  );
  return spawnShell(configuration.podmanCli, args);
};

export const stopAgentContainer = ({configuration}) => {
  spawnShell(configuration.podmanCli, ['kill', agentContainerName]);
  console.log('Agent container stopped');
};
