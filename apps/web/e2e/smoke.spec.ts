import { expect, test } from '@playwright/test';
import { login, trackErrors, USERS } from './helpers';

/** Mọi route list/dashboard mở được, không lỗi JS, không rơi vào ErrorBoundary. */
const ROUTES = [
  '/', '/dashboard/operations', '/dashboard/finance',
  '/orders', '/orders/new', '/bookings',
  '/dispatch', '/dispatch/calendar', '/dispatch/conflicts', '/dispatch/map', '/dispatch/incidents',
  '/customers', '/drivers', '/vehicles', '/suppliers',
  '/finance', '/finance/payments', '/finance/payments/new', '/finance/expenses', '/finance/expenses/new',
  '/finance/customer-debt', '/finance/supplier-debt', '/finance/debt-statements', '/finance/cod', '/finance/trip-advances',
  '/payroll', '/payroll/new',
  '/reports', '/reports/profit', '/reports/vehicles', '/reports/drivers', '/reports/customer-debt', '/reports/cod', '/reports/payroll',
  '/settings/company', '/settings/users', '/settings/roles', '/settings/operations', '/settings/numbering', '/settings/catalogs',
];

test('admin mở mọi màn chính không lỗi', async ({ page }) => {
  test.setTimeout(240_000);
  const errors = trackErrors(page);
  await login(page, USERS.admin);
  const broken: string[] = [];
  for (const r of ROUTES) {
    await page.goto(r);
    await page.waitForLoadState('networkidle');
    const crash = await page.getByText(/Đã xảy ra lỗi|Something went wrong|Không tải được dữ liệu/i).count();
    const placeholder = await page.getByText(/sẽ được triển khai/i).count();
    if (crash || placeholder) broken.push(`${r}${crash ? ' [lỗi]' : ''}${placeholder ? ' [placeholder]' : ''}`);
  }
  expect(broken, broken.join('\n')).toEqual([]);
  expect(errors, errors.join('\n')).toEqual([]);
});
