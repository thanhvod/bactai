import { expect, test } from '@playwright/test';
import { PNG_1PX, login, pickSelect, trackErrors, USERS } from './helpers';

test('phiếu chi cầu đường gắn chuyến + đính kèm ảnh ngay khi tạo → hủy phiếu cần lý do', async ({ page }) => {
  const errors = trackErrors(page);
  await login(page, USERS.accountant);
  await page.goto('/dispatch');
  await page.getByText(/CX-\d{6}-0001/).first().click();
  await page.waitForURL(/\/trips\/[a-z0-9]+$/);
  await page.getByRole('button', { name: 'Thêm thao tác' }).first().click();
  await page.getByRole('menuitem', { name: 'Thêm chi phí chuyến' }).click();
  await page.waitForURL(/\/finance\/expenses\/new/);

  await pickSelect(page, 'Danh mục chi', 'Cầu đường');
  await page.getByLabel('Số tiền').fill('150000');
  await page.getByLabel('Nội dung chi').fill('Phí BOT Trung Lương');
  await page.getByTestId('pending-attachments-input').setInputFiles({ name: 've-bot.png', mimeType: 'image/png', buffer: PNG_1PX });
  await expect(page.getByText('ve-bot.png')).toBeVisible();
  await page.getByRole('button', { name: /Lưu phiếu chi/ }).click();

  await page.waitForURL(/\/finance\/expenses\/[a-z0-9]+(\?.*)?$/, { timeout: 20_000 });
  await expect(page.getByText(/PC-\d{6}-\d{4}/).first()).toBeVisible();
  await page.getByRole('tab', { name: /Chứng từ/ }).click();
  await expect(page.getByText('ve-bot.png').first()).toBeVisible();

  await page.getByRole('button', { name: 'Thêm thao tác' }).first().click();
  await page.getByRole('menuitem', { name: 'Hủy phiếu chi' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Hủy phiếu' }).click();
  await expect(dialog.getByText(/Lý do tối thiểu/)).toBeVisible();
  await dialog.getByLabel('Lý do').fill('Nhập trùng với biên lai tài xế đã khai');
  await dialog.getByRole('button', { name: 'Hủy phiếu' }).click();
  await expect(page.getByText('Đã hủy').first()).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});
