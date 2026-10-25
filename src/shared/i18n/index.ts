/**
 * Chuỗi giao diện (docs/05; CLAUDE.md: không hard-code chuỗi trong component).
 * Khóa được định kiểu từ messages/vi.json: thiếu hoặc gõ sai khóa → lỗi biên dịch → build thất bại.
 */
import vi from '../../../messages/vi.json';

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type Messages = typeof vi;
export type MessageKey = Leaves<Messages>;
export type MessageParams = Readonly<Record<string, string | number>>;

const PLACEHOLDER = /\{(\w+)\}/g;

export function translate(messages: unknown, key: string, params?: MessageParams): string {
  let node: unknown = messages;
  for (const part of key.split('.')) {
    node =
      typeof node === 'object' && node !== null
        ? (node as Record<string, unknown>)[part]
        : undefined;
  }
  if (typeof node !== 'string') {
    // Không xảy ra nếu dùng MessageKey; phòng khi khóa động.
    throw new Error(`Thiếu chuỗi giao diện: ${key}`);
  }
  if (!params) return node;
  return node.replace(PLACEHOLDER, (m, name: string) =>
    name in params ? String(params[name]) : m,
  );
}

export function t(key: MessageKey, params?: MessageParams): string {
  return translate(vi, key, params);
}

/** Ngày dạng dd.MM.yyyy theo múi giờ đã cho (mặc định múi giờ của môi trường chạy). */
export function formatDate(iso: string | Date, timeZone?: string): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const parts = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('day')}.${get('month')}.${get('year')}`;
}
