# Kế hoạch xây dựng noschadamus

Nền tảng tarot/bói toán theo hướng "đọc lạ": biến lá bài thành trải nghiệm trực quan, dễ chia sẻ, không phán đoán cát/hung.

Tài liệu đi theo thứ tự: **Sản phẩm → Nghiệp vụ → Kiến trúc → Chất lượng phi chức năng → Lộ trình → Rủi ro**. Mỗi phần phụ thuộc vào phần trước nó, không nhảy cóc.

---

## 1. Sản phẩm

### 1.1. Vấn đề và giá trị

| | |
|---|---|
| Người dùng | Người trẻ (18-30) tò mò về tâm linh, không muốn bị phán xét, hay đăng nội dung lên Instagram/TikTok |
| Vấn đề | Các trang tarot hiện có hoặc quá "định mệnh" (dự đoán), hoặc giao diện cũ, kết quả là một khối chữ khó chia sẻ |
| Giá trị cốt lõi | Một lượt rút bài trả về **một hình ảnh đẹp, có tính cá nhân, đáng đăng** và một vài câu hỏi gợi mở để suy ngẫm |
| Không làm | Dự đoán tương lai, tư vấn y tế/tài chính/pháp lý, nội dung gây sợ hãi |

### 1.2. Định vị: chọn một hướng cho MVP

Ba hướng trong bản nháp trước **không loại trừ nhau nhưng không nên làm cùng lúc**. Quyết định:

| Hướng | Vai trò |
|---|---|
| **Bản đồ linh hồn** (trực quan hóa) | **MVP**: là thứ tạo ra hình ảnh để chia sẻ, kéo người dùng mới |
| **Công cụ suy ngẫm** (câu hỏi gợi mở) | **MVP**: là nội dung văn bản của kết quả, đồng thời là lớp bảo vệ đạo đức (xem 1.4) |
| Đối chiếu chéo đa hệ thống | **Sau MVP**: chỉ làm khi MVP chứng minh được người dùng quay lại |

### 1.3. Chỉ số thành công

Đặt chỉ số trước khi viết code để mỗi giai đoạn có tiêu chí dừng/tiếp tục.

| Chỉ số | Ý nghĩa | Mục tiêu MVP (đề xuất, chỉnh theo thực tế) |
|---|---|---|
| Tỷ lệ hoàn tất lượt rút (vào `/draw` → thấy kết quả) | Trải nghiệm không bị đứt | ≥ 70% |
| Tỷ lệ chia sẻ (lượt có bấm chia sẻ/tải ảnh ÷ lượt hoàn tất) | Giả thuyết cốt lõi: hình ảnh đáng chia sẻ | ≥ 15% |
| Tỷ lệ truy cập từ link chia sẻ | Vòng lặp lan truyền hoạt động | theo dõi, chưa đặt ngưỡng |
| Quay lại trong 7 ngày | Có giá trị lâu dài hay chỉ tò mò một lần | ≥ 20% |
| Thời gian tải kết quả (p75) | Trải nghiệm di động | < 2,5 s |

### 1.4. Nguyên tắc nội dung và đạo đức

- Mọi văn bản kết quả dùng giọng **gợi mở** ("Điều gì trong bạn đang…?"), không dùng giọng khẳng định về tương lai.
- Có dòng tuyên bố rõ: nội dung mang tính giải trí và suy ngẫm, không thay thế tư vấn chuyên môn.
- Không thu thập dữ liệu nhạy cảm (sức khỏe, tình trạng tâm lý) dù người dùng gõ vào câu hỏi: câu hỏi người dùng nhập là **tùy chọn, không lưu mặc định**.
- Bản quyền nội dung: ảnh bài Rider-Waite-Smith (1909) thuộc phạm vi công cộng ở nhiều nơi, nhưng **văn bản ý nghĩa lá bài lấy từ repo mở phải kiểm tra giấy phép từng nguồn**. Cách an toàn nhất là tự biên soạn hoặc dùng nguồn có license rõ ràng, ghi nguồn trong repo.

---

## 2. Nghiệp vụ (domain)

### 2.1. Ngôn ngữ chung (ubiquitous language)

Thống nhất thuật ngữ để code, tài liệu và trao đổi dùng cùng một từ.

