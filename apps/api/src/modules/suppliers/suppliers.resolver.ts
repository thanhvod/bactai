import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequirePermission } from '../../common/auth/decorators';
import { PageArgs } from '../../common/graphql/pagination';
import { SuppliersService } from './suppliers.service';
import { SupplierConnection, SupplierFilter, SupplierInput, SupplierOption, SupplierView } from './suppliers.types';

@Resolver()
export class SuppliersResolver {
  constructor(private readonly svc: SuppliersService) {}

  @Query(() => SupplierConnection)
  @RequirePermission('supplier.view')
  suppliers(@Args('filter', { nullable: true }) filter: SupplierFilter, @Args() page: PageArgs, @Args('sort', { nullable: true, description: 'name | code | -createdAt' }) sort?: string) {
    return this.svc.list(filter, page, sort);
  }

  @Query(() => SupplierView)
  @RequirePermission('supplier.view')
  supplier(@Args('id', { type: () => ID }) id: string) {
    return this.svc.get(id);
  }

  @Query(() => [SupplierOption])
  @RequirePermission('supplier.view')
  supplierOptions(@Args('activeOnly', { nullable: true, defaultValue: true }) activeOnly: boolean) {
    return this.svc.options(activeOnly);
  }

  @Mutation(() => SupplierView)
  @RequirePermission('supplier.edit')
  createSupplier(@Args('input') input: SupplierInput) {
    return this.svc.create(input);
  }

  @Mutation(() => SupplierView)
  @RequirePermission('supplier.edit')
  updateSupplier(@Args('id', { type: () => ID }) id: string, @Args('input') input: SupplierInput) {
    return this.svc.update(id, input);
  }

  @Mutation(() => SupplierView)
  @RequirePermission('supplier.edit')
  deactivateSupplier(@Args('id', { type: () => ID }) id: string, @Args('reason') reason: string) {
    return this.svc.deactivate(id, reason);
  }

  @Mutation(() => SupplierView)
  @RequirePermission('supplier.edit')
  activateSupplier(@Args('id', { type: () => ID }) id: string) {
    return this.svc.activate(id);
  }
}
