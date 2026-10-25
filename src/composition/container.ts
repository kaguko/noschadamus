/** Nơi DUY NHẤT nối port với adapter (docs/03 mục 4). Chỉ app/ được import file này (D6). */
import axesText from '../../data/text/axes.vi.json';
import {
  PurgeEvents,
  RecordEvent,
  type EventStore,
} from '@/contexts/analytics/application/record-event';
import { PrismaEventStore } from '@/contexts/analytics/infrastructure/prisma-event-store';
import { SERVER_VISITOR, visitorHash } from '@/contexts/analytics/infrastructure/visitor-hash';
import type { AxisTexts } from '@/contexts/reading/domain';
import {
  CreateReading,
  GetReadingForOwner,
  GetSharedReading,
  ListOwnedReadings,
  RevokeShare,
  ShareReading,
  type ReadingDeps,
} from '@/contexts/reading/application/use-cases';
import type { EventBus } from '@/contexts/reading/application/ports';
import { CryptoIdGenerator } from '@/contexts/reading/infrastructure/crypto-id-generator';
import { InMemoryEventBus } from '@/contexts/reading/infrastructure/in-memory';
import { PrismaReadingRepository } from '@/contexts/reading/infrastructure/prisma-reading-repository';
import { TarotGatewayAdapter } from '@/contexts/reading/infrastructure/tarot-gateway';
import { createTarotPublicApi, type TarotPublicApi } from '@/contexts/tarot/application/public-api';
import { CsprngRandomSource } from '@/contexts/tarot/infrastructure/csprng-random-source';
import {
  JsonCardRepository,
  JsonSpreadRepository,
} from '@/contexts/tarot/infrastructure/json-repositories';
import { getEnv, type Env } from '@/shared/config/env';
import { createPrismaClient, type Db } from '@/shared/db/prisma-client';
import { OwnerCookieCodec } from '@/shared/http/owner-cookie';
import { PrismaRateLimiter, type RateLimiter } from '@/shared/http/rate-limit';
import type { Clock } from '@/shared/kernel/clock';

export interface Container {
  readonly env: Env;
  readonly db: Db;
  readonly tarot: TarotPublicApi;
  readonly reading: {
    readonly createReading: CreateReading;
    readonly getReadingForOwner: GetReadingForOwner;
    readonly getSharedReading: GetSharedReading;
    readonly shareReading: ShareReading;
    readonly revokeShare: RevokeShare;
    readonly listOwnedReadings: ListOwnedReadings;
    readonly repository: PrismaReadingRepository;
  };
  readonly events: EventBus & { subscribe: InMemoryEventBus['subscribe'] };
  readonly analytics: {
    readonly recordEvent: RecordEvent;
    readonly purgeEvents: PurgeEvents;
    readonly store: EventStore;
    readonly visitorHashOf: (ip: string, userAgent: string) => string;
  };
  readonly infra: {
    readonly clock: Clock;
    readonly rateLimiter: RateLimiter & { purge(now: Date): Promise<number> };
    readonly ownerCookie: OwnerCookieCodec;
  };
}

const systemClock: Clock = { now: () => new Date() };

function build(): Container {
  const env = getEnv();
  const db = createPrismaClient(env.DATABASE_URL);
  const tarot = createTarotPublicApi({
    cards: new JsonCardRepository(),
    spreads: new JsonSpreadRepository(),
    random: new CsprngRandomSource(),
  });
  const repository = new PrismaReadingRepository(db);
  // Bus trong tiến trình; analytics đăng ký lắng nghe ở T15.
  const events = new InMemoryEventBus();
  const deps: ReadingDeps = {
    readings: repository,
    tarot: new TarotGatewayAdapter(tarot),
    ids: new CryptoIdGenerator(),
    clock: systemClock,
    events,
    texts: axesText as unknown as AxisTexts,
  };

  const eventStore = new PrismaEventStore(db);
  const recordEvent = new RecordEvent({ store: eventStore, clock: systemClock });
  // reading_created phát từ server qua sự kiện miền (docs/03 mục 9); lỗi analytics không làm hỏng việc tạo bản đọc.
  events.subscribe(async (e) => {
    if (e.type !== 'ReadingCreated') return;
    try {
      await recordEvent.execute({
        name: 'reading_created',
        props: { spreadId: e.spreadId, allowReversed: e.allowReversed, dominant: e.dominant },
        visitorHash: SERVER_VISITOR,
      });
    } catch (err) {
      console.error(
        JSON.stringify({ level: 'error', msg: 'analytics_failed', error: String(err) }),
      );
    }
  });

  return {
    env,
    db,
    tarot,
    reading: {
      createReading: new CreateReading(deps),
      getReadingForOwner: new GetReadingForOwner(deps),
      getSharedReading: new GetSharedReading(deps),
      shareReading: new ShareReading(deps),
      revokeShare: new RevokeShare(deps),
      listOwnedReadings: new ListOwnedReadings(deps),
      repository,
    },
    events,
    analytics: {
      recordEvent,
      purgeEvents: new PurgeEvents({ store: eventStore, clock: systemClock }),
      store: eventStore,
      visitorHashOf: (ip, ua) => visitorHash(env.ANALYTICS_SECRET, ip, ua, systemClock.now()),
    },
    infra: {
      clock: systemClock,
      rateLimiter: new PrismaRateLimiter(db),
      ownerCookie: new OwnerCookieCodec(env.OWNER_COOKIE_SECRET),
    },
  };
}

// Giữ một thể hiện mỗi tiến trình (kể cả khi Next nạp lại module trong dev).
const globalForContainer = globalThis as unknown as { __ndContainer?: Container };

export function getContainer(): Container {
  globalForContainer.__ndContainer ??= build();
  return globalForContainer.__ndContainer;
}
