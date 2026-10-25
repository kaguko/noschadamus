# 01. Đặc tả miền (Domain Spec)

Phạm vi: hai bounded context `tarot` và `reading`. Tất cả mã trong `domain/` là TypeScript thuần.

## 0. Quy ước chung

- `strict: true`; không `any`; không `enum` của TS (dùng union literal + `as const`).
- Lỗi nghiệp vụ trả về bằng `Result<T, E>` (`shared/kernel/result.ts`), không `throw` trong domain/application, trừ lỗi lập trình (invariant bị vi phạm sâu bên trong).
- Mọi giá trị số hiển thị Soul Map làm tròn **4 chữ số thập phân ở đầu ra cuối cùng**, không làm tròn ở bước trung gian.
- Id: ký tự theo bảng base58 (`123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`).

### Thuật ngữ

| Thuật ngữ | Kiểu | Ghi chú |
|---|---|---|
| Axis | `AxisId` | 6 trục của Soul Map |
| Vector | `AxisVector` | `Record<AxisId, number>`, mỗi giá trị trong [0,1] |
| Card | entity (tarot) | 78 lá |
| Spread | entity (tarot) | cấu hình trải bài |
| Draw | giá trị (tarot) | kết quả rút: danh sách `{cardId, orientation}` |
| Reading | aggregate (reading) | bất biến |
| SoulMap | giá trị (reading) | vector tổng hợp + dữ liệu hiển thị |

## 1. Hằng số trục (dùng khắp nơi)

```ts
export const AXIS_ORDER = ['energy','emotion','connection','grounding','mind','change'] as const;
export type AxisId = typeof AXIS_ORDER[number];
export type AxisVector = Readonly<Record<AxisId, number>>;
```

Thứ tự này là **thứ tự vẽ radar** (từ đỉnh, theo chiều kim đồng hồ) **và thứ tự phá hòa** khi so sánh bằng nhau.
Các cặp đối diện trên radar: `energy↔grounding`, `emotion↔mind`, `connection↔change`.

| AxisId | Tên hiển thị (vi) | Ý nghĩa ngắn | Màu nhấn (hex) |
|---|---|---|---|
| energy | Năng lượng | Sức bật, động lực hành động | `#F2A65A` |
| emotion | Cảm xúc | Độ sâu và độ mở của cảm xúc | `#E58FB0` |
| connection | Kết nối | Hướng về người khác, quan hệ | `#7FD6C2` |
| grounding | Nền tảng | Sự ổn định, điểm tựa, thực tế | `#C9B06B` |
| mind | Lý trí | Phân tích, rõ ràng, cân nhắc | `#8FB4FF` |
| change | Thay đổi | Chuyển động, kết thúc, khởi đầu | `#A79BFF` |

## 2. Context `tarot`

### 2.1. Kiểu dữ liệu

```ts
export type Arcana = 'major' | 'minor';
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type MinorRank = 'ace'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'page'|'knight'|'queen'|'king';
export type Orientation = 'upright' | 'reversed';

export type CardId = string; // 'major-00' … 'major-21', 'wands-ace', 'cups-queen', 'swords-10', …

export interface Card {
  readonly id: CardId;
  readonly arcana: Arcana;
  readonly suit: Suit | null;           // null với major
  readonly rank: MinorRank | null;      // null với major
  readonly number: number;              // major: 0-21; minor: 1-14 (page=11, knight=12, queen=13, king=14)
  readonly name: { vi: string; en: string };
  readonly keywords: Record<Orientation, readonly [string, string, string]>;
  readonly meaning: Record<Orientation, string>;
  readonly prompts: Record<Orientation, readonly [string, string]>;
  readonly vector: AxisVector;          // vector xuôi
}

export interface SpreadPosition {
  readonly index: number;               // 0-based
  readonly key: string;                 // 'single' | 'past' | 'present' | 'opening'
  readonly label: { vi: string };
  readonly description: { vi: string };
  readonly weight: number;              // dùng khi tổng hợp Soul Map
}

export interface Spread {
  readonly id: 'single' | 'three';
  readonly name: { vi: string };
  readonly tagline: { vi: string };
  readonly positions: readonly SpreadPosition[];
}

export interface DrawnCardRef { cardId: CardId; orientation: Orientation; }
export type Draw = readonly DrawnCardRef[]; // độ dài = spread.positions.length
```

