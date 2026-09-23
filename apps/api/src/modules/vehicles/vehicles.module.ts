import { Module } from '@nestjs/common';
import { VehiclesResolver } from './vehicles.resolver';
import { VehiclesService } from './vehicles.service';

@Module({ providers: [VehiclesService, VehiclesResolver], exports: [VehiclesService] })
export class VehiclesModule {}
