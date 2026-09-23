import { Injectable } from '@nestjs/common';
import type { EntityType, NotificationType, Permission, RecipientType } from '@bta/shared';
import { currentMerchantId } from '../context/request-context';
import { PermissionService } from '../auth/permission.service';
import { PrismaService, type DbClient } from '../prisma/prisma.service';

export interface NotifyInput {
  type: NotificationType;
  title: string;
  body?: string | null;
  entityType?: EntityType | null;
  entityId?: string | null;
  severity?: 'info' | 'warning' | 'danger' | 'success' | null;
}

/** Notification nội bộ lưu DB, web/app polling (ARCHITECTURE §20). */
@Injectable()
export class NotifyService {
  constructor(private readonly prisma: PrismaService, private readonly permissions: PermissionService) {}

  async toRecipients(recipients: { type: RecipientType; id: string }[], input: NotifyInput, tx?: DbClient, merchantId = currentMerchantId()) {
    if (!recipients.length) return;
    const db = (tx ?? this.prisma.raw) as any;
    const seen = new Set<string>();
    const data = recipients
      .filter((r) => {
        const k = `${r.type}:${r.id}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .map((r) => ({
        merchantId,
        recipientType: r.type,
        recipientId: r.id,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        severity: input.severity ?? null,
      }));
    await db.notification.createMany({ data });
  }

  async toDriver(driverId: string, input: NotifyInput, tx?: DbClient) {
    return this.toRecipients([{ type: 'DRIVER', id: driverId }], input, tx);
  }

  async toCustomerAccount(accountId: string, input: NotifyInput, merchantId: string | null = currentMerchantId()) {
    return this.toRecipients([{ type: 'CUSTOMER', id: accountId }], input, undefined, merchantId);
  }

  /** Gửi tới mọi nhân viên ACTIVE của merchant có permission. */
  async toUsersWithPermission(permission: Permission, input: NotifyInput, opts: { exceptMembershipId?: string | null; merchantId?: string | null } = {}) {
    const merchantId = opts.merchantId ?? currentMerchantId();
    if (!merchantId) return;
    const users = await this.prisma.raw.merchantUser.findMany({ where: { merchantId, status: 'ACTIVE' } });
    const recipients: { type: RecipientType; id: string }[] = [];
    for (const u of users) {
      if (u.id === opts.exceptMembershipId) continue;
      const perms = await this.permissions.effectiveFor(merchantId, u.role as any, u.extraPermissions);
      if (perms.includes(permission)) recipients.push({ type: 'USER', id: u.id });
    }
    await this.toRecipients(recipients, input, undefined, merchantId);
  }
}
