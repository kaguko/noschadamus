# 06. Soul Map và ảnh chia sẻ

Hai thứ này là "sản phẩm" thật sự của noschadamus; phải đẹp, nhất quán và tất định. Một bộ hàm hình học thuần dùng chung cho: component React (có hoạt ảnh), hàm sinh chuỗi SVG (cho ảnh), và test.

## 1. Hình học Soul Map (hệ tọa độ `viewBox="0 0 400 400"`)

Hằng số: `cx = cy = 200`, `R = 128` (bán kính ngoài của trục), bán kính nhãn `RL = 158`, độ co tối thiểu `0.14`.

```ts
// src/components/soul-map/geometry.ts (thuần, không import React)
import { AXIS_ORDER, type AxisId, type AxisVector } from '@/…';   // định nghĩa ở domain/reading

export const VIEW = 400, CX = 200, CY = 200, R = 128, RL = 158, MIN = 0.14;

export const axisAngle = (k: number) => -Math.PI / 2 + (k * Math.PI) / 3;        // k=0 ở đỉnh, theo chiều kim đồng hồ
export const radiusFor = (v: number, r = R) => r * (MIN + (1 - MIN) * v);          // v ∈ [0,1]

export interface Pt { x: number; y: number }
export const pointFor = (k: number, v: number, cx = CX, cy = CY, r = R): Pt => {
  const rad = radiusFor(v, r), a = axisAngle(k);
  return { x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a) };
};

export const pointsFor = (vec: AxisVector, scale = 1): Pt[] =>
  AXIS_ORDER.map((id, k) => pointFor(k, vec[id] * scale));

/** Đường cong kín mượt: Catmull-Rom → Bézier bậc ba, hệ số 1/6 */
export function smoothClosedPath(pts: readonly Pt[]): string {
  const n = pts.length, f = (x: number) => x.toFixed(2);
  let d = `M${f(pts[0]!.x)} ${f(pts[0]!.y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]!, p1 = pts[i]!, p2 = pts[(i + 1) % n]!, p3 = pts[(i + 2) % n]!;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return d + ' Z';
}

