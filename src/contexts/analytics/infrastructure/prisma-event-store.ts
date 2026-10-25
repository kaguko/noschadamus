import type { Db } from '@/shared/db/prisma-client';
import type { AnalyticsEventRecord, EventStore } from '../application/record-event';

export class PrismaEventStore implements EventStore {
  constructor(private readonly db: Db) {}

  async append(e: AnalyticsEventRecord) {
    await this.db.analyticsEvent.create({
      data: { name: e.name, occurredAt: e.occurredAt, visitorHash: e.visitorHash, props: e.props },
    });
  }

  async deleteOlderThan(cutoff: Date) {
    const res = await this.db.analyticsEvent.deleteMany({ where: { occurredAt: { lt: cutoff } } });
    return res.count;
  }
}

export class InMemoryEventStore implements EventStore {
  readonly rows: AnalyticsEventRecord[] = [];
  async append(e: AnalyticsEventRecord) {
    this.rows.push(e);
  }
  async deleteOlderThan(cutoff: Date) {
    const before = this.rows.length;
    const keep = this.rows.filter((r) => r.occurredAt >= cutoff);
    this.rows.splice(0, this.rows.length, ...keep);
    return before - keep.length;
  }
}