### 2.2. Vector ngược

Với lá ngược, vector dùng để tính là **đảo hồ sơ quanh mức trung bình của chính lá đó**:

```
m  = mean(v)                      // trung bình 6 trục của lá xuôi
v' = clamp01(2*m - v_i)  cho từng trục i
```

Ý nghĩa: giữ nguyên "độ mạnh tổng thể" của lá nhưng đảo nơi nó dồn vào (năng lượng quay vào trong). Hàm `reversedVector(v)` là hàm thuần, có test.

### 2.3. Domain service `Deck`

```ts
interface RandomSource { nextUint32(): number; }          // port, CSPRNG ở hạ tầng

function randomInt(rng: RandomSource, maxExclusive: number): number {
  // rejection sampling, KHÔNG dùng modulo thẳng
  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
  let x: number;
  do { x = rng.nextUint32(); } while (x >= limit);
  return x % maxExclusive;
}

function draw(cards: readonly Card[], spread: Spread, opts: { allowReversed: boolean }, rng: RandomSource): Draw
```

Thuật toán `draw`:
1. Sao chép `cards` (78 lá), Fisher-Yates với `randomInt` (duyệt `i` từ `n-1` xuống 1, hoán đổi với `j = randomInt(rng, i+1)`).
2. Lấy `spread.positions.length` lá đầu.
3. Với từng lá: nếu `allowReversed` thì `orientation = randomInt(rng, 2) === 1 ? 'reversed' : 'upright'`, ngược lại luôn `'upright'`.
4. Trả `Draw`.

**Bất biến**: không trùng `cardId`; độ dài đúng bằng số vị trí; `cards.length === 78` (nếu khác, trả lỗi `DECK_INCOMPLETE`).

### 2.4. Spread cố định (xem dữ liệu ở file 02)

| id | Vị trí | Trọng số |
|---|---|---|
| `single` | 1 vị trí `single` | `[1.0]` |
| `three` | `past`, `present`, `opening` | `[0.8, 1.2, 1.0]` |

### 2.5. Public API của tarot (cổng cho context khác)

File `contexts/tarot/application/public-api.ts` là **điểm duy nhất** context khác được import:

```ts
export interface TarotCardView {            // DTO, không phải entity
  cardId: string; nameVi: string; nameEn: string;
  arcana: 'major'|'minor'; suit: string | null; number: number;
  keywords: Record<Orientation, readonly [string,string,string]>;
  meaning: Record<Orientation, string>;
  prompts: Record<Orientation, readonly [string,string]>;
  vector: AxisVector;                       // xuôi
}
export interface SpreadView { id: 'single'|'three'; nameVi: string; positions: readonly {key:string; labelVi:string; descriptionVi:string; weight:number}[]; }

// effectiveVector: tarot tự áp quy tắc lá ngược (mục 2.2) để reading không phải import tarot.
export interface TarotPublicApi {
  getSpread(id: 'single'|'three'): Promise<Result<SpreadView, 'SPREAD_NOT_FOUND'>>;
  drawForSpread(id: 'single'|'three', opts: { allowReversed: boolean }): Promise<Result<{ spread: SpreadView; cards: readonly (TarotCardView & { orientation: Orientation; effectiveVector: AxisVector })[] }, 'SPREAD_NOT_FOUND'|'DECK_INCOMPLETE'>>;
}
```

## 3. Context `reading`

### 3.1. Kiểu dữ liệu

