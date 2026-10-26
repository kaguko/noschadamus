# 05. Đặc tả từng màn hình

Quy ước: sơ đồ ASCII là cho **di động 390 px** (lề 20). Mỗi màn có: mục đích · route · bố cục · trạng thái · câu chữ · tương tác · chuyển động · sự kiện. Chuỗi trong ngoặc kép là **nguyên văn** (đưa vào `messages/vi.json`).

Thuật ngữ bố cục: `Surface` = thẻ nền `--bg-1` (file 04 mục 9). Khoảng cách tính bằng px.

---

## 1. Landing `/`

**Mục đích**: người lạ hiểu sản phẩm trong 5 giây và bấm "Rút bài".

```
┌──────────────────────────────┐
│ ☾ noschadamus      ⟲   ◐     │ Header 56
├──────────────────────────────┤
│                              │
│   BẢN ĐỒ LINH HỒN            │ caption, accent
│                              │
│   Không đoán tương lai.      │ display
│   Chỉ soi lại hôm nay.       │ (2 dòng)
│                              │
│   Rút 1 hoặc 3 lá tarot, nhận│ body-lg, text-2
│   một bản đồ linh hồn đẹp để │
│   giữ lại, cùng vài câu hỏi  │
│   để tự ngẫm. Không phán xét.│
│                              │
│  [   Rút bài ngay   ]  lg    │ primary, full width
│  Cách hoạt động →            │ ghost link
│                              │
│   ╭─ ─ hero visual ─ ─╮      │ 3 lá fan + hào quang
│   ╰───────────────────╯      │ cao 360
│                              │
├──────────────────────────────┤ 64
│ CÁCH HOẠT ĐỘNG               │
│ Ba bước, chưa đến hai phút   │ h2
│ ① Chọn trải bài              │
│ ② Hít thở, chạm để rút       │
│ ③ Nhận bản đồ và ảnh để chia │
│    sẻ                        │
├──────────────────────────────┤
│ MỘT BẢN ĐỒ, SÁU TRỤC         │
│ [Soul Map mẫu 300]           │
│ 6 chip trục + 1 câu mô tả    │
├──────────────────────────────┤
│ ẢNH ĐÁNG ĐĂNG                │
│ [3 khung điện thoại ngang    │
│  cuộn: story / vuông / OG]   │
├──────────────────────────────┤
│ CÂU HỎI THƯỜNG GẶP           │
│ Accordion × 5                │
├──────────────────────────────┤
│ Sẵn sàng chưa?  [Rút bài ngay]│
├──────────────────────────────┤
│ Footer                       │
└──────────────────────────────┘
```

### Bố cục chi tiết
- **Hero** (padding trên 32, dưới 48). Caption `BẢN ĐỒ LINH HỒN` màu `--accent-text`. Tiêu đề `display`, ngắt dòng cố định sau "tương lai.". Dòng phụ `body-lg` `--text-2`, max-width 34ch. Nút `lg primary` rộng 100% (≥480: auto, rộng tối thiểu 240). Liên kết ghost "Cách hoạt động" cuộn mượt tới `#how`.
- **Hero visual** (cao 360, di động; 520 desktop): 3 lá `lg` xếp quạt, xoay `-12° / 0° / +12°`, lệch `translateY(12 / 0 / 12)`, chồng nhau 35%; hiện mặt sau (`card-back.svg`) trừ lá giữa hiện `major-17` (Ngôi Sao). Phía sau: hình tròn mờ 420 px, `radial-gradient` accent 25% → trong suốt, và một Soul Map mẫu (xem 06) mờ 20% xoay chậm (60 s/vòng). Lá nổi nhẹ `translateY ±6` chu kỳ 6 s lệch pha 1 s.
- **Cách hoạt động** (`id="how"`): 3 hàng; mỗi hàng: số trong vòng tròn 36 (viền `--line-strong`, Fraunces 600), tiêu đề h3, mô tả `--text-2`. Desktop: 3 cột.
- **Một bản đồ, sáu trục**: Soul Map mẫu = **Ví dụ vàng 2** (file 01) kích thước 300 (desktop 420), vẽ khi vào khung nhìn (một lần). Dưới: 6 chip trục. Một đoạn mô tả. Desktop: hai cột (bản đồ trái, văn bản phải).
- **Ảnh đáng đăng**: dải cuộn ngang (snap) 3 mockup: story (9:16), vuông→chân dung (4:5), OG (1.91:1). Dùng ảnh PNG tĩnh dựng từ Ví dụ vàng 2 (`public/marketing/share-*.png`, tạo ở T28).
- **FAQ**: 5 mục (nội dung ở dưới).
- **CTA cuối**: panel `Surface` căn giữa, h2 + nút.

