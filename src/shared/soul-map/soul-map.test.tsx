import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SoulMap } from '@/components/soul-map/soul-map';
import { computeSoulMap, displaySoulMap } from '@/contexts/reading/domain';
import { reversedVector } from '@/contexts/tarot/domain/reversed-vector';
import { AXIS_ORDER, type AxisVector } from '@/shared/kernel/axes';
import { majorVector } from '@/test-support/reading-data';
import { axisProgress, labelFor, pointsFor, smoothClosedPath } from './geometry';
import { renderSoulMapSvg } from './render-svg';

const GOLDEN_2: AxisVector = {
  energy: 0.8356,
  emotion: 0.5489,
  connection: 0.3556,
  grounding: 0.2822,
  mind: 0.4122,
  change: 0.8256,
};

describe('hình học (docs/06 mục 1)', () => {
  it('Ví dụ vàng 2: sáu đỉnh đúng tọa độ (sai số ≤ 0.06)', () => {
    const expected = [
      [200.0, 90.1],
      [267.8, 160.8],
      [249.4, 228.5],
      [200.0, 249.0],
      [145.2, 231.6],
      [105.8, 145.6],
    ];
    pointsFor(GOLDEN_2).forEach((p, k) => {
      expect(Math.abs(p.x - expected[k]![0]!)).toBeLessThanOrEqual(0.06);
      expect(Math.abs(p.y - expected[k]![1]!)).toBeLessThanOrEqual(0.06);
    });
  });

  it('đường cong kín bắt đầu bằng M, có 6 đoạn C, kết thúc Z', () => {
    const d = smoothClosedPath(pointsFor(GOLDEN_2));
    expect(d.startsWith('M200.00 90.10')).toBe(true);
    expect(d.match(/ C/g)).toHaveLength(6);
    expect(d.endsWith(' Z')).toBe(true);
  });

  it('nhãn: đỉnh căn giữa, phải "start", trái "end"', () => {
    expect(labelFor(0)).toMatchObject({ anchor: 'middle', baseline: 'auto' });
    expect(labelFor(1).anchor).toBe('start');
    expect(labelFor(3)).toMatchObject({ anchor: 'middle', baseline: 'hanging' });
    expect(labelFor(4).anchor).toBe('end');
  });

  it('tiến độ hoạt ảnh: 0 lúc bắt đầu, 1 khi xong, trục sau trễ 60ms', () => {
    expect(axisProgress(0)).toEqual([0, 0, 0, 0, 0, 0]);
    expect(axisProgress(5000).every((x) => x === 1)).toBe(true);
    const mid = axisProgress(300);
    expect(mid[0]).toBeGreaterThan(mid[5]!);
  });
});

function golden1() {
  const map = computeSoulMap([{ weight: 1, vector: reversedVector(majorVector('major-17')) }]);
  return { map, display: displaySoulMap(map), reversed: [true] };
}

function golden2() {
  const map = computeSoulMap([
    { weight: 0.8, vector: majorVector('major-00') },
    { weight: 1.2, vector: majorVector('major-16') },
    { weight: 1.0, vector: reversedVector(majorVector('major-17')) },
  ]);
  return { map, display: displaySoulMap(map), reversed: [false, false, true] };
}

describe('component = chuỗi SVG (docs/06 mục 5)', () => {
  for (const [name, make] of [
    ['vàng 1', golden1],
    ['vàng 2', golden2],
  ] as const) {
    it(`${name}: thuộc tính d của lớp chính giống từng ký tự`, () => {
      const { map, display, reversed } = make();
      const html = renderToStaticMarkup(
        <SoulMap
          display={display}
          values={map.vector}
          reversed={reversed}
          dominant={map.dominant}
          quiet={map.quiet}
          title="Bản đồ linh hồn"
          description="mô tả"
          tableCaption="Giá trị"
        />,
      );
      const fromComponent = /<path d="([^"]+)"[^>]*data-main/.exec(html)?.[1];
      const svg = renderSoulMapSvg({
        vector: display.vector,
        perCard: display.perCard,
        reversed,
        dominant: map.dominant,
        quiet: map.quiet,
        showLabels: true,
        showLayers: true,
        palette: 'share',
        idPrefix: 't',
      });
      const fromString = /<path d="([^"]+)" fill="url/.exec(svg)?.[1];
      expect(fromComponent).toBeDefined();
      expect(fromComponent).toBe(fromString);
      // Bảng cho trình đọc màn hình dùng giá trị thật.
      for (const a of AXIS_ORDER)
        expect(html).toContain(`<td>${Math.round(map.vector[a] * 100)}</td>`);
    });
  }

  it('snapshot chuỗi SVG hai ví dụ vàng', () => {
    for (const make of [golden1, golden2]) {
      const { map, display, reversed } = make();
      expect(
        renderSoulMapSvg({
          vector: display.vector,
          perCard: display.perCard,
          reversed,
          dominant: map.dominant,
          quiet: map.quiet,
          showLabels: true,
          showLayers: true,
          palette: 'share',
          idPrefix: 'snap',
        }),
      ).toMatchSnapshot();
    }
  });

  it('chuỗi SVG thoát ký tự đặc biệt trong nhãn', () => {
    const { map, display } = golden2();
    const svg = renderSoulMapSvg({
      ...display,
      dominant: map.dominant,
      quiet: map.quiet,
      showLabels: true,
      showLayers: false,
      palette: 'dark',
      idPrefix: 'x',
      labels: {
        energy: '<b>&',
        emotion: 'a',
        connection: 'b',
        grounding: 'c',
        mind: 'd',
        change: 'e',
      },
    });
    expect(svg).toContain('&lt;b&gt;&amp;');
  });
});
