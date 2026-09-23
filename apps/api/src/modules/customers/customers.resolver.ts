import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequirePermission } from '../../common/auth/decorators';
import { PageArgs } from '../../common/graphql/pagination';
import { MoneyScalar } from '../../common/graphql/scalars';
import { CustomersService } from './customers.service';
import {
  CreditLimitCheckView,
  CustomerConnection,
  CustomerFilter,
  CustomerInput,
  CustomerLocationInput,
  CustomerLocationView,
  CustomerView,
} from './customers.types';

@Resolver()
export class CustomersResolver {
  constructor(private readonly svc: CustomersService) {}

  @Query(() => CustomerConnection)
  @RequirePermission('customer.view')
  customers(@Args('filter', { nullable: true }) filter: CustomerFilter, @Args() page: PageArgs) {
    return this.svc.list(filter, page);
  }

  @Query(() => CustomerView)
  @RequirePermission('customer.view')
  customer(@Args('id', { type: () => ID }) id: string) {
    return this.svc.get(id);
  }

  @Query(() => [CustomerLocationView])
  @RequirePermission('customer.view')
  customerLocations(@Args('customerId', { type: () => ID }) customerId: string, @Args('includeInactive', { nullable: true }) includeInactive?: boolean) {
    return this.svc.locations(customerId, includeInactive ?? false);
  }

  @Query(() => CreditLimitCheckView)
  @RequirePermission('customer.view')
  customerCreditCheck(
    @Args('customerId', { type: () => ID }) customerId: string,
    @Args('additionalAmount', { type: () => MoneyScalar, nullable: true }) additionalAmount?: number,
  ) {
    return this.svc.creditCheck(customerId, additionalAmount ?? 0);
  }

  @Mutation(() => CustomerView)
  @RequirePermission('customer.edit')
  createCustomer(@Args('input') input: CustomerInput) {
    return this.svc.create(input);
  }

  @Mutation(() => CustomerView)
  @RequirePermission('customer.edit')
  updateCustomer(@Args('id', { type: () => ID }) id: string, @Args('input') input: CustomerInput) {
    return this.svc.update(id, input);
  }

  @Mutation(() => CustomerView)
  deactivateCustomer(@Args('id', { type: () => ID }) id: string, @Args('reason', { nullable: true }) reason?: string) {
    return this.svc.deactivate(id, reason);
  }

  @Mutation(() => CustomerView)
  @RequirePermission('customer.edit')
  activateCustomer(@Args('id', { type: () => ID }) id: string) {
    return this.svc.activate(id);
  }

  @Mutation(() => CustomerLocationView)
  @RequirePermission('customer.edit')
  createCustomerLocation(@Args('customerId', { type: () => ID }) customerId: string, @Args('input') input: CustomerLocationInput) {
    return this.svc.createLocation(customerId, input);
  }

  @Mutation(() => CustomerLocationView)
  @RequirePermission('customer.edit')
  updateCustomerLocation(@Args('id', { type: () => ID }) id: string, @Args('input') input: CustomerLocationInput) {
    return this.svc.updateLocation(id, input);
  }

  @Mutation(() => Boolean)
  @RequirePermission('customer.edit')
  deleteCustomerLocation(@Args('id', { type: () => ID }) id: string, @Args('reason', { nullable: true }) reason?: string) {
    return this.svc.deleteLocation(id, reason);
  }
}
