# 07. Danh sách task triển khai

Làm **tuần tự**, mỗi task một commit (`T07: …`). Task chỉ "xong" khi: code + test của task + `npm run lint && npm run typecheck && npm run test` xanh, và mọi mục "Nghiệm thu" đạt.
Ký hiệu: **Cần** = task phải xong trước. File tham chiếu: `01`…`06` trong `docs/`.

## Định nghĩa "xong" chung (áp cho mọi task)
1. Không `any`, không `// @ts-ignore` (nếu bắt buộc, ghi lý do ngay dòng đó).
2. Test mới cho hành vi mới; không giảm độ phủ domain dưới 90% dòng.
3. Không thêm phụ thuộc ngoài danh sách ở file 03 mục 1 khi chưa có ADR.
4. Chuỗi giao diện nằm ở `messages/vi.json`.
5. Nếu thay đổi quyết định so với đặc tả: ghi `docs/OPEN-QUESTIONS.md`, không tự ý đổi.

## Không làm trong MVP
Tài khoản/đăng nhập · thanh toán · cung hoàng đạo/thần số học · LLM sinh văn bản · thông báo đẩy · app native · đa ngôn ngữ ngoài tiếng Việt · xóa bản đọc riêng lẻ · bình luận/mạng xã hội trong app.

---

## Giai đoạn 0: Nền tảng

### T00. Khởi tạo repo và CI
- **Việc**: Next.js (App Router) + TypeScript strict (`noUncheckedIndexedAccess`) + Tailwind; ESLint, Prettier, Vitest, Playwright; `.nvmrc`; `.env.example` (file 03 mục 11); alias `@/*` → `src/*`; scripts như `CLAUDE.md`; GitHub Actions: install → lint → typecheck → test → build; `docs/adr/0001-stack.md` ghi phiên bản thực tế.
- **Nghiệm thu**: `npm run build` chạy; trang mặc định hiện; CI xanh; `git status` sạch sau khi chạy lint/format.

### T01. Kernel và ép kiến trúc
- **Cần**: T00. **Việc**: `shared/kernel/{result.ts, clock.ts}`; cấu hình `dependency-cruiser` cho D1-D7; ESLint rule cho D8; script `npm run lint:arch`; tích hợp vào `npm run lint`. Tạo cây thư mục rỗng của `contexts/*` kèm `index.ts` giữ chỗ.
- **Nghiệm thu**: thử cố ý import `@prisma/client` trong `domain/` → `lint` đỏ; thử `Math.random()` trong `application/` → đỏ; bỏ thử nghiệm → xanh. Ghi 3 ví dụ vi phạm trong `docs/adr/0002-architecture-rules.md`.

### T02. Token, phông, nền, theme
- **Cần**: T00. **Việc**: `globals.css` theo file 04 mục 1-4; `next/font` Fraunces + Be Vietnam Pro (subset vietnamese); `ThemeProvider` (dark mặc định, lưu `localStorage` bọc try/catch, `data-theme` đặt trước hydrate bằng script inline nhỏ để không nhấp nháy); `Starfield`; hạt phim; trang `/dev/tokens` (chỉ dev) hiện bảng màu, chữ, khoảng cách.
- **Nghiệm thu**: chuyển theme không nhấp nháy khi F5; Lighthouse a11y ≥ 95 trên `/dev/tokens`; tiếng Việt có dấu hiển thị đúng ở mọi cỡ chữ.

---

## Giai đoạn 1: Lõi nghiệp vụ

### T03. Tarot domain
- **Cần**: T01. **Việc**: `contexts/tarot/domain`: kiểu (file 01 mục 2.1), `reversedVector`, `randomInt` (rejection sampling), `draw` + `RandomSource` port. Test theo ma trận ở file 01 mục 4 (hàng `randomInt`, `draw`, `reversedVector`), gồm **Ví dụ vàng 1**.
- **Nghiệm thu**: mọi test xanh; test phân phối dùng RNG giả xác định (hạt cố định) và có ngưỡng ghi rõ.

### T04. Dữ liệu: schema, trình kiểm, vector, bài mẫu
- **Cần**: T03. **Việc**: `data/cards/major.json` với 22 lá (vector + từ khóa theo file 02 mục 2; 5 lá đã có văn bản ở mục 5 chép nguyên văn; 17 lá Ẩn Chính còn lại tạm đặt `meaning`/`prompts` là placeholder hợp lệ **có tiền tố `[TODO]`**); `scripts/generate-minor-vectors.ts` sinh khung 56 lá phụ (id, tên, vector, từ khóa/ý nghĩa/prompts placeholder `[TODO]`); `scripts/validate-cards.ts` (file 02 mục 1); `data/spreads.json`; `data/text/axes.vi.json`.
- **Nghiệm thu**: `npm run cards:validate` có **chế độ `--allow-todo`** (mặc định trong dev) và **chế độ nghiêm ngặt** (CI trên nhánh chính phải dùng nghiêm ngặt sau T07); test 3 lá phụ khớp bảng file 02 mục 4; vector trong [0,1].

