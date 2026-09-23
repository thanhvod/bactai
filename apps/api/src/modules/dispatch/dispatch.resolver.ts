import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequirePermission } from '../../common/auth/decorators';
import { PageArgs } from '../../common/graphql/pagination';
import { GlobalSearchResult } from '../orders/orders.types';
import { DispatchService } from './dispatch.service';
import { DispatchSummary, ScheduleRow, ScheduleWarningConnection, ScheduleWarningFilter } from './dispatch.types';

@Resolver()
export class DispatchResolver {
  constructor(private readonly svc: DispatchService) {}

  @Query(() => ScheduleWarningConnection)
  @RequirePermission('order.view')
  scheduleWarnings(@Args('filter', { nullable: true }) filter: ScheduleWarningFilter, @Args() page: PageArgs) {
    return this.svc.scheduleWarnings(filter ?? {}, page);
  }

  @Mutation(() => Boolean)
  @RequirePermission('trip.assign')
  resolveScheduleWarning(@Args('id', { type: () => ID }) id: string) {
    return this.svc.resolveWarning(id);
  }

  @Query(() => [ScheduleRow])
  @RequirePermission('order.view')
  vehicleSchedules(@Args('date', { nullable: true }) date?: string, @Args('days', { type: () => Int, nullable: true }) days?: number) {
    return this.svc.schedules('VEHICLE', date, days ?? 1);
  }

  @Query(() => [ScheduleRow])
  @RequirePermission('order.view')
  driverSchedules(@Args('date', { nullable: true }) date?: string, @Args('days', { type: () => Int, nullable: true }) days?: number) {
    return this.svc.schedules('DRIVER', date, days ?? 1);
  }

  @Query(() => DispatchSummary)
  @RequirePermission('order.view')
  dispatchSummary(@Args('date', { nullable: true }) date?: string) {
    return this.svc.summary(date);
  }

  @Query(() => [GlobalSearchResult])
  globalSearch(
    @Args('query') query: string,
    @Args('types', { type: () => [String], nullable: true }) types?: string[],
    @Args('first', { type: () => Int, nullable: true }) first?: number,
  ) {
    return this.svc.globalSearch(query, types, first ?? 5);
  }
}
