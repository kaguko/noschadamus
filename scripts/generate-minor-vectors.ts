/**
 * Sinh/cập nhật data/cards/minor-{suit}.json theo công thức docs/02 mục 4.
 * Giữ nguyên văn bản đã viết (keywords/meaning/prompts); chỉ ghi đè id, tên, số, vector.
 * Chạy: npx tsx scripts/generate-minor-vectors.ts
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { MINOR_RANKS, SUITS, type Card } from '../src/contexts/tarot/domain/card';
import { TODO } from './lib/card-validation';
import { minorName, minorVector, RANK_NAME } from './lib/minor-cards';

type Text = Pick<Card, 'keywords' | 'meaning' | 'prompts'>;

const root = path.resolve(__dirname, '..');
const seed = JSON.parse(
  readFileSync(path.join(__dirname, 'lib/minor-seed.json'), 'utf8'),
) as Record<string, Text>;

const placeholder: Text = {
  keywords: { upright: [TODO, TODO, TODO], reversed: [TODO, TODO, TODO] },
  meaning: { upright: TODO, reversed: TODO },
  prompts: { upright: [TODO, TODO], reversed: [TODO, TODO] },
};

for (const suit of SUITS) {
  const file = path.join(root, 'data/cards', `minor-${suit}.json`);
  const existing = new Map<string, Text>();
  if (existsSync(file)) {
    for (const c of JSON.parse(readFileSync(file, 'utf8')) as Card[]) existing.set(c.id, c);
  }
  const cards = MINOR_RANKS.map((rank) => {
    const id = `${suit}-${rank}`;
    const text = existing.get(id) ?? seed[id] ?? placeholder;
    return {
      id,
      arcana: 'minor',
      suit,
      rank,
      number: RANK_NAME[rank].number,
      name: minorName(suit, rank),
      keywords: text.keywords,
      meaning: text.meaning,
      prompts: text.prompts,
      vector: minorVector(suit, rank),
    };
  });
  writeFileSync(file, JSON.stringify(cards, null, 2) + '\n', 'utf8');
  console.log(`✓ ${path.relative(root, file)} (${cards.length} lá)`);
}
