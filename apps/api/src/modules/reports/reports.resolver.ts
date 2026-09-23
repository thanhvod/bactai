import { Args, Query, Resolver } from '@nestjs/graphql';
import { RequirePermission } from '../../common/auth/decorators';
import { ReportsService } from './reports.service';
import {
  CodHeldReport,
  CustomerDebtReport,
  DashboardSummary,
  DriverReportRow,
  NavBadges,
  PayrollReportRow,
  ProfitReport,
  ReportFilter,
  ReportSummaryItem,
  VehicleReportRow,
} from './reports.types';

@Resolver()
export class ReportsResolver {
  constructor(private readonly svc: ReportsService) {}

  @Query(() => DashboardSummary)
  @RequirePermission('dashboard.view')
  dashboardSummary(@Args('date', { nullable: true }) date?: string) {
    return this.svc.dashboard({ date });
  }

  @Query(() => NavBadges)
  navBadges() {
    return this.svc.navBadges();
  }

  @Query(() => ProfitReport)
  @RequirePermission('report.view')
  reportProfit(@Args('filter', { nullable: true }) filter?: ReportFilter) {
    return this.svc.profit(filter ?? {});
  }

  @Query(() => [VehicleReportRow])
  @RequirePermission('report.view')
  reportVehicles(@Args('filter', { nullable: true }) filter?: ReportFilter) {
    return this.svc.vehicles(filter ?? {});
  }

  @Query(() => [DriverReportRow])
  @RequirePermission('report.view')
  reportDrivers(@Args('filter', { nullable: true }) filter?: ReportFilter) {
    return this.svc.drivers(filter ?? {});
  }

  @Query(() => CustomerDebtReport)
  @RequirePermission('debt.view')
  reportCustomerDebt(@Args('filter', { nullable: true }) filter?: ReportFilter) {
    return this.svc.customerDebt(filter ?? {});
  }

  @Query(() => CodHeldReport)
  @RequirePermission('driverLedger.view')
  reportCodHeld(@Args('filter', { nullable: true }) filter?: ReportFilter) {
    return this.svc.codHeld(filter ?? {});
  }

  @Query(() => [PayrollReportRow])
  @RequirePermission('payroll.view')
  reportPayroll(@Args('filter', { nullable: true }) filter?: ReportFilter) {
    return this.svc.payroll(filter ?? {});
  }

  @Query(() => [ReportSummaryItem])
  @RequirePermission('report.view')
  reportSummary(@Args('filter', { nullable: true }) filter?: ReportFilter) {
    return this.svc.summary(filter ?? {});
  }
}
