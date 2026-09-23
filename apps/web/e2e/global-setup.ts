import { execSync } from 'node:child_process';
import path from 'node:path';

export default async function globalSetup() {
  const url = process.env.E2E_DATABASE_URL ?? 'postgresql://bta:bta@localhost:5432/bta_e2e?schema=public';
  const db = path.resolve(process.cwd(), '../../packages/db');
  execSync('npx prisma migrate deploy', { cwd: db, env: { ...process.env, DATABASE_URL: url }, stdio: 'pipe' });
  execSync('npx tsx prisma/seed.ts', { cwd: db, env: { ...process.env, DATABASE_URL: url }, stdio: 'pipe' });
}
