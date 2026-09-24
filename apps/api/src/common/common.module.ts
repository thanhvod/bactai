import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit/audit.service';
import { FinanceCalcService } from './finance/finance-calc.service';
import { FirebaseService } from './auth/firebase.service';
import { JwtService } from './auth/jwt.service';
import { PermissionService } from './auth/permission.service';
import { PrincipalResolver } from './auth/principal.resolver';
import { MoneyScalar } from './graphql/scalars';
import { IdempotencyService } from './idempotency/idempotency.service';
import { JobRunner } from './jobs/job-runner';
import { NotifyService } from './notifications/notify.service';
import { NumberingService } from './numbering/numbering.service';
import { OtpService } from './otp/otp.service';
import { PushService } from './push/push.service';
import { PrismaService } from './prisma/prisma.service';
import { StorageService } from './storage/storage.service';

const providers = [
  PrismaService,
  OtpService,
  PushService,
  AuditService,
  FirebaseService,
  FinanceCalcService,
  JwtService,
  PermissionService,
  PrincipalResolver,
  IdempotencyService,
  JobRunner,
  NotifyService,
  NumberingService,
  StorageService,
  MoneyScalar,
];

@Global()
@Module({ providers, exports: providers })
export class CommonModule {}
