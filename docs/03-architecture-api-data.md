# 03. Kiến trúc, API, dữ liệu, bảo mật, vận hành

## 1. Công nghệ (chốt)

| Hạng mục | Lựa chọn | Ghi chú |
|---|---|---|
| Framework | Next.js (App Router), bản ổn định mới nhất lúc khởi tạo | Ghi phiên bản thực tế vào `docs/adr/0001-stack.md` |
| Ngôn ngữ | TypeScript `strict` | `noUncheckedIndexedAccess: true` |
| Style | Tailwind CSS + CSS variables (token ở file 04) | Không dùng thư viện UI nặng |
| Primitive truy cập được | Radix UI (`Dialog`, `Accordion`, `Tabs`, `Toast`, `Tooltip`, `VisuallyHidden`) | Đã xử lý focus và ARIA |
| Icon | `lucide-react` (stroke 1.5) | |
| Validation biên | `zod` | Chỉ ở route handler và hạ tầng, không trong domain |
| CSDL | PostgreSQL + Prisma | Chỉ dùng trong `infrastructure/` |
| Ảnh động | `next/og` (`ImageResponse`, Satori) | Chạy runtime `nodejs` |
| Test | Vitest, Playwright, `@axe-core/playwright` | |
| Ép kiến trúc | `dependency-cruiser` | Cấu hình ở mục 3 |
| Font web | `next/font/google`: Fraunces, Be Vietnam Pro (subset `latin`, `latin-ext`, `vietnamese`) | |
| Font cho ảnh | File TTF tĩnh trong `assets/fonts/` (xem file 06) | Satori không đọc woff2/variable |
| Deploy | Vercel + Postgres được quản lý (Neon hoặc Vercel Postgres) | `[MỞ]` nhà cung cấp cụ thể |
| Node | LTS hiện hành (ghi trong `.nvmrc`) | |

Không thêm thư viện ngoài danh sách khi chưa ghi ADR.

## 2. Cấu trúc thư mục

```
.
├── CLAUDE.md
├── docs/                                  # đặc tả (thư mục này)
├── data/                                  # dữ liệu bài, trải bài, bảng chữ (file 02)
├── messages/vi.json
├── assets/fonts/                          # TTF tĩnh cho ảnh động
├── public/
│   ├── cards/{id}.webp
│   ├── cards/og/{id}.jpg
│   └── icons/…                            # favicon, apple-touch-icon, og-fallback.png
├── prisma/{schema.prisma, migrations/}
├── scripts/{validate-cards.ts, generate-minor-vectors.ts, seed.ts}
├── e2e/                                   # Playwright
├── src/
│   ├── app/                               # Presentation (Next.js)
│   │   ├── layout.tsx
│   │   ├── globals.css                    # token CSS (file 04)
│   │   ├── (site)/page.tsx                # Landing
│   │   ├── (site)/about/page.tsx
│   │   ├── (site)/privacy/page.tsx
│   │   ├── (site)/terms/page.tsx
│   │   ├── draw/page.tsx
│   │   ├── reading/[id]/page.tsx
│   │   ├── reading/[id]/opengraph-image.tsx   # chỉ trả ảnh dự phòng (reading riêng tư)
│   │   ├── s/[token]/page.tsx
│   │   ├── s/[token]/opengraph-image.tsx
│   │   ├── history/page.tsx
│   │   ├── not-found.tsx · error.tsx · global-error.tsx
│   │   ├── api/readings/route.ts                      # POST, GET(list)
│   │   ├── api/readings/[id]/route.ts                 # GET
│   │   ├── api/readings/[id]/share/route.ts           # POST, DELETE
│   │   ├── api/readings/[id]/image/route.ts           # GET (chủ)
│   │   ├── api/s/[token]/image/route.ts               # GET (công khai)
│   │   ├── api/events/route.ts                        # POST analytics
│   │   ├── api/cron/purge/route.ts                    # GET (cron)
│   │   └── robots.ts · sitemap.ts · manifest.ts
│   ├── components/                        # UI dùng chung (file 04)
│   │   ├── ui/                            # Button, Chip, Dialog, …
│   │   ├── tarot-card/ · soul-map/ · layout/ · share/
│   ├── contexts/
│   │   ├── tarot/
│   │   │   ├── domain/                    # card.ts, spread.ts, deck.ts, reversed-vector.ts, random-int.ts
│   │   │   ├── application/               # public-api.ts, draw-for-spread.ts, get-spread.ts, ports.ts
│   │   │   └── infrastructure/            # json-card-repository.ts, json-spread-repository.ts, csprng-random-source.ts
│   │   ├── reading/
│   │   │   ├── domain/                    # reading.ts, soul-map.ts, interpretation.ts, title.ts, events.ts, prng.ts
│   │   │   ├── application/               # create-reading.ts, get-reading-for-owner.ts, get-shared-reading.ts,
│   │   │   │                              #   share-reading.ts, revoke-share.ts, list-owned-readings.ts, ports.ts, dto.ts
│   │   │   └── infrastructure/            # prisma-reading-repository.ts, tarot-gateway.ts, id-generator.ts, soul-map-svg.ts
│   │   └── analytics/
│   │       ├── application/               # record-event.ts, ports.ts
│   │       └── infrastructure/            # prisma-event-store.ts, visitor-hash.ts, in-process-event-bus.ts
│   ├── shared/
│   │   ├── kernel/                        # result.ts, clock.ts
│   │   ├── i18n/                          # t(), loader messages
│   │   └── http/                          # owner-cookie.ts, rate-limit.ts, errors.ts, headers.ts
│   └── composition/container.ts           # NƠI DUY NHẤT nối port ↔ adapter
└── .dependency-cruiser.cjs
```

