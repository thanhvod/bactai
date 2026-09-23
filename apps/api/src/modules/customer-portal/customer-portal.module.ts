import { Module } from '@nestjs/common';
import { CustomerAuthController } from './customer-auth.controller';
import { PortalResolver } from './portal.resolver';
import { PortalService } from './portal.service';

@Module({ providers: [PortalService, PortalResolver], controllers: [CustomerAuthController] })
export class CustomerPortalModule {}
