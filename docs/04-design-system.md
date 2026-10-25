# 04. Hệ thống thiết kế

Cảm hứng thị giác: **đêm mực xanh + ánh trăng kem + một điểm lửa hổ phách**. Ấm, tĩnh, hơi bí ẩn nhưng không rùng rợn, hình ảnh đẹp khi chụp màn hình và đăng mạng xã hội.
Giao diện mặc định **tối**; có nút chuyển sáng. Ảnh chia sẻ luôn tối.

## 1. Token màu

Khai báo ở `src/app/globals.css`. Theo `data-theme` trên `<html>` (`dark` mặc định, `light`). Khi lần đầu vào, lấy `dark` bất kể hệ thống; lưu lựa chọn người dùng vào `localStorage` (bọc try/catch).

```css
:root, :root[data-theme="dark"] {
  color-scheme: dark;
  --bg-0: #0E0F1A;   /* nền trang */
  --bg-1: #151729;   /* bề mặt cấp 1 */
  --bg-2: #1D2038;   /* bề mặt cấp 2, chip, input hover */
  --bg-3: #272B4A;   /* toast, popover */
  --line: #2E3252;
  --line-strong: #424770;
  --text-1: #F3EEE3; /* chữ chính (kem trăng) */
  --text-2: #B9B5C9;
  --text-3: #8A87A0;
  --accent: #F2A65A;        --accent-hover: #F6B876;  --accent-press: #E0924A;
  --accent-ink: #0E0F1A;    /* chữ trên nền accent */
  --accent-text: #F2A65A;   /* accent dùng làm màu chữ/biểu tượng */
  --accent-soft: rgba(242,166,90,.14);
  --focus: #F6C48D;
  --danger: #FF8A8A;  --success: #7FD6C2;  --info: #8FB4FF;
  --overlay: rgba(6,7,14,.72);
  --shadow-card: 0 0 0 1px var(--line), 0 18px 48px -16px rgba(0,0,0,.65);
  --glow-accent: 0 8px 28px -8px rgba(242,166,90,.55);
}
:root[data-theme="light"] {
  color-scheme: light;
  --bg-0: #F7F2E8;  --bg-1: #FCF9F2;  --bg-2: #EFE8DA;  --bg-3: #E4DBC8;
  --line: #DCD2BE;  --line-strong: #C4B89E;
  --text-1: #1C1B2E; --text-2: #4A4862; --text-3: #6B6882;
  --accent: #A55A16; --accent-hover: #944F10; --accent-press: #7F430B;
  --accent-ink: #FFFFFF; --accent-text: #9A5212; --accent-soft: rgba(165,90,22,.12);
  --focus: #7F430B;
  --danger: #B3261E; --success: #1F7A66; --info: #2F5FC4;
  --overlay: rgba(28,27,46,.55);
  --shadow-card: 0 0 0 1px var(--line), 0 14px 36px -18px rgba(60,44,20,.35);
  --glow-accent: 0 8px 24px -10px rgba(165,90,22,.45);
}
/* Màu trục, dùng chung cho Soul Map, chip, ảnh chia sẻ. KHÔNG đổi theo theme. */
:root {
  --axis-energy: #F2A65A;
  --axis-emotion: #E58FB0;
  --axis-connection: #7FD6C2;
  --axis-grounding: #C9B06B;
  --axis-mind: #8FB4FF;
  --axis-change: #A79BFF;
}
```

Tương phản đã kiểm (tối): `text-1/bg-0` ≈ 15,5:1; `text-2/bg-0` ≈ 9:1; `text-3/bg-0` ≈ 5,5:1; `text-3/bg-2` ≈ 4,6:1; `accent/bg-0` ≈ 9,4:1. Không dùng `text-3` cho chữ nhỏ trên `bg-3`.
Chữ nhỏ (< 18px) **không** đặt trên màu trục; màu trục chỉ cho hình, chấm, viền.

## 2. Chữ

