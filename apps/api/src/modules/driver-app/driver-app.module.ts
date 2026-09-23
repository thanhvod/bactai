import { Module } from '@nestjs/common';
import { IncidentsModule } from '../incidents/incidents.module';
import { TripsModule } from '../trips/trips.module';
import { DriverActionsResolver } from './driver-actions.resolver';
import { DriverAppResolver } from './driver-app.resolver';
import { DriverAppService } from './driver-app.service';
import { GpsController } from './gps.controller';

@Module({ imports: [TripsModule, IncidentsModule], providers: [DriverAppService, DriverAppResolver, DriverActionsResolver], controllers: [GpsController], exports: [DriverAppService] })
export class DriverAppModule {}