export interface LabelPos { x: number; y: number; anchor: 'start'|'middle'|'end'; baseline: 'auto'|'middle'|'hanging' }
export function labelFor(k: number): LabelPos {
  const a = axisAngle(k), c = Math.cos(a), s = Math.sin(a);
  return {
    x: CX + RL * c, y: CY + RL * s,
    anchor: c > 0.3 ? 'start' : c < -0.3 ? 'end' : 'middle',
    baseline: s < -0.3 ? 'auto' : s > 0.3 ? 'hanging' : 'middle',
  };
}
```

### Test vàng hình học (Ví dụ vàng 2, file 01)
Vector: `energy .8356, emotion .5489, connection .3556, grounding .2822, mind .4122, change .8256`.
Điểm đỉnh kỳ vọng (sai số ≤ 0,06):

| k | Trục | x | y |
|---|---|---|---|
| 0 | energy | 200.0 | 90.1 |
| 1 | emotion | 267.8 | 160.8 |
| 2 | connection | 249.4 | 228.5 |
| 3 | grounding | 200.0 | 249.0 |
| 4 | mind | 145.2 | 231.6 |
| 5 | change | 105.8 | 145.6 |

## 2. Các lớp vẽ (thứ tự từ dưới lên)

**Vector đầu vào cho hình**: luôn là `soulMap.display.vector` và `soulMap.display.perCard` (đã kéo giãn tương phản, file 01 mục 3.2b), không phải `soulMap.vector`. Nhãn số (nếu có) và AxisMeter dùng giá trị thật. Với Ví dụ vàng 2, hai vector trùng nhau nên test hình học bên trên không đổi.


| # | Lớp | Mô tả |
|---|---|---|
| 1 | Vòng lưới | 5 vòng tròn bán kính `radiusFor(t)` với `t ∈ {0, .25, .5, .75, 1}`. Nét 1, màu `--line`, độ mờ .7; vòng `t=1` nét đứt `3 4`. |
| 2 | Nan hoa | 6 đoạn từ tâm đến `radiusFor(1)` theo từng trục. Nét 1, `--line`, độ mờ .5. |
| 3 | Lớp từng lá | Với mỗi lá (nếu `showLayers`): đường cong mượt từ `perCard[j]`. Không tô; nét 1.25, màu `--text-1`, độ mờ .28; nét đứt `4 4` nếu lá ngược. |
| 4 | Quầng sáng | Cùng đường cong tổng hợp, không tô, nét **10**, màu `accent`, độ mờ .18, `stroke-linejoin: round`. (Không dùng `filter`.) |
| 5 | Hình chính | Đường cong tổng hợp. Tô `radialGradient` (tâm `(200,200)`, `r = 128`): `0%` accent α .50 → `100%` accent α .10. Nét 2.25, màu `accent`, `stroke-linejoin: round`. |
| 6 | Đỉnh | Mỗi trục một chấm bán kính 4.5, tô màu **của trục đó**. `dominant`: bán kính 7 + vòng bao bán kính 12, nét 1.5, màu trục, α .45. `quiet`: rỗng (tô `--bg-0`, nét 2 màu trục). |
| 7 | Tâm | Chấm bán kính 2.5, `--text-1`, α .5. |
| 8 | Nhãn | Tên trục (Be Vietnam Pro, cỡ **15 đơn vị viewBox** để chữ thật ≥ 12px khi hình rộng ≥ 320px; đã chỉnh ở T18, 600 nếu `dominant`, 500 còn lại), màu `--text-1` (dominant), `--text-2` (thường), `--text-3` (quiet). Vị trí theo `labelFor(k)`. Cách `dy`: `baseline auto` → `y − 4`; `hanging` → `y + 4`. |

`accent` = màu trục của `dominant` (`--axis-<dominant>`).
Tên trục dùng nhãn tiếng Việt ở file 01 mục 1.

## 3. Hoạt ảnh vẽ (chỉ component client)

Hook `useSoulMapProgress({ enabled, delayMs = 0 })` trả `t` (ms) bằng `requestAnimationFrame`.

- Với trục `k`: `p_k(t) = easeOutExpo(clamp((t − delay − 60·k) / 900, 0, 1))`, `easeOutExpo(x) = x === 1 ? 1 : 1 − 2^(−10x)`.
- Điểm vẽ: `pointFor(k, vec[axis] · p_k)` (vì `radiusFor(0)` = 0.14R nên hình bung ra từ vòng nhỏ giữa).
- Lớp từng lá hiện theo thứ tự lá `j`: `opacity` 0 → 1 trong 300 ms bắt đầu tại `400 + 150·j`.
- Đỉnh, nhãn: hiện khi `p_k > 0.6` (mờ 150 ms).
- Kết thúc: dừng rAF, giữ trạng thái cuối. Dọn rAF khi unmount.
- `enabled=false` hoặc giảm chuyển động: render trạng thái cuối ngay.
- Khi `perCard` đổi, không tái chạy hoạt ảnh.

## 4. Truy cập
```html
<figure>
  <svg role="img" aria-labelledby="sm-t sm-d" viewBox="0 0 400 400">
    <title id="sm-t">Bản đồ linh hồn</title>
    <desc id="sm-d">…reading.map.alt…</desc> …
  </svg>
  <table class="sr-only"><caption>Giá trị các trục (0-100)</caption>
    <tr><th scope="row">Năng lượng</th><td>84</td></tr> … </table>
