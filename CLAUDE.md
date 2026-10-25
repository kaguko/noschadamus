# CLAUDE.md

Dự án: **noschadamus**, web tarot "đọc lạ" (rút bài → bản đồ linh hồn → ảnh chia sẻ). Không dự đoán tương lai.

## Nguồn sự thật
Đặc tả nằm trong `docs/` (bắt đầu từ `docs/README.md`). Đừng suy diễn ngoài đặc tả; thiếu thì ghi `docs/OPEN-QUESTIONS.md` và hỏi.

## Quy tắc cứng
- TypeScript `strict`, cấm `any` (dùng `unknown` + zod ở biên).
- `src/contexts/*/domain` là TypeScript thuần: không import `next`, `react`, `@prisma/client`, `zod`, hay Node API.
- Thời gian lấy từ port `Clock`, ngẫu nhiên lấy từ port `RandomSource`; domain **không** gọi `Date.now()`/`Math.random()`/`crypto` trực tiếp.
- Rút bài chỉ chạy ở server bằng CSPRNG. Không bao giờ dùng `Math.random` cho việc rút bài.
- Quy tắc import được ép bằng dependency-cruiser (xem `docs/03`); `npm run lint` phải xanh.
- Câu chữ giao diện nằm trong `messages/vi.json`, không hard-code trong component.
- Mọi văn bản kết quả theo giọng gợi mở (xem bộ cấm từ ở `docs/02`). Không từ khẳng định tương lai.
- Câu hỏi người dùng nhập **không** được lưu, log, hay gửi analytics trừ khi `storeIntention === true`.
- Tôn trọng `prefers-reduced-motion`; mọi tương tác dùng được bằng bàn phím.

## Lệnh (sau khi hoàn tất T00)
- `npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck`
- `npm run test` (Vitest) · `npm run test:e2e` (Playwright)
- `npm run db:migrate` · `npm run db:seed` · `npm run cards:validate`

## Quy trình làm việc
Một task một lần, theo `docs/07-implementation-tasks.md`. Mỗi task: code + test + lint/typecheck xanh + đối chiếu tiêu chí nghiệm thu + một commit.
Commit dạng `T07: <mô tả ngắn>`.
