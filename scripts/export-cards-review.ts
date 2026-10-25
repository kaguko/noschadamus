/**
 * Xuất docs/cards-review.md từ data/cards/*.json để đọc duyệt nội dung.
 * Chạy: npm run cards:review
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Card } from '../src/contexts/tarot/domain/card';

const root = path.resolve(__dirname, '..');
const GROUPS: [string, string][] = [
  ['Ẩn Chính', 'major'],
  ['Bộ Gậy', 'minor-wands'],
  ['Bộ Cốc', 'minor-cups'],
  ['Bộ Kiếm', 'minor-swords'],
  ['Bộ Tiền', 'minor-pentacles'],
];
/** Lá nặng, nên đọc kỹ giọng văn. */
const HEAVY = new Set([
  'major-13',
  'major-15',
  'major-16',
  'swords-3',
  'swords-9',
  'swords-10',
  'pentacles-5',
]);

const out: string[] = [
  '# Duyệt nội dung 78 lá',
  '',
  'Tự sinh từ `data/cards/*.json` bằng `npm run cards:review`. Muốn sửa, sửa trong file JSON rồi chạy `npm run cards:validate -- --strict` và xuất lại file này.',
  '',
  'Đánh dấu ⚠ là các lá nặng nên đọc kỹ.',
  '',
];

for (const [title, file] of GROUPS) {
  out.push(`## ${title}`, '');
  const cards = JSON.parse(
    readFileSync(path.join(root, 'data/cards', `${file}.json`), 'utf8'),
  ) as Card[];
  for (const c of cards) {
    out.push(`### ${c.name.vi} · ${c.name.en}${HEAVY.has(c.id) ? ' ⚠' : ''}`, `\`${c.id}\``, '');
    for (const [o, label] of [
      ['upright', 'Xuôi'],
      ['reversed', 'Ngược'],
    ] as const) {
      out.push(`**${label}** (${c.keywords[o].join(' · ')})`, '', c.meaning[o], '');
      for (const p of c.prompts[o]) out.push(`- ${p}`);
      out.push('');
    }
  }
}

writeFileSync(path.join(root, 'docs/cards-review.md'), out.join('\n'), 'utf8');
console.log('✓ docs/cards-review.md');
