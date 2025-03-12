import {vi} from 'vitest';
const api = {
  configuration: {
    getConfiguration: vi.fn(() => ({get: vi.fn()}))
  },
  provider: {
    getContainerConnections: vi.fn()
  },
  Uri: {
    joinPath: vi.fn((uri, ...paths) => ({fsPath: paths.join('/')}))
  }
};
export default api;
