# ADR 0001: Ngăn xếp công nghệ

Trạng thái: chấp nhận · Ngày: 2026-10-25

Phiên bản thực tế lúc khởi tạo (T00):

| Gói | Phiên bản |
|---|---|
| Node | v22.22.0 (`.nvmrc`: 22) |
| next | 16.4.3 |
| react / react-dom | 19.3.0 |
| typescript | 5.9.3 |
| tailwindcss | 4.3.3 (qua `@tailwindcss/turbopack`, không cần PostCSS) |
| zod | 4.6.7 |
| vitest | 5.0.5 |
| @playwright/test | 1.64.1 |
| dependency-cruiser |  |

Ghi chú:
- Khung dựng bằng `create-next-app` bản mới nhất; mặc định bật `cacheComponents` và `partialPrefetching` trong `next.config.ts`. Giữ nguyên; các trang đọc cookie phải bọc trong `<Suspense>` theo hướng dẫn của Next 16 (xem `node_modules/next/dist/docs/`).
- `@types/node` nâng lên ^22 để khớp peer của vitest 5.
- `AGENTS.md` do Next tự sinh và tự thêm lại; giữ trong repo.