Quy ước: tên file kebab-case; mỗi file một export chính; test đặt cạnh (`*.test.ts`).

## 3. Quy tắc import (ép bằng dependency-cruiser)

| # | Quy tắc |
|---|---|
| D1 | `contexts/*/domain/**` chỉ được import `contexts/<cùng context>/domain/**` và `shared/kernel/**`. Cấm `node:*`, `next`, `react`, `@prisma/client`, `zod`. |
| D2 | `contexts/*/application/**` được import `domain` cùng context, `application` cùng context, `shared/kernel`. Cấm `infrastructure`, `app`, `components`, thư viện framework. |
| D3 | `contexts/*/infrastructure/**` được import `application`, `domain` cùng context, `shared/**`, thư viện ngoài. |
| D4 | Context này không import context kia, **trừ** `contexts/reading/infrastructure/tarot-gateway.ts` được import `contexts/tarot/application/public-api.ts` (và chỉ file đó). |
| D5 | `app/**` và `components/**` chỉ import `application` (use case, DTO), `composition/container`, `shared/**`, `components/**`. Cấm import `domain`/`infrastructure` trực tiếp. |
| D6 | `composition/**` được import mọi thứ; không ai import `composition` ngoại trừ `app/**`. |
| D7 | Cấm vòng phụ thuộc. |
| D8 | Cấm `Math.random`, `Date.now`, `new Date()` (không đối số) và `crypto.*` trong `contexts/*/domain/**` và `application/**` (kiểm bằng ESLint `no-restricted-properties`/`no-restricted-syntax`). |

## 4. Composition root

`composition/container.ts` xuất `getContainer()` (singleton theo process) trả về:

```ts
interface Container {
  tarot: TarotPublicApi;
  reading: {
    createReading: CreateReading; getReadingForOwner: GetReadingForOwner; getSharedReading: GetSharedReading;
    shareReading: ShareReading; revokeShare: RevokeShare; listOwnedReadings: ListOwnedReadings;
  };
  analytics: { recordEvent: RecordEvent };
  infra: { clock: Clock; rateLimiter: RateLimiter; ownerCookie: OwnerCookieCodec };
}
```

Quy tắc: không dùng decorator/DI framework; nối bằng constructor.

## 5. Mô hình dữ liệu (Prisma)

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

model Reading {
  id             String    @id                    // "rd_" + 16 base58
  createdAt      DateTime  @default(now())
  schemaVersion  Int       @default(1)
  locale         String    @default("vi")
  spreadId       String
  allowReversed  Boolean
  title          String
  cards          Json                              // DrawnCard[] (snapshot)
  soulMap        Json                              // SoulMap
  interpretation Json                              // Interpretation
  intention      String?                           // chỉ khi người dùng đồng ý lưu
  shareToken     String?   @unique
  sharedAt       DateTime?
  lastViewedAt   DateTime  @default(now())

  @@index([createdAt])
  @@index([lastViewedAt])
}

model AnalyticsEvent {
  id          BigInt   @id @default(autoincrement())
  name        String
  occurredAt  DateTime @default(now())
  visitorHash String                               // sha256(saltTheoNgày + ip + ua), xoay mỗi ngày
  props       Json     @default("{}")
  @@index([name, occurredAt])
}

