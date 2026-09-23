import { execSync } from 'node:child_process';
import * as path from 'node:path';

/** Mỗi file test bắt đầu từ dữ liệu seed chuẩn (các file chạy tuần tự trên cùng DB). */
const url = process.env.TEST_DATABASE_URL ?? 'postgresql://bta:bta@localhost:5432/bta_test?schema=public';
execSync('npx tsx prisma/seed.ts', { cwd: path.resolve(__dirname, '../../../../packages/db'), env: { ...process.env, DATABASE_URL: url }, stdio: 'pipe' });