| Thuật ngữ | Định nghĩa |
|---|---|
| **Card** (lá bài) | Một trong 78 lá của bộ tarot; có tên, nhóm (Major/Minor), chất, ý nghĩa xuôi/ngược |
| **Spread** (trải bài) | Cấu hình rút bài: số lá và ý nghĩa từng vị trí (vd. 1 lá, 3 lá Quá khứ-Hiện tại-Hướng đi) |
| **Draw** (lượt rút) | Hành động rút ngẫu nhiên các lá cho một Spread, mỗi lá có Orientation (xuôi/ngược) |
| **Reading** (bản đọc) | Kết quả hoàn chỉnh của một Draw: lá bài, diễn giải, câu hỏi suy ngẫm, bản đồ linh hồn. **Bất biến sau khi tạo** |
| **Soul Map** (bản đồ linh hồn) | Biểu diễn trực quan của Reading (radar các trục cảm xúc) |
| **Share Link** | Đường dẫn công khai, chỉ đọc, trỏ tới một Reading |
| **Reflection Prompt** | Câu hỏi gợi mở gắn với một lá/vị trí |

### 2.2. Bounded context và quan hệ

Chỉ **hai context ở MVP**; context thứ ba chỉ thêm khi có nhu cầu thật.

| Context | Trách nhiệm | Giai đoạn |
|---|---|---|
| **Tarot** | Danh mục bài, Spread, quy tắc rút bài | MVP |
| **Reading** | Tạo, lưu, chia sẻ Reading; sinh Soul Map | MVP |
| **Astrology** (cung hoàng đạo, thần số học) | Danh mục và quy tắc hệ thống thứ hai | Sau MVP |
| **Identity** (tài khoản, lịch sử cá nhân) | Đăng nhập, gắn Reading với người dùng | Sau MVP (MVP là ẩn danh) |
| **Analytics** | Đo chỉ số ở 1.3 | MVP, dạng tối giản, lắng nghe event |

Hướng phụ thuộc giữa các context (một chiều, không vòng):

```
Tarot  ◄── Reading ──► (phát event) ──► Analytics
                          ▲
Astrology (sau MVP) ──────┘ (Reading đọc qua cổng ACL, không import trực tiếp)
```

- **Reading phụ thuộc Tarot** (downstream). Tarot không biết Reading tồn tại.
- Reading **không import entity của Tarot**. Nó gọi qua một *port* (`TarotGateway`) và nhận về DTO/snapshot của riêng mình (anti-corruption layer). Nhờ đó đổi mô hình Tarot không làm vỡ Reading.
- Giao tiếp ngược chiều và sang Analytics dùng **domain event** (`ReadingCreated`, `ReadingShared`), không gọi trực tiếp.

### 2.3. Mô hình miền chính

**Tarot context**
- `Card` (entity): id, tên, nhóm, chất, ý nghĩa xuôi/ngược, từ khóa cảm xúc.
- `Spread` (entity): id, danh sách `Position` (tên vị trí, ý nghĩa vị trí).
- `Deck` (domain service): xáo bài và rút bài theo `Spread`.
- Value object: `CardId`, `Orientation`, `Suit`, `Arcana`.

**Reading context**
- `Reading` (**aggregate root**): id, thời điểm tạo, danh sách `DrawnCard` (lưu **snapshot** tên, ý nghĩa, hướng của lá tại thời điểm rút), `Interpretation`, `SoulMap`, `Visibility`.
- Value object: `ReadingId`, `DrawnCard`, `SoulMapAxis` (trục và giá trị 0-1), `ShareToken`.
- Event: `ReadingCreated`, `ReadingShared`.

**Quy tắc nghiệp vụ (invariants)**
1. Số lá trong Draw phải bằng số vị trí của Spread; không lá nào lặp lại trong cùng một Draw.
2. Reading **bất biến**: sau khi tạo không sửa nội dung. Sửa nội dung bài trong danh mục không làm thay đổi Reading cũ (nhờ snapshot).
3. Việc rút bài dùng **nguồn ngẫu nhiên an toàn (CSPRNG)** và chạy **phía server**, để kết quả không bị can thiệp và Reading có thể kiểm chứng.
4. Giá trị mỗi trục Soul Map nằm trong [0, 1]; được tính **tất định** từ từ khóa cảm xúc của các lá (cùng đầu vào cho cùng đầu ra, dễ test).
5. Share Link dùng token không đoán được; người dùng có thể thu hồi (đổi `Visibility` về riêng tư).
6. Câu hỏi người dùng nhập (nếu có) không được lưu trừ khi người dùng đồng ý rõ ràng.

