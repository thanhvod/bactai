import { Injectable } from '@nestjs/common';
import { currentActor, currentMerchantId } from '../context/request-context';
import { PrismaService } from '../prisma/prisma.service';
import { jsonSafe } from '../audit/audit.service';

/**
 * Idempotency cho mutation từ app offline / payment (ARCHITECTURE §15.4).
 * Cùng actor + key → trả kết quả đã lưu, không chạy lại.
 */
@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  async run<T>(key: string | null | undefined, action: string, fn: () => Promise<T>, revive?: (stored: any) => Promise<T> | T): Promise<T> {
    if (!key) return fn();
    const actor = currentActor();
    const actorId = actor.actorId ?? 'system';
    const existing = await this.prisma.raw.idempotencyKey.findUnique({
      where: { actorType_actorId_key: { actorType: actor.actorType, actorId, key } },
    });
    if (existing) {
      return revive ? revive(existing.response) : (existing.response as T);
    }
    const result = await fn();
    try {
      await this.prisma.raw.idempotencyKey.create({
        data: { merchantId: currentMerchantId(), actorType: actor.actorType, actorId, key, action, response: jsonSafe(result) ?? null },
      });
    } catch {
      /* race: request trùng đã ghi trước — bỏ qua */
    }
    return result;
  }
}
