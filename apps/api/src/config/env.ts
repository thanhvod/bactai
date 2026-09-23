import { z } from 'zod';
import * as fs from 'node:fs';
import * as path from 'node:path';

/** Nạp .env của apps/api (không override biến đã có trong process). */
function loadDotEnv() {
  const candidates = [path.resolve(process.cwd(), '.env'), path.resolve(__dirname, '../../.env'), path.resolve(__dirname, '../../../.env')];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m || line.trim().startsWith('#')) continue;
      const [, k, raw] = m;
      const v = raw.replace(/^["']|["']$/g, '');
      if (process.env[k] === undefined) process.env[k] = v;
    }
    break;
  }
}
loadDotEnv();

const bool = z
  .union([z.boolean(), z.string()])
  .transform((v) => v === true || v === 'true' || v === '1');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(2001),
  DATABASE_URL: z.string().min(1),
  TEST_DATABASE_URL: z.string().optional(),
  AUTH_DEV_BYPASS: bool.default(false),
  FIREBASE_PROJECT_ID: z.string().default('bac-tai-app'),
  DRIVER_JWT_SECRET: z.string().default('dev-driver-secret'),
  CUSTOMER_JWT_SECRET: z.string().default('dev-customer-secret'),
  STORAGE_SIGNING_SECRET: z.string().default('dev-storage-secret'),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_DIR: z.string().default('./storage'),
  API_PUBLIC_URL: z.string().default('http://localhost:2001'),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default('ap-southeast-1'),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: bool.default(true),
  ALLOW_SELF_SERVICE_MERCHANT: bool.default(true),
  USER_JWT_SECRET: z.string().default('dev-user-secret'),
  OTP_SECRET: z.string().default('dev-otp-secret'),
  /** log (dev: in mã ra log) | sns (AWS SNS, D-015) */
  SMS_DRIVER: z.enum(['log', 'sns']).default('log'),
  AWS_REGION: z.string().default('ap-southeast-1'),
  SNS_SENDER_ID: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;
export function env(): Env {
  if (!cached) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(`Cấu hình môi trường không hợp lệ: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
    }
    cached = parsed.data;
    if (cached.NODE_ENV === 'production' && cached.AUTH_DEV_BYPASS) {
      throw new Error('AUTH_DEV_BYPASS không được bật ở production');
    }
  }
  return cached;
}
