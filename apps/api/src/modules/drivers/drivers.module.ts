import { Module } from '@nestjs/common';
import { DriversResolver } from './drivers.resolver';
import { DriversService } from './drivers.service';

@Module({ providers: [DriversService, DriversResolver], exports: [DriversService] })
export class DriversModule {}
