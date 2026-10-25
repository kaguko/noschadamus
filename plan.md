Dưới đây là bản kế hoạch xây dựng trang web bói toán theo hướng "đọc lạ" mà bạn muốn, tích hợp đầy đủ kiến trúc Clean Architecture + DDD (Domain-Driven Design). Tôi sẽ trình bày rõ ràng từ định hướng sản phẩm, kiến trúc hệ thống, cấu trúc thư mục, đến lộ trình triển khai.

---

## 1. Định hướng sản phẩm (nhắc lại để thống nhất)

**Sản phẩm**: Trang web bói toán/tarot theo hướng "đọc lạ", tập trung vào trải nghiệm trực quan và khả năng chia sẻ xã hội, thay vì đưa ra lời tiên đoán.

**Điểm khác biệt cốt lõi** (chọn một để bắt đầu):
- **Bản đồ trực quan hóa**: Người dùng rút bài → hệ thống vẽ biểu đồ radar cảm xúc hoặc "bản đồ linh hồn" dạng hình ảnh, dễ chia sẻ lên mạng xã hội.
- **Đối chiếu chéo đa hệ thống**: Kết hợp Tarot + Cung hoàng đạo + Thần số học, tìm điểm "cộng hưởng" thay vì phán đoán đơn lẻ.
- **Công cụ suy ngẫm**: Không đưa ra cát/hung, chỉ đặt câu hỏi gợi mở để người dùng tự chiêm nghiệm.

**Đối tượng người dùng**: Người trẻ tò mò về tâm linh nhưng không muốn bị phán xét, thích chia sẻ hình ảnh đẹp lên Instagram/TikTok.

---

## 2. Kiến trúc hệ thống: Clean Architecture + DDD

### 2.1. Tại sao kết hợp cả hai?

Clean Architecture đảm bảo **quy tắc phụ thuộc** (dependency rule): các tầng bên trong không biết gì về tầng bên ngoài, business logic thuần khiết, dễ test . DDD giúp **phân vùng nghiệp vụ** (bounded contexts) khi hệ thống có nhiều domain khác nhau, tránh việc một entity bị dùng chung khắp nơi rồi phình to không kiểm soát .

Với trang bói toán, các domain có thể tách biệt:
- **Tarot Context**: quản lý bộ bài, ý nghĩa lá bài, logic rút bài.
- **Astrology Context**: cung hoàng đạo, thần số học (nếu làm đa hệ thống).
- **Reading Context**: lịch sử bói toán, kết quả, chia sẻ.
- **User Context**: tài khoản (nếu cần), hoặc ẩn danh hoàn toàn.

### 2.2. Sơ đồ tầng (Clean Architecture)

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                 │
│   (Next.js / React, Controllers, Views)      │
│   Chỉ chứa logic hiển thị, không business    │
└─────────────────────┬───────────────────────┘
                      │ phụ thuộc vào
┌─────────────────────▼───────────────────────┐
│           Application Layer                  │
│   (Use Cases: DrawCards, GenerateReading,    │
│    ShareReading, ...)                        │
│   Điều phối, không chứa business rules       │
└─────────────────────┬───────────────────────┘
                      │ phụ thuộc vào
┌─────────────────────▼───────────────────────┐
│              Domain Layer                    │
│   (Entities: Card, Reading, Spread;          │
│    Value Objects: CardMeaning, CardPosition; │
│    Repository Interfaces)                    │
│   Thuần khiết, không import framework        │
└─────────────────────▲───────────────────────┘
                      │ implements
