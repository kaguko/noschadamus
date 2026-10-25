import { describe, expect, it } from 'vitest';
import { FixedClock } from '@/contexts/reading/infrastructure/in-memory';
import { InMemoryEventStore } from '../infrastructure/prisma-event-store';
import { visitorHash } from '../infrastructure/visitor-hash';
import { PurgeEvents, RecordEvent } from './record-event';

describe('RecordEvent / PurgeEvents', () => {
  it('ghi với thời điểm từ Clock; dọn sự kiện quá 400 ngày', async () => {
    const store = new InMemoryEventStore();
    const clock = new FixedClock(new Date('2025-01-01T00:00:00Z'));
    const record = new RecordEvent({ store, clock });
    await record.execute({ name: 'draw_started', props: {}, visitorHash: 'a' });
    clock.advance(300 * 86_400_000);
    await record.execute({ name: 'draw_started', props: {}, visitorHash: 'b' });
    clock.advance(101 * 86_400_000);
    expect(await new PurgeEvents({ store, clock }).execute()).toBe(1);
    expect(store.rows.map((r) => r.visitorHash)).toEqual(['b']);
  });
});

describe('visitorHash', () => {
  const d1 = new Date('2026-10-25T23:59:00Z');
  const d2 = new Date('2026-10-26T00:01:00Z');
  it('ổn định trong ngày, đổi khi sang ngày mới, phụ thuộc bí mật', () => {
    const a = visitorHash('s', '1.2.3.4', 'ua', d1);
    expect(visitorHash('s', '1.2.3.4', 'ua', new Date('2026-10-25T01:00:00Z'))).toBe(a);
    expect(visitorHash('s', '1.2.3.4', 'ua', d2)).not.toBe(a);
    expect(visitorHash('khac', '1.2.3.4', 'ua', d1)).not.toBe(a);
    expect(a).not.toContain('1.2.3.4');
  });
});
