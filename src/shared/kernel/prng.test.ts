import { describe, expect, it } from 'vitest';
import { fnv1a, mulberry32 } from './prng';

describe('prng', () => {
  it('fnv1a khớp giá trị chuẩn', () => {
    expect(fnv1a('')).toBe(0x811c9dc5);
    expect(fnv1a('a')).toBe(0xe40c292c);
    expect(fnv1a('foobar')).toBe(0xbf9cf968);
  });
  it('mulberry32 tất định và trong [0,1)', () => {
    const a = mulberry32(7),
      b = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});