| Vai trò | Font | Ghi chú |
|---|---|---|
| Hiển thị (tiêu đề, tên lá, tiêu đề archetype) | **Fraunces** | Bản **tĩnh** weight 500/600, subset latin + vietnamese (bỏ trục SOFT/opsz và latin-ext vì bản variable nặng ~650 KB, làm LCP di động 6,7s; đo ở T20). Italic 500 tách riêng, không preload, chỉ cho wordmark |
| Nội dung và giao diện | **Be Vietnam Pro** | weight 400/500/600; hỗ trợ đầy đủ dấu tiếng Việt |
| Số liệu | Be Vietnam Pro | `font-variant-numeric: tabular-nums` |

| Token | Mobile (390) | Desktop (≥1024) | Line-height | Font |
|---|---|---|---|---|
| `display` | 40 px | 72 px | 1.05 | Fraunces 600 |
| `h1` | 32 px | 48 px | 1.12 | Fraunces 600 |
| `h2` | 24 px | 32 px | 1.2 | Fraunces 600 |
| `h3` | 20 px | 22 px | 1.3 | Fraunces 500 |
| `body-lg` | 18 px | 20 px | 1.7 | Be Vietnam Pro 400 |
| `body` | 16 px | 16 px | 1.65 | Be Vietnam Pro 400 |
| `small` | 14 px | 14 px | 1.5 | Be Vietnam Pro 400/500 |
| `caption` | 12 px | 12 px | 1.35 | Be Vietnam Pro 600, IN HOA, `letter-spacing: .12em` |

Triển khai bằng `clamp()` để mượt giữa hai mốc: `display: clamp(2.5rem, 1.9rem + 3vw, 4.5rem)`. Đoạn văn tối đa **62ch**. `text-wrap: balance` cho tiêu đề, `pretty` cho đoạn văn. Không bao giờ để chữ nhỏ hơn 12 px.

## 3. Khoảng cách, bo góc, đổ bóng, lớp

- Thang khoảng cách (px): `0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128`. Token `--s-1…--s-14`.
- Lề ngang trang: 20 (mobile) · 32 (≥768) · 48 (≥1024). Container tối đa **1120**. Cột đọc tối đa **560**.
- Khoảng cách giữa các section: 64 (mobile) · 96 (desktop).
- Bo góc: `--r-sm 8` · `--r-md 12` (input nhỏ) · `--r-lg 16` (thẻ, textarea) · `--r-xl 24` (panel) · `--r-2xl 32` (sheet) · `--r-pill 999`.
- Đổ bóng: `--shadow-card`, `--glow-accent` (mục 1). Không thêm bóng khác.
- z-index: `base 0 · sticky 10 · header 20 · actionbar 30 · overlay 40 · dialog 50 · toast 60`.
- Breakpoint (mobile-first, `min-width`): `sm 480 · md 768 · lg 1024 · xl 1280`.

## 4. Chuyển động

| Token | Giá trị |
|---|---|
| `--dur-fast` | 120 ms |
| `--dur-base` | 200 ms |
| `--dur-slow` | 320 ms |
| `--dur-flip` | 700 ms |
| `--dur-draw` | 900 ms (vẽ Soul Map) |
| `--ease-standard` | `cubic-bezier(.2, 0, 0, 1)` |
| `--ease-emphasized` | `cubic-bezier(.2, .8, .2, 1)` |
| `--ease-expo-out` | `cubic-bezier(.16, 1, .3, 1)` |

Quy tắc:
- Chỉ animate `transform` và `opacity` (trừ vẽ Soul Map bằng rAF).
- `@media (prefers-reduced-motion: reduce)`: tắt mọi chuyển động trừ chuyển mờ 150 ms; lật bài thành mờ chéo; Soul Map hiện tức thì; sao ngừng nhấp nháy; không parallax.
- Hover chỉ áp với `@media (hover: hover)`.
- Không tự phát âm thanh/rung.

## 5. Nền trang (ba lớp, đặt ở `layout.tsx`)

