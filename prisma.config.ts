import { defineConfig } from 'prisma/config';

// Prisma CLI không tự nạp .env; dùng API có sẵn của Node thay cho dotenv.
try {
  process.loadEnvFile();
} catch {
  // không có .env (CI): dùng biến môi trường sẵn có
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
