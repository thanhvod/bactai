import { Field, Float, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { RefView } from '../../common/graphql/common.types';
import { ConnectionType } from '../../common/graphql/pagination';
import { MoneyScalar } from '../../common/graphql/scalars';
import { AgingView } from '../customers/customers.types';

// ---------------- Expenses (phiếu chi) ----------------

@ObjectType()
export class ExpenseView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) kind: string;
  @Field() kindLabel: string;
  @Field() isCost: boolean;
  @Field(() => ID, { nullable: true }) categoryId?: string | null;
  @Field(() => String, { nullable: true }) categoryName?: string | null;
  @Field(() => MoneyScalar) amount: number;
  @Field() expenseDate: Date;
  @Field(() => String) paidBy: string;
  @Field() reimbursable: boolean;
  @Field(() => String) paidStatus: string;
  @Field(() => Date, { nullable: true }) paidAt?: Date | null;
  @Field(() => String, { nullable: true }) paidMethod?: string | null;
  @Field(() => ID, { nullable: true }) supplierId?: string | null;
  @Field(() => ID, { nullable: true }) orderId?: string | null;
  @Field(() => ID, { nullable: true }) tripId?: string | null;
  @Field(() => ID, { nullable: true }) vehicleId?: string | null;
  @Field(() => ID, { nullable: true }) driverId?: string | null;
  @Field(() => RefView, { nullable: true }) supplier?: RefView | null;
  @Field(() => RefView, { nullable: true }) order?: RefView | null;
  @Field(() => RefView, { nullable: true }) trip?: RefView | null;
  @Field(() => RefView, { nullable: true }) vehicle?: RefView | null;
  @Field(() => RefView, { nullable: true }) driver?: RefView | null;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) cancelReason?: string | null;
  @Field(() => Date, { nullable: true }) cancelledAt?: Date | null;
  @Field(() => Int) attachmentCount: number;
  @Field() createdAt: Date;
}

@ObjectType()
export class ExpenseConnection extends ConnectionType(ExpenseView, 'ExpenseConnection') {
  @Field(() => MoneyScalar) totalAmount: number;
}

@InputType()
export class ExpenseFilter {
  @Field(() => [String], { nullable: true }) kind?: string[];
  @Field(() => ID, { nullable: true }) categoryId?: string;
  @Field(() => ID, { nullable: true }) supplierId?: string;
  @Field(() => ID, { nullable: true }) orderId?: string;
  @Field(() => ID, { nullable: true }) tripId?: string;
  @Field(() => ID, { nullable: true }) vehicleId?: string;
  @Field(() => ID, { nullable: true }) driverId?: string;
  @Field(() => String, { nullable: true }) paidBy?: string;
  @Field(() => String, { nullable: true }) paidStatus?: string;
  @Field(() => String, { nullable: true }) status?: string;
  @Field({ nullable: true }) dateFrom?: string;
  @Field({ nullable: true }) dateTo?: string;
  @Field({ nullable: true }) search?: string;
}

@InputType()
export class ExpenseInput {
  @Field(() => String) kind: string;
  @Field(() => ID, { nullable: true }) categoryId?: string | null;
  @Field(() => MoneyScalar) amount: number;
  @Field() expenseDate: string;
  @Field(() => String, { nullable: true }) paidBy?: string;
  @Field({ nullable: true }) reimbursable?: boolean;
  @Field(() => String, { nullable: true }) paidStatus?: string;
  @Field(() => ID, { nullable: true }) supplierId?: string | null;
  @Field(() => ID, { nullable: true }) orderId?: string | null;
  @Field(() => ID, { nullable: true }) tripId?: string | null;
  @Field(() => ID, { nullable: true }) vehicleId?: string | null;
  @Field(() => ID, { nullable: true }) driverId?: string | null;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) note?: string;
  /** Chỉ kiểm tra: chứng từ phải được presign SAU khi tạo phiếu (entityType EXPENSE). */
  @Field(() => [ID], { nullable: true }) attachmentIds?: string[];
}

@InputType()
export class MarkExpensePaidInput {
  @Field(() => Date, { nullable: true }) paidAt?: Date;
  @Field(() => String, { nullable: true }) method?: string;
  @Field({ nullable: true }) note?: string;
}

// ---------------- Payments in (phiếu thu) ----------------

