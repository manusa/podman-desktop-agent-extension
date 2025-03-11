const fs = require('node:fs');
const os = require('node:os');

// Run the shell command in bash so that any .bashrc or .bash_profile settings are applied
const preferBash = ({file, args}) => {
  let shell;
  if (os.platform() !== 'win32') {
    const candidates = ['/bin/bash', '/usr/bin/bash'];
    if (process.env.SHELL) {
      candidates.unshift(process.env.SHELL);
    }
    for (const candidate of candidates) {
      try {
        fs.statSync(candidate);
        shell = candidate;
        break;
      } catch {
        // No bash, try the next one
      }
    }
  }
  return {file, args, shell};
};

export const spawnShell = (
  originalFile,
  originalArgs = [],
  {tty = false} = {}
) => {
  const {file, args, shell} = preferBash({
    file: originalFile,
    args: originalArgs
  });
  const {spawn} = require('node:child_process');
  console.log(`Spawning ${file} ${args.join(' ')} (shell: ${shell})`);
  const spawnProcess = spawn(file, args, {
    shell,
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

export const spawnShellSync = (originalFile, originalArgs = []) => {
  const {file, args, shell} = preferBash({
    file: originalFile,
    args: originalArgs
  });
  const {spawnSync} = require('node:child_process');
  console.log(`Spawning sync ${file} ${args.join(' ')} (shell: ${shell})`);
  return spawnSync(file, args, {
    shell,
    cwd: process.env.HOME,
    env: process.env
  });
};
