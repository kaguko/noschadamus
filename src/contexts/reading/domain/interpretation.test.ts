import { describe, expect, it } from 'vitest';
import { AXIS_ORDER, type AxisId, type AxisVector } from '@/shared/kernel/axes';
import { findBannedTerms } from '@/shared/kernel/banned-terms';
import { AXIS_TEXTS, BANNED_TERMS } from '@/test-support/reading-data';
import { composeInterpretation } from './interpretation';
import type { SoulMap } from './soul-map';

const v = (x: number): AxisVector =>
  Object.fromEntries(AXIS_ORDER.map((a) => [a, x])) as unknown as AxisVector;

const map = (dominant: AxisId, second: AxisId, quiet: AxisId): SoulMap => ({
  vector: v(0.5),
  dominant,
  second,
  quiet,
  perCard: [v(0.5)],
});

const PROMPTS = [
  ['A0?', 'A1?'],
  ['B0?', 'B1?'],
  ['C0?', 'C1?'],
] as const;

describe('composeInterpretation', () => {
  it('ví dụ vàng 2: tiêu đề, tagline, tổng hợp', () => {
    const out = composeInterpretation({
      readingId: 'rd_golden',
      spreadId: 'three',
      cardPrompts: PROMPTS,
      soulMap: map('energy', 'change', 'grounding'),
      texts: AXIS_TEXTS,
    });
    expect(out.interpretation.title).toBe('Ngọn Lửa Dịch Chuyển');
    expect(out.interpretation.tagline).toBe(AXIS_TEXTS.taglines.energy);
    expect(out.interpretation.synthesis).toBe(
      `${AXIS_TEXTS.insights.energy} ${AXIS_TEXTS.invites.grounding}`,
    );
    expect(AXIS_TEXTS.dominantPrompts.energy).toContain(out.interpretation.closingPrompts[0]);
    expect(AXIS_TEXTS.quietPrompts.grounding).toContain(out.interpretation.closingPrompts[1]);
    expect(out.chosenCardPrompts).toHaveLength(3);
    out.chosenCardPrompts.forEach((p, i) => expect(PROMPTS[i]).toContain(p));
  });

  it('trải một lá thêm câu mở đầu', () => {
    const out = composeInterpretation({
      readingId: 'rd_x',
      spreadId: 'single',
      cardPrompts: [PROMPTS[0]],
      soulMap: map('mind', 'emotion', 'energy'),
      texts: AXIS_TEXTS,
    });
    expect(out.interpretation.synthesis.startsWith(AXIS_TEXTS.singleSpreadPrefix + ' ')).toBe(true);
  });

  it('tất định theo readingId, và các id khác nhau cho ra lựa chọn khác nhau', () => {
    const run = (id: string) =>
      composeInterpretation({
        readingId: id,
        spreadId: 'three',
        cardPrompts: PROMPTS,
        soulMap: map('emotion', 'connection', 'mind'),
        texts: AXIS_TEXTS,
      });
    expect(run('rd_abc')).toEqual(run('rd_abc'));
    const variants = new Set(
      Array.from({ length: 50 }, (_, i) => JSON.stringify(run(`rd_${i}`).chosenCardPrompts)),
    );
    expect(variants.size).toBeGreaterThan(4);
  });

  it('R10: không văn bản sinh ra nào chứa từ cấm (mọi tổ hợp trục)', () => {
    for (const d of AXIS_ORDER)
      for (const s of AXIS_ORDER)
        for (const q of AXIS_ORDER) {
          if (d === s || d === q) continue;
          for (const spreadId of ['single', 'three'] as const) {
            const out = composeInterpretation({
              readingId: `rd_${d}${s}${q}`,
              spreadId,
              cardPrompts: PROMPTS,
              soulMap: map(d, s, q),
              texts: AXIS_TEXTS,
            });
            const all = [
              out.interpretation.title,
              out.interpretation.tagline,
              out.interpretation.synthesis,
              ...out.interpretation.closingPrompts,
            ].join(' \n ');
            expect(findBannedTerms(all, BANNED_TERMS)).toEqual([]);
          }
        }
    const allTexts = JSON.stringify(AXIS_TEXTS);
    expect(findBannedTerms(allTexts, BANNED_TERMS)).toEqual([]);
  });
});