┌─────────────────────┴───────────────────────┐
│          Infrastructure Layer                │
│   (Database, API adapters, Image renderer)   │
│   Triển khai các interface từ Domain/App     │
└─────────────────────────────────────────────┘
```

**Quy tắc vàng**: Mũi tên chỉ hướng phụ thuộc. Domain không biết Infrastructure tồn tại. Infrastructure "cắm" vào Domain thông qua dependency injection .

### 2.3. Cấu trúc thư mục (kết hợp DDD Bounded Contexts)

Dựa trên mô hình hybrid đã được kiểm chứng: **vertical slices theo domain, horizontal layers trong mỗi domain** .

```
src/
├── app/                          # Bootstrap (Next.js App Router)
│   ├── layout.tsx
│   ├── page.tsx                  # Landing page
│   ├── (reading)/                # Route group cho flow bói toán
│   │   ├── draw/page.tsx
│   │   └── result/[id]/page.tsx
│   └── api/                      # API routes (nếu cần BFF)
│
├── shared/                       # Shared Kernel
│   ├── domain/                   # Value objects dùng chung: Result, Id, DateRange
│   ├── infrastructure/           # Base adapters: HTTP client, storage wrapper
│   └── ui/                       # Components tái sử dụng: Button, Card, Modal
│
├── contexts/                     # BOUNDED CONTEXTS
│   ├── tarot/                    # Tarot Domain
│   │   ├── domain/
│   │   │   ├── entities/         # Card.ts, Spread.ts
│   │   │   ├── value-objects/    # CardName.ts, Suit.ts, Orientation.ts
│   │   │   └── repositories/     # ICardRepository.ts, ISpreadRepository.ts
│   │   ├── application/
│   │   │   └── use-cases/        # DrawCards.ts, GetCardMeaning.ts
│   │   ├── infrastructure/
│   │   │   ├── persistence/      # JsonCardRepository.ts, DbCardRepository.ts
│   │   │   └── di/               # tarot.container.ts
│   │   └── ui/                   # TarotCard.tsx, SpreadBoard.tsx
│   │
│   ├── reading/                  # Reading Domain (kết quả bói)
│   │   ├── domain/
│   │   │   ├── entities/         # Reading.ts, ReadingResult.ts
│   │   │   ├── value-objects/    # ReadingId.ts, ResonanceScore.ts
│   │   │   └── repositories/     # IReadingRepository.ts
│   │   ├── application/
│   │   │   └── use-cases/        # GenerateReading.ts, ShareReading.ts
│   │   ├── infrastructure/
│   │   │   ├── persistence/      # ReadingDbRepository.ts
│   │   │   ├── visualization/    # SoulMapRenderer.ts (vẽ biểu đồ)
│   │   │   └── di/
│   │   └── ui/                   # ReadingResultView.tsx, ShareButton.tsx
│   │
│   └── user/                     # User Domain (nếu cần, có thể ẩn danh)
│       └── ... (cấu trúc tương tự)
│
└── config/                       # Composition Root
    └── di.ts                     # Nơi duy nhất wire tất cả dependencies
```

**Điểm quan trọng**: Mỗi context có `domain/` riêng, không dùng chung entity. Ví dụ `Card` trong tarot context hoàn toàn khác `Reading` trong reading context. Giao tiếp giữa các context thông qua **application services** hoặc **domain events** .

### 2.4. Stack công nghệ đề xuất

| Thành phần | Lựa chọn | Lý do |
|---|---|---|
| Frontend | **Next.js 14+ (App Router)** | SSR tốt cho SEO, routing linh hoạt, dễ tách route group |
| Ngôn ngữ | **TypeScript** | Bắt buộc để mô hình hóa domain chính xác |
| State/DI | **TSyringe** hoặc custom DI container | Nhẹ, không phụ thuộc framework, wire ở `config/di.ts` |
| Database | **PostgreSQL** + **Prisma** | Prisma chỉ dùng ở Infrastructure layer, không leak vào Domain |
| Visualization | **D3.js** hoặc **Chart.js** | Vẽ biểu đồ radar, bản đồ linh hồn |
| Image Export | **html-to-image** hoặc **Satori** | Chuyển component React thành ảnh PNG để share |
| Testing | **Vitest** cho domain/application | Domain layer test cực nhanh vì không có dependency ngoài  |

---

## 3. Chi tiết từng tầng (ví dụ với Tarot Context)

### 3.1. Domain Layer — trái tim của hệ thống

```typescript
// contexts/tarot/domain/entities/Card.ts
export class Card {
  private constructor(
    public readonly id: string,
    public readonly name: CardName,
    public readonly suit: Suit,
    public readonly uprightMeaning: string,
    public readonly reversedMeaning: string
  ) {}

  static create(props: CardProps): Card {
    // validation: name không rỗng, id format hợp lệ
    return new Card(/* ... */);
  }

  getMeaning(orientation: Orientation): string {
    return orientation.isReversed
      ? this.reversedMeaning
      : this.uprightMeaning;
  }
}
```

```typescript
// contexts/tarot/domain/repositories/ICardRepository.ts
export interface ICardRepository {
  findAll(): Promise<Card[]>;
  findById(id: string): Promise<Card | null>;
}
```

**Lưu ý**: Không import Prisma, không import Next.js. Đây là code thuần TypeScript, có thể chạy trong Node.js, browser, hay bất kỳ đâu .

### 3.2. Application Layer — Use Cases

```typescript
// contexts/tarot/application/use-cases/DrawCards.ts
export class DrawCards {
  constructor(private cardRepo: ICardRepository) {}

