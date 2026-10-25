/** T18: Soul Map trên /dev/soulmap (dev server): E2E_BASE_URL=http://localhost:3100 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.skip(!process.env.E2E_BASE_URL, 'Cần dev server (E2E_BASE_URL)');

test('vẽ lại: đang vẽ → xong, rồi dừng rAF (không còn cập nhật)', async ({ page }) => {
  await page.goto('/dev/soulmap', { waitUntil: 'networkidle' });
  const svg = page.locator('figure svg').first();
  await expect(svg).toHaveAttribute('data-state', 'done');
  await page.getByRole('button', { name: 'Vẽ lại' }).click();
  await expect(svg).toHaveAttribute('data-state', 'drawing');
  await expect(svg).toHaveAttribute('data-state', 'done', { timeout: 4000 });
  const d1 = await svg.locator('[data-main]').getAttribute('d');
  await page.waitForTimeout(300);
  expect(await svg.locator('[data-main]').getAttribute('d')).toBe(d1);
});

test('giảm chuyển động: hiện trạng thái cuối ngay', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dev/soulmap', { waitUntil: 'networkidle' });
  const svg = page.locator('figure svg').first();
  const before = await svg.locator('[data-main]').getAttribute('d');
  await page.getByRole('button', { name: 'Vẽ lại' }).click();
  await expect(svg).toHaveAttribute('data-state', 'done');
  expect(await svg.locator('[data-main]').getAttribute('d')).toBe(before);
});

test('truy cập: svg có tên + mô tả, bảng giá trị ẩn, axe sạch', async ({ page }) => {
  await page.goto('/dev/soulmap', { waitUntil: 'networkidle' });
  await expect(page.getByRole('img', { name: 'Bản đồ linh hồn' }).first()).toBeVisible();
  const table = page.locator('figure table').first();
  await expect(table.getByRole('rowheader', { name: 'Năng lượng' })).toBeAttached();
  await expect(table.locator('td').first()).toHaveText('84');
  const results = await new AxeBuilder({ page }).analyze();
  const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(bad.map((v) => v.id)).toEqual([]);
});
