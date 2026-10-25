# ADR 0002: Ép quy tắc kiến trúc

Trạng thái: chấp nhận · Ngày: 2026-10-25

- D1-D7 (docs/03 mục 3) kiểm bằng `dependency-cruiser` (`.dependency-cruiser.cjs`, lệnh `npm run lint:arch`).
- D8 (cấm `Math.random`, `Date.now`, `new Date()`, `crypto` trong domain/application) kiểm bằng ESLint (`eslint.config.mjs`).
- `npm run lint` chạy cả hai.
- File test (`*.test.ts`) được loại khỏi cả hai kiểm tra để test có thể dùng vitest và dữ liệu thời gian cố định.
- Trục Soul Map (`AXIS_ORDER`, `AxisVector`) nằm ở `src/shared/kernel/axes.ts` vì là ngôn ngữ chung của cả `tarot` (vector lá bài) và `reading` (Soul Map). Đặt ở một context sẽ buộc context kia vi phạm D4.
- D5 cho phép import **chỉ-kiểu** (`import type`) từ domain vào `app/` và `components/`, để không phải nhân bản kiểu.

## Ba ví dụ vi phạm đã thử (và bị chặn)

1. `src/contexts/tarot/domain/_violate.ts` import `zod` → `D1-domain-purity` (node_modules/zod).
2. Cùng file import `@/contexts/reading/domain` → `D1-domain-purity` và `D4-no-cross-context`.
3. `src/contexts/reading/application/_violate.ts` dùng `Math.random()` và `new Date()` → ESLint `no-restricted-properties`, `no-restricted-syntax`.
4. `src/app/_violate.ts` re-export `@/contexts/reading/infrastructure` → `D5-presentation-boundary`.
