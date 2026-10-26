/** T22: bước 3 (xáo, chọn bài, gửi). Cần API + DB (dev server hoặc bản build). */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function toStep3(page: Page, spread: 'Một lá' | 'Ba lá' = 'Ba lá', intention?: string) {
  await page.goto('/draw', { waitUntil: 'networkidle' });
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('radio', { name: new RegExp(spread) }).click();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  if (intention) {
    await page.getByLabel('Ý niệm', { exact: true }).fill(intention);
    await page.getByRole('button', { name: 'Tiếp tục' }).click();
  } else {
    await page.getByRole('button', { name: 'Bỏ qua' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Hít một hơi. Chạm để xáo.' })).toBeVisible();
}

/** Chọn bằng bàn phím: ổn định trên cả dải (di động) lẫn quạt (desktop). */
async function pickByKeyboard(page: Page, count: number, start = 39) {
  await page.getByRole('option').nth(start).focus();
  for (let i = 0; i < count; i++) {
    await page.keyboard.press('Space');
    for (let k = 0; k < 7; k++) await page.keyboard.press('ArrowRight');
  }
}

test('xáo bài 1400ms rồi sang dải; chọn đủ mới bật "Lật bài"; aria-live báo số lá', async ({
  page,
}) => {
  await toStep3(page);
  const started = Date.now();
  await page.getByRole('button', { name: 'Xáo bài' }).click();
  await expect(page.getByRole('listbox', { name: '78 lá bài úp' })).toBeVisible();
  expect(Date.now() - started).toBeGreaterThanOrEqual(1000);
  await expect(page.getByRole('option')).toHaveCount(78);
  await expect(page.getByRole('button', { name: 'Chọn thêm 3 lá' })).toBeDisabled();
  await pickByKeyboard(page, 2);
  await expect(page.getByText('Đã chọn 2/3 lá')).toBeAttached();
  await expect(page.getByRole('button', { name: 'Chọn thêm 1 lá' })).toBeDisabled();
  await pickByKeyboard(page, 1, 5);
  await expect(page.getByRole('button', { name: 'Lật bài' })).toBeEnabled();
  await expect(page.getByRole('option', { selected: true })).toHaveCount(3);
});

test('bỏ chọn: Space lần nữa hoặc chạm vào ô', async ({ page }) => {
  await toStep3(page);
  await page.getByRole('button', { name: 'Bỏ qua xáo' }).click();
  await page.getByRole('option').nth(10).focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('option', { selected: true })).toHaveCount(1);
  await page.keyboard.press('Space');
  await expect(page.getByRole('option', { selected: true })).toHaveCount(0);
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: /QUÁ KHỨ|Quá khứ/ }).click();
  await expect(page.getByRole('option', { selected: true })).toHaveCount(0);
});

test('gửi thành công: chờ ≥1400ms, sang /reading/{id}?reveal=1, không gửi ý niệm khi không lưu', async ({
  page,
}) => {
  await toStep3(page, 'Ba lá', 'điều riêng tư');
  await page.getByRole('button', { name: 'Bỏ qua xáo' }).click();
  await pickByKeyboard(page, 3);
  const req = page.waitForRequest(
    (r) => r.url().endsWith('/api/readings') && r.method() === 'POST',
  );
  const started = Date.now();
  await page.getByRole('button', { name: 'Lật bài' }).click();
  const body = (await req).postDataJSON() as Record<string, unknown>;
  expect(body.spreadId).toBe('three');
  expect(body.intention).toBeUndefined();
  expect(body.pickedSlots).toHaveLength(3);
  await expect(page.getByRole('heading', { name: 'Đang xếp các vì sao…' })).toBeVisible();
  await page.waitForURL(/\/reading\/rd_[1-9A-HJ-NP-Za-km-z]{16}\?reveal=1$/);
  expect(Date.now() - started).toBeGreaterThanOrEqual(1400);
  expect(await page.evaluate(() => sessionStorage.getItem('nd:draft'))).toBeNull();
});

test('có bật lưu ý niệm thì gửi kèm ý niệm', async ({ page }) => {
  await page.goto('/draw', { waitUntil: 'networkidle' });
  await page.getByRole('radio', { name: /Một lá/ }).click();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByLabel('Ý niệm', { exact: true }).fill('giữ lại nhé');
  await page.getByRole('switch', { name: 'Lưu ý niệm này cùng bản đọc' }).click();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.getByRole('button', { name: 'Bỏ qua xáo' }).click();
  await pickByKeyboard(page, 1);
  const req = page.waitForRequest(
    (r) => r.url().endsWith('/api/readings') && r.method() === 'POST',
  );
  await page.getByRole('button', { name: 'Lật bài' }).click();
  const body = (await req).postDataJSON() as Record<string, unknown>;
  expect(body).toMatchObject({
    spreadId: 'single',
    intention: 'giữ lại nhé',
    storeIntention: true,
  });
});

test('mất mạng: toast ngoại tuyến, giữ lá đã chọn, nút thành "Thử lại"', async ({ page }) => {
  await toStep3(page);
  await page.getByRole('button', { name: 'Bỏ qua xáo' }).click();
  await pickByKeyboard(page, 3);
  await page.route('**/api/readings', (route) => route.abort('internetdisconnected'));
  await page.getByRole('button', { name: 'Lật bài' }).click();
  await expect(page.getByText('Có vẻ bạn đang ngoại tuyến.').first()).toBeVisible();
  await expect(page.getByRole('option', { selected: true })).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Thử lại' })).toBeEnabled();
});

test('bị giới hạn tần suất: thông điệp riêng', async ({ page }) => {
  await toStep3(page, 'Một lá');
  await page.getByRole('button', { name: 'Bỏ qua xáo' }).click();
  await pickByKeyboard(page, 1);
  await page.route('**/api/readings', (route) =>
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'x' } }),
    }),
  );
  await page.getByRole('button', { name: 'Lật bài' }).click();
  await expect(
    page
      .getByText('Bạn đã rút nhiều lần trong thời gian ngắn. Hãy nghỉ một lát rồi quay lại nhé.')
      .first(),
  ).toBeVisible();
});

test('giảm chuyển động: xáo xong ngay', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await toStep3(page);
  await page.getByRole('button', { name: 'Xáo bài' }).click();
  await expect(page.getByRole('listbox')).toBeVisible({ timeout: 500 });
});

test('axe sạch ở bước 3', async ({ page }) => {
  await toStep3(page);
  await page.getByRole('button', { name: 'Bỏ qua xáo' }).click();
  const r = await new AxeBuilder({ page }).analyze();
  expect(
    r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id),
  ).toEqual([]);
});
