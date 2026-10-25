import { describe, expect, it } from 'vitest';
import { findBannedTerms } from './banned-terms';

const TERMS = ['nghiệp chướng', 'định mệnh', 'bạn phải'];

describe('findBannedTerms', () => {
  it('phát hiện cụm cấm, không phân biệt hoa thường', () => {
    expect(findBannedTerms('Đây là Định Mệnh của bạn.', TERMS)).toEqual(['định mệnh']);
  });
  it('chỉ khớp trọn âm tiết', () => {
    expect(findBannedTerms('Bạn phảiii làm gì?', TERMS)).toEqual([]);
    expect(findBannedTerms('sự nghiệp của bạn', TERMS)).toEqual([]);
  });
  it('văn bản sạch trả rỗng', () => {
    expect(findBannedTerms('Lá bài gợi ý một hướng nhìn.', TERMS)).toEqual([]);
  });
});
