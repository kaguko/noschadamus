# Cửa kiểm 1: Giọng văn và hình dạng Soul Map

Ngày: 2026-10-25 · Sau task T11 · Người chuẩn bị: Claude (triển khai)

## Cách tự xem lại

```bash
npm run demo -- --spread three --seed 7          # một bản đọc
npm run demo -- --spread three --seed 1 --count 20
npm run demo -- --stats 5000                      # thống kê phân bố
```

20 mẫu (14 ba lá, 6 một lá) đã in sẵn ở [`gate-1-samples.txt`](gate-1-samples.txt).

## Điều đã đạt

- 78 lá đủ nội dung, qua `cards:validate --strict` (độ dài, dấu hỏi, không từ cấm, không trùng ý > 60%).
- Hai ví dụ vàng ở `docs/01` cho kết quả đúng từng chữ số trên dữ liệu thật.
- Văn bản mạch lạc, đúng giọng gợi mở; lá ngược luôn được diễn đạt như "hướng vào trong", không phải điềm xấu.
- Cả 30 tiêu đề đều xuất hiện trong 5000 bản đọc.

## Phát hiện cần chủ dự án quyết định

### 1. Bản đồ ba lá khá "phẳng" (quan trọng nhất)

Chênh lệch giữa trục cao nhất và thấp nhất (thang 0-100):

| Trải | Trung vị | 10% phẳng nhất | 10% rõ nhất |
|---|---|---|---|
| Một lá | 60 | 45 | 79 |
| Ba lá | **33** | **18** | 51 |

Lấy trung bình ba lá làm các trục kéo về giữa. Ở 10% bản đọc phẳng nhất, hình gần như lục giác đều, và câu "trục nổi bật nhất / khá thưa" nói quá so với chênh lệch thật (ví dụ seed 101: 61 so với 53).

Đề xuất (cần duyệt vì đổi đặc tả):
- **a.** Chỉ cho phần **hiển thị**: kéo giãn tương phản quanh trung bình, `v' = clamp01(0.5 + (v − mean) × 2)`. Dữ liệu lưu và các test vàng giữ nguyên.
- **b.** Khi chênh lệch < 15 điểm, dùng câu mềm hơn ("các trục khá cân bằng, hơi nghiêng về …") thay cho "nổi bật nhất / khá thưa". Cần viết thêm 2 câu mẫu.
- **c.** Giữ nguyên.

Khuyến nghị: **a + b**.

### 2. Các trục không cân bằng

| Trục | Nổi bật | Thưa |
|---|---|---|
| Năng lượng | 14,9% | 13,9% |
| Cảm xúc | 17,1% | 17,3% |
| Kết nối | **9,4%** | 9,2% |
| Nền tảng | **21,6%** | 21,7% |
| Lý trí | 20,5% | 19,8% |
| Thay đổi | 16,5% | 18,1% |

Tiêu đề lệch theo: "Rễ Cây Gắn Kết" 10,8%, trong khi "Sợi Chỉ Dịch Chuyển" chỉ 0,2%. Nguyên nhân chính là vector cơ sở của bộ Tiền (nền tảng .85) và Kiếm (lý trí .85) cao, còn Kết nối không có bộ nào nghiêng hẳn về nó ngoài Cốc.

Lựa chọn: giữ nguyên (tarot vốn không đều), hoặc tinh chỉnh vector cơ sở ở `docs/02` mục 4 để mỗi trục nổi bật ở khoảng 13-20%. Nếu tinh chỉnh, các test vàng của lá phụ sẽ đổi theo.

### 3. Nội dung 73 lá do AI viết

Văn bản nguyên bản, qua mọi kiểm tra tự động, nhưng cần **người đọc**. Đề nghị đọc ít nhất 10 lá ngẫu nhiên, đặc biệt các lá nặng: Tòa Tháp, Cái Chết, Ác Quỷ, Ba Kiếm, Chín Kiếm, Mười Kiếm, Năm Tiền.

## Những chỗ đã lệch nhẹ so với đặc tả (đã cập nhật docs)

| Mục | Thay đổi | Lý do |
|---|---|---|
| `docs/02` mục 7 | Từ cấm "nghiệp" → "nghiệp chướng", "quả báo" | "nghiệp" chặn nhầm "sự nghiệp" |
| `docs/02` mục 9 | Từ khóa giới hạn ≤ 5 âm tiết (thay vì 3 từ) | Đếm "từ" tiếng Việt bằng máy không ổn định |
| `docs/01` mục 2.5 | Cổng tarot trả thêm `effectiveVector` | Quy tắc lá ngược thuộc tarot; reading không được import tarot |
| `docs/01` mục 3.4 | PRNG đặt ở `src/shared/kernel/prng.ts` | Dùng chung cho nền sao và diễn giải |
| Tên tiếng Anh lá phụ | "Two of Cups" thay vì "2 of Cups" | Cách gọi chuẩn |
| Lá Ẩn Chính đã viết sẵn | 4 lá (không phải 5); lá thứ năm là Át Cốc | Đặc tả đếm gộp |

## Quyết định (chủ dự án, 2026-10-25)

- [x] Phát hiện 1: **a + b**. Đã làm:
  - `displaySoulMap` kéo giãn tương phản chỉ cho hình vẽ (docs/01 mục 3.2b). Độ chênh trung vị của hình ba lá tăng từ 30 lên 55; 10% phẳng nhất tăng từ 16 lên 40.
  - `soulMap.balanced` (chênh < 15 điểm, khoảng 8% bản đọc ba lá) dùng tagline và câu tổng hợp mềm, chip "Hơi nổi"/"Hơi thưa".
- [x] Phát hiện 2: **tinh chỉnh**. Đã đổi vector cơ sở bốn bộ lá phụ (docs/02 mục 4); 22 lá Ẩn Chính giữ nguyên nên các ví dụ vàng 1, 2 không đổi. Kết quả trên 5000 bản đọc ba lá:

  | Trục | Nổi bật (trước → sau) |
  |---|---|
  | Năng lượng | 14,9% → 17,0% |
  | Cảm xúc | 17,1% → 16,2% |
  | Kết nối | 9,4% → 17,7% |
  | Nền tảng | 21,6% → 13,5% |
  | Lý trí | 20,5% → 19,2% |
  | Thay đổi | 16,5% → 16,4% |

  Một lá: mọi trục trong khoảng 14-20%. Lưu ý: tần suất **tiêu đề** vẫn lệch (0,3% đến 10,5%), vì tiêu đề ghép hai trục và các cặp trục đối nhau trên radar hiếm khi cùng cao. Đây là đặc tính tự nhiên, không phải lỗi.
- [ ] Phát hiện 3: chủ dự án đang đọc duyệt nội dung lá bài. Mẫu mới ở `gate-1-samples.txt`.
- [x] Cho phép sang Giai đoạn 2 (T12 trở đi).
