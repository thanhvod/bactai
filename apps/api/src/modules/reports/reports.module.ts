import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { ReportsResolver } from './reports.resolver';
import { ReportsService } from './reports.service';

@Module({ imports: [OrdersModule], providers: [ReportsService, ReportsResolver], exports: [ReportsService] })
export class ReportsModule {}
