import { Module } from '@nestjs/common';
import { MerchantsResolver } from './merchants.resolver';
import { MerchantsService } from './merchants.service';

@Module({ providers: [MerchantsService, MerchantsResolver], exports: [MerchantsService] })
export class MerchantsModule {}
