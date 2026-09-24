import { expect, test } from '@playwright/test';
import { createConfirmedOrder, login, pickSelect, todayIso, trackErrors, USERS } from './helpers';

test('điều phối: tạo chuyến trùng lịch → nhập lý do để lưu → chạy → tạm dừng có lý do → tiếp tục', async ({ page }) => {
  const errors = trackErrors(page);
  await login(page, USERS.admin);
  await createConfirmedOrder(page);
  expect(errors, errors.join('\n')).toEqual([]);
  await page.getByRole('button', { name: /Tạo chuyến/ }).first().click();
  await page.waitForURL(/trips\/new/);
  await page.waitForLoadState('networkidle');
  expect(errors, errors.join('\n')).toEqual([]);

  // Xe + tài xế đang chạy chuyến CX-…-0001 (06:00–15:00 hôm nay) → 10:00 chắc chắn trùng lịch
  await pickSelect(page, 'Xe', /51C-123\.45/);
  await pickSelect(page, 'Tài xế', /Nguyễn Văn Tài/);
  await page.getByLabel('Xuất phát dự kiến').fill(`${todayIso()}T10:00`);
  await page.getByLabel('Kết thúc dự kiến').fill(`${todayIso()}T12:00`);
  await page.getByRole('button', { name: /Tạo chuyến/ }).last().click();
  await expect(page.getByText(/trùng/i).first()).toBeVisible();
  await page.getByRole('button', { name: /Tạo chuyến/ }).last().click();
  await page.getByLabel('Lý do').fill('Khách gấp, xe quay đầu kịp sau chuyến trước');
  await page.getByRole('button', { name: 'Lưu và bỏ qua cảnh báo' }).click();

  await page.waitForURL(/\/trips\/[a-z0-9]+$/, { timeout: 20_000 });
  await expect(page.getByText(/CX-\d{6}-\d{4}/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Bắt đầu đi lấy hàng' }).click();
  await expect(page.getByText('Đang đến điểm lấy').first()).toBeVisible();

  await page.getByRole('button', { name: 'Thêm thao tác' }).first().click();
  await page.getByRole('menuitem', { name: /Tạm dừng/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: /Tạm dừng/ })).toBeDisabled();
  await dialog.getByText('Chọn lý do').click();
  await page.getByRole('option', { name: 'Kẹt xe' }).click();
  await dialog.getByRole('button', { name: /Tạm dừng/ }).click();
  await expect(page.getByText('Tạm dừng').first()).toBeVisible();
  await page.getByRole('button', { name: /Tiếp tục chuyến/ }).click();
  await expect(page.getByText('Đang đến điểm lấy').first()).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});