1. **Nền**: `var(--bg-0)`.
2. **Ánh sáng đỉnh**: `radial-gradient(60% 40% at 50% 0%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 70%)`, cố định, `pointer-events: none`. Ở theme sáng giảm còn 8%.
3. **Sao** (`<Starfield/>`, chỉ theme tối): SVG toàn trang, 80 ngôi sao, vị trí sinh từ `mulberry32(7)` (cố định, tránh nhấp nháy khi hydrate), bán kính 0,5-1,6 px, độ mờ 0,25-0,9; 12 ngôi sao nhấp nháy (`opacity` 0,4↔1, chu kỳ ngẫu nhiên 4-9 s, trễ ngẫu nhiên). Cố định theo khung nhìn, nằm dưới nội dung.
4. **Hạt phim**: lớp `::before` cố định, SVG `feTurbulence` (`baseFrequency .8`, `numOctaves 2`) làm data URI, `opacity .05`, `mix-blend-mode: overlay`, `pointer-events: none`.

Trang `/draw` ở bước chọn bài tăng ánh sáng đỉnh lên 22% để tạo cảm giác nghi thức.

## 6. Biểu tượng và logo

- Icon: `lucide-react`, nét 1.5, kích thước 20 (mặc định), 24 (điều hướng), 16 (trong chip).
- **Wordmark**: chữ `noschadamus` thường, Fraunces italic 500, kèm dấu trăng khuyết 18 px bên trái, cách 8 px. Màu `--text-1`; trăng màu `--accent`.
- **Dấu trăng khuyết** (`public/icons/mark.svg`, 32×32):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs><mask id="m"><rect width="32" height="32" fill="#000"/><circle cx="16" cy="16" r="11" fill="#fff"/><circle cx="21" cy="13" r="9.5" fill="#000"/></mask></defs>
  <rect width="32" height="32" fill="#F2A65A" mask="url(#m)"/>
  <circle cx="24.5" cy="7.5" r="1.4" fill="#F3EEE3"/>
</svg>
```
- Favicon: dấu trăng trên nền `#0E0F1A` bo 22%; `apple-touch-icon` 180×180; `manifest` với `theme_color` và `background_color` `#0E0F1A`.

## 7. Component

Mọi component: nhận `className`, forward `ref`, có trạng thái focus-visible. Vòng focus chung: `outline: 2px solid var(--focus); outline-offset: 3px;`.

### 7.1. Button
| Biến thể | Nền | Chữ | Viền |
|---|---|---|---|
| `primary` | `--accent` (hover `--accent-hover`, active `--accent-press`) | `--accent-ink` | none; có `--glow-accent` |
| `secondary` | trong suốt (hover `--bg-2`) | `--text-1` | 1 px `--line-strong` |
| `ghost` | trong suốt (hover `--bg-2`) | `--text-2` → `--text-1` khi hover | none |
| `danger` | trong suốt (hover tint 10% `--danger`) | `--danger` | 1 px `--danger` |

| Cỡ | Cao | Padding ngang | Chữ | Icon |
|---|---|---|---|---|
| `sm` | 36 | 16 | 14/600 | 16 |
| `md` | 44 | 24 | 16/600 | 20 |
| `lg` | 52 | 28 | 17/600 | 20 |

Bo `--r-pill`. Active: `translateY(1px)`. Disabled: `opacity .45`, `cursor: not-allowed`, bỏ glow. Loading: spinner 18 px thay icon, `aria-busy="true"`, giữ nguyên chiều rộng, nhấn lại bị chặn. Trên di động, nút hành động chính có thể `width: 100%`. Vùng chạm tối thiểu 44×44 (nút `sm` thêm padding ảo bằng `::after`).

### 7.2. IconButton
40×40 (hit area 44), bo tròn, icon 20, `ghost` mặc định. Bắt buộc `aria-label`.

### 7.3. Chip / Badge
Cao 28, padding ngang 12, bo pill, chữ 13/500. Biến thể:
- `neutral`: nền `--bg-2`, viền `--line`, chữ `--text-2`.
- `axis`: chấm 8 px màu trục + nhãn trục; nền `color-mix(in oklab, var(--axis-x) 14%, var(--bg-1))`, viền `color-mix(... 40%)`, chữ `--text-1`.
- `orientation`: `Xuôi` (neutral) hoặc `Ngược` (viền nét đứt, icon `rotate-ccw` 14 px).
- `keyword`: giống `neutral`, chữ 13/400.

