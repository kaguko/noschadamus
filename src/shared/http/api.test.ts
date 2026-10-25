import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { parseEnv } from '@/shared/config/env';
import {
  ApiError,
  assertSameOrigin,
  handle,
  MAX_BODY_BYTES,
  rateLimitSubject,
  readJson,
} from './api';

const SITE = 'https://noschadamus.app';
const post = (body: string, headers: Record<string, string> = {}) =>
  new Request(`${SITE}/api/x`, {
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json', origin: SITE, ...headers },
  });
const schema = z.object({ a: z.number() }).strict();

describe('readJson', () => {
  it('đọc và kiểm schema', async () => {
    expect(await readJson(post('{"a":1}'), schema)).toEqual({ a: 1 });
  });
  it('sai content-type → 415', async () => {
    await expect(
      readJson(post('{}', { 'content-type': 'text/plain' }), schema),
    ).rejects.toMatchObject({
      code: 'UNSUPPORTED_MEDIA_TYPE',
    });
  });
  it('quá 4 KB → 413', async () => {
    const big = JSON.stringify({ a: 1, pad: 'x'.repeat(MAX_BODY_BYTES) });
    await expect(readJson(post(big), schema)).rejects.toMatchObject({ code: 'PAYLOAD_TOO_LARGE' });
  });
  it('JSON hỏng hoặc sai schema → 400 kèm chi tiết', async () => {
    await expect(readJson(post('{oops'), schema)).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
    });
    await expect(readJson(post('{"a":"x","b":1}'), schema)).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      details: expect.arrayContaining([expect.objectContaining({ path: 'a' })]),
    });
  });
});

describe('assertSameOrigin', () => {
  it('cho phép đúng origin, chặn origin lạ hoặc thiếu', () => {
    expect(() => assertSameOrigin(post('{}'), SITE)).not.toThrow();
    expect(() => assertSameOrigin(post('{}', { origin: 'https://evil.example' }), SITE)).toThrow(
      ApiError,
    );
    const noOrigin = new Request(`${SITE}/api/x`, { method: 'POST' });
    expect(() => assertSameOrigin(noOrigin, SITE)).toThrow(ApiError);
  });
});

describe('handle', () => {
  it('gắn x-request-id; ApiError → phản hồi chuẩn; lỗi lạ → 500 không lộ chi tiết', async () => {
    const ok = await handle(async () => Response.json({ ok: true }))(post('{}'));
    expect(ok.headers.get('x-request-id')).toMatch(/[0-9a-f-]{36}/);

    const rl = await handle(async () => {
      throw new ApiError('RATE_LIMITED', undefined, { 'Retry-After': '30' });
    })(post('{}'));
    expect(rl.status).toBe(429);
    expect(rl.headers.get('retry-after')).toBe('30');
    expect((await rl.json()).error.code).toBe('RATE_LIMITED');

    const original = console.error;
    console.error = () => {};
    const boom = await handle(async () => {
      throw new Error('bí mật nội bộ');
    })(post('{}'));
    console.error = original;
    expect(boom.status).toBe(500);
    expect(await boom.text()).not.toContain('bí mật nội bộ');
  });
});

describe('rateLimitSubject', () => {
  it('băm IP, không chứa IP gốc, ổn định', () => {
    const req = new Request(SITE, { headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' } });
    const s = rateLimitSubject(req, 'secret');
    expect(s).not.toContain('203.0.113.7');
    expect(rateLimitSubject(req, 'secret')).toBe(s);
    expect(rateLimitSubject(req, 'khac')).not.toBe(s);
  });
});

describe('parseEnv', () => {
  const ok = {
    DATABASE_URL: 'postgresql://x',
    NEXT_PUBLIC_SITE_URL: 'https://noschadamus.app',
    OWNER_COOKIE_SECRET: 'a'.repeat(32),
    ANALYTICS_SECRET: 'b'.repeat(32),
    CRON_SECRET: 'c'.repeat(32),
  };
  it('hợp lệ', () => {
    expect(parseEnv(ok).NEXT_PUBLIC_SITE_URL).toBe('https://noschadamus.app');
  });
  it('thiếu biến → thông báo rõ từng biến', () => {
    expect(() => parseEnv({ ...ok, DATABASE_URL: undefined, NEXT_PUBLIC_SITE_URL: 'abc' })).toThrow(
      /DATABASE_URL[\s\S]*NEXT_PUBLIC_SITE_URL/,
    );
  });
});
