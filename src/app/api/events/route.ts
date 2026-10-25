import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getContainer } from '@/composition/container';
import { ApiError, assertSameOrigin, clientIp, handle, readJson } from '@/shared/http/api';
import { RATE_LIMITS } from '@/shared/http/rate-limit';
import { enforceRateLimit } from '../_lib/owner';

const FORMAT = z.enum(['story', 'portrait', 'og']);

/**
 * Props cho phép theo từng sự kiện (docs/03 mục 9). zod mặc định LOẠI BỎ khóa lạ.
 * `reading_created` không có ở đây: chỉ server phát.
 */
const PROPS = {
  landing_view: z.object({ ref: z.enum(['direct', 'share', 'other']).default('direct') }),
  draw_started: z.object({}),
  spread_selected: z.object({ spreadId: z.enum(['single', 'three']) }),
  intention_entered: z.object({ hasText: z.boolean() }),
  cards_picked: z.object({ count: z.number().int().min(1).max(3) }),
  reading_viewed: z.object({ mode: z.enum(['owner', 'shared']), firstView: z.boolean() }),
  share_opened: z.object({}),
  share_image_downloaded: z.object({ format: FORMAT }),
  share_native_used: z.object({
    format: FORMAT,
    result: z.enum(['shared', 'cancelled', 'unsupported']),
  }),
  share_link_created: z.object({}),
  share_link_revoked: z.object({}),
  shared_view_cta_clicked: z.object({}),
  reading_abandoned: z.object({ step: z.enum(['spread', 'intention', 'pick']) }),
} as const;

const body = z.object({
  name: z.enum(Object.keys(PROPS) as [keyof typeof PROPS, ...(keyof typeof PROPS)[]]),
  props: z.record(z.string(), z.unknown()).default({}),
});

export const POST = handle(async (req) => {
  const c = getContainer();
  assertSameOrigin(req, c.env.NEXT_PUBLIC_SITE_URL);
  // Tôn trọng tín hiệu không theo dõi: bỏ qua im lặng.
  if (req.headers.get('sec-gpc') === '1' || req.headers.get('dnt') === '1') {
    return new NextResponse(null, { status: 204 });
  }
  const { name, props } = await readJson(req, body);
  const parsed = PROPS[name].safeParse(props);
  if (!parsed.success) {
    throw new ApiError(
      'VALIDATION_FAILED',
      parsed.error.issues.map((i) => ({ path: `props.${i.path.join('.')}`, issue: i.code })),
    );
  }
  await enforceRateLimit(req, c, RATE_LIMITS.events);
  await c.analytics.recordEvent.execute({
    name,
    props: parsed.data,
    visitorHash: c.analytics.visitorHashOf(clientIp(req), req.headers.get('user-agent') ?? ''),
  });
  return new NextResponse(null, { status: 204 });
});
