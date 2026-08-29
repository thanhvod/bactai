import { Args, Field, ID, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { HistoryEntity, TripStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Ctx, MerchantId } from '../auth/auth.guard';
import type { AuthContext } from '../auth/auth.types';
import { TripType } from '../orders/orders.types';

const tripInclude = {
  vehicle: { select: { plateNumber: true } },
  driver: { select: { fullName: true } },
  pauseReason: { select: { name: true } },
  order: { select: { code: true } },
};

function mapTrip(t: any): TripType {
  return {
    ...t,
    orderCode: t.order?.code,
    vehiclePlate: t.vehicle.plateNumber,
    driverName: t.driver.fullName,
    pauseReasonName: t.pauseReason?.name ?? null,
  };
}

@ObjectType()
class DispatchWarning {
  @Field() target!: string; // 'VEHICLE' | 'DRIVER'
  @Field() kind!: string; // 'OVERLAP' | 'NEAR'
  @Field() tripId!: string;
  @Field() orderCode!: string;
  @Field(() => Date, { nullable: true }) plannedStartAt?: Date | null;
  @Field(() => Date, { nullable: true }) plannedEndAt?: Date | null;
}

@Resolver()
export class TripsResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [TripType])
  async trips(
    @MerchantId() merchantId: string,
    @Args('status', { type: () => TripStatus, nullable: true }) status?: TripStatus,
  ) {
    const list = await this.prisma.trip.findMany({
      where: { merchantId, ...(status ? { status } : {}) },
      include: tripInclude,
      orderBy: [{ plannedStartAt: 'desc' }, { createdAt: 'desc' }],
      take: 200,
    });
    return list.map(mapTrip);
  }

  /**
   * Cảnh báo trùng / GẦN trùng lịch cho xe + tài xế (docs/05 mục 2).
   * Warning mềm — không chặn; ngưỡng "gần" = Merchant.scheduleWarnHours.
   */
  @Query(() => [DispatchWarning])
  async dispatchWarnings(
    @MerchantId() merchantId: string,
    @Args('vehicleId', { type: () => ID }) vehicleId: string,
    @Args('driverId', { type: () => ID }) driverId: string,
    @Args('plannedStartAt', { type: () => Date }) start: Date,
    @Args('plannedEndAt', { type: () => Date, nullable: true }) end?: Date,
    @Args('excludeTripId', { type: () => ID, nullable: true }) excludeTripId?: string,
  ): Promise<DispatchWarning[]> {
    const merchant = await this.prisma.merchant.findUniqueOrThrow({ where: { id: merchantId } });
    const warnMs = merchant.scheduleWarnHours * 3_600_000;
    const s = start.getTime();
    const e = (end ?? start).getTime();

    const candidates = await this.prisma.trip.findMany({
      where: {
        merchantId,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        ...(excludeTripId ? { id: { not: excludeTripId } } : {}),
        OR: [{ vehicleId }, { driverId }],
        plannedStartAt: { not: null },
      },
      include: { order: { select: { code: true } } },
    });

    const warnings: DispatchWarning[] = [];
    for (const t of candidates) {
      const ts = t.plannedStartAt!.getTime();
      const te = (t.plannedEndAt ?? t.plannedStartAt!).getTime();
      const overlap = s <= te && ts <= e;
      const near = !overlap && (Math.abs(ts - e) <= warnMs || Math.abs(s - te) <= warnMs);
      if (!overlap && !near) continue;
      const kind = overlap ? 'OVERLAP' : 'NEAR';
      if (t.vehicleId === vehicleId) {
        warnings.push({ target: 'VEHICLE', kind, tripId: t.id, orderCode: t.order.code, plannedStartAt: t.plannedStartAt, plannedEndAt: t.plannedEndAt });
      }
      if (t.driverId === driverId) {
        warnings.push({ target: 'DRIVER', kind, tripId: t.id, orderCode: t.order.code, plannedStartAt: t.plannedStartAt, plannedEndAt: t.plannedEndAt });
      }
    }
    return warnings;
  }

  /** Gán xe + tài xế cho đơn — mặc định trip phụ trách tất cả stop (docs/07) */
  @Mutation(() => TripType)
  async createTrip(
    @MerchantId() merchantId: string,
    @Ctx() ctx: AuthContext,
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('vehicleId', { type: () => ID }) vehicleId: string,
    @Args('driverId', { type: () => ID }) driverId: string,
    @Args('plannedStartAt', { type: () => Date, nullable: true }) plannedStartAt?: Date,
    @Args('plannedEndAt', { type: () => Date, nullable: true }) plannedEndAt?: Date,
    @Args('notes', { nullable: true }) notes?: string,
  ) {
    const order = await this.prisma.order.findFirstOrThrow({
      where: { id: orderId, merchantId },
      include: { stops: true },
    });
    await this.prisma.vehicle.findFirstOrThrow({ where: { id: vehicleId, merchantId } });
    await this.prisma.driver.findFirstOrThrow({ where: { id: driverId, merchantId } });

    const t = await this.prisma.trip.create({
      data: {
        merchantId,
        orderId,
        vehicleId,
        driverId,
        plannedStartAt,
        plannedEndAt,
        notes,
        stopAssigns: { create: order.stops.map((st) => ({ orderStopId: st.id })) },
      },
      include: tripInclude,
    });
    await this.prisma.statusHistory.create({
      data: {
        merchantId, entityType: HistoryEntity.TRIP, entityId: t.id,
        toStatus: t.status, byUserId: ctx.user!.id, reason: 'Tạo chuyến',
      },
    });
    // Đơn đã gán đủ xe → chuyển ASSIGNED nếu đang ở trạng thái trước đó
    if (order.status === 'CONFIRMED' || order.status === 'DRAFT' || order.status === 'PENDING_CONFIRM') {
      await this.prisma.order.update({ where: { id: orderId }, data: { status: 'ASSIGNED' } });
      await this.prisma.statusHistory.create({
        data: {
          merchantId, entityType: HistoryEntity.ORDER, entityId: orderId,
          fromStatus: order.status, toStatus: 'ASSIGNED', byUserId: ctx.user!.id, reason: 'Xếp xe',
        },
      });
    }
    return mapTrip(t);
  }

  @Mutation(() => TripType)
  async updateTripStatus(
    @MerchantId() merchantId: string,
    @Ctx() ctx: AuthContext,
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => TripStatus }) status: TripStatus,
    @Args('pauseReasonId', { type: () => ID, nullable: true }) pauseReasonId?: string,
    @Args('pauseNote', { nullable: true }) pauseNote?: string,
    @Args('reason', { nullable: true }) reason?: string,
  ) {
    const existing = await this.prisma.trip.findFirstOrThrow({ where: { id, merchantId } });
    const t = await this.prisma.trip.update({
      where: { id },
      data: {
        status,
        pauseReasonId: status === 'PAUSED' ? pauseReasonId : null,
        pauseNote: status === 'PAUSED' ? pauseNote : null,
        ...(status === 'TO_PICKUP' && !existing.actualStartAt ? { actualStartAt: new Date() } : {}),
        ...(status === 'COMPLETED' ? { actualEndAt: new Date() } : {}),
      },
      include: tripInclude,
    });
    await this.prisma.statusHistory.create({
      data: {
        merchantId, entityType: HistoryEntity.TRIP, entityId: id,
        fromStatus: existing.status, toStatus: status,
        reason: reason ?? pauseNote, byUserId: ctx.user!.id,
      },
    });
    // Chuyến đầu tiên chạy → đơn IN_PROGRESS; tất cả chuyến xong → COMPLETED (soft, operation sửa được)
    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: existing.orderId },
      include: { trips: true },
    });
    let newOrderStatus: typeof order.status | null = null;
    if (status !== 'SCHEDULED' && status !== 'CANCELLED' && order.status === 'ASSIGNED') {
      newOrderStatus = 'IN_PROGRESS';
    }
    const active = order.trips.filter((x) => x.status !== 'CANCELLED');
    if (active.length > 0 && active.every((x) => x.status === 'COMPLETED')) {
      newOrderStatus = 'COMPLETED';
    }
    if (newOrderStatus && newOrderStatus !== order.status) {
      await this.prisma.order.update({ where: { id: order.id }, data: { status: newOrderStatus } });
      await this.prisma.statusHistory.create({
        data: {
          merchantId, entityType: HistoryEntity.ORDER, entityId: order.id,
          fromStatus: order.status, toStatus: newOrderStatus,
          byUserId: ctx.user!.id, reason: 'Tự động theo trạng thái chuyến',
        },
      });
    }
    return mapTrip(t);
  }

  /** Thưởng tài xế theo đơn — operation điền tay (docs/04 mục 1) */
  @Mutation(() => TripType)
  async setTripBonus(
    @MerchantId() merchantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('driverBonus', { type: () => BigInt }) driverBonus: bigint,
  ) {
    await this.prisma.trip.findFirstOrThrow({ where: { id, merchantId } });
    const t = await this.prisma.trip.update({
      where: { id },
      data: { driverBonus },
      include: tripInclude,
    });
    return mapTrip(t);
  }
}
