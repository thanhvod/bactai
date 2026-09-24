import { Injectable, Logger } from '@nestjs/common';
import type { EntityType, NotificationType, RecipientType } from '@bta/shared';
import { env } from '../../config/env';
import { PrismaService } from '../prisma/prisma.service';
import { FcmPushSender, MemoryPushSender, NoopPushSender, loadServiceAccount, type PushSender } from './push.sender';

export interface PushInput {
  type: NotificationType;
  title: string;
  body?: string | null;
  entityType?: EntityType | null;
  entityId?: string | null;
  merchantId?: string | null;
}

/**
 * Gửi push FCM cho người nhận notification (D-017). Chạy nền, lỗi không ảnh hưởng nghiệp vụ.
 * USER recipient = membershipId → gửi tới mọi máy App Merchant của tài khoản; DRIVER → máy App Tài xế.
 * CUSTOMER chưa có app → bỏ qua.
 */
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  readonly sender: PushSender;
  private pending = new Set<Promise<unknown>>();

  constructor(private readonly prisma: PrismaService) {
    if (env().NODE_ENV === 'test') this.sender = new MemoryPushSender();
    else {
      const sa = loadServiceAccount(env().FIREBASE_SERVICE_ACCOUNT);
      this.sender = sa ? new FcmPushSender(sa) : new NoopPushSender();
      if (!sa) this.logger.log('Chưa cấu hình FIREBASE_SERVICE_ACCOUNT — tắt push FCM (notification vẫn lưu DB)');
    }
  }

  /** Fire-and-forget; test gọi idle() để chờ. */
  dispatch(recipients: { type: RecipientType; id: string }[], input: PushInput) {
    if (!this.sender.enabled || !recipients.length) return;
    const p = this.sendNow(recipients, input)
      .catch((e) => this.logger.error(`push lỗi: ${(e as Error).message}`))
      .finally(() => this.pending.delete(p));
    this.pending.add(p);
  }

  async idle() {
    while (this.pending.size) await Promise.allSettled([...this.pending]);
  }

  async tokensFor(recipients: { type: RecipientType; id: string }[]): Promise<string[]> {
    // Chỉ tài xế đang hoạt động và tài khoản app chưa khóa mới nhận push
    const driverIds = (
      await this.prisma.raw.driver.findMany({
        where: { id: { in: recipients.filter((r) => r.type === 'DRIVER').map((r) => r.id) }, status: 'ACTIVE', account: { status: { not: 'DISABLED' } } },
        select: { id: true },
      })
    ).map((d) => d.id);
    const membershipIds = recipients.filter((r) => r.type === 'USER').map((r) => r.id);
    const accounts = membershipIds.length
      ? (await this.prisma.raw.merchantUser.findMany({ where: { id: { in: membershipIds }, status: 'ACTIVE' }, select: { accountId: true } }))
          .map((m) => m.accountId)
          .filter(Boolean) as string[]
      : [];
    if (!driverIds.length && !accounts.length) return [];
    const rows = await this.prisma.raw.deviceToken.findMany({
      where: { OR: [...(driverIds.length ? [{ app: 'DRIVER' as const, driverId: { in: driverIds } }] : []), ...(accounts.length ? [{ app: 'MERCHANT' as const, userAccountId: { in: accounts } }] : [])] },
      select: { token: true },
    });
    return [...new Set(rows.map((r) => r.token))];
  }

  async sendNow(recipients: { type: RecipientType; id: string }[], input: PushInput) {
    const tokens = await this.tokensFor(recipients);
    if (!tokens.length) return { success: 0, failure: 0, invalidTokens: [] as string[] };
    const res = await this.sender.send(tokens, {
      title: input.title,
      body: input.body ?? null,
      data: {
        type: input.type,
        entityType: input.entityType ?? '',
        entityId: input.entityId ?? '',
        merchantId: input.merchantId ?? '',
      },
    });
    if (res.invalidTokens.length) await this.prisma.raw.deviceToken.deleteMany({ where: { token: { in: res.invalidTokens } } });
    return res;
  }
}