### 7.4. Textarea (ý niệm)
Nền `--bg-1`, viền 1 px `--line-strong`, bo `--r-lg`, padding 16, chữ 16 (không nhỏ hơn để iOS không phóng to), cao tối thiểu 120, `resize: none`. Focus: viền `--accent` + vòng `0 0 0 4px var(--accent-soft)`. Placeholder `--text-3`. Bộ đếm `{n}/280` caption góc dưới phải, chuyển `--danger` khi n > 280 (chặn gõ thêm, không cắt dữ liệu dán: cắt còn 280 và hiện toast "Đã cắt bớt cho vừa 280 ký tự.").

### 7.5. Switch
44×26, thumb 20; bật = nền `--accent`, thumb `--accent-ink`; tắt = nền `--bg-3`, thumb `--text-2`. Hàng chứa Switch có nhãn + mô tả; toàn hàng bấm được (hit area ≥ 56 cao). Dùng Radix `Switch`.

### 7.6. Stepper (luồng rút bài)
Dòng caption `BƯỚC 1/3`, bên dưới 3 đoạn thanh cao 4, bo 2, khe 6; đoạn đã đi qua `--accent`, đoạn hiện tại `--accent` 100% + đoạn chưa tới `--bg-3`. Chuyển bước: thanh tô từ trái sang phải 320 ms.

### 7.7. SpreadOption (thẻ chọn trải bài)
Thẻ radio lớn: bo `--r-xl`, padding 20, nền `--bg-1`, viền `--line`; chọn: viền `--accent` 1.5 px + nền `--accent-soft` + dấu tick `check` ở góc phải trên. Trái: minh họa số lá (1 hoặc 3 hình chữ nhật nghiêng nhẹ -6°/0°/+6°, 28×48, viền `--line-strong`). Phải: tên (h3), tagline (small, `--text-2`), dòng phụ "Khoảng 1 phút". Dùng `role="radiogroup"` + `radio`; phím mũi tên chuyển lựa chọn.

### 7.8. TarotCard
Tỉ lệ **7:12**. `container-type: inline-size`; bo góc `6cqw`. Kích cỡ (rộng × cao):

| Cỡ | Rộng | Cao | Dùng ở |
|---|---|---|---|
| `xs` | 56 | 96 | Lịch sử |
| `sm` | 88 | 151 | Dải chọn bài (thu nhỏ), slot |
| `md` | 104 | 178 | Kết quả 3 lá (mobile) |
| `lg` | 160 | 274 | Kết quả 3 lá (desktop), slot lớn |
| `xl` | 220 | 377 | Kết quả 1 lá (mobile) |
| `2xl` | 280 | 480 | Kết quả 1 lá (desktop) |

Cấu tạo: 2 mặt trong khung 3D (`perspective: 900px` ở phần cha, `transform-style: preserve-3d`). Mặt sau: `public/card-back.svg` (mục 8). Mặt trước: ảnh `{id}.webp` (`object-fit: cover`), viền 1 px `rgba(255,255,255,.14)`, đổ bóng `--shadow-card`, lớp bóng sáng chéo (`linear-gradient(115deg, transparent 40%, rgba(255,255,255,.10) 50%, transparent 60%)`) chạy một lần sau khi lật xong (600 ms).
- **Ngược**: chỉ xoay **ảnh** 180° (`transform: rotate(180deg)`), khung không đổi; luôn kèm chip "Ngược" trong nhãn dưới thẻ.
- **Lật**: `rotateY(0 → 180deg)`, `--dur-flip`, `--ease-emphasized`; khi bắt đầu, thẻ nâng `translateY(-8px) scale(1.03)` rồi hạ về. Giảm chuyển động: mờ chéo 150 ms.
- **Mặt dự phòng** (ảnh lỗi/thiếu): nền gradient `--bg-2 → --bg-1`, số (chữ số La Mã cho Ẩn Chính, số thường cho phụ) Fraunces 600 ở trên, biểu tượng lucide cỡ 40% chiều rộng ở giữa (`sparkles` Ẩn Chính, `flame` Gậy, `wine` Cốc, `sword` Kiếm, `coins` Tiền), tên lá caption ở dưới.
- `alt` của ảnh: `"{Tên vi}{, ngược nếu có}"`.
- Chọn được (trong dải chọn bài): xem file 05 mục 4.