@ObjectType()
export class AllocationView {
  @Field(() => ID) id: string;
  @Field(() => ID) paymentId: string;
  @Field() paymentCode: string;
  @Field(() => ID) orderId: string;
  @Field() orderCode: string;
  @Field(() => MoneyScalar) amount: number;
  @Field() createdAt: Date;
  @Field(() => Date, { nullable: true }) receivedAt?: Date | null;
  @Field(() => String, { nullable: true }) method?: string | null;
}

@ObjectType()
export class CodRemittanceItemView {
  @Field(() => ID) stopId: string;
  @Field() orderCode: string;
  @Field(() => String, { nullable: true }) stopName?: string | null;
  @Field(() => MoneyScalar) amount: number;
}

@ObjectType()
export class PaymentView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) type: string;
  @Field() typeLabel: string;
  /** true với phiếu COD tài xế nộp / hoàn tạm ứng: thu hồi, KHÔNG phải doanh thu */
  @Field() notRevenue: boolean;
  @Field(() => RefView, { nullable: true }) customer?: RefView | null;
  @Field(() => RefView, { nullable: true }) driver?: RefView | null;
  @Field(() => RefView, { nullable: true }) trip?: RefView | null;
  @Field(() => String, { nullable: true }) payerName?: string | null;
  @Field() payerLabel: string;
  @Field(() => MoneyScalar) amount: number;
  @Field(() => MoneyScalar) allocatedAmount: number;
  @Field(() => MoneyScalar) unallocatedAmount: number;
  @Field(() => String) method: string;
  @Field(() => String, { nullable: true }) bankAccount?: string | null;
  @Field(() => String, { nullable: true }) transferNote?: string | null;
  @Field(() => String, { nullable: true }) receivedBy?: string | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field() receivedAt: Date;
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) cancelReason?: string | null;
  @Field(() => Date, { nullable: true }) cancelledAt?: Date | null;
  @Field(() => [AllocationView]) allocations: AllocationView[];
  @Field(() => [CodRemittanceItemView]) codItems: CodRemittanceItemView[];
  @Field(() => MoneyScalar, { nullable: true }) customerCreditBalance?: number | null;
  @Field(() => Int) attachmentCount: number;
  @Field() createdAt: Date;
}

@ObjectType()
export class PaymentConnection extends ConnectionType(PaymentView, 'PaymentConnection') {
  @Field(() => MoneyScalar) totalAmount: number;
}

@InputType()
export class PaymentFilter {
  @Field(() => String, { nullable: true }) type?: string;
  @Field(() => String, { nullable: true }) method?: string;
  @Field(() => ID, { nullable: true }) customerId?: string;
  @Field(() => ID, { nullable: true }) driverId?: string;
  @Field({ nullable: true }) dateFrom?: string;
  @Field({ nullable: true }) dateTo?: string;
  @Field({ nullable: true }) hasUnallocated?: boolean;
  @Field(() => String, { nullable: true }) status?: string;
  @Field({ nullable: true }) search?: string;
}

@InputType()
export class AllocationLineInput {
  @Field(() => ID) orderId: string;
  @Field(() => MoneyScalar) amount: number;
}

@InputType()
export class PaymentInInput {
  @Field(() => String) type: string;
  @Field(() => ID, { nullable: true }) customerId?: string | null;
  @Field(() => ID, { nullable: true }) driverId?: string | null;
  @Field(() => ID, { nullable: true }) tripId?: string | null;
  @Field({ nullable: true }) payerName?: string;
  @Field(() => MoneyScalar) amount: number;
  @Field(() => Date) receivedAt: Date;
  @Field(() => String) method: string;
  @Field({ nullable: true }) bankAccount?: string;
  @Field({ nullable: true }) transferNote?: string;
  @Field({ nullable: true }) receivedBy?: string;
  @Field({ nullable: true }) note?: string;
  @Field(() => [ID], { nullable: true }) codStopIds?: string[];
  @Field(() => [AllocationLineInput], { nullable: true }) allocations?: AllocationLineInput[];
  @Field(() => [ID], { nullable: true }) attachmentIds?: string[];
  @Field({ nullable: true }) clientRequestId?: string;
}

@InputType()
export class UpdatePaymentInInput {
  @Field(() => MoneyScalar, { nullable: true }) amount?: number;
  @Field(() => Date, { nullable: true }) receivedAt?: Date;
  @Field(() => String, { nullable: true }) method?: string;
  @Field({ nullable: true }) payerName?: string;
  @Field({ nullable: true }) bankAccount?: string;
  @Field({ nullable: true }) transferNote?: string;
  @Field({ nullable: true }) receivedBy?: string;
  @Field({ nullable: true }) note?: string;
}