</figure>
```
`id` duy nhất theo thể hiện (`useId`).

## 5. API chung

```ts
export interface SoulMapRenderInput {
  vector: AxisVector; perCard?: readonly AxisVector[]; reversed?: readonly boolean[];
  dominant: AxisId; quiet: AxisId;
  palette: 'dark' | 'light' | 'share';           // share = dark, dùng màu literal
  showLabels: boolean; showLayers: boolean;
  idPrefix: string;
}
export function renderSoulMapSvg(input: SoulMapRenderInput): string   // chuỗi <svg …>…</svg>, không dùng CSS var
```
- `palette` quyết định màu literal (bảng bên dưới). Component React dùng CSS var; `renderSoulMapSvg` dùng literal.
- Test bắt buộc: với Ví dụ vàng 2, thuộc tính `d` của lớp chính từ **component** (trạng thái cuối) và từ **`renderSoulMapSvg`** phải giống hệt nhau từng ký tự.

| Token | dark/share | light |
|---|---|---|
| line | `#2E3252` | `#DCD2BE` |
| text-1 | `#F3EEE3` | `#1C1B2E` |
| text-2 | `#B9B5C9` | `#4A4862` |
| text-3 | `#8A87A0` | `#6B6882` |
| bg-0 | `#0E0F1A` | `#F7F2E8` |

## 6. Ảnh chia sẻ

### 6.1. Ba định dạng

| `format` | Kích thước | Dùng cho |
|---|---|---|
| `story` | 1080 × 1920 | Story Instagram/TikTok/Zalo |
| `portrait` | 1080 × 1350 | Bài đăng Instagram 4:5 |
| `og` | 1200 × 630 | Xem trước liên kết (Facebook, Zalo, Messenger…) |

Tất cả luôn **tối**, PNG. Một hàm dựng chung: `renderShareImage(readingView, format): Promise<Uint8Array>` (hạ tầng của context `reading`, dùng `ImageResponse`/Satori).

### 6.2. Ràng buộc Satori (bắt buộc tuân thủ)
- Chỉ `display: flex` (không grid). Phần tử có nhiều con phải đặt `display: flex`.
- Phông phải là **TTF/OTF tĩnh** nạp từ `assets/fonts/` (không woff2, không variable):
  `Fraunces-SemiBold.ttf` (600), `Fraunces-MediumItalic.ttf` (500 italic), `BeVietnamPro-Regular.ttf` (400), `BeVietnamPro-SemiBold.ttf` (600). Lấy bản tĩnh từ kho Google Fonts (giấy phép OFL), ghi vào `docs/ATTRIBUTIONS.md`. Kiểm bằng chuỗi thử `Ngọn Lửa Dịch Chuyển ềếổữ` hiển thị đủ dấu.
- Ảnh: dùng `data:` URI (base64) cho lá bài (`public/cards/og/{id}.jpg`) và cho Soul Map (`data:image/svg+xml;base64,…` từ `renderSoulMapSvg({palette:'share'})`).
- Không `filter`, không `backdrop-filter`, không `mix-blend-mode`.
- Hỗ trợ `transform: rotate()` cho lá ngược; `linear-gradient`/`radial-gradient` cho nền.
- Runtime `nodejs`. Giới hạn thời gian phản hồi 10 s. Lỗi → trả `public/icons/og-fallback.png` (cho `opengraph-image`) hoặc 500 JSON (cho API).

### 6.3. Thành phần chung

