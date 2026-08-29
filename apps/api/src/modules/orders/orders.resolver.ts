import { BadRequestException } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { HistoryEntity, OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Ctx, MerchantId } from '../auth/auth.guard';
import type { AuthContext } from '../auth/auth.types';
import { CreateOrderInput, OrderType } from './orders.types';

const orderInclude = {
  customer: { select: { name: true } },
  stops: { orderBy: { sequence: 'asc' as const } },
  cargoLines: true,
  addons: true,
  trips: {
    include: {
      vehicle: { select: { plateNumber: true } },
      driver: { select: { fullName: true } },
      pauseReason: { select: { name: true } },
      order: { select: { code: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
  expenses: { include: { category: { select: { name: true } } } },
  allocations: { include: { paymentIn: { select: { receivedDate: true, method: true } } } },
} satisfies Prisma.OrderInclude;

type OrderWithRels = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export function mapTrip(t: OrderWithRels['trips'][number]) {
  return {
    ...t,
    orderCode: t.order?.code,
    vehiclePlate: t.vehicle.plateNumber,
    driverName: t.driver.fullName,
    pauseReasonName: t.pauseReason?.name ?? null,
  };
}

@Resolver()
export class OrdersResolver {
  constructor(private prisma: PrismaService) {}

  private async toGql(merchantId: string, o: OrderWithRels): Promise<OrderType> {
    const totalAmount = o.price + o.addons.reduce((s, a) => s + a.amount, 0n);
    const paidAmount = o.allocations.reduce((s, a) => s + a.amount, 0n);
    const totalExpense = o.expenses.reduce((s, e) => s + e.amount, 0n);
    const overdue =
      o.dueDate && paidAmount < totalAmount && o.status !== 'CANCELLED'
        ? Math.max(0, Math.floor((Date.now() - o.dueDate.getTime()) / 86_400_000))
        : 0;
    const history = await this.prisma.statusHistory.findMany({
      where: { merchantId, entityType: HistoryEntity.ORDER, entityId: o.id },
      include: { byUser: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return {
      ...o,
      customerName: o.customer.name,
      totalAmount,
      paidAmount,
      overdueDays: overdue,
      tripCount: o.trips.length,
      trips: o.trips.map(mapTrip),
      expenses: o.expenses.map((e) => ({
        ...e,
        categoryName: e.category.name,
        paidByDriver: e.paidBy === 'DRIVER',
      })),
      allocations: o.allocations.map((a) => ({
        ...a,
        receivedDate: a.paymentIn.receivedDate,
        method: a.paymentIn.method,
      })),
      history: history.map((h) => ({ ...h, byUserName: h.byUser?.fullName ?? null })),
      profit: totalAmount - totalExpense,
    };
  }

  @Query(() => [OrderType])
  async orders(
    @MerchantId() merchantId: string,
    @Args('status', { type: () => OrderStatus, nullable: true }) status?: OrderStatus,
    @Args('search', { nullable: true }) search?: string,
  ) {
    const list = await this.prisma.order.findMany({
      where: {
        merchantId,
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { code: { contains: search, mode: 'insensitive' } },
                { customer: { name: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return Promise.all(list.map((o) => this.toGql(merchantId, o)));
  }

  @Query(() => OrderType)
  async order(@MerchantId() merchantId: string, @Args('id', { type: () => ID }) id: string) {
    const o = await this.prisma.order.findFirstOrThrow({
      where: { id, merchantId },
      include: orderInclude,
    });
    return this.toGql(merchantId, o);
  }

  @Mutation(() => OrderType)
  async createOrder(
    @MerchantId() merchantId: string,
    @Ctx() ctx: AuthContext,
    @Args('input') input: CreateOrderInput,
  ) {
    if (input.stops.length === 0) throw new BadRequestException('Đơn cần ít nhất 1 điểm');
    // Mã đơn theo merchant: DH-<năm>-<số thứ tự>
    const year = new Date().getFullYear();
    const count = await this.prisma.order.count({ where: { merchantId } });
    const code = `DH-${year}-${String(count + 1).padStart(4, '0')}`;

    const created = await this.prisma.order.create({
      data: {
        merchantId,
        code,
        customerId: input.customerId,
        price: input.price,
        dueDate: input.dueDate,
        notes: input.notes,
        createdById: ctx.user!.id,
        stops: {
          create: input.stops.map((s, i) => ({
            ...s,
            sequence: i + 1,
            codExpected: s.codExpected ?? 0n,
          })),
        },
        cargoLines: { create: input.cargoLines?.map((c) => ({ ...c, properties: c.properties ?? [] })) ?? [] },
        addons: { create: input.addons ?? [] },
      },
      include: orderInclude,
    });
    await this.prisma.statusHistory.create({
      data: {
        merchantId,
        entityType: HistoryEntity.ORDER,
        entityId: created.id,
        toStatus: created.status,
        byUserId: ctx.user!.id,
        reason: 'Tạo đơn',
      },
    });
    return this.toGql(merchantId, created);
  }

  /** Operation đổi status tự do, mọi thay đổi lưu history (docs/02 mục 4) */
  @Mutation(() => OrderType)
  async updateOrderStatus(
    @MerchantId() merchantId: string,
    @Ctx() ctx: AuthContext,
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => OrderStatus }) status: OrderStatus,
    @Args('reason', { nullable: true }) reason?: string,
  ) {
    const existing = await this.prisma.order.findFirstOrThrow({ where: { id, merchantId } });
    const o = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: orderInclude,
    });
    await this.prisma.statusHistory.create({
      data: {
        merchantId,
        entityType: HistoryEntity.ORDER,
        entityId: id,
        fromStatus: existing.status,
        toStatus: status,
        reason,
        byUserId: ctx.user!.id,
      },
    });
    return this.toGql(merchantId, o);
  }

  @Mutation(() => OrderType)
  async updateOrder(
    @MerchantId() merchantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('price', { type: () => BigInt, nullable: true }) price?: bigint,
    @Args('dueDate', { type: () => Date, nullable: true }) dueDate?: Date,
    @Args('notes', { nullable: true }) notes?: string,
  ) {
    await this.prisma.order.findFirstOrThrow({ where: { id, merchantId } });
    const o = await this.prisma.order.update({
      where: { id },
      data: {
        ...(price !== undefined ? { price } : {}),
        ...(dueDate !== undefined ? { dueDate } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      include: orderInclude,
    });
    return this.toGql(merchantId, o);
  }
}
