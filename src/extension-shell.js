export const spawnShell = (file, args, {tty = false} = {}) => {
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
    return {
      pid: spawnProcess.pid,
      exitCode: spawnProcess.exitCode,
      onData: callback => spawnProcess.stdout.on('data', callback),
      write: data => spawnProcess.stdin.write(data),
      onExit: callback => spawnProcess.on('exit', callback),
      kill: () => spawnProcess.kill
    };
  }
};

export const waitExit = async spawnedShell => {
  return new Promise(resolve => spawnedShell.onExit(resolve));
};

export const spawnShellSync = (file, args) => {
  const {spawnSync} = require('node:child_process');
  return spawnSync(file, args, {
    shell: true,
    cwd: process.env.HOME,
    env: process.env
  });
};
