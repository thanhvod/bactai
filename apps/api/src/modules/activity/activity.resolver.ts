import { Args, ID, Int, Query, Resolver } from '@nestjs/graphql';
import { RequirePermission } from '../../common/auth/decorators';
import { ActivityService } from './activity.service';
import { EntityRefInput, TimelineEntry, TimelineFilter } from './activity.types';

@Resolver()
export class ActivityResolver {
  constructor(private readonly svc: ActivityService) {}

  @Query(() => [TimelineEntry])
  activityTimeline(@Args('entity') entity: EntityRefInput, @Args('filter', { nullable: true }) filter?: TimelineFilter) {
    return this.svc.timeline(entity, filter);
  }

  @Query(() => [TimelineEntry])
  @RequirePermission('users.manage')
  activityByActor(@Args('actorId', { type: () => ID }) actorId: string, @Args('first', { type: () => Int, nullable: true }) first?: number) {
    return this.svc.byActor(actorId, first ?? 50);
  }
}
