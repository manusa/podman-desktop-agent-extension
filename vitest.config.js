import path from 'node:path';

const config = {
  test: {
    setupFiles: ['./src/__tests__/setup.js'],
  },
  mockReset: true,
  resolve: {
    alias: {
      '@podman-desktop/api': path.resolve(__dirname, 'src', '__tests__', '@podman-desktop', 'api.js')
    }
  }
};

export default config;
