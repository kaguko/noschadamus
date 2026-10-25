import { afterAll } from 'vitest';
import { createPrismaClient } from '@/shared/db/prisma-client';
import { readingRepositoryContract } from '@/test-support/reading-repository-contract';
import { InMemoryReadingRepository } from './in-memory';
import { PrismaReadingRepository } from './prisma-reading-repository';

readingRepositoryContract('trong bộ nhớ', async () => new InMemoryReadingRepository());

// Chạy với Postgres thật khi có TEST_DATABASE_URL (docker compose ở máy dev, service ở CI).
const url = process.env.TEST_DATABASE_URL;
const db = url ? createPrismaClient(url) : null;
afterAll(async () => {
  await db?.$disconnect();
});

readingRepositoryContract(
  'Postgres (Prisma)',
  async () => {
    await db!.reading.deleteMany();
    return new PrismaReadingRepository(db!);
  },
  { skip: !db },
);
