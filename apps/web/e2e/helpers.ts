import { expect, type Page } from '@playwright/test';

export const USERS = {
  admin: 'admin@bta-demo.test',
  operation: 'operation@bta-demo.test',
  accountant: 'accountant@bta-demo.test',
} as const;

/** Đăng nhập dev (VITE_AUTH_DEV_BYPASS) và vào nhà xe demo. */
export async function login(page: Page, email: string = USERS.operation) {
  await page.goto('/login');
  await page.getByLabel('Hoặc email khác').fill(email);
  await page.getByRole('button', { name: 'Vào bằng email này' }).click();
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 20_000 });
  if (page.url().includes('/select-merchant')) {
    await page.getByText('BTA Demo Transport').first().click();
  }
  await expect(page.locator('aside, nav').first()).toBeVisible();
}

/** Thu lỗi console/JS để assert trang không vỡ. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('response', (r) => {
    if (r.status() >= 400 && !/tile\.openstreetmap|favicon/.test(r.url())) errors.push(`http ${r.status()}: ${r.request().method()} ${r.url()}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/Failed to load resource|favicon|Download the React DevTools|tile\.openstreetmap|ERR_INTERNET|net::ERR/i.test(t)) return;
    errors.push(`console: ${t}`);
  });
  return errors;
}
