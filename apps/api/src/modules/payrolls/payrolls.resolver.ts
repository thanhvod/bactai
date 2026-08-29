import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Args, Field, ID, Mutation, ObjectType, Query, Resolver, registerEnumType } from '@nestjs/graphql';
import { PayrollItemType, PayrollStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Ctx, MerchantId } from '../auth/auth.guard';
import type { AuthContext } from '../auth/auth.types';

registerEnumType(PayrollStatus, { name: 'PayrollStatus' });
registerEnumType(PayrollItemType, { name: 'PayrollItemType' });

@ObjectType()
class PayrollItemGql {
  @Field(() => ID) id!: string;
  @Field(() => PayrollItemType) type!: PayrollItemType;
  @Field(() => BigInt) amount!: bigint;
  @Field(() => String, { nullable: true }) tripId?: string | null;
  @Field(() => String, { nullable: true }) orderCode?: string | null;
  @Field(() => String, { nullable: true }) reasonName?: string | null;
  @Field(() => String, { nullable: true }) note?: string | null;
}

@ObjectType()
class PayrollLineGql {
  @Field(() => ID) id!: string;
  @Field() driverId!: string;
  @Field() driverName!: string;
  @Field(() => BigInt) baseSalary!: bigint;
  @Field(() => BigInt) totalBonus!: bigint;
  @Field(() => BigInt) totalAdvance!: bigint;
  @Field(() => BigInt) totalDeduction!: bigint;
  @Field(() => BigInt) netAmount!: bigint;
  @Field(() => [PayrollItemGql]) items!: PayrollItemGql[];
}

@ObjectType()
class PayrollGql {
  @Field(() => ID) id!: string;
  @Field() periodStart!: Date;
  @Field() periodEnd!: Date;
  @Field(() => PayrollStatus) status!: PayrollStatus;
  @Field(() => String, { nullable: true }) createdByName?: string;
  @Field(() => String, { nullable: true }) approvedByName?: string | null;
  @Field(() => String, { nullable: true }) notes?: string | null;
  @Field() createdAt!: Date;
  @Field(() => [PayrollLineGql]) lines!: PayrollLineGql[];
}

const payrollInclude = {
  createdBy: { select: { fullName: true } },
  approvedBy: { select: { fullName: true } },
  lines: {
    include: {
      driver: { select: { fullName: true } },
      items: {
        include: {
          trip: { include: { order: { select: { code: true } } } },
          reason: { select: { name: true } },
        },
      },
    },
  },
};

function mapPayroll(p: any): PayrollGql {
  return {
    ...p,
    createdByName: p.createdBy?.fullName,
    approvedByName: p.approvedBy?.fullName ?? null,
    lines: p.lines.map((l: any) => ({
      ...l,
      driverName: l.driver.fullName,
      items: l.items.map((it: any) => ({
        ...it,
        orderCode: it.trip?.order?.code ?? null,
        reasonName: it.reason?.name ?? null,
      })),
    })),
  };
}

