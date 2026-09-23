/** Zod schema dùng chung cho form web và validate input API. Tiền: số nguyên VND ≥ 0. */
import { z } from 'zod';
import { MIN_REASON_LENGTH } from './permissions';
import {
  ACTIVE_STATUSES,
  BOOKING_STATUSES,
  CARGO_PROPERTIES,
  CATALOG_TYPES,
  CUSTOMER_TYPES,
  DOC_TYPES,
  EXPENSE_KINDS,
  EXPENSE_PAID_BYS,
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  LOCATION_USAGES,
  MERCHANT_ROLES_LIST,
  ORDER_STATUSES,
  PAYMENT_IN_TYPES,
  PAYMENT_METHODS,
  PAYROLL_PERIOD_TYPES,
  RESET_PERIODS,
  STOP_STATUSES,
  STOP_TYPES,
  TRIP_STATUSES,
  VEHICLE_STATUSES,
} from './enums-list';

/** GraphQL/form hay gửi null cho trường bỏ trống — coi null như undefined để không fail validate im lặng. */
const nn = <T>(v: T | null | undefined): T | undefined => (v === null ? undefined : v);

export const money = z.coerce.number().int('Phải là số nguyên VND').min(0, 'Không được âm');
export const moneySigned = z.coerce.number().int('Phải là số nguyên VND');
export const id = z.string().min(1);
export const optionalText = z.string().trim().max(2000).optional().nullable();
export const phone = z
  .string()
  .trim()
  .regex(/^[0-9+][0-9 .-]{6,19}$/, 'Số điện thoại không hợp lệ');
export const email = z.string().trim().email('Email không hợp lệ');
export const isoDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày dạng YYYY-MM-DD');
export const dateTime = z.coerce.date();
export const reason = z.string().trim().min(MIN_REASON_LENGTH, `Lý do tối thiểu ${MIN_REASON_LENGTH} ký tự`).max(1000);

export const contactSchema = z.object({
  name: z.string().trim().max(200).optional().nullable(),
  role: z.string().trim().max(100).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().max(200).optional().nullable(),
  zalo: z.string().trim().max(100).optional().nullable(),
});
export type ContactInput = z.infer<typeof contactSchema>;

// ---------- Merchant ----------
export const createMerchantSchema = z.object({
  name: z.string().trim().min(2, 'Tên nhà xe tối thiểu 2 ký tự').max(200),
  legalName: z.string().trim().max(300).optional().nullable(),
  taxCode: z.string().trim().max(50).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  contactName: z.string().trim().max(200).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().max(200).optional().nullable(),
});
export type CreateMerchantInput = z.infer<typeof createMerchantSchema>;

export const merchantProfileSchema = createMerchantSchema.extend({
  businessType: z.string().trim().max(100).optional().nullable(),
  province: z.string().trim().max(100).optional().nullable(),
  district: z.string().trim().max(100).optional().nullable(),
  yardName: z.string().trim().max(200).optional().nullable(),
  representativeName: z.string().trim().max(200).optional().nullable(),
  representativeTitle: z.string().trim().max(100).optional().nullable(),
  dispatchHotline: z.string().trim().max(30).optional().nullable(),
  intro: z.string().trim().max(3000).optional().nullable(),
  publicProfile: z.boolean().nullish().transform(nn),
  serviceAreas: z.array(z.string().trim().max(100)).max(50).nullish().transform(nn),
  services: z.array(z.string().trim().max(200)).max(50).nullish().transform(nn),
});
export type MerchantProfileInput = z.infer<typeof merchantProfileSchema>;

export const merchantSettingsSchema = z.object({
  payrollPeriodType: z.enum(PAYROLL_PERIOD_TYPES),
  payrollStartDay: z.coerce.number().int().min(1).max(28),
  nearOverlapMinutes: z.coerce.number().int().min(0).max(24 * 60),
  defaultTripHours: z.coerce.number().int().min(1).max(240),
  overlapWarnVehicle: z.boolean(),
  overlapWarnDriver: z.boolean(),
  codWarningAmount: money,
  codWarningDays: z.coerce.number().int().min(0).max(365),
  codDashboardAlert: z.boolean(),
  defaultDebtDays: z.coerce.number().int().min(0).max(365),
  defaultCreditLimit: money.nullable().optional(),
  warnOverLimit: z.boolean(),
  warnOverdue: z.boolean(),
  gpsRetentionDays: z.coerce.number().int().min(30).max(3650),
});
export type MerchantSettingsInput = z.infer<typeof merchantSettingsSchema>;

