import { Injectable } from '@nestjs/common';
import { INCIDENT_SEVERITY, MIN_REASON_LENGTH, incidentSchema, labelOf, type IncidentInput as IncidentData } from '@bta/shared';
import { AuditService, diffFields } from '../../common/audit/audit.service';
import { currentActor, currentPrincipal } from '../../common/context/request-context';
import { businessRule, forbidden, notFound, reasonRequired, validationError } from '../../common/errors/app-error';
import { pageParams, toConnection } from '../../common/graphql/pagination';
import { NotifyService } from '../../common/notifications/notify.service';
import { NumberingService } from '../../common/numbering/numbering.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';
import { ActivityService } from '../activity/activity.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { CatalogsService } from '../catalogs/catalogs.service';
import { vnDayRange } from '../trips/dispatch-helpers';
import type { IncidentFilter, IncidentInput } from './incidents.types';

const INCLUDE = {
  order: { select: { code: true } },
  trip: { select: { code: true } },
  driver: { select: { name: true, phone: true } },
  vehicle: { select: { plate: true } },
  assignee: { select: { name: true } },
};

/** DIS-005 sự cố (tách khỏi trạng thái PAUSED). Export để App tài xế gọi create() với principal DRIVER. */
@Injectable()
export class IncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
    private readonly notify: NotifyService,
    private readonly catalogs: CatalogsService,
    private readonly attachments: AttachmentsService,
    private readonly activity: ActivityService,
  ) {}

  private async views(rows: any[]) {
    const labels = await this.catalogs.labels(rows.map((r) => r.typeId));
    return rows.map((r) => ({
      ...r, typeName: r.typeId ? labels.get(r.typeId) ?? null : null, orderCode: r.order?.code ?? null, tripCode: r.trip?.code ?? null,
      driverName: r.driver?.name ?? null, driverPhone: r.driver?.phone ?? null, vehiclePlate: r.vehicle?.plate ?? null, assigneeName: r.assignee?.name ?? null,
    }));
  }

  async list(filter: IncidentFilter = {}, page: { first?: number; after?: string | null }) {
    const where: any = {};
    const p = currentPrincipal();
    if (p?.type === 'DRIVER') where.OR = [{ driverId: p.driverId }, { trip: { driverId: p.driverId } }];
    if (filter.status?.length) where.status = { in: filter.status };
    if (filter.severity?.length) where.severity = { in: filter.severity };
    if (filter.typeId) where.typeId = filter.typeId;
    if (filter.assigneeId) where.assigneeUserId = filter.assigneeId;
    if (filter.orderId) where.orderId = filter.orderId;
    if (filter.tripId) where.tripId = filter.tripId;
    if (filter.dateFrom || filter.dateTo) {
      where.createdAt = {};
      if (filter.dateFrom) where.createdAt.gte = vnDayRange(filter.dateFrom).from;
      if (filter.dateTo) where.createdAt.lt = vnDayRange(filter.dateTo).to;
    }
    if (filter.search) where.AND = [{ OR: [{ code: { contains: filter.search, mode: 'insensitive' } }, { title: { contains: filter.search, mode: 'insensitive' } }] }];
    const { take, skip } = pageParams(page);
    const [rows, total] = await Promise.all([
      this.prisma.db.incident.findMany({ where, include: INCLUDE, orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], take, skip }),
      this.prisma.db.incident.count({ where }),
    ]);
    return toConnection(await this.views(rows), total, skip, take);
  }

  async get(id: string) {
    const p = currentPrincipal();
    const r = await this.prisma.db.incident.findFirst({ where: { id }, include: { ...INCLUDE, trip: { select: { code: true, driverId: true } } } });
    if (!r) throw notFound('sự cố');
    if (p?.type === 'DRIVER' && r.driverId !== p.driverId && r.trip?.driverId !== p.driverId) throw notFound('sự cố');
    const [view] = await this.views([r]);
    const [attachments, activity] = await Promise.all([
      this.prisma.db.attachment.findMany({ where: { entityType: 'INCIDENT', entityId: id, status: 'READY' }, orderBy: { createdAt: 'desc' } }).then((a) => Promise.all(a.map((x) => this.attachments.view(x)))),
      this.activity.timeline({ type: 'INCIDENT', id }, { includeChildren: false }),
    ]);
    return { ...view, attachments, activity };
  }

  /** Tạo sự cố. DRIVER: tripId bắt buộc và phải là chuyến của mình; tự lấy đơn/xe từ chuyến. */
  async create(input: IncidentInput) {
    const data = parse(incidentSchema, input);
    const p = currentPrincipal();
    let trip: any = null;
    if (data.tripId) {
      trip = await this.prisma.db.trip.findFirst({ where: { id: data.tripId }, select: { id: true, code: true, orderId: true, driverId: true, vehicleId: true } });
      if (!trip) throw notFound('chuyến');
    }
    if (p?.type === 'DRIVER') {
      if (!trip) throw validationError([{ field: 'tripId', message: 'Chọn chuyến gặp sự cố' }]);
      if (trip.driverId !== p.driverId) throw forbidden('Chuyến không được giao cho bạn');
    } else if (p?.type !== 'USER') throw forbidden();
    const orderId = trip?.orderId ?? data.orderId ?? null;
    if (orderId && !(await this.prisma.db.order.count({ where: { id: orderId } }))) throw notFound('đơn hàng');
    if (data.orderId && trip && trip.orderId !== data.orderId) throw validationError([{ field: 'orderId', message: 'Chuyến không thuộc đơn này' }]);
    if (data.typeId && !(await this.prisma.db.catalogItem.count({ where: { id: data.typeId, type: 'INCIDENT_TYPE' } }))) throw validationError([{ field: 'typeId', message: 'Loại sự cố không hợp lệ' }]);
    if (data.assigneeUserId) await this.assertAssignee(data.assigneeUserId);
    const actor = currentActor();
    const inc = await this.prisma.tx(async (tx) => {
      const code = await this.numbering.next('INCIDENT', tx);
      const created = await tx.incident.create({
        data: {
          code, typeId: data.typeId ?? null, title: data.title, severity: data.severity, description: data.description ?? null, orderId, tripId: trip?.id ?? null,
          stopId: data.stopId ?? null, driverId: trip?.driverId ?? (p?.type === 'DRIVER' ? p.driverId : null), vehicleId: trip?.vehicleId ?? null,
          location: data.location ?? null, reportedByType: actor.actorType, reportedById: actor.actorId, reportedByName: actor.actorName,
          assigneeUserId: data.assigneeUserId ?? null, status: data.status ?? 'OPEN',
        } as any,
      });
      // Ảnh đã upload trước (gắn tạm vào chuyến) → chuyển sang sự cố
      if (data.attachmentIds?.length) {
        await tx.attachment.updateMany({
          where: { id: { in: data.attachmentIds }, uploadedById: actor.actorId ?? undefined, entityType: { in: ['TRIP', 'ORDER_STOP', 'INCIDENT'] } },
          data: { entityType: 'INCIDENT', entityId: created.id, category: 'INCIDENT_PHOTO' },
        });
      }
      await this.audit.statusChange({ entityType: 'INCIDENT', entityId: created.id, from: null, to: created.status }, tx);
      await this.audit.log({
        entityType: 'INCIDENT', entityId: created.id, parent: orderId ? { type: 'ORDER', id: orderId } : undefined, category: 'CREATE', action: 'incident.create',
        summary: `Báo sự cố ${code}: ${data.title} (${labelOf(INCIDENT_SEVERITY, data.severity)})${trip ? ` · chuyến ${trip.code}` : ''}`, clientRequestId: data.clientRequestId,
      }, tx);
      return created;
    });
    await this.notify.toUsersWithPermission('incident.manage', {
      type: 'INCIDENT_NEW', title: `Sự cố mới ${inc.code}: ${inc.title}`, body: trip ? `Chuyến ${trip.code} · ${labelOf(INCIDENT_SEVERITY, inc.severity)}` : labelOf(INCIDENT_SEVERITY, inc.severity),
      entityType: 'INCIDENT', entityId: inc.id, severity: inc.severity === 'HIGH' || inc.severity === 'CRITICAL' ? 'danger' : 'warning',
    }, { exceptMembershipId: p?.type === 'USER' ? p.membershipId : null });
    if (data.assigneeUserId) await this.notifyAssignee(inc.id);
    return this.get(inc.id);
  }

  private async assertAssignee(userId: string) {
    const u = await this.prisma.db.merchantUser.findFirst({ where: { id: userId, status: 'ACTIVE' } });
    if (!u) throw validationError([{ field: 'assigneeUserId', message: 'Người xử lý không hợp lệ' }]);
    return u;
  }

  private async notifyAssignee(id: string) {
    const inc = await this.prisma.db.incident.findFirst({ where: { id } });
    if (!inc?.assigneeUserId) return;
    await this.notify.toRecipients([{ type: 'USER', id: inc.assigneeUserId }], { type: 'INCIDENT_ASSIGNED', title: `Bạn được giao xử lý sự cố ${inc.code}`, body: inc.title, entityType: 'INCIDENT', entityId: inc.id, severity: 'warning' });
  }

  async update(id: string, input: Partial<IncidentInput>) {
    const before = await this.prisma.db.incident.findFirst({ where: { id } });
    if (!before) throw notFound('sự cố');
    const data = parse(incidentSchema.partial(), input) as Partial<IncidentData>;
    if (data.status === 'RESOLVED' || data.status === 'CANCELLED') throw businessRule('Dùng thao tác Đóng/Hủy sự cố');
    if (data.assigneeUserId) await this.assertAssignee(data.assigneeUserId);
    const patch: any = {};
    for (const k of ['typeId', 'title', 'severity', 'description', 'location', 'assigneeUserId', 'status', 'stopId'] as const) if (data[k] !== undefined) patch[k] = data[k];
    await this.prisma.tx(async (tx) => {
      await tx.incident.update({ where: { id }, data: patch });
      const d = diffFields(before as any, patch);
      if (d.changed.includes('status')) await this.audit.statusChange({ entityType: 'INCIDENT', entityId: id, from: before.status, to: patch.status }, tx);
      if (d.changed.length) await this.audit.log({ entityType: 'INCIDENT', entityId: id, parent: before.orderId ? { type: 'ORDER', id: before.orderId } : undefined, category: 'UPDATE', action: 'incident.update', summary: `Cập nhật sự cố ${before.code} (${d.changed.join(', ')})`, before: d.before, after: d.after }, tx);
    });
    if (patch.assigneeUserId && patch.assigneeUserId !== before.assigneeUserId) await this.notifyAssignee(id);
    return this.get(id);
  }

  async assign(id: string, userId: string) {
    const inc = await this.prisma.db.incident.findFirst({ where: { id } });
    if (!inc) throw notFound('sự cố');
    const u = await this.assertAssignee(userId);
    await this.prisma.tx(async (tx) => {
      await tx.incident.update({ where: { id }, data: { assigneeUserId: userId, status: inc.status === 'OPEN' ? 'IN_PROGRESS' : inc.status } });
      if (inc.status === 'OPEN') await this.audit.statusChange({ entityType: 'INCIDENT', entityId: id, from: 'OPEN', to: 'IN_PROGRESS', note: `Giao ${u.name}` }, tx);
      await this.audit.log({ entityType: 'INCIDENT', entityId: id, parent: inc.orderId ? { type: 'ORDER', id: inc.orderId } : undefined, category: 'ASSIGNMENT', action: 'incident.assign', summary: `Giao xử lý sự cố ${inc.code} cho ${u.name}`, before: { assigneeUserId: inc.assigneeUserId }, after: { assigneeUserId: userId } }, tx);
    });
    await this.notifyAssignee(id);
    return this.get(id);
  }

  async close(id: string, note: string) {
    const n = (note ?? '').trim();
    if (n.length < MIN_REASON_LENGTH) throw validationError([{ field: 'note', message: `Ghi chú xử lý tối thiểu ${MIN_REASON_LENGTH} ký tự` }]);
    return this.finish(id, 'RESOLVED', n);
  }

  async cancel(id: string, reason: string) {
    const r = (reason ?? '').trim();
    if (r.length < MIN_REASON_LENGTH) throw reasonRequired();
    return this.finish(id, 'CANCELLED', r);
  }

  private async finish(id: string, status: 'RESOLVED' | 'CANCELLED', text: string) {
    const inc = await this.prisma.db.incident.findFirst({ where: { id } });
    if (!inc) throw notFound('sự cố');
    if (inc.status === 'RESOLVED' || inc.status === 'CANCELLED') throw businessRule('Sự cố đã đóng');
    await this.prisma.tx(async (tx) => {
      await tx.incident.update({ where: { id }, data: { status, resolvedNote: text, resolvedAt: new Date() } });
      await this.audit.statusChange({ entityType: 'INCIDENT', entityId: id, from: inc.status, to: status, reason: text }, tx);
      await this.audit.log({ entityType: 'INCIDENT', entityId: id, parent: inc.orderId ? { type: 'ORDER', id: inc.orderId } : undefined, category: 'STATUS', action: status === 'RESOLVED' ? 'incident.close' : 'incident.cancel', summary: `${status === 'RESOLVED' ? 'Đóng' : 'Hủy'} sự cố ${inc.code}`, reason: text }, tx);
    });
    return this.get(id);
  }
}
