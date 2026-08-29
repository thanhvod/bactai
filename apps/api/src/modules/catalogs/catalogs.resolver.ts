import { Args, Field, ID, Mutation, ObjectType, Query, Resolver, registerEnumType } from '@nestjs/graphql';
import { CatalogKind } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MerchantId } from '../auth/auth.guard';

registerEnumType(CatalogKind, { name: 'CatalogKind' });

@ObjectType()
export class CatalogItemType {
  @Field(() => ID) id!: string;
  @Field(() => CatalogKind) kind!: CatalogKind;
  @Field() name!: string;
  @Field() isActive!: boolean;
  @Field() sortOrder!: number;
}

@Resolver()
export class CatalogsResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [CatalogItemType])
  catalogItems(
    @MerchantId() merchantId: string,
    @Args('kind', { type: () => CatalogKind, nullable: true }) kind?: CatalogKind,
    @Args('includeInactive', { defaultValue: false }) includeInactive?: boolean,
  ) {
    return this.prisma.catalogItem.findMany({
      where: {
        merchantId,
        ...(kind ? { kind } : {}),
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: [{ kind: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  @Mutation(() => CatalogItemType)
  createCatalogItem(
    @MerchantId() merchantId: string,
    @Args('kind', { type: () => CatalogKind }) kind: CatalogKind,
    @Args('name') name: string,
  ) {
    return this.prisma.catalogItem.create({
      data: { merchantId, kind, name: name.trim(), sortOrder: 999 },
    });
  }

  @Mutation(() => CatalogItemType)
  async updateCatalogItem(
    @MerchantId() merchantId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('isActive', { nullable: true }) isActive?: boolean,
  ) {
    await this.prisma.catalogItem.findFirstOrThrow({ where: { id, merchantId } });
    return this.prisma.catalogItem.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });
  }
}
