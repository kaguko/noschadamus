import { createHash, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { z } from 'zod';

/** Chuẩn lỗi API (docs/03 mục 7). */
export type ApiErrorCode =
  | 'VALIDATION_FAILED'
  | 'NOT_FOUND'
  | 'FORBIDDEN_ORIGIN'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'PAYLOAD_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'INTERNAL';

const STATUS: Record<ApiErrorCode, number> = {
  VALIDATION_FAILED: 400,
  NOT_FOUND: 404,
  FORBIDDEN_ORIGIN: 403,
  UNSUPPORTED_MEDIA_TYPE: 415,
  PAYLOAD_TOO_LARGE: 413,
  RATE_LIMITED: 429,
  INTERNAL: 500,
};

const MESSAGE: Record<ApiErrorCode, string> = {
  VALIDATION_FAILED: 'Nội dung không hợp lệ.',
  NOT_FOUND: 'Không tìm thấy.',
  FORBIDDEN_ORIGIN: 'Yêu cầu không đến từ trang hợp lệ.',
  UNSUPPORTED_MEDIA_TYPE: 'Chỉ nhận application/json.',
  PAYLOAD_TOO_LARGE: 'Nội dung quá lớn.',
  RATE_LIMITED: 'Bạn thao tác hơi nhanh, hãy thử lại sau ít phút.',
  INTERNAL: 'Có lỗi xảy ra.',
};

export const MAX_BODY_BYTES = 4 * 1024;

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    readonly details?: { path: string; issue: string }[],
    readonly headers?: Record<string, string>,
  ) {
    super(code);
  }
}

export function newRequestId(): string {
  return randomUUID();
}

export function errorResponse(e: ApiError, requestId: string): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: e.code,
        message: MESSAGE[e.code],
        ...(e.details ? { details: e.details } : {}),
      },
    },
    { status: STATUS[e.code], headers: { 'x-request-id': requestId, ...e.headers } },
  );
}

/** Ghi đổi (POST/DELETE): Origin phải trùng trang; POST còn phải là JSON. */
export function assertSameOrigin(req: Request, siteUrl: string): void {
  const origin = req.headers.get('origin');
  const allowed = new Set([new URL(siteUrl).origin, new URL(req.url).origin]);
  if (!origin || !allowed.has(origin)) throw new ApiError('FORBIDDEN_ORIGIN');
}

export async function readJson<S extends z.ZodType>(req: Request, schema: S): Promise<z.infer<S>> {
  const type = req.headers.get('content-type') ?? '';
  if (!type.toLowerCase().startsWith('application/json'))
    throw new ApiError('UNSUPPORTED_MEDIA_TYPE');
  const declared = Number(req.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY_BYTES) throw new ApiError('PAYLOAD_TOO_LARGE');
  const text = await req.text();
  if (Buffer.byteLength(text, 'utf8') > MAX_BODY_BYTES) throw new ApiError('PAYLOAD_TOO_LARGE');
  let data: unknown;
  try {
    data = text.length === 0 ? {} : JSON.parse(text);
  } catch {
    throw new ApiError('VALIDATION_FAILED', [{ path: '', issue: 'invalid_json' }]);
  }
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError(
      'VALIDATION_FAILED',
      parsed.error.issues.map((i) => ({ path: i.path.join('.'), issue: i.code })),
    );
  }
  return parsed.data;
}

/** IP từ proxy (Vercel đặt x-forwarded-for). Chỉ dùng để băm, không bao giờ lưu. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

/** Khóa ẩn danh cho giới hạn tần suất: băm IP với bí mật, không lưu IP. */
export function rateLimitSubject(req: Request, secret: string): string {
  return createHash('sha256')
    .update(`${secret}:rl:${clientIp(req)}`)
    .digest('base64url')
    .slice(0, 32);
}

/** Bọc route handler: gắn x-request-id, đổi ApiError thành phản hồi chuẩn, che lỗi lạ. */
export function handle(
  fn: (
    req: Request,
    ctx: { requestId: string; params: Record<string, string> },
  ) => Promise<Response>,
) {
  return async (req: Request, routeCtx?: { params?: Promise<Record<string, string>> }) => {
    const requestId = newRequestId();
    const started = Date.now();
    const params = (await routeCtx?.params) ?? {};
    try {
      const res = await fn(req, { requestId, params });
      res.headers.set('x-request-id', requestId);
      return res;
    } catch (e) {
      if (e instanceof ApiError) return errorResponse(e, requestId);
      console.error(
        JSON.stringify({
          level: 'error',
          msg: 'unhandled',
          requestId,
          route: new URL(req.url).pathname,
          durationMs: Date.now() - started,
          error: e instanceof Error ? e.message : String(e),
        }),
      );
      return errorResponse(new ApiError('INTERNAL'), requestId);
    }
  };
}
