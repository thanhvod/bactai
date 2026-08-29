import { Module } from '@nestjs/common';
import { TripsResolver } from './trips.resolver';

@Module({ providers: [TripsResolver] })
export class TripsModule {}
