import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ATTACHMENT_CATEGORIES, ENTITY_TYPE, type AttachmentCategory, type EntityType } from '@bta/shared';
import { z } from 'zod';
import { AuditService } from '../../common/audit/audit.service';
import { assertSensitive } from '../../common/auth/sensitive';
import { currentActor, currentMerchantId, currentPrincipal } from '../../common/context/request-context';
import { businessRule, forbidden, notFound } from '../../common/errors/app-error';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';
import { parse } from '../../common/validation/zod';

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME = /^(image\/(jpeg|png|webp|heic|heif)|application\/pdf|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|application\/vnd\.ms-excel|text\/csv)$/;

const presignSchema = z.object({
  entityType: z.enum(Object.keys(ENTITY_TYPE) as [EntityType, ...EntityType[]]),
  entityId: z.string().min(1),
  category: z.enum(ATTACHMENT_CATEGORIES as [AttachmentCategory, ...AttachmentCategory[]]).default('OTHER'),
  fileName: z.string().min(1).max(200),
  contentType: z.string().regex(ALLOWED_MIME, 'Chỉ nhận ảnh, PDF hoặc Excel'),
  fileSize: z.coerce.number().int().min(1).max(MAX_UPLOAD_BYTES, 'File tối đa 20MB'),
  capturedAt: z.coerce.date().optional().nullable(),
  lat: z.coerce.number().optional().nullable(),
  lng: z.coerce.number().optional().nullable(),
  note: z.string().max(500).optional().nullable(),
});
export type PresignInput = z.input<typeof presignSchema>;

