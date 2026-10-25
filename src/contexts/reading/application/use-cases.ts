import { err, ok, type Result } from '@/shared/kernel/result';
import {
  assembleReading,
  revokeShare,
  shareReading,
  type AxisTexts,
  type ReadingId,
  type ShareToken,
  type SpreadId,
} from '../domain';
import { toReadingSummary, toReadingView, type ReadingSummary, type ReadingView } from './dto';
import {
  owns,
  type Clock,
  type EventBus,
  type IdGenerator,
  type OwnerContext,
  type ReadingRepository,
  type TarotGateway,
} from './ports';

export interface ReadingDeps {
  readonly readings: ReadingRepository;
  readonly tarot: TarotGateway;
  readonly ids: IdGenerator;
  readonly clock: Clock;
  readonly events: EventBus;
  readonly texts: AxisTexts;
}

const EXPECTED_COUNT: Record<SpreadId, number> = { single: 1, three: 3 };

// ---------------------------------------------------------------- CreateReading

export interface CreateReadingInput {
  readonly spreadId: SpreadId;
  readonly allowReversed: boolean;
  readonly intention?: string;
  readonly storeIntention?: boolean;
}

export type CreateReadingError = 'SPREAD_NOT_FOUND' | 'INTENTION_TOO_LONG' | 'DECK_INCOMPLETE';

export class CreateReading {
  constructor(private readonly deps: ReadingDeps) {}

  async execute(
    input: CreateReadingInput,
  ): Promise<Result<{ readingId: ReadingId }, CreateReadingError>> {
    const { deps } = this;
    const drawn = await deps.tarot.drawForSpread(input.spreadId, {
      allowReversed: input.allowReversed,
    });
    if (!drawn.ok) return drawn;

    const id = deps.ids.readingId();
    const now = deps.clock.now();
    const assembled = assembleReading({
      id,
      createdAt: now,
      spreadId: input.spreadId,
      allowReversed: input.allowReversed,
      expectedCount: EXPECTED_COUNT[input.spreadId],
      cards: drawn.value.cards,
      intention: input.intention,
      storeIntention: input.storeIntention,
      texts: deps.texts,
    });
    if (!assembled.ok) {
      return err(assembled.error === 'INVALID_DRAW' ? 'DECK_INCOMPLETE' : assembled.error);
    }

    await deps.readings.save(assembled.value);
    await deps.events.publish({
      type: 'ReadingCreated',
      readingId: id,
      spreadId: input.spreadId,
      allowReversed: input.allowReversed,
      dominant: assembled.value.soulMap.dominant,
      occurredAt: now,
    });
    return ok({ readingId: id });
  }
}

// ---------------------------------------------------------------- GetReadingForOwner

export class GetReadingForOwner {
  constructor(private readonly deps: Pick<ReadingDeps, 'readings'>) {}

  /** Không phải chủ cũng trả NOT_FOUND, không phân biệt (R9). */
  async execute(input: {
    readingId: ReadingId;
    owner: OwnerContext;
  }): Promise<Result<ReadingView, 'NOT_FOUND'>> {
    if (!owns(input.owner, input.readingId)) return err('NOT_FOUND');
    const r = await this.deps.readings.findById(input.readingId);
    return r ? ok(toReadingView(r, { includeIntention: true })) : err('NOT_FOUND');
  }
}

// ---------------------------------------------------------------- GetSharedReading

export class GetSharedReading {
  constructor(private readonly deps: Pick<ReadingDeps, 'readings'>) {}

  async execute(input: { token: ShareToken }): Promise<Result<ReadingView, 'NOT_FOUND'>> {
    const r = await this.deps.readings.findByShareToken(input.token);
    return r ? ok(toReadingView(r, { includeIntention: false })) : err('NOT_FOUND');
  }
}

// ---------------------------------------------------------------- ShareReading

export class ShareReading {
  constructor(private readonly deps: Pick<ReadingDeps, 'readings' | 'ids' | 'clock' | 'events'>) {}

  /** Idempotent: đã chia sẻ thì trả token hiện tại. */
  async execute(input: {
    readingId: ReadingId;
    owner: OwnerContext;
  }): Promise<Result<{ token: ShareToken; sharedAt: Date }, 'NOT_FOUND'>> {
    if (!owns(input.owner, input.readingId)) return err('NOT_FOUND');
    const r = await this.deps.readings.findById(input.readingId);
    if (!r) return err('NOT_FOUND');
    if (r.share) return ok({ token: r.share.token, sharedAt: r.share.sharedAt });

    const now = this.deps.clock.now();
    const shared = shareReading(r, this.deps.ids.shareToken(), now);
    await this.deps.readings.updateShare(r.id, shared.share);
    await this.deps.events.publish({ type: 'ReadingShared', readingId: r.id, occurredAt: now });
    return ok({ token: shared.share!.token, sharedAt: shared.share!.sharedAt });
  }
}

// ---------------------------------------------------------------- RevokeShare

export class RevokeShare {
  constructor(private readonly deps: Pick<ReadingDeps, 'readings' | 'clock' | 'events'>) {}

  /** Idempotent. */
  async execute(input: {
    readingId: ReadingId;
    owner: OwnerContext;
  }): Promise<Result<void, 'NOT_FOUND'>> {
    if (!owns(input.owner, input.readingId)) return err('NOT_FOUND');
    const r = await this.deps.readings.findById(input.readingId);
    if (!r) return err('NOT_FOUND');
    if (!r.share) return ok(undefined);
    await this.deps.readings.updateShare(r.id, revokeShare(r).share);
    await this.deps.events.publish({
      type: 'ShareRevoked',
      readingId: r.id,
      occurredAt: this.deps.clock.now(),
    });
    return ok(undefined);
  }
}

// ---------------------------------------------------------------- ListOwnedReadings

export const LIST_LIMIT_MAX = 50;

export class ListOwnedReadings {
  constructor(private readonly deps: Pick<ReadingDeps, 'readings'>) {}

  async execute(input: { owner: OwnerContext; limit?: number }): Promise<ReadingSummary[]> {
    const limit = Math.min(input.limit ?? LIST_LIMIT_MAX, LIST_LIMIT_MAX);
    const ids = input.owner.ownedReadingIds.slice(0, limit);
    if (ids.length === 0) return [];
    const found = await this.deps.readings.findManyByIds(ids, limit);
    return found
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(toReadingSummary);
  }
}
