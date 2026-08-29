import { BadRequestException } from '@nestjs/common';
import { Args, Field, ID, InputType, Int, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { PaymentInKind } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { Ctx, MerchantId } from '../auth/auth.guard';
import type { AuthContext } from '../auth/auth.types';

// Cùng format với packages/db seed: "scrypt:<salt>:<hash>"
function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  return `scrypt:${salt}:${scryptSync(plain, salt, 64).toString('hex')}`;
}

@ObjectType()
export class DriverType {
  @Field(() => ID) id!: string;
  @Field() fullName!: string;
  @Field() phone!: string;
  @Field(() => String, { nullable: true }) licenseNo?: string | null;
  @Field(() => BigInt) baseSalary!: bigint;
  @Field(() => String, { nullable: true }) notes?: string | null;
  @Field() isActive!: boolean;
  @Field(() => Int) tripCount!: number;
  // Sổ công nợ 2 chiều (docs/04 mục 3)
  @Field(() => BigInt) companyOwesDriver!: bigint; // chi phí tài xế ứng chưa hoàn
  @Field(() => BigInt) driverOwesCompany!: bigint; // COD đã thu chưa nộp + ứng lương chưa trừ
}

@InputType()
export class DriverInput {
  @Field() fullName!: string;
  @Field() phone!: string;
  @Field({ nullable: true }) licenseNo?: string;
  @Field(() => BigInt, { nullable: true }) baseSalary?: bigint;
  @Field({ nullable: true }) notes?: string;
  @Field({ nullable: true, description: 'Mật khẩu đăng nhập app tài xế' }) password?: string;
}

@Resolver()
export class DriversResolver {
  constructor(private prisma: PrismaService) {}

  private async computeLedger(merchantId: string, driverIds: string[]) {
    // Công ty nợ tài xế: expense DRIVER chi trước, reimbursable, chưa trả
    const owed = await this.prisma.expense.groupBy({
      by: ['driverId'],
      where: {
        merchantId, driverId: { in: driverIds },
        paidBy: 'DRIVER', reimbursable: true, paymentStatus: 'UNPAID',
      },
      _sum: { amount: true },
    });
    // Tài xế giữ COD: Σ codCollected của stop thuộc trip tài xế − Σ phiếu DRIVER_COD_REMIT
    const stops = await this.prisma.orderStop.findMany({
      where: {
        codCollected: { not: null },
        tripAssigns: { some: { trip: { merchantId, driverId: { in: driverIds } } } },
      },
      select: { codCollected: true, tripAssigns: { select: { trip: { select: { driverId: true } } }, take: 1 } },
    });
    const remits = await this.prisma.paymentIn.groupBy({
      by: ['driverId'],
      where: { merchantId, driverId: { in: driverIds }, kind: PaymentInKind.DRIVER_COD_REMIT },
      _sum: { amount: true },
    });
    // Ứng lương chưa trừ: expense isDriverAdvance chưa gắn vào payroll item nào
    const advances = await this.prisma.expense.findMany({
      where: { merchantId, driverId: { in: driverIds }, isDriverAdvance: true, payrollLineItems: { none: {} } },
      select: { driverId: true, amount: true },
    });

    const owes = new Map<string, bigint>();
    const held = new Map<string, bigint>();
    for (const o of owed) if (o.driverId) owes.set(o.driverId, o._sum.amount ?? 0n);
    for (const s of stops) {
      const d = s.tripAssigns[0]?.trip.driverId;
      if (d) held.set(d, (held.get(d) ?? 0n) + (s.codCollected ?? 0n));
    }
    for (const r of remits) if (r.driverId) held.set(r.driverId, (held.get(r.driverId) ?? 0n) - (r._sum.amount ?? 0n));
    for (const a of advances) if (a.driverId) held.set(a.driverId, (held.get(a.driverId) ?? 0n) + a.amount);
    return { owes, held };
  }

  @Query(() => [DriverType])
  async drivers(@MerchantId() merchantId: string) {
    const list = await this.prisma.driver.findMany({
      where: { merchantId, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { trips: true } } },
    });
    const { owes, held } = await this.computeLedger(merchantId, list.map((d) => d.id));
    return list.map((d) => ({
      ...d,
      tripCount: d._count.trips,
      companyOwesDriver: owes.get(d.id) ?? 0n,
      driverOwesCompany: held.get(d.id) ?? 0n,
    }));
  }

  @Mutation(() => DriverType)
  async createDriver(
    @MerchantId() merchantId: string,
    @Ctx() ctx: AuthContext,
    @Args('input') input: DriverInput,
  ) {
    const { password, baseSalary, ...rest } = input;
    if (!password) throw new BadRequestException('Cần mật khẩu cho tài khoản app tài xế');
    const existing = await this.prisma.driver.findUnique({ where: { phone: rest.phone } });
    if (existing) {
      throw new BadRequestException('Số điện thoại đã được dùng cho tài xế khác');
    }
    const d = await this.prisma.driver.create({
      data: {
        merchantId, ...rest,
        baseSalary: baseSalary ?? 0n,
        passwordHash: hashPassword(password),
        salaryHistory: {
          create: { baseSalary: baseSalary ?? 0n, effectiveFrom: new Date(), changedById: ctx.user?.id },
        },
      },
    });
    return { ...d, tripCount: 0, companyOwesDriver: 0n, driverOwesCompany: 0n };
  }

  @Mutation(() => DriverType)
  async updateDriver(
    @MerchantId() merchantId: string,
    @Ctx() ctx: AuthContext,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: DriverInput,
  ) {
    const existing = await this.prisma.driver.findFirstOrThrow({ where: { id, merchantId } });
    const { password, baseSalary, ...rest } = input;
    const d = await this.prisma.driver.update({
      where: { id },
      data: {
        ...rest,
        ...(baseSalary !== undefined ? { baseSalary } : {}),
        ...(password ? { passwordHash: hashPassword(password) } : {}),
        // Đổi lương cố định → lưu lịch sử để kỳ cũ tính đúng (docs/04 mục 1)
        ...(baseSalary !== undefined && baseSalary !== existing.baseSalary
          ? {
              salaryHistory: {
                create: { baseSalary, effectiveFrom: new Date(), changedById: ctx.user?.id },
              },
            }
          : {}),
      },
    });
    return { ...d, tripCount: 0, companyOwesDriver: 0n, driverOwesCompany: 0n };
  }

  @Mutation(() => DriverType)
  async deactivateDriver(@MerchantId() merchantId: string, @Args('id', { type: () => ID }) id: string) {
    await this.prisma.driver.findFirstOrThrow({ where: { id, merchantId } });
    const d = await this.prisma.driver.update({ where: { id }, data: { isActive: false } });
    return { ...d, tripCount: 0, companyOwesDriver: 0n, driverOwesCompany: 0n };
  }
}
