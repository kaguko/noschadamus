# Bộ đặc tả noschadamus (dành cho người/AI triển khai)

Bộ tài liệu này đủ để một lập trình viên (hoặc Claude Opus) dựng toàn bộ MVP mà **không phải tự quyết định thiết kế**. Mọi con số, màu, tọa độ, câu chữ, thuật toán đều đã được chốt. Chỗ nào còn để mở sẽ ghi rõ `[MỞ]`.

## Thứ tự đọc (bắt buộc)

| # | File | Nội dung | Đọc để làm gì |
|---|---|---|---|
| 0 | [`../plan.md`](../plan.md) | Chiến lược sản phẩm, chỉ số, rủi ro | Hiểu **vì sao** |
| 1 | [`01-domain-spec.md`](01-domain-spec.md) | Mô hình miền, thuật toán rút bài, Soul Map, quy tắc, use case, test | Viết lõi nghiệp vụ |
| 2 | [`02-content-data-spec.md`](02-content-data-spec.md) | Schema dữ liệu 78 lá, vector cảm xúc, bộ chữ, giọng văn | Viết dữ liệu và nội dung |
| 3 | [`03-architecture-api-data.md`](03-architecture-api-data.md) | Thư mục, quy tắc import, API, Prisma, bảo mật, vận hành | Dựng hạ tầng |
| 4 | [`04-design-system.md`](04-design-system.md) | Token, chữ, màu, chuyển động, component | Dựng UI kit |
| 5 | [`05-screens.md`](05-screens.md) | Từng màn hình: bố cục, trạng thái, câu chữ, tương tác | Dựng trang |
| 6 | [`06-soulmap-and-share-images.md`](06-soulmap-and-share-images.md) | Hình học Soul Map, ảnh chia sẻ (tọa độ từng phần tử) | Dựng đồ họa |
| 7 | [`07-implementation-tasks.md`](07-implementation-tasks.md) | Danh sách task có thứ tự, tiêu chí nghiệm thu | Làm việc từng bước |

## Nguyên tắc ưu tiên khi hai tài liệu mâu thuẫn

1. `01-domain-spec.md` thắng về **hành vi nghiệp vụ**.
2. `02-content-data-spec.md` thắng về **nội dung và số liệu**.
3. `04`/`05`/`06` thắng về **giao diện**.
4. `03` thắng về **cấu trúc kỹ thuật**.
5. Nếu vẫn mâu thuẫn: dừng lại, ghi vào `docs/OPEN-QUESTIONS.md`, chọn phương án an toàn hơn về quyền riêng tư.

## Cách giao cho Claude Opus

Mở Claude Code tại thư mục repo (file `CLAUDE.md` ở gốc sẽ tự được nạp), rồi dán:

```
Bạn là kỹ sư triển khai dự án noschadamus. Đọc toàn bộ docs/README.md rồi
lần lượt các file 01 → 07. Sau đó thực hiện docs/07-implementation-tasks.md
theo đúng thứ tự task, mỗi lần MỘT task:
1. Nêu ngắn gọn bạn sẽ làm gì.
2. Làm, kèm test.
3. Chạy lint, type-check, test; chỉ báo xong khi tất cả xanh.
4. Tự đối chiếu "Tiêu chí nghiệm thu" của task, liệt kê từng mục đạt/không đạt.
5. Commit riêng cho task đó, rồi dừng chờ tôi nói "tiếp" (trừ khi tôi bảo chạy liền).
Không tự thêm tính năng ngoài đặc tả. Không đổi số liệu/câu chữ trong đặc tả;
nếu thấy sai, ghi vào docs/OPEN-QUESTIONS.md và hỏi tôi.
```

Gợi ý: chạy liền các task T00-T11 (nền tảng + lõi miền; T11 là Cửa kiểm 1), dừng kiểm tra, rồi mới chạy phần giao diện.

## Từ điển nhanh

Xem mục 2.1 của [`../plan.md`](../plan.md) và bảng thuật ngữ ở đầu `01-domain-spec.md`.