### Câu chữ (nguyên văn)
| Khóa | Nội dung |
|---|---|
| `landing.eyebrow` | BẢN ĐỒ LINH HỒN |
| `landing.title` | Không đoán tương lai.↵Chỉ soi lại hôm nay. |
| `landing.subtitle` | Rút 1 hoặc 3 lá tarot, nhận một bản đồ linh hồn đẹp để giữ lại, cùng vài câu hỏi để tự ngẫm. Không phán xét. |
| `landing.cta` | Rút bài ngay |
| `landing.how_link` | Cách hoạt động |
| `landing.how.eyebrow` | CÁCH HOẠT ĐỘNG |
| `landing.how.title` | Ba bước, chưa đến hai phút |
| `landing.how.s1.title` | Chọn trải bài |
| `landing.how.s1.body` | Một lá cho khoảnh khắc này, hoặc ba lá cho quá khứ, hiện tại và hướng mở. |
| `landing.how.s2.title` | Hít thở, chạm để rút |
| `landing.how.s2.body` | Xáo bài, chọn những lá khiến bạn dừng lại. Bạn có thể viết một ý niệm nếu muốn. |
| `landing.how.s3.title` | Nhận bản đồ và ảnh để chia sẻ |
| `landing.how.s3.body` | Bản đồ linh hồn, vài dòng diễn giải và những câu hỏi gợi mở. Muốn thì lưu thành ảnh. |
| `landing.map.eyebrow` | MỘT BẢN ĐỒ, SÁU TRỤC |
| `landing.map.title` | Mỗi lá kéo bản đồ về một phía |
| `landing.map.body` | Năng lượng, cảm xúc, kết nối, nền tảng, lý trí, thay đổi. Hình dạng của bản đồ cho bạn thấy điều gì đang nổi lên và điều gì đang thưa. |
| `landing.share.eyebrow` | ẢNH ĐÁNG ĐĂNG |
| `landing.share.title` | Một hình ảnh thuộc về riêng bạn |
| `landing.share.body` | Xuất ảnh cho story, bài đăng hay xem trước liên kết. Ảnh không bao giờ chứa điều bạn viết riêng. |
| `landing.faq.eyebrow` | CÂU HỎI THƯỜNG GẶP |
| `landing.final.title` | Sẵn sàng chưa? |
| `landing.final.body` | Chỉ cần một hơi thở và một cái chạm. |

**FAQ**
| Câu hỏi | Trả lời |
|---|---|
| Có đoán đúng tương lai không? | Không, và chúng tôi không cố làm vậy. Mỗi lá bài là một gương soi để bạn nhìn lại hôm nay. Nội dung chỉ mang tính giải trí và suy ngẫm. |
| Việc rút bài có thật sự ngẫu nhiên? | Có. Các lá được chọn ngẫu nhiên an toàn trên máy chủ. Việc bạn chạm chọn bài là một nghi thức, không làm thay đổi kết quả. |
| Bạn lưu gì về tôi? | Không cần tài khoản. Bản đọc được lưu để bạn mở lại trên thiết bị này. Điều bạn viết ở phần ý niệm không được lưu trừ khi bạn bật lên. Bạn có thể thu hồi liên kết chia sẻ bất cứ lúc nào. |
| Có mất phí không? | Hiện tại hoàn toàn miễn phí. |
| Hình ảnh lá bài lấy từ đâu? | Từ bộ Rider-Waite-Smith (1909) của họa sĩ Pamela Colman Smith, thuộc phạm vi công cộng. |

**Metadata**: title `noschadamus · Rút tarot, nhận bản đồ linh hồn`; description `Rút 1 hoặc 3 lá tarot và nhận một bản đồ linh hồn đẹp để chia sẻ, cùng những câu hỏi gợi mở. Không dự đoán, không phán xét.`

### Sự kiện: `landing_view` (khi mount), `draw_started` (khi bấm CTA).

---

## 2. Luồng rút bài `/draw` (3 bước, một trang, trạng thái trong client)

Trạng thái client (reducer): `{ step: 1|2|3, spreadId, allowReversed, intention, storeIntention, picked: number[], status: 'idle'|'submitting'|'error' }`. Lưu bản nháp vào `sessionStorage` (khóa `nd:draft`, try/catch) để F5 không mất; xóa khi tạo thành công.
Khung: Header (không nút "Rút bài"), Stepper ngay dưới header, nội dung, ActionBar dưới. Nút quay lại (`arrow-left`) bên trái stepper ở bước 2-3. Phím `Esc` không làm gì.

### 2.1. Bước 1: Chọn trải bài

```
 BƯỚC 1/3
 ▰▰▱▱▱▱▱▱ (3 đoạn)

 Hôm nay bạn muốn nhìn thế nào?        h1
 Chọn một cách rút bài.                 body, text-2

 ┌──────────────────────────────────┐
 │ ▯   Một lá                    ✓ │ SpreadOption (đã chọn)
 │     Điều cần lắng nghe hôm nay   │
 │     Khoảng 1 phút                │
 └──────────────────────────────────┘
 ┌──────────────────────────────────┐
 │ ▯▯▯ Ba lá                        │
 │     Quá khứ · Hiện tại · Hướng mở│
 │     Khoảng 2 phút                │
 └──────────────────────────────────┘

 ─────────────────────────────
 [        Tiếp tục        ]        ActionBar
```
- Mặc định chọn "Ba lá"? **Không**: không chọn trước; nút "Tiếp tục" tắt đến khi chọn. (Để đo `spread_selected` chính xác.)
- Desktop: 2 thẻ nằm ngang, mỗi thẻ cao hơn (có minh họa lớn); ActionBar không dính, nằm dưới, canh phải.
- Chọn thẻ: viền chuyển 200 ms, tick scale-in 160 ms.

