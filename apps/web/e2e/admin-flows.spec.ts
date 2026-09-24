import { expect, test } from '@playwright/test';
import ExcelJS from 'exceljs';
import { login, trackErrors, USERS } from './helpers';

test('import 2 khách từ Excel → preview → xác nhận → danh sách có khách mới', async ({ page }) => {
  const errors = trackErrors(page);
  const stamp = Date.now().toString().slice(-6);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Khach');
  ws.addRow(['Tên khách hàng', 'SĐT', 'MST', 'Địa chỉ', 'Hạn mức nợ', 'Số ngày công nợ']);
  ws.addRow([`KH Import A ${stamp}`, `0971${stamp}`, '', 'Quận 1, TP.HCM', 50000000, 15]);
  ws.addRow([`KH Import B ${stamp}`, `0972${stamp}`, '', 'Biên Hòa, Đồng Nai', '', 7]);
  const buffer = Buffer.from(await wb.xlsx.writeBuffer());

  await login(page, USERS.operation);
  await page.goto('/customers');
  await page.getByRole('button', { name: /Import/ }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('input[type=file]').setInputFiles({ name: 'khach.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer });
  await dialog.getByRole('button', { name: 'Tiếp tục' }).click();
  await dialog.getByRole('button', { name: /Xác nhận nhập 2 dòng/ }).click();
  await expect(page.getByText('Đã nhập 2 khách hàng').first()).toBeVisible({ timeout: 20_000 });
  await expect(dialog.getByText(/Đã tạo KH-/).first()).toBeVisible();
  await dialog.getByRole('button', { name: 'Đóng', exact: true }).last().click();
  await page.getByPlaceholder(/Tìm/).first().fill(`KH Import A ${stamp}`);
  await expect(page.getByText(`KH Import A ${stamp}`).first()).toBeVisible({ timeout: 15_000 });
  expect(errors, errors.join('\n')).toEqual([]);
});

test('cài đặt: admin đổi ngưỡng COD → reload vẫn giữ; operation thấy màn không có quyền', async ({ page, browser }) => {
  const errors = trackErrors(page);
  await login(page, USERS.admin);
  await page.goto('/settings/operations');
  await page.getByLabel('Ngưỡng số tiền').fill('7000000');
  await page.getByRole('button', { name: 'Lưu cài đặt' }).click();
  await expect(page.getByText(/Ngưỡng COD hiện hành: 7\.000\.000 đ/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Ngưỡng COD hiện hành: 7\.000\.000 đ/)).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);

  const ctx = await browser.newContext();
  const op = await ctx.newPage();
  await login(op, USERS.operation);
  await op.goto('/settings/operations');
  await expect(op.getByText('Bạn không có quyền xem trang này')).toBeVisible();
  await ctx.close();
});

test('tách merchant: admin tenant B không thấy khách của merchant A', async ({ page }) => {
  const errors = trackErrors(page);
  await login(page, 'admin@tenant-b.test');
  await page.goto('/customers');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Khách Tenant B').first()).toBeVisible();
  await expect(page.getByText('Công ty Gạo Miền Tây')).toHaveCount(0);
  await page.getByPlaceholder(/Tìm/).first().fill('Gạo Miền Tây');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Công ty Gạo Miền Tây')).toHaveCount(0);
  expect(errors, errors.join('\n')).toEqual([]);
});
