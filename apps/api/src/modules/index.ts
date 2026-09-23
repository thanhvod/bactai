/**
 * Danh sách module domain. Mỗi task/agent thêm module của mình vào đây (1 dòng import + 1 phần tử).
 */
import { ActivityModule } from './activity/activity.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { CustomerPortalModule } from './customer-portal/customer-portal.module';
import { CustomersModule } from './customers/customers.module';
import { DriverAppModule } from './driver-app/driver-app.module';
import { DriversModule } from './drivers/drivers.module';
import { FinanceModule } from './finance/finance.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { HealthModule } from './health/health.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { IncidentsModule } from './incidents/incidents.module';
import { OrdersModule } from './orders/orders.module';
import { TripsModule } from './trips/trips.module';
import { MerchantsModule } from './merchants/merchants.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';
import { DebtStatementsModule } from './debt-statements/debt-statements.module';
import { DocumentsModule } from './documents/documents.module';
import { ExportsModule } from './exports/exports.module';
import { ImportsModule } from './imports/imports.module';
import { PayrollsModule } from './payrolls/payrolls.module';
import { ReportsModule } from './reports/reports.module';

export const DOMAIN_MODULES = [
  HealthModule,
  AuthModule,
  MerchantsModule,
  UsersModule,
  CatalogsModule,
  ActivityModule,
  AttachmentsModule,
  NotificationsModule,
  CustomersModule,
  TripsModule,
  OrdersModule,
  DispatchModule,
  IncidentsModule,
  BookingsModule,
  CustomerPortalModule,
  DriversModule,
  DriverAppModule,
  VehiclesModule,
  SuppliersModule,
  FinanceModule,
  DocumentsModule,
  PayrollsModule,
  DebtStatementsModule,
  ReportsModule,
  ExportsModule,
  ImportsModule,
  SchedulerModule,
];