| Khóa | Nội dung |
|---|---|
| `draw.step_label` | BƯỚC {current}/{total} |
| `draw.s1.title` | Hôm nay bạn muốn nhìn thế nào? |
| `draw.s1.subtitle` | Chọn một cách rút bài. |
| `draw.s1.single.name` | Một lá |
| `draw.s1.single.tagline` | Điều cần lắng nghe hôm nay |
| `draw.s1.single.time` | Khoảng 1 phút |
| `draw.s1.three.name` | Ba lá |
| `draw.s1.three.tagline` | Quá khứ · Hiện tại · Hướng mở |
| `draw.s1.three.time` | Khoảng 2 phút |
| `draw.next` | Tiếp tục |
| `draw.back` | Quay lại |

### 2.2. Bước 2: Ý niệm (tùy chọn)

```
 BƯỚC 2/3
 Bạn đang mang theo điều gì?           h1
 Viết ra nếu muốn. Bạn cũng có thể bỏ  body, text-2
 qua.

 ┌──────────────────────────────────┐
 │ Ví dụ: Mình đang phân vân về một │ Textarea 120
 │ lựa chọn…                  0/280 │
 └──────────────────────────────────┘

 ○─  Lưu ý niệm này cùng bản đọc       Switch (tắt)
     Chỉ bạn xem được trên thiết bị này. Ảnh chia sẻ không chứa nó.

 ○─  Bao gồm bài ngược                 Switch (bật)
     Một số lá có thể xuất hiện ngược, hướng vào trong.

 ─────────────────────────────
 [        Bỏ qua        ]      (đổi thành "Tiếp tục" khi có chữ)
```
- Ý niệm **chỉ dùng làm không gian để người dùng dừng lại**; không ảnh hưởng thuật toán (nêu rõ ở FAQ/About).
- ActionBar chỉ có **một** nút chính: nhãn "Bỏ qua" khi Textarea rỗng, đổi thành "Tiếp tục" khi có chữ. Không bao giờ hiện hai nút cùng hành động.
- Switch "Lưu ý niệm" chỉ bật được khi có chữ; khi xóa hết chữ, tự tắt.
- Cảnh báo nhạy cảm: nếu văn bản khớp từ khóa tự hại/khủng hoảng (danh sách ở `src/shared/safety/crisis-terms.ts`: `tự tử, tự sát, không muốn sống, muốn chết, tự làm đau mình`), hiện thẻ nhẹ dưới Textarea, **không chặn** luồng: "Nếu bạn đang thấy rất nặng nề, hãy cân nhắc nói chuyện với một người bạn tin tưởng hoặc đường dây hỗ trợ tại nơi bạn sống. Bạn không phải đi qua điều này một mình." (Phát hiện chỉ ở client, không gửi đi, không log.)

| Khóa | Nội dung |
|---|---|
| `draw.s2.title` | Bạn đang mang theo điều gì? |
| `draw.s2.subtitle` | Viết ra nếu muốn. Bạn cũng có thể bỏ qua. |
| `draw.s2.placeholder` | Ví dụ: Mình đang phân vân về một lựa chọn… |
| `draw.s2.store.label` | Lưu ý niệm này cùng bản đọc |
| `draw.s2.store.help` | Chỉ bạn xem được trên thiết bị này. Ảnh chia sẻ không chứa nó. |
| `draw.s2.reversed.label` | Bao gồm bài ngược |
| `draw.s2.reversed.help` | Một số lá có thể xuất hiện ngược, hướng vào trong. |
| `draw.s2.skip` | Bỏ qua |
| `draw.s2.truncated_toast` | Đã cắt bớt cho vừa 280 ký tự. |
| `draw.s2.care` | Nếu bạn đang thấy rất nặng nề, hãy cân nhắc nói chuyện với một người bạn tin tưởng hoặc đường dây hỗ trợ tại nơi bạn sống. Bạn không phải đi qua điều này một mình. |

### 2.3. Bước 3: Xáo và chọn bài (khoảnh khắc nghi thức)

Trạng thái con: `shuffle` → `fan` → `confirm`.

**(a) shuffle** (trang mở ra ở đây)
```
 BƯỚC 3/3
 Hít một hơi. Chạm để xáo.              h1 (căn giữa)

        ┌─────┐
        │░░░░░│  chồng bài (lg), nhịp thở: scale 1 ↔ 1.02, 4 s
        └─────┘

 [   Xáo bài   ]
```
- Chạm chồng bài hoặc nút "Xáo bài": hoạt ảnh xáo **1400 ms**: chồng tách đôi (±60 px ngang), 10 lá riffle xen kẽ (mỗi lá `translateY` vòng cung, trễ 60 ms), rồi gộp. Rung nhẹ `navigator.vibrate(12)` nếu có (bỏ qua nếu giảm chuyển động). Sau đó tự sang **fan**.
- Có nút văn bản "Bỏ qua xáo" nhỏ (accessibility và người vội) → sang fan ngay.

