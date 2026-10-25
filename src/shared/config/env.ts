import { z } from 'zod';

/** Biến môi trường (docs/03 mục 11). Thiếu hoặc yếu ở production → dừng khởi động với thông báo rõ. */
const secret = (name: string) =>
  z
    .string({ error: `${name} chưa được đặt` })
    .refine((v) => process.env.NODE_ENV !== 'production' || v.length >= 32, {
      message: `${name} phải dài ít nhất 32 ký tự ở production`,
    });

const schema = z.object({
  DATABASE_URL: z.string({ error: 'DATABASE_URL chưa được đặt' }).min(1),
  NEXT_PUBLIC_SITE_URL: z.url({ error: 'NEXT_PUBLIC_SITE_URL phải là URL đầy đủ' }),
  OWNER_COOKIE_SECRET: secret('OWNER_COOKIE_SECRET'),
  ANALYTICS_SECRET: secret('ANALYTICS_SECRET'),
  CRON_SECRET: secret('CRON_SECRET'),
});

export type Env = z.infer<typeof schema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const r = schema.safeParse(source);
  if (!r.success) {
    const lines = r.error.issues.map((i) => `  - ${i.message}`).join('\n');
    throw new Error(`Cấu hình môi trường không hợp lệ:\n${lines}`);
  }
  return r.data;
}

let cached: Env | null = null;
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
