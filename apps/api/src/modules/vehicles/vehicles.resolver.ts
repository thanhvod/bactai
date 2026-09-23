import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequirePermission } from '../../common/auth/decorators';
import { PageArgs } from '../../common/graphql/pagination';
import { VehiclesService } from './vehicles.service';
import { VehicleConnection, VehicleFilter, VehicleInput, VehicleOption, VehicleView } from './vehicles.types';

@Resolver()
export class VehiclesResolver {
  constructor(private readonly svc: VehiclesService) {}

  @Query(() => VehicleConnection)
  @RequirePermission('vehicle.view')
  vehicles(@Args('filter', { nullable: true }) filter: VehicleFilter, @Args() page: PageArgs, @Args('sort', { nullable: true, description: 'plate | code | -createdAt' }) sort?: string) {
    return this.svc.list(filter, page, sort);
  }

  @Query(() => VehicleView)
  @RequirePermission('vehicle.view')
  vehicle(@Args('id', { type: () => ID }) id: string) {
    return this.svc.get(id);
  }

  @Query(() => [VehicleOption])
  @RequirePermission('vehicle.view')
  vehicleOptions(@Args('activeOnly', { nullable: true, defaultValue: true }) activeOnly: boolean) {
    return this.svc.options(activeOnly);
  }

  @Mutation(() => VehicleView)
  @RequirePermission('vehicle.edit')
  createVehicle(@Args('input') input: VehicleInput) {
    return this.svc.create(input);
  }

  @Mutation(() => VehicleView)
  @RequirePermission('vehicle.edit')
  updateVehicle(@Args('id', { type: () => ID }) id: string, @Args('input') input: VehicleInput) {
    return this.svc.update(id, input);
  }

  @Mutation(() => VehicleView)
  @RequirePermission('vehicle.edit')
  deactivateVehicle(@Args('id', { type: () => ID }) id: string, @Args('reason') reason: string) {
    return this.svc.setStatus(id, 'INACTIVE', reason);
  }

  @Mutation(() => VehicleView)
  @RequirePermission('vehicle.edit')
  activateVehicle(@Args('id', { type: () => ID }) id: string) {
    return this.svc.setStatus(id, 'ACTIVE');
  }

  @Mutation(() => VehicleView)
  @RequirePermission('vehicle.edit')
  setVehicleStatus(@Args('id', { type: () => ID }) id: string, @Args('status') status: string, @Args('reason', { nullable: true }) reason?: string) {
    return this.svc.setStatus(id, status, reason);
  }
}
