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
  page.on('response', async (r) => {
    if (!r.url().includes('/graphql')) return;
    try {
      const body = await r.json();
      for (const e of body?.errors ?? []) {
        if (['MERCHANT_REQUIRED', 'UNAUTHENTICATED', 'INTERNAL_SERVER_ERROR', 'GRAPHQL_VALIDATION_FAILED'].includes(e?.extensions?.code)) {
          const op = (() => { try { return JSON.parse(r.request().postData() ?? '{}').operationName; } catch { return '?'; } })();
          errors.push(`graphql ${e.extensions.code} @${op}: ${e.message}`);
        }
      }
    } catch { /* không phải JSON */ }
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

/** Tạo nhanh đơn nháp qua UI (khách Gạo Miền Tây, địa chỉ mặc định) rồi xác nhận. Trả URL chi tiết đơn. */
export async function createConfirmedOrder(page: Page, freight = '9000000') {
  await page.goto('/orders/new');
  await page.getByText('Tìm khách theo tên, mã, SĐT').click();
  await page.keyboard.type('Gạo Miền');
  await page.getByRole('option', { name: /Công ty Gạo Miền Tây/ }).first().click();
  const addr = page.getByPlaceholder('Địa chỉ *');
  // sổ địa chỉ tự điền điểm mặc định (bất đồng bộ) — đợi trước khi kiểm tra ô trống
  await page.waitForLoadState('networkidle');
  await expect(addr.nth(0)).not.toHaveValue('', { timeout: 5000 }).catch(() => undefined);
  if (!(await addr.nth(0).inputValue())) await addr.nth(0).fill('KCN Trà Nóc, Cần Thơ');
  if (!(await addr.nth(1).inputValue())) await addr.nth(1).fill('KCN Sóng Thần, Bình Dương');
  await page.getByPlaceholder('Tên/mô tả hàng').first().fill('8 tấn gạo');
  await page.getByLabel('Giá cước').fill(freight);
  await page.getByRole('button', { name: 'Lưu nháp' }).click();
  await page.waitForURL(/\/orders\/[a-z0-9]+(\?.*)?$/, { timeout: 20_000 });
  await page.getByRole('button', { name: /^Xác nhận/ }).first().click();
  await expect(page.getByText('Đã xác nhận').first()).toBeVisible();
  return page.url();
}

/** Chọn option trong Select Radix theo nhãn FormField. */
export async function pickSelect(page: Page, label: string | RegExp, option: string | RegExp) {
  await page.getByRole('combobox', { name: label, exact: typeof label === 'string' }).click();
  await page.getByRole('option', { name: option }).first().click();
}

export function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** PNG 1x1 hợp lệ để test upload. */
export const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
