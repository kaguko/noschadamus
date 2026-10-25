import { expect, test } from '@playwright/test';

test('trang chủ phản hồi', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
});
