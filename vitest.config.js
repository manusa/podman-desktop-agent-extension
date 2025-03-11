import path from 'node:path';

const config = {
  test: {
  },
  mockReset: true,
  resolve: {
    alias: {
      '@podman-desktop/api': path.resolve(__dirname, 'src', '__tests__', '@podman-desktop', 'api.js')
    }
  }
};

export default config;
