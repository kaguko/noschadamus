/** T21: luồng rút bài bước 1-2. */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function toStep2(page: Page) {
  await page.goto('/draw', { waitUntil: 'networkidle' });
  await page.getByRole('radio', { name: /Ba lá/ }).click();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await expect(page.getByRole('heading', { name: 'Bạn đang mang theo điều gì?' })).toBeFocused();
}

test('bước 1: nút Tiếp tục tắt đến khi chọn; footer ẩn', async ({ page }) => {
  await page.goto('/draw', { waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: 'Tiếp tục' })).toBeDisabled();
  await expect(page.locator('footer')).toBeHidden();
  await page.getByRole('radio', { name: /Một lá/ }).click();
  await expect(page.getByRole('button', { name: 'Tiếp tục' })).toBeEnabled();
});

test('F5 giữ nguyên bản nháp (bước, ý niệm, công tắc)', async ({ page }) => {
  await toStep2(page);
  await page.getByLabel('Ý niệm', { exact: true }).fill('một điều nhỏ');
  await page.getByRole('switch', { name: 'Lưu ý niệm này cùng bản đọc' }).click();
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByLabel('Ý niệm', { exact: true })).toHaveValue('một điều nhỏ');
  await expect(page.getByRole('switch', { name: 'Lưu ý niệm này cùng bản đọc' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(page.getByText('BƯỚC 2/3')).toBeVisible();
});

test('xóa hết chữ → công tắc lưu ý niệm tự tắt; nút đổi Bỏ qua/Tiếp tục', async ({ page }) => {
  await toStep2(page);
  const area = page.getByLabel('Ý niệm', { exact: true });
  const store = page.getByRole('switch', { name: 'Lưu ý niệm này cùng bản đọc' });
  await expect(page.getByRole('button', { name: 'Bỏ qua' })).toBeVisible();
  await area.fill('abc');
  await expect(page.getByRole('button', { name: 'Tiếp tục' })).toBeVisible();
  await store.click();
  await expect(store).toHaveAttribute('aria-checked', 'true');
  await area.fill('');
  await expect(store).toHaveAttribute('aria-checked', 'false');
  await expect(store).toBeDisabled();
});

test('dán 400 ký tự → cắt còn 280 và có toast', async ({ page }) => {
  await toStep2(page);
  await page.getByLabel('Ý niệm', { exact: true }).fill('a'.repeat(400));
  await expect(page.getByLabel('Ý niệm', { exact: true })).toHaveValue('a'.repeat(280));
  await expect(page.getByText('Đã cắt bớt cho vừa 280 ký tự.').first()).toBeVisible();
});

test('thông điệp quan tâm hiện khi có cụm từ khủng hoảng, KHÔNG gọi mạng', async ({ page }) => {
  await toStep2(page);
  const requests: string[] = [];
  page.on('request', (r) => requests.push(`${r.method()} ${r.url()} ${r.postData() ?? ''}`));
  await page.getByLabel('Ý niệm', { exact: true }).fill('dạo này mình không muốn sống nữa');
  await expect(page.getByTestId('care-note')).toBeVisible();
  await page.waitForTimeout(500);
  expect(requests.filter((r) => !r.includes('/_next/'))).toEqual([]);
  expect(requests.join('\n')).not.toContain('muốn sống');
});

test('analytics: spread_selected, intention_entered{hasText}; không gửi nội dung ý niệm', async ({
  page,
}) => {
  const events: { name: string; props: Record<string, unknown> }[] = [];
  await page.route('**/api/events', async (route) => {
    events.push(route.request().postDataJSON());
    await route.fulfill({ status: 204 });
  });
  await toStep2(page);
  await page.getByLabel('Ý niệm', { exact: true }).fill('bí mật');
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await expect
    .poll(() => events.map((e) => e.name))
    .toEqual(['spread_selected', 'intention_entered']);
  expect(events[0]!.props).toEqual({ spreadId: 'three' });
  expect(events[1]!.props).toEqual({ hasText: true });
  expect(JSON.stringify(events)).not.toContain('bí mật');
});

test('bàn phím: chọn trải bài bằng mũi tên, Enter tiếp tục, nút quay lại', async ({ page }) => {
  await page.goto('/draw', { waitUntil: 'networkidle' });
  await page.getByRole('radio', { name: /Một lá/ }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('radio', { name: /Ba lá/ })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('button', { name: 'Tiếp tục' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('BƯỚC 2/3')).toBeVisible();
  await page.getByRole('button', { name: 'Quay lại' }).click();
  await expect(page.getByText('BƯỚC 1/3')).toBeVisible();
});

test('axe sạch ở bước 1 và 2', async ({ page }) => {
  await page.goto('/draw', { waitUntil: 'networkidle' });
  const check = async () => {
    const r = await new AxeBuilder({ page }).analyze();
    return r.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => v.id);
  };
  expect(await check()).toEqual([]);
  await page.getByRole('radio', { name: /Ba lá/ }).click();
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  expect(await check()).toEqual([]);
});
