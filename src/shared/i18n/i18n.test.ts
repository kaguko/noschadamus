import { describe, expect, it } from 'vitest';
import vi from '../../../messages/vi.json';
import { formatDate, t, translate } from '.';

describe('i18n', () => {
  it('lấy chuỗi theo khóa lồng nhau và điền tham số', () => {
    expect(t('draw.step_label', { current: 2, total: 3 })).toBe('BƯỚC 2/3');
    expect(t('landing.cta')).toBe('Rút bài ngay');
  });

  it('giữ nguyên chỗ trống nếu thiếu tham số', () => {
    expect(t('draw.s3.picked', { k: 1 })).toBe('Đã chọn 1/{n}');
  });

  it('khóa sai → lỗi rõ ràng (khóa động)', () => {
    expect(() => translate(vi, 'khong.ton.tai')).toThrow(/Thiếu chuỗi giao diện/);
  });

  it('khóa sai bị chặn ở mức kiểu', () => {
    // @ts-expect-error: khóa không có trong messages/vi.json phải là lỗi biên dịch
    expect(() => t('landing.khong_co')).toThrow();
  });

  it('mọi giá trị là chuỗi không rỗng; chỗ trống {x} hợp lệ', () => {
    const walk = (node: unknown, path: string): void => {
      if (typeof node === 'string') {
        expect(node.trim().length, path).toBeGreaterThan(0);
        expect(node, path).not.toMatch(/\{[^}]*\s[^}]*\}/);
        return;
      }
      for (const [k, v] of Object.entries(node as object)) walk(v, path ? `${path}.${k}` : k);
    };
    walk(vi, '');
  });

  it('định dạng ngày dd.MM.yyyy', () => {
    expect(formatDate('2026-10-25T14:03:22.000Z', 'UTC')).toBe('25.10.2026');
    expect(formatDate('2026-10-25T20:00:00.000Z', 'Asia/Ho_Chi_Minh')).toBe('26.10.2026');
  });
});
