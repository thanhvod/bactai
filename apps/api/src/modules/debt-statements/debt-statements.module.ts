import { Module } from '@nestjs/common';
import { DebtStatementsResolver } from './debt-statements.resolver';
import { DebtStatementsService } from './debt-statements.service';

@Module({ providers: [DebtStatementsService, DebtStatementsResolver], exports: [DebtStatementsService] })
export class DebtStatementsModule {}
