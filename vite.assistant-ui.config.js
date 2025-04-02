import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig((env) => ({
  root: resolve(__dirname, 'assistant-ui'),
  plugins: [react()],
  build: {
    minify: env.mode === 'production',
    cssMinify: env.mode === 'production',
    sourcemap: env.mode === 'development',
    outDir: resolve(__dirname, 'dist', 'assistant-ui'),
    emptyOutDir: true
  },
  esbuild: {
    jsxInject: `import React from 'react'`
  }
}));
