import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: false,
    rollupOptions: {
      external: [
        '@podman-desktop/api',
        'child_process',
        'express',
        'fs',
        'http',
        'node:child_process',
        'node:fs',
        'node:http',
        'node:net',
        'node:os',
        'node:path',
        'node:process',
        'path',
        'ws'
      ]
    },
    lib: {
      entry: resolve(__dirname, 'src', 'extension.js'),
      formats: ['cjs'],
      name: 'extension'
    }
  },
});
