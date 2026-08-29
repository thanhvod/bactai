import { Module } from '@nestjs/common';
import { FinanceResolver } from './finance.resolver';

@Module({ providers: [FinanceResolver] })
export class FinanceModule {}
