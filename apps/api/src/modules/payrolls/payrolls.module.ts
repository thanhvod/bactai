import { Module } from '@nestjs/common';
import { PayrollsResolver } from './payrolls.resolver';
import { PayrollsService } from './payrolls.service';

@Module({ providers: [PayrollsService, PayrollsResolver], exports: [PayrollsService] })
export class PayrollsModule {}
