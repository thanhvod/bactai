import { Module } from '@nestjs/common';
import { VehiclesResolver } from './vehicles.resolver';

@Module({ providers: [VehiclesResolver] })
export class VehiclesModule {}
