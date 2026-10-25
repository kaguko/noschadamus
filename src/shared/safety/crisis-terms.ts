import { findBannedTerms } from '@/shared/kernel/banned-terms';

/**
 * Cụm từ gợi ý khủng hoảng (docs/05 mục 2.2). Chỉ dùng ở client để hiện thông điệp quan tâm;
 * KHÔNG chặn luồng, KHÔNG gửi đi, KHÔNG ghi log.
 */
export const CRISIS_TERMS = [
  'tự tử',
  'tự sát',
  'không muốn sống',
  'muốn chết',
  'tự làm đau mình',
  'tự làm hại mình',
  'kết thúc cuộc đời',
] as const;

export function mentionsCrisis(text: string): boolean {
  return text.trim().length > 0 && findBannedTerms(text, CRISIS_TERMS).length > 0;
}
