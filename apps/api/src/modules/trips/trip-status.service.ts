import { Injectable } from '@nestjs/common';
import {
  MIN_REASON_LENGTH,
  STOP_STATUS,
  STOP_STATUS_FLOW,
  TRIP_CLOSED_STATUSES,
  TRIP_RUNNING_STATUSES,
  TRIP_STATUS,
  TRIP_STATUS_FLOW,
  formatVnd,
  isReverseTransition,
  labelOf,
  type StopStatus,
  type TripStatus,
} from '@bta/shared';
import { big, num } from '@bta/db';
import { AuditService } from '../../common/audit/audit.service';
import { assertSensitive } from '../../common/auth/sensitive';
import { currentPrincipal } from '../../common/context/request-context';
import { businessRule, forbidden, notFound, reasonRequired, validationError } from '../../common/errors/app-error';
import { PrismaService, type Tx } from '../../common/prisma/prisma.service';
import { OrderSyncService } from './order-sync.service';

export type StatusActor = 'WEB' | 'DRIVER';

export interface TripStatusInput {
  tripId: string;
  status: TripStatus;
  reason?: string | null;
  note?: string | null;
  pauseReasonId?: string | null;
  actualAt?: Date | null;
  clientRequestId?: string | null;
}

export interface StopStatusInput {
  stopId: string;
  status: StopStatus;
  reason?: string | null;
  note?: string | null;
  /** Chuyến thực hiện (tài xế gửi kèm; web có thể bỏ trống) */
  tripId?: string | null;
  actualAt?: Date | null;
  clientRequestId?: string | null;
}

export interface CodInput {
  stopId: string;
  amount: number;
  reason?: string | null;
  note?: string | null;
  clientRequestId?: string | null;
}

/** Gợi ý trạng thái kế tiếp hợp lệ cho UI (web vẫn đổi tự do được theo quyền). */
export function allowedNextTripStatuses(status: TripStatus, previous?: TripStatus | null): TripStatus[] {
  if (status === 'PAUSED') return [previous ?? 'IN_TRANSIT'];
  if (TRIP_CLOSED_STATUSES.includes(status)) return [];
  const i = TRIP_STATUS_FLOW.indexOf(status);
  const next: TripStatus[] = [];
  if (i >= 0 && i < TRIP_STATUS_FLOW.length - 1) next.push(TRIP_STATUS_FLOW[i + 1]);
  if (status === 'DELIVERING') next.push('IN_TRANSIT');
  if (TRIP_RUNNING_STATUSES.includes(status)) next.push('PAUSED');
  return next;
}

/**
 * DIS-004: đổi trạng thái chuyến / điểm dừng / COD thực thu. Dùng chung cho Web (actor WEB) và App tài xế (actor DRIVER).
 *  - WEB: resolver đã kiểm tra trip.status.update; đổi ngược → status.reverse + lý do; hủy → trip.cancel + lý do; sửa COD đã lưu → cod.update + lý do.
 *  - DRIVER: phải là tài xế của chuyến; không được hủy/đổi ngược; sửa COD đã lưu cần lý do.
 */
