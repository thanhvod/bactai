import { Injectable } from '@nestjs/common';
import { ORDER_STATUS_FLOW, TRIP_RUNNING_STATUSES, type OrderStatus } from '@bta/shared';
import { currentActor } from '../../common/context/request-context';
import { PrismaService, type DbClient } from '../../common/prisma/prisma.service';

/**
 * Đồng bộ trạng thái đơn theo chuyến/điểm dừng — CHỈ tiến lên, không tự lùi (operation vẫn sửa tay được).
 *  - DISPATCHED: đơn ≥ CONFIRMED và mọi điểm dừng đã có chuyến (không hủy) có xe + tài xế hoặc thuê ngoài.
 *  - IN_PROGRESS: ≥1 chuyến đang chạy/đã xong.
 *  - COMPLETED: có chuyến, mọi chuyến không hủy đã hoàn thành, mọi điểm dừng COMPLETED/SKIPPED.
 * Lịch sử ghi actorType SYSTEM (metadata.triggeredBy = người/tài xế gây ra thay đổi).
 */
@Injectable()
export class OrderSyncService {
  constructor(private readonly prisma: PrismaService) {}

  async sync(orderId: string, tx?: DbClient): Promise<OrderStatus> {
    const db = (tx ?? this.prisma.db) as any;
    const order = await db.order.findFirst({
      where: { id: orderId },
      include: {
        stops: { select: { id: true, status: true } },
        trips: { where: { status: { not: 'CANCELLED' } }, select: { id: true, status: true, vehicleId: true, driverId: true, isExternal: true, stopAssignments: { select: { stopId: true } } } },
      },
    });
    if (!order || order.status === 'CANCELLED') return order?.status ?? 'CANCELLED';
    const current = order.status as OrderStatus;
    const idx = (s: OrderStatus) => ORDER_STATUS_FLOW.indexOf(s);
    let target: OrderStatus | null = null;

    const trips = order.trips as any[];
    const stopsDone = order.stops.length > 0 && order.stops.every((s: any) => s.status === 'COMPLETED' || s.status === 'SKIPPED');
    if (trips.length && trips.every((t) => t.status === 'COMPLETED') && stopsDone) target = 'COMPLETED';
    else if (trips.some((t) => TRIP_RUNNING_STATUSES.includes(t.status) || t.status === 'COMPLETED')) target = 'IN_PROGRESS';
    else if (idx(current) >= idx('CONFIRMED')) {
      const covered = new Set<string>();
      for (const t of trips) if (t.isExternal || (t.vehicleId && t.driverId)) for (const a of t.stopAssignments) covered.add(a.stopId);
      if (order.stops.length && order.stops.every((s: any) => covered.has(s.id))) target = 'DISPATCHED';
    }
    if (!target || idx(target) <= idx(current)) return current;

    const now = new Date();
    const data: Record<string, unknown> = { status: target };
    if (target === 'IN_PROGRESS' && !order.startedAt) data.startedAt = now;
    if (target === 'COMPLETED') {
      data.completedAt = now;
      if (!order.startedAt) data.startedAt = now;
    }
    await db.order.update({ where: { id: orderId }, data });
    const trigger = currentActor();
    await db.statusHistory.create({
      data: {
        merchantId: order.merchantId, entityType: 'ORDER', entityId: orderId, fromStatus: current, toStatus: target,
        actorType: 'SYSTEM', actorName: 'Hệ thống', note: 'Tự động theo trạng thái chuyến',
        metadata: { triggeredBy: trigger.actorName, triggeredByType: trigger.actorType },
      },
    });
    return target;
  }
}
