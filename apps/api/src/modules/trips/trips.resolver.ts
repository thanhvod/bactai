import { Args, Field, ID, InputType, Mutation, ObjectType, Query, Resolver, Float } from '@nestjs/graphql';
import type { StopStatus, TripStatus } from '@bta/shared';
import { RequirePermission } from '../../common/auth/decorators';
import { ScheduleWarningView } from '../../common/graphql/common.types';
import { PageArgs } from '../../common/graphql/pagination';
import { MoneyScalar } from '../../common/graphql/scalars';
import { TripStatusService } from './trip-status.service';
import { TripsService } from './trips.service';
import {
  CheckTripOverlapInput,
  ExternalTransportInput,
  ExternalTransportView,
  OrderStopStatusView,
  TripConnection,
  TripFilter,
  TripInput,
  TripLocationPoint,
  TripPayload,
  TripView,
  UpdateTripInput,
} from './trips.types';

@InputType()
export class TripStatusChangeInput {
  @Field(() => String) status: string;
  @Field({ nullable: true }) reason?: string;
  @Field({ nullable: true }) note?: string;
  @Field(() => ID, { nullable: true }) pauseReasonId?: string;
  @Field({ nullable: true }) actualAt?: Date;
}

@ObjectType()
export class LastKnownLocationView {
  @Field(() => ID) tripId: string;
  @Field() tripCode: string;
  @Field(() => String) tripStatus: string;
  @Field() orderCode: string;
  @Field(() => String, { nullable: true }) vehiclePlate?: string | null;
  @Field(() => String, { nullable: true }) driverName?: string | null;
  @Field(() => String, { nullable: true }) driverPhone?: string | null;
  @Field(() => Float) lat: number;
  @Field(() => Float) lng: number;
  @Field() capturedAt: Date;
  @Field() isStale: boolean;
}

@Resolver()
export class TripsResolver {
  constructor(private readonly svc: TripsService, private readonly status: TripStatusService) {}

  @Query(() => TripConnection)
  @RequirePermission('order.view')
  trips(@Args('filter', { nullable: true }) filter: TripFilter, @Args() page: PageArgs, @Args('sort', { nullable: true }) sort?: string) {
    return this.svc.list(filter, page, sort);
  }

  @Query(() => TripView)
  @RequirePermission('order.view')
  trip(@Args('id', { type: () => ID }) id: string) {
    return this.svc.get(id);
  }

  @Query(() => [ScheduleWarningView])
  @RequirePermission('order.view')
  checkTripOverlap(@Args('input') input: CheckTripOverlapInput) {
    return this.svc.checkOverlap(input);
  }

  @Mutation(() => TripPayload)
  @RequirePermission('trip.create')
  createTrip(@Args('input') input: TripInput) {
    return this.svc.create(input);
  }

  @Mutation(() => TripPayload)
  @RequirePermission('trip.assign')
  updateTrip(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateTripInput, @Args('reason', { nullable: true }) reason?: string) {
    return this.svc.update(id, input, reason);
  }

  @Mutation(() => TripView)
  @RequirePermission('trip.status.update')
  async updateTripStatus(@Args('id', { type: () => ID }) id: string, @Args('input') input: TripStatusChangeInput) {
    await this.status.changeTripStatus({ tripId: id, ...input, status: input.status as TripStatus }, 'WEB');
    return this.svc.get(id);
  }

  @Mutation(() => TripView)
  @RequirePermission('trip.status.update')
  async resumeTrip(@Args('id', { type: () => ID }) id: string, @Args('note', { nullable: true }) note?: string) {
    await this.status.resumeTrip(id, 'WEB', note);
    return this.svc.get(id);
  }

  @Mutation(() => TripView)
  async cancelTrip(@Args('id', { type: () => ID }) id: string, @Args('reason') reason: string) {
    await this.status.cancelTrip(id, reason);
    return this.svc.get(id);
  }

  @Mutation(() => OrderStopStatusView)
  @RequirePermission('trip.status.update')
  updateStopStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status') status: string,
    @Args('reason', { nullable: true }) reason?: string,
    @Args('tripId', { type: () => ID, nullable: true }) tripId?: string,
    @Args('actualAt', { nullable: true }) actualAt?: Date,
  ) {
    return this.status.changeStopStatus({ stopId: id, status: status as StopStatus, reason, tripId, actualAt }, 'WEB');
  }

  /** Nhập lần đầu cần trip.status.update; sửa COD đã lưu kiểm tra thêm cod.update + lý do trong service. */
  @Mutation(() => OrderStopStatusView)
  @RequirePermission('trip.status.update')
  updateStopCodActual(
    @Args('id', { type: () => ID }) id: string,
    @Args('amount', { type: () => MoneyScalar }) amount: number,
    @Args('reason', { nullable: true }) reason?: string,
    @Args('note', { nullable: true }) note?: string,
  ) {
    return this.status.setStopCod({ stopId: id, amount, reason, note }, 'WEB');
  }

  @Query(() => [ExternalTransportView])
  @RequirePermission('order.view')
  externalTransports(@Args('orderId', { type: () => ID, nullable: true }) orderId?: string, @Args('supplierId', { type: () => ID, nullable: true }) supplierId?: string) {
    return this.svc.externalTransports({ orderId, supplierId });
  }

  @Mutation(() => ExternalTransportView)
  @RequirePermission('trip.assign')
  upsertExternalTransport(
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('input') input: ExternalTransportInput,
    @Args('tripId', { type: () => ID, nullable: true }) tripId?: string,
  ) {
    return this.svc.upsertExternalTransport(orderId, tripId, input);
  }

  @Query(() => [LastKnownLocationView])
  @RequirePermission('order.view')
  lastKnownLocations(@Args('running', { nullable: true, defaultValue: true }) running: boolean) {
    return this.svc.lastKnownLocations(running);
  }

  @Query(() => [TripLocationPoint])
  @RequirePermission('order.view')
  tripLocations(@Args('tripId', { type: () => ID }) tripId: string, @Args('from', { nullable: true }) from?: Date, @Args('to', { nullable: true }) to?: Date) {
    return this.svc.tripLocations(tripId, from, to);
  }
}
