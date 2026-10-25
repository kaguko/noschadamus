import type { AxisVector } from '@/shared/kernel/axes';
import { err, ok, type Result } from '@/shared/kernel/result';
import type { AxisTexts } from './axis-texts';
import { composeInterpretation, type Interpretation } from './interpretation';
import { computeSoulMap, type SoulMap } from './soul-map';

export type ReadingId = string;
export type ShareToken = string;
export type SpreadId = 'single' | 'three';
export type Orientation = 'upright' | 'reversed';

export const INTENTION_MAX = 280;

export interface PositionSnapshot {
  readonly index: number;
  readonly key: string;
  readonly labelVi: string;
  readonly descriptionVi: string;
  readonly weight: number;
}

/** Bản chụp lá bài tại thời điểm rút: không tham chiếu entity của tarot (docs/01 mục 3.1). */
export interface DrawnCard {
  readonly position: PositionSnapshot;
  readonly cardId: string;
  readonly nameVi: string;
  readonly nameEn: string;
  readonly arcana: 'major' | 'minor';
  readonly suit: string | null;
  readonly number: number;
  readonly orientation: Orientation;
  readonly keywords: readonly [string, string, string];
  readonly meaning: string;
  readonly prompt: string;
  readonly effectiveVector: AxisVector;
}

export interface ReadingShare {
  readonly token: ShareToken;
  readonly sharedAt: Date;
}

/** Aggregate root. Bất biến trừ `share` (R2). */
export interface Reading {
  readonly id: ReadingId;
  readonly createdAt: Date;
  readonly schemaVersion: 1;
  readonly locale: 'vi';
  readonly spreadId: SpreadId;
  readonly allowReversed: boolean;
  readonly cards: readonly DrawnCard[];
  readonly soulMap: SoulMap;
  readonly interpretation: Interpretation;
  readonly intention: string | null;
  readonly share: ReadingShare | null;
}

/** Một lá đã rút, như context tarot trả về qua cổng (đã áp hướng). */
export interface DrawnCardSource {
  readonly position: PositionSnapshot;
  readonly cardId: string;
  readonly nameVi: string;
  readonly nameEn: string;
  readonly arcana: 'major' | 'minor';
  readonly suit: string | null;
  readonly number: number;
  readonly orientation: Orientation;
  readonly keywords: readonly [string, string, string];
  readonly meaning: string;
  readonly prompts: readonly [string, string];
  readonly effectiveVector: AxisVector;
}

export interface AssembleInput {
  readonly id: ReadingId;
  readonly createdAt: Date;
  readonly spreadId: SpreadId;
  readonly allowReversed: boolean;
  readonly expectedCount: number;
  readonly cards: readonly DrawnCardSource[];
  readonly intention?: string;
  readonly storeIntention?: boolean;
  readonly texts: AxisTexts;
}

export type AssembleError = 'INVALID_DRAW' | 'INTENTION_TOO_LONG';

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value) && !(value instanceof Date)) {
    for (const v of Object.values(value)) deepFreeze(v);
    Object.freeze(value);
  }
  return value;
}

/** Chuẩn hóa ý niệm: chỉ giữ khi người dùng đồng ý lưu (R7). */
export function normalizeIntention(
  intention: string | undefined,
  storeIntention: boolean | undefined,
): Result<string | null, 'INTENTION_TOO_LONG'> {
  const trimmed = intention?.trim() ?? '';
  if ([...trimmed].length > INTENTION_MAX) return err('INTENTION_TOO_LONG');
  return ok(storeIntention === true && trimmed.length > 0 ? trimmed : null);
}

/** Dựng Reading hoàn chỉnh từ các lá đã rút: snapshot + Soul Map + diễn giải. */
export function assembleReading(input: AssembleInput): Result<Reading, AssembleError> {
  const ids = input.cards.map((c) => c.cardId);
  if (input.cards.length !== input.expectedCount || new Set(ids).size !== ids.length) {
    return err('INVALID_DRAW');
  }
  const intention = normalizeIntention(input.intention, input.storeIntention);
  if (!intention.ok) return intention;

  const soulMap = computeSoulMap(
    input.cards.map((c) => ({ weight: c.position.weight, vector: c.effectiveVector })),
  );
  const { interpretation, chosenCardPrompts } = composeInterpretation({
    readingId: input.id,
    spreadId: input.spreadId,
    cardPrompts: input.cards.map((c) => c.prompts),
    soulMap,
    texts: input.texts,
  });

  const cards: DrawnCard[] = input.cards.map((c, i) => ({
    position: { ...c.position },
    cardId: c.cardId,
    nameVi: c.nameVi,
    nameEn: c.nameEn,
    arcana: c.arcana,
    suit: c.suit,
    number: c.number,
    orientation: c.orientation,
    keywords: [...c.keywords] as unknown as readonly [string, string, string],
    meaning: c.meaning,
    prompt: chosenCardPrompts[i]!,
    effectiveVector: { ...c.effectiveVector },
  }));

  return ok(
    deepFreeze<Reading>({
      id: input.id,
      createdAt: input.createdAt,
      schemaVersion: 1,
      locale: 'vi',
      spreadId: input.spreadId,
      allowReversed: input.allowReversed,
      cards,
      soulMap,
      interpretation,
      intention: intention.value,
      share: null,
    }),
  );
}

/** Dựng lại Reading từ kho lưu trữ (đã kiểm hợp lệ ở hạ tầng). */
export function rehydrateReading(r: Reading): Reading {
  return deepFreeze({ ...r });
}

/**
 * Chia sẻ (idempotent): đã chia sẻ thì giữ nguyên token hiện tại; chưa thì dùng token mới.
 * Sau khi thu hồi, lần chia sẻ tiếp theo luôn dùng token mới do người gọi cấp (R6, R8).
 */
export function shareReading(r: Reading, newToken: ShareToken, now: Date): Reading {
  if (r.share) return r;
  return deepFreeze({ ...r, share: { token: newToken, sharedAt: now } });
}

export function revokeShare(r: Reading): Reading {
  if (!r.share) return r;
  return deepFreeze({ ...r, share: null });
}
