/** T23: trang kết quả /reading/[id]. Cần API + DB. */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function createReading(page: Page, body: Record<string, unknown> = { spreadId: 'three' }) {
  const base = new URL(
    page.url() === 'about:blank' ? (test.info().project.use.baseURL ?? '') : page.url(),
  ).origin;
  const res = await page.request.post('/api/readings', {
    data: body,
    headers: { origin: base, 'x-forwarded-for': `198.51.100.${Math.floor(Math.random() * 250)}` },
  });
  expect(res.status()).toBe(201);
  return (await res.json()) as { id: string; path: string };
}

test('trình tự lần đầu: ba lá lật cách nhau ~700ms, bỏ ?reveal khi xong', async ({ page }) => {
  await page.goto('/');
  const { path } = await createReading(page);
  // Ghi thời điểm từng lá lật ngay trong trang (không phụ thuộc độ trễ của test).
  await page.addInitScript(() => {
    const w = window as unknown as { __flips: number[] };
    w.__flips = [];
    new MutationObserver((ms) => {
      for (const m of ms) {
        const el = m.target as HTMLElement;
        if (m.attributeName === 'data-face' && el.dataset.face === 'up' && el.offsetParent) {
          w.__flips.push(performance.now());
        }
      }
    }).observe(document, { attributes: true, subtree: true, attributeFilter: ['data-face'] });
  });
  await page.goto(`${path}?reveal=1`);
  await expect(page.locator('main [data-face="up"]:visible')).toHaveCount(3, { timeout: 5000 });
  const flips = await page.evaluate(() => (window as unknown as { __flips: number[] }).__flips);
  expect(flips).toHaveLength(3);
  for (const gap of [flips[1]! - flips[0]!, flips[2]! - flips[1]!]) {
    expect(gap).toBeGreaterThan(550);
    expect(gap).toBeLessThan(850);
  }
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${path}$`), { timeout: 6000 });
});

test('chạm để bỏ qua: nhảy ngay tới trạng thái cuối', async ({ page }) => {
  await page.goto('/');
  const { path } = await createReading(page);
  await page.goto(`${path}?reveal=1`, { waitUntil: 'networkidle' });
  await page.mouse.click(5, 300);
  await expect(page.locator('main [data-face="up"]:visible')).toHaveCount(3, { timeout: 1000 });
});

test('xem lại (không ?reveal): trạng thái cuối ngay, không hoạt ảnh', async ({ page }) => {
  await page.goto('/');
  const { path } = await createReading(page);
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main [data-face="up"]:visible')).toHaveCount(3, { timeout: 1500 });
  await expect(page.locator('main figure svg').first()).toHaveAttribute('data-state', 'done');
});

test('không phải chủ → HTTP 404; id lạ → 404', async ({ page, browser }) => {
  await page.goto('/');
  const { path } = await createReading(page);
  const stranger = await browser.newContext();
  const res = await (await stranger.newPage()).goto(test.info().project.use.baseURL + path);
  expect(res?.status()).toBe(404);
  await stranger.close();
  const res2 = await page.goto('/reading/rd_AAAAAAAAAAAAAAAA');
  expect(res2?.status()).toBe(404);
  await expect(page.getByText('Lá bài này đã lạc đường')).toBeVisible();
});

test('ý niệm: hiện khi đã lưu, không có khi không lưu', async ({ page }) => {
  await page.goto('/');
  const kept = await createReading(page, {
    spreadId: 'single',
    intention: 'giữ điều này',
    storeIntention: true,
  });
  await page.goto(kept.path);
  await expect(page.getByText('giữ điều này')).toBeVisible();
  const dropped = await createReading(page, {
    spreadId: 'single',
    intention: 'bỏ điều này',
    storeIntention: false,
  });
  await page.goto(dropped.path);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText('bỏ điều này')).toHaveCount(0);
  await expect(page.getByText('Ý NIỆM CỦA BẠN')).toHaveCount(0);
});

test('phóng to lá bài bằng hộp thoại; axe sạch', async ({ page }) => {
  await page.goto('/');
  const { path } = await createReading(page);
  await page.goto(path, { waitUntil: 'networkidle' });
  await page
    .getByRole('button', { name: /Phóng to lá/ })
    .first()
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.waitForTimeout(400);
  const r = await new AxeBuilder({ page }).analyze();
  expect(
    r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id),
  ).toEqual([]);
});
