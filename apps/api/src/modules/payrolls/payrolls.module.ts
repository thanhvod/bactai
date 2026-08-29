import { Module } from '@nestjs/common';
import { PayrollsResolver } from './payrolls.resolver';

@Module({ providers: [PayrollsResolver] })
export class PayrollsModule {}