export const numberFormatSchema = z.object({
  docType: z.enum(DOC_TYPES),
  prefix: z.string().trim().min(1).max(10),
  separator: z.string().max(3),
  datePart: z.enum(['YYYYMM', 'YYYY', 'YYMM', 'NONE']),
  digits: z.coerce.number().int().min(2).max(8),
  resetPeriod: z.enum(RESET_PERIODS),
});
export type NumberFormatInput = z.infer<typeof numberFormatSchema>;

export const inviteUserSchema = z.object({
  email,
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(30).optional().nullable(),
  role: z.enum(MERCHANT_ROLES_LIST),
  extraPermissions: z.array(z.string()).nullish().transform(nn),
  note: optionalText,
});
export type InviteUserInput = z.infer<typeof inviteUserSchema>;

export const catalogItemSchema = z.object({
  type: z.enum(CATALOG_TYPES),
  code: z.string().trim().max(50).optional().nullable(),
  name: z.string().trim().min(1, 'Nhập tên').max(200),
  appliesTo: z.string().trim().max(200).optional().nullable(),
  sortOrder: z.coerce.number().int().nullish().transform(nn),
  active: z.boolean().nullish().transform(nn),
});
export type CatalogItemInput = z.infer<typeof catalogItemSchema>;

// ---------- Master data ----------
export const customerSchema = z.object({
  type: z.enum(CUSTOMER_TYPES),
  name: z.string().trim().min(1, 'Nhập tên khách hàng').max(300),
  legalName: z.string().trim().max(300).optional().nullable(),
  taxCode: z.string().trim().max(50).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().max(200).optional().nullable(),
  invoiceEmail: z.string().trim().max(200).optional().nullable(),
  billingAddress: z.string().trim().max(500).optional().nullable(),
  groupId: id.optional().nullable(),
  primaryContact: contactSchema.optional().nullable(),
  creditLimit: money.optional().nullable(),
  defaultDebtDays: z.coerce.number().int().min(0).max(365).optional().nullable(),
  note: optionalText,
  status: z.enum(ACTIVE_STATUSES).nullish().transform(nn),
});
export type CustomerInput = z.infer<typeof customerSchema>;

export const customerLocationSchema = z.object({
  name: z.string().trim().min(1, 'Nhập tên kho/địa chỉ').max(200),
  usage: z.enum(LOCATION_USAGES),
  address: z.string().trim().min(1, 'Nhập địa chỉ').max(500),
  province: z.string().trim().max(100).optional().nullable(),
  lat: z.coerce.number().min(-90).max(90).optional().nullable(),
  lng: z.coerce.number().min(-180).max(180).optional().nullable(),
  contactName: z.string().trim().max(200).optional().nullable(),
  contactPhone: z.string().trim().max(30).optional().nullable(),
  note: optionalText,
  isDefault: z.boolean().nullish().transform(nn),
});
export type CustomerLocationInput = z.infer<typeof customerLocationSchema>;

export const driverSchema = z.object({
  name: z.string().trim().min(1, 'Nhập tên tài xế').max(200),
  phone: phone,
  dob: isoDateString.optional().nullable(),
  idNumber: z.string().trim().max(30).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  emergencyContact: z.string().trim().max(300).optional().nullable(),
  licenseClass: z.string().trim().max(10).optional().nullable(),
  licenseNumber: z.string().trim().max(50).optional().nullable(),
  licenseExpiresAt: isoDateString.optional().nullable(),
  status: z.enum(ACTIVE_STATUSES).nullish().transform(nn),
  note: optionalText,
  /** Chỉ dùng khi tạo mới: mốc lương đầu tiên */
  fixedSalary: money.optional().nullable(),
  salaryEffectiveFrom: isoDateString.optional().nullable(),
  salaryReason: z.string().trim().max(300).optional().nullable(),
  appLoginEnabled: z.boolean().nullish().transform(nn),
});
export type DriverInput = z.infer<typeof driverSchema>;

export const salaryHistorySchema = z.object({
  amount: money,
  effectiveFrom: isoDateString,
  reason: z.string().trim().max(300).optional().nullable(),
});
export type SalaryHistoryInput = z.infer<typeof salaryHistorySchema>;