### T05. Nội dung 17 lá Ẩn Chính còn lại
- **Cần**: T04. **Việc**: viết `meaning` (xuôi/ngược) và `prompts` cho các lá Ẩn Chính còn thiếu, theo giọng văn và danh sách cấm (file 02 mục 7), cùng độ dài ràng buộc. Dùng từ khóa đã cho ở bảng mục 2.
- **Nghiệm thu**: `cards:validate` nghiêm ngặt cho `major.json` không còn `[TODO]`; con người duyệt (tôi) đọc ít nhất 5 lá ngẫu nhiên; không câu nào vi phạm danh sách cấm.

### T06. Nội dung bộ Gậy và Cốc
- **Cần**: T05. **Việc**: như T05 cho `minor-wands.json` (14) và `minor-cups.json` (13, trừ `cups-ace`). Dùng bảng chủ đề ở file 02 mục 9. Văn bản nguyên bản, không chép nguồn khác.
- **Nghiệm thu**: validate nghiêm ngặt cho hai file; không hai lá có `meaning` trùng nhau quá 60% (kiểm bằng độ tương tự Jaccard theo từ, ngưỡng viết trong script).

### T07. Nội dung bộ Kiếm và Tiền
- **Cần**: T06. **Việc**: như T06 cho `minor-swords.json` và `minor-pentacles.json`. Bật chế độ nghiêm ngặt làm mặc định trong CI.
- **Nghiệm thu**: `cards:validate` nghiêm ngặt xanh cho cả 78 lá; CI chạy nó.

### T08. Reading domain: Soul Map, tiêu đề, diễn giải
- **Cần**: T04. **Việc**: `contexts/reading/domain`: `computeSoulMap`, bảng tiêu đề (30), `prng.ts` (FNV-1a + mulberry32), `composeInterpretation` (file 01 mục 3.2-3.4). Bảng chữ lấy từ `data/text/axes.vi.json` qua tham số (domain không đọc file).
- **Nghiệm thu**: **Ví dụ vàng 2** cho đúng 6 giá trị (4 chữ số), `dominant=energy`, `second=change`, `quiet=grounding`, tiêu đề `Ngọn Lửa Dịch Chuyển`; test 30 tiêu đề; test tất định theo `readingId`; test từ cấm (R10).

### T09. Reading aggregate, chia sẻ, sự kiện
- **Cần**: T08. **Việc**: `Reading` (bất biến), `shareReading`/`revokeShare` (hàm thuần trả Reading mới), sự kiện miền, `DrawnCard` snapshot builder (áp orientation).
- **Nghiệm thu**: các test R2, R6, R8 xanh; `Object.isFrozen`/kiểu `readonly` được kiểm; thử sửa trực tiếp báo lỗi biên dịch (có `// @ts-expect-error` trong test).

### T10. Tầng Application + adapter trong bộ nhớ
- **Cần**: T07, T09. **Việc**: `tarot/application` (`public-api`, `getSpread`, `drawForSpread`, repo JSON), `reading/application` (6 use case, ports, DTO `ReadingView`), `tarot-gateway` adapter, `InMemoryReadingRepository`, `FakeClock`, `SeededRandomSource`, `InMemoryEventBus`.
- **Nghiệm thu**: test use case theo bảng file 01 mục 3.7 và R7, R9; `CreateReading` phát đúng một `ReadingCreated`; `GetReadingForOwner` với id không thuộc chủ trả `NOT_FOUND`.

### T11. CLI demo và cửa kiểm 1
- **Cần**: T10. **Việc**: `scripts/demo-reading.ts` nhận `--spread single|three --seed N` in một Reading dạng văn bản (tiêu đề, lá, vector, diễn giải).
- **Nghiệm thu (Cửa 1)**: chạy 20 hạt giống khác nhau, đọc nhanh bằng mắt: văn bản mạch lạc, đúng giọng. Ghi nhận xét vào `docs/review-gate-1.md`. **Dừng, chờ chủ dự án duyệt trước khi sang giai đoạn 2.**

---

## Giai đoạn 2: Hạ tầng và API

