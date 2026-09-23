import { Field, Float, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { MoneyScalar } from '../../common/graphql/scalars';

@InputType()
export class ReportFilter {
  /** YYYY-MM-DD, mặc định đầu tháng hiện tại */
  @Field({ nullable: true }) dateFrom?: string;
  /** YYYY-MM-DD, mặc định hôm nay */
  @Field({ nullable: true }) dateTo?: string;
  /** MONTH | WEEK | DAY | CUSTOMER | VEHICLE | DRIVER | ORDER */
  @Field({ nullable: true }) groupBy?: string;
  @Field(() => ID, { nullable: true }) customerId?: string;
  @Field(() => ID, { nullable: true }) vehicleId?: string;
  @Field(() => ID, { nullable: true }) driverId?: string;
  @Field(() => [String], { nullable: true }) status?: string[];
  @Field({ nullable: true }) overdueOnly?: boolean;
  @Field(() => Int, { nullable: true }) year?: number;
  @Field(() => ID, { nullable: true }) vehicleTypeId?: string;
}

@ObjectType()
export class ProfitRow {
  @Field() key: string;
  @Field() label: string;
  @Field(() => String, { nullable: true }) sublabel?: string | null;
  @Field(() => ID, { nullable: true }) entityId?: string | null;
  @Field(() => MoneyScalar) freight: number;
  @Field(() => MoneyScalar) addons: number;
  @Field(() => MoneyScalar) revenue: number;
  @Field(() => MoneyScalar) tripCost: number;
  @Field(() => MoneyScalar) outsourcedCost: number;
  @Field(() => MoneyScalar) otherCost: number;
  @Field(() => MoneyScalar) cost: number;
  @Field(() => MoneyScalar) profit: number;
  @Field(() => Float, { nullable: true }) margin?: number | null;
  @Field(() => Int) orderCount: number;
  @Field() isProvisional: boolean;
  @Field(() => String, { nullable: true }) status?: string | null;
}

@ObjectType()
export class ProfitReport {
  @Field() dateFrom: string;
  @Field() dateTo: string;
  @Field() groupBy: string;
  @Field(() => [ProfitRow]) rows: ProfitRow[];
  @Field(() => ProfitRow) totals: ProfitRow;
  @Field(() => [String]) notes: string[];
}

@ObjectType()
export class VehicleReportRow {
  @Field(() => ID) vehicleId: string;
  @Field() plate: string;
  @Field(() => String, { nullable: true }) type?: string | null;
  @Field(() => String) status: string;
  @Field(() => Int) tripCount: number;
  @Field(() => Int) activeDays: number;
  @Field(() => Float) utilization: number;
  @Field(() => MoneyScalar) revenue: number;
  @Field(() => MoneyScalar) vehicleCost: number;
  @Field(() => MoneyScalar) tripCost: number;
  @Field(() => MoneyScalar) grossProfit: number;
}

@ObjectType()
export class DriverReportRow {
  @Field(() => ID) driverId: string;
  @Field() name: string;
  @Field() code: string;
  @Field(() => String) status: string;
  @Field(() => Int) completedTrips: number;
  @Field(() => Float, { nullable: true }) onTimeRate?: number | null;
  @Field(() => MoneyScalar) revenue: number;
  @Field(() => MoneyScalar) bonusTotal: number;
  @Field(() => MoneyScalar) codHeld: number;
  @Field(() => Int) incidents: number;
}

@ObjectType()
export class AgingReportView {
  @Field(() => MoneyScalar) current: number;
  @Field(() => MoneyScalar) d1_15: number;
  @Field(() => MoneyScalar) d16_30: number;
  @Field(() => MoneyScalar) d31_60: number;
  @Field(() => MoneyScalar) d60p: number;
}

@ObjectType()
export class CustomerDebtReportRow {
  @Field(() => ID) customerId: string;
  @Field() code: string;
  @Field() name: string;
  @Field(() => MoneyScalar, { nullable: true }) creditLimit?: number | null;
  @Field(() => MoneyScalar) receivable: number;
  @Field(() => MoneyScalar) paid: number;
  @Field(() => MoneyScalar) totalDebt: number;
  @Field(() => MoneyScalar) overdue: number;
  @Field(() => Int) maxOverdueDays: number;
  @Field(() => Int) openOrders: number;
  @Field(() => MoneyScalar) creditBalance: number;
  @Field(() => AgingReportView) aging: AgingReportView;
  @Field(() => [String]) warnings: string[];
}

@ObjectType()
export class CustomerDebtReport {
  @Field(() => [CustomerDebtReportRow]) rows: CustomerDebtReportRow[];
  @Field(() => MoneyScalar) totalDebt: number;
  @Field(() => MoneyScalar) totalOverdue: number;
  @Field(() => MoneyScalar) totalCredit: number;
  @Field(() => AgingReportView) aging: AgingReportView;
}

@ObjectType()
export class CodItemView {
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
export class CodRemittanceView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() receivedAt: Date;
  @Field(() => MoneyScalar) amount: number;
  @Field(() => String) method: string;
}

@ObjectType()
export class CodHeldReportRow {
  @Field(() => ID) driverId: string;
  @Field() name: string;
  @Field() code: string;
  @Field() phone: string;
  @Field(() => MoneyScalar) codCollected: number;
  @Field(() => MoneyScalar) codRemitted: number;
  @Field(() => MoneyScalar) codHeld: number;
  @Field(() => Int) heldDays: number;
  @Field(() => Date, { nullable: true }) oldestHeldAt?: Date | null;
  @Field() overAmount: boolean;
  @Field() overDays: boolean;
  @Field(() => [CodItemView]) items: CodItemView[];
  @Field(() => [CodRemittanceView]) remittances: CodRemittanceView[];
}

@ObjectType()
export class CodHeldReport {
  @Field(() => [CodHeldReportRow]) rows: CodHeldReportRow[];
  @Field(() => MoneyScalar) totalHeld: number;
  @Field(() => Int) overThresholdCount: number;
  @Field(() => MoneyScalar) thresholdAmount: number;
  @Field(() => Int) thresholdDays: number;
}

@ObjectType()
export class PayrollReportDriverRow {
  @Field(() => ID) driverId: string;
  @Field() driverName: string;
  @Field(() => MoneyScalar) salary: number;
  @Field(() => MoneyScalar) bonus: number;
  @Field(() => MoneyScalar) advance: number;
  @Field(() => MoneyScalar) deduction: number;
  @Field(() => MoneyScalar) adjustment: number;
  @Field(() => MoneyScalar) net: number;
}

@ObjectType()
export class PayrollReportRow {
  @Field(() => ID) payrollId: string;
  @Field() payrollCode: string;
  @Field() period: string;
  @Field(() => String) status: string;
  @Field(() => Int) driverCount: number;
  @Field(() => MoneyScalar) salary: number;
  @Field(() => MoneyScalar) bonus: number;
  @Field(() => MoneyScalar) advance: number;
  @Field(() => MoneyScalar) deduction: number;
  @Field(() => MoneyScalar) adjustment: number;
  @Field(() => MoneyScalar) net: number;
  @Field(() => Date, { nullable: true }) paidAt?: Date | null;
  @Field(() => [PayrollReportDriverRow]) byDriver: PayrollReportDriverRow[];
}

@ObjectType()
export class DashboardTrip {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) status: string;
  @Field(() => ID) orderId: string;
  @Field() orderCode: string;
  @Field(() => String, { nullable: true }) routeSummary?: string | null;
  @Field(() => String, { nullable: true }) vehiclePlate?: string | null;
  @Field(() => String, { nullable: true }) driverName?: string | null;
  @Field() plannedStartAt: Date;
  @Field(() => Date, { nullable: true }) plannedEndAt?: Date | null;
  @Field() hasWarning: boolean;
  @Field() openIncident: boolean;
  @Field(() => Date, { nullable: true }) lastLocationAt?: Date | null;
}