```ts
export type ReadingId = string;   // 'rd_' + 16 ký tự base58 (CSPRNG)
export type ShareToken = string;  // 22 ký tự base64url (128 bit, CSPRNG)

export interface DrawnCard {                 // SNAPSHOT: không tham chiếu entity tarot
  position: { index: number; key: string; labelVi: string; descriptionVi: string; weight: number };
  cardId: string; nameVi: string; nameEn: string;
  arcana: 'major'|'minor'; suit: string | null; number: number;
  orientation: Orientation;
  keywords: readonly [string,string,string];     // theo orientation đã chọn
  meaning: string;                                // theo orientation
  prompt: string;                                 // 1 câu hỏi đã chọn (xem 3.5)
  effectiveVector: AxisVector;                    // vector sau khi áp orientation
}

export interface SoulMap {
  vector: AxisVector;                // đã tổng hợp, làm tròn 4 chữ số
  dominant: AxisId;                  // trục cao nhất
  second: AxisId;                    // cao thứ hai
  quiet: AxisId;                     // thấp nhất
  perCard: readonly AxisVector[];    // = DrawnCard.effectiveVector theo thứ tự vị trí
  balanced: boolean;                 // V[dominant] − V[quiet] < 0.15 (mục 3.2b)
}

export interface Interpretation {
  title: string;                     // ví dụ 'Ngọn Lửa Dịch Chuyển'
  tagline: string;
  synthesis: string;                 // đoạn tổng hợp
  closingPrompts: readonly [string, string];
}

export type Visibility = 'private' | 'shared';

export interface Reading {              // AGGREGATE ROOT
  readonly id: ReadingId;
  readonly createdAt: Date;
  readonly schemaVersion: 1;
  readonly locale: 'vi';
  readonly spreadId: 'single'|'three';
  readonly allowReversed: boolean;
  readonly cards: readonly DrawnCard[];
  readonly soulMap: SoulMap;
  readonly interpretation: Interpretation;
  readonly intention: string | null;    // chỉ khác null khi người dùng đồng ý lưu
  readonly share: { token: ShareToken; sharedAt: Date } | null;
}
```

Phần nội dung (`cards`, `soulMap`, `interpretation`, `intention`) **bất biến**. Chỉ `share` được đổi qua `shareReading` / `revokeShare` (trả về `Reading` mới, hàm thuần).

### 3.2. Thuật toán Soul Map (tất định)

Đầu vào: danh sách `DrawnCard` có `effectiveVector` và `position.weight`.

```
V[axis] = Σ_p ( weight_p * effectiveVector_p[axis] ) / Σ_p weight_p
```

Sau đó:
- `dominant` = trục có V lớn nhất; hòa thì trục đứng trước trong `AXIS_ORDER`.
- `second` = trục lớn nhất còn lại (sau khi loại `dominant`); hòa → theo `AXIS_ORDER`.
- `quiet` = trục nhỏ nhất; hòa → theo `AXIS_ORDER` (đứng trước thắng). Nếu `quiet` trùng `dominant` (mọi trục bằng nhau), chọn trục cuối cùng của `AXIS_ORDER` khác `dominant`.
- Làm tròn 4 chữ số **sau** khi đã chọn `dominant/second/quiet` bằng giá trị chưa làm tròn.
- `balanced = V[dominant] − V[quiet] < 0.15` (giá trị chưa làm tròn).

### 3.2b. Vector hiển thị (chốt ở Cửa kiểm 1)

Trung bình ba lá kéo các trục về giữa (chênh lệch trung vị chỉ ~30/100), nên **hình vẽ** dùng vector đã kéo giãn tương phản; **số hiển thị, chữ và dữ liệu lưu** vẫn dùng giá trị thật.

```
mean  = trung bình 6 trục của V
range = max(V) − min(V)
k     = clamp(0.55 / range, 1, 2.5)      (range = 0 → k = 2.5)
V'_i  = clamp01(mean + (V_i − mean) · k) (áp cùng mean, k cho từng lớp perCard)
```

Hàm thuần `displaySoulMap(soulMap)` trong `reading/domain`, trả `{ vector, perCard, stretch }`; `ReadingView.soulMap.display` mang kết quả này. Ví dụ vàng 2 có `range ≈ 0.55` nên `k = 1` (hình không đổi).

**Ví dụ vàng 1**: `The Star` ngược (`major-17`).
Vector xuôi: `energy .40, emotion .80, mind .55, connection .70, change .55, grounding .50`; `m = 0.583333…`.
Vector ngược: `energy .7667, emotion .3667, mind .6167, connection .4667, change .6167, grounding .6667`.

**Ví dụ vàng 2**: trải 3 lá, trọng số `[0.8, 1.2, 1.0]`:
- Quá khứ: `The Fool` xuôi (`major-00`)
- Hiện tại: `The Tower` xuôi (`major-16`)
- Hướng mở: `The Star` ngược (`major-17`)

Kết quả kỳ vọng (4 chữ số):

