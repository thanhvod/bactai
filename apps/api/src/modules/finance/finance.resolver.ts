import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth, RequirePermission } from '../../common/auth/decorators';
import { assertPermission, hasPermission } from '../../common/auth/sensitive';
import { forbidden } from '../../common/errors/app-error';
import { PageArgs } from '../../common/graphql/pagination';
import { AdvanceService } from './advance.service';
import { DebtService } from './debt.service';
import { ExpensesService } from './expenses.service';
import {
  AllocatePaymentInput,
  AllocatePaymentPayload,
  CustomerDebtFilter,
  CustomerDebtResult,
  DriverCodHeldFilter,
  DriverCodHeldReport,
  DriverLedgerView,
  ExpenseConnection,
  ExpenseFilter,
  ExpenseInput,
  ExpenseView,
  FinanceAlertsResult,
  FinanceLedgerConnection,
  FinanceLedgerFilter,
  MarkExpensePaidInput,
  OrderFinanceView,
  PaymentConnection,
  PaymentFilter,
  PaymentInInput,
  PaymentView,
  ReconcileTripAdvanceInput,
  SupplierDebtFilter,
  SupplierDebtReport,
  TripAdvanceFilter,
  TripAdvanceView,
  UpdatePaymentInInput,
} from './finance.types';
import { PaymentsService } from './payments.service';

@Resolver()
export class FinanceResolver {
  constructor(
    private readonly expenseSvc: ExpensesService,
    private readonly paymentSvc: PaymentsService,
    private readonly debt: DebtService,
    private readonly advances: AdvanceService,
  ) {}

  // ---- Phiếu chi ----
  @Query(() => ExpenseConnection)
  expenses(@Args('filter', { nullable: true }) filter: ExpenseFilter, @Args() page: PageArgs) {
    return this.expenseSvc.list(filter, page);
  }

  @Query(() => ExpenseView)
  expense(@Args('id', { type: () => ID }) id: string) {
    this.expenseSvc.assertCanView();
    return this.expenseSvc.get(id);
  }

  @Mutation(() => ExpenseView)
  @RequirePermission('expense.create')
  createExpense(@Args('input') input: ExpenseInput) {
    return this.expenseSvc.create(input);
  }

  @Mutation(() => ExpenseView)
  updateExpense(@Args('id', { type: () => ID }) id: string, @Args('input') input: ExpenseInput, @Args('reason') reason: string) {
    return this.expenseSvc.update(id, input, reason);
  }

  @Mutation(() => ExpenseView)
  cancelExpense(@Args('id', { type: () => ID }) id: string, @Args('reason') reason: string) {
    return this.expenseSvc.cancel(id, reason);
  }

  @Mutation(() => ExpenseView)
  @RequirePermission('expense.markPaid')
  markExpensePaid(@Args('id', { type: () => ID }) id: string, @Args('input', { nullable: true }) input?: MarkExpensePaidInput) {
    return this.expenseSvc.markPaid([id], input).then((r) => r[0]);
  }

  @Mutation(() => [ExpenseView])
  @RequirePermission('expense.markPaid')
  markExpensesPaid(@Args('ids', { type: () => [ID] }) ids: string[], @Args('input', { nullable: true }) input?: MarkExpensePaidInput) {
    return this.expenseSvc.markPaid(ids, input);
  }

  // ---- Phiếu thu & phân bổ ----
  @Query(() => PaymentConnection)
  payments(@Args('filter', { nullable: true }) filter: PaymentFilter, @Args() page: PageArgs) {
    return this.paymentSvc.list(filter, page);
  }

  @Query(() => PaymentView)
  payment(@Args('id', { type: () => ID }) id: string) {
    this.paymentSvc.assertCanView();
    return this.paymentSvc.get(id);
  }

  @Mutation(() => PaymentView)
  @RequirePermission('payment.create')
  createPaymentIn(@Args('input') input: PaymentInInput) {
    return this.paymentSvc.create(input);
  }

  @Mutation(() => PaymentView)
  updatePaymentIn(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdatePaymentInInput, @Args('reason') reason: string) {
    return this.paymentSvc.update(id, input, reason);
  }

  @Mutation(() => PaymentView)
  cancelPaymentIn(@Args('id', { type: () => ID }) id: string, @Args('reason') reason: string) {
    return this.paymentSvc.cancel(id, reason);
  }

  @Mutation(() => AllocatePaymentPayload)
  @RequirePermission('payment.allocate')
  allocatePayment(@Args('input') input: AllocatePaymentInput) {
    return this.paymentSvc.allocate(input);
  }

  @Mutation(() => PaymentView)
  unallocatePayment(@Args('allocationId', { type: () => ID }) allocationId: string, @Args('reason') reason: string) {
    return this.paymentSvc.unallocate(allocationId, reason);
  }

  // ---- Công nợ ----
  @Query(() => CustomerDebtResult)
  @RequirePermission('debt.view')
  customerDebt(@Args('filter', { nullable: true }) filter?: CustomerDebtFilter) {
    return this.debt.customerDebt(filter);
  }

  @Query(() => SupplierDebtReport)
  @RequirePermission('supplierDebt.view')
  supplierDebt(@Args('filter', { nullable: true }) filter?: SupplierDebtFilter) {
    return this.debt.supplierDebt(filter);
  }

  /** Tài xế gọi được (chỉ sổ của mình, bỏ qua driverId truyền vào). */
  @Query(() => DriverLedgerView)
  @Auth('USER', 'DRIVER')
  driverLedger(@Args('driverId', { type: () => ID, nullable: true }) driverId?: string) {
    return this.debt.driverLedger(driverId);
  }

  @Query(() => DriverCodHeldReport)
  @Auth('USER', 'DRIVER')
  driverCodHeld(@Args('filter', { nullable: true }) filter?: DriverCodHeldFilter) {
    return this.debt.driverCodHeld(filter);
  }

  // ---- Tạm ứng chuyến ----
  @Query(() => [TripAdvanceView])
  tripAdvances(@Args('filter', { nullable: true }) filter?: TripAdvanceFilter) {
    if (!hasPermission('tripAdvance.reconcile') && !hasPermission('finance.view')) throw forbidden();
    return this.advances.list(filter);
  }

  @Mutation(() => TripAdvanceView)
  @RequirePermission('tripAdvance.reconcile')
  reconcileTripAdvance(@Args('input') input: ReconcileTripAdvanceInput) {
    return this.advances.reconcile(input);
  }

  // ---- Lãi/lỗ & sổ thu chi ----
  @Query(() => OrderFinanceView)
  @RequirePermission('order.view')
  orderFinance(@Args('orderId', { type: () => ID }) orderId: string) {
    return this.debt.orderFinance(orderId);
  }

  @Query(() => FinanceLedgerConnection)
  financeLedger(@Args('filter', { nullable: true }) filter: FinanceLedgerFilter, @Args() page: PageArgs) {
    return this.debt.financeLedger(filter, page);
  }

  @Mutation(() => FinanceAlertsResult)
  async runFinanceAlerts() {
    assertPermission('finance.view');
    return { codWarnings: await this.debt.scanCodWarnings(), overdueOrders: await this.debt.scanOverdueOrders() };
  }
}