export const vehicleSchema = z.object({
  plate: z.string().trim().min(4, 'Nhập biển số').max(20),
  typeId: id.optional().nullable(),
  capacityTons: z.coerce.number().min(0).max(1000).optional().nullable(),
  brandModel: z.string().trim().max(200).optional().nullable(),
  year: z.coerce.number().int().min(1980).max(2100).optional().nullable(),
  chassisNo: z.string().trim().max(50).optional().nullable(),
  engineNo: z.string().trim().max(50).optional().nullable(),
  boxSize: z.string().trim().max(100).optional().nullable(),
  fuelNorm: z.string().trim().max(100).optional().nullable(),
  registrationExpiresAt: isoDateString.optional().nullable(),
  insuranceExpiresAt: isoDateString.optional().nullable(),
  status: z.enum(VEHICLE_STATUSES).nullish().transform(nn),
  note: optionalText,
});
export type VehicleInput = z.infer<typeof vehicleSchema>;

export const supplierSchema = z.object({
  name: z.string().trim().min(1, 'Nhập tên NCC').max(300),
  typeId: id.optional().nullable(),
  taxCode: z.string().trim().max(50).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  bankName: z.string().trim().max(200).optional().nullable(),
  bankAccountNo: z.string().trim().max(50).optional().nullable(),
  paymentTerms: z.string().trim().max(300).optional().nullable(),
  contacts: z.array(contactSchema).max(10).nullish().transform(nn),
  note: optionalText,
  status: z.enum(ACTIVE_STATUSES).nullish().transform(nn),
});
export type SupplierInput = z.infer<typeof supplierSchema>;

// ---------- Order ----------
export const orderStopSchema = z.object({
  id: id.nullish().transform(nn),
  type: z.enum(STOP_TYPES),
  sequence: z.coerce.number().int().min(1).nullish().transform(nn),
  locationId: id.optional().nullable(),
  locationName: z.string().trim().max(200).optional().nullable(),
  address: z.string().trim().min(1, 'Nhập địa chỉ').max(500),
  province: z.string().trim().max(100).optional().nullable(),
  lat: z.coerce.number().optional().nullable(),
  lng: z.coerce.number().optional().nullable(),
  contactName: z.string().trim().max(200).optional().nullable(),
  contactPhone: z.string().trim().max(30).optional().nullable(),
  plannedAt: dateTime.optional().nullable(),
  codExpected: money.optional().nullable(),
  note: optionalText,
});
export type OrderStopInput = z.infer<typeof orderStopSchema>;

export const cargoLineSchema = z.object({
  id: id.nullish().transform(nn),
  name: z.string().trim().min(1, 'Nhập tên hàng').max(300),
  cargoTypeId: id.optional().nullable(),
  weightKg: z.coerce.number().min(0).optional().nullable(),
  volumeM3: z.coerce.number().min(0).optional().nullable(),
  quantity: z.coerce.number().min(0).optional().nullable(),
  packagingUnitId: id.optional().nullable(),
  packagingUnit: z.string().trim().max(50).optional().nullable(),
  properties: z.array(z.enum(CARGO_PROPERTIES)).nullish().transform(nn),
  declaredValue: money.optional().nullable(),
  pickupStopId: id.optional().nullable(),
  dropoffStopId: id.optional().nullable(),
  note: optionalText,
});
export type CargoLineInput = z.infer<typeof cargoLineSchema>;

export const orderAddonSchema = z.object({
  id: id.nullish().transform(nn),
  serviceId: id.optional().nullable(),
  name: z.string().trim().min(1).max(200),
  amount: money,
  note: optionalText,
});
export type OrderAddonInput = z.infer<typeof orderAddonSchema>;

