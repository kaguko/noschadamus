import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

export type Db = PrismaClient;

export function createPrismaClient(connectionString: string): Db {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}
