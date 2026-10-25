import { describe, expect, it } from 'vitest';
import type { AxisVector } from '@/shared/kernel/axes';
import { AXIS_TEXTS } from '@/test-support/reading-data';
import {
  assembleReading,
  normalizeIntention,
  revokeShare,
  shareReading,
  type DrawnCardSource,
  type Reading,
} from './reading';

const V: AxisVector = {
  energy: 0.6,
  emotion: 0.4,
  connection: 0.5,
  grounding: 0.3,
  mind: 0.7,
  change: 0.2,
};

const source = (i: number, id = `card-${i}`): DrawnCardSource => ({
  position: { index: i, key: `p${i}`, labelVi: `Vị trí ${i}`, descriptionVi: '', weight: 1 },
  cardId: id,
  nameVi: `Lá ${i}`,
  nameEn: `Card ${i}`,
  arcana: 'major',
  suit: null,
  number: i,
  orientation: i % 2 ? 'reversed' : 'upright',
  keywords: ['a', 'b', 'c'],
  meaning: 'nghĩa',
  prompts: [`câu ${i}a?`, `câu ${i}b?`],
  effectiveVector: V,
});

const base = {
  id: 'rd_test',
  createdAt: new Date('2026-10-25T00:00:00Z'),
  spreadId: 'three' as const,
  allowReversed: true,
  expectedCount: 3,
  cards: [source(0), source(1), source(2)],
  texts: AXIS_TEXTS,
};

const build = (
  over: Partial<typeof base> & { intention?: string; storeIntention?: boolean } = {},
) => {
  const r = assembleReading({ ...base, ...over });
  if (!r.ok) throw new Error(r.error);
  return r.value;
};

describe('assembleReading', () => {
  it('dựng snapshot, Soul Map, diễn giải', () => {
    const r = build();
    expect(r.cards).toHaveLength(3);
    expect(r.cards[1]!.orientation).toBe('reversed');
    expect(['câu 1a?', 'câu 1b?']).toContain(r.cards[1]!.prompt);
    expect(r.soulMap.dominant).toBe('mind');
    expect(r.interpretation.title).toBe('Ngọn Đèn Bừng Sáng');
    expect(r.share).toBeNull();
  });

  it('R1: sai số lá hoặc lá trùng → INVALID_DRAW', () => {
    expect(assembleReading({ ...base, cards: [source(0), source(1)] })).toEqual({
      ok: false,
      error: 'INVALID_DRAW',
    });
    expect(
      assembleReading({ ...base, cards: [source(0), source(1, 'card-0'), source(2)] }).ok,
    ).toBe(false);
  });

  it('R2: nội dung bị đóng băng sâu', () => {
    const r = build();
    expect(Object.isFrozen(r)).toBe(true);
    expect(Object.isFrozen(r.cards[0])).toBe(true);
    expect(Object.isFrozen(r.soulMap.vector)).toBe(true);
    expect(() => {
      (r.cards[0] as { meaning: string }).meaning = 'sửa';
    }).toThrow(TypeError);
    expect(() => {
      // @ts-expect-error: thuộc tính readonly không gán được ở mức kiểu
      r.interpretation = r.interpretation;
    }).toThrow(TypeError);
  });

  it('R7: ý niệm chỉ lưu khi đồng ý, cắt khoảng trắng, tối đa 280 ký tự', () => {
    expect(build({ intention: '  điều gì đó  ', storeIntention: false }).intention).toBeNull();
    expect(build({ intention: '  điều gì đó  ', storeIntention: true }).intention).toBe(
      'điều gì đó',
    );
    expect(build({ intention: '   ', storeIntention: true }).intention).toBeNull();
    expect(assembleReading({ ...base, intention: 'a'.repeat(281), storeIntention: true })).toEqual({
      ok: false,
      error: 'INTENTION_TOO_LONG',
    });
    expect(normalizeIntention('ệ'.repeat(280), true).ok).toBe(true);
  });
});

describe('chia sẻ', () => {
  const now = new Date('2026-10-26T00:00:00Z');
  it('R6/R8: idempotent; thu hồi rồi chia sẻ lại dùng token mới', () => {
    const r: Reading = build();
    const s1 = shareReading(r, 'tokA', now);
    expect(s1.share).toEqual({ token: 'tokA', sharedAt: now });
    expect(shareReading(s1, 'tokB', now)).toBe(s1);
    const revoked = revokeShare(s1);
    expect(revoked.share).toBeNull();
    expect(revokeShare(revoked)).toBe(revoked);
    const s2 = shareReading(revoked, 'tokC', now);
    expect(s2.share?.token).toBe('tokC');
    expect(s2.share?.token).not.toBe('tokA');
    expect(s2.cards).toBe(r.cards);
    expect(Object.isFrozen(s2)).toBe(true);
  });
});
