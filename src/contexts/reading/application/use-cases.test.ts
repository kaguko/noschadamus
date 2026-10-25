import { describe, expect, it } from 'vitest';
import { buildReadingHarness } from '@/test-support/reading-harness';
import type { OwnerContext } from './ports';

const owner = (...ids: string[]): OwnerContext => ({ ownedReadingIds: ids });

async function create(h: ReturnType<typeof buildReadingHarness>, extra = {}) {
  const r = await h.createReading.execute({ spreadId: 'three', allowReversed: true, ...extra });
  if (!r.ok) throw new Error(r.error);
  return r.value.readingId;
}

describe('CreateReading', () => {
  it('tạo bản đọc 3 lá từ dữ liệu thật và phát đúng 1 sự kiện', async () => {
    const h = buildReadingHarness(42);
    const id = await create(h);
    const saved = await h.readings.findById(id);
    expect(saved?.cards).toHaveLength(3);
    expect(saved?.cards.map((c) => c.position.key)).toEqual(['past', 'present', 'opening']);
    expect(saved?.interpretation.title.split(' ')).toHaveLength(4);
    expect(h.events.published).toHaveLength(1);
    expect(h.events.published[0]).toMatchObject({
      type: 'ReadingCreated',
      readingId: id,
      spreadId: 'three',
      dominant: saved?.soulMap.dominant,
    });
    expect(JSON.stringify(h.events.published)).not.toContain('intention');
  });

  it('trải một lá', async () => {
    const h = buildReadingHarness(3);
    const r = await h.createReading.execute({ spreadId: 'single', allowReversed: false });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const saved = await h.readings.findById(r.value.readingId);
    expect(saved?.cards).toHaveLength(1);
    expect(saved?.cards[0]?.orientation).toBe('upright');
    expect(saved?.interpretation.synthesis.startsWith('Lá bài này gợi')).toBe(true);
  });

  it('R7: không lưu ý niệm khi storeIntention=false; quá 280 ký tự bị từ chối', async () => {
    const h = buildReadingHarness(5);
    const id1 = await create(h, { intention: 'bí mật của tôi', storeIntention: false });
    expect((await h.readings.findById(id1))?.intention).toBeNull();
    const id2 = await create(h, { intention: 'bí mật của tôi', storeIntention: true });
    expect((await h.readings.findById(id2))?.intention).toBe('bí mật của tôi');
    const tooLong = await h.createReading.execute({
      spreadId: 'three',
      allowReversed: true,
      intention: 'x'.repeat(281),
    });
    expect(tooLong).toEqual({ ok: false, error: 'INTENTION_TOO_LONG' });
  });

  it('spread lạ → SPREAD_NOT_FOUND', async () => {
    const h = buildReadingHarness();
    const r = await h.createReading.execute({
      spreadId: 'celtic' as 'three',
      allowReversed: true,
    });
    expect(r).toEqual({ ok: false, error: 'SPREAD_NOT_FOUND' });
  });

  it('cùng hạt giống → cùng lá bài', async () => {
    const a = buildReadingHarness(9);
    const b = buildReadingHarness(9);
    const ra = await a.readings.findById(await create(a));
    const rb = await b.readings.findById(await create(b));
    expect(ra?.cards.map((c) => c.cardId)).toEqual(rb?.cards.map((c) => c.cardId));
  });
});

describe('GetReadingForOwner / GetSharedReading', () => {
  it('R9: chủ xem được (kèm ý niệm), người khác nhận NOT_FOUND', async () => {
    const h = buildReadingHarness(7);
    const id = await create(h, { intention: 'riêng tư', storeIntention: true });
    const mine = await h.getReadingForOwner.execute({ readingId: id, owner: owner(id) });
    expect(mine.ok && mine.value.intention).toBe('riêng tư');
    expect(mine.ok && mine.value.cards[0]?.imageUrl).toMatch(/^\/cards\/.+\.webp$/);
    const other = await h.getReadingForOwner.execute({ readingId: id, owner: owner('rd_x') });
    expect(other).toEqual({ ok: false, error: 'NOT_FOUND' });
    const missing = await h.getReadingForOwner.execute({ readingId: 'rd_x', owner: owner('rd_x') });
    expect(missing).toEqual({ ok: false, error: 'NOT_FOUND' });
  });

  it('xem chung không bao giờ lộ ý niệm', async () => {
    const h = buildReadingHarness(8);
    const id = await create(h, { intention: 'riêng tư', storeIntention: true });
    const s = await h.shareReading.execute({ readingId: id, owner: owner(id) });
    if (!s.ok) throw new Error();
    const shared = await h.getSharedReading.execute({ token: s.value.token });
    expect(shared.ok && shared.value.intention).toBeNull();
    expect(shared.ok && JSON.stringify(shared.value)).not.toContain('riêng tư');
  });
});

describe('ShareReading / RevokeShare', () => {
  it('idempotent; thu hồi làm token cũ vô hiệu; chia sẻ lại cho token mới', async () => {
    const h = buildReadingHarness(11);
    const id = await create(h);
    const o = owner(id);
    const s1 = await h.shareReading.execute({ readingId: id, owner: o });
    const s1b = await h.shareReading.execute({ readingId: id, owner: o });
    expect(s1.ok && s1b.ok && s1.value.token === s1b.value.token).toBe(true);
    if (!s1.ok) return;

    expect((await h.revokeShare.execute({ readingId: id, owner: o })).ok).toBe(true);
    expect((await h.revokeShare.execute({ readingId: id, owner: o })).ok).toBe(true);
    expect(await h.getSharedReading.execute({ token: s1.value.token })).toEqual({
      ok: false,
      error: 'NOT_FOUND',
    });

    const s2 = await h.shareReading.execute({ readingId: id, owner: o });
    expect(s2.ok && s2.value.token).not.toBe(s1.value.token);
    expect(h.events.published.map((e) => e.type)).toEqual([
      'ReadingCreated',
      'ReadingShared',
      'ShareRevoked',
      'ReadingShared',
    ]);
  });

  it('không phải chủ → NOT_FOUND', async () => {
    const h = buildReadingHarness(12);
    const id = await create(h);
    expect(await h.shareReading.execute({ readingId: id, owner: owner() })).toEqual({
      ok: false,
      error: 'NOT_FOUND',
    });
    expect(await h.revokeShare.execute({ readingId: id, owner: owner() })).toEqual({
      ok: false,
      error: 'NOT_FOUND',
    });
  });
});

describe('ListOwnedReadings', () => {
  it('chỉ trả bản đọc của chủ, mới nhất trước, tối đa 50', async () => {
    const h = buildReadingHarness(13);
    const a = await create(h);
    h.clock.advance(60_000);
    const b = await create(h);
    h.clock.advance(60_000);
    await create(h); // không thuộc chủ
    const list = await h.listOwnedReadings.execute({ owner: owner(a, b) });
    expect(list.map((x) => x.id)).toEqual([b, a]);
    expect(list[0]?.cardImages).toHaveLength(3);
    expect(await h.listOwnedReadings.execute({ owner: owner() })).toEqual([]);
  });
});