| energy | emotion | connection | grounding | mind | change |
|---|---|---|---|---|---|
| 0.8356 | 0.5489 | 0.3556 | 0.2822 | 0.4122 | 0.8256 |

`dominant = energy`, `second = change`, `quiet = grounding` → tiêu đề `Ngọn Lửa Dịch Chuyển`. Hai ví dụ này là **test vàng bắt buộc**.

### 3.3. Tiêu đề (archetype)

`title = NOUN[dominant] + ' ' + MODIFIER[second]`.

| Axis | NOUN (khi là dominant) | MODIFIER (khi là second) |
|---|---|---|
| energy | Ngọn Lửa | Bừng Sáng |
| emotion | Dòng Nước | Dịu Dàng |
| connection | Sợi Chỉ | Gắn Kết |
| grounding | Rễ Cây | Vững Vàng |
| mind | Ngọn Đèn | Tỉnh Táo |
| change | Cơn Gió | Dịch Chuyển |

Có đúng 30 tiêu đề (6×5). Test phải liệt kê đủ 30.

### 3.4. Bộ sinh diễn giải (Interpretation composer)

Không dùng LLM ở MVP. Hàm thuần `composeInterpretation(cards, soulMap, seed)`.

PRNG có hạt giống: `seedFromId(readingId)` = FNV-1a 32-bit của chuỗi id, rồi `mulberry32(seed)`. Dùng để chọn câu hỏi **tất định** (cùng `readingId` + cùng dữ liệu → cùng văn bản).

Các bước:
1. `title` theo 3.3.
2. `tagline = TAGLINE[dominant]` (bảng ở file 02). Nếu `balanced`: `BALANCED_TAGLINE` với `{dominant}` thay bằng tên trục viết thường.
3. Mỗi lá: `prompt` = `card.prompts[orientation][pick]` với `pick = prng() < 0.5 ? 0 : 1` (gọi PRNG đúng một lần mỗi lá, theo thứ tự vị trí).
4. `synthesis = INSIGHT[dominant] + ' ' + INVITE[quiet]` (bảng ở file 02); nếu `balanced` thì dùng `BALANCED_SYNTHESIS` (điền `{dominant}`, `{quiet}`). Nếu `spreadId === 'single'`, thêm ở đầu: `"Lá bài này gợi một hướng nhìn duy nhất cho hôm nay. "`.
5. `closingPrompts = [DOMINANT_PROMPTS[dominant][k1], QUIET_PROMPTS[quiet][k2]]` với `k1, k2` là hai lần gọi PRNG tiếp theo (`prng() < 0.5 ? 0 : 1`).

Thứ tự gọi PRNG cố định: các lá (theo vị trí) → `k1` → `k2`.

### 3.5. Quy tắc nghiệp vụ (invariants), đánh số để test bám theo

| # | Quy tắc | Nơi kiểm |
|---|---|---|
| R1 | `Draw` có đúng số lá bằng số vị trí; không lá trùng | `draw`, `createReading` |
| R2 | `Reading` bất biến ngoại trừ `share` | kiểu `readonly` + test đóng băng |
| R3 | Rút bài dùng `RandomSource` (CSPRNG ở hạ tầng), chạy server | composition root |
| R4 | Mọi giá trị trục trong [0,1]; làm tròn 4 chữ số ở đầu ra | `computeSoulMap` |
| R5 | Soul Map tất định: cùng đầu vào → cùng đầu ra | test vàng |
| R6 | Token chia sẻ ≥128 bit entropy; thu hồi xong token cũ **không** dùng lại | `shareReading`, `revokeShare` |
| R7 | `intention` chỉ được lưu khi `storeIntention === true`; tối đa 280 ký tự sau khi `trim` | `createReading` |
| R8 | Chia sẻ lại sau khi thu hồi tạo token **mới** | `shareReading` |
| R9 | Reading riêng tư chỉ truy cập được bởi chủ (xem 3.7) | `getReadingForOwner` |
| R10 | Văn bản sinh ra không chứa từ trong danh sách cấm (file 02 mục 7) | test quét dữ liệu |

### 3.6. Sự kiện miền

```ts
type ReadingCreated = { type: 'ReadingCreated'; readingId: string; spreadId: string; allowReversed: boolean; dominant: AxisId; occurredAt: Date };
type ReadingShared  = { type: 'ReadingShared';  readingId: string; occurredAt: Date };
type ShareRevoked   = { type: 'ShareRevoked';   readingId: string; occurredAt: Date };
```

