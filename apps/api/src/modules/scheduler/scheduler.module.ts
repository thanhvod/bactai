import { Module } from '@nestjs/common';
import { FinanceModule } from '../finance/finance.module';
import { SchedulerService } from './scheduler.service';

@Module({ imports: [FinanceModule], providers: [SchedulerService], exports: [SchedulerService] })
export class SchedulerModule {}
