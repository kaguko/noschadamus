import { err, ok, type Result } from '@/shared/kernel/result';
import { DECK_SIZE, type Card, type CardId, type Orientation } from './card';
import { randomInt, type RandomSource } from './random-int';
import type { Spread } from './spread';

export interface DrawnCardRef {
  readonly cardId: CardId;
  readonly orientation: Orientation;
}
export type Draw = readonly DrawnCardRef[];

export interface DrawOptions {
  readonly allowReversed: boolean;
}

/**
 * Xáo Fisher-Yates bằng `randomInt`, lấy số lá bằng số vị trí của trải bài,
 * rồi chọn hướng cho từng lá (docs/01 mục 2.3).
 */
export function draw(
  cards: readonly Card[],
  spread: Spread,
  opts: DrawOptions,
  rng: RandomSource,
): Result<Draw, 'DECK_INCOMPLETE'> {
  if (cards.length !== DECK_SIZE || new Set(cards.map((c) => c.id)).size !== DECK_SIZE) {
    return err('DECK_INCOMPLETE');
  }
  const ids = cards.map((c) => c.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = randomInt(rng, i + 1);
    const tmp = ids[i]!;
    ids[i] = ids[j]!;
    ids[j] = tmp;
  }
  const picked = ids.slice(0, spread.positions.length);
  return ok(
    picked.map((cardId) => ({
      cardId,
      orientation: opts.allowReversed && randomInt(rng, 2) === 1 ? 'reversed' : 'upright',
    })),
  );
}