model RateLimitBucket {
  key         String
  windowStart DateTime
  count       Int
  @@id([key, windowStart])
}
```

Tải `Reading` ↔ domain: mapper trong `prisma-reading-repository.ts` kiểm tra bằng zod khi đọc JSON (phòng dữ liệu cũ), `schemaVersion` dùng cho nâng cấp sau.

### Thời hạn lưu giữ

| Dữ liệu | Thời hạn |
|---|---|
| Reading chưa chia sẻ | Xóa sau **180 ngày** kể từ `lastViewedAt` |
| Reading đã chia sẻ | Xóa sau **730 ngày** kể từ `lastViewedAt`, hoặc ngay khi bị thu hồi **và** quá 180 ngày |
| `AnalyticsEvent` | 400 ngày |
| `RateLimitBucket` | Xóa bản ghi quá 2 giờ |

`/api/cron/purge` (Vercel Cron, mỗi ngày 03:00 UTC, xác thực bằng header `Authorization: Bearer ${CRON_SECRET}`) thực hiện dọn.

## 6. Danh tính chủ sở hữu (không tài khoản)

Cookie `nd_owner`:
- Giá trị: `base64url(JSON{"v":1,"ids":["rd_…",…]}) + "." + base64url(HMAC_SHA256(payloadB64, OWNER_COOKIE_SECRET))`.
- Thuộc tính: `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=34560000` (400 ngày).
- Giữ tối đa **50** id mới nhất; thêm id mới ở đầu, cắt bớt cuối.
- `OwnerCookieCodec.decode()` trả tập rỗng nếu chữ ký sai hoặc payload hỏng (không throw). So sánh chữ ký bằng `timingSafeEqual`.
- Đọc cookie ở server components và route handler, dựng `OwnerContext`.
- Mất cookie = mất quyền xem Reading riêng tư. Giao diện phải nói rõ điều này (file 05, màn Lịch sử).

## 7. API

Mọi route trả JSON UTF-8 (trừ ảnh). Lỗi thống nhất:

```json
{ "error": { "code": "VALIDATION_FAILED", "message": "Nội dung không hợp lệ.", "details": [{ "path": "intention", "issue": "too_long" }] } }
```

| HTTP | `code` | Khi nào |
|---|---|---|
| 400 | `VALIDATION_FAILED` | Body sai schema |
| 404 | `NOT_FOUND` | Không tồn tại **hoặc** không có quyền (không phân biệt) |
| 413 | `PAYLOAD_TOO_LARGE` | Body > 4 KB |
| 429 | `RATE_LIMITED` | Có header `Retry-After` (giây) |
| 500 | `INTERNAL` | Không lộ chi tiết; ghi log có `requestId` |

Mọi phản hồi có header `x-request-id`.

### 7.1. `POST /api/readings`

Body (zod):
```ts
z.object({
  spreadId: z.enum(['single','three']),
  allowReversed: z.boolean().default(true),
  intention: z.string().trim().max(280).optional(),
  storeIntention: z.boolean().default(false),
  pickedSlots: z.array(z.number().int().min(0).max(77)).max(3).optional()   // chỉ để phân tích, không ảnh hưởng kết quả
}).strict()
```
- 201: `{ "id": "rd_…", "path": "/reading/rd_…" }` kèm `Set-Cookie: nd_owner=…`.
- Giới hạn: **20 yêu cầu / giờ / `visitorHash`-IP**, và 5 / phút.
- `intention` bị bỏ (không lưu) nếu `storeIntention=false`. Không ghi vào log.

### 7.2. `GET /api/readings/{id}` (chỉ chủ)

200 `ReadingView`:

```json
{
  "id": "rd_3xK9mQpL2vTzW8aB",
  "createdAt": "2026-10-25T14:03:22.000Z",
  "spread": { "id": "three", "name": "Ba lá" },
  "allowReversed": true,
  "title": "Ngọn Lửa Dịch Chuyển",
  "tagline": "Bạn đang mang nhiều lửa. Điều còn lại là chọn nơi đặt nó.",
  "cards": [
    {
      "position": { "index": 0, "key": "past", "label": "Quá khứ", "description": "Điều đã góp phần đưa bạn đến đây.", "weight": 0.8 },
      "cardId": "major-00", "name": "Chàng Khờ", "nameEn": "The Fool",
      "arcana": "major", "suit": null, "number": 0,
      "orientation": "upright",
      "keywords": ["Khởi đầu", "Tự do", "Tin tưởng"],
      "meaning": "…", "prompt": "…",
      "imageUrl": "/cards/major-00.webp"
    }
  ],
  "soulMap": {
    "vector": { "energy": 0.8356, "emotion": 0.5489, "connection": 0.3556, "grounding": 0.2822, "mind": 0.4122, "change": 0.8256 },
    "dominant": "energy", "second": "change", "quiet": "grounding",
    "perCard": [ { "energy": 0.75, "emotion": 0.55, "connection": 0.45, "grounding": 0.15, "mind": 0.25, "change": 0.9 } ],
    "balanced": false,
    "display": { "vector": { "…": "giống vector khi stretch = 1" }, "perCard": [ "…" ], "stretch": 1 }
  },
  "synthesis": "…",
  "closingPrompts": ["…", "…"],
  "intention": null,
  "share": null
}
```
`share`: `null` hoặc `{ "path": "/s/<token>", "sharedAt": "…" }`.

### 7.3. `GET /api/readings` (chủ)
200 `{ "items": ReadingSummary[] }` với `ReadingSummary = { id, createdAt, title, spreadId, dominant, cardImages: string[], shared: boolean }`, tối đa 50, mới nhất trước.

### 7.4. `POST /api/readings/{id}/share` (chủ)
200 `{ "token": "…", "path": "/s/…", "sharedAt": "…" }`. Idempotent. Rate limit 30/giờ.

### 7.5. `DELETE /api/readings/{id}/share` (chủ)
204. Idempotent. Từ lúc này `/s/<token cũ>` trả 404.

### 7.6. `GET /api/readings/{id}/image?format=story|portrait|og&download=1` (chủ)
- `Content-Type: image/png`. `download=1` thêm `Content-Disposition: attachment; filename="noschadamus-{id}-{format}.png"`.
- `Cache-Control: private, max-age=3600`.
- Rate limit 60/giờ.

### 7.7. `GET /api/s/{token}/image?format=…` (công khai)
Như 7.6 nhưng `Cache-Control: public, max-age=31536000, immutable`, chỉ khi token còn hiệu lực. Ảnh **không** chứa `intention`.

### 7.8. `POST /api/events`
Body: `{ "name": EventName, "props": {…} }` (danh sách tên và props cho phép ở mục 9). Trả 204. Bỏ qua im lặng nếu `Sec-GPC: 1` hoặc `DNT: 1`. Rate limit 120/phút.

### 7.9. Trang (server component) gọi use case trực tiếp, không đi qua HTTP
- `/reading/[id]` → `getReadingForOwner`; không phải chủ → `notFound()`.
- `/s/[token]` → `getSharedReading`; token sai/đã thu hồi → trang "liên kết không còn" (file 05 mục 9) với HTTP 404.
- `/history` → `listOwnedReadings`.

## 8. Metadata, SEO, chia sẻ liên kết

| Trang | `robots` | Ghi chú |
|---|---|---|
| `/`, `/about`, `/privacy`, `/terms` | index, follow | Có JSON-LD `WebSite` ở `/` |
| `/draw` | noindex | |
| `/reading/*`, `/history` | noindex, nofollow | `Cache-Control: private, no-store` |
| `/s/*` | noindex, nofollow | `og:image` trỏ `/s/{token}/opengraph-image` (1200×630) |

- `<title>` theo mẫu `"{Tiêu đề trang} · noschadamus"`.
- `/s/{token}`: `og:title = "{title} · noschadamus"`, `og:description = tagline`, `twitter:card = summary_large_image`.
- `og:locale = vi_VN`.
- `theme-color = #0E0F1A`.
- Trang sitemap chỉ liệt kê trang tĩnh.

## 9. Phân tích (analytics) tối giản, không cookie

`visitorHash = sha256(DAILY_SALT(ngày UTC) + ip + userAgent)`; `DAILY_SALT = HMAC(ANALYTICS_SECRET, yyyy-mm-dd)`. Không lưu IP/UA. Không nhận diện xuyên ngày.

| Sự kiện | props cho phép |
|---|---|
| `landing_view` | `ref: 'direct'|'share'|'other'` |
| `draw_started` | – |
| `spread_selected` | `spreadId` |
| `intention_entered` | `hasText: boolean` (không gửi nội dung) |
| `cards_picked` | `count` |
| `reading_created` | `spreadId`, `allowReversed`, `dominant` (phát từ server qua domain event) |
| `reading_viewed` | `mode: 'owner'|'shared'`, `firstView: boolean` |
| `share_opened` | – |
| `share_image_downloaded` | `format` |
| `share_native_used` | `format`, `result: 'shared'|'cancelled'|'unsupported'` |
| `share_link_created` | – |
| `share_link_revoked` | – |
| `shared_view_cta_clicked` | – |
| `reading_abandoned` | `step: 'spread'|'intention'|'pick'` (khi rời `/draw` giữa chừng) |

Server từ chối prop không có trong danh sách (loại bỏ khóa lạ).

Các chỉ số ở `plan.md` mục 1.3 được tính từ những sự kiện này (định nghĩa SQL mẫu đặt ở `docs/metrics.sql`, làm ở task T33).

## 10. Bảo mật

- Header (middleware hoặc `next.config`): `Content-Security-Policy` (`default-src 'self'`; `img-src 'self' data: blob:`; `style-src 'self' 'unsafe-inline'`; `script-src 'self'` + nonce; `font-src 'self'`; `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Strict-Transport-Security` (production).
- CSRF: các route ghi đổi (`POST/DELETE`) yêu cầu header `Origin` trùng `NEXT_PUBLIC_SITE_URL` (hoặc host hiện tại) **và** `Content-Type: application/json`.
- Giới hạn kích thước body 4 KB; từ chối `Content-Type` khác.
- Không log `intention`, cookie, token chia sẻ ở dạng đầy đủ (chỉ 6 ký tự đầu).
- Token chia sẻ sinh bằng `crypto.randomBytes(16)` → base64url (22 ký tự).
- Đọc Reading của người khác luôn trả 404 như "không tồn tại".
- Phụ thuộc: bật Dependabot; CI chạy `npm audit --omit=dev` (cảnh báo, không chặn).

## 11. Biến môi trường (`.env.example`)

```
DATABASE_URL=postgresql://user:pass@localhost:5432/noschadamus
NEXT_PUBLIC_SITE_URL=http://localhost:3000
OWNER_COOKIE_SECRET=change-me-32-bytes-min
ANALYTICS_SECRET=change-me-32-bytes-min
CRON_SECRET=change-me
```
Ứng dụng khởi động thất bại với thông báo rõ nếu thiếu/độ dài secret < 32 ký tự (ở production).

## 12. Quan sát và vận hành

- Log JSON có cấu trúc (`level`, `msg`, `requestId`, `route`, `durationMs`); không log dữ liệu cá nhân.
- Sentry (hoặc tương đương) cho lỗi client và server; `[MỞ]` chọn nhà cung cấp, đặt qua biến `SENTRY_DSN` tùy chọn.
- Endpoint `GET /api/health` trả `{ ok: true, db: boolean }` (không lộ phiên bản).
- CI (GitHub Actions): `install → lint → typecheck → test → cards:validate → build → e2e (trên preview)`.
- Preview deploy cho mỗi PR; migrate DB bằng `prisma migrate deploy` ở bước release.
- Sao lưu DB: dùng tính năng của nhà cung cấp (điểm khôi phục tối thiểu 7 ngày).

## 13. Hiệu năng (ngân sách)

| Chỉ tiêu | Ngưỡng |
|---|---|
| LCP p75 (di động 4G) | < 2,5 s |
| INP p75 | < 200 ms |
| CLS | < 0,05 |
| JS ban đầu trang landing | ≤ 120 KB gzip |
| Ảnh lá bài | ≤ 60 KB/ảnh, `loading="lazy"` trừ ảnh trong khung nhìn đầu |
| `POST /api/readings` | p95 < 600 ms (không tính render ảnh) |
| Ảnh chia sẻ | tạo < 2 s (lần đầu), phục vụ từ cache sau đó |

Kiểm bằng Lighthouse CI ở task T31.

## 14. Truy cập (a11y) tối thiểu bắt buộc

WCAG 2.2 AA: tương phản, thao tác bàn phím, `focus-visible`, `prefers-reduced-motion`, `aria-live` cho kết quả động, mô tả thay thế cho Soul Map, kích thước chạm ≥ 44×44 px. Axe không có vi phạm `serious`/`critical` trên mọi trang (kiểm trong Playwright).
