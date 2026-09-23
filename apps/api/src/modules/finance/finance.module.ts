import { Module } from '@nestjs/common';
import { AdvanceService } from './advance.service';
import { DebtService } from './debt.service';
import { ExpensesService } from './expenses.service';
import { FinanceResolver } from './finance.resolver';
import { PaymentsService } from './payments.service';

@Module({
  providers: [AdvanceService, ExpensesService, PaymentsService, DebtService, FinanceResolver],
  exports: [AdvanceService, ExpensesService, PaymentsService, DebtService],
})
export class FinanceModule {}
