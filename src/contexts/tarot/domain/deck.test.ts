import { describe, expect, it } from 'vitest';
import { seededRandomSource } from '@/shared/kernel/seeded-random';
import { draw } from './deck';
import { fakeDeck, SINGLE, THREE } from './test-fixtures';

describe('draw', () => {
  it('đủ số lá theo trải bài, không trùng', () => {
    for (let seed = 0; seed < 200; seed++) {
      const r = draw(fakeDeck(), THREE, { allowReversed: true }, seededRandomSource(seed));
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(r.value).toHaveLength(3);
      expect(new Set(r.value.map((c) => c.cardId)).size).toBe(3);
    }
    const one = draw(fakeDeck(), SINGLE, { allowReversed: true }, seededRandomSource(1));
    expect(one.ok && one.value.length).toBe(1);
  });

  it('allowReversed = false → luôn xuôi', () => {
    for (let seed = 0; seed < 100; seed++) {
      const r = draw(fakeDeck(), THREE, { allowReversed: false }, seededRandomSource(seed));
      expect(r.ok && r.value.every((c) => c.orientation === 'upright')).toBe(true);
    }
  });

  it('allowReversed = true → xuất hiện cả hai hướng', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const r = draw(fakeDeck(), THREE, { allowReversed: true }, seededRandomSource(seed));
      if (r.ok) r.value.forEach((c) => seen.add(c.orientation));
    }
    expect(seen).toEqual(new Set(['upright', 'reversed']));
  });

  it('cùng chuỗi ngẫu nhiên → cùng kết quả', () => {
    const a = draw(fakeDeck(), THREE, { allowReversed: true }, seededRandomSource(42));
    const b = draw(fakeDeck(), THREE, { allowReversed: true }, seededRandomSource(42));
    expect(a).toEqual(b);
  });

  it('bộ bài khác 78 lá hoặc có id trùng → DECK_INCOMPLETE', () => {
    expect(draw(fakeDeck(77), THREE, { allowReversed: true }, seededRandomSource(1))).toEqual({
      ok: false,
      error: 'DECK_INCOMPLETE',
    });
    const dup = fakeDeck();
    dup[5] = { ...dup[5]!, id: dup[4]!.id };
    expect(draw(dup, THREE, { allowReversed: true }, seededRandomSource(1)).ok).toBe(false);
  });

  it('mỗi lá có cơ hội như nhau ở vị trí đầu (chi-square)', () => {
    const counts = new Map<string, number>();
    const n = 78 * 400;
    const rng = seededRandomSource(7);
    const deck = fakeDeck();
    for (let i = 0; i < n; i++) {
      const r = draw(deck, SINGLE, { allowReversed: false }, rng);
      if (r.ok) counts.set(r.value[0]!.cardId, (counts.get(r.value[0]!.cardId) ?? 0) + 1);
    }
    const expected = n / 78;
    let chi2 = (78 - counts.size) * expected;
    for (const c of counts.values()) chi2 += (c - expected) ** 2 / expected;
    // df = 77; ngưỡng p = 0.001 ≈ 122.1
    expect(chi2).toBeLessThan(122.1);
  });
});