**(b) fan** (chọn N lá, N=1 hoặc 3)
```
 Chọn 3 lá khiến bạn dừng lại.          h1
 Đã chọn 0/3                            caption, aria-live

 Slots: [ Quá khứ ] [ Hiện tại ] [ Hướng mở ]   (khung nét đứt, sm)

 ◂ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ▸    Dải 78 lá, cuộn ngang
```
- **Mobile (<1024)**: dải 78 lá mặt sau, mỗi lá rộng 88 (`sm`), chồng nhau chỉ lộ 22 px (tổng ≈ 77×22+88 = 1782 px), cuộn ngang mượt (`overflow-x: auto; scroll-snap-type: none`; ẩn thanh cuộn), căn đầu dải ở giữa màn hình (scrollLeft ban đầu = trung tâm). Có hai lớp mờ mép trái/phải 24 px. Gợi ý "Vuốt để xem thêm" biến mất sau lần cuộn đầu.
- **Desktop (≥1024)**: quạt vòng cung: cha cao 340, `position: relative`; lá thứ `i` (0-77): `transform-origin: 50% 160%`, `rotate((i − 38.5) × 1.15deg)`, lá rộng 96, dịch ngang bằng `left: calc(50% − 48px)`, tổng góc ≈ ±44°.
- **Chọn lá**: chạm một lá → lá nâng `translateY(-24px)`, viền `--accent`, hào quang 200 ms; sau 120 ms bay vào slot kế tiếp trống (cong, 500 ms `--ease-emphasized`), chỗ cũ trong dải để **khoảng trống mờ** (không dồn). Chạm lá trong slot → trả về chỗ cũ.
- Slot trống: khung nét đứt 1.5 px `--line-strong`, bo như thẻ, nhãn vị trí caption bên dưới; slot đang chờ có nhịp sáng viền 2 s.
- **Bàn phím**: dải là `role="listbox"` `aria-multiselectable="true"` `aria-label="78 lá bài úp"`; mỗi lá `role="option"` `aria-label="Lá bài thứ {n}"` `aria-selected`. Mũi tên trái/phải di chuyển focus (roving tabindex), Home/End, `Space`/`Enter` chọn/bỏ chọn. Vùng `aria-live`: "Đã chọn {k}/{N} lá".
- Khi đủ N lá: ActionBar xuất hiện nút chính "Lật bài" (hiệu ứng trượt lên 320 ms). Chưa đủ: nút tắt hiển thị "Chọn thêm {r} lá".
- Chú thích dưới dải (small, `--text-3`): "Các lá được chọn ngẫu nhiên an toàn trên máy chủ; việc bạn chạm chỉ là nghi thức." (`draw.s3.honesty`)

**(c) confirm/submitting** (bấm "Lật bài")
1. Gọi `POST /api/readings` với `{ spreadId, allowReversed, pickedSlots }`, chỉ thêm `intention` và `storeIntention: true` khi người dùng bật lưu ý niệm (chốt ở T22: không lưu thì ý niệm không rời khỏi trình duyệt).
2. Trong lúc chờ (tối thiểu **1400 ms**, để không giật): các lá trong slot nổi lên và phát sáng nhịp; dòng chữ giữa `h2` đổi theo chuỗi: "Đang xếp các vì sao…" (0 ms) → "Đang đọc bản đồ của bạn…" (900 ms).
3. Thành công: `router.push('/reading/{id}?reveal=1')`.
4. Lỗi: quay về trạng thái fan (giữ các lá đã chọn), hiện Toast lỗi và nút "Thử lại". Lỗi `RATE_LIMITED`: "Bạn đã rút nhiều lần trong thời gian ngắn. Hãy nghỉ một lát rồi quay lại nhé." Lỗi chung: "Có điều gì đó trục trặc. Chưa có gì bị mất, bạn thử lại được không?"

| Khóa | Nội dung |
|---|---|
| `draw.s3.title_shuffle` | Hít một hơi. Chạm để xáo. |
| `draw.s3.shuffle` | Xáo bài |
| `draw.s3.skip_shuffle` | Bỏ qua xáo |
| `draw.s3.title_pick` | Chọn {count} lá khiến bạn dừng lại. |
| `draw.s3.title_pick_one` | Chọn một lá khiến bạn dừng lại. |
| `draw.s3.picked` | Đã chọn {k}/{n} |
| `draw.s3.hint_scroll` | Vuốt để xem thêm |
| `draw.s3.need_more` | Chọn thêm {r} lá |
| `draw.s3.reveal` | Lật bài |
| `draw.s3.loading1` | Đang xếp các vì sao… |
| `draw.s3.loading2` | Đang đọc bản đồ của bạn… |
| `draw.s3.honesty` | Các lá được chọn ngẫu nhiên an toàn trên máy chủ; việc bạn chạm chỉ là nghi thức. |
| `draw.error.rate` | Bạn đã rút nhiều lần trong thời gian ngắn. Hãy nghỉ một lát rồi quay lại nhé. |
| `draw.error.generic` | Có điều gì đó trục trặc. Chưa có gì bị mất, bạn thử lại được không? |
| `draw.retry` | Thử lại |

**Sự kiện**: `spread_selected` (bước 1 → 2), `intention_entered{hasText}` (bước 2 → 3), `cards_picked{count}` (khi đủ lá), `reading_abandoned{step}` (rời trang giữa chừng, gửi bằng `sendBeacon` ở `pagehide`).

---

## 3. Kết quả `/reading/[id]` (chủ sở hữu)

**Mục đích**: thời khắc "ồ" rồi giữ lại/chia sẻ.

### 3.1. Bố cục di động (cuộn dọc)

