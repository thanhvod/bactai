import { Args, Field, Int, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { PaymentInKind } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MerchantId } from '../auth/auth.guard';
import { TripType } from '../orders/orders.types';

@ObjectType()
class DashboardStats {
  @Field(() => Int) runningTrips!: number;
  @Field(() => Int) ordersInProgress!: number;
  @Field(() => Int) ordersAwaitingDispatch!: number; // đã xác nhận chưa xếp xe
  @Field(() => Int) overdueOrders!: number;
  @Field(() => BigInt) totalReceivable!: bigint; // tổng khách còn nợ
  @Field(() => BigInt) overdueReceivable!: bigint;
  @Field(() => [TripType]) activeTrips!: TripType[];
}

@ObjectType()
class PnlByPeriod {
  @Field(() => BigInt) revenue!: bigint; // giá cước + addon của đơn tạo trong kỳ (loại CANCELLED)
  @Field(() => BigInt) collected!: bigint; // thực thu từ khách trong kỳ (loại DRIVER_COD_REMIT)
  @Field(() => BigInt) expense!: bigint; // tổng chi trong kỳ (loại ứng lương)
  @Field(() => BigInt) profit!: bigint; // revenue − expense
  @Field(() => Int) orderCount!: number;
  @Field(() => Int) tripCount!: number;
}

@Resolver()
export class ReportsResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => DashboardStats)
  async dashboard(@MerchantId() merchantId: string): Promise<DashboardStats> {
    const activeStatuses = ['TO_PICKUP', 'PICKING_UP', 'IN_TRANSIT', 'PAUSED', 'DELIVERING'] as const;
    const activeTrips = await this.prisma.trip.findMany({
      where: { merchantId, status: { in: activeStatuses as any } },
      include: {
        vehicle: { select: { plateNumber: true } },
        driver: { select: { fullName: true } },
        pauseReason: { select: { name: true } },
        order: { select: { code: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    const [ordersInProgress, ordersAwaitingDispatch] = await Promise.all([
      this.prisma.order.count({ where: { merchantId, status: 'IN_PROGRESS' } }),
      this.prisma.order.count({ where: { merchantId, status: { in: ['CONFIRMED', 'PENDING_CONFIRM'] } } }),
    ]);

    const orders = await this.prisma.order.findMany({
      where: { merchantId, status: { not: 'CANCELLED' } },
      include: { addons: { select: { amount: true } }, allocations: { select: { amount: true } } },
    });
    let totalReceivable = 0n;
    let overdueReceivable = 0n;
    let overdueOrders = 0;
    const now = Date.now();
    for (const o of orders) {
      const total = o.price + o.addons.reduce((s, a) => s + a.amount, 0n);
      const paid = o.allocations.reduce((s, a) => s + a.amount, 0n);
      const rest = total - paid;
      if (rest <= 0n) continue;
      totalReceivable += rest;
      if (o.dueDate && o.dueDate.getTime() < now) {
        overdueReceivable += rest;
        overdueOrders += 1;
      }
    }
    return {
      runningTrips: activeTrips.length,
      ordersInProgress,
      ordersAwaitingDispatch,
      overdueOrders,
      totalReceivable,
      overdueReceivable,
      activeTrips: activeTrips.map((t) => ({
        ...t,
        orderCode: t.order.code,
        vehiclePlate: t.vehicle.plateNumber,
        driverName: t.driver.fullName,
        pauseReasonName: t.pauseReason?.name ?? null,
      })),
    };
  }

  /** Báo cáo doanh thu / chi phí / lãi lỗ theo khoảng thời gian (docs/06 A7) */
  @Query(() => PnlByPeriod)
  async pnl(
    @MerchantId() merchantId: string,
    @Args('from', { type: () => Date }) from: Date,
    @Args('to', { type: () => Date }) to: Date,
  ): Promise<PnlByPeriod> {
    const orders = await this.prisma.order.findMany({
      where: { merchantId, status: { not: 'CANCELLED' }, createdAt: { gte: from, lte: to } },
      include: { addons: { select: { amount: true } } },
    });
    const revenue = orders.reduce(
      (s, o) => s + o.price + o.addons.reduce((x, a) => x + a.amount, 0n),
      0n,
    );
    // Thực thu: CHỈ phiếu thu khách — DRIVER_COD_REMIT là thu hồi phải thu (docs/04 mục 3.2)
    const collectedAgg = await this.prisma.paymentIn.aggregate({
      where: {
        merchantId,
        kind: PaymentInKind.CUSTOMER_PAYMENT,
        receivedDate: { gte: from, lte: to },
      },
      _sum: { amount: true },
    });
    // Chi: loại ứng lương (không phải chi phí vận hành, sẽ trừ vào lương)
    const expenseAgg = await this.prisma.expense.aggregate({
      where: { merchantId, isDriverAdvance: false, expenseDate: { gte: from, lte: to } },
      _sum: { amount: true },
    });
    const tripCount = await this.prisma.trip.count({
      where: { merchantId, status: { not: 'CANCELLED' }, createdAt: { gte: from, lte: to } },
    });
    const expense = expenseAgg._sum.amount ?? 0n;
    return {
      revenue,
      collected: collectedAgg._sum.amount ?? 0n,
      expense,
      profit: revenue - expense,
      orderCount: orders.length,
      tripCount,
    };
  }
}
