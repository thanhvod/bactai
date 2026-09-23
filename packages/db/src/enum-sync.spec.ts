import { describe, expect, it } from 'vitest';
import { Prisma } from '@prisma/client';
import * as S from '@bta/shared';

const enumOf = (name: string) => Prisma.dmmf.datamodel.enums.find((e) => e.name === name)!.values.map((v) => v.name);

const pairs: [string, readonly string[]][] = [
  ['OrderStatus', S.ORDER_STATUSES],
  ['TripStatus', S.TRIP_STATUSES],
  ['StopStatus', S.STOP_STATUSES],
  ['StopType', S.STOP_TYPES],
  ['CustomerType', S.CUSTOMER_TYPES],
  ['ActiveStatus', S.ACTIVE_STATUSES],
  ['VehicleStatus', S.VEHICLE_STATUSES],
  ['LocationUsage', S.LOCATION_USAGES],
  ['DriverAccountStatus', S.DRIVER_ACCOUNT_STATUSES],
  ['MemberStatus', S.MEMBER_STATUSES],
  ['PaymentInType', S.PAYMENT_IN_TYPES],
  ['PaymentMethod', S.PAYMENT_METHODS],
  ['DocStatus', S.DOC_STATUSES],
  ['ExpenseKind', S.EXPENSE_KINDS],
  ['ExpensePaidBy', S.EXPENSE_PAID_BYS],
  ['PaidStatus', S.PAID_STATUSES],
  ['TripAdvanceStatus', S.TRIP_ADVANCE_STATUSES],
  ['DebtStatementStatus', S.DEBT_STATEMENT_STATUSES],
  ['PayrollStatus', S.PAYROLL_STATUSES],
  ['PayrollItemType', S.PAYROLL_ITEM_TYPES],
  ['PayrollPeriodType', S.PAYROLL_PERIOD_TYPES],
  ['IncidentSeverity', S.INCIDENT_SEVERITIES],
  ['IncidentStatus', S.INCIDENT_STATUSES],
  ['BookingStatus', S.BOOKING_STATUSES],
  ['ActorType', S.ACTOR_TYPES],
  ['RecipientType', S.RECIPIENT_TYPES],
  ['EntityType', S.ENTITY_TYPES],
  ['ActivityCategory', S.ACTIVITY_CATEGORIES],
  ['NotificationType', S.NOTIFICATION_TYPES],
  ['DocType', S.DOC_TYPES],
  ['ResetPeriod', S.RESET_PERIODS],
  ['CatalogType', S.CATALOG_TYPES],
  ['CargoProperty', S.CARGO_PROPERTIES],
  ['AttachmentCategory', S.ATTACHMENT_CATEGORIES],
  ['MerchantRole', S.MERCHANT_ROLES],
  ['ImportEntityType', S.IMPORT_ENTITY_TYPES],
];

describe('Prisma enums khớp @bta/shared', () => {
  for (const [name, shared] of pairs) {
    it(name, () => {
      expect([...enumOf(name)].sort()).toEqual([...shared].sort());
    });
  }
  it('mọi model nghiệp vụ có merchantId', () => {
    const exempt = new Set([
      'UserAccount', 'UserRefreshToken', 'OtpCode', 'CustomerAccount', 'CustomerAddress', 'CustomerRefreshToken',
      'DriverRefreshToken', 'BookingNote', 'Merchant',
    ]);
    const missing = Prisma.dmmf.datamodel.models
      .filter((m) => !exempt.has(m.name) && !m.fields.some((f) => f.name === 'merchantId'))
      .map((m) => m.name);
    expect(missing).toEqual([]);
  });
});
