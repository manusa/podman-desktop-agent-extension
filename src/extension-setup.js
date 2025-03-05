const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Replace node_modules in Windows environments when deployed from Containerfile.extension
export const replaceNodeModules = () => {
  if (
    // I need to check if it works for windows/arm64 too
    os.platform() === 'win32' /*&& os.arch() === 'x64'*/ &&
    fs.existsSync(path.join(__dirname, '..', 'node_modules_windows_x64'))
  ) {
    fs.rmSync(path.join(__dirname, '..', 'node_modules'), {
      recursive: true,
      force: true
    });
    fs.renameSync(
      path.join(__dirname, '..', 'node_modules_windows_x64'),
      path.join(__dirname, '..', 'node_modules')
    );
  }
};