export const createOrderSchema = z.object({
  customerId: id,
  orderDate: isoDateString.nullish().transform(nn),
  freightAmount: money,
  dueDate: isoDateString.optional().nullable(),
  status: z.enum(['DRAFT', 'PENDING_CONFIRMATION', 'CONFIRMED']).nullish().transform(nn),
  requiredVehicleTypeId: id.optional().nullable(),
  requiredCapacityTons: z.coerce.number().min(0).optional().nullable(),
  note: optionalText,
  internalNote: optionalText,
  stops: z.array(orderStopSchema).min(1, 'Cần ít nhất 1 điểm dừng'),
  cargoLines: z.array(cargoLineSchema).nullish().transform(nn),
  addons: z.array(orderAddonSchema).nullish().transform(nn),
  bookingId: id.optional().nullable(),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderSchema = createOrderSchema.partial().extend({ reason: reason.optional() });
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

export const orderPricingSchema = z.object({
  freightAmount: money,
  addons: z.array(orderAddonSchema).nullish().transform(nn),
  dueDate: isoDateString.optional().nullable(),
  reason: reason.nullish().transform(nn),
});
export type OrderPricingInput = z.infer<typeof orderPricingSchema>;

export const changeStatusSchema = z.object({
  status: z.string().min(1),
  reason: z.string().trim().max(1000).optional().nullable(),
  note: optionalText,
  actualAt: dateTime.optional().nullable(),
  pauseReasonId: id.optional().nullable(),
  clientRequestId: z.string().max(100).optional().nullable(),
});
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
export const orderStatusSchema = changeStatusSchema.extend({ status: z.enum(ORDER_STATUSES) });
export const tripStatusSchema = changeStatusSchema.extend({ status: z.enum(TRIP_STATUSES) });
export const stopStatusSchema = changeStatusSchema.extend({ status: z.enum(STOP_STATUSES) });

export const externalTransportSchema = z.object({
  supplierId: id.optional().nullable(),
  vehiclePlate: z.string().trim().max(20).optional().nullable(),
  driverName: z.string().trim().max(200).optional().nullable(),
  driverPhone: z.string().trim().max(30).optional().nullable(),
  agreedAmount: money.optional().nullable(),
  note: optionalText,
});
export type ExternalTransportInput = z.infer<typeof externalTransportSchema>;

export const tripSchema = z.object({
  orderId: id,
  vehicleId: id.optional().nullable(),
  driverId: id.optional().nullable(),
  stopIds: z.array(id).nullish().transform(nn),
  plannedStartAt: dateTime,
  plannedEndAt: dateTime.optional().nullable(),
  driverBonusAmount: money.optional().nullable(),
  note: optionalText,
  isExternal: z.boolean().nullish().transform(nn),
  externalTransport: externalTransportSchema.optional().nullable(),
  overrideReason: z.string().trim().max(1000).optional().nullable(),
  reason: z.string().trim().max(1000).optional().nullable(),
});
export type TripInput = z.infer<typeof tripSchema>;

export const codSubmitSchema = z.object({
  stopId: id,
  amount: money,
  note: optionalText,
  reason: z.string().trim().max(1000).optional().nullable(),
  clientRequestId: z.string().max(100).optional().nullable(),
  attachmentIds: z.array(id).nullish().transform(nn),
});
export type CodSubmitInput = z.infer<typeof codSubmitSchema>;

export const incidentSchema = z.object({
  typeId: id.optional().nullable(),
  title: z.string().trim().min(1, 'Nhập tiêu đề').max(300),
  severity: z.enum(INCIDENT_SEVERITIES),
  description: optionalText,
  orderId: id.optional().nullable(),
  tripId: id.optional().nullable(),
  stopId: id.optional().nullable(),
  location: z.string().trim().max(500).optional().nullable(),
  assigneeUserId: id.optional().nullable(),
  status: z.enum(INCIDENT_STATUSES).nullish().transform(nn),
  attachmentIds: z.array(id).nullish().transform(nn),
  clientRequestId: z.string().max(100).optional().nullable(),
});
export type IncidentInput = z.infer<typeof incidentSchema>;

// ---------- Finance ----------
export const expenseSchema = z.object({
  kind: z.enum(EXPENSE_KINDS),
  categoryId: id.optional().nullable(),
  amount: money.refine((v) => v > 0, 'Số tiền phải > 0'),
  expenseDate: isoDateString,
  paidBy: z.enum(EXPENSE_PAID_BYS).nullish().transform(nn),
  reimbursable: z.boolean().nullish().transform(nn),
  paidStatus: z.enum(['UNPAID', 'PAID']).nullish().transform(nn),
  supplierId: id.optional().nullable(),
  orderId: id.optional().nullable(),
  tripId: id.optional().nullable(),
  vehicleId: id.optional().nullable(),
  driverId: id.optional().nullable(),
  description: optionalText,
  note: optionalText,
  attachmentIds: z.array(id).nullish().transform(nn),
  reason: z.string().trim().max(1000).optional().nullable(),
});
export type ExpenseInput = z.infer<typeof expenseSchema>;

export const paymentInSchema = z.object({
  type: z.enum(PAYMENT_IN_TYPES),
  customerId: id.optional().nullable(),
  driverId: id.optional().nullable(),
  payerName: z.string().trim().max(300).optional().nullable(),
  amount: money.refine((v) => v > 0, 'Số tiền phải > 0'),
  receivedAt: dateTime,
  method: z.enum(PAYMENT_METHODS),
  bankAccount: z.string().trim().max(200).optional().nullable(),
  transferNote: z.string().trim().max(500).optional().nullable(),
  receivedBy: z.string().trim().max(200).optional().nullable(),
  note: optionalText,
  codStopIds: z.array(id).nullish().transform(nn),
  tripId: id.optional().nullable(),
  allocations: z.array(z.object({ orderId: id, amount: money })).nullish().transform(nn),
  attachmentIds: z.array(id).nullish().transform(nn),
  reason: z.string().trim().max(1000).optional().nullable(),
});
export type PaymentInInput = z.infer<typeof paymentInSchema>;

export const allocatePaymentSchema = z.object({
  paymentId: id,
  lines: z.array(z.object({ orderId: id, amount: money.refine((v) => v > 0, 'Số tiền phải > 0') })).min(1),
});
export type AllocatePaymentInput = z.infer<typeof allocatePaymentSchema>;

export const debtStatementSchema = z.object({
  customerId: id,
  periodFrom: isoDateString,
  periodTo: isoDateString,
  scope: z.enum(['UNPAID_ONLY', 'ALL_IN_PERIOD']).nullish().transform(nn),
  note: optionalText,
});
export type DebtStatementInput = z.infer<typeof debtStatementSchema>;

export const reconcileAdvanceSchema = z.object({
  tripId: id,
  resolution: z.enum(['DRIVER_RETURNS', 'COMPANY_REIMBURSES', 'MATCHED', 'WRITE_OFF']),
  amount: money.optional().nullable(),
  reason: z.string().trim().max(1000).optional().nullable(),
  note: optionalText,
});
export type ReconcileAdvanceInput = z.infer<typeof reconcileAdvanceSchema>;

// ---------- Payroll ----------
export const generatePayrollSchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  driverIds: z.array(id).nullish().transform(nn),
  note: optionalText,
});
export type GeneratePayrollInput = z.infer<typeof generatePayrollSchema>;

