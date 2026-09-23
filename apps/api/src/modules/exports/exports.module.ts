import { Module } from '@nestjs/common';
import { ReportsModule } from '../reports/reports.module';
import { ExportsResolver } from './exports.resolver';
import { ExportsService } from './exports.service';

@Module({ imports: [ReportsModule], providers: [ExportsService, ExportsResolver], exports: [ExportsService] })
export class ExportsModule {}
