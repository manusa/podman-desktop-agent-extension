import {vi} from 'vitest';
const api = {
  configuration: {
    mockedSections: {},
    getConfiguration: vi.fn(section => ({
      get: vi.fn(
        subsection => api.configuration.mockedSections[section]?.[subsection]
      )
    })),
    onDidChangeConfiguration: vi.fn()
  },
  provider: {
    getContainerConnections: vi.fn()
  },
  Uri: {
    joinPath: vi.fn((uri, ...paths) => ({fsPath: paths.join('/')}))
  }
};
export default api;
