import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.TEST_DATABASE_URL ??= 'postgresql://bta:bta@localhost:5432/bta_test?schema=public';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.AUTH_DEV_BYPASS = 'true';
process.env.STORAGE_LOCAL_DIR ??= '/tmp/bta-test-storage';

let appPromise: Promise<INestApplication> | null = null;

/** Nest app dùng chung cho mọi file test (DB test đã seed ở global-setup). */
export function testApp(): Promise<INestApplication> {
  if (!appPromise) {
    appPromise = (async () => {
      const { AppModule } = await import('../app.module');
      const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
      const app = mod.createNestApplication({ logger: ['error'] });
      await app.init();
      return app;
    })();
  }
  return appPromise;
}

export async function prisma() {
  const { PrismaService } = await import('../common/prisma/prisma.service');
  return (await testApp()).get(PrismaService).raw;
}

const merchantIds = new Map<string, string>();
export async function merchantId(code: 'M-DEMO-A' | 'M-DEMO-B' | string) {
  if (!merchantIds.has(code)) {
    const m = await (await prisma()).merchant.findUniqueOrThrow({ where: { code } });
    merchantIds.set(code, m.id);
  }
  return merchantIds.get(code)!;
}

export interface AsUser {
  email: string;
  merchant?: string; // merchant code
}

export const USERS = {
  admin: { email: 'admin@bta-demo.test', merchant: 'M-DEMO-A' },
  operation: { email: 'operation@bta-demo.test', merchant: 'M-DEMO-A' },
  accountant: { email: 'accountant@bta-demo.test', merchant: 'M-DEMO-A' },
  adminB: { email: 'admin@tenant-b.test', merchant: 'M-DEMO-B' },
} satisfies Record<string, AsUser>;

export interface GqlResult<T = any> {
  data: T;
  errors?: { message: string; extensions?: { code?: string; validation?: { field: string; message: string }[] } }[];
}

/** Gọi GraphQL như một nhân viên merchant (dev bypass token) hoặc bằng token tài xế/khách ("drv.xxx"). */
export async function gql<T = any>(as: AsUser | string | null, query: string, variables: Record<string, unknown> = {}): Promise<GqlResult<T>> {
  const app = await testApp();
  const req = request(app.getHttpServer()).post('/graphql').send({ query, variables });
  if (typeof as === 'string') req.set('authorization', `Bearer ${as}`);
  else if (as) {
    req.set('authorization', `Bearer dev:${as.email}`);
    if (as.merchant) req.set('x-merchant-id', await merchantId(as.merchant));
  }
  const res = await req;
  return res.body;
}

/** Như gql nhưng ném lỗi nếu có errors — dùng cho bước chuẩn bị dữ liệu trong test. */
export async function gqlOk<T = any>(as: AsUser | string | null, query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const r = await gql<T>(as, query, variables);
  if (r.errors?.length) throw new Error(`GraphQL error: ${JSON.stringify(r.errors)}`);
  return r.data;
}

export function errorCode(r: GqlResult): string | undefined {
  return r.errors?.[0]?.extensions?.code;
}

export async function http() {
  return request((await testApp()).getHttpServer());
}

export async function driverToken(phone = '0900000001', password = 'Taixe123'): Promise<string> {
  const res = await (await http()).post('/driver/auth/login').send({ phone, password });
  if (!res.body.accessToken) throw new Error(`driver login failed: ${JSON.stringify(res.body)}`);
  return res.body.accessToken;
}
