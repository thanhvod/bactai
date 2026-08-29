import { Args, Field, Float, InputType, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';
import { MerchantId } from '../auth/auth.guard';
import { MerchantInfo } from '../auth/auth.types';

@InputType()
class UpdateMerchantInput {
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) taxCode?: string;
  @Field({ nullable: true }) address?: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) email?: string;
  @Field(() => Float, { nullable: true }) scheduleWarnHours?: number;
}

@Resolver()
export class MerchantResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => MerchantInfo)
  myMerchant(@MerchantId() merchantId: string) {
    return this.prisma.merchant.findUniqueOrThrow({ where: { id: merchantId } });
  }

  @Mutation(() => MerchantInfo)
  updateMerchant(
    @MerchantId() merchantId: string,
    @Args('input') input: UpdateMerchantInput,
  ) {
    return this.prisma.merchant.update({
      where: { id: merchantId },
      data: { ...input },
    });
  }
}
