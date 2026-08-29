import { Module } from '@nestjs/common';
import { CustomersResolver } from './customers.resolver';

@Module({ providers: [CustomersResolver] })
export class CustomersModule {}
