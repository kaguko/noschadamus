/**
 * Xử lý ảnh lá bài (docs/02 mục 10, docs/07 T17).
 *   Đầu vào: assets/card-art-src/{id}.{jpg,jpeg,png,webp} (không commit; chủ dự án cung cấp)
 *   Đầu ra:  public/cards/{id}.webp      560×960, chất lượng 80 (≤ 60 KB)
 *            public/cards/og/{id}.jpg    300×514 (cho ảnh chia sẻ)
 *            src/components/tarot-card/card-art-manifest.json (danh sách id đã có ảnh)
 *   Chạy: npm run cards:art            (bỏ qua lá thiếu ảnh, dùng mặt dự phòng)
 *         npm run cards:art -- --strict (thiếu bất kỳ lá nào → lỗi)
 */
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { expectedIds } from './lib/card-validation';

const root = path.resolve(__dirname, '..');
const SRC = path.join(root, 'assets/card-art-src');
const OUT = path.join(root, 'public/cards');
const OUT_OG = path.join(OUT, 'og');
const MANIFEST = path.join(root, 'src/components/tarot-card/card-art-manifest.json');
const EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_WEBP_BYTES = 60 * 1024;

async function main() {
  const strict = process.argv.includes('--strict');
  mkdirSync(OUT_OG, { recursive: true });
  const files = existsSync(SRC) ? readdirSync(SRC) : [];
  const done: string[] = [];
  const missing: string[] = [];

  for (const id of expectedIds()) {
    const file = files.find(
      (f) => path.parse(f).name === id && EXTS.includes(path.extname(f).toLowerCase()),
    );
    if (!file) {
      missing.push(id);
      continue;
    }
    const input = sharp(path.join(SRC, file)).rotate();
    // Tỉ lệ 7:12; cắt giữa nếu ảnh gốc khác tỉ lệ.
    let quality = 80;
    const webp = path.join(OUT, `${id}.webp`);
    do {
      await input.clone().resize(560, 960, { fit: 'cover' }).webp({ quality }).toFile(webp);
      quality -= 8;
    } while (statSync(webp).size > MAX_WEBP_BYTES && quality >= 40);
    await input
      .clone()
      .resize(300, 514, { fit: 'cover' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(OUT_OG, `${id}.jpg`));
    done.push(id);
  }

  writeFileSync(MANIFEST, JSON.stringify(done, null, 2) + '\n');
  console.log(`✓ Đã xử lý ${done.length}/78 lá. Manifest: ${path.relative(root, MANIFEST)}`);
  if (missing.length > 0) {
    const msg = `Thiếu ảnh ${missing.length} lá (dùng mặt dự phòng): ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? '…' : ''}`;
    if (strict) {
      console.error(`✗ ${msg}`);
      process.exit(1);
    }
    console.warn(`! ${msg}`);
  }
}

void main();
