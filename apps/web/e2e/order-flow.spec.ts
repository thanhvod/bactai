import { expect, test } from '@playwright/test';
import { login, trackErrors, USERS } from './helpers';

test('operation tạo đơn 1 xe qua UI → đơn có mã DH, xác nhận được', async ({ page }) => {
  const errors = trackErrors(page);
  await login(page, USERS.operation);
  await page.goto('/orders/new');
  await page.getByText('Tìm khách theo tên, mã, SĐT').click();
  await page.keyboard.type('Gạo Miền');
  await page.getByRole('option', { name: /Công ty Gạo Miền Tây/ }).first().click();

  const addr = page.getByPlaceholder('Địa chỉ *');
  if (!(await addr.nth(0).inputValue())) await addr.nth(0).fill('KCN Trà Nóc, Cần Thơ');
  if (!(await addr.nth(1).inputValue())) await addr.nth(1).fill('KCN Sóng Thần, Bình Dương');
  await page.getByPlaceholder('Tên/mô tả hàng').first().fill('8 tấn gạo');
  await page.getByLabel('Giá cước').fill('9000000');
  await page.getByRole('button', { name: 'Lưu nháp' }).click();

  await page.waitForURL(/\/orders\/[a-z0-9]+(\?.*)?$/, { timeout: 20_000 });
  await expect(page.getByText(/DH-\d{6}-\d{4}/).first()).toBeVisible();
  await expect(page.getByText('9.000.000 đ').first()).toBeVisible();
  await page.getByRole('button', { name: /^Xác nhận/ }).first().click();
  await expect(page.getByText('Đã xác nhận').first()).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});
