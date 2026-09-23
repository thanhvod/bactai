import { registerEnumType } from '@nestjs/graphql';
import * as S from '@bta/shared';

function reg(name: string, values: readonly string[], description?: string) {
  const obj = Object.fromEntries(values.map((v) => [v, v]));
  registerEnumType(obj, { name, description });
  return obj;
}

/** Enum GraphQL dựng từ @bta/shared — tên khớp Prisma enum. */
export const GqlEnums = {
  MerchantRole: reg('MerchantRole', S.MERCHANT_ROLES),
  MemberStatus: reg('MemberStatus', S.MEMBER_STATUSES),
  ActiveStatus: reg('ActiveStatus', S.ACTIVE_STATUSES),
  VehicleStatus: reg('VehicleStatus', S.VEHICLE_STATUSES),
  CustomerType: reg('CustomerType', S.CUSTOMER_TYPES),
  LocationUsage: reg('LocationUsage', S.LOCATION_USAGES),
  DriverAccountStatus: reg('DriverAccountStatus', S.DRIVER_ACCOUNT_STATUSES),
  CatalogType: reg('CatalogType', S.CATALOG_TYPES),
  OrderStatus: reg('OrderStatus', S.ORDER_STATUSES),
  TripStatus: reg('TripStatus', S.TRIP_STATUSES),
  StopStatus: reg('StopStatus', S.STOP_STATUSES),
  StopType: reg('StopType', S.STOP_TYPES),
  CargoProperty: reg('CargoProperty', S.CARGO_PROPERTIES),
  IncidentSeverity: reg('IncidentSeverity', S.INCIDENT_SEVERITIES),
  IncidentStatus: reg('IncidentStatus', S.INCIDENT_STATUSES),
  ExpenseKind: reg('ExpenseKind', S.EXPENSE_KINDS),
  ExpensePaidBy: reg('ExpensePaidBy', S.EXPENSE_PAID_BYS),
  PaidStatus: reg('PaidStatus', S.PAID_STATUSES),
  DocStatus: reg('DocStatus', S.DOC_STATUSES),
  PaymentInType: reg('PaymentInType', S.PAYMENT_IN_TYPES),
  PaymentMethod: reg('PaymentMethod', S.PAYMENT_METHODS),
  TripAdvanceStatus: reg('TripAdvanceStatus', S.TRIP_ADVANCE_STATUSES),
  DebtStatementStatus: reg('DebtStatementStatus', S.DEBT_STATEMENT_STATUSES),
  PayrollStatus: reg('PayrollStatus', S.PAYROLL_STATUSES),
  PayrollItemType: reg('PayrollItemType', S.PAYROLL_ITEM_TYPES),
  PayrollPeriodType: reg('PayrollPeriodType', S.PAYROLL_PERIOD_TYPES),
  BookingStatus: reg('BookingStatus', S.BOOKING_STATUSES),
  ActorType: reg('ActorType', S.ACTOR_TYPES),
  EntityType: reg('EntityType', S.ENTITY_TYPES),
  ActivityCategory: reg('ActivityCategory', S.ACTIVITY_CATEGORIES),
  NotificationType: reg('NotificationType', S.NOTIFICATION_TYPES),
  DocType: reg('DocType', S.DOC_TYPES),
  ResetPeriod: reg('ResetPeriod', S.RESET_PERIODS),
  AttachmentCategory: reg('AttachmentCategory', S.ATTACHMENT_CATEGORIES),
  ScheduleWarningType: reg('ScheduleWarningType', ['OVERLAP', 'NEAR_OVERLAP']),
  ScheduleSubject: reg('ScheduleSubject', ['VEHICLE', 'DRIVER']),
  ImportEntityType: reg('ImportEntityType', S.IMPORT_ENTITY_TYPES),
  PermissionGrant: reg('PermissionGrant', ['ALLOWED', 'GRANTABLE', 'DENIED']),
  RecipientType: reg('RecipientType', S.RECIPIENT_TYPES),
};