```
┌──────────────────────────────┐
│ Header                       │
├──────────────────────────────┤
│ BẢN ĐỌC NGÀY 25.10.2026      │ caption, text-2
│                              │
│ Ngọn Lửa                     │ h1 (Fraunces), 2 dòng
│ Dịch Chuyển                  │
│ Bạn đang mang nhiều lửa. Điều│ body-lg, text-2
│ còn lại là chọn nơi đặt nó.  │
│                              │
│  ┌──┐   ┌──┐   ┌──┐          │ 3 lá `md`
│  │  │   │  │   │  │          │
│  └──┘   └──┘   └──┘          │
│ QUÁ KHỨ HIỆN TẠI HƯỚNG MỞ    │ caption
│ Chàng Khờ Tòa Tháp Ngôi Sao  │ tên (Fraunces 16, tối đa 2 dòng)
│ [Xuôi]   [Xuôi]  [Ngược]     │ chip
│                              │
│ ╭────────────────────────╮   │ Surface
│ │ BẢN ĐỒ LINH HỒN        │   │
│ │      Soul Map 320      │   │
│ │ ● Năng lượng ▇▇▇▇▇ 84  │   │ AxisMeter × 6
│ │ …                      │   │
│ ╰────────────────────────╯   │
│                              │
│ TỪNG LÁ BÀI NÓI GÌ           │ eyebrow + h2
│ ── Quá khứ · Chàng Khờ       │
│ [kw][kw][kw]                 │
│ Meaning…                     │
│ ❝ Prompt ❞                   │ italic Fraunces, vạch trái accent
│ (lặp cho mỗi lá)             │
│                              │
│ ĐIỀU ĐÁNG NGẪM               │
│ Synthesis…                   │
│ ① Câu hỏi 1  ② Câu hỏi 2     │
│                              │
│ Disclaimer                   │
├──────────────────────────────┤
│ [ Chia sẻ ]    [ Rút lại ]   │ ActionBar dính đáy
└──────────────────────────────┘
```
- Trải **1 lá**: lá `xl` căn giữa, không có nhãn vị trí dạng cột; nhãn "HÔM NAY" phía trên tên.
- Ý niệm (nếu `intention` != null): thẻ nhỏ dưới tiêu đề: caption `Ý NIỆM CỦA BẠN` + văn bản nghiêng; chỉ chủ nhìn thấy.
- Ngày: định dạng `dd.MM.yyyy` theo múi giờ trình duyệt.

### 3.2. Bố cục desktop (≥1024)
Container 1120, hai cột: **trái dính** (rộng 480): lá bài (`lg`) + Soul Map (420) + AxisMeter; **phải** (rộng 560): tiêu đề, tagline, ý niệm, "Từng lá bài nói gì", "Điều đáng ngẫm", nút (Chia sẻ / Rút lại ở cuối cột phải và một nhóm nút nhỏ cố định cạnh tiêu đề). Khe 64.

### 3.3. Choreography lần đầu (chỉ khi URL có `?reveal=1` và không giảm chuyển động)

Cờ nằm trên URL (không phải `sessionStorage`) để server render đúng trạng thái đầu (úp bài) mà không nháy; tham số bị bỏ khỏi URL bằng `history.replaceState` khi trình tự xong, nên F5 hay chia sẻ đường dẫn đều xem lại trạng thái cuối.

Đồng hồ `t` tính từ lúc trang mount (sau khi ảnh lá bài tải xong hoặc 800 ms, cái nào trước):

| t (ms) | Sự kiện |
|---|---|
| 0 | Ba slot hiện mặt sau, nhãn vị trí mờ vào (200) |
| 300 | Lật lá 1 (700) → live: "Đã lật lá thứ 1: {tên}" |
| 1000 | Lật lá 2 (700) |
| 1700 | Lật lá 3 (700) |
| 2600 | Soul Map vẽ 900 ms, các lớp lá hiện nối tiếp (mỗi lớp 150 ms) rồi lớp tổng hợp |
| 3400 | AxisMeter chạy thanh (stagger 80) |
| 3500 | Tiêu đề archetype hiện (mờ + `translateY(12→0)`, 500) và tagline (trễ 150) |
| 4200 | Phần còn lại hiện bình thường; ActionBar trượt lên; live: "Bản đồ linh hồn đã sẵn sàng" |

- Nội dung văn bản có trong DOM ngay từ đầu (cho đọc màn hình/SEO không cần), chỉ `opacity: 0` tới thời điểm hiện (không `display:none`).
- Bất kỳ lúc nào chạm màn hình hoặc nhấn phím: **rút ngắn** (nhảy thẳng tới trạng thái cuối trong 200 ms). Sau khi xong: bỏ `?reveal=1` khỏi URL.
- Lần xem sau (F5, mở từ lịch sử): trạng thái cuối ngay, không hoạt ảnh. Các khối bên dưới gấp hiện dần khi cuộn vào (mờ + dịch 12 px, `IntersectionObserver`, một lần).
- Giảm chuyển động: trạng thái cuối ngay.

### 3.4. Hành động
- **Chia sẻ** → mở `ShareSheet` (mục 5). **Rút lại** (`secondary`) → `/draw`. Menu `⋯` (IconButton `more-horizontal` ở cạnh ngày): "Thu hồi liên kết chia sẻ" (hiện khi đã chia sẻ), "Sao chép liên kết" (khi đã chia sẻ).
- Bấm vào một lá bài: mở `Dialog` phóng to ảnh (lá `2xl` ở giữa, tên, từ khóa); đóng bằng `Esc`/chạm ngoài. (Không lật lại.)

