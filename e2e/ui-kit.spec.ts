/**
 * T16: UI kit. Trang /dev/ui chỉ có ở dev, nên chạy với dev server:
 *   E2E_BASE_URL=http://localhost:3100 npx playwright test e2e/ui-kit.spec.ts
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.skip(
  !process.env.E2E_BASE_URL,
  'Cần dev server (E2E_BASE_URL) vì /dev/ui không có ở production',
);

for (const theme of ['dark', 'light'] as const) {
  test(`axe: không lỗi serious/critical (${theme})`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('nd:theme', t), theme);
    await page.goto('/dev/ui', { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page }).analyze();
    const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
}

test('SpreadOption: mũi tên chuyển lựa chọn (radiogroup)', async ({ page }) => {
  await page.goto('/dev/ui', { waitUntil: 'networkidle' });
  const group = page.getByRole('radiogroup', { name: 'Chọn trải bài' });
  const first = group.getByRole('radio').first();
  await first.focus();
  await page.keyboard.press('ArrowDown');
  await expect(group.getByRole('radio', { name: /Ba lá/ })).toHaveAttribute('aria-checked', 'true');
  await expect(group.getByRole('radio', { name: /Ba lá/ })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(group.getByRole('radio', { name: /Một lá/ })).toHaveAttribute(
    'aria-checked',
    'true',
  );
});

test('Sheet: mở, Esc đóng, focus trả về nút gọi; Tabs dùng mũi tên', async ({ page }) => {
  await page.goto('/dev/ui', { waitUntil: 'networkidle' });
  const opener = page.getByRole('button', { name: 'Mở chia sẻ' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Chia sẻ bản đồ của bạn' });
  await expect(dialog).toBeVisible();

  const story = dialog.getByRole('tab', { name: 'Story' });
  await story.focus();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByRole('tab', { name: 'Bài đăng' })).toHaveAttribute(
    'aria-selected',
    'true',
  );

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('Switch: Space bật/tắt; switch lưu ý niệm tắt khi chưa có chữ', async ({ page }) => {
  await page.goto('/dev/ui', { waitUntil: 'networkidle' });
  const reversed = page.getByRole('switch', { name: 'Bao gồm bài ngược' });
  await expect(reversed).toHaveAttribute('aria-checked', 'true');
  await reversed.focus();
  await page.keyboard.press('Space');
  await expect(reversed).toHaveAttribute('aria-checked', 'false');

  const store = page.getByRole('switch', { name: 'Lưu ý niệm này cùng bản đọc' });
  await expect(store).toBeDisabled();
  await page.getByLabel('Ý niệm', { exact: true }).fill('một điều');
  await expect(store).toBeEnabled();
});

test('Textarea: dán quá 280 ký tự bị cắt và có thông báo', async ({ page }) => {
  await page.goto('/dev/ui', { waitUntil: 'networkidle' });
  const area = page.getByLabel('Ý niệm', { exact: true });
  await area.fill('ệ'.repeat(400));
  await expect(area).toHaveValue('ệ'.repeat(280));
  // Radix Toast nhân đôi nội dung vào vùng aria-live ẩn, nên lấy phần tử đầu.
  await expect(page.getByText('Đã cắt bớt cho vừa 280 ký tự.').first()).toBeVisible();
});

test('Accordion: Enter mở, chỉ một mục mở một lúc', async ({ page }) => {
  await page.goto('/dev/ui', { waitUntil: 'networkidle' });
  const q1 = page.getByRole('button', { name: 'Có đoán đúng tương lai không?' });
  const q2 = page.getByRole('button', { name: 'Bạn lưu gì về tôi?' });
  await q1.focus();
  await page.keyboard.press('Enter');
  await expect(q1).toHaveAttribute('aria-expanded', 'true');
  await q2.click();
  await expect(q2).toHaveAttribute('aria-expanded', 'true');
  await expect(q1).toHaveAttribute('aria-expanded', 'false');
});

test.describe('TarotCard (T17)', () => {
  test('lật 3D kéo dài 700 ms, xong thì gọi onFlipEnd', async ({ page }) => {
    await page.goto('/dev/ui', { waitUntil: 'networkidle' });
    const row = page.getByTestId('flip-row');
    await page.getByRole('button', { name: 'Lật bài' }).click();
    const durations = await row.evaluate((el) =>
      el
        .getAnimations({ subtree: true })
        .map((a) => (a.effect as KeyframeEffect).getTiming().duration),
    );
    expect(durations).toEqual([700, 700, 700]);
    await expect(page.getByTestId('flip-count')).toHaveText('Đã lật xong: 3', { timeout: 3000 });
    await expect(row.locator('[data-face="up"]')).toHaveCount(3);
  });

  test('giảm chuyển động: mờ chéo 150 ms thay cho lật', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/dev/ui', { waitUntil: 'networkidle' });
    const row = page.getByTestId('flip-row');
    await page.getByRole('button', { name: 'Lật bài' }).click();
    const timings = await row.evaluate((el) =>
      el
        .getAnimations({ subtree: true })
        .map((a) => (a.effect as KeyframeEffect).getTiming().duration),
    );
    expect(timings.every((d) => d === 150)).toBe(true);
    await expect(page.getByTestId('flip-count')).toHaveText('Đã lật xong: 3', { timeout: 3000 });
  });

  test('lá ngược: chỉ xoay mặt trước, khung giữ nguyên; tên truy cập có hậu tố ngược', async ({
    page,
  }) => {
    await page.goto('/dev/ui', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Lật bài' }).click();
    const row = page.getByTestId('flip-row');
    const tower = row.getByRole('img', { name: 'Tòa Tháp, ngược' });
    await expect(tower).toBeVisible();
    await expect(row.getByRole('img', { name: 'Chàng Khờ', exact: true })).toBeVisible();
    const inner = tower.locator('div').first();
    await expect(inner).toHaveClass(/rotate-180/);
    const card = row.locator('[data-face]').nth(1);
    const transform = await card.evaluate((el) => getComputedStyle(el).transform);
    expect(transform).toBe('none');
  });
});
