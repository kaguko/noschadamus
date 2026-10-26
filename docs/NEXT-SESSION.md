# Làm tiếp từ đây (cập nhật 2026-10-26)

## Đã xong (đã commit + push)
T00 → T23. Cửa kiểm 1 đã duyệt.

## Đang chờ: Cửa kiểm 2 (sau T23)
Chủ dự án xem cảm giác lật bài, trình tự, Soul Map ở `/reading/[id]?reveal=1`. Kèm câu hỏi mở #3
(ngân sách hiệu năng, docs/OPEN-QUESTIONS.md). **Chưa làm T24 cho tới khi được duyệt.**

## Sau đó
T24 (ảnh chia sẻ) → T25 (ShareSheet) → T26 (/s/[token], cũng cần 404 thật, có thể kiểm token ở proxy) → T27 → T28 … theo docs/07.

## Lưu ý môi trường
- Cần Docker Desktop chạy, rồi `npm run db:up`.
- e2e nhanh: `RATE_LIMIT_MULTIPLIER=100 npx next dev -p 3100` rồi `E2E_BASE_URL=http://localhost:3100 npx playwright test`.
  Các trang `/dev/*` trả 404 ở bản production, nên ui-kit/soul-map spec chỉ chạy được với dev server.
- CI chưa chạy e2e (chỉ lint/typecheck/test/build).
- Dev server Turbopack đôi khi giữ CSS/module cũ: khởi động lại nếu thấy giao diện không đổi.
