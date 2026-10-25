import { z } from 'zod';
import { AXIS_ORDER } from '../../src/shared/kernel/axes';
import { findBannedTerms } from '../../src/shared/kernel/banned-terms';
import { MINOR_RANKS, SUITS, type Card } from '../../src/contexts/tarot/domain/card';
import { minorVector } from './minor-cards';

/** Quy tắc kiểm dữ liệu bài: docs/02 mục 1. */
export const TODO = '[TODO]';
export const MEANING_MIN = 100;
export const MEANING_MAX = 280;
export const PROMPT_MIN = 20;
export const PROMPT_MAX = 120;
/** Hai `meaning` giống nhau quá ngưỡng này (Jaccard theo từ) bị coi là trùng. */
export const SIMILARITY_MAX = 0.6;

const unit = z.number().min(0).max(1);
const three = z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]);
const two = z.tuple([z.string().min(1), z.string().min(1)]);

export const cardSchema = z
  .object({
    id: z.string(),
    arcana: z.enum(['major', 'minor']),
    suit: z.enum(['wands', 'cups', 'swords', 'pentacles']).nullable(),
    rank: z.enum(MINOR_RANKS as [string, ...string[]]).nullable(),
    number: z.number().int().min(0).max(21),
    name: z.object({ vi: z.string().min(1), en: z.string().min(1) }).strict(),
    keywords: z.object({ upright: three, reversed: three }).strict(),
    meaning: z.object({ upright: z.string().min(1), reversed: z.string().min(1) }).strict(),
    prompts: z.object({ upright: two, reversed: two }).strict(),
    vector: z
      .object(Object.fromEntries(AXIS_ORDER.map((a) => [a, unit])) as Record<string, typeof unit>)
      .strict(),
  })
  .strict();

export interface ValidationIssue {
  cardId: string;
  message: string;
}

export interface ValidateOptions {
  allowTodo: boolean;
  bannedTerms: readonly string[];
}

const words = (s: string) =>
  new Set(
    s
      .toLocaleLowerCase('vi')
      .split(/[^\p{L}]+/u)
      .filter((w) => w.length > 0),
  );

export function jaccard(a: string, b: string): number {
  const A = words(a);
  const B = words(b);
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

const sentenceCount = (s: string) => s.split(/[.!?…]+/).filter((x) => x.trim().length > 0).length;

export function expectedIds(): string[] {
  const majors = Array.from({ length: 22 }, (_, i) => `major-${String(i).padStart(2, '0')}`);
  const minors = SUITS.flatMap((s) => MINOR_RANKS.map((r) => `${s}-${r}`));
  return [...majors, ...minors];
}

export function validateCards(raw: readonly unknown[], opts: ValidateOptions): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const cards: Card[] = [];
  raw.forEach((item, i) => {
    const parsed = cardSchema.safeParse(item);
    const id = (item as { id?: unknown })?.id;
    if (!parsed.success) {
      issues.push({
        cardId: typeof id === 'string' ? id : `#${i}`,
        message: parsed.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join('; '),
      });
    } else {
      cards.push(parsed.data as unknown as Card);
    }
  });

  const expected = expectedIds();
  const ids = cards.map((c) => c.id);
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) issues.push({ cardId: id, message: 'id bị trùng' });
    seen.add(id);
  }
  for (const id of expected) if (!seen.has(id)) issues.push({ cardId: id, message: 'thiếu lá' });
  for (const id of seen) if (!expected.includes(id)) issues.push({ cardId: id, message: 'id lạ' });
  if (raw.length !== 78) issues.push({ cardId: '*', message: `cần 78 lá, có ${raw.length}` });

  for (const c of cards) {
    const add = (message: string) => issues.push({ cardId: c.id, message });

    if (c.arcana === 'major') {
      if (c.suit !== null || c.rank !== null) add('lá Ẩn Chính phải có suit/rank = null');
      if (c.id !== `major-${String(c.number).padStart(2, '0')}`) add('number không khớp id');
    } else {
      if (c.suit === null || c.rank === null) add('lá phụ phải có suit và rank');
      else {
        if (c.id !== `${c.suit}-${c.rank}`) add('id không khớp suit/rank');
        const v = minorVector(c.suit, c.rank as (typeof MINOR_RANKS)[number]);
        for (const a of AXIS_ORDER) {
          if (Math.abs(v[a] - c.vector[a]) > 0.0005)
            add(`vector.${a} lệch công thức (${c.vector[a]} ≠ ${v[a]})`);
        }
      }
    }

    const texts: string[] = [
      ...c.keywords.upright,
      ...c.keywords.reversed,
      c.meaning.upright,
      c.meaning.reversed,
      ...c.prompts.upright,
      ...c.prompts.reversed,
    ];
    const hasTodo = texts.some((t) => t.includes(TODO));
    if (hasTodo) {
      if (!opts.allowTodo) add('còn nội dung [TODO]');
      continue;
    }

    for (const o of ['upright', 'reversed'] as const) {
      const m = c.meaning[o];
      if (m.length < MEANING_MIN || m.length > MEANING_MAX) {
        add(`meaning.${o} dài ${m.length} ký tự (cần ${MEANING_MIN}-${MEANING_MAX})`);
      }
      if (sentenceCount(m) > 3) add(`meaning.${o} quá 3 câu`);
      for (const p of c.prompts[o]) {
        if (!p.trim().endsWith('?')) add(`prompt "${p}" phải kết thúc bằng "?"`);
        if (p.length < PROMPT_MIN || p.length > PROMPT_MAX) {
          add(`prompt "${p}" dài ${p.length} ký tự (cần ${PROMPT_MIN}-${PROMPT_MAX})`);
        }
      }
      for (const k of c.keywords[o]) {
        if (k.split(/\s+/).length > 5) add(`từ khóa "${k}" dài quá 5 âm tiết`);
      }
    }
    for (const t of texts) {
      const banned = findBannedTerms(t, opts.bannedTerms);
      if (banned.length > 0) add(`chứa từ cấm: ${banned.join(', ')} trong "${t}"`);
    }
  }

  const authored = cards.filter(
    (c) => !c.meaning.upright.includes(TODO) && !c.meaning.reversed.includes(TODO),
  );
  for (let i = 0; i < authored.length; i++) {
    for (let j = i + 1; j < authored.length; j++) {
      for (const o of ['upright', 'reversed'] as const) {
        const s = jaccard(authored[i]!.meaning[o], authored[j]!.meaning[o]);
        if (s > SIMILARITY_MAX) {
          issues.push({
            cardId: `${authored[i]!.id}/${authored[j]!.id}`,
            message: `meaning.${o} giống nhau ${(s * 100).toFixed(0)}%`,
          });
        }
      }
    }
  }
  return issues;
}