Nhãn dưới thẻ (`CardCaption`): dòng 1 `caption` IN HOA vị trí (`QUÁ KHỨ`), dòng 2 tên lá (`h3` 18/Fraunces), dòng 3 chip orientation.

### 7.9. Dialog / Sheet
Overlay `--overlay` + `backdrop-filter: blur(8px)`. Di động: sheet đáy, bo `--r-2xl` hai góc trên, tay nắm 40×4 màu `--line-strong` cách trên 8, cao tối đa `92dvh`, vuốt xuống để đóng (ngưỡng 80 px hoặc vận tốc cao); desktop: hộp giữa rộng 720, bo `--r-xl`. Vào: mờ + trượt 24 px, `--dur-slow`, `--ease-emphasized`. Bẫy focus, `Esc` đóng, trả focus về nút gọi. Dùng Radix `Dialog`.

### 7.10. Toast
Dưới giữa (di động: cách đáy `16 + chiều cao action bar`), rộng tối đa 420, nền `--bg-3`, viền `--line-strong`, bo `--r-lg`, padding 12 16, icon trái 20. Tự tắt 4000 ms (lỗi: 6000 ms). `role="status"` (lỗi: `role="alert"`). Dùng Radix `Toast`.

### 7.11. Accordion (FAQ)
Hàng cao tối thiểu 56, vạch phân cách 1 px `--line`; tiêu đề h3 18; icon `plus` xoay 45° khi mở; nội dung mở theo `grid-template-rows 0fr → 1fr`, `--dur-slow`. Radix `Accordion`, một mục mở tại một thời điểm.

### 7.12. AxisMeter (hàng chú giải trục)
Lưới: `[chấm 10] [tên 96] [thanh 1fr] [số 40]`. Thanh cao 6, bo 3, nền `--bg-3`, phần đầy màu trục, rộng theo `v*100%`. Số `0-100` (làm tròn `v*100`), tabular. Hàng `dominant` có chip "Nổi bật" cạnh tên; hàng `quiet` có chip "Thưa" (bản đồ cân bằng: "Hơi nổi"/"Hơi thưa"). Thanh và số luôn dùng giá trị thật, không dùng vector hiển thị. Thanh chạy từ 0 đến giá trị cùng nhịp vẽ Soul Map (chậm hơn 200 ms).

### 7.13. Skeleton
`--bg-2`, ánh sáng quét ngang 1,6 s vô hạn (tắt khi giảm chuyển động). Có khối riêng cho thẻ bài, Soul Map (hình tròn), đoạn văn (3 dòng, dòng cuối 60%).

### 7.14. Header
Cao 56 (di động) · 72 (≥1024). Trong suốt; sau khi cuộn > 8 px: `background: color-mix(in oklab, var(--bg-0) 72%, transparent)` + `backdrop-filter: blur(12px)` + viền dưới 1 px `--line`. Trái: wordmark (liên kết `/`). Phải (di động): IconButton `history` (liên kết `/history`), IconButton theme (`sun`/`moon`). Phải (desktop): liên kết "Cách hoạt động" (`/about`), "Lịch sử", IconButton theme, Button `sm primary` "Rút bài" (ẩn ở `/draw`).

### 7.15. Footer
Nền `--bg-1`, vạch trên `--line`. Hàng liên kết: Cách hoạt động · Quyền riêng tư · Điều khoản. Dưới: `Disclaimer`. Dưới nữa: "Hình ảnh lá bài: Pamela Colman Smith, bộ Rider-Waite-Smith (1909), phạm vi công cộng." và "© {năm} noschadamus".

### 7.16. Disclaimer
Icon `info` 16 + chữ `small` `--text-3`: **"noschadamus dành cho giải trí và suy ngẫm. Nội dung không phải dự đoán, cũng không thay thế lời khuyên y tế, tài chính hay pháp lý."**

