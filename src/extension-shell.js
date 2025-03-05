export const spawnShell = async (file, args, {tty = false} = {}) => {
  if (tty) {
    const pty = require('node-pty');
    return pty.spawn(file, args, {
      name: 'xterm-color',
      cwd: process.env.HOME,
      env: process.env
    });
  } else {
    const {spawn} = require('node:child_process');
    const spawnProcess = spawn(file, args, {
      shell: true,
      cwd: process.env.HOME,
      env: process.env
    });
    return Promise.resolve({
      pid: spawnProcess.pid,
      onData: callback => spawnProcess.stdout.on('data', callback),
      onExit: callback => spawnProcess.on('exit', callback),
      kill: () => spawnProcess.kill
    });
  }
};
