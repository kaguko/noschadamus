import { describe, expect, it } from 'vitest';
import { AXIS_ORDER } from '../../src/shared/kernel/axes';
import { MINOR_RANKS, SUITS } from '../../src/contexts/tarot/domain/card';
import { minorName, minorVector } from './minor-cards';

describe('minorVector (docs/02 mục 4)', () => {
  it('cups-ace', () => {
    expect(minorVector('cups', 'ace')).toEqual({
      energy: 0.37,
      emotion: 0.994,
      connection: 0.916,
      grounding: 0.435,
      mind: 0.344,
      change: 0.37,
    });
  });
  it('swords-5', () => {
    expect(minorVector('swords', '5')).toEqual({
      energy: 0.57,
      emotion: 0.22,
      connection: 0.108,
      grounding: 0.332,
      mind: 0.864,
      change: 0.64,
    });
  });
  it('pentacles-king', () => {
    expect(minorVector('pentacles', 'king')).toEqual({
      energy: 0.4,
      emotion: 0.4,
      connection: 0.6,
      grounding: 0.8,
      mind: 0.65,
      change: 0.25,
    });
  });
  it('mọi lá phụ có vector trong [0,1]', () => {
    for (const s of SUITS)
      for (const r of MINOR_RANKS) {
        const v = minorVector(s, r);
        for (const a of AXIS_ORDER) expect(v[a]).toBeGreaterThanOrEqual(0);
        for (const a of AXIS_ORDER) expect(v[a]).toBeLessThanOrEqual(1);
      }
  });
  it('tên', () => {
    expect(minorName('cups', 'ace')).toEqual({ vi: 'Át Cốc', en: 'Ace of Cups' });
    expect(minorName('swords', 'knight')).toEqual({ vi: 'Hiệp Sĩ Kiếm', en: 'Knight of Swords' });
  });
});
