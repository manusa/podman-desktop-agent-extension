import {vi} from 'vitest';
const api = {
  configuration: {
    getConfiguration: vi.fn(() => ({get: vi.fn()}))
  },
  provider: {
    getContainerConnections: vi.fn()
  }
};
export default api;
