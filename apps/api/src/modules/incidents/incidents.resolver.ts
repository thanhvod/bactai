import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth, RequirePermission } from '../../common/auth/decorators';
import { PageArgs } from '../../common/graphql/pagination';
import { IncidentsService } from './incidents.service';
import { IncidentConnection, IncidentFilter, IncidentInput, IncidentView } from './incidents.types';

@Resolver()
export class IncidentsResolver {
  constructor(private readonly svc: IncidentsService) {}

  @Query(() => IncidentConnection)
  @RequirePermission('order.view')
  incidents(@Args('filter', { nullable: true }) filter: IncidentFilter, @Args() page: PageArgs) {
    return this.svc.list(filter, page);
  }

  /** Tài xế cũng xem được sự cố chuyến của mình. */
  @Query(() => IncidentView)
  @Auth('USER', 'DRIVER')
  @RequirePermission('order.view')
  incident(@Args('id', { type: () => ID }) id: string) {
    return this.svc.get(id);
  }

  @Mutation(() => IncidentView)
  @RequirePermission('incident.manage')
  createIncident(@Args('input') input: IncidentInput) {
    return this.svc.create(input);
  }

  @Mutation(() => IncidentView)
  @RequirePermission('incident.manage')
  updateIncident(@Args('id', { type: () => ID }) id: string, @Args('input') input: IncidentInput) {
    return this.svc.update(id, input);
  }

  @Mutation(() => IncidentView)
  @RequirePermission('incident.manage')
  assignIncident(@Args('id', { type: () => ID }) id: string, @Args('userId', { type: () => ID }) userId: string) {
    return this.svc.assign(id, userId);
  }

  @Mutation(() => IncidentView)
  @RequirePermission('incident.manage')
  closeIncident(@Args('id', { type: () => ID }) id: string, @Args('note') note: string) {
    return this.svc.close(id, note);
  }

  @Mutation(() => IncidentView)
  @RequirePermission('incident.manage')
  cancelIncident(@Args('id', { type: () => ID }) id: string, @Args('reason') reason: string) {
    return this.svc.cancel(id, reason);
  }
}
