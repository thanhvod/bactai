/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: unknown; output: unknown; }
  /** Số tiền VND (số nguyên, có thể > 2^31) */
  Money: { input: number; output: number; }
};

export type Account = {
  __typename?: 'Account';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  hasAppPassword: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  mustChangePassword: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
};

export type AgingReportView = {
  __typename?: 'AgingReportView';
  current: Scalars['Money']['output'];
  d1_15: Scalars['Money']['output'];
  d16_30: Scalars['Money']['output'];
  d31_60: Scalars['Money']['output'];
  d60p: Scalars['Money']['output'];
};

export type AgingView = {
  __typename?: 'AgingView';
  current: Scalars['Money']['output'];
  d1_15: Scalars['Money']['output'];
  d16_30: Scalars['Money']['output'];
  d31_60: Scalars['Money']['output'];
  d60p: Scalars['Money']['output'];
};

export type AllocatePaymentInput = {
  lines: Array<AllocationLineInput>;
  paymentId: Scalars['ID']['input'];
};

export type AllocatePaymentPayload = {
  __typename?: 'AllocatePaymentPayload';
  creditBalance: Scalars['Money']['output'];
  payment: PaymentView;
};

export type AllocationLineInput = {
  amount: Scalars['Money']['input'];
  orderId: Scalars['ID']['input'];
};