### 3.5. Trạng thái
| Trạng thái | Hiển thị |
|---|---|
| Đang tải (SSR có sẵn, chỉ ảnh) | Skeleton cho ảnh lá cho đến khi tải xong |
| Ảnh lá lỗi | Mặt dự phòng (file 04 mục 7.8) |
| Không phải chủ / không tồn tại | `not-found` (mục 9) |

### 3.6. Câu chữ
| Khóa | Nội dung |
|---|---|
| `reading.date_label` | BẢN ĐỌC NGÀY {date} |
| `reading.intention_label` | Ý NIỆM CỦA BẠN |
| `reading.position_single` | HÔM NAY |
| `reading.orientation.upright` | Xuôi |
| `reading.orientation.reversed` | Ngược |
| `reading.map.eyebrow` | BẢN ĐỒ LINH HỒN |
| `reading.map.alt` | Bản đồ linh hồn dạng radar sáu trục. Trục nổi bật nhất: {dominant}. Trục thưa nhất: {quiet}. |
| `reading.map.badge_dominant` | Nổi bật |
| `reading.map.badge_quiet` | Thưa |
| `reading.map.badge_dominant_soft` | Hơi nổi |
| `reading.map.badge_quiet_soft` | Hơi thưa |
| `reading.cards.eyebrow` | TỪNG LÁ BÀI NÓI GÌ |
| `reading.synthesis.eyebrow` | ĐIỀU ĐÁNG NGẪM |
| `reading.share` | Chia sẻ |
| `reading.redraw` | Rút lại |
| `reading.menu.copy` | Sao chép liên kết |
| `reading.menu.revoke` | Thu hồi liên kết chia sẻ |
| `reading.revoke.confirm_title` | Thu hồi liên kết? |
| `reading.revoke.confirm_body` | Những người đang giữ liên kết sẽ không xem được nữa. Bạn vẫn xem lại bản đọc này trên thiết bị của mình. |
| `reading.revoke.confirm_action` | Thu hồi |
| `reading.revoke.done` | Đã thu hồi liên kết. |
| `reading.copied` | Đã sao chép liên kết. |

Metadata: `title = "{title} · noschadamus"`, `robots = noindex`.

**Sự kiện**: `reading_viewed{mode:'owner', firstView}`.

---

## 4. Soul Map trong trang (thành phần dùng ở 3, 6, 1)
Xem file 06 để biết hình học. Bố cục quanh nó trong `Surface`:
- Eyebrow `BẢN ĐỒ LINH HỒN` + (bên phải) IconButton `info` mở Popover: "Mỗi lá kéo bản đồ về những trục khác nhau. Hình dạng cho thấy điều gì nổi lên và điều gì thưa. Đây là công cụ suy ngẫm, không phải phép đo." (`reading.map.info`).
- Soul Map: vuông, rộng = rộng Surface − 2×16, tối đa 420.
- Dưới: 6 `AxisMeter`, sắp theo **giá trị giảm dần** (khác thứ tự vẽ), kèm chip Nổi bật/Thưa (khi `soulMap.balanced`: "Hơi nổi"/"Hơi thưa"). Thanh và số dùng giá trị thật `soulMap.vector`; chỉ hình radar dùng `soulMap.display`.
- Dưới cùng: toggle văn bản `small`: "Xem các lớp từng lá" (Switch). Bật → hiện lớp đường mảnh theo từng lá (mặc định bật nếu ≤ 3 lá).

---

## 5. Chia sẻ (ShareSheet)

Mở từ nút "Chia sẻ". Di động: Sheet đáy; desktop: Dialog 720.

```
┌────────────────────────────────────┐
│ ─── (tay nắm)                      │
│ Chia sẻ bản đồ của bạn         ✕  │ h2
│                                    │
│ [ Story ][ Bài đăng ][ Liên kết ]  │ Tabs (Radix), mặc định Story
│                                    │
│   ┌────────────┐                   │ Xem trước (tỉ lệ đúng, cao ≤ 52dvh)
│   │  ảnh       │                   │ skeleton khi chưa tải
│   └────────────┘                   │
│  Ảnh không chứa điều bạn đã viết.  │ small, text-3, icon shield
│                                    │
│ [   Chia sẻ ảnh   ]  (primary lg)  │
│ [ Tải ảnh xuống ]   (secondary)    │
└────────────────────────────────────┘
```
Ba tab:
1. **Story** (1080×1920): xem trước + "Chia sẻ ảnh" (Web Share API với file PNG nếu `navigator.canShare({files})`; ngược lại ẩn nút này và chỉ còn "Tải ảnh xuống") + "Tải ảnh xuống".
2. **Bài đăng** (1080×1350, chân dung 4:5): như trên.
3. **Liên kết** (xem trước OG 1200×630):
   - Nếu chưa chia sẻ: giải thích "Bất kỳ ai có liên kết đều xem được bản đồ và diễn giải này, không thấy ý niệm của bạn. Bạn có thể thu hồi bất cứ lúc nào." + nút primary "Tạo liên kết" → `POST /share` → hiện ô liên kết (chỉ đọc, chọn hết khi chạm) + nút "Sao chép" + nút `ghost danger` "Thu hồi liên kết".
   - Nếu đã chia sẻ: hiện ngay ô liên kết.
   - Web Share cho liên kết (khi có): nút "Gửi liên kết".

