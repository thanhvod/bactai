import { test } from '@playwright/test';
import { login, USERS } from './helpers';

/** Chụp màn hình để review thủ công (không assert). Chạy: npx playwright test screens --grep @shots */
test('@shots chụp các màn chính', async ({ page }) => {
  test.setTimeout(180_000);
  await login(page, USERS.admin);
  const shots: [string, string][] = [
    ['dashboard', '/'], ['orders', '/orders'], ['order-new', '/orders/new'], ['dispatch', '/dispatch'],
    ['customers', '/customers'], ['finance', '/finance'], ['payroll', '/payroll'], ['reports-profit', '/reports/profit'],
  ];
  for (const [name, url] of shots) {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `test-results/shots/${name}.png`, fullPage: false });
  }
  await page.goto('/orders');
  await page.waitForLoadState('networkidle');
  await page.getByText(/DH-\d{6}-0001/).first().click();
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/shots/order-detail.png' });
});