  async execute(count: number): Promise<Card[]> {
    const allCards = await this.cardRepo.findAll();
    // Fisher-Yates shuffle
    const shuffled = this.shuffle([...allCards]);
    return shuffled.slice(0, count);
  }
}
```

Use case này **không biết** card đến từ database hay JSON file. Nó chỉ biết interface `ICardRepository`.

### 3.3. Infrastructure Layer — Adapters

```typescript
// contexts/tarot/infrastructure/persistence/JsonCardRepository.ts
export class JsonCardRepository implements ICardRepository {
  async findAll(): Promise<Card[]> {
    const raw = await import('./cards-data.json');
    return raw.cards.map(c => Card.create(c));
  }
}
```

Khi cần chuyển sang database, chỉ cần tạo `PrismaCardRepository` mới, không đụng đến Domain hay Application .

### 3.4. Presentation Layer — Next.js

```typescript
// app/(reading)/draw/page.tsx
export default function DrawPage() {
  // Chỉ gọi use case, không chứa logic bói toán
  const drawCards = useDrawCards(); // hook gọi API/use case
  
  return <SpreadBoard onDraw={drawCards} />;
}
```

---

## 4. Luồng hoạt động của tính năng "Bản đồ linh hồn"

1. Người dùng vào `/draw`, chọn kiểu bói (1 lá / 3 lá).
2. Frontend gọi use case `DrawCards` → nhận về danh sách `Card` với `Orientation`.
3. Frontend gọi use case `GenerateReading` (thuộc Reading Context) → nhận về `ReadingResult` bao gồm:
   - Tổng hợp ý nghĩa (từ Tarot Context)
   - Điểm cộng hưởng (nếu kết hợp đa hệ thống)
   - Dữ liệu để vẽ biểu đồ radar
4. Component `SoulMapChart` (dùng D3.js) render biểu đồ từ `ReadingResult`.
5. Người dùng bấm "Chia sẻ" → `html-to-image` chụp component thành PNG → tải xuống hoặc chia sẻ qua Web Share API.

**Domain Events** (nếu cần): Khi `Reading` được tạo, phát event `ReadingCreated`. Một listener trong `user` context có thể log lại (nếu có user), hoặc trong `analytics` context đếm số lượt. Các context không gọi trực tiếp nhau .

---

## 5. Lộ trình triển khai (4 giai đoạn)

### Giai đoạn 1: Domain & Application thuần (1-2 tuần)
- Định nghĩa entities, value objects, repository interfaces cho Tarot và Reading.
- Viết use cases: `DrawCards`, `GenerateReading`.
- Viết unit test cho domain (không cần database, không cần UI). Mục tiêu: 80% coverage cho domain layer.
- **Chưa cần giao diện đẹp**, chỉ cần logic chạy đúng.

### Giai đoạn 2: Infrastructure & Presentation tối thiểu (1-2 tuần)
- Implement `JsonCardRepository` với dữ liệu 78 lá bài (có thể lấy từ nguồn mở).
- Dựng Next.js với 2 trang: `/draw` và `/result`.
- Hiển thị kết quả dạng text đơn giản trước, chưa cần biểu đồ.

### Giai đoạn 3: Visualization & Sharing (1 tuần)
- Thêm D3.js vẽ biểu đồ radar từ `ReadingResult`.
- Tích hợp `html-to-image` để export PNG.
- Thêm nút Share (Web Share API + fallback download).

### Giai đoạn 4: Đa hệ thống & tinh chỉnh (nếu muốn mở rộng)
- Thêm Astrology Context (cung hoàng đạo, thần số học).
- Viết use case `GenerateCrossSystemReading` kết hợp kết quả từ nhiều context.
- Tối ưu SEO, performance, analytics.

---

## 6. Lưu ý thực tế

**Đừng over-engineer ngay từ đầu.** Với một trang bói toán cá nhân, bạn có thể bắt đầu với **chỉ Tarot Context + Reading Context**, chưa cần User Context. Clean Architecture + DDD có chi phí: nhiều file hơn, cần kỷ luật hơn . Nhưng lợi ích là: khi bạn muốn thêm cung hoàng đạo, bạn tạo context mới mà không sợ làm hỏng logic tarot hiện có.

**Dữ liệu 78 lá bài**: Bạn có thể tìm bộ dữ liệu JSON mã nguồn mở (Rider-Waite) trên GitHub, không cần tự viết ý nghĩa từ đầu. Chỉ cần đảm bảo format khớp với `Card.create()`.

**Nếu bạn không quen TypeScript/Next.js**: Có thể dùng JavaScript thuần cho domain layer (vẫn giữ được kiến trúc), nhưng TypeScript giúp mô hình hóa domain tốt hơn rất nhiều, đặc biệt khi có nhiều value objects.

Bạn muốn tôi đi sâu vào phần nào tiếp theo — ví dụ viết chi tiết code cho Domain layer của Tarot, hay thiết kế schema dữ liệu 78 lá bài?