### 7.17. ActionBar (thanh hành động dính đáy, di động)
Cố định đáy, `padding: 12 20 calc(12px + env(safe-area-inset-bottom))`, nền `color-mix(bg-0 86%)` + blur 12, vạch trên `--line`. Chứa tối đa 2 nút (chính `lg` chiếm phần còn lại + phụ `lg` icon hoặc nhãn ngắn). Ở ≥1024 không dính; nằm trong luồng nội dung.

### 7.18. EmptyState
Biểu tượng 48 (lucide `moon-star`, `--text-3`), tiêu đề h3, mô tả `--text-2`, một nút. Căn giữa, cách trên 64.

## 8. Mặt sau lá bài (`public/card-back.svg`, dùng như ảnh, không inline)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 1200">
  <defs>
    <linearGradient id="bk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1D2038"/><stop offset="1" stop-color="#0E0F1A"/>
    </linearGradient>
    <mask id="cr">
      <rect width="700" height="1200" fill="#000"/>
      <circle cx="350" cy="600" r="110" fill="#fff"/>
      <circle cx="392" cy="580" r="98" fill="#000"/>
    </mask>
  </defs>
  <rect width="700" height="1200" rx="48" fill="url(#bk)"/>
  <rect x="24" y="24" width="652" height="1152" rx="30" fill="none" stroke="#F2A65A" stroke-opacity=".5" stroke-width="2"/>
  <rect x="44" y="44" width="612" height="1112" rx="20" fill="none" stroke="#F3EEE3" stroke-opacity=".10" stroke-width="1.5"/>
  <g fill="none" stroke="#F3EEE3" stroke-opacity=".08" stroke-width="2">
    <circle cx="350" cy="600" r="160"/><circle cx="350" cy="600" r="220"/>
    <circle cx="350" cy="600" r="280"/><circle cx="350" cy="600" r="340"/>
  </g>
  <rect width="700" height="1200" fill="#F3EEE3" mask="url(#cr)"/>
  <circle cx="350" cy="350" r="7" fill="#F2A65A"/>
  <circle cx="566.5" cy="475" r="7" fill="#E58FB0"/>
  <circle cx="566.5" cy="725" r="7" fill="#7FD6C2"/>
  <circle cx="350" cy="850" r="7" fill="#C9B06B"/>
  <circle cx="133.5" cy="725" r="7" fill="#8FB4FF"/>
  <circle cx="133.5" cy="475" r="7" fill="#A79BFF"/>
  <g fill="#F3EEE3" fill-opacity=".55">
    <circle cx="96" cy="96" r="3"/><circle cx="604" cy="96" r="3"/>
    <circle cx="96" cy="1104" r="3"/><circle cx="604" cy="1104" r="3"/>
  </g>
</svg>
```

Sáu chấm màu nằm đúng vị trí sáu trục của Soul Map (năng lượng ở đỉnh, theo chiều kim đồng hồ), làm "logo ẩn" cho hệ thống.

## 9. Bố cục chung

- Khung trang: `min-height: 100dvh`, header dính, nội dung trong container, footer cuối.
- Lưới: 4 cột (di động), 8 cột (≥768), 12 cột (≥1024); khe 16 / 24 / 32.
- Thẻ (`Surface`): nền `--bg-1`, viền 1 px `--line`, bo `--r-xl`, padding 20 (di động) / 32 (desktop).
- Trang kết quả hai cột ở ≥1024: cột trái dính (`position: sticky; top: 88px`) rộng 480, cột phải tối đa 560, khe 64.

## 10. Truy cập

- Mọi tương tác có tên truy cập; biểu tượng thuần trang trí `aria-hidden`.
- Thứ tự tab theo thứ tự thị giác; không `tabindex > 0`.
- Văn bản kết quả được đọc theo thứ tự: tiêu đề → tagline → lá bài → Soul Map (mô tả + bảng) → diễn giải → câu hỏi.
- Vùng `aria-live="polite"` thông báo: "Đã lật lá thứ n: {tên}", "Bản đồ linh hồn đã sẵn sàng", "Đã chọn n/N lá".
- Màu không phải kênh thông tin duy nhất: trục luôn kèm tên/số.
