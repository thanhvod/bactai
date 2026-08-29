import { Module } from '@nestjs/common';
import { SuppliersResolver } from './suppliers.resolver';

@Module({ providers: [SuppliersResolver] })
export class SuppliersModule {}
