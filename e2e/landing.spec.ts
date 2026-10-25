/** T20: Landing. Chạy với bản build (webServer mặc định) hoặc E2E_BASE_URL. */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('không cuộn ngang ở 360/390/768/1024/1440', async ({ browser }) => {
  for (const width of [360, 390, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    await page.goto('/', { waitUntil: 'networkidle' });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw, `width ${width}`).toBeLessThanOrEqual(width);
    await page.close();
  }
});

for (const theme of ['dark', 'light'] as const) {
  test(`axe sạch (${theme})`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('nd:theme', t), theme);
    await page.goto('/', { waitUntil: 'networkidle' });
    const r = await new AxeBuilder({ page }).analyze();
    const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(
      bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
    ).toEqual([]);
  });
}

test('nội dung chính, CTA dẫn tới /draw, một h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Không đoán tương lai.');
  const cta = page.getByRole('link', { name: 'Rút bài ngay' }).first();
  await expect(cta).toHaveAttribute('href', '/draw');
  await expect(page).toHaveTitle('noschadamus · Rút tarot, nhận bản đồ linh hồn');
});

test('FAQ: bàn phím mở/đóng', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const summary = page.locator('summary', { hasText: 'Có mất phí không?' });
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Hiện tại hoàn toàn miễn phí.')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Hiện tại hoàn toàn miễn phí.')).toBeHidden();
});

test('analytics: gửi landing_view và draw_started', async ({ page }) => {
  const names: string[] = [];
  await page.route('**/api/events', async (route) => {
    names.push((route.request().postDataJSON() as { name: string }).name);
    await route.fulfill({ status: 204 });
  });
  await page.goto('/?ref=share', { waitUntil: 'networkidle' });
  await expect.poll(() => names).toContain('landing_view');
  await page.getByRole('link', { name: 'Rút bài ngay' }).first().click();
  await expect.poll(() => names).toContain('draw_started');
});

test('theme đã lưu được áp trước khi hydrate (không nhấp nháy)', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nd:theme', 'light'));
  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForSelector('body');
  // Đọc ngay khi DOM có body: script beforeInteractive đã chạy.
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(theme).toBe('light');
});
