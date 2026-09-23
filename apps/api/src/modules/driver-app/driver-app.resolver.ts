import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { Auth } from '../../common/auth/decorators';
import { DriverAppService } from './driver-app.service';
import { DriverCalendarDay, DriverJobsFilter, DriverMeView, DriverStopView, DriverTripView } from './driver-app.types';

@Resolver()
@Auth('DRIVER')
export class DriverAppResolver {
  constructor(private readonly svc: DriverAppService) {}

  @Query(() => DriverMeView)
  driverMe() {
    return this.svc.driverMe();
  }

  @Query(() => [DriverTripView])
  driverJobs(@Args('filter', { nullable: true }) filter?: DriverJobsFilter) {
    return this.svc.jobs(filter);
  }

  @Query(() => [DriverCalendarDay])
  driverJobCalendar(@Args('from') from: string, @Args('to') to: string) {
    return this.svc.calendar(from, to);
  }

  @Query(() => DriverTripView)
  driverTrip(@Args('id', { type: () => ID }) id: string) {
    return this.svc.trip(id);
  }

  @Query(() => DriverStopView)
  async driverStop(@Args('id', { type: () => ID }) id: string) {
    const tripId = await this.svc.assertOwnStop(id);
    const trip = await this.svc.trip(tripId);
    return trip.stops.find((s: any) => s.id === id);
  }
}
