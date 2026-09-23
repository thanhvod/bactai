import type { Prisma } from '@prisma/client';
import {
  CATALOG_DEFAULTS,
  CATALOG_TYPES,
  DOC_TYPE,
  DOC_TYPES,
  MERCHANT_ROLES,
  PERMISSION_KEYS,
  defaultGrant,
  type CatalogType,
} from '@bta/shared';

/** Settings, role matrix, number formats, catalog mặc định khi tạo merchant (dùng cho seed + API createMerchant). */
export async function seedMerchantDefaults(tx: Prisma.TransactionClient, merchantId: string) {
  await tx.merchantSettings.upsert({ where: { merchantId }, create: { merchantId }, update: {} });
  await tx.merchantRolePermission.createMany({
    data: MERCHANT_ROLES.flatMap((role) =>
      PERMISSION_KEYS.map((permission) => ({ merchantId, role, permission, grant: defaultGrant(permission, role) })),
    ),
    skipDuplicates: true,
  });
  await tx.numberFormat.createMany({
    data: DOC_TYPES.map((docType) => ({ merchantId, docType, prefix: DOC_TYPE[docType].prefix })),
    skipDuplicates: true,
  });
  await tx.catalogItem.createMany({
    data: CATALOG_TYPES.flatMap((type: CatalogType) =>
      CATALOG_DEFAULTS[type].map((c, i) => ({
        merchantId,
        type,
        code: c.code,
        name: c.name,
        appliesTo: c.appliesTo ?? null,
        isDefault: true,
        sortOrder: i,
      })),
    ),
    skipDuplicates: true,
  });
}
