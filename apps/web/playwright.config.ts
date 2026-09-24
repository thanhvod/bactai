import { defineConfig } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * E2E Web Merchant (HARD-003): API riêng cổng 2021 trên DB bta_e2e (seed lại mỗi lần chạy) + Vite 2022.
 * Chạy: npm run e2e -w @bta/web
 */
const E2E_DB = process.env.E2E_DATABASE_URL ?? 'postgresql://bta:bta@localhost:5432/bta_e2e?schema=public';

function chromium(): string | undefined {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  if (!fs.existsSync(base)) return undefined;
  // Ưu tiên Chrome for Testing đầy đủ, sau đó headless shell (cache có thể bị bản Playwright khác thay đổi).
  const candidates: string[] = [];
  for (const d of fs.readdirSync(base).sort().reverse()) {
    if (d.startsWith('chromium-')) {
      candidates.push(path.join(base, d, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'));
      candidates.push(path.join(base, d, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'));
    }
  }
  for (const d of fs.readdirSync(base).sort().reverse()) {
    if (d.startsWith('chromium_headless_shell-')) candidates.push(path.join(base, d, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell'));
  }
  return candidates.find((c) => fs.existsSync(c));
}

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: 'http://localhost:2022',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: { executablePath: chromium() },
  },
  webServer: [
    {
      command: 'node dist/main.js',
      cwd: '../api',
      port: 2021,
      reuseExistingServer: false,
      timeout: 60_000,
      env: { PORT: '2021', DATABASE_URL: E2E_DB, AUTH_DEV_BYPASS: 'true', API_PUBLIC_URL: 'http://localhost:2021', STORAGE_LOCAL_DIR: '/tmp/bta-e2e-storage', SCHEDULER_ENABLED: 'false' },
    },
    {
      command: 'npx vite --port 2022 --strictPort',
      port: 2022,
      reuseExistingServer: false,
      timeout: 60_000,
      env: { VITE_API_URL: 'http://localhost:2021', VITE_AUTH_DEV_BYPASS: 'true' },
    },
  ],
});
