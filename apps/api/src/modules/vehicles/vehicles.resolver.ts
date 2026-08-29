import { Args, Field, ID, InputType, Int, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';
import { MerchantId } from '../auth/auth.guard';

@ObjectType()
export class VehicleType {
  @Field(() => ID) id!: string;
  @Field() plateNumber!: string;
  @Field(() => String, { nullable: true }) type?: string | null;
  @Field(() => Int, { nullable: true }) loadCapacityKg?: number | null;
  @Field(() => String, { nullable: true }) notes?: string | null;
  @Field() isActive!: boolean;
  @Field(() => Int) tripCount!: number;
  @Field(() => BigInt) totalExpense!: bigint; // chi vật tư/sửa chữa gắn xe
}

@InputType()
export class VehicleInput {
  @Field() plateNumber!: string;
  @Field({ nullable: true }) type?: string;
  @Field(() => Int, { nullable: true }) loadCapacityKg?: number;
  @Field({ nullable: true }) notes?: string;
}

@Resolver()
export class VehiclesResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [VehicleType])
  async vehicles(@MerchantId() merchantId: string) {
    const list = await this.prisma.vehicle.findMany({
      where: { merchantId, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { trips: true } },
        expenses: { select: { amount: true } },
      },
    });
    return list.map((v) => ({
      ...v,
      tripCount: v._count.trips,
      totalExpense: v.expenses.reduce((s, e) => s + e.amount, 0n),
    }));
  }

  @Mutation(() => VehicleType)
  async createVehicle(@MerchantId() merchantId: string, @Args('input') input: VehicleInput) {
    const v = await this.prisma.vehicle.create({
      data: { merchantId, ...input, plateNumber: input.plateNumber.trim().toUpperCase() },
    });
    return { ...v, tripCount: 0, totalExpense: 0n };
  }

  @Mutation(() => VehicleType)
  async updateVehicle(
    @MerchantId() merchantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: VehicleInput,
  ) {
    await this.prisma.vehicle.findFirstOrThrow({ where: { id, merchantId } });
    const v = await this.prisma.vehicle.update({
      where: { id },
      data: { ...input, plateNumber: input.plateNumber.trim().toUpperCase() },
    });
    return { ...v, tripCount: 0, totalExpense: 0n };
  }

  @Mutation(() => VehicleType)
  async deactivateVehicle(@MerchantId() merchantId: string, @Args('id', { type: () => ID }) id: string) {
    await this.prisma.vehicle.findFirstOrThrow({ where: { id, merchantId } });
    const v = await this.prisma.vehicle.update({ where: { id }, data: { isActive: false } });
    return { ...v, tripCount: 0, totalExpense: 0n };
  }
}
