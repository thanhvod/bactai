import { expect, test } from '@playwright/test';
import { login, todayIso, trackErrors, USERS } from './helpers';

test('công nợ NCC: trả hết phiếu chưa trả của Xăng dầu Minh Phát → NCC hết nợ', async ({ page }) => {
  const errors = trackErrors(page);
  await login(page, USERS.accountant);
  await page.goto('/finance/supplier-debt');
  await expect(page.getByText('10.500.000 đ').first()).toBeVisible();
  // bấm ô mũi tên của dòng (ô tên NCC là link sang chi tiết NCC)
  await page.getByRole('row', { name: /Xăng dầu Minh Phát/ }).getByRole('cell').first().click();
  const section = page.locator('section', { hasText: 'Phiếu chưa trả — Xăng dầu Minh Phát' });
  await section.getByRole('checkbox', { name: 'Chọn tất cả' }).click();
  await page.getByRole('button', { name: /Trả NCC \(1\)/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xác nhận đã trả' }).click();
  await expect(page.getByText('8.000.000 đ').first()).toBeVisible();
  await expect(page.getByRole('cell', { name: /Xăng dầu Minh Phát/ })).toHaveCount(0);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('bảng kê: kế toán tạo cho Công ty Gạo Miền Tây → chốt → có PDF', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = trackErrors(page);
  await login(page, USERS.accountant);
  await page.goto('/finance/debt-statements');
  await page.getByRole('button', { name: /Tạo bảng kê/ }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText('Chọn khách hàng').click();
  await page.keyboard.type('Gạo');
  await page.getByRole('option', { name: /Công ty Gạo Miền Tây/ }).first().click();
  const d = new Date();
  d.setMonth(d.getMonth() - 2);
  await dialog.getByLabel('Từ ngày (ngày đơn)').fill(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
  await dialog.getByLabel('Đến ngày').fill(todayIso());
  await dialog.getByRole('button', { name: /Tạo nháp & xem trước/ }).click();
  await page.waitForURL(/\/finance\/debt-statements\/[a-z0-9]+/, { timeout: 20_000 });
  await expect(page.getByText(/CN-\d{6}-\d{4}/).first()).toBeVisible();
  await page.getByRole('button', { name: /Chốt bảng kê/ }).click();
  await page.getByRole('button', { name: 'Chốt & tạo PDF' }).click();
  await expect(page.getByText('Đã chốt').first()).toBeVisible({ timeout: 60_000 });
  const pdf = page.getByRole('link', { name: /Tải PDF/ }).or(page.getByRole('button', { name: /Tải PDF/ })).first();
  await expect(pdf).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});
