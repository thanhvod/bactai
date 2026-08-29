/// <reference types='vitest' />
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  server: {
    port: 2002,
    host: 'localhost',
  },
  preview: {
    port: 2002,
    host: 'localhost',
  },
  plugins: [react()],
  resolve: {
    alias: {
      // `@/*` là alias nội bộ của nguồn @bta/shadcn (giống app-claude) — app KHÔNG dùng `@` cho src của mình
      '@': resolve(import.meta.dirname, '../../packages/shadcn/src'),
    },
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