@Resolver()
export class PayrollsResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [PayrollGql])
  async payrolls(@MerchantId() merchantId: string) {
    const list = await this.prisma.payroll.findMany({
      where: { merchantId },
      include: payrollInclude,
      orderBy: { periodStart: 'desc' },
    });
    return list.map(mapPayroll);
  }

  /**
   * Tạo bảng lương kỳ [start, end]: mỗi tài xế 1 dòng =
   * lương cố định (snapshot) + thưởng các trip hoàn thành trong kỳ − ứng lương chưa trừ (docs/04).
   * Giảm trừ thêm tay sau bằng addPayrollDeduction.
   */
  @Mutation(() => PayrollGql)
  async createPayroll(
    @MerchantId() merchantId: string,
    @Ctx() ctx: AuthContext,
    @Args('periodStart', { type: () => Date }) periodStart: Date,
    @Args('periodEnd', { type: () => Date }) periodEnd: Date,
  ) {
    const drivers = await this.prisma.driver.findMany({ where: { merchantId, isActive: true } });
    if (drivers.length === 0) throw new BadRequestException('Chưa có tài xế nào');

    const p = await this.prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.create({
        data: { merchantId, periodStart, periodEnd, createdById: ctx.user!.id },
      });
      for (const d of drivers) {
        // Thưởng: trip driverBonus > 0 trong kỳ (theo plannedStartAt hoặc createdAt)
        const trips = await tx.trip.findMany({
          where: {
            merchantId, driverId: d.id, driverBonus: { gt: 0n },
            status: { not: 'CANCELLED' },
            OR: [
              { plannedStartAt: { gte: periodStart, lte: periodEnd } },
              { plannedStartAt: null, createdAt: { gte: periodStart, lte: periodEnd } },
            ],
            payrollLineItems: { none: {} }, // chưa vào bảng lương nào
          },
        });
        // Ứng lương chưa trừ
        const advances = await tx.expense.findMany({
          where: { merchantId, driverId: d.id, isDriverAdvance: true, payrollLineItems: { none: {} } },
        });
        const totalBonus = trips.reduce((s, t) => s + t.driverBonus, 0n);
        const totalAdvance = advances.reduce((s, e) => s + e.amount, 0n);
        await tx.payrollLine.create({
          data: {
            payrollId: payroll.id,
            driverId: d.id,
            baseSalary: d.baseSalary,
            totalBonus,
            totalAdvance,
            totalDeduction: 0n,
            netAmount: d.baseSalary + totalBonus - totalAdvance,
            items: {
              create: [
                ...trips.map((t) => ({ type: PayrollItemType.BONUS, amount: t.driverBonus, tripId: t.id })),
                ...advances.map((e) => ({ type: PayrollItemType.ADVANCE, amount: e.amount, expenseId: e.id })),
              ],
            },
          },
        });
      }
      return tx.payroll.findUniqueOrThrow({ where: { id: payroll.id }, include: payrollInclude });
    });
    return mapPayroll(p);
  }

  /** Giảm trừ nhập tay + lý do (docs/04 mục 1) — chỉ khi bảng lương còn nháp/chờ duyệt */
  @Mutation(() => PayrollGql)
  async addPayrollDeduction(
    @MerchantId() merchantId: string,
    @Args('payrollLineId', { type: () => ID }) payrollLineId: string,
    @Args('amount', { type: () => BigInt }) amount: bigint,
    @Args('reasonId', { type: () => ID, nullable: true }) reasonId?: string,
    @Args('note', { nullable: true }) note?: string,
  ) {
    const line = await this.prisma.payrollLine.findFirstOrThrow({
      where: { id: payrollLineId, payroll: { merchantId } },
      include: { payroll: true },
    });
    if (line.payroll.status === 'APPROVED' || line.payroll.status === 'PAID') {
      throw new BadRequestException('Bảng lương đã duyệt, không sửa được');
    }
    await this.prisma.payrollLineItem.create({
      data: { payrollLineId, type: PayrollItemType.DEDUCTION, amount, reasonId, note },
    });
    await this.prisma.payrollLine.update({
      where: { id: payrollLineId },
      data: {
        totalDeduction: line.totalDeduction + amount,
        netAmount: line.netAmount - amount,
      },
    });
    const p = await this.prisma.payroll.findUniqueOrThrow({
      where: { id: line.payrollId },
      include: payrollInclude,
    });
    return mapPayroll(p);
  }

  /** Nháp → chờ duyệt → (ADMIN) duyệt → đã trả (docs/04 mục 2) */
  @Mutation(() => PayrollGql)
  async updatePayrollStatus(
    @MerchantId() merchantId: string,
    @Ctx() ctx: AuthContext,
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => PayrollStatus }) status: PayrollStatus,
  ) {
    const payroll = await this.prisma.payroll.findFirstOrThrow({ where: { id, merchantId } });
    if (status === 'APPROVED') {
      if (ctx.user!.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Chỉ giám đốc (ADMIN) được duyệt bảng lương');
      }
      if (payroll.status !== 'PENDING_APPROVAL') {
        throw new BadRequestException('Bảng lương chưa ở trạng thái chờ duyệt');
      }
    }
    if (status === 'PAID' && payroll.status !== 'APPROVED') {
      throw new BadRequestException('Bảng lương chưa được duyệt');
    }
    const p = await this.prisma.payroll.update({
      where: { id },
      data: {
        status,
        ...(status === 'APPROVED' ? { approvedById: ctx.user!.id, approvedAt: new Date() } : {}),
      },
      include: payrollInclude,
    });
    return mapPayroll(p);
  }
}
