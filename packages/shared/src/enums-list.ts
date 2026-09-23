/** Tuple hằng cho z.enum (zod cần tuple readonly có ≥1 phần tử). */
import {
  ACTIVE_STATUS,
  BOOKING_STATUS,
  CARGO_PROPERTY,
  CATALOG_TYPE,
  CUSTOMER_TYPE,
  DOC_TYPE,
  EXPENSE_KIND,
  EXPENSE_PAID_BY,
  INCIDENT_SEVERITY,
  INCIDENT_STATUS,
  LOCATION_USAGE,
  ORDER_STATUS,
  PAYMENT_IN_TYPE,
  PAYMENT_METHOD,
  PAYROLL_PERIOD_TYPE,
  STOP_STATUS,
  STOP_TYPE,
  TRIP_STATUS,
  VEHICLE_STATUS,
} from './status';

function tuple<T extends object>(o: T): [keyof T & string, ...(keyof T & string)[]] {
  return Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];
}

export const ACTIVE_STATUSES = tuple(ACTIVE_STATUS);
export const BOOKING_STATUSES = tuple(BOOKING_STATUS);
export const CARGO_PROPERTIES = tuple(CARGO_PROPERTY);
export const CATALOG_TYPES = tuple(CATALOG_TYPE);
export const CUSTOMER_TYPES = tuple(CUSTOMER_TYPE);
export const DOC_TYPES = tuple(DOC_TYPE);
export const EXPENSE_KINDS = tuple(EXPENSE_KIND);
export const EXPENSE_PAID_BYS = tuple(EXPENSE_PAID_BY);
export const INCIDENT_SEVERITIES = tuple(INCIDENT_SEVERITY);
export const INCIDENT_STATUSES = tuple(INCIDENT_STATUS);
export const LOCATION_USAGES = tuple(LOCATION_USAGE);
export const ORDER_STATUSES = tuple(ORDER_STATUS);
export const PAYMENT_IN_TYPES = tuple(PAYMENT_IN_TYPE);
export const PAYMENT_METHODS = tuple(PAYMENT_METHOD);
export const PAYROLL_PERIOD_TYPES = tuple(PAYROLL_PERIOD_TYPE);
export const RESET_PERIODS = ['MONTHLY', 'YEARLY', 'NEVER'] as const;
export const STOP_STATUSES = tuple(STOP_STATUS);
export const STOP_TYPES = tuple(STOP_TYPE);
export const TRIP_STATUSES = tuple(TRIP_STATUS);
export const VEHICLE_STATUSES = tuple(VEHICLE_STATUS);
export const MERCHANT_ROLES_LIST = ['ADMIN', 'OPERATION', 'ACCOUNTANT'] as const;
