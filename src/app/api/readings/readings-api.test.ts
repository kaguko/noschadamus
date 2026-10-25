/**
 * Test tích hợp T14: gọi route handler thật, container thật, Postgres thật (DB test).
 * Bỏ qua khi không có TEST_DATABASE_URL.
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

const TEST_DB = process.env.TEST_DATABASE_URL;
if (TEST_DB) process.env.DATABASE_URL = TEST_DB;
process.env.NEXT_PUBLIC_SITE_URL ??= 'http://localhost:3000';

const SITE = 'http://localhost:3000';

describe.skipIf(!TEST_DB)('API bản đọc (Postgres thật)', async () => {
  const { getContainer } = await import('@/composition/container');
  const list = await import('./route');
  const one = await import('./[id]/route');
  const share = await import('./[id]/share/route');
  const c = getContainer();

  afterAll(async () => {
    await c.db.$disconnect();
  });
  beforeEach(async () => {
    await c.db.reading.deleteMany();
    await c.db.rateLimitBucket.deleteMany();
  });

  let ipCounter = 0;
  const freshIp = () => `198.51.100.${++ipCounter}`;

  const req = (
    method: string,
    path: string,
    opts: { body?: unknown; cookie?: string; origin?: string | null; ip?: string } = {},
  ) => {
    const headers: Record<string, string> = { 'x-forwarded-for': opts.ip ?? '192.0.2.1' };
    if (opts.origin !== null) headers.origin = opts.origin ?? SITE;
    if (opts.cookie) headers.cookie = opts.cookie;
    if (opts.body !== undefined) headers['content-type'] = 'application/json';
    return new Request(`${SITE}${path}`, {
      method,
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
  };
  const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
  const cookieOf = (res: Response) => res.headers.get('set-cookie')?.split(';')[0] ?? '';

  async function create(body: object = { spreadId: 'three' }, cookie?: string) {
    const res = await list.POST(req('POST', '/api/readings', { body, cookie, ip: freshIp() }));
    expect(res.status).toBe(201);
    const json = (await res.json()) as { id: string; path: string };
    return { ...json, cookie: cookieOf(res), res };
  }

  it('tạo → lấy lại bằng cookie chủ; cookie HttpOnly, SameSite=Lax', async () => {
    const { id, path, cookie, res } = await create();
    expect(id).toMatch(/^rd_[1-9A-HJ-NP-Za-km-z]{16}$/);
    expect(path).toBe(`/reading/${id}`);
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toMatch(/nd_owner=/);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=lax/i);
    expect(res.headers.get('x-request-id')).toBeTruthy();

    const got = await one.GET(req('GET', `/api/readings/${id}`, { cookie }), ctx(id));
    expect(got.status).toBe(200);
    expect(got.headers.get('cache-control')).toBe('private, no-store');
    const view = await got.json();
    expect(view.cards).toHaveLength(3);
    expect(view.soulMap.display.vector).toBeDefined();
  });

  it('người khác (không cookie / cookie giả) → 404', async () => {
    const { id } = await create();
    expect((await one.GET(req('GET', `/api/readings/${id}`), ctx(id))).status).toBe(404);
    const forged = await one.GET(
      req('GET', `/api/readings/${id}`, { cookie: 'nd_owner=abc.def' }),
      ctx(id),
    );
    expect(forged.status).toBe(404);
  });

  it('danh sách chỉ gồm bản đọc của chủ, cookie tích lũy', async () => {
    const a = await create();
    const b = await create({ spreadId: 'single' }, a.cookie);
    await create(); // người khác
    const res = await list.GET(req('GET', '/api/readings', { cookie: b.cookie }));
    const { items } = (await res.json()) as { items: { id: string }[] };
    expect(items.map((i) => i.id).sort()).toEqual([a.id, b.id].sort());
  });

  it('R7: ý niệm không được lưu khi storeIntention=false (kiểm trực tiếp DB)', async () => {
    const off = await create({ spreadId: 'three', intention: 'bí mật A', storeIntention: false });
    const on = await create({ spreadId: 'three', intention: 'bí mật B', storeIntention: true });
    const rows = await c.db.reading.findMany({ select: { id: true, intention: true } });
    expect(rows.find((r) => r.id === off.id)?.intention).toBeNull();
    expect(rows.find((r) => r.id === on.id)?.intention).toBe('bí mật B');
    const raw = JSON.stringify(await c.db.reading.findMany());
    expect(raw).not.toContain('bí mật A');
  });

  it('chia sẻ idempotent; thu hồi rồi chia sẻ lại → token mới; người khác không chia sẻ được', async () => {
    const { id, cookie } = await create();
    const s1 = await (
      await share.POST(req('POST', `/api/readings/${id}/share`, { cookie }), ctx(id))
    ).json();
    const s2 = await (
      await share.POST(req('POST', `/api/readings/${id}/share`, { cookie }), ctx(id))
    ).json();
    expect(s1.token).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(s2.token).toBe(s1.token);
    expect(s1.path).toBe(`/s/${s1.token}`);

    const del = await share.DELETE(req('DELETE', `/api/readings/${id}/share`, { cookie }), ctx(id));
    expect(del.status).toBe(204);
    expect(await c.reading.getSharedReading.execute({ token: s1.token })).toEqual({
      ok: false,
      error: 'NOT_FOUND',
    });
    const s3 = await (
      await share.POST(req('POST', `/api/readings/${id}/share`, { cookie }), ctx(id))
    ).json();
    expect(s3.token).not.toBe(s1.token);

    const stranger = await share.POST(req('POST', `/api/readings/${id}/share`), ctx(id));
    expect(stranger.status).toBe(404);
  });

  it('kiểm đầu vào: sai schema 400, body > 4 KB 413, sai content-type 415, Origin lạ 403', async () => {
    const bad = await list.POST(req('POST', '/api/readings', { body: { spreadId: 'celtic' } }));
    expect(bad.status).toBe(400);
    expect((await bad.json()).error.code).toBe('VALIDATION_FAILED');

    const extra = await list.POST(
      req('POST', '/api/readings', { body: { spreadId: 'three', x: 1 } }),
    );
    expect(extra.status).toBe(400);

    const big = await list.POST(
      req('POST', '/api/readings', { body: { spreadId: 'three', intention: 'x'.repeat(5000) } }),
    );
    expect(big.status).toBe(413);

    const text = new Request(`${SITE}/api/readings`, {
      method: 'POST',
      headers: { origin: SITE, 'content-type': 'text/plain' },
      body: '{}',
    });
    expect((await list.POST(text)).status).toBe(415);

    const evil = await list.POST(
      req('POST', '/api/readings', { body: { spreadId: 'three' }, origin: 'https://evil.example' }),
    );
    expect(evil.status).toBe(403);
    const noOrigin = await list.POST(
      req('POST', '/api/readings', { body: { spreadId: 'three' }, origin: null }),
    );
    expect(noOrigin.status).toBe(403);
    expect(await c.db.reading.count()).toBe(0);
  });

  it('vượt giới hạn tần suất → 429 kèm Retry-After', async () => {
    const ip = '203.0.113.99';
    const statuses: number[] = [];
    let retryAfter: string | null = null;
    // 12 yêu cầu: dù có rơi qua ranh giới phút, một cửa sổ vẫn có ≥ 6 (giới hạn 5/phút).
    for (let i = 0; i < 12; i++) {
      const res = await list.POST(
        req('POST', '/api/readings', { body: { spreadId: 'single' }, ip }),
      );
      statuses.push(res.status);
      if (res.status === 429) retryAfter = res.headers.get('retry-after');
    }
    expect(statuses).toContain(429);
    expect(Number(retryAfter)).toBeGreaterThan(0);
  });
});