### T12. Prisma và repository
- **Cần**: T11. **Việc**: `prisma/schema.prisma` (file 03 mục 5), migration đầu, `docker-compose.yml` Postgres cho dev/test, `PrismaReadingRepository` với mapper kiểm bằng zod, `npm run db:*`.
- **Nghiệm thu**: bộ test hợp đồng repository chạy được cho cả `InMemory` và `Prisma` (cùng một suite); CI dùng service Postgres.

### T13. Composition root và hạ tầng HTTP
- **Cần**: T12. **Việc**: `composition/container.ts`; `CsprngRandomSource` (`crypto.getRandomValues`); `IdGenerator` (base58 / base64url); `OwnerCookieCodec` (file 03 mục 6); `RateLimiter` Postgres (cửa sổ cố định); chuẩn lỗi API; header bảo mật + CSP (file 03 mục 10); kiểm `Origin`; kiểm biến môi trường lúc khởi động.
- **Nghiệm thu**: test mã hóa cookie (đúng/sai chữ ký/hỏng payload/quá 50 id); test rate limit với `FakeClock`; `curl` thử header có đủ.

### T14. API bản đọc
- **Cần**: T13. **Việc**: các route 7.1-7.5 (không gồm ảnh): `POST /api/readings`, `GET /api/readings/{id}`, `GET /api/readings`, `POST/DELETE .../share`.
- **Nghiệm thu**: test tích hợp (Vitest + Postgres thật): tạo → lấy; người khác lấy → 404; chia sẻ idempotent; thu hồi rồi chia sẻ lại → token khác; `intention` không lưu khi `storeIntention=false` (kiểm trực tiếp trong DB); vượt rate limit → 429 + `Retry-After`; body > 4 KB → 413; `Origin` sai → 403/400 theo thiết kế (ghi vào lỗi chuẩn).

### T15. Analytics, dọn dữ liệu, sức khỏe
- **Cần**: T14. **Việc**: `POST /api/events` (danh sách trắng props), `visitorHash`, subscriber ghi `reading_created` từ domain event, `/api/cron/purge` (file 03 mục 5), `/api/health`, `vercel.json` cron.
- **Nghiệm thu**: prop lạ bị loại; `DNT/Sec-GPC` → không ghi; purge xóa đúng bản ghi quá hạn (test với `FakeClock`); không có IP/UA trong DB.

---

## Giai đoạn 3: Giao diện

### T16. UI kit
- **Cần**: T02. **Việc**: Button, IconButton, Chip, Switch, Textarea, Stepper, SpreadOption, Dialog/Sheet, Toast, Accordion, Tabs, Skeleton, EmptyState (file 04 mục 7). Trang `/dev/ui` (chỉ dev) liệt kê mọi biến thể và trạng thái.
- **Nghiệm thu**: axe không lỗi; thao tác bàn phím đầy đủ (Tab, Esc, mũi tên cho radio/tabs); Sheet vuốt đóng hoạt động ở di động giả lập; ảnh chụp tham chiếu Playwright cho `/dev/ui` ở 2 theme × 2 kích thước.

### T17. TarotCard và quy trình ảnh
- **Cần**: T16. **Việc**: `public/card-back.svg` (file 04 mục 8); `scripts/process-card-art.ts` (đầu vào thư mục ảnh gốc, đầu ra `webp` 560×960 và `jpg` 300×514; từ chối nếu thiếu lá); component `TarotCard` (kích cỡ, lật, ngược, mặt dự phòng, `CardCaption`). Ảnh gốc do chủ dự án cung cấp ở `assets/card-art-src/` (ngoài git, `.gitignore`); thiếu thì dùng mặt dự phòng.
- **Nghiệm thu**: lật 700 ms mượt (kiểm bằng `Animation` API trong test); `prefers-reduced-motion` → mờ chéo; lá ngược chỉ xoay ảnh; `alt` đúng.

### T18. Soul Map
- **Cần**: T08, T16. **Việc**: `geometry.ts`, `renderSoulMapSvg`, component `SoulMap` + hook hoạt ảnh + bảng `sr-only`, `AxisMeter` (file 06 mục 1-5, file 04 mục 7.12). Trang `/dev/soulmap` hiện cả Ví dụ vàng 1, 2.
- **Nghiệm thu**: test hình học (bảng mục 1); test **component = chuỗi SVG** giống từng ký tự cho `d` của lớp chính; snapshot SVG; ngoài khung nhìn không tốn CPU (rAF dừng khi xong); chế độ giảm chuyển động hiển thị ngay.

