import { describe, expect, it } from 'vitest';
import { seededRandomSource, sequenceRandomSource } from '@/shared/kernel/seeded-random';
import { randomInt } from './random-int';

describe('randomInt', () => {
  it('bỏ giá trị vượt ngưỡng rồi trả giá trị hợp lệ', () => {
    // max = 3 → limit = floor(2^32 / 3) * 3 = 4294967295, nên 0xFFFFFFFF bị loại
    const rng = sequenceRandomSource([0xffffffff, 0]);
    expect(randomInt(rng, 3)).toBe(0);
  });

  it('với max = 1 luôn trả 0', () => {
    expect(randomInt(seededRandomSource(1), 1)).toBe(0);
  });

  it('từ chối tham số không hợp lệ', () => {
    const rng = seededRandomSource(1);
    expect(() => randomInt(rng, 0)).toThrow(RangeError);
    expect(() => randomInt(rng, 2.5)).toThrow(RangeError);
  });

  it('phân phối đều (chi-square, 100k mẫu, hạt cố định)', () => {
    const rng = seededRandomSource(20261025);
    const k = 6;
    const n = 100_000;
    const counts = new Array<number>(k).fill(0);
    for (let i = 0; i < n; i++) counts[randomInt(rng, k)]!++;
    const expected = n / k;
    const chi2 = counts.reduce((s, c) => s + (c - expected) ** 2 / expected, 0);
    // df = 5; ngưỡng p = 0.001 là 20.52
    expect(chi2).toBeLessThan(20.52);
  });
});
