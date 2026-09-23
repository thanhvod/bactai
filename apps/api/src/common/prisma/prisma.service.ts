import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient, createTenantClient, type TenantPrismaClient } from '@bta/db';
import { currentMerchantId } from '../context/request-context';
import { env } from '../../config/env';

/**
 * `raw`: client không lọc tenant (auth, seed, cross-merchant lookups có kiểm soát).
 * `db`: client có tenant guard — tự thêm merchantId từ request context vào mọi query của model có merchantId.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly raw: PrismaClient;
  readonly db: TenantPrismaClient;

  constructor() {
    const url = env().NODE_ENV === 'test' && env().TEST_DATABASE_URL ? env().TEST_DATABASE_URL : env().DATABASE_URL;
    this.raw = new PrismaClient({ datasources: { db: { url } } });
    this.db = createTenantClient(this.raw, currentMerchantId);
  }

  async onModuleInit() {
    await this.raw.$connect();
  }

  async onModuleDestroy() {
    await this.raw.$disconnect();
  }

  /** Transaction trên client tenant-guard. */
  tx<T>(fn: (tx: Tx) => Promise<T>, opts?: { timeout?: number }): Promise<T> {
    return this.db.$transaction((tx) => fn(tx as unknown as Tx), { timeout: opts?.timeout ?? 20_000 });
  }

  isUniqueViolation(e: unknown): boolean {
    return e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
  }
}

/** Kiểu client trong transaction (tenant-guard vẫn áp dụng). */
export type Tx = Omit<TenantPrismaClient, '$transaction' | '$connect' | '$disconnect' | '$on' | '$use' | '$extends'>;
export type DbClient = Tx | TenantPrismaClient;
