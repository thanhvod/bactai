import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { TripsModule } from '../trips/trips.module';
import { OrdersResolver } from './orders.resolver';
import { OrdersService } from './orders.service';

@Module({ imports: [TripsModule, CustomersModule], providers: [OrdersService, OrdersResolver], exports: [OrdersService] })
export class OrdersModule {}