### 2.4. Các luồng nghiệp vụ chính

**Luồng A: Tạo Reading** (`CreateReading`, một use case duy nhất điều phối)
1. Người dùng chọn Spread (1 lá hoặc 3 lá), tùy chọn nhập câu hỏi.
2. Server rút bài (`Deck.draw(spread)`), nhận các lá kèm hướng.
3. Reading context dựng `DrawnCard` snapshot, sinh `Interpretation` (ý nghĩa + Reflection Prompt) và `SoulMap`.
4. Lưu `Reading`, phát `ReadingCreated`.
5. Trả về `readingId`; client điều hướng tới `/reading/{id}`.

**Luồng B: Xem và chia sẻ**
1. `/reading/{id}` hiển thị kết quả và Soul Map.
2. Bấm "Chia sẻ" → server cấp `ShareToken`, đặt `Visibility = Shared`, phát `ReadingShared`.
3. Link chia sẻ có **ảnh xem trước (Open Graph)** do server render, nên dán lên mạng xã hội vẫn hiện hình đẹp.
4. Người dùng có thể tải ảnh PNG hoặc dùng Web Share API (có fallback tải về).

**Luồng C: Người nhận link** → xem Reading chỉ đọc → lời mời "Rút bài của riêng bạn" (vòng lặp lan truyền).

---

## 3. Kiến trúc

### 3.1. Nguyên tắc

- **Clean Architecture** trong từng context: phụ thuộc chỉ hướng vào trong (UI/Infra → Application → Domain).
- **DDD chiến thuật** ở chỗ có logic nghiệp vụ thật (aggregate, invariant, domain service). Phần CRUD đơn giản không cần bọc nhiều tầng.
- **Không over-engineer**: bắt đầu bằng một codebase (modular monolith), tách context bằng thư mục và quy tắc import, chưa tách service.

### 3.2. Các tầng

```
Presentation  (Next.js: trang, route handler, component)
      │  gọi
Application   (use case, port, DTO; điều phối, không chứa quy tắc nghiệp vụ)
      │  gọi
Domain        (entity, value object, domain service, event; TypeScript thuần)
      ▲  implements
Infrastructure (Prisma/Postgres, đọc dữ liệu bài, render ảnh, event bus)
```

Quy tắc: Domain không import framework, ORM hay thư viện UI. Application định nghĩa **port** (interface), Infrastructure **implement**. Hạ tầng được nối ở một **composition root** duy nhất.

### 3.3. Cấu trúc thư mục

```
src/
├── app/                          # Next.js App Router (chỉ là lớp Presentation)
│   ├── (marketing)/page.tsx      # Landing
│   ├── draw/page.tsx
│   ├── reading/[id]/page.tsx
│   ├── reading/[id]/opengraph-image.tsx   # ảnh xem trước khi chia sẻ
│   └── api/                      # Route handler gọi use case
│
├── contexts/
│   ├── tarot/
│   │   ├── domain/               # Card, Spread, Deck, value objects
│   │   ├── application/          # use case: GetSpread, DrawForSpread; port
│   │   └── infrastructure/       # repo đọc dữ liệu 78 lá (JSON → DB sau)
│   ├── reading/
│   │   ├── domain/               # Reading (aggregate), DrawnCard, SoulMap, event
│   │   ├── application/          # use case: CreateReading, GetReading, ShareReading,
│   │   │                         #   RevokeShare; port: ReadingRepository, TarotGateway
│   │   └── infrastructure/       # Prisma repo, TarotGateway adapter, image renderer
│   └── analytics/                # lắng nghe event, ghi số liệu
│
├── shared/
│   ├── kernel/                   # chỉ những thứ thật sự phổ quát: Result, Clock, IdGenerator
│   └── ui/                       # Button, Card, Modal
│
└── composition/
    └── container.ts              # nơi DUY NHẤT nối port với adapter
```

