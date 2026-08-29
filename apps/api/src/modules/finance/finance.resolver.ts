import { BadRequestException } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PaymentInKind } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Ctx, MerchantId } from '../auth/auth.guard';
import type { AuthContext } from '../auth/auth.types';
import {
  AllocationInput,
  ExpenseInput,
  ExpenseType,
  PaymentInInput,
  PaymentInType,
  ReceivableRow,
} from './finance.types';

const expenseInclude = {
  category: { select: { name: true } },
  supplier: { select: { name: true } },
  order: { select: { code: true } },
  vehicle: { select: { plateNumber: true } },
  driver: { select: { fullName: true } },
};

function mapExpense(e: any): ExpenseType {
  return {
    ...e,
    categoryName: e.category.name,
    supplierName: e.supplier?.name ?? null,
    orderCode: e.order?.code ?? null,
    vehiclePlate: e.vehicle?.plateNumber ?? null,
    driverName: e.driver?.fullName ?? null,
  };
}

const paymentInclude = {
  customer: { select: { name: true } },
  driver: { select: { fullName: true } },
  allocations: { select: { amount: true } },
};

function mapPayment(p: any): PaymentInType {
  return {
    ...p,
    customerName: p.customer?.name ?? null,
    driverName: p.driver?.fullName ?? null,
    allocatedAmount: p.allocations.reduce((s: bigint, a: any) => s + a.amount, 0n),
  };
}

@Resolver()
export class FinanceResolver {
  constructor(private prisma: PrismaService) {}

  // ===== Phiếu chi =====

  @Query(() => [ExpenseType])
  async expenses(
    @MerchantId() merchantId: string,
    @Args('supplierId', { type: () => ID, nullable: true }) supplierId?: string,
    @Args('driverId', { type: () => ID, nullable: true }) driverId?: string,
    @Args('vehicleId', { type: () => ID, nullable: true }) vehicleId?: string,
    @Args('orderId', { type: () => ID, nullable: true }) orderId?: string,
    @Args('unpaidOnly', { nullable: true }) unpaidOnly?: boolean,
  ) {
    const list = await this.prisma.expense.findMany({
      where: {
        merchantId,
        ...(supplierId ? { supplierId } : {}),
        ...(driverId ? { driverId } : {}),
        ...(vehicleId ? { vehicleId } : {}),
        ...(orderId ? { orderId } : {}),
        ...(unpaidOnly ? { paymentStatus: 'UNPAID' } : {}),
      },
      include: expenseInclude,
      orderBy: { expenseDate: 'desc' },
      take: 300,
    });
    return list.map(mapExpense);
  }

  @Mutation(() => ExpenseType)
  async createExpense(
    @MerchantId() merchantId: string,
    @Ctx() ctx: AuthContext,
    @Args('input') input: ExpenseInput,
  ) {
    const { markPaid, ...data } = input;
    const category = await this.prisma.catalogItem.findFirstOrThrow({
      where: { id: data.categoryId, merchantId },
    });
    // Thuê xe ngoài luôn gắn order (docs/03 mục 2 — enforce ở service)
    if (category.name === 'Thuê xe ngoài' && !data.orderId) {
      throw new BadRequestException('Thuê xe ngoài phải gắn vào một đơn hàng');
    }
    const e = await this.prisma.expense.create({
      data: {
        merchantId,
        ...data,
        createdById: ctx.user!.id,
        ...(markPaid ? { paymentStatus: 'PAID', paidAt: new Date() } : {}),
      },
      include: expenseInclude,
    });
    return mapExpense(e);
  }

  /** Trả tiền khoản chi (trả NCC, hoàn ứng tài xế...) */
  @Mutation(() => ExpenseType)
  async markExpensePaid(@MerchantId() merchantId: string, @Args('id', { type: () => ID }) id: string) {
    await this.prisma.expense.findFirstOrThrow({ where: { id, merchantId } });
    const e = await this.prisma.expense.update({
      where: { id },
      data: { paymentStatus: 'PAID', paidAt: new Date() },
      include: expenseInclude,
    });
    return mapExpense(e);
  }

  // ===== Phiếu thu =====

  @Query(() => [PaymentInType])
  async paymentsIn(
    @MerchantId() merchantId: string,
    @Args('customerId', { type: () => ID, nullable: true }) customerId?: string,
  ) {
    const list = await this.prisma.paymentIn.findMany({
      where: { merchantId, ...(customerId ? { customerId } : {}) },
      include: paymentInclude,
      orderBy: { receivedDate: 'desc' },
      take: 300,
    });
    return list.map(mapPayment);
  }

