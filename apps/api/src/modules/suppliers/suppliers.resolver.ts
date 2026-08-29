import { Args, Field, ID, InputType, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';
import { MerchantId } from '../auth/auth.guard';

@ObjectType()
export class SupplierType {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field(() => String, { nullable: true }) category?: string | null;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => String, { nullable: true }) address?: string | null;
  @Field(() => String, { nullable: true }) taxCode?: string | null;
  @Field(() => String, { nullable: true }) notes?: string | null;
  @Field() isActive!: boolean;
  @Field(() => BigInt) totalUnpaid!: bigint; // công nợ NCC = Σ expense UNPAID (docs/03 mục 2)
}

@InputType()
export class SupplierInput {
  @Field() name!: string;
  @Field({ nullable: true }) category?: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) address?: string;
  @Field({ nullable: true }) taxCode?: string;
  @Field({ nullable: true }) notes?: string;
}

@Resolver()
export class SuppliersResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [SupplierType])
  async suppliers(@MerchantId() merchantId: string) {
    const list = await this.prisma.supplier.findMany({
      where: { merchantId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    const unpaid = await this.prisma.expense.groupBy({
      by: ['supplierId'],
      where: { merchantId, supplierId: { in: list.map((s) => s.id) }, paymentStatus: 'UNPAID' },
      _sum: { amount: true },
    });
    const map = new Map(unpaid.map((u) => [u.supplierId, u._sum.amount ?? 0n]));
    return list.map((s) => ({ ...s, totalUnpaid: map.get(s.id) ?? 0n }));
  }

  @Mutation(() => SupplierType)
  async createSupplier(@MerchantId() merchantId: string, @Args('input') input: SupplierInput) {
    const s = await this.prisma.supplier.create({ data: { merchantId, ...input } });
    return { ...s, totalUnpaid: 0n };
  }

  @Mutation(() => SupplierType)
  async updateSupplier(
    @MerchantId() merchantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: SupplierInput,
  ) {
    await this.prisma.supplier.findFirstOrThrow({ where: { id, merchantId } });
    const s = await this.prisma.supplier.update({ where: { id }, data: { ...input } });
    return { ...s, totalUnpaid: 0n };
  }

  @Mutation(() => SupplierType)
  async deactivateSupplier(@MerchantId() merchantId: string, @Args('id', { type: () => ID }) id: string) {
    await this.prisma.supplier.findFirstOrThrow({ where: { id, merchantId } });
    const s = await this.prisma.supplier.update({ where: { id }, data: { isActive: false } });
    return { ...s, totalUnpaid: 0n };
  }
}
