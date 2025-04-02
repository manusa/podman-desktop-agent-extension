import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: resolve(__dirname, 'frontend'),
  build: {
    outDir: resolve(__dirname, 'dist', 'browser'),
    emptyOutDir: true
  },
});