### T19. Khung trang và i18n
- **Cần**: T16. **Việc**: Header, Footer, Disclaimer, ActionBar (file 04); `shared/i18n` (`t()`, nạp `messages/vi.json`, kiểm thiếu khóa khi build); nạp **toàn bộ khóa chuỗi** từ file 05 vào `vi.json`.
- **Nghiệm thu**: test thiếu khóa → build thất bại; Header có hành vi dính + mờ nền sau cuộn; footer có ghi nguồn ảnh.

### T20. Landing `/`
- **Cần**: T18, T19. **Việc**: theo file 05 mục 1 (trừ ảnh marketing: dùng khung giữ chỗ tạm).
- **Nghiệm thu**: Lighthouse di động: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95; không cuộn ngang ở 360 px; JS ban đầu ≤ 120 KB gzip; FAQ dùng bàn phím được.

### T21. Luồng rút bài, bước 1-2
- **Cần**: T14, T19. **Việc**: `/draw` khung + reducer + `sessionStorage` nháp; bước 1 (SpreadOption), bước 2 (Textarea, Switch, thông điệp quan tâm); điều hướng, Stepper, nút quay lại; sự kiện analytics.
- **Nghiệm thu**: F5 giữ nguyên nháp; Switch "Lưu ý niệm" tự tắt khi hết chữ; dán 400 ký tự → cắt 280 + toast; chuỗi tự hại hiện thông điệp quan tâm mà **không** gọi mạng (kiểm trong E2E).

### T22. Luồng rút bài, bước 3
- **Cần**: T17, T21. **Việc**: xáo (hoạt ảnh 1400 ms), dải/quạt 78 lá, chọn/bỏ chọn, bay vào slot, truy cập bàn phím + `aria-live`, gọi `POST /api/readings`, trạng thái đang tải, xử lý lỗi, điều hướng sang `/reading/{id}` kèm cờ reveal.
- **Nghiệm thu**: chọn đủ N lá mới bật nút; thao tác hoàn toàn bằng bàn phím; mất mạng giữa chừng → toast + giữ lá đã chọn; rate limit → thông điệp riêng; hiệu năng 60 fps trên giả lập CPU 4× chậm (đo bằng Performance trace, chấp nhận ≥ 45 fps).

### T23. Trang kết quả
- **Cần**: T18, T22. **Việc**: `/reading/[id]` đủ bố cục di động + desktop (file 05 mục 3), choreography lần đầu theo bảng thời gian, rút ngắn khi chạm, trạng thái cuối khi xem lại, hộp phóng to lá bài.
- **Nghiệm thu**: E2E đo mốc thời gian choreography (±150 ms); xem lại không hoạt ảnh; không phải chủ → 404; ý niệm hiện đúng khi đã lưu và không hiện khi chưa.

### T24. Bộ dựng ảnh chia sẻ
- **Cần**: T18, T14. **Việc**: nạp phông TTF; `renderShareImage` cho 3 định dạng theo file 06 mục 6; `GET /api/readings/{id}/image`, `GET /api/s/{token}/image`; `opengraph-image` cho `/s/[token]` và ảnh dự phòng cho `/reading/[id]`; bộ nhớ đệm theo mục 6.8.
- **Nghiệm thu**: kiểm thử ảnh theo file 06 mục 6.9; ảnh không chứa `intention` (test: bản đọc có ý niệm riêng, tìm chuỗi đó trong tham số render → không có); `format` sai → 400; token đã thu hồi → 404.

### T25. ShareSheet
- **Cần**: T23, T24. **Việc**: file 05 mục 5 (3 tab, xem trước, Web Share có file, tải xuống, tạo/sao chép/thu hồi liên kết, xác nhận thu hồi).
- **Nghiệm thu**: trình duyệt không hỗ trợ `canShare({files})` → chỉ còn "Tải ảnh xuống"; hủy chia sẻ không báo lỗi; thu hồi → liên kết cũ 404; sự kiện analytics đúng.

### T26. Trang xem chung `/s/[token]`
- **Cần**: T24. **Việc**: file 05 mục 6; metadata OG/Twitter; trang "liên kết không còn".
- **Nghiệm thu**: không bao giờ hiện `intention`; `noindex`; meta đúng; **kiểm tay** bằng Facebook Sharing Debugger, Zalo, Messenger, Telegram, Slack (ghi kết quả vào `docs/manual-checks.md`).