@ObjectType()
export class DashboardOverdueOrder {
  @Field(() => ID) orderId: string;
  @Field() code: string;
  @Field(() => ID) customerId: string;
  @Field() customerName: string;
  @Field(() => MoneyScalar) remaining: number;
  @Field(() => Int) overdueDays: number;
  @Field(() => Date, { nullable: true }) dueDate?: Date | null;
}

@ObjectType()
export class DashboardCodHolder {
  @Field(() => ID) driverId: string;
  @Field() name: string;
  @Field() phone: string;
  @Field(() => MoneyScalar) codHeld: number;
  @Field(() => Int) daysHeld: number;
  @Field() overThreshold: boolean;
}

@ObjectType()
export class AmountCount {
  @Field(() => MoneyScalar) amount: number;
  @Field(() => Int) count: number;
}

@ObjectType()
export class DashboardSummary {
  @Field() date: string;
  @Field(() => Int) runningTrips: number;
  @Field(() => Int) todayTrips: number;
  @Field(() => Int) ordersNeedAction: number;
  @Field(() => Int) unassignedOrders: number;
  @Field(() => Int) newOrdersToday: number;
  @Field(() => AmountCount) overdueDebt: AmountCount;
  @Field(() => AmountCount) codHeld: AmountCount;
  @Field(() => Int) codOverThreshold: number;
  @Field(() => Int) openIncidents: number;
  @Field(() => Int) payrollPending: number;
  @Field(() => Int) scheduleWarnings: number;
  @Field(() => MoneyScalar) revenueMonth: number;
  @Field(() => MoneyScalar) costMonth: number;
  @Field(() => MoneyScalar) profitMonth: number;
  @Field(() => MoneyScalar) cashInMonth: number;
  @Field(() => MoneyScalar) receivable: number;
  @Field(() => MoneyScalar) supplierPayable: number;
  @Field(() => [DashboardTrip]) todayTripList: DashboardTrip[];
  @Field(() => [DashboardOverdueOrder]) overdueOrders: DashboardOverdueOrder[];
  @Field(() => [DashboardCodHolder]) codHolders: DashboardCodHolder[];
  @Field(() => [TripStatusCount]) tripCountsByStatus: TripStatusCount[];
}

@ObjectType()
export class TripStatusCount {
  @Field(() => String) status: string;
  @Field(() => Int) count: number;
}

@ObjectType()
export class NavBadges {
  @Field(() => Int) dispatch: number;
  @Field(() => Int) finance: number;
  @Field(() => Int) payroll: number;
  @Field(() => Int) incidents: number;
  @Field(() => Int) scheduleWarnings: number;
  @Field(() => Int) overdueCustomers: number;
  @Field(() => Int) codOverThreshold: number;
}

@ObjectType()
export class ReportSummaryItem {
  @Field() key: string;
  @Field() group: string;
  @Field() title: string;
  @Field() headline: string;
  @Field(() => MoneyScalar, { nullable: true }) value?: number | null;
  @Field() route: string;
}
