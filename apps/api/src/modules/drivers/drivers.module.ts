import { Module } from '@nestjs/common';
import { DriversResolver } from './drivers.resolver';

@Module({ providers: [DriversResolver] })
export class DriversModule {}
