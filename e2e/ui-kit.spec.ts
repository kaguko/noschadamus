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
  await expect(page.getByText('Đã cắt bớt cho vừa 280 ký tự.')).toBeVisible();
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