const ENTITY_MODEL: Record<EntityType, string | null> = {
  MERCHANT: null, MERCHANT_USER: 'merchantUser', CUSTOMER: 'customer', CUSTOMER_LOCATION: 'customerLocation', DRIVER: 'driver', VEHICLE: 'vehicle',
  SUPPLIER: 'supplier', CATALOG_ITEM: 'catalogItem', ORDER: 'order', ORDER_STOP: 'orderStop', TRIP: 'trip', EXPENSE: 'expense', PAYMENT_IN: 'paymentIn',
  DEBT_STATEMENT: 'debtStatement', PAYROLL: 'payroll', PAYROLL_LINE: 'payrollLine', INCIDENT: 'incident', BOOKING: 'booking', TRIP_ADVANCE: 'tripAdvanceReconciliation', SETTINGS: null,
};

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService, private readonly storage: StorageService, private readonly audit: AuditService) {}

  /** Kiểm tra entity thuộc tenant hiện tại; tài xế chỉ được gắn vào chuyến/điểm/sự cố/chi phí của mình. */
  async assertEntityAccess(entityType: EntityType, entityId: string) {
    const p = currentPrincipal();
    if (!p) throw forbidden();
    const merchantId = currentMerchantId();
    if (entityType === 'MERCHANT') {
      if (entityId !== merchantId) throw forbidden();
      return;
    }
    const model = ENTITY_MODEL[entityType];
    if (!model) throw businessRule('Loại đối tượng không hỗ trợ đính kèm');
    if (p.type === 'DRIVER') {
      const d = p.driverId;
      const ok =
        entityType === 'TRIP' ? await this.prisma.db.trip.count({ where: { id: entityId, driverId: d } })
        : entityType === 'ORDER_STOP' ? await this.prisma.db.orderStop.count({ where: { id: entityId, assignments: { some: { trip: { driverId: d } } } } })
        : entityType === 'INCIDENT' ? await this.prisma.db.incident.count({ where: { id: entityId, OR: [{ driverId: d }, { trip: { driverId: d } }] } })
        : entityType === 'EXPENSE' ? await this.prisma.db.expense.count({ where: { id: entityId, driverId: d } })
        : 0;
      if (!ok) throw forbidden('Tài xế chỉ được gửi chứng từ cho chuyến của mình');
      return;
    }
    if (p.type !== 'USER') throw forbidden();
    const found = await (this.prisma.db as any)[model].count({ where: { id: entityId } });
    if (!found) throw notFound(ENTITY_TYPE[entityType].toLowerCase());
  }

  async presign(input: PresignInput) {
    const data = parse(presignSchema, input);
    await this.assertEntityAccess(data.entityType, data.entityId);
    const merchantId = currentMerchantId();
    const actor = currentActor();
    const id = randomUUID().replace(/-/g, '');
    const storageKey = this.storage.buildKey(merchantId, data.entityType, data.entityId, id, data.fileName);
    const att = await this.prisma.db.attachment.create({
      data: {
        id, entityType: data.entityType, entityId: data.entityId, category: data.category, fileName: data.fileName, storageKey, mimeType: data.contentType,
        size: data.fileSize, status: 'PENDING', uploadedByType: actor.actorType, uploadedById: actor.actorId, uploadedByName: actor.actorName,
        capturedAt: data.capturedAt ?? null, lat: data.lat ?? null, lng: data.lng ?? null, note: data.note ?? null,
      } as any,
    });
    const put = await this.storage.adapter.presignPut(storageKey, data.contentType, data.fileSize);
    return { attachmentId: att.id, uploadUrl: put.url, method: put.method, headers: put.headers, expiresAt: put.expiresAt };
  }

  /** Xác nhận sau khi client PUT xong: file phải tồn tại trong storage, không tạo metadata mồ côi. */
  async confirm(attachmentId: string, checksum?: string | null) {
    const att = await this.prisma.db.attachment.findFirst({ where: { id: attachmentId } });
    if (!att) throw notFound('chứng từ');
    if (att.status === 'READY') return this.view(att);
    await this.assertEntityAccess(att.entityType as EntityType, att.entityId);
    const obj = await this.storage.adapter.exists(att.storageKey);
    if (!obj) throw businessRule('File chưa được tải lên xong, vui lòng thử lại');
    const updated = await this.prisma.db.attachment.update({ where: { id: att.id }, data: { status: 'READY', size: obj.size || att.size, checksum: checksum ?? null } });
    await this.logAttached(updated);
    return this.view(updated);
  }

  private async logAttached(att: { id: string; entityType: string; entityId: string; fileName: string; category: string }) {
    const parent = await this.parentOf(att.entityType as EntityType, att.entityId);
    await this.audit.log({
      entityType: att.entityType as EntityType, entityId: att.entityId, parent, category: 'ATTACHMENT', action: 'attachment.add',
      summary: `Thêm chứng từ ${att.category === 'POD' ? 'POD' : ''} "${att.fileName}"`.replace('  ', ' '), metadata: { attachmentId: att.id, category: att.category },
    });
  }

  private async parentOf(type: EntityType, id: string): Promise<{ type: EntityType; id: string } | undefined> {
    if (type === 'ORDER_STOP') {
      const s = await this.prisma.db.orderStop.findFirst({ where: { id }, select: { orderId: true } });
      return s ? { type: 'ORDER', id: s.orderId } : undefined;
    }
    if (type === 'TRIP') {
      const t = await this.prisma.db.trip.findFirst({ where: { id }, select: { orderId: true } });
      return t ? { type: 'ORDER', id: t.orderId } : undefined;
    }
    return undefined;
  }

  /** File do server sinh (PDF bảng kê, mẫu in). */
  async createFromBuffer(input: { entityType: EntityType; entityId: string; category: AttachmentCategory; fileName: string; mimeType: string; body: Buffer; sharedWithCustomer?: boolean }) {
    const merchantId = currentMerchantId();
    const actor = currentActor();
    const id = randomUUID().replace(/-/g, '');
    const storageKey = this.storage.buildKey(merchantId, input.entityType, input.entityId, id, input.fileName);
    await this.storage.adapter.putObject(storageKey, input.body, input.mimeType);
    const att = await this.prisma.db.attachment.create({
      data: {
        id, entityType: input.entityType, entityId: input.entityId, category: input.category, fileName: input.fileName, storageKey, mimeType: input.mimeType,
        size: input.body.length, status: 'READY', uploadedByType: actor.actorType, uploadedById: actor.actorId, uploadedByName: actor.actorName,
        sharedWithCustomer: input.sharedWithCustomer ?? false,
      } as any,
    });
    await this.logAttached(att);
    return att;
  }

  async list(entityType: EntityType, entityId: string, category?: AttachmentCategory | null) {
    await this.assertEntityAccess(entityType, entityId);
    const items = await this.prisma.db.attachment.findMany({
      where: { entityType, entityId, status: 'READY', ...(category ? { category } : {}) },
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(items.map((a) => this.view(a)));
  }

  /** Tất cả chứng từ của đơn + chuyến + điểm dừng + chi phí/phiếu thu gắn đơn. */
  async listForOrder(orderId: string) {
    const [trips, stops, expenses, incidents] = await Promise.all([
      this.prisma.db.trip.findMany({ where: { orderId }, select: { id: true } }),
      this.prisma.db.orderStop.findMany({ where: { orderId }, select: { id: true } }),
      this.prisma.db.expense.findMany({ where: { OR: [{ orderId }, { trip: { orderId } }] }, select: { id: true } }),
      this.prisma.db.incident.findMany({ where: { orderId }, select: { id: true } }),
    ]);
    const or = [
      { entityType: 'ORDER' as const, entityId: orderId },
      ...trips.map((t) => ({ entityType: 'TRIP' as const, entityId: t.id })),
      ...stops.map((s) => ({ entityType: 'ORDER_STOP' as const, entityId: s.id })),
      ...expenses.map((e) => ({ entityType: 'EXPENSE' as const, entityId: e.id })),
      ...incidents.map((i) => ({ entityType: 'INCIDENT' as const, entityId: i.id })),
    ];
    const items = await this.prisma.db.attachment.findMany({ where: { status: 'READY', OR: or }, orderBy: { createdAt: 'desc' } });
    return Promise.all(items.map((a) => this.view(a)));
  }

  async get(id: string) {
    const a = await this.prisma.db.attachment.findFirst({ where: { id } });
    if (!a || a.status === 'DELETED') throw notFound('chứng từ');
    await this.assertEntityAccess(a.entityType as EntityType, a.entityId);
    return this.view(a);
  }

  async downloadUrl(id: string, inline = true) {
    const a = await this.prisma.db.attachment.findFirst({ where: { id } });
    if (!a || a.status !== 'READY') throw notFound('chứng từ');
    await this.assertEntityAccess(a.entityType as EntityType, a.entityId);
    return this.storage.adapter.presignGet(a.storageKey, a.fileName, inline);
  }

  async delete(id: string, reason: string) {
    const r = assertSensitive('attachments.delete', reason);
    const a = await this.prisma.db.attachment.findFirst({ where: { id } });
    if (!a || a.status === 'DELETED') throw notFound('chứng từ');
    const updated = await this.prisma.db.attachment.update({ where: { id }, data: { status: 'DELETED', deletedAt: new Date(), deleteReason: r } });
    await this.audit.log({
      entityType: a.entityType as EntityType, entityId: a.entityId, parent: await this.parentOf(a.entityType as EntityType, a.entityId),
      category: 'SENSITIVE', sensitive: true, action: 'attachment.delete', summary: `Xóa chứng từ "${a.fileName}"`, reason: r, before: { fileName: a.fileName, category: a.category },
    });
    return this.view(updated);
  }

  async setShared(id: string, shared: boolean) {
    const a = await this.prisma.db.attachment.findFirst({ where: { id } });
    if (!a) throw notFound('chứng từ');
    const updated = await this.prisma.db.attachment.update({ where: { id }, data: { sharedWithCustomer: shared } });
    await this.audit.log({ entityType: a.entityType as EntityType, entityId: a.entityId, category: 'ATTACHMENT', action: 'attachment.share', summary: `${shared ? 'Chia sẻ' : 'Ngừng chia sẻ'} "${a.fileName}" cho khách` });
    return this.view(updated);
  }

  async view(a: any) {
    return { ...a, url: a.status === 'READY' ? await this.storage.adapter.presignGet(a.storageKey, a.fileName) : null };
  }

  async counts(entityType: EntityType, ids: string[]): Promise<Map<string, number>> {
    if (!ids.length) return new Map();
    const rows = await this.prisma.db.attachment.groupBy({ by: ['entityId'], where: { entityType, entityId: { in: ids }, status: 'READY' }, _count: true });
    return new Map(rows.map((r: any) => [r.entityId, r._count]));
  }
}
