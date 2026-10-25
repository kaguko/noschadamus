import type { Result } from '@/shared/kernel/result';
import type {
  DomainEvent,
  DrawnCardSource,
  Reading,
  ReadingId,
  ShareToken,
  SpreadId,
} from '../domain';

export type { Clock } from '@/shared/kernel/clock';

export interface ReadingRepository {
  save(r: Reading): Promise<void>;
  findById(id: ReadingId): Promise<Reading | null>;
  findByShareToken(t: ShareToken): Promise<Reading | null>;
  updateShare(id: ReadingId, share: Reading['share']): Promise<void>;
  findManyByIds(ids: readonly ReadingId[], limit: number): Promise<Reading[]>;
  deleteExpired(now: Date): Promise<number>;
}

/** Cổng sang context tarot (anti-corruption layer, docs/01 mục 2.2). */
export interface TarotGateway {
  drawForSpread(
    id: SpreadId,
    opts: { allowReversed: boolean },
  ): Promise<Result<{ cards: readonly DrawnCardSource[] }, 'SPREAD_NOT_FOUND' | 'DECK_INCOMPLETE'>>;
}

export interface IdGenerator {
  readingId(): ReadingId;
  shareToken(): ShareToken;
}

export interface EventBus {
  publish(e: DomainEvent): Promise<void>;
}

/** Danh tính chủ sở hữu, dựng từ cookie đã xác thực chữ ký (docs/03 mục 6). */
export interface OwnerContext {
  /** Mới nhất trước. */
  readonly ownedReadingIds: readonly ReadingId[];
}

export const owns = (owner: OwnerContext, id: ReadingId) => owner.ownedReadingIds.includes(id);
