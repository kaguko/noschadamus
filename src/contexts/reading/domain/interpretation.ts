import { fnv1a, mulberry32 } from '@/shared/kernel/prng';
import { archetypeTitle, type AxisTexts } from './axis-texts';
import type { SoulMap } from './soul-map';

export interface Interpretation {
  readonly title: string;
  readonly tagline: string;
  readonly synthesis: string;
  readonly closingPrompts: readonly [string, string];
}

export interface ComposeInput {
  readonly readingId: string;
  readonly spreadId: 'single' | 'three';
  /** Hai câu hỏi của từng lá (đã theo hướng xuôi/ngược), theo thứ tự vị trí. */
  readonly cardPrompts: readonly (readonly [string, string])[];
  readonly soulMap: SoulMap;
  readonly texts: AxisTexts;
}

export interface ComposeOutput {
  readonly interpretation: Interpretation;
  /** Câu hỏi đã chọn cho từng lá, theo thứ tự vị trí. */
  readonly chosenCardPrompts: readonly string[];
}

/**
 * Sinh diễn giải tất định từ readingId (docs/01 mục 3.4).
 * Thứ tự gọi PRNG cố định: từng lá theo vị trí → k1 → k2.
 */
export function composeInterpretation(input: ComposeInput): ComposeOutput {
  const { soulMap, texts } = input;
  const prng = mulberry32(fnv1a(input.readingId));
  const pick = () => (prng() < 0.5 ? 0 : 1);

  const chosenCardPrompts = input.cardPrompts.map((pair) => pair[pick()]);
  const k1 = pick();
  const k2 = pick();

  const core = `${texts.insights[soulMap.dominant]} ${texts.invites[soulMap.quiet]}`;
  const synthesis = input.spreadId === 'single' ? `${texts.singleSpreadPrefix} ${core}` : core;

  return {
    interpretation: {
      title: archetypeTitle(soulMap.dominant, soulMap.second, texts),
      tagline: texts.taglines[soulMap.dominant],
      synthesis,
      closingPrompts: [
        texts.dominantPrompts[soulMap.dominant][k1],
        texts.quietPrompts[soulMap.quiet][k2],
      ],
    },
    chosenCardPrompts,
  };
}
