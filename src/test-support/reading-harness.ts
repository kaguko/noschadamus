import {
  CreateReading,
  GetReadingForOwner,
  GetSharedReading,
  ListOwnedReadings,
  RevokeShare,
  ShareReading,
} from '@/contexts/reading/application/use-cases';
import {
  FixedClock,
  InMemoryEventBus,
  InMemoryReadingRepository,
  SequentialIdGenerator,
} from '@/contexts/reading/infrastructure/in-memory';
import { TarotGatewayAdapter } from '@/contexts/reading/infrastructure/tarot-gateway';
import { createTarotPublicApi } from '@/contexts/tarot/application/public-api';
import {
  JsonCardRepository,
  JsonSpreadRepository,
} from '@/contexts/tarot/infrastructure/json-repositories';
import { seededRandomSource } from '@/shared/kernel/seeded-random';
import { AXIS_TEXTS } from './reading-data';

/** Dựng toàn bộ context reading với dữ liệu thật, ngẫu nhiên có hạt giống, lưu trong bộ nhớ. */
export function buildReadingHarness(seed = 1, start = new Date('2026-10-25T08:00:00Z')) {
  const readings = new InMemoryReadingRepository();
  const events = new InMemoryEventBus();
  const clock = new FixedClock(start);
  const ids = new SequentialIdGenerator();
  const tarot = new TarotGatewayAdapter(
    createTarotPublicApi({
      cards: new JsonCardRepository(),
      spreads: new JsonSpreadRepository(),
      random: seededRandomSource(seed),
    }),
  );
  const deps = { readings, tarot, ids, clock, events, texts: AXIS_TEXTS };
  return {
    readings,
    events,
    clock,
    createReading: new CreateReading(deps),
    getReadingForOwner: new GetReadingForOwner(deps),
    getSharedReading: new GetSharedReading(deps),
    shareReading: new ShareReading(deps),
    revokeShare: new RevokeShare(deps),
    listOwnedReadings: new ListOwnedReadings(deps),
  };
}
