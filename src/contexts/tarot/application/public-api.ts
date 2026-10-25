/**
 * Cổng công khai của context tarot: điểm DUY NHẤT context khác được dùng (docs/01 mục 2.5).
 * Chỉ trả DTO, không trả entity.
 */
import type { AxisVector } from '@/shared/kernel/axes';
import { err, ok, type Result } from '@/shared/kernel/result';
import {
  draw,
  reversedVector,
  type Card,
  type Orientation,
  type Spread,
  type SpreadId,
} from '../domain';
import type { CardRepository, RandomSource, SpreadRepository } from './ports';

export interface TarotCardView {
  readonly cardId: string;
  readonly nameVi: string;
  readonly nameEn: string;
  readonly arcana: 'major' | 'minor';
  readonly suit: string | null;
  readonly number: number;
  readonly keywords: Readonly<Record<Orientation, readonly [string, string, string]>>;
  readonly meaning: Readonly<Record<Orientation, string>>;
  readonly prompts: Readonly<Record<Orientation, readonly [string, string]>>;
  /** Vector xuôi. */
  readonly vector: AxisVector;
}

export interface SpreadPositionView {
  readonly index: number;
  readonly key: string;
  readonly labelVi: string;
  readonly descriptionVi: string;
  readonly weight: number;
}

export interface SpreadView {
  readonly id: SpreadId;
  readonly nameVi: string;
  readonly positions: readonly SpreadPositionView[];
}

export interface DrawnTarotCard extends TarotCardView {
  readonly orientation: Orientation;
  /** Vector sau khi áp hướng (lá ngược dùng quy tắc đảo hồ sơ của tarot). */
  readonly effectiveVector: AxisVector;
}

export type DrawError = 'SPREAD_NOT_FOUND' | 'DECK_INCOMPLETE';

export interface TarotPublicApi {
  getSpread(id: SpreadId): Promise<Result<SpreadView, 'SPREAD_NOT_FOUND'>>;
  drawForSpread(
    id: SpreadId,
    opts: { allowReversed: boolean },
  ): Promise<Result<{ spread: SpreadView; cards: readonly DrawnTarotCard[] }, DrawError>>;
}

const toCardView = (c: Card): TarotCardView => ({
  cardId: c.id,
  nameVi: c.name.vi,
  nameEn: c.name.en,
  arcana: c.arcana,
  suit: c.suit,
  number: c.number,
  keywords: c.keywords,
  meaning: c.meaning,
  prompts: c.prompts,
  vector: c.vector,
});

const toSpreadView = (s: Spread): SpreadView => ({
  id: s.id,
  nameVi: s.name.vi,
  positions: s.positions.map((p) => ({
    index: p.index,
    key: p.key,
    labelVi: p.label.vi,
    descriptionVi: p.description.vi,
    weight: p.weight,
  })),
});

export interface TarotDeps {
  readonly cards: CardRepository;
  readonly spreads: SpreadRepository;
  readonly random: RandomSource;
}

export function createTarotPublicApi(deps: TarotDeps): TarotPublicApi {
  return {
    async getSpread(id) {
      const spread = await deps.spreads.get(id);
      return spread ? ok(toSpreadView(spread)) : err('SPREAD_NOT_FOUND');
    },

    async drawForSpread(id, opts) {
      const spread = await deps.spreads.get(id);
      if (!spread) return err('SPREAD_NOT_FOUND');
      const deck = await deps.cards.all();
      const drawn = draw(deck, spread, opts, deps.random);
      if (!drawn.ok) return drawn;
      const byId = new Map(deck.map((c) => [c.id, c]));
      const cards = drawn.value.map(({ cardId, orientation }) => {
        const card = byId.get(cardId)!;
        return {
          ...toCardView(card),
          orientation,
          effectiveVector: orientation === 'reversed' ? reversedVector(card.vector) : card.vector,
        };
      });
      return ok({ spread: toSpreadView(spread), cards });
    },
  };
}
