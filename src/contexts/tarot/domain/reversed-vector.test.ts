import { describe, expect, it } from 'vitest';
import { AXIS_ORDER, type AxisVector } from '@/shared/kernel/axes';
import { reversedVector } from './reversed-vector';

const STAR: AxisVector = {
  energy: 0.4,
  emotion: 0.8,
  connection: 0.7,
  grounding: 0.5,
  mind: 0.55,
  change: 0.55,
};
const round4 = (v: AxisVector) =>
  Object.fromEntries(AXIS_ORDER.map((a) => [a, Number(v[a].toFixed(4))]));
const mean = (v: AxisVector) => AXIS_ORDER.reduce((s, a) => s + v[a], 0) / 6;

describe('reversedVector', () => {
  it('Ví dụ vàng 1: Ngôi Sao ngược', () => {
    expect(round4(reversedVector(STAR))).toEqual({
      energy: 0.7667,
      emotion: 0.3667,
      connection: 0.4667,
      grounding: 0.6667,
      mind: 0.6167,
      change: 0.6167,
    });
  });

  it('luôn nằm trong [0,1] kể cả hồ sơ cực đoan', () => {
    const extreme: AxisVector = {
      energy: 1,
      emotion: 0,
      connection: 0,
      grounding: 0,
      mind: 0,
      change: 0,
    };
    const r = reversedVector(extreme);
    for (const a of AXIS_ORDER) {
      expect(r[a]).toBeGreaterThanOrEqual(0);
      expect(r[a]).toBeLessThanOrEqual(1);
    }
  });

  it('bảo toàn trung bình khi không bị cắt', () => {
    expect(mean(reversedVector(STAR))).toBeCloseTo(mean(STAR), 10);
  });
});
