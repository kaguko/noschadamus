import { describe, expect, it } from 'vitest';
import { randomBase58 } from '@/contexts/reading/infrastructure/crypto-id-generator';
import { OWNER_COOKIE_MAX_IDS, OwnerCookieCodec, withReading } from './owner-cookie';

const codec = new OwnerCookieCodec('test-secret-0123456789abcdef0123456789');
const id = () => `rd_${randomBase58(16)}`;

describe('OwnerCookieCodec', () => {
  it('mã hóa rồi giải mã đúng', () => {
    const ids = [id(), id(), id()];
    expect(codec.decode(codec.encode(ids))).toEqual(ids);
  });

  it('chữ ký sai, bí mật khác, dữ liệu hỏng → rỗng (không throw)', () => {
    const value = codec.encode([id()]);
    const [payload, sig] = value.split('.') as [string, string];
    expect(codec.decode(`${payload}.${sig.slice(0, -2)}xx`)).toEqual([]);
    expect(new OwnerCookieCodec('khac-secret-0123456789abcdef0123').decode(value)).toEqual([]);
    expect(codec.decode('rác')).toEqual([]);
    expect(codec.decode('')).toEqual([]);
    expect(codec.decode(undefined)).toEqual([]);
    expect(codec.decode('.abc')).toEqual([]);
  });

  it('payload giả mạo không qua được chữ ký', () => {
    const forged = Buffer.from(JSON.stringify({ v: 1, ids: ['rd_' + 'A'.repeat(16)] })).toString(
      'base64url',
    );
    expect(codec.decode(`${forged}.${'x'.repeat(43)}`)).toEqual([]);
  });

  it('bỏ id sai định dạng, tối đa 50', () => {
    const many = Array.from({ length: 60 }, id);
    expect(codec.decode(codec.encode(many))).toHaveLength(OWNER_COOKIE_MAX_IDS);
    expect(codec.decode(codec.encode(['khong-hop-le', 'rd_ngan']))).toEqual([]);
  });
});

describe('withReading', () => {
  it('thêm vào đầu, bỏ trùng, cắt còn 50', () => {
    const a = id();
    const b = id();
    expect(withReading([a, b], b)).toEqual([b, a]);
    const many = Array.from({ length: 50 }, id);
    const next = withReading(many, a);
    expect(next).toHaveLength(50);
    expect(next[0]).toBe(a);
    expect(next).not.toContain(many[49]);
  });
});