Không có dữ liệu nhận dạng, không có `intention` trong sự kiện.

### 3.7. Use case (tầng Application)

Mỗi use case là lớp có `execute(input): Promise<Result<Output, ErrorCode>>`.

| Use case | Input | Output | Lỗi |
|---|---|---|---|
| `CreateReading` | `{ spreadId, allowReversed, intention?: string, storeIntention?: boolean, owner: OwnerContext }` | `{ readingId }` | `SPREAD_NOT_FOUND`, `INTENTION_TOO_LONG`, `DECK_INCOMPLETE` |
| `GetReadingForOwner` | `{ readingId, owner }` | `ReadingView` | `NOT_FOUND` (cả khi không phải chủ) |
| `GetSharedReading` | `{ token }` | `ReadingView` (ẩn `intention`) | `NOT_FOUND` |
| `ShareReading` | `{ readingId, owner }` | `{ token, sharedAt }` (idempotent: đã chia sẻ thì trả token hiện tại) | `NOT_FOUND` |
| `RevokeShare` | `{ readingId, owner }` | `void` (idempotent) | `NOT_FOUND` |
| `ListOwnedReadings` | `{ owner, limit ≤ 50 }` | `ReadingSummary[]` mới nhất trước | none |

`OwnerContext` = `{ ownedReadingIds: ReadonlySet<string> }` (lấy từ cookie đã xác thực chữ ký; xem file 03).

`CreateReading` thực hiện: lấy `drawForSpread` qua `TarotGateway` → dựng `DrawnCard` snapshot (orientation áp vào keywords/meaning/vector) → `computeSoulMap` → `composeInterpretation` → lưu → phát `ReadingCreated`.

### 3.8. Port của context `reading`

```ts
interface ReadingRepository {
  save(r: Reading): Promise<void>;
  findById(id: ReadingId): Promise<Reading | null>;
  findByShareToken(t: ShareToken): Promise<Reading | null>;
  updateShare(id: ReadingId, share: Reading['share']): Promise<void>;
  findManyByIds(ids: readonly ReadingId[], limit: number): Promise<Reading[]>;
  deleteExpired(now: Date): Promise<number>;
}
interface TarotGateway { drawForSpread: TarotPublicApi['drawForSpread']; }
interface IdGenerator { readingId(): ReadingId; shareToken(): ShareToken; }
interface Clock { now(): Date; }
interface EventBus { publish(e: DomainEvent): Promise<void>; }
```

## 4. Ma trận kiểm thử miền

| Nhóm | Test bắt buộc |
|---|---|
| `randomInt` | Với RNG giả trả `0xFFFFFFFF` rồi `0`, hàm bỏ giá trị vượt `limit` và trả giá trị hợp lệ; phân phối đều (chi-square lỏng trên 100k mẫu, hạt cố định) |
| `draw` | Không trùng; đủ số lá; `allowReversed=false` → toàn xuôi; cùng chuỗi RNG → cùng kết quả; sai bộ bài (≠78) → `DECK_INCOMPLETE` |
| `reversedVector` | Ví dụ vàng 1; kết quả luôn trong [0,1]; trung bình trước clamp bảo toàn |
| `computeSoulMap` | Ví dụ vàng 2; hòa trục theo `AXIS_ORDER`; một lá; ba lá; tất định |
| Tiêu đề | Liệt kê đủ 30 tổ hợp, không trùng, khớp bảng 3.3 |
| `composeInterpretation` | Cùng `readingId` → cùng văn bản; khác `readingId` có thể khác; không chứa từ cấm |
| `Reading` | Đóng băng nội dung; `shareReading` idempotent; `revokeShare` rồi `shareReading` → token mới ≠ token cũ |
| `CreateReading` | `intention` bị bỏ khi `storeIntention=false`; quá 280 ký tự → `INTENTION_TOO_LONG`; phát đúng 1 sự kiện |
| `GetReadingForOwner` | Không phải chủ → `NOT_FOUND` |
| Dữ liệu | Đủ 78 lá, id duy nhất, vector trong [0,1], mọi chuỗi không rỗng, không từ cấm (`npm run cards:validate`) |
