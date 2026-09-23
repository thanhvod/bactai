import { expect, test } from '@playwright/test';
import { login, trackErrors, USERS } from './helpers';

test('kế toán ghi phiếu thu khách và phân bổ vào đơn quá hạn', async ({ page, request }) => {
  const errors = trackErrors(page);
  await login(page, USERS.accountant);
  await page.goto('/customers');
  await page.getByText('Công ty Gạo Miền Tây').first().click();
  await page.waitForURL(/\/customers\/[a-z0-9]+/);
  const customerId = new URL(page.url()).pathname.split('/')[2];
  await page.goto(`/finance/payments/new?type=CUSTOMER_PAYMENT&customerId=${customerId}`);
  await page.getByLabel('Số tiền').fill('15000000');
  await page.getByRole('button', { name: /^Lưu phiếu thu|^Lưu$/ }).first().click();
  await page.waitForURL(/\/finance\/payments\/[a-z0-9]+/, { timeout: 20_000 });
  await expect(page.getByText(/PT-\d{6}-\d{4}/).first()).toBeVisible();
  await page.getByRole('link', { name: /Phân bổ/ }).or(page.getByRole('button', { name: /Phân bổ vào đơn|Phân bổ/ })).first().click();
  await page.waitForURL(/allocate/);
  await page.getByRole('button', { name: /Tự điền theo hạn cũ nhất/ }).click();
  await page.getByRole('button', { name: /Xác nhận phân bổ/ }).click();
  await expect(page.getByText(/Đã phân bổ|phân bổ thành công/i).first()).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('giám đốc duyệt bảng lương chờ duyệt; operation không thấy nút duyệt', async ({ page, browser }) => {
  const errors = trackErrors(page);
  await login(page, USERS.admin);
  await page.goto('/payroll');
  await page.getByText(/BL-\d{6}-0001/).first().click();
  await page.waitForURL(/\/payroll\/[a-z0-9]+/);
  const payrollUrl = page.url();
  await page.getByRole('button', { name: /Xem và duyệt/ }).first().click();
  if (!page.url().includes('/approve')) await page.waitForURL(/approve/).catch(() => undefined);
  await page.getByRole('button', { name: /Duyệt bảng lương ·/ }).click();
  await expect(page.getByText('Đã duyệt').first()).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);

  const ctx = await browser.newContext();
  const op = await ctx.newPage();
  await login(op, USERS.operation);
  await op.goto(payrollUrl);
  await op.waitForLoadState('networkidle');
  await expect(op.getByRole('button', { name: /Xem và duyệt|Duyệt bảng lương/ })).toHaveCount(0);
  await ctx.close();
});
