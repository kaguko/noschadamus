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
| dependency-cruiser | 18.7.0 |

Ghi chú:
- Khung dựng bằng `create-next-app` bản mới nhất; mặc định bật `cacheComponents` và `partialPrefetching` trong `next.config.ts`. Giữ nguyên; các trang đọc cookie phải bọc trong `<Suspense>` theo hướng dẫn của Next 16 (xem `node_modules/next/dist/docs/`).
- `@types/node` nâng lên ^22 để khớp peer của vitest 5.
- `AGENTS.md` do Next tự sinh và tự thêm lại; giữ trong repo.

## Bổ sung T12 (2026-10-25)

- Prisma **7.10.1** (ghim; tag `latest` trên npm trỏ vào 8.0.0-rc). Cấu hình ở `prisma.config.ts`, generator `prisma-client` sinh vào `src/generated/prisma`, kết nối qua `@prisma/adapter-pg` + `pg`.
- Postgres 17 (alpine) qua `docker-compose.yml`; DB test riêng `noschadamus_test` (tạo bởi `docker/init-test-db.sql`).
- Port `ReadingRepository` thêm `markViewed(id, now)` để tính thời hạn lưu giữ theo lần xem cuối.
