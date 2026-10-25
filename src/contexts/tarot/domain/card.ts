import type { AxisVector } from '@/shared/kernel/axes';

export type Arcana = 'major' | 'minor';
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type MinorRank =
  | 'ace'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'page'
  | 'knight'
  | 'queen'
  | 'king';
export type Orientation = 'upright' | 'reversed';

/** 'major-00'…'major-21', '{suit}-{rank}' (vd. 'cups-ace', 'swords-10'). */
export type CardId = string;

export const SUITS: readonly Suit[] = ['wands', 'cups', 'swords', 'pentacles'];
export const MINOR_RANKS: readonly MinorRank[] = [
  'ace',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'page',
  'knight',
  'queen',
  'king',
];
export const DECK_SIZE = 78;

export interface Card {
  readonly id: CardId;
  readonly arcana: Arcana;
  readonly suit: Suit | null;
  readonly rank: MinorRank | null;
  readonly number: number;
  readonly name: { readonly vi: string; readonly en: string };
  readonly keywords: Readonly<Record<Orientation, readonly [string, string, string]>>;
  readonly meaning: Readonly<Record<Orientation, string>>;
  readonly prompts: Readonly<Record<Orientation, readonly [string, string]>>;
  /** Vector xuôi. */
  readonly vector: AxisVector;
}
