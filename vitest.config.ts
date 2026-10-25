import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Nạp .env (nếu có) để test hợp đồng Postgres biết TEST_DATABASE_URL.
try {
  process.loadEnvFile();
} catch {
  // không có .env
}

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'scripts/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: true,
    fileParallelism: false,
    coverage: { provider: 'v8', include: ['src/contexts/**/domain/**'], thresholds: { lines: 90 } },
  },
});
