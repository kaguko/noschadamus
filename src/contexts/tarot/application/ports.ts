import type { Card, Spread, SpreadId } from '../domain';

export type { RandomSource } from '../domain';

export interface CardRepository {
  all(): Promise<readonly Card[]>;
}

export interface SpreadRepository {
  get(id: SpreadId): Promise<Spread | null>;
}
