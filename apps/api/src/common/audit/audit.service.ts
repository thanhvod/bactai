import { Injectable } from '@nestjs/common';
import type { ActivityCategory, EntityType } from '@bta/shared';
import { currentActor, currentStore } from '../context/request-context';
import { PrismaService, type DbClient } from '../prisma/prisma.service';

export interface ActivityInput {
  entityType: EntityType;
  entityId: string;
  parent?: { type: EntityType; id: string };
  category: ActivityCategory;
  action: string;
  summary: string;
  reason?: string | null;
  before?: unknown;
  after?: unknown;
  sensitive?: boolean;
  clientRequestId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface StatusChangeInput {
  entityType: EntityType;
  entityId: string;
  from: string | null;
  to: string;
  reason?: string | null;
  note?: string | null;
  metadata?: Record<string, unknown>;
}

/** Chuyển BigInt/Date sang JSON-safe để lưu before/after. */
export function jsonSafe(value: unknown): any {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value, (_k, v) => (typeof v === 'bigint' ? Number(v) : v)));
}

/** Chỉ giữ các field thay đổi giữa before/after (để AuditDiff gọn). */
export function diffFields(before: Record<string, unknown>, after: Record<string, unknown>) {
  const b: Record<string, unknown> = {};
  const a: Record<string, unknown> = {};
  for (const k of Object.keys(after)) {
    const bv = jsonSafe(before[k]);
    const av = jsonSafe(after[k]);
    if (JSON.stringify(bv) !== JSON.stringify(av)) {
      b[k] = bv;
      a[k] = av;
    }
  }
  return { before: b, after: a, changed: Object.keys(a) };
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /** Ghi activity/audit log. Truyền `tx` để ghi trong cùng transaction với thay đổi nghiệp vụ. */
  async log(input: ActivityInput, tx?: DbClient) {
    const db = (tx ?? this.prisma.db) as any;
    const actor = currentActor();
    const s = currentStore();
    return db.activityLog.create({
      data: {
        merchantId: s?.merchantId ?? undefined,
        entityType: input.entityType,
        entityId: input.entityId,
        parentEntityType: input.parent?.type,
        parentEntityId: input.parent?.id,
        category: input.category,
        action: input.action,
        summary: input.summary,
        actorType: actor.actorType,
        actorId: actor.actorId,
        actorName: actor.actorName,
        reason: input.reason ?? null,
        before: jsonSafe(input.before),
        after: jsonSafe(input.after),
        sensitive: input.sensitive ?? false,
        clientRequestId: input.clientRequestId ?? null,
        ip: s?.ip,
        userAgent: s?.userAgent?.slice(0, 300),
        metadata: jsonSafe(input.metadata),
      },
    });
  }

  async statusChange(input: StatusChangeInput, tx?: DbClient) {
    const db = (tx ?? this.prisma.db) as any;
    const actor = currentActor();
    const s = currentStore();
    return db.statusHistory.create({
      data: {
        merchantId: s?.merchantId ?? undefined,
        entityType: input.entityType,
        entityId: input.entityId,
        fromStatus: input.from,
        toStatus: input.to,
        reason: input.reason ?? null,
        note: input.note ?? null,
        actorType: actor.actorType,
        actorId: actor.actorId,
        actorName: actor.actorName,
        metadata: jsonSafe(input.metadata),
      },
    });
  }
}
