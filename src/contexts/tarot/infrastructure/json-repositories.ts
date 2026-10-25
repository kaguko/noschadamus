import major from '../../../../data/cards/major.json';
import cups from '../../../../data/cards/minor-cups.json';
import pentacles from '../../../../data/cards/minor-pentacles.json';
import swords from '../../../../data/cards/minor-swords.json';
import wands from '../../../../data/cards/minor-wands.json';
import spreads from '../../../../data/spreads.json';
import type { CardRepository, SpreadRepository } from '../application/ports';
import type { Card, Spread } from '../domain';

/** Dữ liệu đã được `npm run cards:validate` kiểm ở CI; ở đây chỉ ép kiểu. */
const CARDS: readonly Card[] = Object.freeze([
  ...major,
  ...wands,
  ...cups,
  ...swords,
  ...pentacles,
] as unknown as Card[]);
const SPREADS: readonly Spread[] = Object.freeze(spreads as unknown as Spread[]);

export class JsonCardRepository implements CardRepository {
  async all(): Promise<readonly Card[]> {
    return CARDS;
  }
}

export class JsonSpreadRepository implements SpreadRepository {
  async get(id: Spread['id']): Promise<Spread | null> {
    return SPREADS.find((s) => s.id === id) ?? null;
  }
}