export type AllocationView = {
  __typename?: 'AllocationView';
  amount: Scalars['Money']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  method?: Maybe<Scalars['String']['output']>;
  orderCode: Scalars['String']['output'];
  orderId: Scalars['ID']['output'];
  paymentCode: Scalars['String']['output'];
  paymentId: Scalars['ID']['output'];
  receivedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type AmountCount = {
  __typename?: 'AmountCount';
  amount: Scalars['Money']['output'];
  count: Scalars['Int']['output'];
};

export enum AttachmentCategory {
  Contract = 'CONTRACT',
  DebtStatementPdf = 'DEBT_STATEMENT_PDF',
  ExpenseReceipt = 'EXPENSE_RECEIPT',
  IncidentPhoto = 'INCIDENT_PHOTO',
  Invoice = 'INVOICE',
  License = 'LICENSE',
  LoadingReceipt = 'LOADING_RECEIPT',
  Logo = 'LOGO',
  Other = 'OTHER',
  PaymentProof = 'PAYMENT_PROOF',
  Pod = 'POD',
  PrintDocument = 'PRINT_DOCUMENT',
  WarehouseSlip = 'WAREHOUSE_SLIP'
}

export type AttachmentView = {
  __typename?: 'AttachmentView';
  capturedAt?: Maybe<Scalars['DateTime']['output']>;
  category: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  entityId: Scalars['ID']['output'];
  entityType: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
  mimeType: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  sharedWithCustomer: Scalars['Boolean']['output'];
  size: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  uploadedByName?: Maybe<Scalars['String']['output']>;
  uploadedByType: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type BookingConnection = {
  __typename?: 'BookingConnection';
  nodes: Array<BookingView>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type BookingFilter = {
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type BookingInput = {
  cargoName: Scalars['String']['input'];
  contactName: Scalars['String']['input'];
  contactPhone: Scalars['String']['input'];
  deliverBefore?: InputMaybe<Scalars['DateTime']['input']>;
  flexibility?: InputMaybe<Scalars['String']['input']>;
  fragile?: InputMaybe<Scalars['Boolean']['input']>;
  loadingAtDrop?: InputMaybe<Scalars['Boolean']['input']>;
  loadingAtPickup?: InputMaybe<Scalars['Boolean']['input']>;
  merchantId: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  packages?: InputMaybe<Scalars['Int']['input']>;
  pickupFrom?: InputMaybe<Scalars['DateTime']['input']>;
  stops: Array<BookingStopInput>;
  vehicleTypeHint?: InputMaybe<Scalars['String']['input']>;
  weightTon?: InputMaybe<Scalars['Float']['input']>;
};

export type BookingNoteView = {
  __typename?: 'BookingNoteView';
  authorName?: Maybe<Scalars['String']['output']>;
  authorType: Scalars['String']['output'];
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
};

export type BookingStatusEntry = {
  __typename?: 'BookingStatusEntry';
  actorName?: Maybe<Scalars['String']['output']>;
  changedAt: Scalars['DateTime']['output'];
  fromStatus?: Maybe<Scalars['String']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  toStatus: Scalars['String']['output'];
};

export type BookingStopInput = {
  address: Scalars['String']['input'];
  addressId?: InputMaybe<Scalars['ID']['input']>;
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  locationName?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
};

export type BookingStopView = {
  __typename?: 'BookingStopView';
  address: Scalars['String']['output'];
  contactName?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  locationName?: Maybe<Scalars['String']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type BookingView = {
  __typename?: 'BookingView';
  accountEmail?: Maybe<Scalars['String']['output']>;
  accountName?: Maybe<Scalars['String']['output']>;
  cancelReason?: Maybe<Scalars['String']['output']>;
  cargoName: Scalars['String']['output'];
  code: Scalars['String']['output'];
  contactName: Scalars['String']['output'];
  contactPhone: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  customerId?: Maybe<Scalars['ID']['output']>;
  customerName?: Maybe<Scalars['String']['output']>;
  deliverBefore?: Maybe<Scalars['DateTime']['output']>;
  flexibility?: Maybe<Scalars['String']['output']>;
  fragile: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  loadingAtDrop: Scalars['Boolean']['output'];
  loadingAtPickup: Scalars['Boolean']['output'];
  merchantId: Scalars['ID']['output'];
  merchantName: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  notes: Array<BookingNoteView>;
  orderAdjustments?: Maybe<Scalars['JSON']['output']>;
  orderCode?: Maybe<Scalars['String']['output']>;
  orderId?: Maybe<Scalars['ID']['output']>;
  packages?: Maybe<Scalars['Int']['output']>;
  pickupFrom?: Maybe<Scalars['DateTime']['output']>;
  rejectReason?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  statusHistory: Array<BookingStatusEntry>;
  stops: Array<BookingStopView>;
  vehicleTypeHint?: Maybe<Scalars['String']['output']>;
  weightTon?: Maybe<Scalars['Float']['output']>;
};

export type CargoLineInput = {
  cargoTypeId?: InputMaybe<Scalars['ID']['input']>;
  declaredValue?: InputMaybe<Scalars['Money']['input']>;
  dropoffStopId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  packagingUnit?: InputMaybe<Scalars['String']['input']>;
  packagingUnitId?: InputMaybe<Scalars['ID']['input']>;
  pickupStopId?: InputMaybe<Scalars['ID']['input']>;
  properties?: InputMaybe<Array<Scalars['String']['input']>>;
  quantity?: InputMaybe<Scalars['Float']['input']>;
  volumeM3?: InputMaybe<Scalars['Float']['input']>;
  weightKg?: InputMaybe<Scalars['Float']['input']>;
};

export type CargoLineView = {
  __typename?: 'CargoLineView';
  cargoTypeId?: Maybe<Scalars['ID']['output']>;
  cargoTypeName?: Maybe<Scalars['String']['output']>;
  declaredValue?: Maybe<Scalars['Money']['output']>;
  dropoffStopId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  packagingUnit?: Maybe<Scalars['String']['output']>;
  packagingUnitId?: Maybe<Scalars['ID']['output']>;
  pickupStopId?: Maybe<Scalars['ID']['output']>;
  properties: Array<Scalars['String']['output']>;
  quantity?: Maybe<Scalars['Float']['output']>;
  volumeM3?: Maybe<Scalars['Float']['output']>;
  weightKg?: Maybe<Scalars['Float']['output']>;
};

export type CatalogItemInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  appliesTo?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  type: Scalars['String']['input'];
};

export type CatalogItemView = {
  __typename?: 'CatalogItemView';
  active: Scalars['Boolean']['output'];
  appliesTo?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isDefault: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  sortOrder: Scalars['Int']['output'];
  type: Scalars['String']['output'];
  usageCount: Scalars['Int']['output'];
};

export enum CatalogType {
  AddonService = 'ADDON_SERVICE',
  CargoType = 'CARGO_TYPE',
  CustomerGroup = 'CUSTOMER_GROUP',
  DeductionReason = 'DEDUCTION_REASON',
  DocumentType = 'DOCUMENT_TYPE',
  ExpenseCategory = 'EXPENSE_CATEGORY',
  IncidentType = 'INCIDENT_TYPE',
  PackagingUnit = 'PACKAGING_UNIT',
  PauseReason = 'PAUSE_REASON',
  SupplierType = 'SUPPLIER_TYPE',
  VehicleType = 'VEHICLE_TYPE'
}

export type CheckTripOverlapInput = {
  driverId?: InputMaybe<Scalars['ID']['input']>;
  plannedEndAt?: InputMaybe<Scalars['DateTime']['input']>;
  plannedStartAt: Scalars['DateTime']['input'];
  tripId?: InputMaybe<Scalars['ID']['input']>;
  vehicleId?: InputMaybe<Scalars['ID']['input']>;
};

export type CodHeldReport = {
  __typename?: 'CodHeldReport';
  overThresholdCount: Scalars['Int']['output'];
  rows: Array<CodHeldReportRow>;
  thresholdAmount: Scalars['Money']['output'];
  thresholdDays: Scalars['Int']['output'];
  totalHeld: Scalars['Money']['output'];
};

export type CodHeldReportRow = {
  __typename?: 'CodHeldReportRow';
  codCollected: Scalars['Money']['output'];
  codHeld: Scalars['Money']['output'];
  codRemitted: Scalars['Money']['output'];
  code: Scalars['String']['output'];
  driverId: Scalars['ID']['output'];
  heldDays: Scalars['Int']['output'];
  items: Array<CodItemView>;
  name: Scalars['String']['output'];
  oldestHeldAt?: Maybe<Scalars['DateTime']['output']>;
  overAmount: Scalars['Boolean']['output'];
  overDays: Scalars['Boolean']['output'];
  phone: Scalars['String']['output'];
  remittances: Array<CodRemittanceView>;
};

export type CodItemView = {
  __typename?: 'CodItemView';
  address: Scalars['String']['output'];
  codActual: Scalars['Money']['output'];
  codExpected: Scalars['Money']['output'];
  collectedAt: Scalars['DateTime']['output'];
  customerName: Scalars['String']['output'];
  daysHeld: Scalars['Int']['output'];
  held: Scalars['Money']['output'];
  orderCode: Scalars['String']['output'];
  orderId: Scalars['ID']['output'];
  remitted: Scalars['Money']['output'];
  stopId: Scalars['ID']['output'];
  stopName?: Maybe<Scalars['String']['output']>;
  stopSequence: Scalars['Int']['output'];
  tripCode?: Maybe<Scalars['String']['output']>;
  tripId?: Maybe<Scalars['ID']['output']>;
};

export type CodRemittanceItemView = {
  __typename?: 'CodRemittanceItemView';
  amount: Scalars['Money']['output'];
  orderCode: Scalars['String']['output'];
  stopId: Scalars['ID']['output'];
  stopName?: Maybe<Scalars['String']['output']>;
};

export type CodRemittanceView = {
  __typename?: 'CodRemittanceView';
  amount: Scalars['Money']['output'];
  code: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  method: Scalars['String']['output'];
  receivedAt: Scalars['DateTime']['output'];
};

export type ContactInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  zalo?: InputMaybe<Scalars['String']['input']>;
};

export type ContactView = {
  __typename?: 'ContactView';
  email?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  zalo?: Maybe<Scalars['String']['output']>;
};

export type CreateDebtStatementInput = {
  customerId: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  periodFrom: Scalars['String']['input'];
  periodTo: Scalars['String']['input'];
  scope?: InputMaybe<Scalars['String']['input']>;
};

export type CreateMerchantInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  contactName?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  legalName?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  taxCode?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOrderInput = {
  addons?: InputMaybe<Array<OrderAddonInput>>;
  bookingId?: InputMaybe<Scalars['ID']['input']>;
  cargoLines?: InputMaybe<Array<CargoLineInput>>;
  createTrip?: InputMaybe<QuickTripInput>;
  customerId: Scalars['ID']['input'];
  dueDate?: InputMaybe<Scalars['String']['input']>;
  freightAmount: Scalars['Money']['input'];
  internalNote?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  orderDate?: InputMaybe<Scalars['String']['input']>;
  requiredCapacityTons?: InputMaybe<Scalars['Float']['input']>;
  requiredVehicleTypeId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  stops: Array<OrderStopInput>;
};

export type CreditLimitCheckView = {
  __typename?: 'CreditLimitCheckView';
  creditLimit?: Maybe<Scalars['Money']['output']>;
  currentDebt: Scalars['Money']['output'];
  details?: Maybe<Scalars['JSON']['output']>;
  overLimit: Scalars['Boolean']['output'];
  overdueOrders: Scalars['Int']['output'];
  projectedDebt: Scalars['Money']['output'];
  warnings: Array<Scalars['String']['output']>;
};

export type CurrentContext = {
  __typename?: 'CurrentContext';
  membershipId: Scalars['ID']['output'];
  merchantCode: Scalars['String']['output'];
  merchantId: Scalars['ID']['output'];
  merchantName: Scalars['String']['output'];
  permissions: Array<Scalars['String']['output']>;
  role: Scalars['String']['output'];
};

export type CustomerAccountView = {
  __typename?: 'CustomerAccountView';
  billingAddress?: Maybe<Scalars['String']['output']>;
  companyName?: Maybe<Scalars['String']['output']>;
  contactTitle?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  notificationPrefs?: Maybe<Scalars['JSON']['output']>;
  phone: Scalars['String']['output'];
  taxCode?: Maybe<Scalars['String']['output']>;
};

export type CustomerAddressInput = {
  address: Scalars['String']['input'];
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  isDefaultPickup?: InputMaybe<Scalars['Boolean']['input']>;
  lat?: InputMaybe<Scalars['Float']['input']>;
  lng?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  usage?: InputMaybe<Scalars['String']['input']>;
};

export type CustomerAddressView = {
  __typename?: 'CustomerAddressView';
  address: Scalars['String']['output'];
  contactName?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isDefaultPickup: Scalars['Boolean']['output'];
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  usage: Scalars['String']['output'];
};

export type CustomerConnection = {
  __typename?: 'CustomerConnection';
  nodes: Array<CustomerView>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CustomerDebtFilter = {
  asOf?: InputMaybe<Scalars['String']['input']>;
  customerId?: InputMaybe<Scalars['ID']['input']>;
  hasCredit?: InputMaybe<Scalars['Boolean']['input']>;
  openOnly?: InputMaybe<Scalars['Boolean']['input']>;
  overLimit?: InputMaybe<Scalars['Boolean']['input']>;
  overdueOnly?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type CustomerDebtOrderRow = {
  __typename?: 'CustomerDebtOrderRow';
  allocated: Scalars['Money']['output'];
  code: Scalars['String']['output'];
  customerId: Scalars['ID']['output'];
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  orderDate: Scalars['DateTime']['output'];
  orderId: Scalars['ID']['output'];
  overdueDays: Scalars['Int']['output'];
  remaining: Scalars['Money']['output'];
  routeSummary?: Maybe<Scalars['String']['output']>;
  statementCode?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  total: Scalars['Money']['output'];
};

export type CustomerDebtReport = {
  __typename?: 'CustomerDebtReport';
  aging: AgingReportView;
  rows: Array<CustomerDebtReportRow>;
  totalCredit: Scalars['Money']['output'];
  totalDebt: Scalars['Money']['output'];
  totalOverdue: Scalars['Money']['output'];
};

export type CustomerDebtReportRow = {
  __typename?: 'CustomerDebtReportRow';
  aging: AgingReportView;
  code: Scalars['String']['output'];
  creditBalance: Scalars['Money']['output'];
  creditLimit?: Maybe<Scalars['Money']['output']>;
  customerId: Scalars['ID']['output'];
  maxOverdueDays: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  openOrders: Scalars['Int']['output'];
  overdue: Scalars['Money']['output'];
  paid: Scalars['Money']['output'];
  receivable: Scalars['Money']['output'];
  totalDebt: Scalars['Money']['output'];
  warnings: Array<Scalars['String']['output']>;
};

export type CustomerDebtResult = {
  __typename?: 'CustomerDebtResult';
  orders: Array<CustomerDebtOrderRow>;
  rows: Array<CustomerDebtRow>;
  totals: DebtTotals;
};

export type CustomerDebtRow = {
  __typename?: 'CustomerDebtRow';
  aging: AgingView;
  creditBalance: Scalars['Money']['output'];
  creditLimit?: Maybe<Scalars['Money']['output']>;
  customer: RefView;
  limitUsagePct?: Maybe<Scalars['Int']['output']>;
  maxOverdueDays: Scalars['Int']['output'];
  openOrders: Scalars['Int']['output'];
  overLimit: Scalars['Boolean']['output'];
  overdueAmount: Scalars['Money']['output'];
  overdueOrders: Scalars['Int']['output'];
  paid: Scalars['Money']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  receivable: Scalars['Money']['output'];
  remaining: Scalars['Money']['output'];
};

export type CustomerDebtSummaryView = {
  __typename?: 'CustomerDebtSummaryView';
  aging: AgingView;
  creditBalance: Scalars['Money']['output'];
  creditLimit?: Maybe<Scalars['Money']['output']>;
  limitUsagePct?: Maybe<Scalars['Int']['output']>;
  maxOverdueDays: Scalars['Int']['output'];
  openOrders: Scalars['Int']['output'];
  overLimit: Scalars['Boolean']['output'];
  overdueAmount: Scalars['Money']['output'];
  overdueOrders: Scalars['Int']['output'];
  paid: Scalars['Money']['output'];
  receivable: Scalars['Money']['output'];
  remaining: Scalars['Money']['output'];
};

export type CustomerFilter = {
  debtStatus?: InputMaybe<Scalars['String']['input']>;
  groupId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type CustomerInput = {
  billingAddress?: InputMaybe<Scalars['String']['input']>;
  creditLimit?: InputMaybe<Scalars['Money']['input']>;
  defaultDebtDays?: InputMaybe<Scalars['Int']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  groupId?: InputMaybe<Scalars['ID']['input']>;
  invoiceEmail?: InputMaybe<Scalars['String']['input']>;
  legalName?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  primaryContact?: InputMaybe<ContactInput>;
  status?: InputMaybe<Scalars['String']['input']>;
  taxCode?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
};

export type CustomerLocationInput = {
  address: Scalars['String']['input'];
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  lat?: InputMaybe<Scalars['Float']['input']>;
  lng?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  province?: InputMaybe<Scalars['String']['input']>;
  usage: Scalars['String']['input'];
};

export type CustomerLocationView = {
  __typename?: 'CustomerLocationView';
  active: Scalars['Boolean']['output'];
  address: Scalars['String']['output'];
  contactName?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  customerId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  isDefault: Scalars['Boolean']['output'];
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  province?: Maybe<Scalars['String']['output']>;
  usage: Scalars['String']['output'];
  usedInOrders: Scalars['Int']['output'];
};

export type CustomerMe = {
  __typename?: 'CustomerMe';
  account: CustomerAccountView;
  merchantLinks: Array<MerchantLinkView>;
};

export type CustomerProfileInput = {
  billingAddress?: InputMaybe<Scalars['String']['input']>;
  companyName?: InputMaybe<Scalars['String']['input']>;
  contactTitle?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fullName: Scalars['String']['input'];
  notificationPrefs?: InputMaybe<Scalars['JSON']['input']>;
  taxCode?: InputMaybe<Scalars['String']['input']>;
};

export type CustomerView = {
  __typename?: 'CustomerView';
  billingAddress?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  creditBalance: Scalars['Money']['output'];
  creditLimit?: Maybe<Scalars['Money']['output']>;
  deactivateReason?: Maybe<Scalars['String']['output']>;
  debtSummary: CustomerDebtSummaryView;
  defaultDebtDays?: Maybe<Scalars['Int']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  groupId?: Maybe<Scalars['ID']['output']>;
  groupName?: Maybe<Scalars['String']['output']>;
  hasPortalAccount: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  invoiceEmail?: Maybe<Scalars['String']['output']>;
  legalName?: Maybe<Scalars['String']['output']>;
  locations?: Maybe<Array<CustomerLocationView>>;
  name: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  orderCount: Scalars['Int']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  primaryContact?: Maybe<ContactView>;
  status: Scalars['String']['output'];
  taxCode?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  warnings: Array<Scalars['String']['output']>;
};

export type DashboardCodHolder = {
  __typename?: 'DashboardCodHolder';
  codHeld: Scalars['Money']['output'];
  daysHeld: Scalars['Int']['output'];
  driverId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  overThreshold: Scalars['Boolean']['output'];
  phone: Scalars['String']['output'];
};

export type DashboardOverdueOrder = {
  __typename?: 'DashboardOverdueOrder';
  code: Scalars['String']['output'];
  customerId: Scalars['ID']['output'];
  customerName: Scalars['String']['output'];
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  orderId: Scalars['ID']['output'];
  overdueDays: Scalars['Int']['output'];
  remaining: Scalars['Money']['output'];
};

export type DashboardSummary = {
  __typename?: 'DashboardSummary';
  cashInMonth: Scalars['Money']['output'];
  codHeld: AmountCount;
  codHolders: Array<DashboardCodHolder>;
  codOverThreshold: Scalars['Int']['output'];
  costMonth: Scalars['Money']['output'];
  date: Scalars['String']['output'];
  newOrdersToday: Scalars['Int']['output'];
  openIncidents: Scalars['Int']['output'];
  ordersNeedAction: Scalars['Int']['output'];
  overdueDebt: AmountCount;
  overdueOrders: Array<DashboardOverdueOrder>;
  payrollPending: Scalars['Int']['output'];
  profitMonth: Scalars['Money']['output'];
  receivable: Scalars['Money']['output'];
  revenueMonth: Scalars['Money']['output'];
  runningTrips: Scalars['Int']['output'];
  scheduleWarnings: Scalars['Int']['output'];
  supplierPayable: Scalars['Money']['output'];
  todayTripList: Array<DashboardTrip>;
  todayTrips: Scalars['Int']['output'];
  tripCountsByStatus: Array<TripStatusCount>;
  unassignedOrders: Scalars['Int']['output'];
};

export type DashboardTrip = {
  __typename?: 'DashboardTrip';
  code: Scalars['String']['output'];
  driverName?: Maybe<Scalars['String']['output']>;
  hasWarning: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  lastLocationAt?: Maybe<Scalars['DateTime']['output']>;
  openIncident: Scalars['Boolean']['output'];
  orderCode: Scalars['String']['output'];
  orderId: Scalars['ID']['output'];
  plannedEndAt?: Maybe<Scalars['DateTime']['output']>;
  plannedStartAt: Scalars['DateTime']['output'];
  routeSummary?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  vehiclePlate?: Maybe<Scalars['String']['output']>;
};

export type DebtStatementConnection = {
  __typename?: 'DebtStatementConnection';
  nodes: Array<DebtStatementView>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DebtStatementCustomerRef = {
  __typename?: 'DebtStatementCustomerRef';
  code: Scalars['String']['output'];
  hasPortalAccount: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  invoiceEmail?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
};

export type DebtStatementDiffView = {
  __typename?: 'DebtStatementDiffView';
  currentPaid: Scalars['Money']['output'];
  currentRemaining: Scalars['Money']['output'];
  message: Scalars['String']['output'];
  orderCode: Scalars['String']['output'];
  orderId: Scalars['ID']['output'];
  snapshotPaid: Scalars['Money']['output'];
  snapshotRemaining: Scalars['Money']['output'];
};

export type DebtStatementFilter = {
  customerId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type DebtStatementLineView = {
  __typename?: 'DebtStatementLineView';
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  orderCode: Scalars['String']['output'];
  orderDate: Scalars['DateTime']['output'];
  orderId: Scalars['ID']['output'];
  overdueDays: Scalars['Int']['output'];
  paidAmount: Scalars['Money']['output'];
  remainingAmount: Scalars['Money']['output'];
  route?: Maybe<Scalars['String']['output']>;
  sequence: Scalars['Int']['output'];
  totalAmount: Scalars['Money']['output'];
};

export type DebtStatementView = {
  __typename?: 'DebtStatementView';
  cancelReason?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['DateTime']['output']>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdByName?: Maybe<Scalars['String']['output']>;
  customer: DebtStatementCustomerRef;
  diffVsCurrent?: Maybe<Array<DebtStatementDiffView>>;
  finalizedAt?: Maybe<Scalars['DateTime']['output']>;
  finalizedByName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lineCount: Scalars['Int']['output'];
  lines?: Maybe<Array<DebtStatementLineView>>;
  note?: Maybe<Scalars['String']['output']>;
  paidAmount: Scalars['Money']['output'];
  pdfAttachmentId?: Maybe<Scalars['ID']['output']>;
  pdfUrl?: Maybe<Scalars['String']['output']>;
  periodFrom: Scalars['DateTime']['output'];
  periodTo: Scalars['DateTime']['output'];
  remainingAmount: Scalars['Money']['output'];
  scope: Scalars['String']['output'];
  sentAt?: Maybe<Scalars['DateTime']['output']>;
  sharedWithCustomer: Scalars['Boolean']['output'];
  status: Scalars['String']['output'];
  totalAmount: Scalars['Money']['output'];
};

export type DebtTotals = {
  __typename?: 'DebtTotals';
  creditBalance: Scalars['Money']['output'];
  customerCount: Scalars['Int']['output'];
  overdueAmount: Scalars['Money']['output'];
  paid: Scalars['Money']['output'];
  receivable: Scalars['Money']['output'];
  remaining: Scalars['Money']['output'];
};

export type DispatchSummary = {
  __typename?: 'DispatchSummary';
  byStatus: Array<StatusCount>;
  date: Scalars['String']['output'];
  openIncidents: Scalars['Int']['output'];
  ordersWaitingDispatch: Scalars['Int']['output'];
  running: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  unassigned: Scalars['Int']['output'];
  warnings: Scalars['Int']['output'];
};

export enum DocType {
  Booking = 'BOOKING',
  Customer = 'CUSTOMER',
  DebtStatement = 'DEBT_STATEMENT',
  Driver = 'DRIVER',
  Expense = 'EXPENSE',
  Incident = 'INCIDENT',
  Order = 'ORDER',
  PaymentIn = 'PAYMENT_IN',
  Payroll = 'PAYROLL',
  Supplier = 'SUPPLIER',
  Trip = 'TRIP',
  Vehicle = 'VEHICLE'
}

export type DriverAccountCredentials = {
  __typename?: 'DriverAccountCredentials';
  phone: Scalars['String']['output'];
  status: Scalars['String']['output'];
  tempPassword: Scalars['String']['output'];
};

export type DriverAppAccountView = {
  __typename?: 'DriverAppAccountView';
  deviceInfo?: Maybe<Scalars['String']['output']>;
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  mustChangePassword: Scalars['Boolean']['output'];
  status: Scalars['String']['output'];
};

export type DriverCalendarDay = {
  __typename?: 'DriverCalendarDay';
  date: Scalars['String']['output'];
  statuses: Array<Scalars['String']['output']>;
  tripCount: Scalars['Int']['output'];
};

export type DriverCargoView = {
  __typename?: 'DriverCargoView';
  name: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  packagingUnit?: Maybe<Scalars['String']['output']>;
  properties: Array<Scalars['String']['output']>;
  quantity?: Maybe<Scalars['Float']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  volumeM3?: Maybe<Scalars['Float']['output']>;
  weightKg?: Maybe<Scalars['Float']['output']>;
};

export type DriverCodHeldFilter = {
  driverId?: InputMaybe<Scalars['ID']['input']>;
  warningOnly?: InputMaybe<Scalars['Boolean']['input']>;
};

export type DriverCodHeldReport = {
  __typename?: 'DriverCodHeldReport';
  codWarningAmount: Scalars['Money']['output'];
  codWarningDays: Scalars['Int']['output'];
  rows: Array<DriverCodHeldRow>;
  totalHeld: Scalars['Money']['output'];
};

export type DriverCodHeldRow = {
  __typename?: 'DriverCodHeldRow';
  codCollected: Scalars['Money']['output'];
  codHeld: Scalars['Money']['output'];
  codRemitted: Scalars['Money']['output'];
  daysHeld: Scalars['Int']['output'];
  driver: RefView;
  items: Array<DriverCodItemView>;
  oldestHeldAt?: Maybe<Scalars['DateTime']['output']>;
  overAmount: Scalars['Boolean']['output'];
  overDays: Scalars['Boolean']['output'];
  phone?: Maybe<Scalars['String']['output']>;
};

export type DriverCodInput = {
  amount: Scalars['Money']['input'];
  idempotencyKey?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  stopId: Scalars['ID']['input'];
};

export type DriverCodItemView = {
  __typename?: 'DriverCodItemView';
  address: Scalars['String']['output'];
  codActual: Scalars['Money']['output'];
  codExpected: Scalars['Money']['output'];
  collectedAt: Scalars['DateTime']['output'];
  customerName: Scalars['String']['output'];
  daysHeld: Scalars['Int']['output'];
  held: Scalars['Money']['output'];
  orderCode: Scalars['String']['output'];
  orderId: Scalars['ID']['output'];
  remitted: Scalars['Money']['output'];
  stopId: Scalars['ID']['output'];
  stopName?: Maybe<Scalars['String']['output']>;
  stopSequence: Scalars['Int']['output'];
  tripCode?: Maybe<Scalars['String']['output']>;
  tripId?: Maybe<Scalars['ID']['output']>;
};

export type DriverConnection = {
  __typename?: 'DriverConnection';
  nodes: Array<DriverView>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type DriverCurrentTrip = {
  __typename?: 'DriverCurrentTrip';
  code: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  plannedStartAt: Scalars['DateTime']['output'];
  routeSummary?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  vehiclePlate?: Maybe<Scalars['String']['output']>;
};

export type DriverFilter = {
  codWarning?: InputMaybe<Scalars['Boolean']['input']>;
  hasApp?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type DriverIncidentBrief = {
  __typename?: 'DriverIncidentBrief';
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  severity: Scalars['String']['output'];
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type DriverIncidentInput = {
  attachmentIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  idempotencyKey?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  severity: Scalars['String']['input'];
  stopId?: InputMaybe<Scalars['ID']['input']>;
  title: Scalars['String']['input'];
  tripId: Scalars['ID']['input'];
  typeId?: InputMaybe<Scalars['ID']['input']>;
};

export type DriverInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  appLoginEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  dob?: InputMaybe<Scalars['String']['input']>;
  emergencyContact?: InputMaybe<Scalars['String']['input']>;
  fixedSalary?: InputMaybe<Scalars['Money']['input']>;
  idNumber?: InputMaybe<Scalars['String']['input']>;
  licenseClass?: InputMaybe<Scalars['String']['input']>;
  licenseExpiresAt?: InputMaybe<Scalars['String']['input']>;
  licenseNumber?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  phone: Scalars['String']['input'];
  salaryEffectiveFrom?: InputMaybe<Scalars['String']['input']>;
  salaryReason?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type DriverJobsFilter = {
  bucket?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<Scalars['String']['input']>>;
  to?: InputMaybe<Scalars['String']['input']>;
};

export type DriverLedgerBrief = {
  __typename?: 'DriverLedgerBrief';
  codHeld: Scalars['Money']['output'];
  companyOwesDriver: Scalars['Money']['output'];
  daysHeld: Scalars['Int']['output'];
  driverOwesCompany: Scalars['Money']['output'];
  netBalance: Scalars['Money']['output'];
  overAmount: Scalars['Boolean']['output'];
  overDays: Scalars['Boolean']['output'];
};

export type DriverLedgerView = {
  __typename?: 'DriverLedgerView';
  codCollected: Scalars['Money']['output'];
  codHeld: Scalars['Money']['output'];
  codItems: Array<DriverCodItemView>;
  codRemittances: Array<PaymentView>;
  codRemitted: Scalars['Money']['output'];
  companyOwesDriver: Scalars['Money']['output'];
  daysHeld: Scalars['Int']['output'];
  driver: RefView;
  driverOwesCompany: Scalars['Money']['output'];
  entries: Array<LedgerEntryView>;
  netBalance: Scalars['Money']['output'];
  oldestHeldAt?: Maybe<Scalars['DateTime']['output']>;
  overAmount: Scalars['Boolean']['output'];
  overDays: Scalars['Boolean']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  reimbursableExpenses: Array<ExpenseView>;
  salaryAdvanceUndeducted: Scalars['Money']['output'];
  salaryAdvances: Array<ExpenseView>;
  tripAdvanceOutstanding: Scalars['Money']['output'];
  tripAdvances: Array<TripAdvanceView>;
  tripBonuses: Array<TripBonusView>;
};

export type DriverMeView = {
  __typename?: 'DriverMeView';
  codHeld: Scalars['Money']['output'];
  code: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  licenseClass?: Maybe<Scalars['String']['output']>;
  licenseExpiresAt?: Maybe<Scalars['DateTime']['output']>;
  merchantHotline?: Maybe<Scalars['String']['output']>;
  merchantId: Scalars['ID']['output'];
  merchantName: Scalars['String']['output'];
  mustChangePassword: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  unreadNotifications: Scalars['Int']['output'];
};

export type DriverOption = {
  __typename?: 'DriverOption';
  busy: Scalars['Boolean']['output'];
  busyTripCode?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type DriverRef = {
  __typename?: 'DriverRef';
  code?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type DriverReportRow = {
  __typename?: 'DriverReportRow';
  bonusTotal: Scalars['Money']['output'];
  codHeld: Scalars['Money']['output'];
  code: Scalars['String']['output'];
  completedTrips: Scalars['Int']['output'];
  driverId: Scalars['ID']['output'];
  incidents: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  onTimeRate?: Maybe<Scalars['Float']['output']>;
  revenue: Scalars['Money']['output'];
  status: Scalars['String']['output'];
};

export type DriverSalaryHistoryView = {
  __typename?: 'DriverSalaryHistoryView';
  amount: Scalars['Money']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdByName?: Maybe<Scalars['String']['output']>;
  delta?: Maybe<Scalars['Money']['output']>;
  effectiveFrom: Scalars['DateTime']['output'];
  effectiveTo?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isCurrent: Scalars['Boolean']['output'];
  reason?: Maybe<Scalars['String']['output']>;
};

export type DriverStopPayload = {
  __typename?: 'DriverStopPayload';
  orderStatus?: Maybe<Scalars['String']['output']>;
  stop: DriverStopView;
  warnings: Array<Scalars['String']['output']>;
};

export type DriverStopStatusInput = {
  actualAt?: InputMaybe<Scalars['DateTime']['input']>;
  idempotencyKey?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  status: Scalars['String']['input'];
  stopId: Scalars['ID']['input'];
  tripId?: InputMaybe<Scalars['ID']['input']>;
};

export type DriverStopView = {
  __typename?: 'DriverStopView';
  address: Scalars['String']['output'];
  arrivedAt?: Maybe<Scalars['DateTime']['output']>;
  cargoSummary: Array<Scalars['String']['output']>;
  codActual?: Maybe<Scalars['Money']['output']>;
  codCollectedAt?: Maybe<Scalars['DateTime']['output']>;
  codExpected?: Maybe<Scalars['Money']['output']>;
  codNote?: Maybe<Scalars['String']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  contactName?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
  locationName?: Maybe<Scalars['String']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  orderId: Scalars['ID']['output'];
  plannedAt?: Maybe<Scalars['DateTime']['output']>;
  podCount: Scalars['Int']['output'];
  sequence: Scalars['Int']['output'];
  skipReason?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type DriverTripPayload = {
  __typename?: 'DriverTripPayload';
  trip: DriverTripView;
  warnings: Array<Scalars['String']['output']>;
};

export type DriverTripStatusInput = {
  actualAt?: InputMaybe<Scalars['DateTime']['input']>;
  idempotencyKey?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  pauseReasonId?: InputMaybe<Scalars['ID']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  status: Scalars['String']['input'];
  tripId: Scalars['ID']['input'];
};

export type DriverTripView = {
  __typename?: 'DriverTripView';
  actualEndAt?: Maybe<Scalars['DateTime']['output']>;
  actualStartAt?: Maybe<Scalars['DateTime']['output']>;
  allowedNextStatuses: Array<Scalars['String']['output']>;
  attachmentCount: Scalars['Int']['output'];
  cargoLines: Array<DriverCargoView>;
  codActualTotal: Scalars['Money']['output'];
  codExpectedTotal: Scalars['Money']['output'];
  code: Scalars['String']['output'];
  completedStopCount: Scalars['Int']['output'];
  customerName: Scalars['String']['output'];
  driverBonusAmount: Scalars['Money']['output'];
  id: Scalars['ID']['output'];
  incidents: Array<DriverIncidentBrief>;
  isRunning: Scalars['Boolean']['output'];
  lastLocationAt?: Maybe<Scalars['DateTime']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  orderCode: Scalars['String']['output'];
  orderId: Scalars['ID']['output'];
  orderNote?: Maybe<Scalars['String']['output']>;
  pauseReason?: Maybe<Scalars['String']['output']>;
  plannedEndAt?: Maybe<Scalars['DateTime']['output']>;
  plannedStartAt: Scalars['DateTime']['output'];
  previousStatusBeforePause?: Maybe<Scalars['String']['output']>;
  routeSummary?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  stopCount: Scalars['Int']['output'];
  stops: Array<DriverStopView>;
  vehiclePlate?: Maybe<Scalars['String']['output']>;
  vehicleType?: Maybe<Scalars['String']['output']>;
};

export type DriverView = {
  __typename?: 'DriverView';
  address?: Maybe<Scalars['String']['output']>;
  appAccount: DriverAppAccountView;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  currentTrip?: Maybe<DriverCurrentTrip>;
  dob?: Maybe<Scalars['DateTime']['output']>;
  emergencyContact?: Maybe<Scalars['String']['output']>;
  fixedSalary?: Maybe<Scalars['Money']['output']>;
  id: Scalars['ID']['output'];
  idNumber?: Maybe<Scalars['String']['output']>;
  issuedTempPassword?: Maybe<Scalars['String']['output']>;
  ledgerSummary: DriverLedgerBrief;
  licenseClass?: Maybe<Scalars['String']['output']>;
  licenseExpiresAt?: Maybe<Scalars['DateTime']['output']>;
  licenseNumber?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  phone: Scalars['String']['output'];
  recentTrips?: Maybe<Array<MasterTripItem>>;
  salaryHistory?: Maybe<Array<DriverSalaryHistoryView>>;
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  warnings: Array<Scalars['String']['output']>;
};

export type EntityRefInput = {
  id: Scalars['ID']['input'];
  type: Scalars['String']['input'];
};

export enum EntityType {
  Booking = 'BOOKING',
  CatalogItem = 'CATALOG_ITEM',
  Customer = 'CUSTOMER',
  CustomerLocation = 'CUSTOMER_LOCATION',
  DebtStatement = 'DEBT_STATEMENT',
  Driver = 'DRIVER',
  Expense = 'EXPENSE',
  Incident = 'INCIDENT',
  Merchant = 'MERCHANT',
  MerchantUser = 'MERCHANT_USER',
  Order = 'ORDER',
  OrderStop = 'ORDER_STOP',
  PaymentIn = 'PAYMENT_IN',
  Payroll = 'PAYROLL',
  PayrollLine = 'PAYROLL_LINE',
  Settings = 'SETTINGS',
  Supplier = 'SUPPLIER',
  Trip = 'TRIP',
  TripAdvance = 'TRIP_ADVANCE',
  Vehicle = 'VEHICLE'
}

export type ExpenseConnection = {
  __typename?: 'ExpenseConnection';
  nodes: Array<ExpenseView>;
  pageInfo: PageInfo;
  totalAmount: Scalars['Money']['output'];
  totalCount: Scalars['Int']['output'];
};

export type ExpenseFilter = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  driverId?: InputMaybe<Scalars['ID']['input']>;
  kind?: InputMaybe<Array<Scalars['String']['input']>>;
  orderId?: InputMaybe<Scalars['ID']['input']>;
  paidBy?: InputMaybe<Scalars['String']['input']>;
  paidStatus?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  supplierId?: InputMaybe<Scalars['ID']['input']>;
  tripId?: InputMaybe<Scalars['ID']['input']>;
  vehicleId?: InputMaybe<Scalars['ID']['input']>;
};

export type ExpenseInput = {
  amount: Scalars['Money']['input'];
  attachmentIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  driverId?: InputMaybe<Scalars['ID']['input']>;
  expenseDate: Scalars['String']['input'];
  kind: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  orderId?: InputMaybe<Scalars['ID']['input']>;
  paidBy?: InputMaybe<Scalars['String']['input']>;
  paidStatus?: InputMaybe<Scalars['String']['input']>;
  reimbursable?: InputMaybe<Scalars['Boolean']['input']>;
  supplierId?: InputMaybe<Scalars['ID']['input']>;
  tripId?: InputMaybe<Scalars['ID']['input']>;
  vehicleId?: InputMaybe<Scalars['ID']['input']>;
};

export type ExpenseView = {
  __typename?: 'ExpenseView';
  amount: Scalars['Money']['output'];
  attachmentCount: Scalars['Int']['output'];
  cancelReason?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['DateTime']['output']>;
  categoryId?: Maybe<Scalars['ID']['output']>;
  categoryName?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  driver?: Maybe<RefView>;
  driverId?: Maybe<Scalars['ID']['output']>;
  expenseDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isCost: Scalars['Boolean']['output'];
  kind: Scalars['String']['output'];
  kindLabel: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  order?: Maybe<RefView>;
  orderId?: Maybe<Scalars['ID']['output']>;
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  paidBy: Scalars['String']['output'];
  paidMethod?: Maybe<Scalars['String']['output']>;
  paidStatus: Scalars['String']['output'];
  reimbursable: Scalars['Boolean']['output'];
  status: Scalars['String']['output'];
  supplier?: Maybe<RefView>;
  supplierId?: Maybe<Scalars['ID']['output']>;
  trip?: Maybe<RefView>;
  tripId?: Maybe<Scalars['ID']['output']>;
  vehicle?: Maybe<RefView>;
  vehicleId?: Maybe<Scalars['ID']['output']>;
};

export type ExportFileInput = {
  filter?: InputMaybe<Scalars['JSON']['input']>;
  template: Scalars['String']['input'];
};

export type ExportedFile = {
  __typename?: 'ExportedFile';
  fileName: Scalars['String']['output'];
  rowCount: Scalars['Int']['output'];
  template: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type ExternalTransportInput = {
  agreedAmount?: InputMaybe<Scalars['Money']['input']>;
  driverName?: InputMaybe<Scalars['String']['input']>;
  driverPhone?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  supplierId?: InputMaybe<Scalars['ID']['input']>;
  vehiclePlate?: InputMaybe<Scalars['String']['input']>;
};

export type ExternalTransportView = {
  __typename?: 'ExternalTransportView';
  agreedAmount?: Maybe<Scalars['Money']['output']>;
  createdAt: Scalars['DateTime']['output'];
  driverName?: Maybe<Scalars['String']['output']>;
  driverPhone?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  note?: Maybe<Scalars['String']['output']>;
  orderCode?: Maybe<Scalars['String']['output']>;
  orderId: Scalars['ID']['output'];
  supplierId?: Maybe<Scalars['ID']['output']>;
  supplierName?: Maybe<Scalars['String']['output']>;
  tripCode?: Maybe<Scalars['String']['output']>;
  tripId?: Maybe<Scalars['ID']['output']>;
  vehiclePlate?: Maybe<Scalars['String']['output']>;
};

export type FinanceAlertsResult = {
  __typename?: 'FinanceAlertsResult';
  codWarnings: Scalars['Int']['output'];
  overdueOrders: Scalars['Int']['output'];
};

export type FinanceLedgerConnection = {
  __typename?: 'FinanceLedgerConnection';
  nodes: Array<FinanceLedgerEntry>;
  pageInfo: PageInfo;
  summary: FinanceLedgerSummary;
  totalCount: Scalars['Int']['output'];
};

export type FinanceLedgerEntry = {
  __typename?: 'FinanceLedgerEntry';
  amount: Scalars['Money']['output'];
  cashMoved: Scalars['Boolean']['output'];
  code: Scalars['String']['output'];
  counterpart: Scalars['String']['output'];
  createdByName?: Maybe<Scalars['String']['output']>;
  date: Scalars['DateTime']['output'];
  direction: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  links: Scalars['String']['output'];
  notRevenue: Scalars['Boolean']['output'];
  status: Scalars['String']['output'];
  type: Scalars['String']['output'];
  typeLabel: Scalars['String']['output'];
};

export type FinanceLedgerFilter = {
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  direction?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type FinanceLedgerSummary = {
  __typename?: 'FinanceLedgerSummary';
  advanceReturns: Scalars['Money']['output'];
  cashIn: Scalars['Money']['output'];
  cashOut: Scalars['Money']['output'];
  codRemittances: Scalars['Money']['output'];
  customerReceipts: Scalars['Money']['output'];
  driverPaidOut: Scalars['Money']['output'];
  otherIn: Scalars['Money']['output'];
  unpaidOut: Scalars['Money']['output'];
};

export type GeneratePayrollInput = {
  driverIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  month: Scalars['Int']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  year: Scalars['Int']['input'];
};

export type GlobalSearchResult = {
  __typename?: 'GlobalSearchResult';
  code?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  status?: Maybe<Scalars['String']['output']>;
  subtitle?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type ImportFieldView = {
  __typename?: 'ImportFieldView';
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  required: Scalars['Boolean']['output'];
  sourceColumn?: Maybe<Scalars['String']['output']>;
};

export type ImportJobView = {
  __typename?: 'ImportJobView';
  committedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdCount?: Maybe<Scalars['Int']['output']>;
  entityType: Scalars['String']['output'];
  errorRows: Scalars['Int']['output'];
  fields: Array<ImportFieldView>;
  fileName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  rows: Array<ImportRowView>;
  skippedCount?: Maybe<Scalars['Int']['output']>;
  status: Scalars['String']['output'];
  totalRows: Scalars['Int']['output'];
  unmappedColumns: Array<Scalars['String']['output']>;
  validRows: Scalars['Int']['output'];
  warningRows: Scalars['Int']['output'];
};

export type ImportPreviewFilter = {
  onlyErrors?: InputMaybe<Scalars['Boolean']['input']>;
  onlyWarnings?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ImportRowView = {
  __typename?: 'ImportRowView';
  createdCode?: Maybe<Scalars['String']['output']>;
  errors: Array<Scalars['String']['output']>;
  line: Scalars['Int']['output'];
  values: Scalars['JSON']['output'];
  warnings: Array<Scalars['String']['output']>;
};

export type ImportTemplateFile = {
  __typename?: 'ImportTemplateFile';
  fileName: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type IncidentConnection = {
  __typename?: 'IncidentConnection';
  nodes: Array<IncidentView>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type IncidentFilter = {
  assigneeId?: InputMaybe<Scalars['ID']['input']>;
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  orderId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  severity?: InputMaybe<Array<Scalars['String']['input']>>;
  status?: InputMaybe<Array<Scalars['String']['input']>>;
  tripId?: InputMaybe<Scalars['ID']['input']>;
  typeId?: InputMaybe<Scalars['ID']['input']>;
};

export type IncidentInput = {
  assigneeUserId?: InputMaybe<Scalars['ID']['input']>;
  attachmentIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  clientRequestId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  orderId?: InputMaybe<Scalars['ID']['input']>;
  severity: Scalars['String']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
  stopId?: InputMaybe<Scalars['ID']['input']>;
  title: Scalars['String']['input'];
  tripId?: InputMaybe<Scalars['ID']['input']>;
  typeId?: InputMaybe<Scalars['ID']['input']>;
};

export type IncidentView = {
  __typename?: 'IncidentView';
  activity?: Maybe<Array<TimelineEntry>>;
  assigneeName?: Maybe<Scalars['String']['output']>;
  assigneeUserId?: Maybe<Scalars['ID']['output']>;
  attachments?: Maybe<Array<AttachmentView>>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  driverId?: Maybe<Scalars['ID']['output']>;
  driverName?: Maybe<Scalars['String']['output']>;
  driverPhone?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  location?: Maybe<Scalars['String']['output']>;
  orderCode?: Maybe<Scalars['String']['output']>;
  orderId?: Maybe<Scalars['ID']['output']>;
  reportedByName?: Maybe<Scalars['String']['output']>;
  reportedByType: Scalars['String']['output'];
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  resolvedNote?: Maybe<Scalars['String']['output']>;
  severity: Scalars['String']['output'];
  status: Scalars['String']['output'];
  stopId?: Maybe<Scalars['ID']['output']>;
  title: Scalars['String']['output'];
  tripCode?: Maybe<Scalars['String']['output']>;
  tripId?: Maybe<Scalars['ID']['output']>;
  typeId?: Maybe<Scalars['ID']['output']>;
  typeName?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  vehicleId?: Maybe<Scalars['ID']['output']>;
  vehiclePlate?: Maybe<Scalars['String']['output']>;
};

export type InviteMerchantUserInput = {
  email: Scalars['String']['input'];
  extraPermissions?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  role: Scalars['String']['input'];
};

export type LastKnownLocationView = {
  __typename?: 'LastKnownLocationView';
  capturedAt: Scalars['DateTime']['output'];
  driverName?: Maybe<Scalars['String']['output']>;
  driverPhone?: Maybe<Scalars['String']['output']>;
  isStale: Scalars['Boolean']['output'];
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
  orderCode: Scalars['String']['output'];
  tripCode: Scalars['String']['output'];
  tripId: Scalars['ID']['output'];
  tripStatus: Scalars['String']['output'];
  vehiclePlate?: Maybe<Scalars['String']['output']>;
};

export type LastLocationView = {
  __typename?: 'LastLocationView';
  capturedAt: Scalars['DateTime']['output'];
  isStale: Scalars['Boolean']['output'];
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
  speed?: Maybe<Scalars['Float']['output']>;
};

export type LedgerEntryView = {
  __typename?: 'LedgerEntryView';
  companyOwes: Scalars['Money']['output'];
  date: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  docCode?: Maybe<Scalars['String']['output']>;
  driverOwes: Scalars['Money']['output'];
  kind: Scalars['String']['output'];
  refId?: Maybe<Scalars['ID']['output']>;
  runningBalance: Scalars['Money']['output'];
};

export type MarkExpensePaidInput = {
  method?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  paidAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type MasterExpenseItem = {
  __typename?: 'MasterExpenseItem';
  amount: Scalars['Money']['output'];
  categoryName?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  expenseDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  kind: Scalars['String']['output'];
  orderCode?: Maybe<Scalars['String']['output']>;
  paidBy: Scalars['String']['output'];
  paidStatus: Scalars['String']['output'];
  status: Scalars['String']['output'];
  supplierName?: Maybe<Scalars['String']['output']>;
  tripCode?: Maybe<Scalars['String']['output']>;
  vehiclePlate?: Maybe<Scalars['String']['output']>;
};

export type MasterRef = {
  __typename?: 'MasterRef';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type MasterTripItem = {
  __typename?: 'MasterTripItem';
  actualEndAt?: Maybe<Scalars['DateTime']['output']>;
  actualStartAt?: Maybe<Scalars['DateTime']['output']>;
  code: Scalars['String']['output'];
  driverBonusAmount: Scalars['Money']['output'];
  driverName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  orderCode?: Maybe<Scalars['String']['output']>;
  orderId: Scalars['ID']['output'];
  plannedEndAt?: Maybe<Scalars['DateTime']['output']>;
  plannedStartAt: Scalars['DateTime']['output'];
  routeSummary?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  vehiclePlate?: Maybe<Scalars['String']['output']>;
};

export type Me = {
  __typename?: 'Me';
  account: Account;
  canCreateMerchant: Scalars['Boolean']['output'];
  current?: Maybe<CurrentContext>;
  memberships: Array<Membership>;
};

export type Membership = {
  __typename?: 'Membership';
  id: Scalars['ID']['output'];
  lastAccessAt?: Maybe<Scalars['DateTime']['output']>;
  merchantCode: Scalars['String']['output'];
  merchantId: Scalars['ID']['output'];
  merchantName: Scalars['String']['output'];
  role: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type MerchantLinkView = {
  __typename?: 'MerchantLinkView';
  customerCode: Scalars['String']['output'];
  merchantId: Scalars['ID']['output'];
  merchantName: Scalars['String']['output'];
  orderCount: Scalars['Int']['output'];
  paymentTermDays?: Maybe<Scalars['Int']['output']>;
};

export type MerchantProfile = {
  __typename?: 'MerchantProfile';
  address?: Maybe<Scalars['String']['output']>;
  businessType?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  contactName?: Maybe<Scalars['String']['output']>;
  dispatchHotline?: Maybe<Scalars['String']['output']>;
  district?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  intro?: Maybe<Scalars['String']['output']>;
  legalName?: Maybe<Scalars['String']['output']>;
  logoAttachmentId?: Maybe<Scalars['String']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  province?: Maybe<Scalars['String']['output']>;
  publicProfile: Scalars['Boolean']['output'];
  representativeName?: Maybe<Scalars['String']['output']>;
  representativeTitle?: Maybe<Scalars['String']['output']>;
  serviceAreas: Array<Scalars['String']['output']>;
  services: Array<Scalars['String']['output']>;
  taxCode?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  yardName?: Maybe<Scalars['String']['output']>;
};

export type MerchantProfileInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  businessType?: InputMaybe<Scalars['String']['input']>;
  contactName?: InputMaybe<Scalars['String']['input']>;
  dispatchHotline?: InputMaybe<Scalars['String']['input']>;
  district?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  intro?: InputMaybe<Scalars['String']['input']>;
  legalName?: InputMaybe<Scalars['String']['input']>;
  logoAttachmentId?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  province?: InputMaybe<Scalars['String']['input']>;
  publicProfile?: InputMaybe<Scalars['Boolean']['input']>;
  representativeName?: InputMaybe<Scalars['String']['input']>;
  representativeTitle?: InputMaybe<Scalars['String']['input']>;
  serviceAreas?: InputMaybe<Array<Scalars['String']['input']>>;
  services?: InputMaybe<Array<Scalars['String']['input']>>;
  taxCode?: InputMaybe<Scalars['String']['input']>;
  yardName?: InputMaybe<Scalars['String']['input']>;
};

export type MerchantSettingsInput = {
  codDashboardAlert?: InputMaybe<Scalars['Boolean']['input']>;
  codWarningAmount?: InputMaybe<Scalars['Money']['input']>;
  codWarningDays?: InputMaybe<Scalars['Int']['input']>;
  defaultCreditLimit?: InputMaybe<Scalars['Money']['input']>;
  defaultDebtDays?: InputMaybe<Scalars['Int']['input']>;
  defaultTripHours?: InputMaybe<Scalars['Int']['input']>;
  gpsRetentionDays?: InputMaybe<Scalars['Int']['input']>;
  nearOverlapMinutes?: InputMaybe<Scalars['Int']['input']>;
  overlapWarnDriver?: InputMaybe<Scalars['Boolean']['input']>;
  overlapWarnVehicle?: InputMaybe<Scalars['Boolean']['input']>;
  payrollPeriodType?: InputMaybe<Scalars['String']['input']>;
  payrollStartDay?: InputMaybe<Scalars['Int']['input']>;
  warnOverLimit?: InputMaybe<Scalars['Boolean']['input']>;
  warnOverdue?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MerchantSettingsView = {
  __typename?: 'MerchantSettingsView';
  codDashboardAlert: Scalars['Boolean']['output'];
  codWarningAmount: Scalars['Money']['output'];
  codWarningDays: Scalars['Int']['output'];
  defaultCreditLimit?: Maybe<Scalars['Money']['output']>;
  defaultDebtDays: Scalars['Int']['output'];
  defaultTripHours: Scalars['Int']['output'];
  gpsRetentionDays: Scalars['Int']['output'];
  nearOverlapMinutes: Scalars['Int']['output'];
  overlapWarnDriver: Scalars['Boolean']['output'];
  overlapWarnVehicle: Scalars['Boolean']['output'];
  payrollPeriodType: Scalars['String']['output'];
  payrollStartDay: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  warnOverLimit: Scalars['Boolean']['output'];
  warnOverdue: Scalars['Boolean']['output'];
};

export type MerchantUserConnection = {
  __typename?: 'MerchantUserConnection';
  nodes: Array<MerchantUserView>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type MerchantUserFilter = {
  role?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type MerchantUserView = {
  __typename?: 'MerchantUserView';
  appLogin: StaffAppLoginView;
  effectivePermissions: Array<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  extraPermissions: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  invitedAt: Scalars['DateTime']['output'];
  invitedByName?: Maybe<Scalars['String']['output']>;
  isSelf: Scalars['Boolean']['output'];
  joinedAt?: Maybe<Scalars['DateTime']['output']>;
  lastAccessAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  status: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptBooking: BookingView;
  acceptInvitation: Membership;
  activateCatalogItem: CatalogItemView;
  activateCustomer: CustomerView;
  activateDriver: DriverView;
  activateSupplier: SupplierView;
  activateVehicle: VehicleView;
  addBookingNote: BookingView;
  addDriverSalaryHistory: Array<DriverSalaryHistoryView>;
  addPayrollItem: PayrollLineView;
  allocatePayment: AllocatePaymentPayload;
  approvePayroll: PayrollView;
  assignIncident: IncidentView;
  cancelBooking: BookingView;
  cancelDebtStatement: DebtStatementView;
  cancelExpense: ExpenseView;
  cancelImport: ImportJobView;
  cancelIncident: IncidentView;
  cancelOrder: OrderView;
  cancelPaymentIn: PaymentView;
  cancelPayroll: PayrollView;
  cancelTrip: TripView;
  closeIncident: IncidentView;
  commitImport: ImportJobView;
  createBooking: BookingView;
  createCatalogItem: CatalogItemView;
  createCustomer: CustomerView;
  createCustomerLocation: CustomerLocationView;
  createDebtStatement: DebtStatementView;
  createDriver: DriverView;
  createExpense: ExpenseView;
  createIncident: IncidentView;
  createMerchant: Membership;
  createMyAddress: CustomerAddressView;
  createOrResetDriverAccount: DriverAccountCredentials;
  createOrder: OrderPayload;
  createOrderStop: OrderView;
  createPaymentIn: PaymentView;
  createSupplier: SupplierView;
  createTrip: TripPayload;
  createVehicle: VehicleView;
  deactivateCatalogItem: CatalogItemView;
  deactivateCustomer: CustomerView;
  deactivateDriver: DriverView;
  deactivateSupplier: SupplierView;
  deactivateVehicle: VehicleView;
  deleteAttachment: AttachmentView;
  deleteCargoLine: OrderView;
  deleteCustomerLocation: Scalars['Boolean']['output'];
  deleteMyAddress: Scalars['Boolean']['output'];
  deleteOrderAddon: OrderView;
  disableDriverAccount: DriverView;
  disableMerchantUserAppLogin: MerchantUserView;
  driverReportIncident: IncidentView;
  driverResumeTrip: DriverTripPayload;
  driverSubmitCod: DriverStopPayload;
  driverUpdateStopStatus: DriverStopPayload;
  driverUpdateTripStatus: DriverTripPayload;
  exportFile: ExportedFile;
  finalizeDebtStatement: DebtStatementView;
  generatePayroll: PayrollView;
  inviteMerchantUser: MerchantUserView;
  lockMerchantUser: MerchantUserView;
  markAllNotificationsRead: Scalars['Int']['output'];
  markDebtStatementSent: DebtStatementView;
  markExpensePaid: ExpenseView;
  markExpensesPaid: Array<ExpenseView>;
  markNotificationRead: Scalars['Int']['output'];
  markNotificationsRead: Scalars['Int']['output'];
  markPayrollPaid: PayrollView;
  reconcileTripAdvance: TripAdvanceView;
  refreshDebtStatement: DebtStatementView;
  rejectBooking: BookingView;
  removeOrderStop: OrderView;
  removePayrollItem: PayrollLineView;
  renderDocument: RenderedDocument;
  reorderCatalogItems: Array<CatalogItemView>;
  reorderOrderStops: OrderView;
  resendInvite: MerchantUserView;
  resetMerchantUserAppPassword: StaffAppCredentials;
  resolveScheduleWarning: Scalars['Boolean']['output'];
  resumeTrip: TripView;
  returnPayroll: PayrollView;
  runFinanceAlerts: FinanceAlertsResult;
  setAttachmentShared: AttachmentView;
  setMyAppCredentials: Me;
  setVehicleStatus: VehicleView;
  startImport: ImportJobView;
  submitPayroll: PayrollView;
  unallocatePayment: PaymentView;
  unlockMerchantUser: MerchantUserView;
  updateBooking: BookingView;
  updateCatalogItem: CatalogItemView;
  updateCustomer: CustomerView;
  updateCustomerLocation: CustomerLocationView;
  updateCustomerProfile: CustomerMe;
  updateDriver: DriverView;
  updateExpense: ExpenseView;
  updateIncident: IncidentView;
  updateMerchantProfile: MerchantProfile;
  updateMerchantSettings: MerchantSettingsView;
  updateMerchantUser: MerchantUserView;
  updateMyAddress: CustomerAddressView;
  updateNumberSequenceFormat: NumberSequenceView;
  updateOrder: OrderView;
  updateOrderPricing: OrderView;
  updateOrderStatus: OrderView;
  updateOrderStop: OrderStopView;
  updatePaymentIn: PaymentView;
  updateRolePermission: PermissionMatrixRow;
  updateStopCodActual: OrderStopStatusView;
  updateStopStatus: OrderStopStatusView;
  updateSupplier: SupplierView;
  updateTrip: TripPayload;
  updateTripStatus: TripView;
  updateVehicle: VehicleView;
  upsertCargoLine: OrderView;
  upsertExternalTransport: ExternalTransportView;
  upsertOrderAddon: OrderView;
};


export type MutationAcceptBookingArgs = {
  customerId?: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
};


export type MutationAcceptInvitationArgs = {
  membershipId: Scalars['ID']['input'];
};


export type MutationActivateCatalogItemArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateCustomerArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateDriverArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateSupplierArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateVehicleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAddBookingNoteArgs = {
  body: Scalars['String']['input'];
  bookingId: Scalars['ID']['input'];
};


export type MutationAddDriverSalaryHistoryArgs = {
  driverId: Scalars['ID']['input'];
  input: SalaryHistoryInput;
};


export type MutationAddPayrollItemArgs = {
  input: PayrollItemInput;
};


export type MutationAllocatePaymentArgs = {
  input: AllocatePaymentInput;
};


export type MutationApprovePayrollArgs = {
  id: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAssignIncidentArgs = {
  id: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationCancelBookingArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationCancelDebtStatementArgs = {
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCancelExpenseArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationCancelImportArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCancelIncidentArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationCancelOrderArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationCancelPaymentInArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationCancelPayrollArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationCancelTripArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationCloseIncidentArgs = {
  id: Scalars['ID']['input'];
  note: Scalars['String']['input'];
};


export type MutationCommitImportArgs = {
  id: Scalars['ID']['input'];
  skipErrors?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationCreateBookingArgs = {
  input: BookingInput;
};


export type MutationCreateCatalogItemArgs = {
  input: CatalogItemInput;
};


export type MutationCreateCustomerArgs = {
  input: CustomerInput;
};


export type MutationCreateCustomerLocationArgs = {
  customerId: Scalars['ID']['input'];
  input: CustomerLocationInput;
};


export type MutationCreateDebtStatementArgs = {
  input: CreateDebtStatementInput;
};


export type MutationCreateDriverArgs = {
  input: DriverInput;
};


export type MutationCreateExpenseArgs = {
  input: ExpenseInput;
};


export type MutationCreateIncidentArgs = {
  input: IncidentInput;
};


export type MutationCreateMerchantArgs = {
  input: CreateMerchantInput;
};


export type MutationCreateMyAddressArgs = {
  input: CustomerAddressInput;
};


export type MutationCreateOrResetDriverAccountArgs = {
  driverId: Scalars['ID']['input'];
};


export type MutationCreateOrderArgs = {
  input: CreateOrderInput;
};


export type MutationCreateOrderStopArgs = {
  input: OrderStopInput;
  orderId: Scalars['ID']['input'];
};


export type MutationCreatePaymentInArgs = {
  input: PaymentInInput;
};


export type MutationCreateSupplierArgs = {
  input: SupplierInput;
};


export type MutationCreateTripArgs = {
  input: TripInput;
};


export type MutationCreateVehicleArgs = {
  input: VehicleInput;
};


export type MutationDeactivateCatalogItemArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateCustomerArgs = {
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeactivateDriverArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationDeactivateSupplierArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationDeactivateVehicleArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationDeleteAttachmentArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationDeleteCargoLineArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCustomerLocationArgs = {
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteMyAddressArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOrderAddonArgs = {
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDisableDriverAccountArgs = {
  driverId: Scalars['ID']['input'];
};


export type MutationDisableMerchantUserAppLoginArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDriverReportIncidentArgs = {
  input: DriverIncidentInput;
};


export type MutationDriverResumeTripArgs = {
  idempotencyKey?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  tripId: Scalars['ID']['input'];
};


export type MutationDriverSubmitCodArgs = {
  input: DriverCodInput;
};


export type MutationDriverUpdateStopStatusArgs = {
  input: DriverStopStatusInput;
};


export type MutationDriverUpdateTripStatusArgs = {
  input: DriverTripStatusInput;
};


export type MutationExportFileArgs = {
  input: ExportFileInput;
};


export type MutationFinalizeDebtStatementArgs = {
  id: Scalars['ID']['input'];
};


export type MutationGeneratePayrollArgs = {
  input: GeneratePayrollInput;
};


export type MutationInviteMerchantUserArgs = {
  input: InviteMerchantUserInput;
};


export type MutationLockMerchantUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkDebtStatementSentArgs = {
  id: Scalars['ID']['input'];
  shareWithCustomer?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationMarkExpensePaidArgs = {
  id: Scalars['ID']['input'];
  input?: InputMaybe<MarkExpensePaidInput>;
};


export type MutationMarkExpensesPaidArgs = {
  ids: Array<Scalars['ID']['input']>;
  input?: InputMaybe<MarkExpensePaidInput>;
};


export type MutationMarkNotificationReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkNotificationsReadArgs = {
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
};


export type MutationMarkPayrollPaidArgs = {
  id: Scalars['ID']['input'];
  paidAt?: InputMaybe<Scalars['DateTime']['input']>;
};


export type MutationReconcileTripAdvanceArgs = {
  input: ReconcileTripAdvanceInput;
};


export type MutationRefreshDebtStatementArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRejectBookingArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationRemoveOrderStopArgs = {
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRemovePayrollItemArgs = {
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationRenderDocumentArgs = {
  input: RenderDocumentInput;
};


export type MutationReorderCatalogItemsArgs = {
  ids: Array<Scalars['ID']['input']>;
  type: CatalogType;
};


export type MutationReorderOrderStopsArgs = {
  orderId: Scalars['ID']['input'];
  stopIds: Array<Scalars['ID']['input']>;
};


export type MutationResendInviteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationResetMerchantUserAppPasswordArgs = {
  id: Scalars['ID']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
};


export type MutationResolveScheduleWarningArgs = {
  id: Scalars['ID']['input'];
};


export type MutationResumeTripArgs = {
  id: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
};


export type MutationReturnPayrollArgs = {
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetAttachmentSharedArgs = {
  id: Scalars['ID']['input'];
  shared: Scalars['Boolean']['input'];
};


export type MutationSetMyAppCredentialsArgs = {
  newPassword: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};


export type MutationSetVehicleStatusArgs = {
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  status: Scalars['String']['input'];
};


export type MutationStartImportArgs = {
  input: StartImportInput;
};


export type MutationSubmitPayrollArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnallocatePaymentArgs = {
  allocationId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};


export type MutationUnlockMerchantUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateBookingArgs = {
  id: Scalars['ID']['input'];
  input: BookingInput;
};


export type MutationUpdateCatalogItemArgs = {
  id: Scalars['ID']['input'];
  input: CatalogItemInput;
};


export type MutationUpdateCustomerArgs = {
  id: Scalars['ID']['input'];
  input: CustomerInput;
};


export type MutationUpdateCustomerLocationArgs = {
  id: Scalars['ID']['input'];
  input: CustomerLocationInput;
};


export type MutationUpdateCustomerProfileArgs = {
  input: CustomerProfileInput;
};


export type MutationUpdateDriverArgs = {
  id: Scalars['ID']['input'];
  input: DriverInput;
};


export type MutationUpdateExpenseArgs = {
  id: Scalars['ID']['input'];
  input: ExpenseInput;
  reason: Scalars['String']['input'];
};


export type MutationUpdateIncidentArgs = {
  id: Scalars['ID']['input'];
  input: IncidentInput;
};


export type MutationUpdateMerchantProfileArgs = {
  input: MerchantProfileInput;
};


export type MutationUpdateMerchantSettingsArgs = {
  input: MerchantSettingsInput;
};


export type MutationUpdateMerchantUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMerchantUserInput;
};


export type MutationUpdateMyAddressArgs = {
  id: Scalars['ID']['input'];
  input: CustomerAddressInput;
};


export type MutationUpdateNumberSequenceFormatArgs = {
  docType: DocType;
  input: NumberFormatInput;
};


export type MutationUpdateOrderArgs = {
  id: Scalars['ID']['input'];
  input: UpdateOrderInput;
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateOrderPricingArgs = {
  id: Scalars['ID']['input'];
  input: OrderPricingInput;
};


export type MutationUpdateOrderStatusArgs = {
  id: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  status: Scalars['String']['input'];
};


export type MutationUpdateOrderStopArgs = {
  id: Scalars['ID']['input'];
  input: OrderStopInput;
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdatePaymentInArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePaymentInInput;
  reason: Scalars['String']['input'];
};


export type MutationUpdateRolePermissionArgs = {
  grant: Scalars['String']['input'];
  permission: Scalars['String']['input'];
  role: Scalars['String']['input'];
};


export type MutationUpdateStopCodActualArgs = {
  amount: Scalars['Money']['input'];
  id: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateStopStatusArgs = {
  actualAt?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  status: Scalars['String']['input'];
  tripId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationUpdateSupplierArgs = {
  id: Scalars['ID']['input'];
  input: SupplierInput;
};


export type MutationUpdateTripArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTripInput;
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateTripStatusArgs = {
  id: Scalars['ID']['input'];
  input: TripStatusChangeInput;
};


export type MutationUpdateVehicleArgs = {
  id: Scalars['ID']['input'];
  input: VehicleInput;
};


export type MutationUpsertCargoLineArgs = {
  input: CargoLineInput;
  orderId: Scalars['ID']['input'];
};


export type MutationUpsertExternalTransportArgs = {
  input: ExternalTransportInput;
  orderId: Scalars['ID']['input'];
  tripId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationUpsertOrderAddonArgs = {
  input: OrderAddonInput;
  orderId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};

export type MyDebtSummary = {
  __typename?: 'MyDebtSummary';
  openOrders: Scalars['Int']['output'];
  overdue: Scalars['Money']['output'];
  paid: Scalars['Money']['output'];
  remaining: Scalars['Money']['output'];
  total: Scalars['Money']['output'];
};

export type MyOrderConnection = {
  __typename?: 'MyOrderConnection';
  nodes: Array<MyOrderView>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type MyOrderFilter = {
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<Scalars['String']['input']>>;
  unpaidOnly?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MyOrderStopView = {
  __typename?: 'MyOrderStopView';
  actualAt?: Maybe<Scalars['DateTime']['output']>;
  address: Scalars['String']['output'];
  contactName?: Maybe<Scalars['String']['output']>;
  place?: Maybe<Scalars['String']['output']>;
  plannedAt?: Maybe<Scalars['DateTime']['output']>;
  status: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type MyOrderView = {
  __typename?: 'MyOrderView';
  bookingCode?: Maybe<Scalars['String']['output']>;
  bookingId?: Maybe<Scalars['ID']['output']>;
  cargo?: Maybe<Array<Scalars['String']['output']>>;
  code: Scalars['String']['output'];
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  merchantId: Scalars['ID']['output'];
  merchantName: Scalars['String']['output'];
  orderDate: Scalars['DateTime']['output'];
  overdueDays: Scalars['Int']['output'];
  paidAmount: Scalars['Money']['output'];
  pricingLines?: Maybe<Array<PricingLine>>;
  remainingAmount: Scalars['Money']['output'];
  routeSummary?: Maybe<Scalars['String']['output']>;
  sharedAttachments?: Maybe<Array<SharedAttachmentView>>;
  statementCode?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  stops?: Maybe<Array<MyOrderStopView>>;
  totalAmount: Scalars['Money']['output'];
  trips?: Maybe<Array<MyTripProgress>>;
};

export type MyStatementLine = {
  __typename?: 'MyStatementLine';
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  orderCode: Scalars['String']['output'];
  orderDate: Scalars['DateTime']['output'];
  orderId: Scalars['ID']['output'];
  overdueDays: Scalars['Int']['output'];
  paid: Scalars['Money']['output'];
  remaining: Scalars['Money']['output'];
  route?: Maybe<Scalars['String']['output']>;
  total: Scalars['Money']['output'];
};

export type MyStatementView = {
  __typename?: 'MyStatementView';
  code: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lines?: Maybe<Array<MyStatementLine>>;
  merchantName: Scalars['String']['output'];
  orderCount: Scalars['Int']['output'];
  paid: Scalars['Money']['output'];
  pdfUrl?: Maybe<Scalars['String']['output']>;
  periodFrom: Scalars['DateTime']['output'];
  periodTo: Scalars['DateTime']['output'];
  remaining: Scalars['Money']['output'];
  sentAt?: Maybe<Scalars['DateTime']['output']>;
  status: Scalars['String']['output'];
  total: Scalars['Money']['output'];
};

export type MyTripProgress = {
  __typename?: 'MyTripProgress';
  code: Scalars['String']['output'];
  driverName?: Maybe<Scalars['String']['output']>;
  lastUpdateAt: Scalars['DateTime']['output'];
  plate?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  vehicleType?: Maybe<Scalars['String']['output']>;
};

export type NavBadges = {
  __typename?: 'NavBadges';
  codOverThreshold: Scalars['Int']['output'];
  dispatch: Scalars['Int']['output'];
  finance: Scalars['Int']['output'];
  incidents: Scalars['Int']['output'];
  overdueCustomers: Scalars['Int']['output'];
  payroll: Scalars['Int']['output'];
  scheduleWarnings: Scalars['Int']['output'];
};

export type NotificationConnection = {
  __typename?: 'NotificationConnection';
  nodes: Array<NotificationView>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
  unreadCount: Scalars['Int']['output'];
};

export type NotificationFilter = {
  types?: InputMaybe<Array<Scalars['String']['input']>>;
  unread?: InputMaybe<Scalars['Boolean']['input']>;
};

export type NotificationView = {
  __typename?: 'NotificationView';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  entityId?: Maybe<Scalars['ID']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  readAt?: Maybe<Scalars['DateTime']['output']>;
  severity?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type NumberFormatInput = {
  datePart: Scalars['String']['input'];
  digits: Scalars['Int']['input'];
  prefix: Scalars['String']['input'];
  resetPeriod: Scalars['String']['input'];
  separator: Scalars['String']['input'];
};

export type NumberSequenceView = {
  __typename?: 'NumberSequenceView';
  datePart: Scalars['String']['output'];
  digits: Scalars['Int']['output'];
  docType: Scalars['String']['output'];
  issuedThisPeriod: Scalars['Int']['output'];
  label: Scalars['String']['output'];
  nextValue: Scalars['String']['output'];
  pattern: Scalars['String']['output'];
  prefix: Scalars['String']['output'];
  resetPeriod: Scalars['String']['output'];
  separator: Scalars['String']['output'];
};

export type OrderAddonInput = {
  amount: Scalars['Money']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  serviceId?: InputMaybe<Scalars['ID']['input']>;
};

export type OrderAddonView = {
  __typename?: 'OrderAddonView';
  amount: Scalars['Money']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  serviceId?: Maybe<Scalars['ID']['output']>;
};

export type OrderAllocationView = {
  __typename?: 'OrderAllocationView';
  amount: Scalars['Money']['output'];
  id: Scalars['ID']['output'];
  paymentCode: Scalars['String']['output'];
  paymentId: Scalars['ID']['output'];
  receivedAt: Scalars['DateTime']['output'];
};

export type OrderConnection = {
  __typename?: 'OrderConnection';
  nodes: Array<OrderView>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type OrderCustomerRef = {
  __typename?: 'OrderCustomerRef';
  code: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
};

export type OrderExpenseView = {
  __typename?: 'OrderExpenseView';
  amount: Scalars['Money']['output'];
  categoryName?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  expenseDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isCost: Scalars['Boolean']['output'];
  kind: Scalars['String']['output'];
  paidBy: Scalars['String']['output'];
  paidStatus: Scalars['String']['output'];
  status: Scalars['String']['output'];
  supplierName?: Maybe<Scalars['String']['output']>;
  tripCode?: Maybe<Scalars['String']['output']>;
};

export type OrderFilter = {
  customerId?: InputMaybe<Scalars['ID']['input']>;
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  debtStatus?: InputMaybe<Scalars['String']['input']>;
  needsAction?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<Scalars['String']['input']>>;
  warning?: InputMaybe<Scalars['Boolean']['input']>;
};

export type OrderFinanceSummary = {
  __typename?: 'OrderFinanceSummary';
  addonTotal: Scalars['Money']['output'];
  allocations: Array<OrderAllocationView>;
  driverBonusTotal: Scalars['Money']['output'];
  expenseTotal: Scalars['Money']['output'];
  expenses: Array<OrderExpenseView>;
  freight: Scalars['Money']['output'];
  margin?: Maybe<Scalars['Float']['output']>;
  otherCost: Scalars['Money']['output'];
  outsourcedCost: Scalars['Money']['output'];
  overdueDays: Scalars['Int']['output'];
  paidAmount: Scalars['Money']['output'];
  profit: Scalars['Money']['output'];
  provisional: Scalars['Boolean']['output'];
  receivable: Scalars['Money']['output'];
  remainingAmount: Scalars['Money']['output'];
  totalAmount: Scalars['Money']['output'];
  tripCost: Scalars['Money']['output'];
};

export type OrderFinanceView = {
  __typename?: 'OrderFinanceView';
  addonTotal: Scalars['Money']['output'];
  allocations: Array<AllocationView>;
  code: Scalars['String']['output'];
  cost: Scalars['Money']['output'];
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  expenses: Array<ExpenseView>;
  freightAmount: Scalars['Money']['output'];
  margin?: Maybe<Scalars['Float']['output']>;
  orderId: Scalars['ID']['output'];
  otherCost: Scalars['Money']['output'];
  outsourcedCost: Scalars['Money']['output'];
  overdueDays: Scalars['Int']['output'];
  paidAmount: Scalars['Money']['output'];
  profit: Scalars['Money']['output'];
  provisional: Scalars['Boolean']['output'];
  receivable: Scalars['Money']['output'];
  remainingAmount: Scalars['Money']['output'];
  revenue: Scalars['Money']['output'];
  status: Scalars['String']['output'];
  totalAmount: Scalars['Money']['output'];
  tripCost: Scalars['Money']['output'];
};

export type OrderPayload = {
  __typename?: 'OrderPayload';
  order: OrderView;
  trip?: Maybe<TripView>;
  warnings: Array<Scalars['String']['output']>;
};

export type OrderPricingInput = {
  addons?: InputMaybe<Array<OrderAddonInput>>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  freightAmount: Scalars['Money']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};

export type OrderStopInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  codExpected?: InputMaybe<Scalars['Money']['input']>;
  contactName?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  lat?: InputMaybe<Scalars['Float']['input']>;
  lng?: InputMaybe<Scalars['Float']['input']>;
  locationId?: InputMaybe<Scalars['ID']['input']>;
  locationName?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  plannedAt?: InputMaybe<Scalars['DateTime']['input']>;
  province?: InputMaybe<Scalars['String']['input']>;
  sequence?: InputMaybe<Scalars['Int']['input']>;
  type: Scalars['String']['input'];
};

export type OrderStopStatusView = {
  __typename?: 'OrderStopStatusView';
  arrivedAt?: Maybe<Scalars['DateTime']['output']>;
  codActual?: Maybe<Scalars['Money']['output']>;
  codCollectedAt?: Maybe<Scalars['DateTime']['output']>;
  codExpected?: Maybe<Scalars['Money']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  orderId: Scalars['ID']['output'];
  orderStatus: Scalars['String']['output'];
  skipReason?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  warnings: Array<Scalars['String']['output']>;
};

export type OrderStopView = {
  __typename?: 'OrderStopView';
  address: Scalars['String']['output'];
  arrivedAt?: Maybe<Scalars['DateTime']['output']>;
  codActual?: Maybe<Scalars['Money']['output']>;
  codCollectedAt?: Maybe<Scalars['DateTime']['output']>;
  codExpected?: Maybe<Scalars['Money']['output']>;
  codNote?: Maybe<Scalars['String']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  contactName?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
  locationId?: Maybe<Scalars['ID']['output']>;
  locationName?: Maybe<Scalars['String']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  orderCode?: Maybe<Scalars['String']['output']>;
  orderId: Scalars['ID']['output'];
  plannedAt?: Maybe<Scalars['DateTime']['output']>;
  podAttachments?: Maybe<Array<AttachmentView>>;
  podCount: Scalars['Int']['output'];
  province?: Maybe<Scalars['String']['output']>;
  sequence: Scalars['Int']['output'];
  skipReason?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  statusHistory?: Maybe<Array<TimelineEntry>>;
  tripCodes: Array<Scalars['String']['output']>;
  tripIds: Array<Scalars['ID']['output']>;
  type: Scalars['String']['output'];
};

export type OrderTotalsView = {
  __typename?: 'OrderTotalsView';
  count: Scalars['Int']['output'];
  overdueAmount: Scalars['Money']['output'];
  paidAmount: Scalars['Money']['output'];
  remainingAmount: Scalars['Money']['output'];
  totalAmount: Scalars['Money']['output'];
};

export type OrderView = {
  __typename?: 'OrderView';
  addonTotal: Scalars['Money']['output'];
  addons?: Maybe<Array<OrderAddonView>>;
  attachmentCount?: Maybe<Scalars['Int']['output']>;
  bookingId?: Maybe<Scalars['ID']['output']>;
  cancelReason?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['DateTime']['output']>;
  cargoLines?: Maybe<Array<CargoLineView>>;
  code: Scalars['String']['output'];
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  confirmedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customer: OrderCustomerRef;
  customerWarnings?: Maybe<Array<Scalars['String']['output']>>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  externalTransports?: Maybe<Array<ExternalTransportView>>;
  financeSummary?: Maybe<OrderFinanceSummary>;
  freightAmount: Scalars['Money']['output'];
  id: Scalars['ID']['output'];
  incidents?: Maybe<Array<TripIncidentRef>>;
  internalNote?: Maybe<Scalars['String']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  orderDate: Scalars['DateTime']['output'];
  overdueDays: Scalars['Int']['output'];
  paidAmount: Scalars['Money']['output'];
  priceLocked: Scalars['Boolean']['output'];
  remainingAmount: Scalars['Money']['output'];
  requiredCapacityTons?: Maybe<Scalars['Float']['output']>;
  requiredVehicleTypeId?: Maybe<Scalars['ID']['output']>;
  requiredVehicleTypeName?: Maybe<Scalars['String']['output']>;
  routeSummary?: Maybe<Scalars['String']['output']>;
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  status: Scalars['String']['output'];
  stops?: Maybe<Array<OrderStopView>>;
  totalAmount: Scalars['Money']['output'];
  tripCount: Scalars['Int']['output'];
  trips?: Maybe<Array<TripView>>;
  updatedAt: Scalars['DateTime']['output'];
  warnings: Array<Scalars['String']['output']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PaymentConnection = {
  __typename?: 'PaymentConnection';
  nodes: Array<PaymentView>;
  pageInfo: PageInfo;
  totalAmount: Scalars['Money']['output'];
  totalCount: Scalars['Int']['output'];
};

export type PaymentFilter = {
  customerId?: InputMaybe<Scalars['ID']['input']>;
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  driverId?: InputMaybe<Scalars['ID']['input']>;
  hasUnallocated?: InputMaybe<Scalars['Boolean']['input']>;
  method?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type PaymentInInput = {
  allocations?: InputMaybe<Array<AllocationLineInput>>;
  amount: Scalars['Money']['input'];
  attachmentIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  bankAccount?: InputMaybe<Scalars['String']['input']>;
  clientRequestId?: InputMaybe<Scalars['String']['input']>;
  codStopIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  customerId?: InputMaybe<Scalars['ID']['input']>;
  driverId?: InputMaybe<Scalars['ID']['input']>;
  method: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  payerName?: InputMaybe<Scalars['String']['input']>;
  receivedAt: Scalars['DateTime']['input'];
  receivedBy?: InputMaybe<Scalars['String']['input']>;
  transferNote?: InputMaybe<Scalars['String']['input']>;
  tripId?: InputMaybe<Scalars['ID']['input']>;
  type: Scalars['String']['input'];
};

export type PaymentView = {
  __typename?: 'PaymentView';
  allocatedAmount: Scalars['Money']['output'];
  allocations: Array<AllocationView>;
  amount: Scalars['Money']['output'];
  attachmentCount: Scalars['Int']['output'];
  bankAccount?: Maybe<Scalars['String']['output']>;
  cancelReason?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['DateTime']['output']>;
  codItems: Array<CodRemittanceItemView>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  customer?: Maybe<RefView>;
  customerCreditBalance?: Maybe<Scalars['Money']['output']>;
  driver?: Maybe<RefView>;
  id: Scalars['ID']['output'];
  method: Scalars['String']['output'];
  notRevenue: Scalars['Boolean']['output'];
  note?: Maybe<Scalars['String']['output']>;
  payerLabel: Scalars['String']['output'];
  payerName?: Maybe<Scalars['String']['output']>;
  receivedAt: Scalars['DateTime']['output'];
  receivedBy?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  transferNote?: Maybe<Scalars['String']['output']>;
  trip?: Maybe<RefView>;
  type: Scalars['String']['output'];
  typeLabel: Scalars['String']['output'];
  unallocatedAmount: Scalars['Money']['output'];
};

export type PayrollChangeView = {
  __typename?: 'PayrollChangeView';
  amount?: Maybe<Scalars['Money']['output']>;
  driverName?: Maybe<Scalars['String']['output']>;
  kind: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type PayrollConnection = {
  __typename?: 'PayrollConnection';
  nodes: Array<PayrollView>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PayrollExcludedView = {
  __typename?: 'PayrollExcludedView';
  amount: Scalars['Money']['output'];
  code: Scalars['String']['output'];
  date?: Maybe<Scalars['DateTime']['output']>;
  description: Scalars['String']['output'];
  kind: Scalars['String']['output'];
  reason: Scalars['String']['output'];
};

export type PayrollFilter = {
  driverId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<Array<Scalars['String']['input']>>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type PayrollItemInput = {
  amount: Scalars['Money']['input'];
  description: Scalars['String']['input'];
  lineId: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  reasonId?: InputMaybe<Scalars['ID']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type PayrollItemView = {
  __typename?: 'PayrollItemView';
  amount: Scalars['Money']['output'];
  createdByName?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  expenseId?: Maybe<Scalars['ID']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  itemDate?: Maybe<Scalars['DateTime']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  reasonId?: Maybe<Scalars['ID']['output']>;
  reasonName?: Maybe<Scalars['String']['output']>;
  sourceRef?: Maybe<Scalars['String']['output']>;
  tripId?: Maybe<Scalars['ID']['output']>;
  type: Scalars['String']['output'];
};

export type PayrollLineView = {
  __typename?: 'PayrollLineView';
  adjustmentTotal: Scalars['Money']['output'];
  advanceTotal: Scalars['Money']['output'];
  anomalies: Array<Scalars['String']['output']>;
  baseSalary: Scalars['Money']['output'];
  bonusTotal: Scalars['Money']['output'];
  deductionTotal: Scalars['Money']['output'];
  driverCode?: Maybe<Scalars['String']['output']>;
  driverId: Scalars['ID']['output'];
  driverName: Scalars['String']['output'];
  excluded?: Maybe<Array<PayrollExcludedView>>;
  id?: Maybe<Scalars['ID']['output']>;
  items: Array<PayrollItemView>;
  netAmount: Scalars['Money']['output'];
  note?: Maybe<Scalars['String']['output']>;
  payrollCode?: Maybe<Scalars['String']['output']>;
  payrollId: Scalars['ID']['output'];
  payrollStatus?: Maybe<Scalars['String']['output']>;
  periodLabel?: Maybe<Scalars['String']['output']>;
  salaryEffectiveFrom?: Maybe<Scalars['DateTime']['output']>;
};

export type PayrollPreviewView = {
  __typename?: 'PayrollPreviewView';
  conflictPayrollCode?: Maybe<Scalars['String']['output']>;
  lines: Array<PayrollLineView>;
  periodFrom: Scalars['String']['output'];
  periodLabel: Scalars['String']['output'];
  periodTo: Scalars['String']['output'];
  totals: PayrollTotalsView;
  warnings: Array<Scalars['String']['output']>;
};

export type PayrollReportDriverRow = {
  __typename?: 'PayrollReportDriverRow';
  adjustment: Scalars['Money']['output'];
  advance: Scalars['Money']['output'];
  bonus: Scalars['Money']['output'];
  deduction: Scalars['Money']['output'];
  driverId: Scalars['ID']['output'];
  driverName: Scalars['String']['output'];
  net: Scalars['Money']['output'];
  salary: Scalars['Money']['output'];
};

export type PayrollReportRow = {
  __typename?: 'PayrollReportRow';
  adjustment: Scalars['Money']['output'];
  advance: Scalars['Money']['output'];
  bonus: Scalars['Money']['output'];
  byDriver: Array<PayrollReportDriverRow>;
  deduction: Scalars['Money']['output'];
  driverCount: Scalars['Int']['output'];
  net: Scalars['Money']['output'];
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  payrollCode: Scalars['String']['output'];
  payrollId: Scalars['ID']['output'];
  period: Scalars['String']['output'];
  salary: Scalars['Money']['output'];
  status: Scalars['String']['output'];
};

export type PayrollTotalsView = {
  __typename?: 'PayrollTotalsView';
  adjustment: Scalars['Money']['output'];
  advance: Scalars['Money']['output'];
  bonus: Scalars['Money']['output'];
  deduction: Scalars['Money']['output'];
  driverCount: Scalars['Int']['output'];
  net: Scalars['Money']['output'];
  salary: Scalars['Money']['output'];
};

export type PayrollView = {
  __typename?: 'PayrollView';
  anomalyCount: Scalars['Int']['output'];
  approvalNote?: Maybe<Scalars['String']['output']>;
  approvedAt?: Maybe<Scalars['DateTime']['output']>;
  approvedByName?: Maybe<Scalars['String']['output']>;
  cancelReason?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['DateTime']['output']>;
  changes?: Maybe<Array<PayrollChangeView>>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdByName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lines?: Maybe<Array<PayrollLineView>>;
  note?: Maybe<Scalars['String']['output']>;
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  paidByName?: Maybe<Scalars['String']['output']>;
  periodFrom: Scalars['DateTime']['output'];
  periodLabel: Scalars['String']['output'];
  periodTo: Scalars['DateTime']['output'];
  previousCode?: Maybe<Scalars['String']['output']>;
  previousTotals?: Maybe<PayrollTotalsView>;
  returnReason?: Maybe<Scalars['String']['output']>;
  returnedAt?: Maybe<Scalars['DateTime']['output']>;
  status: Scalars['String']['output'];
  submittedAt?: Maybe<Scalars['DateTime']['output']>;
  submittedByName?: Maybe<Scalars['String']['output']>;
  totals: PayrollTotalsView;
};

export type PermissionMatrixRow = {
  __typename?: 'PermissionMatrixRow';
  accountant: Scalars['String']['output'];
  action: Scalars['String']['output'];
  admin: Scalars['String']['output'];
  grantedUserCount: Scalars['Int']['output'];
  group: Scalars['String']['output'];
  groupLabel: Scalars['String']['output'];
  label: Scalars['String']['output'];
  operation: Scalars['String']['output'];
  requiresReason: Scalars['Boolean']['output'];
};

export type PricingLine = {
  __typename?: 'PricingLine';
  amount: Scalars['Money']['output'];
  label: Scalars['String']['output'];
};

export type ProfitReport = {
  __typename?: 'ProfitReport';
  dateFrom: Scalars['String']['output'];
  dateTo: Scalars['String']['output'];
  groupBy: Scalars['String']['output'];
  notes: Array<Scalars['String']['output']>;
  rows: Array<ProfitRow>;
  totals: ProfitRow;
};

export type ProfitRow = {
  __typename?: 'ProfitRow';
  addons: Scalars['Money']['output'];
  cost: Scalars['Money']['output'];
  entityId?: Maybe<Scalars['ID']['output']>;
  freight: Scalars['Money']['output'];
  isProvisional: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  margin?: Maybe<Scalars['Float']['output']>;
  orderCount: Scalars['Int']['output'];
  otherCost: Scalars['Money']['output'];
  outsourcedCost: Scalars['Money']['output'];
  profit: Scalars['Money']['output'];
  revenue: Scalars['Money']['output'];
  status?: Maybe<Scalars['String']['output']>;
  sublabel?: Maybe<Scalars['String']['output']>;
  tripCost: Scalars['Money']['output'];
};

export type PublicMerchantConnection = {
  __typename?: 'PublicMerchantConnection';
  nodes: Array<PublicMerchantView>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PublicMerchantFilter = {
  area?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  service?: InputMaybe<Scalars['String']['input']>;
  vehicleType?: InputMaybe<Scalars['String']['input']>;
};

export type PublicMerchantView = {
  __typename?: 'PublicMerchantView';
  address?: Maybe<Scalars['String']['output']>;
  dispatchHotline?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  hasRelationship: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  intro?: Maybe<Scalars['String']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  myOrderCount: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  province?: Maybe<Scalars['String']['output']>;
  serviceAreas: Array<Scalars['String']['output']>;
  services: Array<Scalars['String']['output']>;
  vehicleCount: Scalars['Int']['output'];
  vehicleTypes: Array<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  activityByActor: Array<TimelineEntry>;
  activityTimeline: Array<TimelineEntry>;
  attachment: AttachmentView;
  attachments: Array<AttachmentView>;
  booking: BookingView;
  bookings: BookingConnection;
  catalogItems: Array<CatalogItemView>;
  checkTripOverlap: Array<ScheduleWarningView>;
  customer: CustomerView;
  customerCreditCheck: CreditLimitCheckView;
  customerDebt: CustomerDebtResult;
  customerLocations: Array<CustomerLocationView>;
  customerMe: CustomerMe;
  customers: CustomerConnection;
  dashboardSummary: DashboardSummary;
  debtStatement: DebtStatementView;
  debtStatements: DebtStatementConnection;
  dispatchSummary: DispatchSummary;
  driver: DriverView;
  driverCodHeld: DriverCodHeldReport;
  driverJobCalendar: Array<DriverCalendarDay>;
  driverJobs: Array<DriverTripView>;
  driverLedger: DriverLedgerView;
  driverMe: DriverMeView;
  driverOptions: Array<DriverOption>;
  driverPayrollLines: Array<PayrollLineView>;
  driverSalaryHistory: Array<DriverSalaryHistoryView>;
  driverSchedules: Array<ScheduleRow>;
  driverStop: DriverStopView;
  driverTrip: DriverTripView;
  drivers: DriverConnection;
  expense: ExpenseView;
  expenses: ExpenseConnection;
  externalTransports: Array<ExternalTransportView>;
  financeLedger: FinanceLedgerConnection;
  globalSearch: Array<GlobalSearchResult>;
  importPreview: ImportJobView;
  importTemplate: ImportTemplateFile;
  incident: IncidentView;
  incidents: IncidentConnection;
  lastKnownLocations: Array<LastKnownLocationView>;
  me: Me;
  merchantProfile: MerchantProfile;
  merchantSettings: MerchantSettingsView;
  merchantUser: MerchantUserView;
  merchantUsers: MerchantUserConnection;
  myAddresses: Array<CustomerAddressView>;
  myBooking: BookingView;
  myBookings: BookingConnection;
  myDebtStatement: MyStatementView;
  myDebtStatements: Array<MyStatementView>;
  myDebtSummary: MyDebtSummary;
  myOrder: MyOrderView;
  myOrders: MyOrderConnection;
  navBadges: NavBadges;
  notifications: NotificationConnection;
  numberSequences: Array<NumberSequenceView>;
  order: OrderView;
  orderAttachments: Array<AttachmentView>;
  orderFinance: OrderFinanceView;
  orderStop: OrderStopView;
  orderTotals: OrderTotalsView;
  orders: OrderConnection;
  payment: PaymentView;
  payments: PaymentConnection;
  payroll: PayrollView;
  payrollLine: PayrollLineView;
  payrollPreview: PayrollPreviewView;
  payrolls: PayrollConnection;
  permissionMatrix: Array<PermissionMatrixRow>;
  publicMerchant: PublicMerchantView;
  publicMerchants: PublicMerchantConnection;
  reportCodHeld: CodHeldReport;
  reportCustomerDebt: CustomerDebtReport;
  reportDrivers: Array<DriverReportRow>;
  reportPayroll: Array<PayrollReportRow>;
  reportProfit: ProfitReport;
  reportSummary: Array<ReportSummaryItem>;
  reportVehicles: Array<VehicleReportRow>;
  roles: Array<RoleView>;
  scheduleWarnings: ScheduleWarningConnection;
  staffOptions: Array<MerchantUserView>;
  supplier: SupplierView;
  supplierDebt: SupplierDebtReport;
  supplierOptions: Array<SupplierOption>;
  suppliers: SupplierConnection;
  trip: TripView;
  tripAdvances: Array<TripAdvanceView>;
  tripLocations: Array<TripLocationPoint>;
  trips: TripConnection;
  unreadNotificationCount: Scalars['Int']['output'];
  vehicle: VehicleView;
  vehicleOptions: Array<VehicleOption>;
  vehicleSchedules: Array<ScheduleRow>;
  vehicles: VehicleConnection;
};


export type QueryActivityByActorArgs = {
  actorId: Scalars['ID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryActivityTimelineArgs = {
  entity: EntityRefInput;
  filter?: InputMaybe<TimelineFilter>;
};


export type QueryAttachmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAttachmentsArgs = {
  category?: InputMaybe<AttachmentCategory>;
  entityId: Scalars['ID']['input'];
  entityType: EntityType;
};


export type QueryBookingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBookingsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<BookingFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCatalogItemsArgs = {
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<CatalogType>;
};


export type QueryCheckTripOverlapArgs = {
  input: CheckTripOverlapInput;
};


export type QueryCustomerArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCustomerCreditCheckArgs = {
  additionalAmount?: InputMaybe<Scalars['Money']['input']>;
  customerId: Scalars['ID']['input'];
};


export type QueryCustomerDebtArgs = {
  filter?: InputMaybe<CustomerDebtFilter>;
};


export type QueryCustomerLocationsArgs = {
  customerId: Scalars['ID']['input'];
  includeInactive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryCustomersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<CustomerFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDashboardSummaryArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDebtStatementArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDebtStatementsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<DebtStatementFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDispatchSummaryArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDriverArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDriverCodHeldArgs = {
  filter?: InputMaybe<DriverCodHeldFilter>;
};


export type QueryDriverJobCalendarArgs = {
  from: Scalars['String']['input'];
  to: Scalars['String']['input'];
};


export type QueryDriverJobsArgs = {
  filter?: InputMaybe<DriverJobsFilter>;
};


export type QueryDriverLedgerArgs = {
  driverId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryDriverOptionsArgs = {
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryDriverPayrollLinesArgs = {
  driverId: Scalars['ID']['input'];
};


export type QueryDriverSalaryHistoryArgs = {
  driverId: Scalars['ID']['input'];
};


export type QueryDriverSchedulesArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
  days?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDriverStopArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDriverTripArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDriversArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<DriverFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryExpenseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExpensesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ExpenseFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryExternalTransportsArgs = {
  orderId?: InputMaybe<Scalars['ID']['input']>;
  supplierId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryFinanceLedgerArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<FinanceLedgerFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGlobalSearchArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  types?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryImportPreviewArgs = {
  filter?: InputMaybe<ImportPreviewFilter>;
  id: Scalars['ID']['input'];
};


export type QueryImportTemplateArgs = {
  entityType: Scalars['String']['input'];
};


export type QueryIncidentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryIncidentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<IncidentFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryLastKnownLocationsArgs = {
  running?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryMerchantUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMerchantUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<MerchantUserFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyBookingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMyBookingsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<BookingFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyDebtStatementArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMyOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMyOrdersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<MyOrderFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryNotificationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<NotificationFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrderAttachmentsArgs = {
  orderId: Scalars['ID']['input'];
};


export type QueryOrderFinanceArgs = {
  orderId: Scalars['ID']['input'];
};


export type QueryOrderStopArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrderTotalsArgs = {
  filter?: InputMaybe<OrderFilter>;
};


export type QueryOrdersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<OrderFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPaymentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPaymentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<PaymentFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPayrollArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPayrollLineArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPayrollPreviewArgs = {
  input: GeneratePayrollInput;
};


export type QueryPayrollsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<PayrollFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPublicMerchantArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPublicMerchantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<PublicMerchantFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryReportCodHeldArgs = {
  filter?: InputMaybe<ReportFilter>;
};


export type QueryReportCustomerDebtArgs = {
  filter?: InputMaybe<ReportFilter>;
};


export type QueryReportDriversArgs = {
  filter?: InputMaybe<ReportFilter>;
};


export type QueryReportPayrollArgs = {
  filter?: InputMaybe<ReportFilter>;
};


export type QueryReportProfitArgs = {
  filter?: InputMaybe<ReportFilter>;
};


export type QueryReportSummaryArgs = {
  filter?: InputMaybe<ReportFilter>;
};


export type QueryReportVehiclesArgs = {
  filter?: InputMaybe<ReportFilter>;
};


export type QueryScheduleWarningsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<ScheduleWarningFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySupplierArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySupplierDebtArgs = {
  filter?: InputMaybe<SupplierDebtFilter>;
};


export type QuerySupplierOptionsArgs = {
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QuerySuppliersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<SupplierFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTripArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTripAdvancesArgs = {
  filter?: InputMaybe<TripAdvanceFilter>;
};


export type QueryTripLocationsArgs = {
  from?: InputMaybe<Scalars['DateTime']['input']>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
  tripId: Scalars['ID']['input'];
};


export type QueryTripsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<TripFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryVehicleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVehicleOptionsArgs = {
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryVehicleSchedulesArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
  days?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryVehiclesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<VehicleFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};

export type QuickTripInput = {
  driverBonusAmount?: InputMaybe<Scalars['Money']['input']>;
  driverId?: InputMaybe<Scalars['ID']['input']>;
  overrideReason?: InputMaybe<Scalars['String']['input']>;
  plannedEndAt?: InputMaybe<Scalars['DateTime']['input']>;
  plannedStartAt: Scalars['DateTime']['input'];
  vehicleId?: InputMaybe<Scalars['ID']['input']>;
};

export type ReconcileTripAdvanceInput = {
  amount?: InputMaybe<Scalars['Money']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  resolution: Scalars['String']['input'];
  tripId: Scalars['ID']['input'];
};

export type RefView = {
  __typename?: 'RefView';
  code?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type RenderDocumentInput = {
  entityId: Scalars['ID']['input'];
  format?: InputMaybe<Scalars['String']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  template: Scalars['String']['input'];
  to?: InputMaybe<Scalars['String']['input']>;
};

export type RenderedDocument = {
  __typename?: 'RenderedDocument';
  attachmentId?: Maybe<Scalars['ID']['output']>;
  fileName: Scalars['String']['output'];
  html?: Maybe<Scalars['String']['output']>;
  template: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type ReportFilter = {
  customerId?: InputMaybe<Scalars['ID']['input']>;
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  driverId?: InputMaybe<Scalars['ID']['input']>;
  groupBy?: InputMaybe<Scalars['String']['input']>;
  overdueOnly?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<Array<Scalars['String']['input']>>;
  vehicleId?: InputMaybe<Scalars['ID']['input']>;
  vehicleTypeId?: InputMaybe<Scalars['ID']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type ReportSummaryItem = {
  __typename?: 'ReportSummaryItem';
  group: Scalars['String']['output'];
  headline: Scalars['String']['output'];
  key: Scalars['String']['output'];
  route: Scalars['String']['output'];
  title: Scalars['String']['output'];
  value?: Maybe<Scalars['Money']['output']>;
};

export type RoleView = {
  __typename?: 'RoleView';
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  userCount: Scalars['Int']['output'];
};

export type SalaryHistoryInput = {
  amount: Scalars['Money']['input'];
  effectiveFrom: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};

export type ScheduleBlock = {
  __typename?: 'ScheduleBlock';
  code: Scalars['String']['output'];
  counterpartLabel?: Maybe<Scalars['String']['output']>;
  end: Scalars['DateTime']['output'];
  orderCode?: Maybe<Scalars['String']['output']>;
  routeSummary?: Maybe<Scalars['String']['output']>;
  start: Scalars['DateTime']['output'];
  status: Scalars['String']['output'];
  tripId: Scalars['ID']['output'];
  warning: Scalars['Boolean']['output'];
};

export type ScheduleResource = {
  __typename?: 'ScheduleResource';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  status: Scalars['String']['output'];
  sublabel?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type ScheduleRow = {
  __typename?: 'ScheduleRow';
  blocks: Array<ScheduleBlock>;
  resource: ScheduleResource;
};

export type ScheduleWarningConnection = {
  __typename?: 'ScheduleWarningConnection';
  nodes: Array<ScheduleWarningRecord>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ScheduleWarningFilter = {
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  resolved?: InputMaybe<Scalars['Boolean']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  tripId?: InputMaybe<Scalars['ID']['input']>;
};

export type ScheduleWarningRecord = {
  __typename?: 'ScheduleWarningRecord';
  conflictTrip?: Maybe<TripBrief>;
  createdAt: Scalars['DateTime']['output'];
  gapMinutes: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  overriddenByName?: Maybe<Scalars['String']['output']>;
  overrideReason?: Maybe<Scalars['String']['output']>;
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  status: Scalars['String']['output'];
  subject: Scalars['String']['output'];
  subjectId: Scalars['ID']['output'];
  subjectLabel?: Maybe<Scalars['String']['output']>;
  thresholdMinutes: Scalars['Int']['output'];
  trip: TripBrief;
  type: Scalars['String']['output'];
};

export type ScheduleWarningView = {
  __typename?: 'ScheduleWarningView';
  conflictTripCode?: Maybe<Scalars['String']['output']>;
  conflictTripId?: Maybe<Scalars['ID']['output']>;
  gapMinutes: Scalars['Int']['output'];
  id?: Maybe<Scalars['ID']['output']>;
  overrideReason?: Maybe<Scalars['String']['output']>;
  subject: Scalars['String']['output'];
  subjectId: Scalars['String']['output'];
  subjectLabel?: Maybe<Scalars['String']['output']>;
  thresholdMinutes: Scalars['Int']['output'];
  type: Scalars['String']['output'];
};

export type SharedAttachmentView = {
  __typename?: 'SharedAttachmentView';
  category: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  fileName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type StaffAppCredentials = {
  __typename?: 'StaffAppCredentials';
  phone: Scalars['String']['output'];
  tempPassword: Scalars['String']['output'];
};

export type StaffAppLoginView = {
  __typename?: 'StaffAppLoginView';
  hasPassword: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  mustChangePassword: Scalars['Boolean']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  sharedWithOtherMerchants: Scalars['Boolean']['output'];
};

export type StartImportInput = {
  entityType: Scalars['String']['input'];
  fileBase64: Scalars['String']['input'];
  fileName: Scalars['String']['input'];
  mapping?: InputMaybe<Scalars['JSON']['input']>;
};

export type StatusCount = {
  __typename?: 'StatusCount';
  count: Scalars['Int']['output'];
  status: Scalars['String']['output'];
};

export type SupplierAgingView = {
  __typename?: 'SupplierAgingView';
  d0_15: Scalars['Money']['output'];
  d16_30: Scalars['Money']['output'];
  d31_60: Scalars['Money']['output'];
  d60p: Scalars['Money']['output'];
};

export type SupplierConnection = {
  __typename?: 'SupplierConnection';
  nodes: Array<SupplierView>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type SupplierDebtAgingView = {
  __typename?: 'SupplierDebtAgingView';
  d0_15: Scalars['Money']['output'];
  d16_30: Scalars['Money']['output'];
  d31_60: Scalars['Money']['output'];
  d60p: Scalars['Money']['output'];
};

export type SupplierDebtFilter = {
  asOf?: InputMaybe<Scalars['String']['input']>;
  supplierId?: InputMaybe<Scalars['ID']['input']>;
};

export type SupplierDebtReport = {
  __typename?: 'SupplierDebtReport';
  rows: Array<SupplierDebtRow>;
  total: Scalars['Money']['output'];
};

export type SupplierDebtRow = {
  __typename?: 'SupplierDebtRow';
  aging: SupplierDebtAgingView;
  expenses: Array<ExpenseView>;
  oldestDays: Scalars['Int']['output'];
  supplier: RefView;
  unpaidCount: Scalars['Int']['output'];
  unpaidTotal: Scalars['Money']['output'];
};

export type SupplierExternalTransportView = {
  __typename?: 'SupplierExternalTransportView';
  agreedAmount?: Maybe<Scalars['Money']['output']>;
  createdAt: Scalars['DateTime']['output'];
  driverName?: Maybe<Scalars['String']['output']>;
  driverPhone?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  note?: Maybe<Scalars['String']['output']>;
  orderCode?: Maybe<Scalars['String']['output']>;
  orderId: Scalars['ID']['output'];
  tripCode?: Maybe<Scalars['String']['output']>;
  tripId?: Maybe<Scalars['ID']['output']>;
  vehiclePlate?: Maybe<Scalars['String']['output']>;
};

export type SupplierFilter = {
  hasDebt?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  typeId?: InputMaybe<Scalars['ID']['input']>;
};

export type SupplierInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  bankAccountNo?: InputMaybe<Scalars['String']['input']>;
  bankName?: InputMaybe<Scalars['String']['input']>;
  contacts?: InputMaybe<Array<ContactInput>>;
  name: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  paymentTerms?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  taxCode?: InputMaybe<Scalars['String']['input']>;
  typeId?: InputMaybe<Scalars['ID']['input']>;
};

export type SupplierOption = {
  __typename?: 'SupplierOption';
  code: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: Scalars['String']['output'];
  typeName?: Maybe<Scalars['String']['output']>;
};

export type SupplierPayableView = {
  __typename?: 'SupplierPayableView';
  aging: SupplierAgingView;
  oldestDays: Scalars['Int']['output'];
  total: Scalars['Money']['output'];
  unpaidCount: Scalars['Int']['output'];
};

export type SupplierView = {
  __typename?: 'SupplierView';
  address?: Maybe<Scalars['String']['output']>;
  bankAccountNo?: Maybe<Scalars['String']['output']>;
  bankName?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  contacts: Array<ContactView>;
  createdAt: Scalars['DateTime']['output'];
  deactivateReason?: Maybe<Scalars['String']['output']>;
  expenseCount: Scalars['Int']['output'];
  externalTransports?: Maybe<Array<SupplierExternalTransportView>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  payable?: Maybe<SupplierPayableView>;
  payableAmount: Scalars['Money']['output'];
  paymentTerms?: Maybe<Scalars['String']['output']>;
  recentExpenses?: Maybe<Array<MasterExpenseItem>>;
  status: Scalars['String']['output'];
  taxCode?: Maybe<Scalars['String']['output']>;
  type?: Maybe<MasterRef>;
  typeId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type TimelineEntry = {
  __typename?: 'TimelineEntry';
  action: Scalars['String']['output'];
  actorId?: Maybe<Scalars['String']['output']>;
  actorName?: Maybe<Scalars['String']['output']>;
  actorType: Scalars['String']['output'];
  after?: Maybe<Scalars['JSON']['output']>;
  before?: Maybe<Scalars['JSON']['output']>;
  category: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  entityId: Scalars['ID']['output'];
  entityType: Scalars['String']['output'];
  fromStatus?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  kind: Scalars['String']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  sensitive: Scalars['Boolean']['output'];
  summary: Scalars['String']['output'];
  toStatus?: Maybe<Scalars['String']['output']>;
};

export type TimelineFilter = {
  categories?: InputMaybe<Array<Scalars['String']['input']>>;
  includeChildren?: InputMaybe<Scalars['Boolean']['input']>;
};

export type TripAdvanceFilter = {
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  driverId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tripId?: InputMaybe<Scalars['ID']['input']>;
};

export type TripAdvanceView = {
  __typename?: 'TripAdvanceView';
  actualCost: Scalars['Money']['output'];
  advanceAmount: Scalars['Money']['output'];
  advances: Array<ExpenseView>;
  difference: Scalars['Money']['output'];
  driver?: Maybe<RefView>;
  note?: Maybe<Scalars['String']['output']>;
  orderCode: Scalars['String']['output'];
  orderId: Scalars['ID']['output'];
  plannedStartAt: Scalars['DateTime']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  reimbursed: Scalars['Money']['output'];
  resolution?: Maybe<Scalars['String']['output']>;
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  returned: Scalars['Money']['output'];
  spentFromAdvance: Scalars['Money']['output'];
  status: Scalars['String']['output'];
  tripCode: Scalars['String']['output'];
  tripId: Scalars['ID']['output'];
  tripStatus: Scalars['String']['output'];
};

export type TripBonusView = {
  __typename?: 'TripBonusView';
  amount: Scalars['Money']['output'];
  date: Scalars['DateTime']['output'];
  orderCode: Scalars['String']['output'];
  status: Scalars['String']['output'];
  tripCode: Scalars['String']['output'];
  tripId: Scalars['ID']['output'];
};

export type TripBrief = {
  __typename?: 'TripBrief';
  code: Scalars['String']['output'];
  driverName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  orderCode?: Maybe<Scalars['String']['output']>;
  plannedEndAt?: Maybe<Scalars['DateTime']['output']>;
  plannedStartAt: Scalars['DateTime']['output'];
  status: Scalars['String']['output'];
  vehiclePlate?: Maybe<Scalars['String']['output']>;
};

export type TripConnection = {
  __typename?: 'TripConnection';
  nodes: Array<TripView>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type TripExpenseView = {
  __typename?: 'TripExpenseView';
  amount: Scalars['Money']['output'];
  categoryName?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  expenseDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  kind: Scalars['String']['output'];
  paidBy: Scalars['String']['output'];
  paidStatus: Scalars['String']['output'];
  reimbursable: Scalars['Boolean']['output'];
  status: Scalars['String']['output'];
  tripCode?: Maybe<Scalars['String']['output']>;
};

export type TripFilter = {
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  driverId?: InputMaybe<Scalars['ID']['input']>;
  hasWarning?: InputMaybe<Scalars['Boolean']['input']>;
  orderId?: InputMaybe<Scalars['ID']['input']>;
  running?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Array<Scalars['String']['input']>>;
  vehicleId?: InputMaybe<Scalars['ID']['input']>;
};

export type TripIncidentRef = {
  __typename?: 'TripIncidentRef';
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  severity: Scalars['String']['output'];
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type TripInput = {
  driverBonusAmount?: InputMaybe<Scalars['Money']['input']>;
  driverId?: InputMaybe<Scalars['ID']['input']>;
  externalTransport?: InputMaybe<ExternalTransportInput>;
  isExternal?: InputMaybe<Scalars['Boolean']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['ID']['input'];
  overrideReason?: InputMaybe<Scalars['String']['input']>;
  plannedEndAt?: InputMaybe<Scalars['DateTime']['input']>;
  plannedStartAt: Scalars['DateTime']['input'];
  stopIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  vehicleId?: InputMaybe<Scalars['ID']['input']>;
};

export type TripLocationPoint = {
  __typename?: 'TripLocationPoint';
  accuracy?: Maybe<Scalars['Float']['output']>;
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
  recordedAt: Scalars['DateTime']['output'];
  speed?: Maybe<Scalars['Float']['output']>;
};

export type TripOrderRef = {
  __typename?: 'TripOrderRef';
  code: Scalars['String']['output'];
  customerId: Scalars['ID']['output'];
  customerName: Scalars['String']['output'];
  customerPhone?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  status: Scalars['String']['output'];
};

export type TripPayload = {
  __typename?: 'TripPayload';
  notices: Array<Scalars['String']['output']>;
  trip: TripView;
  warnings: Array<ScheduleWarningView>;
};

export type TripStatusChangeInput = {
  actualAt?: InputMaybe<Scalars['DateTime']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  pauseReasonId?: InputMaybe<Scalars['ID']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  status: Scalars['String']['input'];
};

export type TripStatusCount = {
  __typename?: 'TripStatusCount';
  count: Scalars['Int']['output'];
  status: Scalars['String']['output'];
};

export type TripStopView = {
  __typename?: 'TripStopView';
  address: Scalars['String']['output'];
  arrivedAt?: Maybe<Scalars['DateTime']['output']>;
  codActual?: Maybe<Scalars['Money']['output']>;
  codCollectedAt?: Maybe<Scalars['DateTime']['output']>;
  codExpected?: Maybe<Scalars['Money']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  contactName?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
  locationName?: Maybe<Scalars['String']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  orderId: Scalars['ID']['output'];
  plannedAt?: Maybe<Scalars['DateTime']['output']>;
  podCount: Scalars['Int']['output'];
  sequence: Scalars['Int']['output'];
  skipReason?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tripSequence: Scalars['Int']['output'];
  type: Scalars['String']['output'];
};

export type TripView = {
  __typename?: 'TripView';
  actualEndAt?: Maybe<Scalars['DateTime']['output']>;
  actualStartAt?: Maybe<Scalars['DateTime']['output']>;
  advances?: Maybe<Array<TripExpenseView>>;
  allowedNextStatuses: Array<Scalars['String']['output']>;
  attachmentCount?: Maybe<Scalars['Int']['output']>;
  cancelReason?: Maybe<Scalars['String']['output']>;
  codActualTotal: Scalars['Money']['output'];
  codExpectedTotal: Scalars['Money']['output'];
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  driver?: Maybe<DriverRef>;
  driverBonusAmount: Scalars['Money']['output'];
  expenses?: Maybe<Array<TripExpenseView>>;
  externalTransport?: Maybe<ExternalTransportView>;
  hasWarning: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  incidents?: Maybe<Array<TripIncidentRef>>;
  isExternal: Scalars['Boolean']['output'];
  lastLocation?: Maybe<LastLocationView>;
  note?: Maybe<Scalars['String']['output']>;
  openIncidentCount: Scalars['Int']['output'];
  order: TripOrderRef;
  orderId: Scalars['ID']['output'];
  pauseNote?: Maybe<Scalars['String']['output']>;
  pauseReasonLabel?: Maybe<Scalars['String']['output']>;
  pausedAt?: Maybe<Scalars['DateTime']['output']>;
  pausedReasonId?: Maybe<Scalars['ID']['output']>;
  plannedEndAt?: Maybe<Scalars['DateTime']['output']>;
  plannedStartAt: Scalars['DateTime']['output'];
  previousStatusBeforePause?: Maybe<Scalars['String']['output']>;
  resumedAt?: Maybe<Scalars['DateTime']['output']>;
  routeSummary?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  stopCount: Scalars['Int']['output'];
  stops?: Maybe<Array<TripStopView>>;
  vehicle?: Maybe<VehicleRef>;
  warnings?: Maybe<Array<ScheduleWarningView>>;
};

export type UpdateMerchantUserInput = {
  extraPermissions?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrderInput = {
  addons?: InputMaybe<Array<OrderAddonInput>>;
  cargoLines?: InputMaybe<Array<CargoLineInput>>;
  customerId?: InputMaybe<Scalars['ID']['input']>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  freightAmount?: InputMaybe<Scalars['Money']['input']>;
  internalNote?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  orderDate?: InputMaybe<Scalars['String']['input']>;
  requiredCapacityTons?: InputMaybe<Scalars['Float']['input']>;
  requiredVehicleTypeId?: InputMaybe<Scalars['ID']['input']>;
  stops?: InputMaybe<Array<OrderStopInput>>;
};

export type UpdatePaymentInInput = {
  amount?: InputMaybe<Scalars['Money']['input']>;
  bankAccount?: InputMaybe<Scalars['String']['input']>;
  method?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  payerName?: InputMaybe<Scalars['String']['input']>;
  receivedAt?: InputMaybe<Scalars['DateTime']['input']>;
  receivedBy?: InputMaybe<Scalars['String']['input']>;
  transferNote?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTripInput = {
  driverBonusAmount?: InputMaybe<Scalars['Money']['input']>;
  driverId?: InputMaybe<Scalars['ID']['input']>;
  externalTransport?: InputMaybe<ExternalTransportInput>;
  isExternal?: InputMaybe<Scalars['Boolean']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  overrideReason?: InputMaybe<Scalars['String']['input']>;
  plannedEndAt?: InputMaybe<Scalars['DateTime']['input']>;
  plannedStartAt?: InputMaybe<Scalars['DateTime']['input']>;
  stopIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  vehicleId?: InputMaybe<Scalars['ID']['input']>;
};

export type VehicleConnection = {
  __typename?: 'VehicleConnection';
  nodes: Array<VehicleView>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type VehicleCurrentTrip = {
  __typename?: 'VehicleCurrentTrip';
  code: Scalars['String']['output'];
  driverName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  plannedStartAt: Scalars['DateTime']['output'];
  status: Scalars['String']['output'];
};

export type VehicleFilter = {
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  typeId?: InputMaybe<Scalars['ID']['input']>;
};

export type VehicleInput = {
  boxSize?: InputMaybe<Scalars['String']['input']>;
  brandModel?: InputMaybe<Scalars['String']['input']>;
  capacityTons?: InputMaybe<Scalars['Float']['input']>;
  chassisNo?: InputMaybe<Scalars['String']['input']>;
  engineNo?: InputMaybe<Scalars['String']['input']>;
  fuelNorm?: InputMaybe<Scalars['String']['input']>;
  insuranceExpiresAt?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  plate: Scalars['String']['input'];
  registrationExpiresAt?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  typeId?: InputMaybe<Scalars['ID']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type VehicleOption = {
  __typename?: 'VehicleOption';
  busy: Scalars['Boolean']['output'];
  busyTripCode?: Maybe<Scalars['String']['output']>;
  capacityTons?: Maybe<Scalars['Float']['output']>;
  code: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  plate: Scalars['String']['output'];
  status: Scalars['String']['output'];
  typeName?: Maybe<Scalars['String']['output']>;
};

export type VehicleRef = {
  __typename?: 'VehicleRef';
  capacityTons?: Maybe<Scalars['Float']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  plate: Scalars['String']['output'];
  status: Scalars['String']['output'];
  typeName?: Maybe<Scalars['String']['output']>;
};

export type VehicleReportRow = {
  __typename?: 'VehicleReportRow';
  activeDays: Scalars['Int']['output'];
  grossProfit: Scalars['Money']['output'];
  plate: Scalars['String']['output'];
  revenue: Scalars['Money']['output'];
  status: Scalars['String']['output'];
  tripCost: Scalars['Money']['output'];
  tripCount: Scalars['Int']['output'];
  type?: Maybe<Scalars['String']['output']>;
  utilization: Scalars['Float']['output'];
  vehicleCost: Scalars['Money']['output'];
  vehicleId: Scalars['ID']['output'];
};

export type VehicleStats = {
  __typename?: 'VehicleStats';
  cost30d: Scalars['Money']['output'];
  tripCount30d: Scalars['Int']['output'];
};

export type VehicleView = {
  __typename?: 'VehicleView';
  boxSize?: Maybe<Scalars['String']['output']>;
  brandModel?: Maybe<Scalars['String']['output']>;
  capacityTons?: Maybe<Scalars['Float']['output']>;
  chassisNo?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  currentTrip?: Maybe<VehicleCurrentTrip>;
  engineNo?: Maybe<Scalars['String']['output']>;
  expenses?: Maybe<Array<MasterExpenseItem>>;
  expiryWarnings: Array<Scalars['String']['output']>;
  fuelNorm?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  insuranceExpiresAt?: Maybe<Scalars['DateTime']['output']>;
  monthCost: Scalars['Money']['output'];
  note?: Maybe<Scalars['String']['output']>;
  plate: Scalars['String']['output'];
  registrationExpiresAt?: Maybe<Scalars['DateTime']['output']>;
  stats?: Maybe<VehicleStats>;
  status: Scalars['String']['output'];
  tripHistory?: Maybe<Array<MasterTripItem>>;
  type?: Maybe<MasterRef>;
  typeId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  year?: Maybe<Scalars['Int']['output']>;
};

export type CustomerMeQueryVariables = Exact<{ [key: string]: never; }>;


export type CustomerMeQuery = { __typename?: 'Query', customerMe: { __typename?: 'CustomerMe', account: { __typename?: 'CustomerAccountView', id: string, email?: string | null, phone: string, fullName: string, companyName?: string | null, taxCode?: string | null, billingAddress?: string | null, contactTitle?: string | null, notificationPrefs?: unknown | null }, merchantLinks: Array<{ __typename?: 'MerchantLinkView', merchantId: string, merchantName: string, customerCode: string, paymentTermDays?: number | null, orderCount: number }> } };

export type UpdateCustomerProfileMutationVariables = Exact<{
  input: CustomerProfileInput;
}>;


export type UpdateCustomerProfileMutation = { __typename?: 'Mutation', updateCustomerProfile: { __typename?: 'CustomerMe', account: { __typename?: 'CustomerAccountView', id: string, email?: string | null, phone: string, fullName: string, companyName?: string | null, taxCode?: string | null, billingAddress?: string | null, contactTitle?: string | null, notificationPrefs?: unknown | null }, merchantLinks: Array<{ __typename?: 'MerchantLinkView', merchantId: string, merchantName: string, customerCode: string, paymentTermDays?: number | null, orderCount: number }> } };

export type PublicMerchantsQueryVariables = Exact<{
  filter?: InputMaybe<PublicMerchantFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type PublicMerchantsQuery = { __typename?: 'Query', publicMerchants: { __typename?: 'PublicMerchantConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, endCursor?: string | null }, nodes: Array<{ __typename?: 'PublicMerchantView', id: string, name: string, intro?: string | null, serviceAreas: Array<string>, services: Array<string>, vehicleTypes: Array<string>, province?: string | null, hasRelationship: boolean, myOrderCount: number, vehicleCount: number, logoUrl?: string | null, dispatchHotline?: string | null }> } };

export type PublicMerchantQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type PublicMerchantQuery = { __typename?: 'Query', publicMerchant: { __typename?: 'PublicMerchantView', id: string, name: string, intro?: string | null, serviceAreas: Array<string>, services: Array<string>, vehicleTypes: Array<string>, phone?: string | null, dispatchHotline?: string | null, email?: string | null, address?: string | null, province?: string | null, logoUrl?: string | null, vehicleCount: number, hasRelationship: boolean, myOrderCount: number } };

export type MyAddressesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyAddressesQuery = { __typename?: 'Query', myAddresses: Array<{ __typename?: 'CustomerAddressView', id: string, name: string, address: string, usage: string, lat?: number | null, lng?: number | null, contactName?: string | null, contactPhone?: string | null, note?: string | null, isDefaultPickup: boolean }> };

export type CreateMyAddressMutationVariables = Exact<{
  input: CustomerAddressInput;
}>;


export type CreateMyAddressMutation = { __typename?: 'Mutation', createMyAddress: { __typename?: 'CustomerAddressView', id: string } };

export type UpdateMyAddressMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: CustomerAddressInput;
}>;


export type UpdateMyAddressMutation = { __typename?: 'Mutation', updateMyAddress: { __typename?: 'CustomerAddressView', id: string } };

export type DeleteMyAddressMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteMyAddressMutation = { __typename?: 'Mutation', deleteMyAddress: boolean };

export type MyBookingsQueryVariables = Exact<{
  filter?: InputMaybe<BookingFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type MyBookingsQuery = { __typename?: 'Query', myBookings: { __typename?: 'BookingConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, endCursor?: string | null }, nodes: Array<{ __typename?: 'BookingView', id: string, code: string, status: string, merchantId: string, merchantName: string, cargoName: string, weightTon?: number | null, packages?: number | null, pickupFrom?: string | null, createdAt: string, orderId?: string | null, orderCode?: string | null, stops: Array<{ __typename?: 'BookingStopView', type: string, address: string, locationName?: string | null }> }> } };

export type MyBookingQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MyBookingQuery = { __typename?: 'Query', myBooking: { __typename?: 'BookingView', id: string, code: string, status: string, merchantId: string, merchantName: string, cargoName: string, weightTon?: number | null, packages?: number | null, vehicleTypeHint?: string | null, fragile: boolean, loadingAtPickup: boolean, loadingAtDrop: boolean, pickupFrom?: string | null, deliverBefore?: string | null, flexibility?: string | null, note?: string | null, contactName: string, contactPhone: string, rejectReason?: string | null, cancelReason?: string | null, orderId?: string | null, orderCode?: string | null, createdAt: string, orderAdjustments?: unknown | null, stops: Array<{ __typename?: 'BookingStopView', type: string, address: string, locationName?: string | null, contactName?: string | null, contactPhone?: string | null, note?: string | null }>, notes: Array<{ __typename?: 'BookingNoteView', id: string, authorType: string, authorName?: string | null, body: string, createdAt: string }>, statusHistory: Array<{ __typename?: 'BookingStatusEntry', fromStatus?: string | null, toStatus: string, reason?: string | null, actorName?: string | null, changedAt: string }> } };

export type CreateBookingMutationVariables = Exact<{
  input: BookingInput;
}>;


export type CreateBookingMutation = { __typename?: 'Mutation', createBooking: { __typename?: 'BookingView', id: string, code: string, status: string } };

export type UpdateBookingMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: BookingInput;
}>;


export type UpdateBookingMutation = { __typename?: 'Mutation', updateBooking: { __typename?: 'BookingView', id: string, code: string, status: string } };

export type CancelBookingMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type CancelBookingMutation = { __typename?: 'Mutation', cancelBooking: { __typename?: 'BookingView', id: string, status: string, cancelReason?: string | null } };

export type AddBookingNoteMutationVariables = Exact<{
  bookingId: Scalars['ID']['input'];
  body: Scalars['String']['input'];
}>;


export type AddBookingNoteMutation = { __typename?: 'Mutation', addBookingNote: { __typename?: 'BookingView', id: string, notes: Array<{ __typename?: 'BookingNoteView', id: string, authorType: string, authorName?: string | null, body: string, createdAt: string }> } };

export type MyOrdersQueryVariables = Exact<{
  filter?: InputMaybe<MyOrderFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type MyOrdersQuery = { __typename?: 'Query', myOrders: { __typename?: 'MyOrderConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, endCursor?: string | null }, nodes: Array<{ __typename?: 'MyOrderView', id: string, code: string, status: string, orderDate: string, merchantName: string, merchantId: string, routeSummary?: string | null, bookingCode?: string | null, bookingId?: string | null, totalAmount: number, paidAmount: number, remainingAmount: number, dueDate?: string | null, overdueDays: number }> }, myDebtSummary: { __typename?: 'MyDebtSummary', total: number, paid: number, remaining: number, overdue: number, openOrders: number } };

export type MyOrderQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MyOrderQuery = { __typename?: 'Query', myOrder: { __typename?: 'MyOrderView', id: string, code: string, status: string, orderDate: string, merchantName: string, merchantId: string, routeSummary?: string | null, bookingCode?: string | null, bookingId?: string | null, totalAmount: number, paidAmount: number, remainingAmount: number, dueDate?: string | null, overdueDays: number, statementCode?: string | null, cargo?: Array<string> | null, stops?: Array<{ __typename?: 'MyOrderStopView', type: string, place?: string | null, address: string, contactName?: string | null, plannedAt?: string | null, actualAt?: string | null, status: string }> | null, trips?: Array<{ __typename?: 'MyTripProgress', code: string, plate?: string | null, vehicleType?: string | null, driverName?: string | null, status: string, lastUpdateAt: string }> | null, pricingLines?: Array<{ __typename?: 'PricingLine', label: string, amount: number }> | null, sharedAttachments?: Array<{ __typename?: 'SharedAttachmentView', id: string, fileName: string, category: string, createdAt: string, url?: string | null }> | null } };

export type MyDebtStatementsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyDebtStatementsQuery = { __typename?: 'Query', myDebtStatements: Array<{ __typename?: 'MyStatementView', id: string, code: string, merchantName: string, periodFrom: string, periodTo: string, sentAt?: string | null, orderCount: number, total: number, paid: number, remaining: number, status: string, pdfUrl?: string | null }>, myDebtSummary: { __typename?: 'MyDebtSummary', total: number, paid: number, remaining: number, overdue: number, openOrders: number } };

export type MyDebtStatementQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MyDebtStatementQuery = { __typename?: 'Query', myDebtStatement: { __typename?: 'MyStatementView', id: string, code: string, pdfUrl?: string | null, lines?: Array<{ __typename?: 'MyStatementLine', orderDate: string, orderCode: string, orderId: string, route?: string | null, total: number, paid: number, remaining: number, dueDate?: string | null, overdueDays: number }> | null } };

export type CustomerNotificationsQueryVariables = Exact<{
  filter?: InputMaybe<NotificationFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type CustomerNotificationsQuery = { __typename?: 'Query', notifications: { __typename?: 'NotificationConnection', totalCount: number, unreadCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null }, nodes: Array<{ __typename?: 'NotificationView', id: string, type: string, title: string, body?: string | null, entityType?: string | null, entityId?: string | null, severity?: string | null, readAt?: string | null, createdAt: string }> } };

export type CustomerUnreadCountQueryVariables = Exact<{ [key: string]: never; }>;


export type CustomerUnreadCountQuery = { __typename?: 'Query', unreadNotificationCount: number };

export type MarkNotificationsReadMutationVariables = Exact<{
  ids?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type MarkNotificationsReadMutation = { __typename?: 'Mutation', markNotificationsRead: number };

export type MarkAllNotificationsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsReadMutation = { __typename?: 'Mutation', markAllNotificationsRead: number };


export const CustomerMeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CustomerMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerMe"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"taxCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"}},{"kind":"Field","name":{"kind":"Name","value":"contactTitle"}},{"kind":"Field","name":{"kind":"Name","value":"notificationPrefs"}}]}},{"kind":"Field","name":{"kind":"Name","value":"merchantLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"merchantId"}},{"kind":"Field","name":{"kind":"Name","value":"merchantName"}},{"kind":"Field","name":{"kind":"Name","value":"customerCode"}},{"kind":"Field","name":{"kind":"Name","value":"paymentTermDays"}},{"kind":"Field","name":{"kind":"Name","value":"orderCount"}}]}}]}}]}}]} as unknown as DocumentNode<CustomerMeQuery, CustomerMeQueryVariables>;
export const UpdateCustomerProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCustomerProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCustomerProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"companyName"}},{"kind":"Field","name":{"kind":"Name","value":"taxCode"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"}},{"kind":"Field","name":{"kind":"Name","value":"contactTitle"}},{"kind":"Field","name":{"kind":"Name","value":"notificationPrefs"}}]}},{"kind":"Field","name":{"kind":"Name","value":"merchantLinks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"merchantId"}},{"kind":"Field","name":{"kind":"Name","value":"merchantName"}},{"kind":"Field","name":{"kind":"Name","value":"customerCode"}},{"kind":"Field","name":{"kind":"Name","value":"paymentTermDays"}},{"kind":"Field","name":{"kind":"Name","value":"orderCount"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateCustomerProfileMutation, UpdateCustomerProfileMutationVariables>;
export const PublicMerchantsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PublicMerchants"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PublicMerchantFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicMerchants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"intro"}},{"kind":"Field","name":{"kind":"Name","value":"serviceAreas"}},{"kind":"Field","name":{"kind":"Name","value":"services"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleTypes"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"hasRelationship"}},{"kind":"Field","name":{"kind":"Name","value":"myOrderCount"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleCount"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"dispatchHotline"}}]}}]}}]}}]} as unknown as DocumentNode<PublicMerchantsQuery, PublicMerchantsQueryVariables>;
export const PublicMerchantDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PublicMerchant"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicMerchant"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"intro"}},{"kind":"Field","name":{"kind":"Name","value":"serviceAreas"}},{"kind":"Field","name":{"kind":"Name","value":"services"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleTypes"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"dispatchHotline"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleCount"}},{"kind":"Field","name":{"kind":"Name","value":"hasRelationship"}},{"kind":"Field","name":{"kind":"Name","value":"myOrderCount"}}]}}]}}]} as unknown as DocumentNode<PublicMerchantQuery, PublicMerchantQueryVariables>;
export const MyAddressesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyAddresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myAddresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"usage"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"isDefaultPickup"}}]}}]}}]} as unknown as DocumentNode<MyAddressesQuery, MyAddressesQueryVariables>;
export const CreateMyAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMyAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerAddressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMyAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateMyAddressMutation, CreateMyAddressMutationVariables>;
export const UpdateMyAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMyAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerAddressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMyAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateMyAddressMutation, UpdateMyAddressMutationVariables>;
export const DeleteMyAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMyAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMyAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteMyAddressMutation, DeleteMyAddressMutationVariables>;
export const MyBookingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyBookings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"BookingFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myBookings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"merchantId"}},{"kind":"Field","name":{"kind":"Name","value":"merchantName"}},{"kind":"Field","name":{"kind":"Name","value":"cargoName"}},{"kind":"Field","name":{"kind":"Name","value":"weightTon"}},{"kind":"Field","name":{"kind":"Name","value":"packages"}},{"kind":"Field","name":{"kind":"Name","value":"pickupFrom"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"stops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}}]}}]}}]}}]}}]} as unknown as DocumentNode<MyBookingsQuery, MyBookingsQueryVariables>;
export const MyBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"merchantId"}},{"kind":"Field","name":{"kind":"Name","value":"merchantName"}},{"kind":"Field","name":{"kind":"Name","value":"cargoName"}},{"kind":"Field","name":{"kind":"Name","value":"weightTon"}},{"kind":"Field","name":{"kind":"Name","value":"packages"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleTypeHint"}},{"kind":"Field","name":{"kind":"Name","value":"fragile"}},{"kind":"Field","name":{"kind":"Name","value":"loadingAtPickup"}},{"kind":"Field","name":{"kind":"Name","value":"loadingAtDrop"}},{"kind":"Field","name":{"kind":"Name","value":"pickupFrom"}},{"kind":"Field","name":{"kind":"Name","value":"deliverBefore"}},{"kind":"Field","name":{"kind":"Name","value":"flexibility"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"rejectReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"orderAdjustments"}},{"kind":"Field","name":{"kind":"Name","value":"stops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}},{"kind":"Field","name":{"kind":"Name","value":"notes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"authorType"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fromStatus"}},{"kind":"Field","name":{"kind":"Name","value":"toStatus"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"actorName"}},{"kind":"Field","name":{"kind":"Name","value":"changedAt"}}]}}]}}]}}]} as unknown as DocumentNode<MyBookingQuery, MyBookingQueryVariables>;
export const CreateBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BookingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateBookingMutation, CreateBookingMutationVariables>;
export const UpdateBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BookingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<UpdateBookingMutation, UpdateBookingMutationVariables>;
export const CancelBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}}]}}]}}]} as unknown as DocumentNode<CancelBookingMutation, CancelBookingMutationVariables>;
export const AddBookingNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddBookingNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"bookingId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"body"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addBookingNote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"bookingId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"bookingId"}}},{"kind":"Argument","name":{"kind":"Name","value":"body"},"value":{"kind":"Variable","name":{"kind":"Name","value":"body"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"notes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"authorType"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<AddBookingNoteMutation, AddBookingNoteMutationVariables>;
export const MyOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MyOrderFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderDate"}},{"kind":"Field","name":{"kind":"Name","value":"merchantName"}},{"kind":"Field","name":{"kind":"Name","value":"merchantId"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"bookingCode"}},{"kind":"Field","name":{"kind":"Name","value":"bookingId"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"remainingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"overdueDays"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"myDebtSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdue"}},{"kind":"Field","name":{"kind":"Name","value":"openOrders"}}]}}]}}]} as unknown as DocumentNode<MyOrdersQuery, MyOrdersQueryVariables>;
export const MyOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderDate"}},{"kind":"Field","name":{"kind":"Name","value":"merchantName"}},{"kind":"Field","name":{"kind":"Name","value":"merchantId"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"bookingCode"}},{"kind":"Field","name":{"kind":"Name","value":"bookingId"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"remainingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"overdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"statementCode"}},{"kind":"Field","name":{"kind":"Name","value":"stops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"place"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"plannedAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cargo"}},{"kind":"Field","name":{"kind":"Name","value":"trips"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleType"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastUpdateAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pricingLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sharedAttachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<MyOrderQuery, MyOrderQueryVariables>;
export const MyDebtStatementsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyDebtStatements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myDebtStatements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"merchantName"}},{"kind":"Field","name":{"kind":"Name","value":"periodFrom"}},{"kind":"Field","name":{"kind":"Name","value":"periodTo"}},{"kind":"Field","name":{"kind":"Name","value":"sentAt"}},{"kind":"Field","name":{"kind":"Name","value":"orderCount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pdfUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myDebtSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdue"}},{"kind":"Field","name":{"kind":"Name","value":"openOrders"}}]}}]}}]} as unknown as DocumentNode<MyDebtStatementsQuery, MyDebtStatementsQueryVariables>;
export const MyDebtStatementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyDebtStatement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myDebtStatement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"pdfUrl"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderDate"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"route"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"overdueDays"}}]}}]}}]}}]} as unknown as DocumentNode<MyDebtStatementQuery, MyDebtStatementQueryVariables>;
export const CustomerNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CustomerNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NotificationFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"unreadCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<CustomerNotificationsQuery, CustomerNotificationsQueryVariables>;
export const CustomerUnreadCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CustomerUnreadCount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unreadNotificationCount"}}]}}]} as unknown as DocumentNode<CustomerUnreadCountQuery, CustomerUnreadCountQueryVariables>;
export const MarkNotificationsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkNotificationsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markNotificationsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}]}]}}]} as unknown as DocumentNode<MarkNotificationsReadMutation, MarkNotificationsReadMutationVariables>;
export const MarkAllNotificationsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllNotificationsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllNotificationsRead"}}]}}]} as unknown as DocumentNode<MarkAllNotificationsReadMutation, MarkAllNotificationsReadMutationVariables>;