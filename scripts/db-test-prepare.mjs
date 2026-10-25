// Áp migration vào DB test (TEST_DATABASE_URL). Chạy: npm run db:test:prepare
import { spawnSync } from 'node:child_process';

try {
  process.loadEnvFile();
} catch {
  // CI: biến môi trường đã có sẵn
}
const url = process.env.TEST_DATABASE_URL;
if (!url) {
  console.error('Thiếu TEST_DATABASE_URL');
  process.exit(1);
}
const r = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, DATABASE_URL: url },
});
process.exit(r.status ?? 1);