Quy trình ảnh: khi mở tab, tải `GET /api/readings/{id}/image?format=…` (xem trước), hiển thị `<img>` với `aspect-ratio` đúng và skeleton; lỗi → thông báo "Chưa tạo được ảnh. Bạn thử lại nhé." và nút "Thử lại". Nút "Tải ảnh xuống" là liên kết `download` tới URL với `download=1`. "Chia sẻ ảnh": `fetch` → `blob` → `new File([blob], 'noschadamus.png', {type:'image/png'})` → `navigator.share({files:[file], title, text})`. Người dùng huỷ (`AbortError`) → không báo lỗi.

| Khóa | Nội dung |
|---|---|
| `share.title` | Chia sẻ bản đồ của bạn |
| `share.tab.story` | Story |
| `share.tab.post` | Bài đăng |
| `share.tab.link` | Liên kết |
| `share.privacy_note` | Ảnh không chứa điều bạn đã viết. |
| `share.native` | Chia sẻ ảnh |
| `share.download` | Tải ảnh xuống |
| `share.link.explain` | Bất kỳ ai có liên kết đều xem được bản đồ và diễn giải này, nhưng không thấy ý niệm của bạn. Bạn có thể thu hồi bất cứ lúc nào. |
| `share.link.create` | Tạo liên kết |
| `share.link.copy` | Sao chép |
| `share.link.send` | Gửi liên kết |
| `share.link.revoke` | Thu hồi liên kết |
| `share.error.image` | Chưa tạo được ảnh. Bạn thử lại nhé. |
| `share.share_text` | Bản đồ linh hồn của mình hôm nay: {title} |

**Sự kiện**: `share_opened`, `share_image_downloaded{format}`, `share_native_used{format,result}`, `share_link_created`, `share_link_revoked`.

---

## 6. Xem chung `/s/[token]`

Giống `/reading/[id]` ở dạng chỉ đọc, với khác biệt:
- Không có `Chia sẻ`, không có menu thu hồi, **không có ý niệm**, không có ActionBar "Rút lại".
- Đầu trang, dưới Header: dải nhỏ (`Surface` bo `--r-lg`, padding 12 16): icon `link-2` + "Bản đọc được chia sẻ bởi một người dùng noschadamus." (`shared.banner`).
- Cuối trang: panel CTA lớn: h2 "Bản đồ của bạn trông thế nào?" + body "Rút một lá hoặc ba lá, chưa đến hai phút." + nút `lg primary` "Rút bài của riêng bạn" (→ `/draw?ref=share`). ActionBar dính đáy (di động) chỉ chứa nút này.
- Choreography: luôn dùng chế độ **không hoạt ảnh dài**: Soul Map vẽ 900 ms một lần khi vào khung nhìn (nếu không giảm chuyển động); lá bài hiện sẵn mặt trước.
- Token không hợp lệ/đã thu hồi → trang "liên kết không còn" (mục 9), HTTP 404.
- `og:image` = `/s/{token}/opengraph-image` (1200×630).

| Khóa | Nội dung |
|---|---|
| `shared.banner` | Bản đọc được chia sẻ bởi một người dùng noschadamus. |
| `shared.cta.title` | Bản đồ của bạn trông thế nào? |
| `shared.cta.body` | Rút một lá hoặc ba lá, chưa đến hai phút. |
| `shared.cta.action` | Rút bài của riêng bạn |

**Sự kiện**: `reading_viewed{mode:'shared'}`, `shared_view_cta_clicked`; `landing_view{ref:'share'}` khi `/draw?ref=share` hoặc `/?ref=share`.

---

## 7. Lịch sử `/history`

Danh sách bản đọc của thiết bị (từ cookie `nd_owner`).

```
 Lịch sử trên thiết bị này             h1
 Chỉ xuất hiện ở trình duyệt này.      small, text-2
 Xóa cookie sẽ làm mất danh sách.

 ┌────────────────────────────────┐
 │ [▯▯▯]  Ngọn Lửa Dịch Chuyển    │ Thẻ (cao 96)
 │        25.10.2026 · Ba lá      │
 │        ● ●  (chấm trục nổi bật)│ → chevron
 └────────────────────────────────┘
 …
```
- Thẻ: ảnh `xs` tối đa 3 (chồng nhẹ), tiêu đề (Fraunces 18), meta (`small` `--text-2`), icon `link-2` nếu đã chia sẻ, chevron phải. Bấm → `/reading/{id}`.
- Trống: `EmptyState` (`moon-star`): "Chưa có bản đọc nào" / "Khi bạn rút bài, các bản đọc sẽ nằm ở đây." / nút "Rút bài".
- Desktop: lưới 2 cột.
- Không có xóa riêng lẻ ở MVP. `[MỞ]` thêm "Xóa bản đọc" (cần use case `DeleteReading`) nếu cần.

| Khóa | Nội dung |
|---|---|
| `history.title` | Lịch sử trên thiết bị này |
| `history.note` | Chỉ xuất hiện ở trình duyệt này. Xóa cookie sẽ làm mất danh sách. |
| `history.empty.title` | Chưa có bản đọc nào |
| `history.empty.body` | Khi bạn rút bài, các bản đọc sẽ nằm ở đây. |
| `history.empty.action` | Rút bài |

---

## 8. Trang tĩnh

