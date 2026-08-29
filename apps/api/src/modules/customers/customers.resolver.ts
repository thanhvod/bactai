import { Args, Field, ID, InputType, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { PaymentInKind } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MerchantId } from '../auth/auth.guard';

@ObjectType()
export class CustomerType {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) address?: string | null;
  @Field(() => String, { nullable: true }) taxCode?: string | null;
  @Field(() => String, { nullable: true }) notes?: string | null;
  @Field() isActive!: boolean;
  @Field() createdAt!: Date;
  // Suy ra (docs/07): công nợ = Σ(tổng đơn − đã phân bổ); số dư = Σ phiếu thu − Σ đã phân bổ
  @Field(() => BigInt) totalDebt!: bigint;
  @Field(() => BigInt) creditBalance!: bigint;
}

@InputType()
export class CustomerInput {
  @Field() name!: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) address?: string;
  @Field({ nullable: true }) taxCode?: string;
  @Field({ nullable: true }) notes?: string;
}

@Resolver()
export class CustomersResolver {
  constructor(private prisma: PrismaService) {}

  /** Công nợ + số dư từng khách — tính từ dữ liệu gốc, không lưu bảng riêng (docs/07) */
  private async withComputed(merchantId: string, customers: { id: string }[]) {
    const ids = customers.map((c) => c.id);
    const orders = await this.prisma.order.findMany({
      where: { merchantId, customerId: { in: ids }, status: { not: 'CANCELLED' } },
      select: {
        customerId: true,
        price: true,
        addons: { select: { amount: true } },
        allocations: { select: { amount: true } },
      },
    });
    const payments = await this.prisma.paymentIn.findMany({
      where: { merchantId, customerId: { in: ids }, kind: PaymentInKind.CUSTOMER_PAYMENT },
      select: { customerId: true, amount: true, allocations: { select: { amount: true } } },
    });

    const debt = new Map<string, bigint>();
    for (const o of orders) {
      const total = o.price + o.addons.reduce((s, a) => s + a.amount, 0n);
      const paid = o.allocations.reduce((s, a) => s + a.amount, 0n);
      const rest = total - paid;
      if (rest > 0n) debt.set(o.customerId, (debt.get(o.customerId) ?? 0n) + rest);
    }
    const credit = new Map<string, bigint>();
    for (const p of payments) {
      if (!p.customerId) continue;
      const unalloc = p.amount - p.allocations.reduce((s, a) => s + a.amount, 0n);
      credit.set(p.customerId, (credit.get(p.customerId) ?? 0n) + unalloc);
    }
    return customers.map((c) => ({
      ...c,
      totalDebt: debt.get(c.id) ?? 0n,
      creditBalance: credit.get(c.id) ?? 0n,
    }));
  }

  @Query(() => [CustomerType])
  async customers(
    @MerchantId() merchantId: string,
    @Args('search', { nullable: true }) search?: string,
  ) {
    const list = await this.prisma.customer.findMany({
      where: {
        merchantId,
        isActive: true,
        ...(search
          ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { phone: { contains: search } }] }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.withComputed(merchantId, list);
  }

  @Mutation(() => CustomerType)
  async createCustomer(@MerchantId() merchantId: string, @Args('input') input: CustomerInput) {
    const c = await this.prisma.customer.create({ data: { merchantId, ...input } });
    return { ...c, totalDebt: 0n, creditBalance: 0n };
  }

  @Mutation(() => CustomerType)
  async updateCustomer(
    @MerchantId() merchantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CustomerInput,
  ) {
    await this.prisma.customer.findFirstOrThrow({ where: { id, merchantId } });
    const c = await this.prisma.customer.update({ where: { id }, data: { ...input } });
    const [r] = await this.withComputed(merchantId, [c]);
    return r;
  }

  @Mutation(() => CustomerType)
  async deactivateCustomer(@MerchantId() merchantId: string, @Args('id', { type: () => ID }) id: string) {
    await this.prisma.customer.findFirstOrThrow({ where: { id, merchantId } });
    const c = await this.prisma.customer.update({ where: { id }, data: { isActive: false } });
    return { ...c, totalDebt: 0n, creditBalance: 0n };
  }
}
