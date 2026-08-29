import { Module } from '@nestjs/common';
import { MerchantResolver } from './merchant.resolver';

@Module({ providers: [MerchantResolver] })
export class MerchantModule {}
