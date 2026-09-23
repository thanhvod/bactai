import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'src/**/*.e2e.ts'],
    globals: false,
    environment: 'node',
    globalSetup: ['src/test/global-setup.ts'],
    setupFiles: ['src/test/per-file-setup.ts'],
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
  plugins: [swc.vite({ module: { type: 'es6' } })],
});
