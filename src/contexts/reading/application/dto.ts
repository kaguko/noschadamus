import type { AxisId, AxisVector } from '@/shared/kernel/axes';
import type { Orientation, Reading, SpreadId } from '../domain';

/** Hình dạng trả cho giao diện và API (docs/03 mục 7.2). */
export interface ReadingCardView {
  readonly position: {
    readonly index: number;
    readonly key: string;
    readonly label: string;
    readonly description: string;
    readonly weight: number;
  };
  readonly cardId: string;
  readonly name: string;
  readonly nameEn: string;
  readonly arcana: 'major' | 'minor';
  readonly suit: string | null;
  readonly number: number;
  readonly orientation: Orientation;
  readonly keywords: readonly [string, string, string];
  readonly meaning: string;
  readonly prompt: string;
  readonly imageUrl: string;
}

export interface ReadingView {
  readonly id: string;
  readonly createdAt: string;
  readonly spread: { readonly id: SpreadId; readonly name: string };
  readonly allowReversed: boolean;
  readonly title: string;
  readonly tagline: string;
  readonly cards: readonly ReadingCardView[];
  readonly soulMap: {
    readonly vector: AxisVector;
    readonly dominant: AxisId;
    readonly second: AxisId;
    readonly quiet: AxisId;
    readonly perCard: readonly AxisVector[];
  };
  readonly synthesis: string;
  readonly closingPrompts: readonly [string, string];
  readonly intention: string | null;
  readonly share: { readonly path: string; readonly sharedAt: string } | null;
}

export interface ReadingSummary {
  readonly id: string;
  readonly createdAt: string;
  readonly title: string;
  readonly spreadId: SpreadId;
  readonly dominant: AxisId;
  readonly cardImages: readonly string[];
  readonly shared: boolean;
}

const SPREAD_NAME: Record<SpreadId, string> = { single: 'Một lá', three: 'Ba lá' };

export const cardImageUrl = (cardId: string) => `/cards/${cardId}.webp`;
export const sharePath = (token: string) => `/s/${token}`;

export function toReadingView(r: Reading, opts: { includeIntention: boolean }): ReadingView {
  return {
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    spread: { id: r.spreadId, name: SPREAD_NAME[r.spreadId] },
    allowReversed: r.allowReversed,
    title: r.interpretation.title,
    tagline: r.interpretation.tagline,
    cards: r.cards.map((c) => ({
      position: {
        index: c.position.index,
        key: c.position.key,
        label: c.position.labelVi,
        description: c.position.descriptionVi,
        weight: c.position.weight,
      },
      cardId: c.cardId,
      name: c.nameVi,
      nameEn: c.nameEn,
      arcana: c.arcana,
      suit: c.suit,
      number: c.number,
      orientation: c.orientation,
      keywords: c.keywords,
      meaning: c.meaning,
      prompt: c.prompt,
      imageUrl: cardImageUrl(c.cardId),
    })),
    soulMap: r.soulMap,
    synthesis: r.interpretation.synthesis,
    closingPrompts: r.interpretation.closingPrompts,
    intention: opts.includeIntention ? r.intention : null,
    share: r.share
      ? { path: sharePath(r.share.token), sharedAt: r.share.sharedAt.toISOString() }
      : null,
  };
}

export function toReadingSummary(r: Reading): ReadingSummary {
  return {
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    title: r.interpretation.title,
    spreadId: r.spreadId,
    dominant: r.soulMap.dominant,
    cardImages: r.cards.map((c) => cardImageUrl(c.cardId)),
    shared: r.share !== null,
  };
}
