import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { CatalogType } from '@bta/shared';
import { Auth, RequirePermission } from '../../common/auth/decorators';
import { GqlEnums } from '../../common/graphql/enums';
import { CatalogsService } from './catalogs.service';
import { CatalogItemInput, CatalogItemView } from './catalogs.types';

@Resolver()
export class CatalogsResolver {
  constructor(private readonly svc: CatalogsService) {}

  /** Tài xế cũng cần (lý do tạm dừng, loại sự cố). */
  @Query(() => [CatalogItemView])
  @Auth('USER', 'DRIVER')
  catalogItems(
    @Args('type', { type: () => GqlEnums.CatalogType, nullable: true }) type?: CatalogType,
    @Args('activeOnly', { nullable: true, defaultValue: false }) activeOnly?: boolean,
  ) {
    return this.svc.list(type, !activeOnly);
  }

  @Mutation(() => CatalogItemView)
  @RequirePermission('catalogs.manage')
  createCatalogItem(@Args('input') input: CatalogItemInput) {
    return this.svc.create(input);
  }

  @Mutation(() => CatalogItemView)
  @RequirePermission('catalogs.manage')
  updateCatalogItem(@Args('id', { type: () => ID }) id: string, @Args('input') input: CatalogItemInput) {
    return this.svc.update(id, input);
  }

  @Mutation(() => CatalogItemView)
  @RequirePermission('catalogs.manage')
  deactivateCatalogItem(@Args('id', { type: () => ID }) id: string) {
    return this.svc.setActive(id, false);
  }

  @Mutation(() => CatalogItemView)
  @RequirePermission('catalogs.manage')
  activateCatalogItem(@Args('id', { type: () => ID }) id: string) {
    return this.svc.setActive(id, true);
  }

  @Mutation(() => [CatalogItemView])
  @RequirePermission('catalogs.manage')
  reorderCatalogItems(@Args('type', { type: () => GqlEnums.CatalogType }) type: CatalogType, @Args('ids', { type: () => [ID] }) ids: string[]) {
    return this.svc.reorder(type, ids);
  }
}
