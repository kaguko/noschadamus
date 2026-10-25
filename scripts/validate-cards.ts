/**
 * Kiểm dữ liệu 78 lá (docs/02 mục 1).
 *   npm run cards:validate             cho phép nội dung [TODO]
 *   npm run cards:validate -- --strict không cho phép [TODO]
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { validateCards } from './lib/card-validation';

const root = path.resolve(__dirname, '..');
const read = (rel: string): unknown => JSON.parse(readFileSync(path.join(root, rel), 'utf8'));

const FILES = [
  'data/cards/major.json',
  'data/cards/minor-wands.json',
  'data/cards/minor-cups.json',
  'data/cards/minor-swords.json',
  'data/cards/minor-pentacles.json',
];

const strict = process.argv.includes('--strict');
const cards = FILES.flatMap((f) => read(f) as unknown[]);
const bannedTerms = read('data/text/banned-terms.vi.json') as string[];
const issues = validateCards(cards, { allowTodo: !strict, bannedTerms });

const todo = cards.filter((c) => JSON.stringify(c).includes('[TODO]')).length;
if (issues.length > 0) {
  for (const i of issues) console.error(`✗ ${i.cardId}: ${i.message}`);
  console.error(`\n${issues.length} lỗi.`);
  process.exit(1);
}
console.log(
  `✓ ${cards.length} lá hợp lệ (${strict ? 'nghiêm ngặt' : 'cho phép [TODO]'}; còn ${todo} lá [TODO]).`,
);
