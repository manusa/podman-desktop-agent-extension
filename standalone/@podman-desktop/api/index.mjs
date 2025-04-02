import {resolve} from 'node:path';

const configuration = {
  getConfiguration: () => {
    return {
      get: () => {
        return null;
      }
    };
  }
};
const provider = {
  getContainerConnections: () => {
    return [];
  }
};
const Uri = {
  joinPath: (uri, ...pathSegments) => {
    return {
      fsPath: resolve(uri.fsPath, ...pathSegments)
    };
  }
};
export default {Uri, configuration, provider};