@InputType()
export class AllocatePaymentInput {
  @Field(() => ID) paymentId: string;
  @Field(() => [AllocationLineInput]) lines: AllocationLineInput[];
}

@ObjectType()
export class AllocatePaymentPayload {
  @Field(() => PaymentView) payment: PaymentView;
  @Field(() => MoneyScalar) creditBalance: number;
}

// ---------------- Công nợ khách ----------------

@ObjectType()
export class CustomerDebtRow {
  @Field(() => RefView) customer: RefView;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => MoneyScalar) receivable: number;
  @Field(() => MoneyScalar) paid: number;
  @Field(() => MoneyScalar) remaining: number;
  @Field(() => MoneyScalar) overdueAmount: number;
  @Field(() => Int) maxOverdueDays: number;
  @Field(() => MoneyScalar) creditBalance: number;
  @Field(() => MoneyScalar, { nullable: true }) creditLimit?: number | null;
  @Field() overLimit: boolean;
  @Field(() => Int, { nullable: true }) limitUsagePct?: number | null;
  @Field(() => Int) openOrders: number;
  @Field(() => Int) overdueOrders: number;
  @Field(() => AgingView) aging: AgingView;
}

@ObjectType()
export class CustomerDebtOrderRow {
  @Field(() => ID) orderId: string;
  @Field() code: string;
  @Field(() => ID) customerId: string;
  @Field(() => String) status: string;
  @Field() orderDate: Date;
  @Field(() => String, { nullable: true }) routeSummary?: string | null;
  @Field(() => MoneyScalar) total: number;
  @Field(() => MoneyScalar) allocated: number;
  @Field(() => MoneyScalar) remaining: number;
  @Field(() => Date, { nullable: true }) dueDate?: Date | null;
  @Field(() => Int) overdueDays: number;
  @Field(() => String, { nullable: true }) statementCode?: string | null;
}

@ObjectType()
export class DebtTotals {
  @Field(() => MoneyScalar) receivable: number;
  @Field(() => MoneyScalar) paid: number;
  @Field(() => MoneyScalar) remaining: number;
  @Field(() => MoneyScalar) overdueAmount: number;
  @Field(() => MoneyScalar) creditBalance: number;
  @Field(() => Int) customerCount: number;
}

@ObjectType()
export class CustomerDebtResult {
  @Field(() => [CustomerDebtRow]) rows: CustomerDebtRow[];
  @Field(() => [CustomerDebtOrderRow]) orders: CustomerDebtOrderRow[];
  @Field(() => DebtTotals) totals: DebtTotals;
}

@InputType()
export class CustomerDebtFilter {
  @Field(() => ID, { nullable: true }) customerId?: string;
  @Field({ nullable: true }) asOf?: string;
  @Field({ nullable: true }) overdueOnly?: boolean;
  @Field({ nullable: true }) overLimit?: boolean;
  @Field({ nullable: true }) hasCredit?: boolean;
  @Field({ nullable: true }) openOnly?: boolean;
  @Field({ nullable: true }) search?: string;
}

// ---------------- Công nợ NCC ----------------

@ObjectType()
export class SupplierDebtAgingView {
  @Field(() => MoneyScalar) d0_15: number;
  @Field(() => MoneyScalar) d16_30: number;
  @Field(() => MoneyScalar) d31_60: number;
  @Field(() => MoneyScalar) d60p: number;
}

@ObjectType()
export class SupplierDebtRow {
  @Field(() => RefView) supplier: RefView;
  @Field(() => MoneyScalar) unpaidTotal: number;
  @Field(() => SupplierDebtAgingView) aging: SupplierDebtAgingView;
  @Field(() => Int) oldestDays: number;
  @Field(() => Int) unpaidCount: number;
  @Field(() => [ExpenseView]) expenses: ExpenseView[];
}

@ObjectType()
export class SupplierDebtReport {
  @Field(() => [SupplierDebtRow]) rows: SupplierDebtRow[];
  @Field(() => MoneyScalar) total: number;
}

@InputType()
export class SupplierDebtFilter {
  @Field(() => ID, { nullable: true }) supplierId?: string;
  @Field({ nullable: true }) asOf?: string;
}

// ---------------- Tài xế / COD / tạm ứng ----------------