### 8.1. `/about` (Cách hoạt động)
Cột đọc 560. Các mục h2 + đoạn:
1. **noschadamus là gì**: "Một công cụ tarot để soi lại hôm nay. Chúng tôi không dự đoán tương lai và không phán xét."
2. **Cách chúng tôi rút bài**: "Mỗi lượt, máy chủ xáo bộ 78 lá bằng nguồn ngẫu nhiên an toàn và chọn số lá bạn cần. Việc bạn chạm chọn là một nghi thức, không ảnh hưởng đến kết quả."
3. **Bản đồ linh hồn được tính thế nào**: "Mỗi lá mang một hồ sơ trên sáu trục: năng lượng, cảm xúc, kết nối, nền tảng, lý trí, thay đổi. Lá ngược đảo hồ sơ đó: giữ độ mạnh nhưng đổi nơi nó dồn vào. Bản đồ là trung bình có trọng số của các lá, nên cùng một bộ lá luôn cho cùng một hình." + bảng 6 trục (tên, ý nghĩa, màu).
4. **Điều chúng tôi lưu**: danh sách (xem `/privacy`).
5. **Hình ảnh và ghi nguồn**: "Hình lá bài: Pamela Colman Smith, bộ Rider-Waite-Smith (1909), phạm vi công cộng. Phông chữ: Fraunces và Be Vietnam Pro (SIL Open Font License)."
6. **Giới hạn**: Disclaimer đầy đủ.

### 8.2. `/privacy`
Tiêu đề h1 "Quyền riêng tư". Nội dung bắt buộc (viết bằng tiếng Việt đời thường, mỗi ý một đoạn ngắn):
- Không cần tài khoản; không bán dữ liệu; không quảng cáo theo dõi.
- Lưu: bản đọc (lá bài, bản đồ, diễn giải), cookie `nd_owner` (danh sách mã bản đọc của bạn, ký số), ý niệm **chỉ khi bạn bật**.
- Phân tích: sự kiện ẩn danh, không cookie, mã băm xoay mỗi ngày, không lưu IP.
- Chia sẻ: liên kết công khai chỉ khi bạn tạo; ảnh không chứa ý niệm; thu hồi được.
- Thời hạn lưu: theo bảng ở file 03 mục 5 (diễn đạt lại dễ hiểu).
- Quyền: xóa bản đọc (liên hệ qua email liên hệ `[MỞ]`), thu hồi liên kết.
- Liên hệ: `[MỞ] email liên hệ`.
- Ngày cập nhật cuối.

### 8.3. `/terms`
Điều khoản ngắn: mục đích giải trí; không là lời khuyên chuyên môn; người dùng không dùng dịch vụ để quấy rối/tự động hóa quá mức; nội dung do hệ thống sinh ra; chúng tôi có thể thay đổi; luật áp dụng `[MỞ]`.

---

## 9. Trạng thái lỗi và trang đặc biệt

| Trang | Tình huống | Hiển thị |
|---|---|---|
| `not-found` (404) | Route lạ, bản đọc không phải của bạn | Biểu tượng `moon-star`; h1 "Lá bài này đã lạc đường"; body "Trang bạn tìm không tồn tại, hoặc không thuộc về thiết bị này."; nút "Về trang chủ" |
| Liên kết chia sẻ không còn (`/s/*`) | Token sai/đã thu hồi (HTTP 404) | `moon-star`; h1 "Liên kết này không còn"; body "Người chia sẻ có thể đã thu hồi nó."; nút "Rút bài của riêng bạn" |
| `error.tsx` | Lỗi render | `cloud-off`; h1 "Có trục trặc nhỏ"; body "Chưa có gì bị mất. Thử tải lại trang nhé."; nút "Thử lại" (gọi `reset()`) |
| `global-error.tsx` | Lỗi nặng | Cùng nội dung, tối giản (không phụ thuộc layout) |
| Ngoại tuyến (fetch lỗi) | Mất mạng khi tạo bản đọc | Toast "Có vẻ bạn đang ngoại tuyến." |

Mọi trang lỗi: chiều cao tối thiểu `calc(100dvh − header − footer)`, nội dung căn giữa theo cả hai trục.

## 10. Cookie và đồng ý
`nd_owner` là cookie **thiết yếu** (chức năng), không cần banner đồng ý. Hiển thị một dòng thông báo nhỏ lần đầu ở Footer: "Chúng tôi dùng một cookie chức năng để nhớ các bản đọc của bạn." (`footer.cookie_note`). Không cookie quảng cáo/theo dõi. `[MỞ]` xác nhận lại yêu cầu pháp lý theo khu vực trước khi ra mắt.

## 11. Bản đồ sự kiện ↔ màn hình (tổng hợp)
`landing_view` (1) · `draw_started` (1) · `spread_selected` (2.1) · `intention_entered` (2.2) · `cards_picked` (2.3) · `reading_created` (server) · `reading_viewed` (3, 6) · `share_*` (5) · `shared_view_cta_clicked` (6) · `reading_abandoned` (2).

## 12. Phản hồi đa thiết bị (tóm tắt kiểm thử trực quan)
Kiểm tại 360×740, 390×844, 768×1024, 1024×768, 1440×900. Không cuộn ngang ở bất kỳ kích thước nào. Chữ không bị cắt khi hệ thống tăng cỡ chữ 130%. Chế độ ngang trên điện thoại: bố cục giống 768 nếu đủ rộng, nếu không giữ cột đơn, ActionBar không che nội dung (thêm padding dưới bằng chiều cao ActionBar).
