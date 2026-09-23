import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import type { StopStatus, TripStatus } from '@bta/shared';
import { Auth } from '../../common/auth/decorators';
import { IdempotencyService } from '../../common/idempotency/idempotency.service';
import { IncidentsService } from '../incidents/incidents.service';
import { IncidentView } from '../incidents/incidents.types';
import { TripStatusService } from '../trips/trip-status.service';
import { DriverAppService } from './driver-app.service';
import {
  DriverCodInput,
  DriverIncidentInput,
  DriverStopPayload,
  DriverStopStatusInput,
  DriverTripPayload,
  DriverTripStatusInput,
} from './driver-app.types';

/**
 * Hành động hiện trường của tài xế (DRV-ACT-001..004). Mọi mutation nhận idempotencyKey (app offline gửi lại)
 * → IdempotencyService trả lại kết quả cũ, không ghi trùng.
 */
@Resolver()
@Auth('DRIVER')
export class DriverActionsResolver {
  constructor(
    private readonly app: DriverAppService,
    private readonly status: TripStatusService,
    private readonly incidents: IncidentsService,
    private readonly idem: IdempotencyService,
  ) {}

  private async tripPayload(tripId: string, warnings: string[] = []) {
    return { trip: await this.app.trip(tripId), warnings };
  }

  private async stopPayload(stopId: string, warnings: string[], orderStatus?: string | null) {
    const tripId = await this.app.assertOwnStop(stopId);
    const trip = await this.app.trip(tripId);
    return { stop: trip.stops.find((s: any) => s.id === stopId), warnings, orderStatus };
  }

  @Mutation(() => DriverTripPayload)
  driverUpdateTripStatus(@Args('input') input: DriverTripStatusInput) {
    return this.idem.run(input.idempotencyKey, 'driver.tripStatus', async () => {
      const r: any = await this.status.changeTripStatus(
        { tripId: input.tripId, status: input.status as TripStatus, reason: input.reason, note: input.note, pauseReasonId: input.pauseReasonId, actualAt: input.actualAt, clientRequestId: input.idempotencyKey },
        'DRIVER',
      );
      return this.tripPayload(input.tripId, r?.warnings ?? []);
    }, (stored) => this.tripPayload(input.tripId, stored?.warnings ?? []));
  }

  @Mutation(() => DriverTripPayload)
  driverResumeTrip(@Args('tripId', { type: () => ID }) tripId: string, @Args('note', { nullable: true }) note?: string, @Args('idempotencyKey', { nullable: true }) key?: string) {
    return this.idem.run(key, 'driver.resume', async () => {
      await this.status.resumeTrip(tripId, 'DRIVER', note);
      return this.tripPayload(tripId);
    }, () => this.tripPayload(tripId));
  }

  @Mutation(() => DriverStopPayload)
  driverUpdateStopStatus(@Args('input') input: DriverStopStatusInput) {
    return this.idem.run(input.idempotencyKey, 'driver.stopStatus', async () => {
      const r: any = await this.status.changeStopStatus(
        { stopId: input.stopId, tripId: input.tripId, status: input.status as StopStatus, reason: input.reason, note: input.note, actualAt: input.actualAt, clientRequestId: input.idempotencyKey },
        'DRIVER',
      );
      return this.stopPayload(input.stopId, r?.warnings ?? [], r?.orderStatus);
    }, (stored) => this.stopPayload(input.stopId, stored?.warnings ?? [], stored?.orderStatus));
  }

  @Mutation(() => DriverStopPayload)
  driverSubmitCod(@Args('input') input: DriverCodInput) {
    return this.idem.run(input.idempotencyKey, 'driver.cod', async () => {
      const r: any = await this.status.setStopCod({ stopId: input.stopId, amount: input.amount, reason: input.reason, note: input.note, clientRequestId: input.idempotencyKey }, 'DRIVER');
      return this.stopPayload(input.stopId, r?.warnings ?? [], r?.orderStatus);
    }, (stored) => this.stopPayload(input.stopId, stored?.warnings ?? [], stored?.orderStatus));
  }

  @Mutation(() => IncidentView)
  driverReportIncident(@Args('input') input: DriverIncidentInput) {
    return this.idem.run(input.idempotencyKey, 'driver.incident', async () => {
      await this.app.assertOwnTrip(input.tripId);
      const { idempotencyKey, ...rest } = input;
      return this.incidents.create({ ...rest, clientRequestId: idempotencyKey } as any);
    }, async (stored) => this.incidents.get(stored.id));
  }
}
