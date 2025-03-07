export const spawnShell = (file, args, {tty = false} = {}) => {
  const {spawn} = require('node:child_process');
  const spawnProcess = spawn(file, args, {
    shell: true,
    cwd: process.env.HOME,
    env: process.env
  });
  return {
    pid: spawnProcess.pid,
    exitCode: spawnProcess.exitCode,
    onData: callback => {
      if (tty) {
        // minimal terminal emulation by moving the cursor to the beginning of the line
        [spawnProcess.stdout, spawnProcess.stderr].forEach(std =>
          std.on('data', data =>
            callback(data.toString().replaceAll('\n', '\x1B[1B\x1B[9999D'))
          )
        );
      } else {
        spawnProcess.stdout.on('data', callback);
      }
    },
    write: data => spawnProcess.stdin.write(data),
    onExit: callback => spawnProcess.on('exit', callback),
    kill: () => spawnProcess.kill
  };
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
