/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const API = process.env.VITE_API_URL ?? 'http://localhost:2001';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@\/(.*)$/, replacement: `${path.resolve(__dirname, 'src')}/$1` },
      { find: /^@bta\/shared$/, replacement: path.resolve(__dirname, '../../packages/shared/src/index.ts') },
      { find: /^@bta\/shadcn$/, replacement: path.resolve(__dirname, '../../packages/shadcn/src/index.ts') },
      { find: /^@bta\/shadcn\/(.*)$/, replacement: `${path.resolve(__dirname, '../../packages/shadcn')}/$1` },
    ],
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 2002,
    strictPort: true,
    proxy: Object.fromEntries(['/graphql', '/uploads/', '/files/', '^/driver/', '/health', '/exports/'].map((p) => [p, { target: API, changeOrigin: true }])),
  },
  build: { outDir: 'dist', sourcemap: false, chunkSizeWarningLimit: 1200 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
