import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { expectedIds, jaccard, validateCards } from './card-validation';

const root = path.resolve(__dirname, '../..');
const load = (rel: string) => JSON.parse(readFileSync(path.join(root, rel), 'utf8')) as unknown[];
const all = () =>
  ['major', 'minor-wands', 'minor-cups', 'minor-swords', 'minor-pentacles'].flatMap((f) =>
    load(`data/cards/${f}.json`),
  );
const banned = load('data/text/banned-terms.vi.json') as string[];

describe('validateCards', () => {
  it('dữ liệu hiện tại hợp lệ ở chế độ cho phép [TODO]', () => {
    expect(validateCards(all(), { allowTodo: true, bannedTerms: banned })).toEqual([]);
  });

  it('có 78 id mong đợi', () => {
    expect(expectedIds()).toHaveLength(78);
  });

  it('bắt lỗi: thiếu lá, vector ngoài [0,1], từ cấm, prompt thiếu dấu hỏi', () => {
    const cards = all() as Record<string, unknown>[];
    const broken = cards.slice(1).map((c) => structuredClone(c));
    const star = broken.find((c) => c.id === 'major-17') as {
      vector: Record<string, number>;
      meaning: Record<string, string>;
      prompts: Record<string, string[]>;
    };
    star.vector.energy = 1.2;
    const fool = broken.find((c) => c.id === 'major-13') as typeof star;
    fool.meaning.upright =
      'Đây là định mệnh của bạn, một chương đang khép lại để chừa chỗ cho chương khác, và bạn được phép tiễn nó.';
    fool.prompts.upright![0] = 'Điều gì đã làm xong nhiệm vụ của nó trong đời bạn.';
    const msgs = validateCards(broken, { allowTodo: true, bannedTerms: banned }).map(
      (i) => `${i.cardId}: ${i.message}`,
    );
    expect(msgs.some((m) => m.startsWith('major-00: thiếu lá'))).toBe(true);
    expect(msgs.some((m) => m.startsWith('major-17') && m.includes('vector'))).toBe(true);
    expect(msgs.some((m) => m.includes('định mệnh'))).toBe(true);
    expect(msgs.some((m) => m.includes('kết thúc bằng "?"'))).toBe(true);
  });

  it('chế độ nghiêm ngặt từ chối [TODO]', () => {
    const issues = validateCards(all(), { allowTodo: false, bannedTerms: banned });
    expect(issues.some((i) => i.message === 'còn nội dung [TODO]')).toBe(true);
  });

  it('jaccard', () => {
    expect(jaccard('a b c', 'a b c')).toBe(1);
    expect(jaccard('a b', 'c d')).toBe(0);
  });
});
