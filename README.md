# noschadamus

Trang web bói toán/tarot theo hướng "đọc lạ": tập trung vào trải nghiệm trực quan và khả năng chia sẻ xã hội, thay vì đưa ra lời tiên đoán.

> Trạng thái: giai đoạn lập kế hoạch. Hiện repo mới có tài liệu thiết kế, chưa có mã nguồn.

## Ý tưởng

Một trong các hướng khác biệt (chọn một để bắt đầu):

- **Bản đồ trực quan hóa**: rút bài, hệ thống vẽ biểu đồ radar cảm xúc hoặc "bản đồ linh hồn" dạng hình ảnh để chia sẻ lên mạng xã hội.
- **Đối chiếu chéo đa hệ thống**: kết hợp Tarot, cung hoàng đạo và thần số học, tìm điểm "cộng hưởng" thay vì phán đoán đơn lẻ.
- **Công cụ suy ngẫm**: không nói cát/hung, chỉ đặt câu hỏi gợi mở để người dùng tự chiêm nghiệm.

Đối tượng: người trẻ tò mò về tâm linh nhưng không muốn bị phán xét, thích chia sẻ hình ảnh đẹp lên Instagram/TikTok.

## Kiến trúc

Clean Architecture kết hợp DDD, chia theo bounded context:

- **Tarot**: bộ bài, ý nghĩa lá bài, logic rút bài
- **Astrology**: cung hoàng đạo, thần số học
- **Reading**: lịch sử, kết quả, chia sẻ
- **User**: tài khoản hoặc ẩn danh

Các tầng: Presentation (Next.js/React) → Application (use cases) → Domain (thuần khiết) ← Infrastructure.

## Tài liệu

Xem chi tiết định hướng, kiến trúc, cấu trúc thư mục và lộ trình trong [plan.md](plan.md).
