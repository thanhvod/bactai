import { execSync } from 'node:child_process';
import * as path from 'node:path';

/** Chạy 1 lần trước toàn bộ test: migrate DB test. Seed chạy lại trước mỗi file (per-file-setup). */
export default async function setup() {
  const url = process.env.TEST_DATABASE_URL ?? 'postgresql://bta:bta@localhost:5432/bta_test?schema=public';
  const dbDir = path.resolve(__dirname, '../../../../packages/db');
  execSync('npx prisma migrate deploy', { cwd: dbDir, env: { ...process.env, DATABASE_URL: url }, stdio: 'pipe' });
}