- **Nền**: `linear-gradient(180deg, #0E0F1A 0%, #151729 60%, T 100%)` với `T = mix(#0E0F1A, màuTrụcDominant, 16%)`; cộng `radial-gradient` tại đỉnh giữa (bán kính 0,9× chiều rộng) màu accent dominant α .16.
- **Sao**: 70 chấm (story) / 56 (portrait) / 40 (og); vị trí và kích thước từ `mulberry32(fnv1a(readingId))`; bán kính 1-3 px (tỉ lệ theo định dạng), α .2-.85. Mỗi bản đọc có bầu trời riêng.
- **Khung**: viền 2 px `rgba(243,238,227,.10)`, bo 56 (story/portrait) / 40 (og), thụt vào 40 / 40 / 24.
- **Wordmark**: dấu trăng 40 px (`mark.svg` dạng data URI) + chữ `noschadamus` Fraunces italic 500, cách 12 px, màu `#F3EEE3`.
- **Nhãn ngày**: `BẢN ĐỌC NGÀY dd.MM.yyyy`, Be Vietnam Pro 600 IN HOA, `letter-spacing: .18em`, màu `#B9B5C9`.
- **Tiêu đề**: tách `title` thành 2 dòng: dòng 1 = NOUN (hai từ đầu), dòng 2 = MODIFIER (hai từ cuối). Fraunces 600, `line-height` = cỡ chữ. Dòng 1 màu `#F3EEE3`; dòng 2 màu accent dominant. Căn giữa.
- **Tagline**: Be Vietnam Pro 400, màu `#B9B5C9`, căn giữa, tối đa 2 dòng (story/portrait), 3 dòng (og). Nếu dài hơn, cắt thành `…`.
- **Chip trục** (hai chip: "Nổi bật · {Trục}" và "Thưa · {Trục}"): cao 44 (og: 36), padding ngang 20, bo pill, nền màu trục α .12, viền 1.5 màu trục α .5, chấm 10 px màu trục, chữ 24 (og: 20) `#F3EEE3`.
- **Lá bài**: ảnh `og/{id}.jpg`, bo `6.5%` chiều rộng (làm tròn), viền 1 px `rgba(255,255,255,.14)`; lá ngược `rotate(180deg)` trên ảnh. Nhãn vị trí dưới: caption 20 px IN HOA `#8A87A0`. Lá thiếu ảnh: ô nền `#1D2038` + tên lá Fraunces 18 căn giữa.
- **Chân trang**: `new URL(NEXT_PUBLIC_SITE_URL).host`, Be Vietnam Pro 400, `#8A87A0`.

### 6.4. Bố cục `story` 1080×1920 (tọa độ tuyệt đối, tâm ngang x=540)

Vùng an toàn: giữ nội dung quan trọng trong `y ∈ [220, 1650]`.

| Phần tử | Vị trí / kích thước | Kiểu chữ |
|---|---|---|
| Wordmark | `y=230`, cao 44, căn giữa | Fraunces italic 500, 44 |
| Nhãn ngày | `y=300`, cao 24 | caption 24 |
| Tiêu đề | `y=350`, rộng 880, 2 dòng × 104 → kết thúc `y=558` | Fraunces 600, **104** |
| Tagline | `y=582`, rộng 840, tối đa 2 dòng × 50 → `≤ y=682` | 34 / 50 |
| Chip trục | `y=706`, cao 44, canh giữa, khe 16 | 24 |
| Soul Map | hộp **600×600** tại `x=240, y=780` (tỉ lệ 1.5 so với viewBox 400, chữ nhãn tự to 18 px) | – |
| Lá bài (3) | mỗi lá **104×178**, khe 36, `x = 348, 488, 628`, `y=1408`; nhãn vị trí `y=1596` | – |
| Lá bài (1) | **150×257**, `x=465`, `y=1356`; nhãn `y=1623`; Soul Map thu còn 540×540 tại `x=270, y=780` | – |
| URL | `y=1636`, cao 24, căn giữa | 22 |

Với 1 lá, nhãn vị trí là `HÔM NAY`.

### 6.5. Bố cục `portrait` 1080×1350 (lề 72)

| Phần tử | Vị trí / kích thước | Kiểu chữ |
|---|---|---|
| Wordmark | `y=72`, cao 40 | 40 |
| Nhãn ngày | `y=132`, cao 22 | 22 |
| Tiêu đề | `y=176`, 2 dòng × 84 → `y=344` | Fraunces 600, **84** |
| Tagline | `y=366`, rộng 820, ≤ 2 dòng × 44 | 30 / 44 |
| Chip trục | `y=474`, cao 40 | 22 |
| Soul Map | hộp **520×520** tại `x=280, y=540` | – |
| Lá bài (3) | **96×165**, khe 28, `x = 368, 492, 616`, `y=1090`; nhãn `y=1263` | – |
| Lá bài (1) | **130×223**, `x=475`, `y=1040`; nhãn `y=1271`; Soul Map thu còn 480×480 | – |
| URL | `y=1304`, cao 22 | 20 |

