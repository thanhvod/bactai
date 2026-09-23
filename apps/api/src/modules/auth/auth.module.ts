import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { DriverAuthController } from './driver-auth.controller';
import { MerchantAuthController } from './merchant-auth.controller';

@Module({ providers: [AuthService, AuthResolver], controllers: [DriverAuthController, MerchantAuthController], exports: [AuthService] })
export class AuthModule {}