Khác bản nháp cũ:
- Bỏ thư mục `ui/` trong từng context; UI nằm ở `app/` và `shared/ui` để tránh domain lẫn component.
- `Reading` **không** dùng chung entity với `Tarot` (xem anti-corruption layer ở 2.2).
- Thêm `opengraph-image` cho việc chia sẻ, đây là yêu cầu nghiệp vụ, không phải chi tiết phụ.

### 3.4. Quyết định công nghệ

| Hạng mục | Lựa chọn | Lý do |
|---|---|---|
| Framework | Next.js (App Router, bản ổn định mới nhất) + TypeScript | SSR/SEO, render ảnh OG phía server, route linh hoạt |
| DI | **Tự nối bằng tay ở composition root** (constructor injection) | Không cần decorator/thư viện, không làm "rò" framework vào domain; đủ cho quy mô này |
| CSDL | PostgreSQL + Prisma, chỉ dùng ở Infrastructure | Reading cần lưu bền để link chia sẻ còn sống |
| Dữ liệu bài | JSON trong repo ở MVP, chuyển DB khi cần chỉnh sửa nội dung | Đơn giản trước, đổi sau nhờ port `CardRepository` |
| Trực quan hóa | SVG (D3 hoặc tự vẽ) cho Soul Map | SVG render được cả server lẫn client, dùng lại cho ảnh OG |
| Xuất ảnh | **Satori / `ImageResponse` phía server** là đường chính; `html-to-image` chỉ là phương án phụ | Ảnh nhất quán giữa thiết bị, dùng được cho xem trước link |
| Ngẫu nhiên | `crypto.getRandomValues` (CSPRNG) | Tránh `Math.random` cho rút bài |
| Test | Vitest (domain, application), Playwright (luồng chính) | Domain test nhanh; E2E bảo vệ luồng A-B-C |

---

## 4. Yêu cầu phi chức năng

| Nhóm | Yêu cầu |
|---|---|
| **Hiệu năng** | LCP p75 < 2,5 s trên di động; Soul Map render tĩnh (SVG), không tải thư viện nặng nếu không cần |
| **Quyền riêng tư** | Mặc định ẩn danh; không lưu câu hỏi nếu chưa đồng ý; Share Link thu hồi được; có trang Chính sách riêng tư; cookie/analytics tuân thủ quy định địa phương (GDPR/PDPD nếu có người dùng liên quan) |
| **Bảo mật** | Rate limit endpoint tạo Reading (chống spam), kiểm tra đầu vào, token chia sẻ ngẫu nhiên đủ dài, header bảo mật chuẩn |
| **Khả dụng** | Cho phép lưu Reading thất bại một cách nhẹ nhàng; ảnh OG có ảnh dự phòng khi render lỗi |
| **Truy cập (a11y)** | Tương phản màu đạt WCAG AA, điều hướng bàn phím, mô tả văn bản thay thế cho Soul Map (bảng số liệu ẩn cho trình đọc màn hình) |
| **Quan sát được** | Log có cấu trúc, theo dõi lỗi (vd. Sentry), đo các chỉ số ở 1.3 qua event |
| **Đa ngôn ngữ** | Văn bản tách khỏi code ngay từ đầu (tiếng Việt trước, sẵn sàng thêm tiếng Anh) |
| **Vận hành** | CI chạy lint, type-check, test; deploy tự động ra môi trường preview cho mỗi PR |

---

## 5. Lộ trình

Mỗi giai đoạn có **đầu ra kiểm chứng được** và **tiêu chí qua cửa** trước khi sang giai đoạn kế.

### Giai đoạn 0: Nền tảng (3-5 ngày)
- Khởi tạo repo Next.js + TypeScript, lint, format, Vitest, CI.
- Viết ADR ngắn cho các quyết định ở 3.4; chốt nguồn dữ liệu bài và giấy phép.
- **Qua cửa**: CI xanh trên nhánh chính, có preview deploy.

### Giai đoạn 1: Lõi nghiệp vụ (1-2 tuần)
- Tarot: `Card`, `Spread`, `Deck` (xáo/rút bằng CSPRNG), dữ liệu 78 lá.
- Reading: `Reading` aggregate, snapshot `DrawnCard`, tính `SoulMap` tất định, `Interpretation` + Reflection Prompt.
- Use case `CreateReading` với repository in-memory.
- **Qua cửa**: unit test phủ các invariant ở 2.3 (không trùng lá, bất biến, trục trong [0,1], tất định); chạy được bằng script không cần UI/DB.

