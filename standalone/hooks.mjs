import {dirname, resolve as nodeResolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const resolve = async (specifier, context, nextResolve) => {
  if (specifier && specifier.indexOf('@podman-desktop/api') > -1) {
    return {
      shortCircuit: true,
      url: 'file://' + nodeResolve(__dirname, specifier, 'index.mjs')
    };
  } else if (
    specifier &&
    specifier.startsWith('./') &&
    !specifier.endsWith('.js')
  ) {
    return nextResolve(specifier + '.js');
  }
  return nextResolve(specifier);
};

export const load = async (url, context, nextLoad) => {
  return nextLoad(url);
};