  /**
   * Tạo phiếu thu; allocations = phân bổ ngay vào đơn (operation tự trừ — docs/03 mục 1.1).
   * DRIVER_COD_REMIT: thu hồi phải thu từ tài xế, KHÔNG phải doanh thu (docs/04 mục 3.2).
   */
  @Mutation(() => PaymentInType)
  async createPaymentIn(
    @MerchantId() merchantId: string,
    @Ctx() ctx: AuthContext,
    @Args('input') input: PaymentInInput,
  ) {
    const { allocations, ...data } = input;
    if (data.kind === PaymentInKind.CUSTOMER_PAYMENT && !data.customerId) {
      throw new BadRequestException('Phiếu thu khách phải chọn khách hàng');
    }
    if (data.kind === PaymentInKind.DRIVER_COD_REMIT && !data.driverId) {
      throw new BadRequestException('Phiếu tài xế nộp COD phải chọn tài xế');
    }
    const total = (allocations ?? []).reduce((s, a) => s + a.amount, 0n);
    if (total > data.amount) {
      throw new BadRequestException('Tổng phân bổ vượt quá số tiền phiếu thu');
    }
    for (const a of allocations ?? []) {
      await this.prisma.order.findFirstOrThrow({ where: { id: a.orderId, merchantId } });
    }
    const p = await this.prisma.paymentIn.create({
      data: {
        merchantId,
        ...data,
        createdById: ctx.user!.id,
        allocations: { create: allocations ?? [] },
      },
      include: paymentInclude,
    });
    return mapPayment(p);
  }

  /** Phân bổ thêm từ phiếu thu còn dư (số dư khách) vào đơn */
  @Mutation(() => PaymentInType)
  async allocatePayment(
    @MerchantId() merchantId: string,
    @Args('paymentInId', { type: () => ID }) paymentInId: string,
    @Args('allocations', { type: () => [AllocationInput] }) allocations: AllocationInput[],
  ) {
    const p = await this.prisma.paymentIn.findFirstOrThrow({
      where: { id: paymentInId, merchantId },
      include: { allocations: true },
    });
    const used = p.allocations.reduce((s, a) => s + a.amount, 0n);
    const add = allocations.reduce((s, a) => s + a.amount, 0n);
    if (used + add > p.amount) {
      throw new BadRequestException('Tổng phân bổ vượt quá số tiền phiếu thu');
    }
    for (const a of allocations) {
      await this.prisma.order.findFirstOrThrow({ where: { id: a.orderId, merchantId } });
    }
    await this.prisma.paymentAllocation.createMany({
      data: allocations.map((a) => ({ paymentInId, orderId: a.orderId, amount: a.amount })),
    });
    const updated = await this.prisma.paymentIn.findUniqueOrThrow({
      where: { id: paymentInId },
      include: paymentInclude,
    });
    return mapPayment(updated);
  }

  // ===== Công nợ khách =====

  /** Các đơn còn nợ (mọi khách hoặc 1 khách) — nguồn cho màn hình công nợ + bảng kê */
  @Query(() => [ReceivableRow])
  async receivables(
    @MerchantId() merchantId: string,
    @Args('customerId', { type: () => ID, nullable: true }) customerId?: string,
    @Args('overdueOnly', { nullable: true }) overdueOnly?: boolean,
  ): Promise<ReceivableRow[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        merchantId,
        status: { not: 'CANCELLED' },
        ...(customerId ? { customerId } : {}),
      },
      include: {
        customer: { select: { name: true } },
        addons: { select: { amount: true } },
        allocations: { select: { amount: true } },
        stops: { orderBy: { sequence: 'asc' }, select: { address: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    const rows: ReceivableRow[] = [];
    for (const o of orders) {
      const total = o.price + o.addons.reduce((s, a) => s + a.amount, 0n);
      const paid = o.allocations.reduce((s, a) => s + a.amount, 0n);
      const remaining = total - paid;
      if (remaining <= 0n) continue;
      const overdueDays = o.dueDate
        ? Math.max(0, Math.floor((Date.now() - o.dueDate.getTime()) / 86_400_000))
        : 0;
      if (overdueOnly && overdueDays === 0) continue;
      const first = o.stops[0]?.address ?? '';
      const last = o.stops[o.stops.length - 1]?.address ?? '';
      rows.push({
        orderId: o.id,
        orderCode: o.code,
        orderDate: o.createdAt,
        customerId: o.customerId,
        customerName: o.customer.name,
        route: first && last ? `${first} → ${last}` : first || last,
        totalAmount: total,
        paidAmount: paid,
        remaining,
        dueDate: o.dueDate,
        overdueDays,
      });
    }
    return rows;
  }
}
