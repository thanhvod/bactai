import { Module } from '@nestjs/common';
import { TripsModule } from '../trips/trips.module';
import { DispatchResolver } from './dispatch.resolver';
import { DispatchService } from './dispatch.service';

@Module({ imports: [TripsModule], providers: [DispatchService, DispatchResolver], exports: [DispatchService] })
export class DispatchModule {}