### 6.6. Bố cục `og` 1200×630

Hai cột; cột trái `x ∈ [64, 600]`, cột phải chứa Soul Map.

| Phần tử | Vị trí / kích thước | Kiểu chữ |
|---|---|---|
| Wordmark | `x=64, y=64`, cao 36 | 36 |
| Nhãn ngày | `x=64, y=124`, cao 20 | 20 |
| Tiêu đề | `x=64, y=160`, rộng 536, 2 dòng × 68 → `y=296` | Fraunces 600, **68** |
| Tagline | `x=64, y=318`, rộng 520, ≤ 3 dòng × 38 → `≤ y=432` | 26 / 38 |
| Chip trục | `x=64, y=448`, cao 36 (xếp ngang, khe 12; nếu không vừa 536 px thì chỉ giữ chip "Nổi bật") | 20 |
| Lá bài mini | mỗi lá **54×93**, khe 12, `x=64…`, `y=510` | – |
| URL | `x=676, y=566`, rộng 460, căn giữa, chữ 20 | – |
| Soul Map | hộp **460×460** tại `x=676, y=85` | – |

### 6.7. Mã mẫu khung ImageResponse (rút gọn, để định hướng)

```tsx
// contexts/reading/infrastructure/render-share-image.tsx
export async function renderShareImage(view: ReadingView, format: 'story'|'portrait'|'og') {
  const spec = SPECS[format];                       // bảng số liệu mục 6.4-6.6
  const fonts = await loadFonts();                  // cache theo process
  const mapSvg = renderSoulMapSvg({ …view.soulMap, palette: 'share', showLabels: true, showLayers: true, idPrefix: 'sh' });
  const mapUri = 'data:image/svg+xml;base64,' + Buffer.from(mapSvg).toString('base64');
  return new ImageResponse(<ShareLayout spec={spec} view={view} mapUri={mapUri} />, { width: spec.w, height: spec.h, fonts });
}
```
`ShareLayout` đặt từng phần tử bằng `position: absolute` theo tọa độ trong bảng.

### 6.8. Bộ nhớ đệm và bảo mật
- Ảnh là hàm thuần của Reading (bất biến) → có thể cache lâu: công khai `public, max-age=31536000, immutable` (khi qua token); riêng `private, max-age=3600`.
- Ảnh **không bao giờ** chứa `intention`.
- Từ chối `format` lạ → 400.

### 6.9. Kiểm thử ảnh
- Với Ví dụ vàng 2: kích thước PNG đúng từng định dạng; byte đầu là chữ ký PNG; thời gian dựng < 2 s (máy CI), ảnh thứ hai (cache phông) < 800 ms.
- Phân tích điểm ảnh tại vài tọa độ: nền ở `(5,5)` gần `#0E0F1A` (sai số màu ≤ 12/kênh); điểm gần đỉnh `energy` của Soul Map có màu gần `#F2A65A` (sai số ≤ 40/kênh).
- Test snapshot chuỗi SVG Soul Map (Ví dụ vàng 1 và 2).
- Kiểm tay (checklist ở T26): dán liên kết `/s/{token}` vào Facebook Sharing Debugger, Zalo, Messenger, Telegram, Slack; xem ảnh hiện đúng.

## 7. Ảnh tiếp thị tĩnh
`scripts/render-marketing.ts` dựng từ Ví dụ vàng 2 ba ảnh: `public/marketing/share-story.png`, `share-portrait.png`, `share-og.png` dùng trên Landing (file 05 mục 1). Chạy bằng `npm run marketing:render`; ảnh được commit.
