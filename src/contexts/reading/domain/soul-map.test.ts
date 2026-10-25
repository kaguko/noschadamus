import { describe, expect, it } from 'vitest';
import { reversedVector } from '@/contexts/tarot/domain/reversed-vector';
import { AXIS_ORDER, type AxisVector } from '@/shared/kernel/axes';
import { AXIS_TEXTS, majorVector } from '@/test-support/reading-data';
import { archetypeTitle } from './axis-texts';
import { computeSoulMap } from './soul-map';

const flat = (x: number): AxisVector =>
  Object.fromEntries(AXIS_ORDER.map((a) => [a, x])) as unknown as AxisVector;

describe('computeSoulMap', () => {
  it('Ví dụ vàng 2: Chàng Khờ xuôi, Tòa Tháp xuôi, Ngôi Sao ngược', () => {
    const map = computeSoulMap([
      { weight: 0.8, vector: majorVector('major-00') },
      { weight: 1.2, vector: majorVector('major-16') },
      { weight: 1.0, vector: reversedVector(majorVector('major-17')) },
    ]);
    expect(map.vector).toEqual({
      energy: 0.8356,
      emotion: 0.5489,
      connection: 0.3556,
      grounding: 0.2822,
      mind: 0.4122,
      change: 0.8256,
    });
    expect(map.dominant).toBe('energy');
    expect(map.second).toBe('change');
    expect(map.quiet).toBe('grounding');
    expect(archetypeTitle(map.dominant, map.second, AXIS_TEXTS)).toBe('Ngọn Lửa Dịch Chuyển');
    expect(map.perCard).toHaveLength(3);
    expect(map.perCard[2]).toEqual({
      energy: 0.7667,
      emotion: 0.3667,
      connection: 0.4667,
      grounding: 0.6667,
      mind: 0.6167,
      change: 0.6167,
    });
  });

  it('một lá: bản đồ bằng chính vector của lá', () => {
    const v = majorVector('major-19');
    const map = computeSoulMap([{ weight: 1, vector: v }]);
    expect(map.vector).toEqual(v);
    expect(map.dominant).toBe('energy');
  });

  it('hòa trục: theo AXIS_ORDER', () => {
    const v = { ...flat(0.5), emotion: 0.9, mind: 0.9, connection: 0.1, change: 0.1 };
    const map = computeSoulMap([{ weight: 1, vector: v }]);
    expect(map.dominant).toBe('emotion');
    expect(map.second).toBe('mind');
    expect(map.quiet).toBe('connection');
  });

  it('mọi trục bằng nhau: quiet là trục cuối khác dominant', () => {
    const map = computeSoulMap([{ weight: 1, vector: flat(0.5) }]);
    expect(map.dominant).toBe('energy');
    expect(map.second).toBe('emotion');
    expect(map.quiet).toBe('change');
  });

  it('tất định và luôn trong [0,1]', () => {
    const items = [
      { weight: 0.8, vector: majorVector('major-03') },
      { weight: 1.2, vector: reversedVector(majorVector('major-09')) },
      { weight: 1, vector: majorVector('major-21') },
    ];
    const a = computeSoulMap(items);
    expect(computeSoulMap(items)).toEqual(a);
    for (const ax of AXIS_ORDER) {
      expect(a.vector[ax]).toBeGreaterThanOrEqual(0);
      expect(a.vector[ax]).toBeLessThanOrEqual(1);
    }
  });

  it('không có lá → lỗi lập trình', () => {
    expect(() => computeSoulMap([])).toThrow();
  });
});

describe('archetypeTitle', () => {
  it('đủ 30 tiêu đề, không trùng, khớp bảng', () => {
    const titles = new Set<string>();
    for (const d of AXIS_ORDER)
      for (const s of AXIS_ORDER) {
        if (d === s) continue;
        const t = archetypeTitle(d, s, AXIS_TEXTS);
        expect(t).toBe(`${AXIS_TEXTS.nouns[d]} ${AXIS_TEXTS.modifiers[s]}`);
        expect(t.split(' ')).toHaveLength(4);
        titles.add(t);
      }
    expect(titles.size).toBe(30);
  });
});
