import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { AuthResolver } from './auth.resolver';
import { FirebaseService } from './firebase.service';

@Global()
@Module({
  providers: [
    FirebaseService,
    AuthResolver,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [FirebaseService],
})
export class AuthModule {}
