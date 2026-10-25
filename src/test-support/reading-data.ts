// Chỉ dùng trong test: nạp dữ liệu thật để chạy các ví dụ vàng.
import axes from '../../data/text/axes.vi.json';
import banned from '../../data/text/banned-terms.vi.json';
import major from '../../data/cards/major.json';
import type { AxisVector } from '@/shared/kernel/axes';
import type { AxisTexts } from '@/contexts/reading/domain/axis-texts';

export const AXIS_TEXTS = axes as unknown as AxisTexts;
export const BANNED_TERMS = banned as string[];

export function majorVector(id: string): AxisVector {
  const card = (major as { id: string; vector: AxisVector }[]).find((c) => c.id === id);
  if (!card) throw new Error(`không có lá ${id}`);
  return card.vector;
}
