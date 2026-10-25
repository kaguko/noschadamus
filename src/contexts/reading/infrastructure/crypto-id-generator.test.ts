import { describe, expect, it } from 'vitest';
import { CryptoIdGenerator, randomBase58 } from './crypto-id-generator';

describe('CryptoIdGenerator', () => {
  const gen = new CryptoIdGenerator();

  it('readingId: rd_ + 16 ký tự base58, không trùng', () => {
    const ids = new Set(Array.from({ length: 2000 }, () => gen.readingId()));
    expect(ids.size).toBe(2000);
    for (const id of ids) expect(id).toMatch(/^rd_[1-9A-HJ-NP-Za-km-z]{16}$/);
  });

  it('shareToken: 22 ký tự base64url (128 bit)', () => {
    const t = gen.shareToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(gen.shareToken()).not.toBe(t);
  });

  it('base58 phân bố gần đều', () => {
    const counts = new Map<string, number>();
    const s = randomBase58(58 * 400);
    for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1);
    expect(counts.size).toBe(58);
    for (const c of counts.values()) expect(c).toBeGreaterThan(400 * 0.6);
  });
});
