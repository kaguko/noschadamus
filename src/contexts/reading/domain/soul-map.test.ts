import { describe, expect, it } from 'vitest';
import { reversedVector } from '@/contexts/tarot/domain/reversed-vector';
import { AXIS_ORDER, type AxisVector } from '@/shared/kernel/axes';
import { AXIS_TEXTS, majorVector } from '@/test-support/reading-data';
import { archetypeTitle } from './axis-texts';
import { computeSoulMap, displaySoulMap } from './soul-map';

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

describe('balanced', () => {
  it('ví dụ vàng 2 không cân bằng; bản đồ chênh < 0.15 là cân bằng', () => {
    const golden = computeSoulMap([
      { weight: 0.8, vector: majorVector('major-00') },
      { weight: 1.2, vector: majorVector('major-16') },
      { weight: 1.0, vector: reversedVector(majorVector('major-17')) },
    ]);
    expect(golden.balanced).toBe(false);
    const flatish = { ...flat(0.5), energy: 0.57, change: 0.43 };
    expect(computeSoulMap([{ weight: 1, vector: flatish }]).balanced).toBe(true);
    const edge = { ...flat(0.5), energy: 0.6, change: 0.44 };
    expect(computeSoulMap([{ weight: 1, vector: edge }]).balanced).toBe(false);
  });
});

describe('displaySoulMap', () => {
  const range = (v: AxisVector) => {
    const xs = AXIS_ORDER.map((a) => v[a]);
    return Math.max(...xs) - Math.min(...xs);
  };
  const mean = (v: AxisVector) => AXIS_ORDER.reduce((s, a) => s + v[a], 0) / 6;

  it('bản đồ đã rõ (chênh ≥ 0.55) giữ nguyên', () => {
    const map = computeSoulMap([
      { weight: 0.8, vector: majorVector('major-00') },
      { weight: 1.2, vector: majorVector('major-16') },
      { weight: 1.0, vector: reversedVector(majorVector('major-17')) },
    ]);
    const d = displaySoulMap(map);
    expect(d.stretch).toBe(1);
    expect(d.vector).toEqual(map.vector);
    expect(d.perCard).toEqual(map.perCard);
  });

  it('bản đồ phẳng được kéo giãn quanh trung bình, tối đa ×2.5', () => {
    const v = { ...flat(0.5), energy: 0.6, emotion: 0.55, mind: 0.45, change: 0.4 };
    const map = computeSoulMap([{ weight: 1, vector: v }]);
    const d = displaySoulMap(map);
    expect(d.stretch).toBe(2.5);
    expect(range(d.vector)).toBeCloseTo(0.5, 4);
    expect(mean(d.vector)).toBeCloseTo(mean(map.vector), 4);
    // thứ tự các trục không đổi
    expect(d.vector.energy).toBeGreaterThan(d.vector.emotion);
    expect(d.vector.mind).toBeGreaterThan(d.vector.change);
  });

  it('kéo giãn vừa đủ để đạt chênh 0.55 khi có thể', () => {
    const v = { ...flat(0.5), energy: 0.7, change: 0.35 };
    const d = displaySoulMap(computeSoulMap([{ weight: 1, vector: v }]));
    expect(range(d.vector)).toBeCloseTo(0.55, 3);
  });

  it('luôn trong [0,1]; bản đồ hoàn toàn phẳng không lỗi', () => {
    const d = displaySoulMap(computeSoulMap([{ weight: 1, vector: flat(0.5) }]));
    expect(d.vector).toEqual(flat(0.5));
    const skewed = { ...flat(0.9), change: 0.75 };
    const d2 = displaySoulMap(computeSoulMap([{ weight: 1, vector: skewed }]));
    for (const a of AXIS_ORDER) expect(d2.vector[a]).toBeLessThanOrEqual(1);
  });
});