@ObjectType()
export class DriverCodItemView {
  @Field(() => ID) stopId: string;
  @Field(() => ID) orderId: string;
  @Field() orderCode: string;
  @Field() customerName: string;
  @Field(() => ID, { nullable: true }) tripId?: string | null;
  @Field(() => String, { nullable: true }) tripCode?: string | null;
  @Field(() => Int) stopSequence: number;
  @Field(() => String, { nullable: true }) stopName?: string | null;
  @Field() address: string;
  @Field(() => MoneyScalar) codExpected: number;
  @Field(() => MoneyScalar) codActual: number;
  @Field() collectedAt: Date;
  @Field(() => MoneyScalar) remitted: number;
  @Field(() => MoneyScalar) held: number;
  @Field(() => Int) daysHeld: number;
}

@ObjectType()
export class LedgerEntryView {
  @Field() date: Date;
  @Field() kind: string;
  @Field(() => String, { nullable: true }) docCode?: string | null;
  @Field(() => ID, { nullable: true }) refId?: string | null;
  @Field() description: string;
  /** Làm tăng số tài xế nợ công ty */
  @Field(() => MoneyScalar) driverOwes: number;
  /** Làm giảm số tài xế nợ / tăng số công ty nợ tài xế */
  @Field(() => MoneyScalar) companyOwes: number;
  /** Dương = tài xế nợ công ty */
  @Field(() => MoneyScalar) runningBalance: number;
}

@ObjectType()
export class TripBonusView {
  @Field(() => ID) tripId: string;
  @Field() tripCode: string;
  @Field() orderCode: string;
  @Field() date: Date;
  @Field(() => MoneyScalar) amount: number;
  @Field(() => String) status: string;
}

@ObjectType()
export class TripAdvanceView {
  @Field(() => ID) tripId: string;
  @Field() tripCode: string;
  @Field(() => String) tripStatus: string;
  @Field() plannedStartAt: Date;
  @Field(() => ID) orderId: string;
  @Field() orderCode: string;
  @Field(() => RefView, { nullable: true }) driver?: RefView | null;
  @Field(() => MoneyScalar) advanceAmount: number;
  @Field(() => MoneyScalar) spentFromAdvance: number;
  @Field(() => MoneyScalar) actualCost: number;
  @Field(() => MoneyScalar) returned: number;
  @Field(() => MoneyScalar) reimbursed: number;
  /** dương: tài xế cần nộp lại; âm: công ty cần hoàn thêm */
  @Field(() => MoneyScalar) difference: number;
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) resolution?: string | null;
  @Field(() => Date, { nullable: true }) resolvedAt?: Date | null;
  @Field(() => String, { nullable: true }) reason?: string | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field(() => [ExpenseView]) advances: ExpenseView[];
}

@ObjectType()
export class DriverLedgerView {
  @Field(() => RefView) driver: RefView;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => MoneyScalar) codCollected: number;
  @Field(() => MoneyScalar) codRemitted: number;
  @Field(() => MoneyScalar) codHeld: number;
  @Field(() => MoneyScalar) companyOwesDriver: number;
  @Field(() => MoneyScalar) tripAdvanceOutstanding: number;
  @Field(() => MoneyScalar) salaryAdvanceUndeducted: number;
  @Field(() => MoneyScalar) driverOwesCompany: number;
  @Field(() => MoneyScalar) netBalance: number;
  @Field(() => Date, { nullable: true }) oldestHeldAt?: Date | null;
  @Field(() => Int) daysHeld: number;
  @Field() overAmount: boolean;
  @Field() overDays: boolean;
  @Field(() => [LedgerEntryView]) entries: LedgerEntryView[];
  @Field(() => [DriverCodItemView]) codItems: DriverCodItemView[];
  @Field(() => [TripBonusView]) tripBonuses: TripBonusView[];
  @Field(() => [ExpenseView]) salaryAdvances: ExpenseView[];
  @Field(() => [ExpenseView]) reimbursableExpenses: ExpenseView[];
  @Field(() => [TripAdvanceView]) tripAdvances: TripAdvanceView[];
  @Field(() => [PaymentView]) codRemittances: PaymentView[];
}

@ObjectType()
export class DriverCodHeldRow {
  @Field(() => RefView) driver: RefView;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => MoneyScalar) codCollected: number;
  @Field(() => MoneyScalar) codRemitted: number;
  @Field(() => MoneyScalar) codHeld: number;
  @Field(() => Date, { nullable: true }) oldestHeldAt?: Date | null;
  @Field(() => Int) daysHeld: number;
  @Field() overAmount: boolean;
  @Field() overDays: boolean;
  @Field(() => [DriverCodItemView]) items: DriverCodItemView[];
}

