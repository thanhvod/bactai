import { Module } from '@nestjs/common';
import { OrderSyncService } from './order-sync.service';
import { TripScheduleService } from './trip-schedule.service';
import { TripStatusService } from './trip-status.service';
import { TripsResolver } from './trips.resolver';
import { TripsService } from './trips.service';

/** Export TripStatusService/TripsService/OrderSyncService cho App tài xế, đơn hàng, điều phối. */
@Module({
  providers: [TripsService, TripStatusService, TripScheduleService, OrderSyncService, TripsResolver],
  exports: [TripsService, TripStatusService, TripScheduleService, OrderSyncService],
})
export class TripsModule {}
