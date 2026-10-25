import { beforeEach, describe, expect, it } from 'vitest';
import type { ReadingRepository } from '@/contexts/reading/application/ports';
import {
  assembleReading,
  revokeShare,
  shareReading,
  type DrawnCardSource,
  type Reading,
} from '@/contexts/reading/domain';
import type { AxisVector } from '@/shared/kernel/axes';
import { AXIS_TEXTS } from './reading-data';

const DAY = 86_400_000;
const T0 = new Date('2026-01-01T00:00:00Z');

const V: AxisVector = {
  energy: 0.6,
  emotion: 0.4,
  connection: 0.5,
  grounding: 0.3,
  mind: 0.7,
  change: 0.2,
};

const card = (i: number): DrawnCardSource => ({
  position: { index: i, key: `p${i}`, labelVi: `Vị trí ${i}`, descriptionVi: 'mô tả', weight: 1 },
  cardId: `major-0${i}`,
  nameVi: `Lá ${i}`,
  nameEn: `Card ${i}`,
  arcana: 'major',
  suit: null,
  number: i,
  orientation: i % 2 ? 'reversed' : 'upright',
  keywords: ['một', 'hai', 'ba'],
  meaning: 'Ý nghĩa có dấu tiếng Việt: ềếổữ.',
  prompts: [`câu ${i}a?`, `câu ${i}b?`],
  effectiveVector: V,
});

export function makeReading(id: string, createdAt = T0, intention: string | null = null): Reading {
  const r = assembleReading({
    id,
    createdAt,
    spreadId: 'three',
    allowReversed: true,
    expectedCount: 3,
    cards: [card(0), card(1), card(2)],
    intention: intention ?? undefined,
    storeIntention: intention !== null,
    texts: AXIS_TEXTS,
  });
  if (!r.ok) throw new Error(r.error);
  return r.value;
}

/**
 * Bộ test hợp đồng chạy chung cho mọi bản cài đặt ReadingRepository,
 * để bản trong bộ nhớ (dùng trong test) và bản Postgres hành xử giống nhau.
 */
export function readingRepositoryContract(
  name: string,
  setup: () => Promise<ReadingRepository>,
  opts: { skip?: boolean } = {},
) {
  describe.skipIf(opts.skip ?? false)(`ReadingRepository hợp đồng: ${name}`, () => {
    let repo: ReadingRepository;
    beforeEach(async () => {
      repo = await setup();
    });

    it('lưu rồi đọc lại giống hệt (kể cả dấu tiếng Việt, ngày, ý niệm)', async () => {
      const r = makeReading('rd_contract01', T0, 'ý niệm riêng tư');
      await repo.save(r);
      const back = await repo.findById(r.id);
      expect(back).toEqual(r);
      expect(Object.isFrozen(back)).toBe(true);
    });

    it('id không tồn tại → null', async () => {
      expect(await repo.findById('rd_khongco')).toBeNull();
      expect(await repo.findByShareToken('tok_khongco')).toBeNull();
    });

    it('chia sẻ, tìm theo token, thu hồi', async () => {
      const r = makeReading('rd_contract02');
      await repo.save(r);
      const shared = shareReading(r, 'tok_contract02', new Date('2026-01-02T00:00:00Z'));
      await repo.updateShare(r.id, shared.share);
      expect((await repo.findByShareToken('tok_contract02'))?.share).toEqual(shared.share);
      await repo.updateShare(r.id, revokeShare(shared).share);
      expect(await repo.findByShareToken('tok_contract02')).toBeNull();
      expect((await repo.findById(r.id))?.share).toBeNull();
    });

    it('findManyByIds: chỉ các id yêu cầu, mới nhất trước, tôn trọng limit', async () => {
      await repo.save(makeReading('rd_c_a', new Date(T0.getTime() + 1000)));
      await repo.save(makeReading('rd_c_b', new Date(T0.getTime() + 2000)));
      await repo.save(makeReading('rd_c_c', new Date(T0.getTime() + 3000)));
      const got = await repo.findManyByIds(['rd_c_a', 'rd_c_c', 'rd_c_x'], 10);
      expect(got.map((r) => r.id)).toEqual(['rd_c_c', 'rd_c_a']);
      expect(await repo.findManyByIds(['rd_c_a', 'rd_c_b', 'rd_c_c'], 2)).toHaveLength(2);
      expect(await repo.findManyByIds([], 10)).toEqual([]);
    });

    it('deleteExpired: chưa chia sẻ 180 ngày, đã chia sẻ 730 ngày, tính từ lần xem cuối', async () => {
      const unshared = makeReading('rd_exp_u', T0);
      const sharedOld = makeReading('rd_exp_s', T0);
      const viewedLater = makeReading('rd_exp_v', T0);
      await repo.save(unshared);
      await repo.save(sharedOld);
      await repo.save(viewedLater);
      await repo.updateShare(sharedOld.id, { token: 'tok_exp_s', sharedAt: T0 });
      await repo.markViewed(viewedLater.id, new Date(T0.getTime() + 100 * DAY));
      await repo.markViewed('rd_khongco', T0);

      expect(await repo.deleteExpired(new Date(T0.getTime() + 179 * DAY))).toBe(0);
      expect(await repo.deleteExpired(new Date(T0.getTime() + 181 * DAY))).toBe(1);
      expect(await repo.findById(unshared.id)).toBeNull();
      expect(await repo.findById(viewedLater.id)).not.toBeNull();
      expect(await repo.deleteExpired(new Date(T0.getTime() + 281 * DAY))).toBe(1);
      expect(await repo.findById(sharedOld.id)).not.toBeNull();
      expect(await repo.deleteExpired(new Date(T0.getTime() + 731 * DAY))).toBe(1);
      expect(await repo.findById(sharedOld.id)).toBeNull();
    });
  });
}
