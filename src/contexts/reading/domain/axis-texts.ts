import type { AxisId } from '@/shared/kernel/axes';

type PerAxis<T> = Readonly<Record<AxisId, T>>;

/** Bảng chữ theo trục (data/text/axes.vi.json, docs/02 mục 8). Domain nhận qua tham số, không tự đọc file. */
export interface AxisTexts {
  readonly nouns: PerAxis<string>;
  readonly modifiers: PerAxis<string>;
  readonly taglines: PerAxis<string>;
  readonly insights: PerAxis<string>;
  readonly invites: PerAxis<string>;
  readonly dominantPrompts: PerAxis<readonly [string, string]>;
  readonly quietPrompts: PerAxis<readonly [string, string]>;
  readonly singleSpreadPrefix: string;
}

/** Tiêu đề archetype: NOUN[dominant] + MODIFIER[second] (docs/01 mục 3.3). */
export function archetypeTitle(dominant: AxisId, second: AxisId, texts: AxisTexts): string {
  return `${texts.nouns[dominant]} ${texts.modifiers[second]}`;
}
