import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createPrismaClient } from '@/shared/db/prisma-client';
import {
  InMemoryRateLimiter,
  PrismaRateLimiter,
  type RateLimiter,
  type RateLimitRule,
} from './rate-limit';

const RULE: RateLimitRule = { name: 'test', limit: 3, windowMs: 60_000 };
const T0 = new Date('2026-10-25T10:00:10Z');

const url = process.env.TEST_DATABASE_URL;
const db = url ? createPrismaClient(url) : null;
afterAll(async () => {
  await db?.$disconnect();
});

function contract(name: string, make: () => Promise<RateLimiter>, skip = false) {
  describe.skipIf(skip)(`RateLimiter: ${name}`, () => {
    let rl: RateLimiter;
    beforeEach(async () => {
      rl = await make();
    });

    it('cho qua đến giới hạn, chặn sau đó, có Retry-After đến hết cửa sổ', async () => {
      for (let i = 0; i < 3; i++) expect((await rl.consume(RULE, 'a', T0)).allowed).toBe(true);
      const blocked = await rl.consume(RULE, 'a', T0);
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfterSec).toBe(50);
    });

    it('chủ thể khác và cửa sổ mới được tính riêng', async () => {
      for (let i = 0; i < 4; i++) await rl.consume(RULE, 'a', T0);
      expect((await rl.consume(RULE, 'b', T0)).allowed).toBe(true);
      const next = new Date(T0.getTime() + 60_000);
      expect((await rl.consume(RULE, 'a', next)).allowed).toBe(true);
    });

    it('đồng thời: không vượt giới hạn quá mức', async () => {
      const results = await Promise.all(
        Array.from({ length: 10 }, () => rl.consume(RULE, 'c', T0)),
      );
      expect(results.filter((r) => r.allowed)).toHaveLength(3);
    });
  });
}

contract('trong bộ nhớ', async () => new InMemoryRateLimiter());
contract(
  'Postgres',
  async () => {
    await db!.rateLimitBucket.deleteMany();
    return new PrismaRateLimiter(db!);
  },
  !db,
);

describe.skipIf(!db)('PrismaRateLimiter.purge', () => {
  it('xóa bản ghi quá 2 giờ', async () => {
    await db!.rateLimitBucket.deleteMany();
    const rl = new PrismaRateLimiter(db!);
    await rl.consume(RULE, 'old', T0);
    await rl.consume(RULE, 'new', new Date(T0.getTime() + 3 * 3_600_000));
    expect(await rl.purge(new Date(T0.getTime() + 3 * 3_600_000))).toBe(1);
  });
});
