import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'scripts/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: true,
    coverage: { provider: 'v8', include: ['src/contexts/**/domain/**'], thresholds: { lines: 90 } },
  },
});