@ObjectType()
export class DriverCodHeldReport {
  @Field(() => [DriverCodHeldRow]) rows: DriverCodHeldRow[];
  @Field(() => MoneyScalar) totalHeld: number;
  @Field(() => MoneyScalar) codWarningAmount: number;
  @Field(() => Int) codWarningDays: number;
}

@InputType()
export class DriverCodHeldFilter {
  @Field(() => ID, { nullable: true }) driverId?: string;
  @Field({ nullable: true }) warningOnly?: boolean;
}

@InputType()
export class TripAdvanceFilter {
  @Field(() => String, { nullable: true }) status?: string;
  @Field(() => ID, { nullable: true }) driverId?: string;
  @Field(() => ID, { nullable: true }) tripId?: string;
  @Field({ nullable: true }) dateFrom?: string;
  @Field({ nullable: true }) dateTo?: string;
}

@InputType()
export class ReconcileTripAdvanceInput {
  @Field(() => ID) tripId: string;
  @Field(() => String) resolution: string;
  @Field(() => MoneyScalar, { nullable: true }) amount?: number | null;
  @Field({ nullable: true }) reason?: string;
  @Field({ nullable: true }) note?: string;
}

// ---------------- Lãi/lỗ đơn & sổ thu chi ----------------

@ObjectType()
export class OrderFinanceView {
  @Field(() => ID) orderId: string;
  @Field() code: string;
  @Field(() => String) status: string;
  @Field(() => MoneyScalar) freightAmount: number;
  @Field(() => MoneyScalar) addonTotal: number;
  @Field(() => MoneyScalar) totalAmount: number;
  @Field(() => MoneyScalar) receivable: number;
  @Field(() => MoneyScalar) paidAmount: number;
  @Field(() => MoneyScalar) remainingAmount: number;
  @Field(() => Date, { nullable: true }) dueDate?: Date | null;
  @Field(() => Int) overdueDays: number;
  @Field(() => MoneyScalar) revenue: number;
  @Field(() => MoneyScalar) tripCost: number;
  @Field(() => MoneyScalar) outsourcedCost: number;
  @Field(() => MoneyScalar) otherCost: number;
  @Field(() => MoneyScalar) cost: number;
  @Field(() => MoneyScalar) profit: number;
  @Field(() => Float, { nullable: true }) margin?: number | null;
  @Field() provisional: boolean;
  @Field(() => [AllocationView]) allocations: AllocationView[];
  @Field(() => [ExpenseView]) expenses: ExpenseView[];
}

@ObjectType()
export class FinanceLedgerEntry {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() date: Date;
  /** IN | OUT */
  @Field() direction: string;
  @Field() type: string;
  @Field() typeLabel: string;
  @Field() counterpart: string;
  @Field() links: string;
  @Field(() => String) status: string;
  @Field(() => MoneyScalar) amount: number;
  /** Phiếu thu COD/hoàn tạm ứng: không phải doanh thu */
  @Field() notRevenue: boolean;
  /** Phiếu chi: đã phát sinh tiền mặt ra (COMPANY + PAID) */
  @Field() cashMoved: boolean;
  @Field(() => String, { nullable: true }) createdByName?: string | null;
}

@ObjectType()
export class FinanceLedgerSummary {
  @Field(() => MoneyScalar) cashIn: number;
  @Field(() => MoneyScalar) customerReceipts: number;
  @Field(() => MoneyScalar) codRemittances: number;
  @Field(() => MoneyScalar) advanceReturns: number;
  @Field(() => MoneyScalar) otherIn: number;
  @Field(() => MoneyScalar) cashOut: number;
  @Field(() => MoneyScalar) unpaidOut: number;
  @Field(() => MoneyScalar) driverPaidOut: number;
}

@ObjectType()
export class FinanceLedgerConnection extends ConnectionType(FinanceLedgerEntry, 'FinanceLedgerConnection') {
  @Field(() => FinanceLedgerSummary) summary: FinanceLedgerSummary;
}

@InputType()
export class FinanceLedgerFilter {
  @Field({ nullable: true }) direction?: string;
  @Field({ nullable: true }) dateFrom?: string;
  @Field({ nullable: true }) dateTo?: string;
  @Field({ nullable: true }) search?: string;
  @Field(() => String, { nullable: true }) status?: string;
}

@ObjectType()
export class FinanceAlertsResult {
  @Field(() => Int) codWarnings: number;
  @Field(() => Int) overdueOrders: number;
}
