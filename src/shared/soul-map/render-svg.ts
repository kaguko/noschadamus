/** Chuỗi SVG Soul Map với màu literal (docs/06 mục 5): dùng cho ảnh chia sẻ và test. */
import { AXIS_COLOR, type AxisId } from '@/shared/kernel/axes';
import { CX, CY, LABEL_SIZE, R, VIEW } from './geometry';
import { buildSoulMapScene, type SoulMapSceneInput } from './scene';

/** `css` dùng biến CSS (theo theme) cho SVG nhúng trong trang; còn lại là màu literal cho ảnh. */
export type SoulMapPalette = 'dark' | 'light' | 'share' | 'css';

export const PALETTES: Record<
  SoulMapPalette,
  { line: string; text1: string; text2: string; text3: string; bg0: string }
> = {
  dark: { line: '#2E3252', text1: '#F3EEE3', text2: '#B9B5C9', text3: '#8A87A0', bg0: '#0E0F1A' },
  share: { line: '#2E3252', text1: '#F3EEE3', text2: '#B9B5C9', text3: '#8A87A0', bg0: '#0E0F1A' },
  light: { line: '#DCD2BE', text1: '#1C1B2E', text2: '#4A4862', text3: '#6B6882', bg0: '#F7F2E8' },
  css: {
    line: 'var(--line)',
    text1: 'var(--text-1)',
    text2: 'var(--text-2)',
    text3: 'var(--text-3)',
    bg0: 'var(--bg-0)',
  },
};

export interface SoulMapRenderInput extends SoulMapSceneInput {
  palette: SoulMapPalette;
  idPrefix: string;
  /** Cỡ chữ nhãn theo đơn vị viewBox (mặc định LABEL_SIZE). */
  labelSize?: number;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n = (x: number) => x.toFixed(2);

export function renderSoulMapSvg(input: SoulMapRenderInput): string {
  const p = PALETTES[input.palette];
  const s = buildSoulMapScene(input);
  const axisColor = (a: AxisId) => (input.palette === 'css' ? `var(--axis-${a})` : AXIS_COLOR[a]);
  const accent = axisColor(s.accentAxis);
  const gid = `${input.idPrefix}-fill`;
  const out: string[] = [];
  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" width="${VIEW}" height="${VIEW}">`,
  );
  out.push(
    `<defs><radialGradient id="${gid}" cx="${CX}" cy="${CY}" r="${R}" gradientUnits="userSpaceOnUse">` +
      `<stop offset="0" stop-color="${accent}" stop-opacity="0.5"/>` +
      `<stop offset="1" stop-color="${accent}" stop-opacity="0.1"/></radialGradient></defs>`,
  );
  for (const ring of s.rings) {
    out.push(
      `<circle cx="${CX}" cy="${CY}" r="${n(ring.r)}" fill="none" stroke="${p.line}" stroke-opacity="0.7" stroke-width="1"${ring.dashed ? ' stroke-dasharray="3 4"' : ''}/>`,
    );
  }
  for (const sp of s.spokes) {
    out.push(
      `<line x1="${CX}" y1="${CY}" x2="${n(sp.x2)}" y2="${n(sp.y2)}" stroke="${p.line}" stroke-opacity="0.5" stroke-width="1"/>`,
    );
  }
  for (const l of s.layers) {
    out.push(
      `<path d="${l.d}" fill="none" stroke="${p.text1}" stroke-opacity="0.28" stroke-width="1.25"${l.dashed ? ' stroke-dasharray="4 4"' : ''}/>`,
    );
  }
  out.push(
    `<path d="${s.main}" fill="none" stroke="${accent}" stroke-opacity="0.18" stroke-width="10" stroke-linejoin="round"/>`,
  );
  out.push(
    `<path d="${s.main}" fill="url(#${gid})" stroke="${accent}" stroke-width="2.25" stroke-linejoin="round"/>`,
  );
  for (const v of s.vertices) {
    const c = axisColor(v.axis);
    if (v.kind === 'dominant') {
      out.push(
        `<circle cx="${n(v.x)}" cy="${n(v.y)}" r="12" fill="none" stroke="${c}" stroke-opacity="0.45" stroke-width="1.5"/>`,
      );
      out.push(`<circle cx="${n(v.x)}" cy="${n(v.y)}" r="7" fill="${c}"/>`);
    } else if (v.kind === 'quiet') {
      out.push(
        `<circle cx="${n(v.x)}" cy="${n(v.y)}" r="4.5" fill="${p.bg0}" stroke="${c}" stroke-width="2"/>`,
      );
    } else {
      out.push(`<circle cx="${n(v.x)}" cy="${n(v.y)}" r="4.5" fill="${c}"/>`);
    }
  }
  out.push(`<circle cx="${CX}" cy="${CY}" r="2.5" fill="${p.text1}" fill-opacity="0.5"/>`);
  const size = input.labelSize ?? LABEL_SIZE;
  for (const l of s.labels) {
    const color = l.kind === 'dominant' ? p.text1 : l.kind === 'quiet' ? p.text3 : p.text2;
    const weight = l.kind === 'dominant' ? 600 : 500;
    out.push(
      `<text x="${n(l.x)}" y="${n(l.y)}" text-anchor="${l.anchor}" dominant-baseline="${l.baseline === 'auto' ? 'auto' : l.baseline === 'hanging' ? 'hanging' : 'middle'}" font-family="Be Vietnam Pro, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(l.text)}</text>`,
    );
  }
  out.push('</svg>');
  return out.join('');
}
