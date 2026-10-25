/**
 * In bản đọc dạng văn bản để duyệt nội dung (Cửa kiểm 1).
 *   npm run demo -- --spread three --seed 7
 *   npm run demo -- --spread three --seed 1 --count 20
 *   npm run demo -- --stats 5000        thống kê phân bố trục nổi bật/thưa và tiêu đề
 */
import { displaySoulMap } from '../src/contexts/reading/domain/soul-map';
import { AXIS_LABEL_VI, AXIS_ORDER, type AxisId, type AxisVector } from '../src/shared/kernel/axes';
import { buildReadingHarness } from '../src/test-support/reading-harness';

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback;
}

const bar = (v: number) => '█'.repeat(Math.round(v * 20)).padEnd(20, '·');

async function readingFor(seed: number, spreadId: 'single' | 'three') {
  const h = buildReadingHarness(seed);
  const r = await h.createReading.execute({ spreadId, allowReversed: true });
  if (!r.ok) throw new Error(r.error);
  return (await h.readings.findById(r.value.readingId))!;
}

async function printOne(seed: number, spreadId: 'single' | 'three') {
  const r = await readingFor(seed, spreadId);
  const { soulMap: m, interpretation: it } = r;
  const out: string[] = [];
  out.push(`━━━━━━━━ seed ${seed} · ${spreadId === 'single' ? 'Một lá' : 'Ba lá'} ━━━━━━━━`);
  out.push(`✦ ${it.title}`);
  out.push(`  ${it.tagline}`);
  out.push('');
  for (const c of r.cards) {
    const o = c.orientation === 'reversed' ? 'Ngược' : 'Xuôi';
    out.push(`[${c.position.labelVi}] ${c.nameVi} (${c.nameEn}) · ${o}`);
    out.push(`  Từ khóa: ${c.keywords.join(' · ')}`);
    out.push(`  ${c.meaning}`);
    out.push(`  ❝ ${c.prompt} ❞`);
  }
  out.push('');
  const d = displaySoulMap(m);
  out.push(
    `Bản đồ linh hồn${m.balanced ? ' (cân bằng)' : ''}: giá trị thật | hình vẽ (kéo giãn ×${d.stretch})`,
  );
  for (const a of AXIS_ORDER) {
    const tag =
      a === m.dominant
        ? m.balanced
          ? '  ← hơi nổi'
          : '  ← nổi bật'
        : a === m.quiet
          ? m.balanced
            ? '  ← hơi thưa'
            : '  ← thưa'
          : '';
    out.push(
      `  ${AXIS_LABEL_VI[a].padEnd(11)} ${String(Math.round(m.vector[a] * 100)).padStart(3)} | ${bar(d.vector[a])}${tag}`,
    );
  }
  out.push('');
  out.push(`Điều đáng ngẫm: ${it.synthesis}`);
  out.push(`  ① ${it.closingPrompts[0]}`);
  out.push(`  ② ${it.closingPrompts[1]}`);
  console.log(out.join('\n') + '\n');
}

async function spreadRange(n: number, spreadId: 'single' | 'three') {
  const raw: number[] = [];
  const shown: number[] = [];
  let balanced = 0;
  const rangeOf = (v: AxisVector) => {
    const xs = AXIS_ORDER.map((a) => v[a]);
    return Math.max(...xs) - Math.min(...xs);
  };
  for (let seed = 1; seed <= n; seed++) {
    const m = (await readingFor(seed, spreadId)).soulMap;
    raw.push(rangeOf(m.vector));
    shown.push(rangeOf(displaySoulMap(m).vector));
    if (m.balanced) balanced++;
  }
  const fmt = (xs: number[]) => {
    xs.sort((a, b) => a - b);
    const q = (p: number) => Math.round(xs[Math.floor(p * (xs.length - 1))]! * 100);
    return `trung vị ${q(0.5)}, p10 ${q(0.1)}, p90 ${q(0.9)}`;
  };
  return (
    `thật: ${fmt(raw)} | hình vẽ: ${fmt(shown)} | ` +
    `cân bằng ${((balanced / n) * 100).toFixed(1)}%`
  );
}

async function stats(n: number) {
  console.log('Độ chênh giữa trục cao nhất và thấp nhất:');
  console.log(`  Một lá: ${await spreadRange(Math.min(n, 2000), 'single')}`);
  console.log(`  Ba lá:  ${await spreadRange(Math.min(n, 2000), 'three')}\n`);
  const dominant = new Map<AxisId, number>();
  const quiet = new Map<AxisId, number>();
  const titles = new Map<string, number>();
  for (let seed = 1; seed <= n; seed++) {
    const r = await readingFor(seed, 'three');
    dominant.set(r.soulMap.dominant, (dominant.get(r.soulMap.dominant) ?? 0) + 1);
    quiet.set(r.soulMap.quiet, (quiet.get(r.soulMap.quiet) ?? 0) + 1);
    titles.set(r.interpretation.title, (titles.get(r.interpretation.title) ?? 0) + 1);
  }
  const pct = (x: number) => `${((x / n) * 100).toFixed(1).padStart(5)}%`;
  console.log(`Thống kê ${n} bản đọc ba lá (cho phép ngược):\n`);
  console.log('Trục        Nổi bật   Thưa');
  for (const a of AXIS_ORDER) {
    console.log(
      `${AXIS_LABEL_VI[a].padEnd(11)} ${pct(dominant.get(a) ?? 0)}   ${pct(quiet.get(a) ?? 0)}`,
    );
  }
  const sorted = [...titles.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\nSố tiêu đề khác nhau xuất hiện: ${sorted.length}/30`);
  console.log('Phổ biến nhất:');
  for (const [t, c] of sorted.slice(0, 5)) console.log(`  ${t.padEnd(24)} ${pct(c)}`);
  console.log('Hiếm nhất:');
  for (const [t, c] of sorted.slice(-5)) console.log(`  ${t.padEnd(24)} ${pct(c)}`);
}

async function main() {
  const statsN = process.argv.includes('--stats') ? Number(arg('stats', '5000')) : 0;
  if (statsN > 0) return stats(statsN);
  const spread = arg('spread', 'three') === 'single' ? 'single' : 'three';
  const seed = Number(arg('seed', '1'));
  const count = Number(arg('count', '1'));
  for (let i = 0; i < count; i++) await printOne(seed + i, spread);
}

void main();
