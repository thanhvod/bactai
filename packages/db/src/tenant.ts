import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Model có cột merchantId — extension tự thêm điều kiện merchantId vào mọi query & data.
 * Tính từ DMMF để không phải liệt kê tay; model không có merchantId (UserAccount, CustomerAccount...) đi qua nguyên.
 */
export const TENANT_MODELS: ReadonlySet<string> = new Set(
  Prisma.dmmf.datamodel.models.filter((m) => m.fields.some((f) => f.name === 'merchantId')).map((m) => m.name),
);

export type MerchantIdResolver = () => string | null | undefined;

const READ_ACTIONS = new Set(['findFirst', 'findFirstOrThrow', 'findMany', 'count', 'aggregate', 'groupBy']);
const UNIQUE_ACTIONS = new Set(['findUnique', 'findUniqueOrThrow', 'update', 'delete']);
const MANY_WRITE_ACTIONS = new Set(['updateMany', 'deleteMany']);

function withMerchant(where: Record<string, unknown> | undefined, merchantId: string) {
  return { ...(where ?? {}), merchantId };
}

/**
 * Tạo Prisma client có tenant guard. `resolve()` được gọi tại thời điểm chạy query
 * (API dùng AsyncLocalStorage). Nếu resolve() trả null → query đi qua không lọc (dùng cho system/seed).
 */
export function createTenantClient<T extends PrismaClient>(prisma: T, resolve: MerchantIdResolver) {
  return prisma.$extends({
    name: 'tenantGuard',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const merchantId = resolve();
          if (!merchantId || !TENANT_MODELS.has(model)) return query(args);
          const a = args as Record<string, any>;
          if (READ_ACTIONS.has(operation) || MANY_WRITE_ACTIONS.has(operation)) {
            a.where = withMerchant(a.where, merchantId);
          } else if (UNIQUE_ACTIONS.has(operation)) {
            // Prisma ≥5: where unique cho phép thêm field không unique (extendedWhereUnique)
            a.where = withMerchant(a.where, merchantId);
          } else if (operation === 'create') {
            a.data = { ...(a.data ?? {}), merchantId };
          } else if (operation === 'createMany' || operation === 'createManyAndReturn') {
            const rows = Array.isArray(a.data) ? a.data : [a.data];
            a.data = rows.map((r: Record<string, unknown>) => ({ ...r, merchantId }));
          } else if (operation === 'upsert') {
            a.where = withMerchant(a.where, merchantId);
            a.create = { ...(a.create ?? {}), merchantId };
          }
          return query(a);
        },
      },
    },
  });
}

export type TenantPrismaClient = ReturnType<typeof createTenantClient<PrismaClient>>;