@Injectable()
export class TripStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly orderSync: OrderSyncService,
  ) {}

  private driverId(actor: StatusActor): string | null {
    if (actor !== 'DRIVER') return null;
    const p = currentPrincipal();
    if (p?.type !== 'DRIVER') throw forbidden();
    return p.driverId;
  }

  private requireReason(reason: string | null | undefined): string {
    const r = (reason ?? '').trim();
    if (r.length < MIN_REASON_LENGTH) throw reasonRequired();
    return r;
  }

  async changeTripStatus(input: TripStatusInput, actor: StatusActor) {
    const driverId = this.driverId(actor);
    const trip = await this.prisma.db.trip.findFirst({ where: { id: input.tripId } });
    if (!trip) throw notFound('chuyến');
    if (driverId && trip.driverId !== driverId) throw forbidden('Chuyến không được giao cho bạn');
    if (!TRIP_STATUS[input.status]) throw validationError([{ field: 'status', message: 'Trạng thái không hợp lệ' }]);
    const from = trip.status as TripStatus;
    const to = input.status;
    if (from === to) return trip;

    if (to === 'CANCELLED') {
      if (actor === 'DRIVER') throw forbidden('Tài xế không được hủy chuyến, vui lòng báo điều phối');
      return this.cancelTrip(trip.id, input.reason ?? '');
    }
    if (to === 'PAUSED' && from !== 'PAUSED') return this.pause(trip, input, actor);
    if (from === 'PAUSED') {
      // tiếp tục: về trạng thái trước (hoặc trạng thái chỉ định)
      return this.applyTrip(trip, to, input, actor, { resume: true });
    }

    let reason = (input.reason ?? '').trim() || null;
    let sensitive = false;
    const reverse = from === 'CANCELLED' || isReverseTransition(TRIP_STATUS_FLOW, from, to);
    if (reverse) {
      if (actor === 'DRIVER') throw forbidden('Tài xế không được lùi trạng thái, vui lòng báo điều phối');
      reason = assertSensitive('status.reverse', input.reason);
      sensitive = true;
    }
    return this.applyTrip(trip, to, { ...input, reason }, actor, { sensitive });
  }

  private async pause(trip: any, input: TripStatusInput, actor: StatusActor) {
    if (TRIP_CLOSED_STATUSES.includes(trip.status)) throw businessRule('Chuyến đã kết thúc, không thể tạm dừng');
    if (!input.pauseReasonId) throw validationError([{ field: 'pauseReasonId', message: 'Chọn lý do tạm dừng' }]);
    const reason = await this.prisma.db.catalogItem.findFirst({ where: { id: input.pauseReasonId, type: 'PAUSE_REASON' } });
    if (!reason) throw validationError([{ field: 'pauseReasonId', message: 'Lý do tạm dừng không hợp lệ' }]);
    return this.prisma.tx(async (tx) => {
      const updated = await tx.trip.update({
        where: { id: trip.id },
        data: {
          status: 'PAUSED', previousStatusBeforePause: trip.status, pausedAt: input.actualAt ?? new Date(), pausedReasonId: reason.id,
          pauseNote: input.note ?? null, resumedAt: null, actualStartAt: trip.actualStartAt ?? (trip.status === 'SCHEDULED' ? new Date() : undefined),
        },
      });
      await this.audit.statusChange({ entityType: 'TRIP', entityId: trip.id, from: trip.status, to: 'PAUSED', reason: reason.name, note: input.note, metadata: { pauseReasonId: reason.id, actor, clientRequestId: input.clientRequestId } }, tx);
      await this.orderSync.sync(trip.orderId, tx);
      return updated;
    });
  }

  async resumeTrip(tripId: string, actor: StatusActor, note?: string | null) {
    const trip = await this.prisma.db.trip.findFirst({ where: { id: tripId } });
    if (!trip) throw notFound('chuyến');
    if (trip.status !== 'PAUSED') throw businessRule('Chuyến không ở trạng thái tạm dừng');
    return this.changeTripStatus({ tripId, status: (trip.previousStatusBeforePause as TripStatus) ?? 'IN_TRANSIT', note }, actor);
  }

  private async applyTrip(trip: any, to: TripStatus, input: TripStatusInput, actor: StatusActor, opts: { sensitive?: boolean; resume?: boolean }) {
    const driverId = this.driverId(actor);
    if (driverId && trip.driverId !== driverId) throw forbidden();
    const at = input.actualAt ?? new Date();
    return this.prisma.tx(async (tx) => {
      const data: Record<string, unknown> = { status: to };
      if (!trip.actualStartAt && to !== 'SCHEDULED') data.actualStartAt = at;
      if (to === 'COMPLETED') data.actualEndAt = at;
      else if (trip.actualEndAt) data.actualEndAt = null;
      if (to === 'SCHEDULED') data.actualStartAt = null;
      if (opts.resume) Object.assign(data, { resumedAt: at, previousStatusBeforePause: null, pausedReasonId: null, pauseNote: null });
      if (trip.status === 'CANCELLED') data.cancelReason = null;
      const updated = await tx.trip.update({ where: { id: trip.id }, data });
      await this.audit.statusChange(
        { entityType: 'TRIP', entityId: trip.id, from: trip.status, to, reason: input.reason, note: input.note ?? (opts.resume ? 'Tiếp tục chuyến' : null), metadata: { actor, clientRequestId: input.clientRequestId } },
        tx,
      );
      if (opts.sensitive) {
        await this.audit.log({
          entityType: 'TRIP', entityId: trip.id, parent: { type: 'ORDER', id: trip.orderId }, category: 'SENSITIVE', sensitive: true, action: 'trip.status.reverse',
          summary: `Đổi ngược trạng thái chuyến ${trip.code}: ${labelOf(TRIP_STATUS, trip.status)} → ${labelOf(TRIP_STATUS, to)}`,
          reason: input.reason, before: { status: trip.status }, after: { status: to },
        }, tx);
      }
      if (to === 'COMPLETED') await this.closeAssignments(tx, trip.id, at);
      await this.orderSync.sync(trip.orderId, tx);
      return updated;
    });
  }

  /** Hoàn thành chuyến: đánh dấu hoàn thành phân công điểm còn mở của chuyến (không đổi trạng thái stop). */
  private async closeAssignments(tx: Tx, tripId: string, at: Date) {
    await tx.tripStopAssignment.updateMany({ where: { tripId, completedAt: null, stop: { status: { in: ['COMPLETED', 'SKIPPED'] } } }, data: { completedAt: at } });
  }

  async cancelTrip(tripId: string, reason: string) {
    const r = assertSensitive('trip.cancel', reason);
    const trip = await this.prisma.db.trip.findFirst({ where: { id: tripId } });
    if (!trip) throw notFound('chuyến');
    if (trip.status === 'CANCELLED') return trip;
    if (trip.status === 'COMPLETED') throw businessRule('Chuyến đã hoàn thành — dùng đổi ngược trạng thái nếu cần');
    return this.prisma.tx(async (tx) => {
      const updated = await this.cancelTripTx(tx, trip, r);
      await this.orderSync.sync(trip.orderId, tx);
      return updated;
    });
  }

  /** Dùng chung cho hủy chuyến lẻ và hủy đơn (hủy các chuyến con). */
  async cancelTripTx(tx: Tx, trip: { id: string; code: string; status: string; orderId: string }, reason: string) {
    const updated = await tx.trip.update({ where: { id: trip.id }, data: { status: 'CANCELLED', cancelReason: reason } });
    await tx.scheduleWarning.updateMany({ where: { tripId: trip.id, resolvedAt: null }, data: { resolvedAt: new Date() } });
    await this.audit.statusChange({ entityType: 'TRIP', entityId: trip.id, from: trip.status, to: 'CANCELLED', reason }, tx);
    await this.audit.log({
      entityType: 'TRIP', entityId: trip.id, parent: { type: 'ORDER', id: trip.orderId }, category: 'SENSITIVE', sensitive: true, action: 'trip.cancel',
      summary: `Hủy chuyến ${trip.code}`, reason, before: { status: trip.status }, after: { status: 'CANCELLED' },
    }, tx);
    return updated;
  }

  // ---------------- Điểm dừng ----------------

  private async loadStopForActor(stopId: string, actor: StatusActor, tripId?: string | null) {
    const driverId = this.driverId(actor);
    const stop = await this.prisma.db.orderStop.findFirst({
      where: { id: stopId },
      include: { assignments: { include: { trip: { select: { id: true, code: true, driverId: true, status: true } } } }, order: { select: { id: true, code: true, status: true } } },
    });
    if (!stop) throw notFound('điểm dừng');
    if (driverId && !stop.assignments.some((a) => a.trip.driverId === driverId && a.trip.status !== 'CANCELLED' && (!tripId || a.trip.id === tripId))) {
      throw forbidden('Điểm dừng không thuộc chuyến của bạn');
    }
    if (stop.order.status === 'CANCELLED') throw businessRule('Đơn đã hủy');
    return stop;
  }

  async changeStopStatus(input: StopStatusInput, actor: StatusActor) {
    if (!STOP_STATUS[input.status]) throw validationError([{ field: 'status', message: 'Trạng thái không hợp lệ' }]);
    const stop = await this.loadStopForActor(input.stopId, actor, input.tripId);
    const from = stop.status as StopStatus;
    const to = input.status;
    if (from === to) return this.stopResult(stop.id, []);
    let reason = (input.reason ?? '').trim() || null;
    let sensitive = false;
    if (to === 'SKIPPED') reason = this.requireReason(input.reason);
    const reverse = from === 'SKIPPED' || isReverseTransition(STOP_STATUS_FLOW, from, to);
    if (reverse) {
      if (actor === 'DRIVER') throw forbidden('Tài xế không được lùi trạng thái điểm dừng, vui lòng báo điều phối');
      reason = assertSensitive('status.reverse', input.reason);
      sensitive = true;
    }
    const at = input.actualAt ?? new Date();
    const warnings: string[] = [];
    if (to === 'COMPLETED' && stop.type === 'DROPOFF') {
      if (stop.codExpected && num(stop.codExpected) > 0 && stop.codActual === null) warnings.push('Điểm có COD dự kiến nhưng chưa nhập COD thực thu');
      const pod = await this.prisma.db.attachment.count({ where: { entityType: 'ORDER_STOP', entityId: stop.id, category: 'POD', status: 'READY' } });
      if (!pod) warnings.push('Điểm trả chưa có ảnh POD');
    }
    await this.prisma.tx(async (tx) => {
      const data: Record<string, unknown> = { status: to };
      if (to === 'ARRIVED') data.arrivedAt = stop.arrivedAt ?? at;
      if (to === 'COMPLETED') {
        data.completedAt = at;
        if (!stop.arrivedAt) data.arrivedAt = at;
      }
      if (to === 'SKIPPED') data.skipReason = reason;
      if (to === 'NOT_ARRIVED') Object.assign(data, { arrivedAt: null, completedAt: null });
      if (from === 'SKIPPED') data.skipReason = null;
      if (to === 'ARRIVED' && from === 'COMPLETED') data.completedAt = null;
      await tx.orderStop.update({ where: { id: stop.id }, data });
      const assignmentWhere = { stopId: stop.id, ...(input.tripId ? { tripId: input.tripId } : {}), trip: { status: { not: 'CANCELLED' as const } } };
      if (to === 'ARRIVED') await tx.tripStopAssignment.updateMany({ where: { ...assignmentWhere, arrivedAt: null }, data: { arrivedAt: at } });
      if (to === 'COMPLETED' || to === 'SKIPPED') await tx.tripStopAssignment.updateMany({ where: assignmentWhere, data: { completedAt: at } });
      if (to === 'NOT_ARRIVED') await tx.tripStopAssignment.updateMany({ where: assignmentWhere, data: { arrivedAt: null, completedAt: null } });
      await this.audit.statusChange({ entityType: 'ORDER_STOP', entityId: stop.id, from, to, reason, note: input.note, metadata: { actor, tripId: input.tripId, clientRequestId: input.clientRequestId } }, tx);
      if (sensitive) {
        await this.audit.log({
          entityType: 'ORDER_STOP', entityId: stop.id, parent: { type: 'ORDER', id: stop.orderId }, category: 'SENSITIVE', sensitive: true, action: 'stop.status.reverse',
          summary: `Đổi ngược trạng thái điểm ${stop.sequence} đơn ${stop.order.code}: ${labelOf(STOP_STATUS, from)} → ${labelOf(STOP_STATUS, to)}`,
          reason, before: { status: from }, after: { status: to },
        }, tx);
      }
      await this.orderSync.sync(stop.orderId, tx);
    });
    return this.stopResult(stop.id, warnings);
  }

  /** COD thực thu tại điểm (nhập lần đầu không cần lý do; sửa sau khi lưu cần quyền/lý do). */
  async setStopCod(input: CodInput, actor: StatusActor) {
    if (!Number.isSafeInteger(input.amount) || input.amount < 0) throw validationError([{ field: 'amount', message: 'Số tiền phải là số nguyên VND ≥ 0' }]);
    const stop = await this.loadStopForActor(input.stopId, actor);
    const before = stop.codActual === null ? null : num(stop.codActual);
    if (before === input.amount && stop.codActual !== null) return this.stopResult(stop.id, []);
    const isEdit = before !== null;
    let reason = (input.reason ?? '').trim() || null;
    if (isEdit) reason = actor === 'WEB' ? assertSensitive('cod.update', input.reason) : this.requireReason(input.reason);
    const warnings: string[] = [];
    const expected = stop.codExpected === null ? null : num(stop.codExpected);
    if (expected !== null && expected !== input.amount) warnings.push(`COD thực thu ${formatVnd(input.amount)} khác dự kiến ${formatVnd(expected)}`);
    await this.prisma.tx(async (tx) => {
      await tx.orderStop.update({
        where: { id: stop.id },
        data: { codActual: big(input.amount), codCollectedAt: stop.codCollectedAt ?? new Date(), codNote: input.note ?? stop.codNote },
      });
      await this.audit.log({
        entityType: 'ORDER_STOP', entityId: stop.id, parent: { type: 'ORDER', id: stop.orderId },
        category: isEdit ? 'SENSITIVE' : 'MONEY', sensitive: isEdit, action: isEdit ? 'cod.update' : 'cod.submit',
        summary: isEdit
          ? `Sửa COD thực thu điểm ${stop.sequence} đơn ${stop.order.code}: ${formatVnd(before)} → ${formatVnd(input.amount)}`
          : `Nhập COD thực thu ${formatVnd(input.amount)} tại điểm ${stop.sequence} đơn ${stop.order.code}`,
        reason: reason ?? input.note ?? null, before: isEdit ? { codActual: before } : undefined, after: { codActual: input.amount },
        clientRequestId: input.clientRequestId, metadata: { actor, codExpected: expected },
      }, tx);
    });
    return this.stopResult(stop.id, warnings);
  }

  async stopResult(stopId: string, warnings: string[]) {
    const s = await this.prisma.db.orderStop.findFirstOrThrow({ where: { id: stopId }, include: { order: { select: { status: true } } } });
    return {
      id: s.id, orderId: s.orderId, status: s.status, arrivedAt: s.arrivedAt, completedAt: s.completedAt,
      codExpected: s.codExpected === null ? null : num(s.codExpected), codActual: s.codActual === null ? null : num(s.codActual),
      codCollectedAt: s.codCollectedAt, skipReason: s.skipReason, orderStatus: s.order.status, warnings,
    };
  }
}
