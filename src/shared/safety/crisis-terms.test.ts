import { describe, expect, it } from 'vitest';
import { mentionsCrisis } from './crisis-terms';

describe('mentionsCrisis', () => {
  it('nhận ra cụm từ khủng hoảng, không phân biệt hoa thường', () => {
    expect(mentionsCrisis('Dạo này mình KHÔNG MUỐN SỐNG nữa')).toBe(true);
    expect(mentionsCrisis('có lúc nghĩ đến tự tử')).toBe(true);
  });
  it('không báo nhầm văn bản bình thường', () => {
    expect(mentionsCrisis('Mình đang phân vân về công việc mới')).toBe(false);
    expect(mentionsCrisis('')).toBe(false);
    expect(mentionsCrisis('tự tửu')).toBe(false);
  });
});
