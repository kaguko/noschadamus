import { z } from 'zod';
import type { Prisma } from '@/generated/prisma/client';
import type { Db } from '@/shared/db/prisma-client';
import { AXIS_ORDER } from '@/shared/kernel/axes';
import type { ReadingRepository } from '../application/ports';
import { rehydrateReading, type Reading } from '../domain';

/** Thời hạn lưu giữ: docs/03 mục 5. */
export const RETENTION_UNSHARED_DAYS = 180;
export const RETENTION_SHARED_DAYS = 730;
const DAY_MS = 86_400_000;

const axisId = z.enum(AXIS_ORDER);
const vector = z.object(
  Object.fromEntries(AXIS_ORDER.map((a) => [a, z.number().min(0).max(1)])) as Record<
    (typeof AXIS_ORDER)[number],
    z.ZodNumber
  >,
);

const drawnCards = z.array(
  z.object({
    position: z.object({
      index: z.number().int(),
      key: z.string(),
      labelVi: z.string(),
      descriptionVi: z.string(),
      weight: z.number(),
    }),
    cardId: z.string(),
    nameVi: z.string(),
    nameEn: z.string(),
    arcana: z.enum(['major', 'minor']),
    suit: z.string().nullable(),
    number: z.number().int(),
    orientation: z.enum(['upright', 'reversed']),
    keywords: z.tuple([z.string(), z.string(), z.string()]),
    meaning: z.string(),
    prompt: z.string(),
    effectiveVector: vector,
  }),
);

const soulMap = z.object({
  vector,
  dominant: axisId,
  second: axisId,
  quiet: axisId,
  perCard: z.array(vector),
  balanced: z.boolean(),
});

const interpretation = z.object({
  title: z.string(),
  tagline: z.string(),
  synthesis: z.string(),
  closingPrompts: z.tuple([z.string(), z.string()]),
});

type Row = Prisma.ReadingGetPayload<object>;

/** Kiểm JSON khi đọc (phòng dữ liệu cũ/hỏng); `schemaVersion` dùng cho nâng cấp sau này. */
export function toDomain(row: Row): Reading {
  if (row.schemaVersion !== 1) throw new Error(`schemaVersion không hỗ trợ: ${row.schemaVersion}`);
  return rehydrateReading({
    id: row.id,
    createdAt: row.createdAt,
    schemaVersion: 1,
    locale: 'vi',
    spreadId: z.enum(['single', 'three']).parse(row.spreadId),
    allowReversed: row.allowReversed,
    cards: drawnCards.parse(row.cards),
    soulMap: soulMap.parse(row.soulMap),
    interpretation: interpretation.parse(row.interpretation),
    intention: row.intention,
    share:
      row.shareToken && row.sharedAt ? { token: row.shareToken, sharedAt: row.sharedAt } : null,
  });
}

const json = (v: unknown) => v as Prisma.InputJsonValue;

export class PrismaReadingRepository implements ReadingRepository {
  constructor(private readonly db: Db) {}

  async save(r: Reading) {
    await this.db.reading.create({
      data: {
        id: r.id,
        createdAt: r.createdAt,
        lastViewedAt: r.createdAt,
        schemaVersion: r.schemaVersion,
        locale: r.locale,
        spreadId: r.spreadId,
        allowReversed: r.allowReversed,
        title: r.interpretation.title,
        cards: json(r.cards),
        soulMap: json(r.soulMap),
        interpretation: json(r.interpretation),
        intention: r.intention,
        shareToken: r.share?.token ?? null,
        sharedAt: r.share?.sharedAt ?? null,
      },
    });
  }

  async findById(id: string) {
    const row = await this.db.reading.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findByShareToken(t: string) {
    const row = await this.db.reading.findUnique({ where: { shareToken: t } });
    return row ? toDomain(row) : null;
  }

  async updateShare(id: string, share: Reading['share']) {
    await this.db.reading.update({
      where: { id },
      data: { shareToken: share?.token ?? null, sharedAt: share?.sharedAt ?? null },
    });
  }

  async findManyByIds(ids: readonly string[], limit: number) {
    if (ids.length === 0) return [];
    const rows = await this.db.reading.findMany({
      where: { id: { in: [...ids] } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map(toDomain);
  }

  async markViewed(id: string, now: Date) {
    await this.db.reading.updateMany({ where: { id }, data: { lastViewedAt: now } });
  }

  async deleteExpired(now: Date) {
    const unsharedBefore = new Date(now.getTime() - RETENTION_UNSHARED_DAYS * DAY_MS);
    const sharedBefore = new Date(now.getTime() - RETENTION_SHARED_DAYS * DAY_MS);
    const res = await this.db.reading.deleteMany({
      where: {
        OR: [
          { shareToken: null, lastViewedAt: { lt: unsharedBefore } },
          { shareToken: { not: null }, lastViewedAt: { lt: sharedBefore } },
        ],
      },
    });
    return res.count;
  }
}