export const payrollDeductionSchema = z.object({
  lineId: id,
  type: z.enum(['DEDUCTION', 'ADJUSTMENT', 'BONUS']).nullish().transform(nn),
  reasonId: id.optional().nullable(),
  amount: moneySigned,
  description: z.string().trim().min(1).max(300),
  note: optionalText,
  reason: z.string().trim().max(1000).optional().nullable(),
});
export type PayrollDeductionInput = z.infer<typeof payrollDeductionSchema>;

// ---------- Driver app ----------
export const driverLoginSchema = z.object({ phone: z.string().trim().min(6), password: z.string().min(1) });
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(100),
});

// ---------- Customer web ----------
export const customerRegisterSchema = z.object({
  email: email,
  phone: phone.optional().nullable(),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(100),
  fullName: z.string().trim().min(1).max(200),
  companyName: z.string().trim().max(300).optional().nullable(),
  taxCode: z.string().trim().max(50).optional().nullable(),
});
export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;

export const bookingStopSchema = z.object({
  type: z.enum(STOP_TYPES),
  addressId: id.optional().nullable(),
  address: z.string().trim().min(1).max(500),
  locationName: z.string().trim().max(200).optional().nullable(),
  contactName: z.string().trim().max(200).optional().nullable(),
  contactPhone: z.string().trim().max(30).optional().nullable(),
  note: optionalText,
});
export const bookingSchema = z.object({
  merchantId: id,
  stops: z.array(bookingStopSchema).min(2, 'Cần điểm lấy và điểm trả'),
  cargoName: z.string().trim().min(1, 'Nhập hàng hóa').max(300),
  weightTon: z.coerce.number().min(0).optional().nullable(),
  packages: z.coerce.number().int().min(0).optional().nullable(),
  vehicleTypeHint: z.string().trim().max(100).optional().nullable(),
  fragile: z.boolean().nullish().transform(nn),
  loadingAtPickup: z.boolean().nullish().transform(nn),
  loadingAtDrop: z.boolean().nullish().transform(nn),
  pickupFrom: dateTime.optional().nullable(),
  deliverBefore: dateTime.optional().nullable(),
  flexibility: z.string().trim().max(200).optional().nullable(),
  note: optionalText,
  contactName: z.string().trim().min(1).max(200),
  contactPhone: phone,
});
export type BookingInput = z.infer<typeof bookingSchema>;
export const bookingStatusList = BOOKING_STATUSES;

export const reasonSchema = z.object({ reason });
