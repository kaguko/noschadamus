/** Test tích hợp T15: analytics, cron dọn dữ liệu, health (Postgres thật). */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

const TEST_DB = process.env.TEST_DATABASE_URL;
if (TEST_DB) process.env.DATABASE_URL = TEST_DB;
process.env.NEXT_PUBLIC_SITE_URL ??= 'http://localhost:3000';
const SITE = 'http://localhost:3000';
const IP = '203.0.113.42';
const UA = 'Mozilla/5.0 (test)';

describe.skipIf(!TEST_DB)('Analytics, cron, health (Postgres thật)', async () => {
  const { getContainer } = await import('@/composition/container');
  const events = await import('./route');
  const readings = await import('../readings/route');
  const cron = await import('../cron/purge/route');
  const health = await import('../health/route');
  const c = getContainer();

  afterAll(async () => {
    await c.db.$disconnect();
  });
  beforeEach(async () => {
    await c.db.analyticsEvent.deleteMany();
    await c.db.rateLimitBucket.deleteMany();
    await c.db.reading.deleteMany();
  });

  const send = (body: unknown, headers: Record<string, string> = {}) =>
    events.POST(
      new Request(`${SITE}/api/events`, {
        method: 'POST',
        headers: {
          origin: SITE,
          'content-type': 'application/json',
          'x-forwarded-for': IP,
          'user-agent': UA,
          ...headers,
        },
        body: JSON.stringify(body),
      }),
    );

  it('ghi sự kiện hợp lệ; loại khóa lạ; không lưu IP/UA', async () => {
    const res = await send({ name: 'spread_selected', props: { spreadId: 'three', secret: 'x' } });
    expect(res.status).toBe(204);
    const rows = await c.db.analyticsEvent.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]!.name).toBe('spread_selected');
    expect(rows[0]!.props).toEqual({ spreadId: 'three' });
    const raw = JSON.stringify(rows.map((r) => [r.name, r.visitorHash, r.props]));
    expect(raw).not.toContain(IP);
    expect(raw).not.toContain('Mozilla');
    expect(rows[0]!.visitorHash).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('cùng khách trong ngày → cùng mã; khác UA → khác mã', async () => {
    await send({ name: 'draw_started' });
    await send({ name: 'draw_started' });
    await send({ name: 'draw_started' }, { 'user-agent': 'khác' });
    const hashes = (await c.db.analyticsEvent.findMany()).map((r) => r.visitorHash);
    expect(hashes[0]).toBe(hashes[1]);
    expect(hashes[2]).not.toBe(hashes[0]);
  });

  it('tên lạ, sự kiện chỉ-server, props sai kiểu → 400 và không ghi', async () => {
    expect((await send({ name: 'hack' })).status).toBe(400);
    expect((await send({ name: 'reading_created', props: {} })).status).toBe(400);
    expect((await send({ name: 'cards_picked', props: { count: 9 } })).status).toBe(400);
    expect(await c.db.analyticsEvent.count()).toBe(0);
  });

  it('DNT hoặc Sec-GPC → 204 nhưng không ghi', async () => {
    expect((await send({ name: 'draw_started' }, { dnt: '1' })).status).toBe(204);
    expect((await send({ name: 'draw_started' }, { 'sec-gpc': '1' })).status).toBe(204);
    expect(await c.db.analyticsEvent.count()).toBe(0);
  });

  it('ý niệm không bao giờ lọt vào analytics; reading_created do server ghi', async () => {
    const res = await readings.POST(
      new Request(`${SITE}/api/readings`, {
        method: 'POST',
        headers: {
          origin: SITE,
          'content-type': 'application/json',
          'x-forwarded-for': '198.51.100.200',
        },
        body: JSON.stringify({
          spreadId: 'three',
          intention: 'nỗi lo riêng',
          storeIntention: true,
        }),
      }),
    );
    expect(res.status).toBe(201);
    const rows = await c.db.analyticsEvent.findMany();
    expect(rows.map((r) => r.name)).toEqual(['reading_created']);
    expect(rows[0]!.visitorHash).toBe('server');
    expect(Object.keys(rows[0]!.props as object).sort()).toEqual([
      'allowReversed',
      'dominant',
      'spreadId',
    ]);
    expect(JSON.stringify(rows.map((r) => r.props))).not.toContain('nỗi lo riêng');
  });

  it('cron: sai/thiếu mã → 404; đúng mã → dọn và trả số lượng', async () => {
    const call = (auth?: string) =>
      cron.GET(
        new Request(`${SITE}/api/cron/purge`, {
          headers: auth ? { authorization: auth } : {},
        }),
      );
    expect((await call()).status).toBe(404);
    expect((await call('Bearer sai')).status).toBe(404);

    const old = new Date(Date.now() - 401 * 86_400_000);
    await c.db.analyticsEvent.create({
      data: { name: 'draw_started', occurredAt: old, visitorHash: 'x', props: {} },
    });
    await c.db.analyticsEvent.create({
      data: { name: 'draw_started', visitorHash: 'y', props: {} },
    });
    const ok = await call(`Bearer ${c.env.CRON_SECRET}`);
    expect(ok.status).toBe(200);
    expect(await ok.json()).toMatchObject({ events: 1 });
    expect(await c.db.analyticsEvent.count()).toBe(1);
  });

  it('health: db sống → 200', async () => {
    const res = await health.GET(new Request(`${SITE}/api/health`));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, db: true });
  });
});
