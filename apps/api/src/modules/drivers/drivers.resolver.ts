import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequirePermission } from '../../common/auth/decorators';
import { PageArgs } from '../../common/graphql/pagination';
import { DriversService } from './drivers.service';
import {
  DriverAccountCredentials,
  DriverConnection,
  DriverFilter,
  DriverInput,
  DriverOption,
  DriverSalaryHistoryView,
  DriverView,
  SalaryHistoryInput,
} from './drivers.types';

@Resolver()
export class DriversResolver {
  constructor(private readonly svc: DriversService) {}

  @Query(() => DriverConnection)
  @RequirePermission('driver.view')
  drivers(
    @Args('filter', { nullable: true }) filter: DriverFilter,
    @Args() page: PageArgs,
    @Args('sort', { nullable: true, description: 'name | code | -createdAt' }) sort?: string,
  ) {
    return this.svc.list(filter, page, sort);
  }

  @Query(() => DriverView)
  @RequirePermission('driver.view')
  driver(@Args('id', { type: () => ID }) id: string) {
    return this.svc.get(id);
  }

  @Query(() => [DriverOption])
  @RequirePermission('driver.view')
  driverOptions(@Args('activeOnly', { nullable: true, defaultValue: true }) activeOnly: boolean) {
    return this.svc.options(activeOnly);
  }

  @Query(() => [DriverSalaryHistoryView])
  @RequirePermission('driver.view')
  driverSalaryHistory(@Args('driverId', { type: () => ID }) driverId: string) {
    return this.svc.salaryHistory(driverId);
  }

  @Mutation(() => DriverView)
  @RequirePermission('driver.edit')
  createDriver(@Args('input') input: DriverInput) {
    return this.svc.create(input);
  }

  @Mutation(() => DriverView)
  @RequirePermission('driver.edit')
  updateDriver(@Args('id', { type: () => ID }) id: string, @Args('input') input: DriverInput) {
    return this.svc.update(id, input);
  }

  @Mutation(() => DriverView)
  @RequirePermission('driver.edit')
  deactivateDriver(@Args('id', { type: () => ID }) id: string, @Args('reason') reason: string) {
    return this.svc.deactivate(id, reason);
  }

  @Mutation(() => DriverView)
  @RequirePermission('driver.edit')
  activateDriver(@Args('id', { type: () => ID }) id: string) {
    return this.svc.activate(id);
  }

  @Mutation(() => [DriverSalaryHistoryView])
  @RequirePermission('driver.salary.manage')
  addDriverSalaryHistory(@Args('driverId', { type: () => ID }) driverId: string, @Args('input') input: SalaryHistoryInput) {
    return this.svc.addSalary(driverId, input);
  }

  @Mutation(() => DriverAccountCredentials)
  @RequirePermission('driver.account.manage')
  createOrResetDriverAccount(@Args('driverId', { type: () => ID }) driverId: string) {
    return this.svc.createOrResetAccount(driverId);
  }

  @Mutation(() => DriverView)
  @RequirePermission('driver.account.manage')
  disableDriverAccount(@Args('driverId', { type: () => ID }) driverId: string) {
    return this.svc.disableAccount(driverId);
  }
}