### T27. Lịch sử, trang tĩnh, trang lỗi
- **Cần**: T19, T14. **Việc**: `/history`, `/about`, `/privacy`, `/terms`, `not-found`, `error`, `global-error`, trang token hết hạn (file 05 mục 7-9). Nội dung pháp lý để chỗ `[MỞ]` rõ ràng.
- **Nghiệm thu**: lịch sử chỉ hiện bản đọc của thiết bị; xóa cookie → rỗng; mọi trang lỗi có nút thoát; `sitemap.ts`/`robots.ts` đúng bảng file 03 mục 8.

### T28. Ảnh tiếp thị và hoàn thiện Landing
- **Cần**: T24, T20. **Việc**: `scripts/render-marketing.ts`, `npm run marketing:render`, thay khung giữ chỗ ở Landing bằng ảnh thật.
- **Nghiệm thu**: ba ảnh PNG trong `public/marketing/` được tạo lại bằng một lệnh và giống nhau giữa hai lần chạy (so sánh băm).

---

## Giai đoạn 4: Hoàn thiện và ra mắt thử

### T29. Truy cập
- **Cần**: T28. **Việc**: quét axe mọi trang bằng Playwright; sửa lỗi; kiểm tra thủ công với trình đọc màn hình (NVDA hoặc VoiceOver) cho luồng rút bài và trang kết quả; đảm bảo thứ tự đọc (file 04 mục 10).
- **Nghiệm thu**: 0 lỗi `serious/critical`; ghi biên bản kiểm tay `docs/manual-checks.md`; tương phản đạt AA ở hai theme.

### T30. E2E
- **Cần**: T28. **Việc**: bộ Playwright: (1) luồng 1 lá hoàn chỉnh; (2) luồng 3 lá + chia sẻ + mở liên kết ở ngữ cảnh khác (không cookie) + thu hồi; (3) lịch sử; (4) bàn phím toàn luồng; (5) giảm chuyển động; (6) di động 390×844 và desktop 1440×900; (7) offline giữa chừng.
- **Nghiệm thu**: toàn bộ xanh trên CI; chạy ổn định 10 lần liên tiếp (không flaky).

### T31. Hiệu năng
- **Cần**: T30. **Việc**: Lighthouse CI với ngân sách file 03 mục 13; tối ưu ảnh, tách mã, `next/image` đúng chỗ, tải phông; kiểm CLS của choreography.
- **Nghiệm thu**: đạt toàn bộ ngưỡng ở file 03 mục 13 trên bản preview (3 lần chạy lấy trung vị).

### T32. Bảo mật
- **Cần**: T30. **Việc**: rà theo file 03 mục 10; kiểm CSP không chặn tính năng; thử CSRF (Origin giả), thử đoán token, thử cookie giả; kiểm không log `intention`; quét bí mật (gitleaks) trong CI.
- **Nghiệm thu**: biên bản `docs/security-review.md` với từng mục đạt/không đạt và cách khắc phục.

### T33. Chỉ số
- **Cần**: T15. **Việc**: `docs/metrics.sql` tính các chỉ số ở `plan.md` mục 1.3 từ `AnalyticsEvent`; hướng dẫn chạy; (tùy chọn) trang quản trị đọc-chỉ `/admin/metrics` bảo vệ bằng token môi trường.
- **Nghiệm thu**: chạy trên dữ liệu giả (script seed) cho ra số hợp lý; định nghĩa phễu khớp mục 1.3.

### T34. Hướng dẫn phát hành
- **Cần**: T31, T32. **Việc**: `docs/release-checklist.md` (biến môi trường, migrate, cron, domain, backup, theo dõi lỗi, kiểm OG), `docs/runbook.md` (sự cố thường gặp: DB đầy, rate limit sai, ảnh OG lỗi), `README.md` cập nhật hướng dẫn chạy.
- **Nghiệm thu**: một người mới làm theo `README` dựng được môi trường dev trong < 15 phút; checklist có chủ sở hữu cho từng dòng.

---

## Cửa kiểm (cần chủ dự án duyệt)

| Cửa | Sau task | Duyệt gì |
|---|---|---|
| 1 | T11 | Giọng văn và hình dạng Soul Map trên 20 mẫu |
| 2 | T23 | Cảm giác lật bài, choreography, độ đẹp Soul Map |
| 3 | T26 | Ảnh chia sẻ trên mạng xã hội thật |
| 4 | T34 | Sẵn sàng ra mắt thử |

## Ước lượng (một người + AI, tham khảo)
Giai đoạn 0-1: 1-2 tuần (nội dung 73 lá chiếm phần lớn) · Giai đoạn 2: 1 tuần · Giai đoạn 3: 2-3 tuần · Giai đoạn 4: 1 tuần.
