import { Injectable } from '@nestjs/common';
import { effectivePermissions, type Grant, type MerchantRole, type Permission } from '@bta/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  /** Quyền hiệu lực = matrix merchant (override) + quyền cấp thêm cho cá nhân. */
  async effectiveFor(merchantId: string, role: MerchantRole, extra: string[]): Promise<Permission[]> {
    const rows = await this.prisma.raw.merchantRolePermission.findMany({ where: { merchantId, role } });
    const overrides: Partial<Record<Permission, Grant>> = {};
    for (const r of rows) overrides[r.permission as Permission] = r.grant as Grant;
    return effectivePermissions(role, extra, overrides);
  }
}