### Giai đoạn 2: Luồng người dùng hoàn chỉnh (1-2 tuần)
- Prisma repository, port `TarotGateway`, composition root.
- Trang `/draw` và `/reading/[id]`; hiển thị Soul Map bằng SVG.
- Tạo/xem Reading chạy thật trên Postgres.
- **Qua cửa**: E2E (Playwright) cho luồng A; trang kết quả đạt ngưỡng hiệu năng ở mục 4.

### Giai đoạn 3: Chia sẻ và lan truyền (1 tuần)
- `ShareReading`/`RevokeShare`, `ShareToken`, trang xem công khai chỉ đọc.
- Ảnh OG phía server, tải PNG, Web Share API + fallback.
- Event `ReadingCreated`/`ReadingShared` → Analytics tối giản.
- **Qua cửa**: dán link lên Facebook/Zalo/Messenger hiện đúng ảnh; đo được tỷ lệ chia sẻ.

### Giai đoạn 4: Ra mắt thử và đo lường (2 tuần)
- Landing, trang Chính sách riêng tư và tuyên bố nội dung, rate limit, theo dõi lỗi.
- Mời nhóm người dùng thử nhỏ, thu thập số liệu theo mục 1.3.
- **Quyết định dừng/tiếp**: nếu tỷ lệ chia sẻ và quay lại đạt ngưỡng → sang giai đoạn 5; nếu không → chỉnh nội dung/hình ảnh trước khi mở rộng tính năng.

### Giai đoạn 5: Mở rộng (chỉ khi giai đoạn 4 đạt)
- Context Astrology, use case đối chiếu chéo (`GenerateCrossSystemReading`) đọc qua cổng ACL.
- Context Identity (đăng nhập, lịch sử cá nhân).
- Mô hình doanh thu (xem mục 6) nếu có.

---

## 6. Mô hình doanh thu (để quyết định sau giai đoạn 4)

Không triển khai trước khi có người dùng quay lại. Các hướng cân nhắc:
- Bộ giao diện/hình minh họa Soul Map cao cấp (mua một lần hoặc gói).
- Trải bài nâng cao (nhiều lá, nhiều hệ thống) cho thành viên.
- Quà tặng/in ấn bản đồ linh hồn (poster, thiệp).

Tránh quảng cáo gây khó chịu hoặc bán "dự đoán", vì mâu thuẫn với định vị ở mục 1.

---

## 7. Rủi ro và cách giảm

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Hình ảnh không đủ hấp dẫn để chia sẻ (giả thuyết cốt lõi sai) | Cao | Thử nghiệm sớm ở giai đoạn 3-4 với số liệu thật; đầu tư thiết kế Soul Map trước khi thêm tính năng |
| Vấn đề bản quyền nội dung/hình ảnh bài | Cao | Chốt nguồn và giấy phép ở giai đoạn 0; tự biên soạn ý nghĩa nếu cần |
| Nội dung bị coi là tư vấn/dự đoán gây hại | Trung bình | Giọng gợi mở, tuyên bố rõ, không xử lý chủ đề nhạy cảm (mục 1.4) |
| Over-engineering làm chậm ra mắt | Trung bình | Chỉ 2 context ở MVP; modular monolith; áp DDD sâu chỉ ở Reading/Tarot |
| Lạm dụng/spam tạo Reading, lộ dữ liệu | Trung bình | Rate limit, không lưu câu hỏi mặc định, token chia sẻ ngẫu nhiên |
| Ảnh OG render chậm hoặc lỗi làm hỏng link chia sẻ | Trung bình | Cache ảnh, ảnh dự phòng, kiểm thử với các nền tảng mạng xã hội chính |

---

## 8. Việc cần chốt ngay

1. Nguồn dữ liệu 78 lá và giấy phép đi kèm (chặn giai đoạn 1).
2. Danh sách **trục của Soul Map** (vd. năng lượng, cảm xúc, lý trí, kết nối, thay đổi) và cách ánh xạ từ khóa lá bài → giá trị trục.
3. Spread nào có ở MVP (đề xuất: 1 lá và 3 lá).
4. Nơi triển khai và ngân sách hạ tầng (đề xuất Vercel + Postgres được quản lý).
