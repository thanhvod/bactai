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

export type CustomerTotalsView = {
  __typename?: 'CustomerTotalsView';
  activeCount: Scalars['Int']['output'];
  creditBalance: Scalars['Money']['output'];
  creditCustomers: Scalars['Int']['output'];
  customerCount: Scalars['Int']['output'];
  overLimitCustomers: Scalars['Int']['output'];
  overdueAmount: Scalars['Money']['output'];
  overdueCustomers: Scalars['Int']['output'];
  receivable: Scalars['Money']['output'];
  remaining: Scalars['Money']['output'];
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
  registerPushToken: Scalars['Boolean']['output'];
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
  unregisterPushToken: Scalars['Boolean']['output'];
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


export type MutationRegisterPushTokenArgs = {
  input: RegisterPushTokenInput;
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


export type MutationUnregisterPushTokenArgs = {
  token: Scalars['String']['input'];
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
  customerTotals: CustomerTotalsView;
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


export type QueryCustomerTotalsArgs = {
  filter?: InputMaybe<CustomerFilter>;
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

export type RegisterPushTokenInput = {
  deviceInfo?: InputMaybe<Scalars['String']['input']>;
  platform: Scalars['String']['input'];
  token: Scalars['String']['input'];
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

export type MyAppLoginQueryVariables = Exact<{ [key: string]: never; }>;


export type MyAppLoginQuery = { __typename?: 'Query', me: { __typename?: 'Me', account: { __typename?: 'Account', id: string, phone?: string | null, hasAppPassword: boolean } } };

export type SetMyAppCredentialsMutationVariables = Exact<{
  phone: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;


export type SetMyAppCredentialsMutation = { __typename?: 'Mutation', setMyAppCredentials: { __typename?: 'Me', account: { __typename?: 'Account', id: string, phone?: string | null, hasAppPassword: boolean } } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'Me', account: { __typename?: 'Account', id: string, email: string, name?: string | null, avatarUrl?: string | null }, memberships: Array<{ __typename?: 'Membership', id: string, merchantId: string, merchantCode: string, merchantName: string, role: string, status: string, lastAccessAt?: string | null }>, current?: { __typename?: 'CurrentContext', membershipId: string, merchantId: string, merchantName: string, role: string, permissions: Array<string> } | null } };

export type CreateMerchantMutationVariables = Exact<{
  input: CreateMerchantInput;
}>;


export type CreateMerchantMutation = { __typename?: 'Mutation', createMerchant: { __typename?: 'Membership', id: string, merchantId: string, merchantCode: string, merchantName: string, role: string, status: string, lastAccessAt?: string | null } };

export type AcceptInvitationMutationVariables = Exact<{
  membershipId: Scalars['ID']['input'];
}>;


export type AcceptInvitationMutation = { __typename?: 'Mutation', acceptInvitation: { __typename?: 'Membership', id: string, merchantId: string, merchantCode: string, merchantName: string, role: string, status: string, lastAccessAt?: string | null } };

export type CustomerListFieldsFragment = { __typename?: 'CustomerView', id: string, code: string, type: string, name: string, phone?: string | null, taxCode?: string | null, status: string, creditLimit?: number | null, defaultDebtDays?: number | null, orderCount: number, creditBalance: number, warnings: Array<string>, groupName?: string | null, debtSummary: { __typename?: 'CustomerDebtSummaryView', remaining: number, overdueAmount: number, maxOverdueDays: number, overdueOrders: number, openOrders: number, overLimit: boolean, limitUsagePct?: number | null } };

export type CustomersQueryVariables = Exact<{
  filter?: InputMaybe<CustomerFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type CustomersQuery = { __typename?: 'Query', customers: { __typename?: 'CustomerConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, endCursor?: string | null, startCursor?: string | null }, nodes: Array<{ __typename?: 'CustomerView', id: string, code: string, type: string, name: string, phone?: string | null, taxCode?: string | null, status: string, creditLimit?: number | null, defaultDebtDays?: number | null, orderCount: number, creditBalance: number, warnings: Array<string>, groupName?: string | null, debtSummary: { __typename?: 'CustomerDebtSummaryView', remaining: number, overdueAmount: number, maxOverdueDays: number, overdueOrders: number, openOrders: number, overLimit: boolean, limitUsagePct?: number | null } }> } };

export type CustomerLocationFieldsFragment = { __typename?: 'CustomerLocationView', id: string, customerId: string, name: string, usage: string, address: string, province?: string | null, lat?: number | null, lng?: number | null, contactName?: string | null, contactPhone?: string | null, note?: string | null, isDefault: boolean, active: boolean, usedInOrders: number };

export type CustomerDetailFieldsFragment = { __typename?: 'CustomerView', legalName?: string | null, email?: string | null, invoiceEmail?: string | null, billingAddress?: string | null, groupId?: string | null, note?: string | null, deactivateReason?: string | null, hasPortalAccount: boolean, createdAt: string, updatedAt: string, id: string, code: string, type: string, name: string, phone?: string | null, taxCode?: string | null, status: string, creditLimit?: number | null, defaultDebtDays?: number | null, orderCount: number, creditBalance: number, warnings: Array<string>, groupName?: string | null, primaryContact?: { __typename?: 'ContactView', name?: string | null, role?: string | null, phone?: string | null, email?: string | null, zalo?: string | null } | null, debtSummary: { __typename?: 'CustomerDebtSummaryView', receivable: number, paid: number, remaining: number, overdueAmount: number, maxOverdueDays: number, openOrders: number, overdueOrders: number, creditBalance: number, creditLimit?: number | null, overLimit: boolean, limitUsagePct?: number | null, aging: { __typename?: 'AgingView', current: number, d1_15: number, d16_30: number, d31_60: number, d60p: number } }, locations?: Array<{ __typename?: 'CustomerLocationView', id: string, customerId: string, name: string, usage: string, address: string, province?: string | null, lat?: number | null, lng?: number | null, contactName?: string | null, contactPhone?: string | null, note?: string | null, isDefault: boolean, active: boolean, usedInOrders: number }> | null };

export type CustomerQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CustomerQuery = { __typename?: 'Query', customer: { __typename?: 'CustomerView', legalName?: string | null, email?: string | null, invoiceEmail?: string | null, billingAddress?: string | null, groupId?: string | null, note?: string | null, deactivateReason?: string | null, hasPortalAccount: boolean, createdAt: string, updatedAt: string, id: string, code: string, type: string, name: string, phone?: string | null, taxCode?: string | null, status: string, creditLimit?: number | null, defaultDebtDays?: number | null, orderCount: number, creditBalance: number, warnings: Array<string>, groupName?: string | null, primaryContact?: { __typename?: 'ContactView', name?: string | null, role?: string | null, phone?: string | null, email?: string | null, zalo?: string | null } | null, debtSummary: { __typename?: 'CustomerDebtSummaryView', receivable: number, paid: number, remaining: number, overdueAmount: number, maxOverdueDays: number, openOrders: number, overdueOrders: number, creditBalance: number, creditLimit?: number | null, overLimit: boolean, limitUsagePct?: number | null, aging: { __typename?: 'AgingView', current: number, d1_15: number, d16_30: number, d31_60: number, d60p: number } }, locations?: Array<{ __typename?: 'CustomerLocationView', id: string, customerId: string, name: string, usage: string, address: string, province?: string | null, lat?: number | null, lng?: number | null, contactName?: string | null, contactPhone?: string | null, note?: string | null, isDefault: boolean, active: boolean, usedInOrders: number }> | null } };

export type CreateCustomerMutationVariables = Exact<{
  input: CustomerInput;
}>;


export type CreateCustomerMutation = { __typename?: 'Mutation', createCustomer: { __typename?: 'CustomerView', legalName?: string | null, email?: string | null, invoiceEmail?: string | null, billingAddress?: string | null, groupId?: string | null, note?: string | null, deactivateReason?: string | null, hasPortalAccount: boolean, createdAt: string, updatedAt: string, id: string, code: string, type: string, name: string, phone?: string | null, taxCode?: string | null, status: string, creditLimit?: number | null, defaultDebtDays?: number | null, orderCount: number, creditBalance: number, warnings: Array<string>, groupName?: string | null, primaryContact?: { __typename?: 'ContactView', name?: string | null, role?: string | null, phone?: string | null, email?: string | null, zalo?: string | null } | null, debtSummary: { __typename?: 'CustomerDebtSummaryView', receivable: number, paid: number, remaining: number, overdueAmount: number, maxOverdueDays: number, openOrders: number, overdueOrders: number, creditBalance: number, creditLimit?: number | null, overLimit: boolean, limitUsagePct?: number | null, aging: { __typename?: 'AgingView', current: number, d1_15: number, d16_30: number, d31_60: number, d60p: number } }, locations?: Array<{ __typename?: 'CustomerLocationView', id: string, customerId: string, name: string, usage: string, address: string, province?: string | null, lat?: number | null, lng?: number | null, contactName?: string | null, contactPhone?: string | null, note?: string | null, isDefault: boolean, active: boolean, usedInOrders: number }> | null } };

export type UpdateCustomerMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: CustomerInput;
}>;


export type UpdateCustomerMutation = { __typename?: 'Mutation', updateCustomer: { __typename?: 'CustomerView', legalName?: string | null, email?: string | null, invoiceEmail?: string | null, billingAddress?: string | null, groupId?: string | null, note?: string | null, deactivateReason?: string | null, hasPortalAccount: boolean, createdAt: string, updatedAt: string, id: string, code: string, type: string, name: string, phone?: string | null, taxCode?: string | null, status: string, creditLimit?: number | null, defaultDebtDays?: number | null, orderCount: number, creditBalance: number, warnings: Array<string>, groupName?: string | null, primaryContact?: { __typename?: 'ContactView', name?: string | null, role?: string | null, phone?: string | null, email?: string | null, zalo?: string | null } | null, debtSummary: { __typename?: 'CustomerDebtSummaryView', receivable: number, paid: number, remaining: number, overdueAmount: number, maxOverdueDays: number, openOrders: number, overdueOrders: number, creditBalance: number, creditLimit?: number | null, overLimit: boolean, limitUsagePct?: number | null, aging: { __typename?: 'AgingView', current: number, d1_15: number, d16_30: number, d31_60: number, d60p: number } }, locations?: Array<{ __typename?: 'CustomerLocationView', id: string, customerId: string, name: string, usage: string, address: string, province?: string | null, lat?: number | null, lng?: number | null, contactName?: string | null, contactPhone?: string | null, note?: string | null, isDefault: boolean, active: boolean, usedInOrders: number }> | null } };

export type DeactivateCustomerMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type DeactivateCustomerMutation = { __typename?: 'Mutation', deactivateCustomer: { __typename?: 'CustomerView', id: string, status: string, deactivateReason?: string | null } };

export type ActivateCustomerMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ActivateCustomerMutation = { __typename?: 'Mutation', activateCustomer: { __typename?: 'CustomerView', id: string, status: string, deactivateReason?: string | null } };

export type CustomerLocationsQueryVariables = Exact<{
  customerId: Scalars['ID']['input'];
  includeInactive?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type CustomerLocationsQuery = { __typename?: 'Query', customerLocations: Array<{ __typename?: 'CustomerLocationView', id: string, customerId: string, name: string, usage: string, address: string, province?: string | null, lat?: number | null, lng?: number | null, contactName?: string | null, contactPhone?: string | null, note?: string | null, isDefault: boolean, active: boolean, usedInOrders: number }> };

export type CreateCustomerLocationMutationVariables = Exact<{
  customerId: Scalars['ID']['input'];
  input: CustomerLocationInput;
}>;


export type CreateCustomerLocationMutation = { __typename?: 'Mutation', createCustomerLocation: { __typename?: 'CustomerLocationView', id: string, customerId: string, name: string, usage: string, address: string, province?: string | null, lat?: number | null, lng?: number | null, contactName?: string | null, contactPhone?: string | null, note?: string | null, isDefault: boolean, active: boolean, usedInOrders: number } };

export type UpdateCustomerLocationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: CustomerLocationInput;
}>;


export type UpdateCustomerLocationMutation = { __typename?: 'Mutation', updateCustomerLocation: { __typename?: 'CustomerLocationView', id: string, customerId: string, name: string, usage: string, address: string, province?: string | null, lat?: number | null, lng?: number | null, contactName?: string | null, contactPhone?: string | null, note?: string | null, isDefault: boolean, active: boolean, usedInOrders: number } };

export type DeleteCustomerLocationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type DeleteCustomerLocationMutation = { __typename?: 'Mutation', deleteCustomerLocation: boolean };

export type CustomerTotalsQueryVariables = Exact<{
  filter?: InputMaybe<CustomerFilter>;
}>;


export type CustomerTotalsQuery = { __typename?: 'Query', customerTotals: { __typename?: 'CustomerTotalsView', customerCount: number, activeCount: number, receivable: number, remaining: number, overdueAmount: number, overdueCustomers: number, overLimitCustomers: number, creditBalance: number, creditCustomers: number } };

export type DashSummaryQueryVariables = Exact<{
  date?: InputMaybe<Scalars['String']['input']>;
}>;


export type DashSummaryQuery = { __typename?: 'Query', dashboardSummary: { __typename?: 'DashboardSummary', date: string, runningTrips: number, todayTrips: number, newOrdersToday: number, ordersNeedAction: number, unassignedOrders: number, openIncidents: number, payrollPending: number, scheduleWarnings: number, codOverThreshold: number, revenueMonth: number, costMonth: number, profitMonth: number, cashInMonth: number, receivable: number, supplierPayable: number, overdueDebt: { __typename?: 'AmountCount', amount: number, count: number }, codHeld: { __typename?: 'AmountCount', amount: number, count: number }, tripCountsByStatus: Array<{ __typename?: 'TripStatusCount', status: string, count: number }>, todayTripList: Array<{ __typename?: 'DashboardTrip', id: string, code: string, orderId: string, orderCode: string, routeSummary?: string | null, driverName?: string | null, vehiclePlate?: string | null, plannedStartAt: string, plannedEndAt?: string | null, status: string, hasWarning: boolean, openIncident: boolean }>, overdueOrders: Array<{ __typename?: 'DashboardOverdueOrder', orderId: string, code: string, customerId: string, customerName: string, remaining: number, dueDate?: string | null, overdueDays: number }>, codHolders: Array<{ __typename?: 'DashboardCodHolder', driverId: string, name: string, phone: string, codHeld: number, daysHeld: number, overThreshold: boolean }> } };

export type DashProfitMonthlyQueryVariables = Exact<{
  filter?: InputMaybe<ReportFilter>;
}>;


export type DashProfitMonthlyQuery = { __typename?: 'Query', reportProfit: { __typename?: 'ProfitReport', rows: Array<{ __typename?: 'ProfitRow', key: string, label: string, revenue: number, cost: number, profit: number }>, totals: { __typename?: 'ProfitRow', revenue: number, cost: number, profit: number, margin?: number | null } } };

export type DashFinanceExtrasQueryVariables = Exact<{ [key: string]: never; }>;


export type DashFinanceExtrasQuery = { __typename?: 'Query', reportCustomerDebt: { __typename?: 'CustomerDebtReport', totalDebt: number, totalOverdue: number, totalCredit: number, aging: { __typename?: 'AgingReportView', current: number, d1_15: number, d16_30: number, d31_60: number, d60p: number } }, reportCodHeld: { __typename?: 'CodHeldReport', totalHeld: number, overThresholdCount: number } };

export type TripListFieldsFragment = { __typename?: 'TripView', id: string, code: string, status: string, plannedStartAt: string, plannedEndAt?: string | null, actualStartAt?: string | null, actualEndAt?: string | null, routeSummary?: string | null, hasWarning: boolean, isExternal: boolean, openIncidentCount: number, stopCount: number, codExpectedTotal: number, driverBonusAmount: number, order: { __typename?: 'TripOrderRef', id: string, code: string, customerName: string }, vehicle?: { __typename?: 'VehicleRef', id: string, plate: string, typeName?: string | null } | null, driver?: { __typename?: 'DriverRef', id: string, name: string, phone: string } | null, lastLocation?: { __typename?: 'LastLocationView', capturedAt: string, isStale: boolean } | null };

export type DspTripsQueryVariables = Exact<{
  filter?: InputMaybe<TripFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
}>;


export type DspTripsQuery = { __typename?: 'Query', trips: { __typename?: 'TripConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null }, nodes: Array<{ __typename?: 'TripView', id: string, code: string, status: string, plannedStartAt: string, plannedEndAt?: string | null, actualStartAt?: string | null, actualEndAt?: string | null, routeSummary?: string | null, hasWarning: boolean, isExternal: boolean, openIncidentCount: number, stopCount: number, codExpectedTotal: number, driverBonusAmount: number, order: { __typename?: 'TripOrderRef', id: string, code: string, customerName: string }, vehicle?: { __typename?: 'VehicleRef', id: string, plate: string, typeName?: string | null } | null, driver?: { __typename?: 'DriverRef', id: string, name: string, phone: string } | null, lastLocation?: { __typename?: 'LastLocationView', capturedAt: string, isStale: boolean } | null }> } };

export type DspTripQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DspTripQuery = { __typename?: 'Query', trip: { __typename?: 'TripView', id: string, code: string, status: string, orderId: string, plannedStartAt: string, plannedEndAt?: string | null, actualStartAt?: string | null, actualEndAt?: string | null, routeSummary?: string | null, note?: string | null, isExternal: boolean, hasWarning: boolean, driverBonusAmount: number, codExpectedTotal: number, codActualTotal: number, cancelReason?: string | null, pausedAt?: string | null, pausedReasonId?: string | null, pauseReasonLabel?: string | null, pauseNote?: string | null, previousStatusBeforePause?: string | null, resumedAt?: string | null, allowedNextStatuses: Array<string>, attachmentCount?: number | null, openIncidentCount: number, createdAt: string, order: { __typename?: 'TripOrderRef', id: string, code: string, status: string, customerId: string, customerName: string, customerPhone?: string | null }, vehicle?: { __typename?: 'VehicleRef', id: string, code?: string | null, plate: string, typeName?: string | null, capacityTons?: number | null, status: string } | null, driver?: { __typename?: 'DriverRef', id: string, code?: string | null, name: string, phone: string, status: string } | null, stops?: Array<{ __typename?: 'TripStopView', id: string, orderId: string, type: string, sequence: number, tripSequence: number, locationName?: string | null, address: string, lat?: number | null, lng?: number | null, contactName?: string | null, contactPhone?: string | null, plannedAt?: string | null, arrivedAt?: string | null, completedAt?: string | null, codExpected?: number | null, codActual?: number | null, codCollectedAt?: string | null, podCount: number, status: string, skipReason?: string | null }> | null, expenses?: Array<{ __typename?: 'TripExpenseView', id: string, code: string, kind: string, categoryName?: string | null, description?: string | null, amount: number, paidBy: string, paidStatus: string, reimbursable: boolean, status: string, expenseDate: string }> | null, advances?: Array<{ __typename?: 'TripExpenseView', id: string, code: string, amount: number, status: string, expenseDate: string, description?: string | null }> | null, incidents?: Array<{ __typename?: 'TripIncidentRef', id: string, code: string, title: string, severity: string, status: string, createdAt: string }> | null, lastLocation?: { __typename?: 'LastLocationView', lat: number, lng: number, capturedAt: string, speed?: number | null, isStale: boolean } | null, warnings?: Array<{ __typename?: 'ScheduleWarningView', id?: string | null, type: string, subject: string, subjectLabel?: string | null, conflictTripId?: string | null, conflictTripCode?: string | null, gapMinutes: number, thresholdMinutes: number, overrideReason?: string | null }> | null, externalTransport?: { __typename?: 'ExternalTransportView', id: string, supplierId?: string | null, supplierName?: string | null, vehiclePlate?: string | null, driverName?: string | null, driverPhone?: string | null, agreedAmount?: number | null, note?: string | null } | null } };

export type DspTripLocationsQueryVariables = Exact<{
  tripId: Scalars['ID']['input'];
}>;


export type DspTripLocationsQuery = { __typename?: 'Query', tripLocations: Array<{ __typename?: 'TripLocationPoint', lat: number, lng: number, recordedAt: string, speed?: number | null }> };

export type DspTripFormOrderQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DspTripFormOrderQuery = { __typename?: 'Query', order: { __typename?: 'OrderView', id: string, code: string, status: string, routeSummary?: string | null, customer: { __typename?: 'OrderCustomerRef', id: string, name: string }, stops?: Array<{ __typename?: 'OrderStopView', id: string, type: string, sequence: number, locationName?: string | null, address: string, plannedAt?: string | null, status: string, tripIds: Array<string>, tripCodes: Array<string> }> | null, trips?: Array<{ __typename?: 'TripView', id: string, code: string, status: string }> | null } };

export type DspResourceOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type DspResourceOptionsQuery = { __typename?: 'Query', driverOptions: Array<{ __typename?: 'DriverOption', id: string, code: string, name: string, phone: string, status: string, busy: boolean, busyTripCode?: string | null }>, vehicleOptions: Array<{ __typename?: 'VehicleOption', id: string, code: string, plate: string, status: string, typeName?: string | null, capacityTons?: number | null, busy: boolean, busyTripCode?: string | null }> };

export type DspCheckOverlapQueryVariables = Exact<{
  input: CheckTripOverlapInput;
}>;


export type DspCheckOverlapQuery = { __typename?: 'Query', checkTripOverlap: Array<{ __typename?: 'ScheduleWarningView', type: string, subject: string, subjectId: string, subjectLabel?: string | null, conflictTripId?: string | null, conflictTripCode?: string | null, gapMinutes: number, thresholdMinutes: number }> };

export type DspCreateTripMutationVariables = Exact<{
  input: TripInput;
}>;


export type DspCreateTripMutation = { __typename?: 'Mutation', createTrip: { __typename?: 'TripPayload', notices: Array<string>, trip: { __typename?: 'TripView', id: string, code: string }, warnings: Array<{ __typename?: 'ScheduleWarningView', type: string, subject: string, subjectLabel?: string | null, conflictTripCode?: string | null, gapMinutes: number }> } };

export type DspUpdateTripMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateTripInput;
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type DspUpdateTripMutation = { __typename?: 'Mutation', updateTrip: { __typename?: 'TripPayload', notices: Array<string>, trip: { __typename?: 'TripView', id: string, code: string } } };

export type DspUpdateTripStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: TripStatusChangeInput;
}>;


export type DspUpdateTripStatusMutation = { __typename?: 'Mutation', updateTripStatus: { __typename?: 'TripView', id: string, status: string } };

export type DspResumeTripMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
}>;


export type DspResumeTripMutation = { __typename?: 'Mutation', resumeTrip: { __typename?: 'TripView', id: string, status: string } };

export type DspCancelTripMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type DspCancelTripMutation = { __typename?: 'Mutation', cancelTrip: { __typename?: 'TripView', id: string, status: string } };

export type DspSummaryQueryVariables = Exact<{
  date?: InputMaybe<Scalars['String']['input']>;
}>;


export type DspSummaryQuery = { __typename?: 'Query', dispatchSummary: { __typename?: 'DispatchSummary', date: string, total: number, running: number, unassigned: number, warnings: number, openIncidents: number, ordersWaitingDispatch: number, byStatus: Array<{ __typename?: 'StatusCount', status: string, count: number }> } };

export type DspSchedulesQueryVariables = Exact<{
  date?: InputMaybe<Scalars['String']['input']>;
  days?: InputMaybe<Scalars['Int']['input']>;
}>;


export type DspSchedulesQuery = { __typename?: 'Query', vehicleSchedules: Array<{ __typename?: 'ScheduleRow', resource: { __typename?: 'ScheduleResource', id: string, type: string, label: string, sublabel?: string | null, status: string }, blocks: Array<{ __typename?: 'ScheduleBlock', tripId: string, code: string, start: string, end: string, status: string, warning: boolean, orderCode?: string | null, routeSummary?: string | null, counterpartLabel?: string | null }> }>, driverSchedules: Array<{ __typename?: 'ScheduleRow', resource: { __typename?: 'ScheduleResource', id: string, type: string, label: string, sublabel?: string | null, status: string }, blocks: Array<{ __typename?: 'ScheduleBlock', tripId: string, code: string, start: string, end: string, status: string, warning: boolean, orderCode?: string | null, routeSummary?: string | null, counterpartLabel?: string | null }> }> };

export type DspScheduleWarningsQueryVariables = Exact<{
  filter?: InputMaybe<ScheduleWarningFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type DspScheduleWarningsQuery = { __typename?: 'Query', scheduleWarnings: { __typename?: 'ScheduleWarningConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null }, nodes: Array<{ __typename?: 'ScheduleWarningRecord', id: string, type: string, subject: string, subjectId: string, subjectLabel?: string | null, gapMinutes: number, thresholdMinutes: number, status: string, overrideReason?: string | null, overriddenByName?: string | null, resolvedAt?: string | null, createdAt: string, trip: { __typename?: 'TripBrief', id: string, code: string, orderCode?: string | null, plannedStartAt: string, plannedEndAt?: string | null, status: string, vehiclePlate?: string | null, driverName?: string | null }, conflictTrip?: { __typename?: 'TripBrief', id: string, code: string, orderCode?: string | null, plannedStartAt: string, plannedEndAt?: string | null, status: string, vehiclePlate?: string | null, driverName?: string | null } | null }> } };

export type DspResolveWarningMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DspResolveWarningMutation = { __typename?: 'Mutation', resolveScheduleWarning: boolean };

export type DspLastLocationsQueryVariables = Exact<{
  running?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type DspLastLocationsQuery = { __typename?: 'Query', lastKnownLocations: Array<{ __typename?: 'LastKnownLocationView', tripId: string, tripCode: string, tripStatus: string, orderCode: string, vehiclePlate?: string | null, driverName?: string | null, driverPhone?: string | null, lat: number, lng: number, capturedAt: string, isStale: boolean }> };

export type IncidentListFieldsFragment = { __typename?: 'IncidentView', id: string, code: string, title: string, severity: string, status: string, typeId?: string | null, typeName?: string | null, orderId?: string | null, orderCode?: string | null, tripId?: string | null, tripCode?: string | null, driverName?: string | null, vehiclePlate?: string | null, reportedByType: string, reportedByName?: string | null, assigneeUserId?: string | null, assigneeName?: string | null, createdAt: string, resolvedAt?: string | null };

export type DspIncidentsQueryVariables = Exact<{
  filter?: InputMaybe<IncidentFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type DspIncidentsQuery = { __typename?: 'Query', incidents: { __typename?: 'IncidentConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null }, nodes: Array<{ __typename?: 'IncidentView', id: string, code: string, title: string, severity: string, status: string, typeId?: string | null, typeName?: string | null, orderId?: string | null, orderCode?: string | null, tripId?: string | null, tripCode?: string | null, driverName?: string | null, vehiclePlate?: string | null, reportedByType: string, reportedByName?: string | null, assigneeUserId?: string | null, assigneeName?: string | null, createdAt: string, resolvedAt?: string | null }> } };

export type DspIncidentQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DspIncidentQuery = { __typename?: 'Query', incident: { __typename?: 'IncidentView', description?: string | null, location?: string | null, stopId?: string | null, driverId?: string | null, driverPhone?: string | null, vehicleId?: string | null, resolvedNote?: string | null, updatedAt: string, id: string, code: string, title: string, severity: string, status: string, typeId?: string | null, typeName?: string | null, orderId?: string | null, orderCode?: string | null, tripId?: string | null, tripCode?: string | null, driverName?: string | null, vehiclePlate?: string | null, reportedByType: string, reportedByName?: string | null, assigneeUserId?: string | null, assigneeName?: string | null, createdAt: string, resolvedAt?: string | null } };

export type DspCreateIncidentMutationVariables = Exact<{
  input: IncidentInput;
}>;


export type DspCreateIncidentMutation = { __typename?: 'Mutation', createIncident: { __typename?: 'IncidentView', id: string, code: string } };

export type DspUpdateIncidentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: IncidentInput;
}>;


export type DspUpdateIncidentMutation = { __typename?: 'Mutation', updateIncident: { __typename?: 'IncidentView', id: string } };

export type DspAssignIncidentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type DspAssignIncidentMutation = { __typename?: 'Mutation', assignIncident: { __typename?: 'IncidentView', id: string, assigneeName?: string | null } };

export type DspCloseIncidentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  note: Scalars['String']['input'];
}>;


export type DspCloseIncidentMutation = { __typename?: 'Mutation', closeIncident: { __typename?: 'IncidentView', id: string, status: string } };

export type DspCancelIncidentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type DspCancelIncidentMutation = { __typename?: 'Mutation', cancelIncident: { __typename?: 'IncidentView', id: string, status: string } };

export type DspStaffOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type DspStaffOptionsQuery = { __typename?: 'Query', staffOptions: Array<{ __typename?: 'MerchantUserView', id: string, name: string, role: string, effectivePermissions: Array<string> }> };

export type ShellGlobalSearchQueryVariables = Exact<{
  query: Scalars['String']['input'];
  types?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ShellGlobalSearchQuery = { __typename?: 'Query', globalSearch: Array<{ __typename?: 'GlobalSearchResult', type: string, id: string, code?: string | null, title: string, subtitle?: string | null, status?: string | null }> };

export type ShellNavBadgesQueryVariables = Exact<{ [key: string]: never; }>;


export type ShellNavBadgesQuery = { __typename?: 'Query', navBadges: { __typename?: 'NavBadges', dispatch: number, incidents: number, finance: number, codOverThreshold: number, payroll: number, scheduleWarnings: number, overdueCustomers: number } };

export type DspOpsDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type DspOpsDashboardQuery = { __typename?: 'Query', dashboardSummary: { __typename?: 'DashboardSummary', date: string, runningTrips: number, todayTrips: number, unassignedOrders: number, ordersNeedAction: number, openIncidents: number, scheduleWarnings: number, tripCountsByStatus: Array<{ __typename?: 'TripStatusCount', status: string, count: number }>, todayTripList: Array<{ __typename?: 'DashboardTrip', id: string, code: string, status: string, orderId: string, orderCode: string, routeSummary?: string | null, vehiclePlate?: string | null, driverName?: string | null, plannedStartAt: string, plannedEndAt?: string | null, hasWarning: boolean, openIncident: boolean, lastLocationAt?: string | null }> } };

export type ShellPendingBookingsQueryVariables = Exact<{ [key: string]: never; }>;


export type ShellPendingBookingsQuery = { __typename?: 'Query', bookings: { __typename?: 'BookingConnection', totalCount: number } };

export type DspSupplierOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type DspSupplierOptionsQuery = { __typename?: 'Query', supplierOptions: Array<{ __typename?: 'SupplierOption', id: string, name: string, status: string, typeName?: string | null }> };

export type DriverListFieldsFragment = { __typename?: 'DriverView', id: string, code: string, name: string, phone: string, status: string, fixedSalary?: number | null, warnings: Array<string>, licenseExpiresAt?: string | null, currentTrip?: { __typename?: 'DriverCurrentTrip', id: string, code: string, status: string, vehiclePlate?: string | null, routeSummary?: string | null, plannedStartAt: string } | null, appAccount: { __typename?: 'DriverAppAccountView', status: string, lastLoginAt?: string | null, mustChangePassword: boolean, deviceInfo?: string | null }, ledgerSummary: { __typename?: 'DriverLedgerBrief', codHeld: number, companyOwesDriver: number, driverOwesCompany: number, netBalance: number, overAmount: boolean, overDays: boolean, daysHeld: number } };

export type DriversQueryVariables = Exact<{
  filter?: InputMaybe<DriverFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
}>;


export type DriversQuery = { __typename?: 'Query', drivers: { __typename?: 'DriverConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null }, nodes: Array<{ __typename?: 'DriverView', id: string, code: string, name: string, phone: string, status: string, fixedSalary?: number | null, warnings: Array<string>, licenseExpiresAt?: string | null, currentTrip?: { __typename?: 'DriverCurrentTrip', id: string, code: string, status: string, vehiclePlate?: string | null, routeSummary?: string | null, plannedStartAt: string } | null, appAccount: { __typename?: 'DriverAppAccountView', status: string, lastLoginAt?: string | null, mustChangePassword: boolean, deviceInfo?: string | null }, ledgerSummary: { __typename?: 'DriverLedgerBrief', codHeld: number, companyOwesDriver: number, driverOwesCompany: number, netBalance: number, overAmount: boolean, overDays: boolean, daysHeld: number } }> } };

export type SalaryHistoryFieldsFragment = { __typename?: 'DriverSalaryHistoryView', id: string, amount: number, effectiveFrom: string, effectiveTo?: string | null, delta?: number | null, reason?: string | null, createdByName?: string | null, createdAt: string, isCurrent: boolean };

export type DriverDetailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DriverDetailQuery = { __typename?: 'Query', driver: { __typename?: 'DriverView', dob?: string | null, idNumber?: string | null, address?: string | null, emergencyContact?: string | null, licenseClass?: string | null, licenseNumber?: string | null, note?: string | null, createdAt: string, updatedAt: string, id: string, code: string, name: string, phone: string, status: string, fixedSalary?: number | null, warnings: Array<string>, licenseExpiresAt?: string | null, salaryHistory?: Array<{ __typename?: 'DriverSalaryHistoryView', id: string, amount: number, effectiveFrom: string, effectiveTo?: string | null, delta?: number | null, reason?: string | null, createdByName?: string | null, createdAt: string, isCurrent: boolean }> | null, recentTrips?: Array<{ __typename?: 'MasterTripItem', id: string, code: string, status: string, orderId: string, orderCode?: string | null, routeSummary?: string | null, vehiclePlate?: string | null, plannedStartAt: string, plannedEndAt?: string | null, actualStartAt?: string | null, actualEndAt?: string | null, driverBonusAmount: number }> | null, currentTrip?: { __typename?: 'DriverCurrentTrip', id: string, code: string, status: string, vehiclePlate?: string | null, routeSummary?: string | null, plannedStartAt: string } | null, appAccount: { __typename?: 'DriverAppAccountView', status: string, lastLoginAt?: string | null, mustChangePassword: boolean, deviceInfo?: string | null }, ledgerSummary: { __typename?: 'DriverLedgerBrief', codHeld: number, companyOwesDriver: number, driverOwesCompany: number, netBalance: number, overAmount: boolean, overDays: boolean, daysHeld: number } } };

export type CreateDriverMutationVariables = Exact<{
  input: DriverInput;
}>;


export type CreateDriverMutation = { __typename?: 'Mutation', createDriver: { __typename?: 'DriverView', id: string, code: string, phone: string, issuedTempPassword?: string | null } };

export type UpdateDriverMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: DriverInput;
}>;


export type UpdateDriverMutation = { __typename?: 'Mutation', updateDriver: { __typename?: 'DriverView', id: string, code: string, name: string, phone: string, status: string, fixedSalary?: number | null, warnings: Array<string>, licenseExpiresAt?: string | null, currentTrip?: { __typename?: 'DriverCurrentTrip', id: string, code: string, status: string, vehiclePlate?: string | null, routeSummary?: string | null, plannedStartAt: string } | null, appAccount: { __typename?: 'DriverAppAccountView', status: string, lastLoginAt?: string | null, mustChangePassword: boolean, deviceInfo?: string | null }, ledgerSummary: { __typename?: 'DriverLedgerBrief', codHeld: number, companyOwesDriver: number, driverOwesCompany: number, netBalance: number, overAmount: boolean, overDays: boolean, daysHeld: number } } };

export type DeactivateDriverMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type DeactivateDriverMutation = { __typename?: 'Mutation', deactivateDriver: { __typename?: 'DriverView', id: string, status: string } };

export type ActivateDriverMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ActivateDriverMutation = { __typename?: 'Mutation', activateDriver: { __typename?: 'DriverView', id: string, status: string } };

export type AddDriverSalaryHistoryMutationVariables = Exact<{
  driverId: Scalars['ID']['input'];
  input: SalaryHistoryInput;
}>;


export type AddDriverSalaryHistoryMutation = { __typename?: 'Mutation', addDriverSalaryHistory: Array<{ __typename?: 'DriverSalaryHistoryView', id: string, amount: number, effectiveFrom: string, effectiveTo?: string | null, delta?: number | null, reason?: string | null, createdByName?: string | null, createdAt: string, isCurrent: boolean }> };

export type CreateOrResetDriverAccountMutationVariables = Exact<{
  driverId: Scalars['ID']['input'];
}>;


export type CreateOrResetDriverAccountMutation = { __typename?: 'Mutation', createOrResetDriverAccount: { __typename?: 'DriverAccountCredentials', phone: string, tempPassword: string, status: string } };

export type DisableDriverAccountMutationVariables = Exact<{
  driverId: Scalars['ID']['input'];
}>;


export type DisableDriverAccountMutation = { __typename?: 'Mutation', disableDriverAccount: { __typename?: 'DriverView', id: string, appAccount: { __typename?: 'DriverAppAccountView', status: string } } };

export type DsFieldsFragment = { __typename?: 'DebtStatementView', id: string, code: string, status: string, scope: string, periodFrom: string, periodTo: string, lineCount: number, totalAmount: number, paidAmount: number, remainingAmount: number, note?: string | null, sharedWithCustomer: boolean, finalizedAt?: string | null, finalizedByName?: string | null, sentAt?: string | null, cancelledAt?: string | null, cancelReason?: string | null, createdAt: string, createdByName?: string | null, pdfAttachmentId?: string | null, pdfUrl?: string | null, customer: { __typename?: 'DebtStatementCustomerRef', id: string, code: string, name: string, phone?: string | null, invoiceEmail?: string | null, hasPortalAccount: boolean } };

export type DsListQueryVariables = Exact<{
  filter?: InputMaybe<DebtStatementFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type DsListQuery = { __typename?: 'Query', debtStatements: { __typename?: 'DebtStatementConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null }, nodes: Array<{ __typename?: 'DebtStatementView', id: string, code: string, status: string, scope: string, periodFrom: string, periodTo: string, lineCount: number, totalAmount: number, paidAmount: number, remainingAmount: number, note?: string | null, sharedWithCustomer: boolean, finalizedAt?: string | null, finalizedByName?: string | null, sentAt?: string | null, cancelledAt?: string | null, cancelReason?: string | null, createdAt: string, createdByName?: string | null, pdfAttachmentId?: string | null, pdfUrl?: string | null, customer: { __typename?: 'DebtStatementCustomerRef', id: string, code: string, name: string, phone?: string | null, invoiceEmail?: string | null, hasPortalAccount: boolean } }> } };

export type DsDetailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DsDetailQuery = { __typename?: 'Query', debtStatement: { __typename?: 'DebtStatementView', id: string, code: string, status: string, scope: string, periodFrom: string, periodTo: string, lineCount: number, totalAmount: number, paidAmount: number, remainingAmount: number, note?: string | null, sharedWithCustomer: boolean, finalizedAt?: string | null, finalizedByName?: string | null, sentAt?: string | null, cancelledAt?: string | null, cancelReason?: string | null, createdAt: string, createdByName?: string | null, pdfAttachmentId?: string | null, pdfUrl?: string | null, lines?: Array<{ __typename?: 'DebtStatementLineView', id: string, sequence: number, orderId: string, orderCode: string, orderDate: string, route?: string | null, totalAmount: number, paidAmount: number, remainingAmount: number, dueDate?: string | null, overdueDays: number }> | null, diffVsCurrent?: Array<{ __typename?: 'DebtStatementDiffView', orderId: string, orderCode: string, snapshotPaid: number, snapshotRemaining: number, currentPaid: number, currentRemaining: number, message: string }> | null, customer: { __typename?: 'DebtStatementCustomerRef', id: string, code: string, name: string, phone?: string | null, invoiceEmail?: string | null, hasPortalAccount: boolean } } };

export type DsCreateMutationVariables = Exact<{
  input: CreateDebtStatementInput;
}>;


export type DsCreateMutation = { __typename?: 'Mutation', createDebtStatement: { __typename?: 'DebtStatementView', id: string, code: string } };

export type DsRefreshMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DsRefreshMutation = { __typename?: 'Mutation', refreshDebtStatement: { __typename?: 'DebtStatementView', id: string, lineCount: number } };

export type DsFinalizeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DsFinalizeMutation = { __typename?: 'Mutation', finalizeDebtStatement: { __typename?: 'DebtStatementView', id: string, status: string, pdfUrl?: string | null } };

export type DsMarkSentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  share?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type DsMarkSentMutation = { __typename?: 'Mutation', markDebtStatementSent: { __typename?: 'DebtStatementView', id: string, status: string, sharedWithCustomer: boolean } };

export type DsCancelMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type DsCancelMutation = { __typename?: 'Mutation', cancelDebtStatement: { __typename?: 'DebtStatementView', id: string, status: string } };

export type DsCustomerOptionsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type DsCustomerOptionsQuery = { __typename?: 'Query', customers: { __typename?: 'CustomerConnection', nodes: Array<{ __typename?: 'CustomerView', id: string, code: string, name: string, phone?: string | null, status: string, debtSummary: { __typename?: 'CustomerDebtSummaryView', remaining: number, overdueAmount: number } }> } };

export type ExpenseFieldsFragment = { __typename?: 'ExpenseView', id: string, code: string, kind: string, kindLabel: string, isCost: boolean, categoryId?: string | null, categoryName?: string | null, amount: number, expenseDate: string, paidBy: string, reimbursable: boolean, paidStatus: string, paidAt?: string | null, paidMethod?: string | null, supplierId?: string | null, orderId?: string | null, tripId?: string | null, vehicleId?: string | null, driverId?: string | null, description?: string | null, note?: string | null, status: string, cancelReason?: string | null, cancelledAt?: string | null, attachmentCount: number, createdAt: string, supplier?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, order?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, trip?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, vehicle?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null };

export type FinExpensesQueryVariables = Exact<{
  filter?: InputMaybe<ExpenseFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type FinExpensesQuery = { __typename?: 'Query', expenses: { __typename?: 'ExpenseConnection', totalCount: number, totalAmount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, endCursor?: string | null, startCursor?: string | null }, nodes: Array<{ __typename?: 'ExpenseView', id: string, code: string, kind: string, kindLabel: string, isCost: boolean, categoryId?: string | null, categoryName?: string | null, amount: number, expenseDate: string, paidBy: string, reimbursable: boolean, paidStatus: string, paidAt?: string | null, paidMethod?: string | null, supplierId?: string | null, orderId?: string | null, tripId?: string | null, vehicleId?: string | null, driverId?: string | null, description?: string | null, note?: string | null, status: string, cancelReason?: string | null, cancelledAt?: string | null, attachmentCount: number, createdAt: string, supplier?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, order?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, trip?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, vehicle?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null }> } };

export type FinExpenseQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type FinExpenseQuery = { __typename?: 'Query', expense: { __typename?: 'ExpenseView', id: string, code: string, kind: string, kindLabel: string, isCost: boolean, categoryId?: string | null, categoryName?: string | null, amount: number, expenseDate: string, paidBy: string, reimbursable: boolean, paidStatus: string, paidAt?: string | null, paidMethod?: string | null, supplierId?: string | null, orderId?: string | null, tripId?: string | null, vehicleId?: string | null, driverId?: string | null, description?: string | null, note?: string | null, status: string, cancelReason?: string | null, cancelledAt?: string | null, attachmentCount: number, createdAt: string, supplier?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, order?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, trip?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, vehicle?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null } };

export type FinCreateExpenseMutationVariables = Exact<{
  input: ExpenseInput;
}>;


export type FinCreateExpenseMutation = { __typename?: 'Mutation', createExpense: { __typename?: 'ExpenseView', id: string, code: string, kind: string, kindLabel: string, isCost: boolean, categoryId?: string | null, categoryName?: string | null, amount: number, expenseDate: string, paidBy: string, reimbursable: boolean, paidStatus: string, paidAt?: string | null, paidMethod?: string | null, supplierId?: string | null, orderId?: string | null, tripId?: string | null, vehicleId?: string | null, driverId?: string | null, description?: string | null, note?: string | null, status: string, cancelReason?: string | null, cancelledAt?: string | null, attachmentCount: number, createdAt: string, supplier?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, order?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, trip?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, vehicle?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null } };

export type FinUpdateExpenseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: ExpenseInput;
  reason: Scalars['String']['input'];
}>;


export type FinUpdateExpenseMutation = { __typename?: 'Mutation', updateExpense: { __typename?: 'ExpenseView', id: string, code: string, kind: string, kindLabel: string, isCost: boolean, categoryId?: string | null, categoryName?: string | null, amount: number, expenseDate: string, paidBy: string, reimbursable: boolean, paidStatus: string, paidAt?: string | null, paidMethod?: string | null, supplierId?: string | null, orderId?: string | null, tripId?: string | null, vehicleId?: string | null, driverId?: string | null, description?: string | null, note?: string | null, status: string, cancelReason?: string | null, cancelledAt?: string | null, attachmentCount: number, createdAt: string, supplier?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, order?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, trip?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, vehicle?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null } };

export type FinCancelExpenseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type FinCancelExpenseMutation = { __typename?: 'Mutation', cancelExpense: { __typename?: 'ExpenseView', id: string, code: string, kind: string, kindLabel: string, isCost: boolean, categoryId?: string | null, categoryName?: string | null, amount: number, expenseDate: string, paidBy: string, reimbursable: boolean, paidStatus: string, paidAt?: string | null, paidMethod?: string | null, supplierId?: string | null, orderId?: string | null, tripId?: string | null, vehicleId?: string | null, driverId?: string | null, description?: string | null, note?: string | null, status: string, cancelReason?: string | null, cancelledAt?: string | null, attachmentCount: number, createdAt: string, supplier?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, order?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, trip?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, vehicle?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null } };

export type FinMarkExpensesPaidMutationVariables = Exact<{
  ids: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  input?: InputMaybe<MarkExpensePaidInput>;
}>;


export type FinMarkExpensesPaidMutation = { __typename?: 'Mutation', markExpensesPaid: Array<{ __typename?: 'ExpenseView', id: string, code: string, kind: string, kindLabel: string, isCost: boolean, categoryId?: string | null, categoryName?: string | null, amount: number, expenseDate: string, paidBy: string, reimbursable: boolean, paidStatus: string, paidAt?: string | null, paidMethod?: string | null, supplierId?: string | null, orderId?: string | null, tripId?: string | null, vehicleId?: string | null, driverId?: string | null, description?: string | null, note?: string | null, status: string, cancelReason?: string | null, cancelledAt?: string | null, attachmentCount: number, createdAt: string, supplier?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, order?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, trip?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, vehicle?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null }> };

export type PaymentFieldsFragment = { __typename?: 'PaymentView', id: string, code: string, type: string, typeLabel: string, notRevenue: boolean, payerName?: string | null, payerLabel: string, amount: number, allocatedAmount: number, unallocatedAmount: number, method: string, bankAccount?: string | null, transferNote?: string | null, receivedBy?: string | null, note?: string | null, receivedAt: string, status: string, cancelReason?: string | null, cancelledAt?: string | null, customerCreditBalance?: number | null, attachmentCount: number, createdAt: string, customer?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, trip?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, allocations: Array<{ __typename?: 'AllocationView', id: string, paymentId: string, paymentCode: string, orderId: string, orderCode: string, amount: number, createdAt: string, receivedAt?: string | null, method?: string | null }>, codItems: Array<{ __typename?: 'CodRemittanceItemView', stopId: string, orderCode: string, stopName?: string | null, amount: number }> };

export type FinPaymentsQueryVariables = Exact<{
  filter?: InputMaybe<PaymentFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type FinPaymentsQuery = { __typename?: 'Query', payments: { __typename?: 'PaymentConnection', totalCount: number, totalAmount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, endCursor?: string | null, startCursor?: string | null }, nodes: Array<{ __typename?: 'PaymentView', id: string, code: string, type: string, typeLabel: string, notRevenue: boolean, payerName?: string | null, payerLabel: string, amount: number, allocatedAmount: number, unallocatedAmount: number, method: string, bankAccount?: string | null, transferNote?: string | null, receivedBy?: string | null, note?: string | null, receivedAt: string, status: string, cancelReason?: string | null, cancelledAt?: string | null, customerCreditBalance?: number | null, attachmentCount: number, createdAt: string, customer?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, trip?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, allocations: Array<{ __typename?: 'AllocationView', id: string, paymentId: string, paymentCode: string, orderId: string, orderCode: string, amount: number, createdAt: string, receivedAt?: string | null, method?: string | null }>, codItems: Array<{ __typename?: 'CodRemittanceItemView', stopId: string, orderCode: string, stopName?: string | null, amount: number }> }> } };

export type FinPaymentQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type FinPaymentQuery = { __typename?: 'Query', payment: { __typename?: 'PaymentView', id: string, code: string, type: string, typeLabel: string, notRevenue: boolean, payerName?: string | null, payerLabel: string, amount: number, allocatedAmount: number, unallocatedAmount: number, method: string, bankAccount?: string | null, transferNote?: string | null, receivedBy?: string | null, note?: string | null, receivedAt: string, status: string, cancelReason?: string | null, cancelledAt?: string | null, customerCreditBalance?: number | null, attachmentCount: number, createdAt: string, customer?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, trip?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, allocations: Array<{ __typename?: 'AllocationView', id: string, paymentId: string, paymentCode: string, orderId: string, orderCode: string, amount: number, createdAt: string, receivedAt?: string | null, method?: string | null }>, codItems: Array<{ __typename?: 'CodRemittanceItemView', stopId: string, orderCode: string, stopName?: string | null, amount: number }> } };

export type FinCreatePaymentMutationVariables = Exact<{
  input: PaymentInInput;
}>;


export type FinCreatePaymentMutation = { __typename?: 'Mutation', createPaymentIn: { __typename?: 'PaymentView', id: string, code: string, type: string, typeLabel: string, notRevenue: boolean, payerName?: string | null, payerLabel: string, amount: number, allocatedAmount: number, unallocatedAmount: number, method: string, bankAccount?: string | null, transferNote?: string | null, receivedBy?: string | null, note?: string | null, receivedAt: string, status: string, cancelReason?: string | null, cancelledAt?: string | null, customerCreditBalance?: number | null, attachmentCount: number, createdAt: string, customer?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, trip?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, allocations: Array<{ __typename?: 'AllocationView', id: string, paymentId: string, paymentCode: string, orderId: string, orderCode: string, amount: number, createdAt: string, receivedAt?: string | null, method?: string | null }>, codItems: Array<{ __typename?: 'CodRemittanceItemView', stopId: string, orderCode: string, stopName?: string | null, amount: number }> } };

export type FinUpdatePaymentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdatePaymentInInput;
  reason: Scalars['String']['input'];
}>;


export type FinUpdatePaymentMutation = { __typename?: 'Mutation', updatePaymentIn: { __typename?: 'PaymentView', id: string, code: string, type: string, typeLabel: string, notRevenue: boolean, payerName?: string | null, payerLabel: string, amount: number, allocatedAmount: number, unallocatedAmount: number, method: string, bankAccount?: string | null, transferNote?: string | null, receivedBy?: string | null, note?: string | null, receivedAt: string, status: string, cancelReason?: string | null, cancelledAt?: string | null, customerCreditBalance?: number | null, attachmentCount: number, createdAt: string, customer?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, trip?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, allocations: Array<{ __typename?: 'AllocationView', id: string, paymentId: string, paymentCode: string, orderId: string, orderCode: string, amount: number, createdAt: string, receivedAt?: string | null, method?: string | null }>, codItems: Array<{ __typename?: 'CodRemittanceItemView', stopId: string, orderCode: string, stopName?: string | null, amount: number }> } };

export type FinCancelPaymentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type FinCancelPaymentMutation = { __typename?: 'Mutation', cancelPaymentIn: { __typename?: 'PaymentView', id: string, code: string, type: string, typeLabel: string, notRevenue: boolean, payerName?: string | null, payerLabel: string, amount: number, allocatedAmount: number, unallocatedAmount: number, method: string, bankAccount?: string | null, transferNote?: string | null, receivedBy?: string | null, note?: string | null, receivedAt: string, status: string, cancelReason?: string | null, cancelledAt?: string | null, customerCreditBalance?: number | null, attachmentCount: number, createdAt: string, customer?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, trip?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, allocations: Array<{ __typename?: 'AllocationView', id: string, paymentId: string, paymentCode: string, orderId: string, orderCode: string, amount: number, createdAt: string, receivedAt?: string | null, method?: string | null }>, codItems: Array<{ __typename?: 'CodRemittanceItemView', stopId: string, orderCode: string, stopName?: string | null, amount: number }> } };

export type FinAllocatePaymentMutationVariables = Exact<{
  input: AllocatePaymentInput;
}>;


export type FinAllocatePaymentMutation = { __typename?: 'Mutation', allocatePayment: { __typename?: 'AllocatePaymentPayload', creditBalance: number, payment: { __typename?: 'PaymentView', id: string, code: string, type: string, typeLabel: string, notRevenue: boolean, payerName?: string | null, payerLabel: string, amount: number, allocatedAmount: number, unallocatedAmount: number, method: string, bankAccount?: string | null, transferNote?: string | null, receivedBy?: string | null, note?: string | null, receivedAt: string, status: string, cancelReason?: string | null, cancelledAt?: string | null, customerCreditBalance?: number | null, attachmentCount: number, createdAt: string, customer?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, trip?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, allocations: Array<{ __typename?: 'AllocationView', id: string, paymentId: string, paymentCode: string, orderId: string, orderCode: string, amount: number, createdAt: string, receivedAt?: string | null, method?: string | null }>, codItems: Array<{ __typename?: 'CodRemittanceItemView', stopId: string, orderCode: string, stopName?: string | null, amount: number }> } } };

export type FinUnallocatePaymentMutationVariables = Exact<{
  allocationId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type FinUnallocatePaymentMutation = { __typename?: 'Mutation', unallocatePayment: { __typename?: 'PaymentView', id: string, code: string, type: string, typeLabel: string, notRevenue: boolean, payerName?: string | null, payerLabel: string, amount: number, allocatedAmount: number, unallocatedAmount: number, method: string, bankAccount?: string | null, transferNote?: string | null, receivedBy?: string | null, note?: string | null, receivedAt: string, status: string, cancelReason?: string | null, cancelledAt?: string | null, customerCreditBalance?: number | null, attachmentCount: number, createdAt: string, customer?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, trip?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, allocations: Array<{ __typename?: 'AllocationView', id: string, paymentId: string, paymentCode: string, orderId: string, orderCode: string, amount: number, createdAt: string, receivedAt?: string | null, method?: string | null }>, codItems: Array<{ __typename?: 'CodRemittanceItemView', stopId: string, orderCode: string, stopName?: string | null, amount: number }> } };

export type FinCustomerDebtQueryVariables = Exact<{
  filter?: InputMaybe<CustomerDebtFilter>;
}>;


export type FinCustomerDebtQuery = { __typename?: 'Query', customerDebt: { __typename?: 'CustomerDebtResult', totals: { __typename?: 'DebtTotals', receivable: number, paid: number, remaining: number, overdueAmount: number, creditBalance: number, customerCount: number }, rows: Array<{ __typename?: 'CustomerDebtRow', phone?: string | null, receivable: number, paid: number, remaining: number, overdueAmount: number, maxOverdueDays: number, creditBalance: number, creditLimit?: number | null, overLimit: boolean, limitUsagePct?: number | null, openOrders: number, overdueOrders: number, customer: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null }, aging: { __typename?: 'AgingView', current: number, d1_15: number, d16_30: number, d31_60: number, d60p: number } }>, orders: Array<{ __typename?: 'CustomerDebtOrderRow', orderId: string, code: string, customerId: string, status: string, orderDate: string, routeSummary?: string | null, total: number, allocated: number, remaining: number, dueDate?: string | null, overdueDays: number, statementCode?: string | null }> } };

export type FinSupplierDebtQueryVariables = Exact<{
  filter?: InputMaybe<SupplierDebtFilter>;
}>;


export type FinSupplierDebtQuery = { __typename?: 'Query', supplierDebt: { __typename?: 'SupplierDebtReport', total: number, rows: Array<{ __typename?: 'SupplierDebtRow', unpaidTotal: number, oldestDays: number, unpaidCount: number, supplier: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null }, aging: { __typename?: 'SupplierDebtAgingView', d0_15: number, d16_30: number, d31_60: number, d60p: number }, expenses: Array<{ __typename?: 'ExpenseView', id: string, code: string, kind: string, kindLabel: string, isCost: boolean, categoryId?: string | null, categoryName?: string | null, amount: number, expenseDate: string, paidBy: string, reimbursable: boolean, paidStatus: string, paidAt?: string | null, paidMethod?: string | null, supplierId?: string | null, orderId?: string | null, tripId?: string | null, vehicleId?: string | null, driverId?: string | null, description?: string | null, note?: string | null, status: string, cancelReason?: string | null, cancelledAt?: string | null, attachmentCount: number, createdAt: string, supplier?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, order?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, trip?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, vehicle?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null }> }> } };

export type DriverCodItemFieldsFragment = { __typename?: 'DriverCodItemView', stopId: string, orderId: string, orderCode: string, customerName: string, tripId?: string | null, tripCode?: string | null, stopSequence: number, stopName?: string | null, address: string, codExpected: number, codActual: number, collectedAt: string, remitted: number, held: number, daysHeld: number };

export type FinDriverCodHeldQueryVariables = Exact<{
  filter?: InputMaybe<DriverCodHeldFilter>;
}>;


export type FinDriverCodHeldQuery = { __typename?: 'Query', driverCodHeld: { __typename?: 'DriverCodHeldReport', totalHeld: number, codWarningAmount: number, codWarningDays: number, rows: Array<{ __typename?: 'DriverCodHeldRow', phone?: string | null, codCollected: number, codRemitted: number, codHeld: number, oldestHeldAt?: string | null, daysHeld: number, overAmount: boolean, overDays: boolean, driver: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null }, items: Array<{ __typename?: 'DriverCodItemView', stopId: string, orderId: string, orderCode: string, customerName: string, tripId?: string | null, tripCode?: string | null, stopSequence: number, stopName?: string | null, address: string, codExpected: number, codActual: number, collectedAt: string, remitted: number, held: number, daysHeld: number }> }> } };

export type FinDriverLedgerQueryVariables = Exact<{
  driverId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type FinDriverLedgerQuery = { __typename?: 'Query', driverLedger: { __typename?: 'DriverLedgerView', codCollected: number, codRemitted: number, codHeld: number, companyOwesDriver: number, tripAdvanceOutstanding: number, salaryAdvanceUndeducted: number, driverOwesCompany: number, netBalance: number, oldestHeldAt?: string | null, daysHeld: number, overAmount: boolean, overDays: boolean, driver: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null }, entries: Array<{ __typename?: 'LedgerEntryView', date: string, kind: string, docCode?: string | null, refId?: string | null, description: string, driverOwes: number, companyOwes: number, runningBalance: number }>, codItems: Array<{ __typename?: 'DriverCodItemView', stopId: string, orderId: string, orderCode: string, customerName: string, tripId?: string | null, tripCode?: string | null, stopSequence: number, stopName?: string | null, address: string, codExpected: number, codActual: number, collectedAt: string, remitted: number, held: number, daysHeld: number }> } };

export type FinTripAdvancesQueryVariables = Exact<{
  filter?: InputMaybe<TripAdvanceFilter>;
}>;


export type FinTripAdvancesQuery = { __typename?: 'Query', tripAdvances: Array<{ __typename?: 'TripAdvanceView', tripId: string, tripCode: string, tripStatus: string, plannedStartAt: string, orderId: string, orderCode: string, advanceAmount: number, spentFromAdvance: number, actualCost: number, returned: number, reimbursed: number, difference: number, status: string, resolution?: string | null, resolvedAt?: string | null, reason?: string | null, note?: string | null, driver?: { __typename?: 'RefView', id: string, code?: string | null, name?: string | null } | null }> };

export type FinReconcileTripAdvanceMutationVariables = Exact<{
  input: ReconcileTripAdvanceInput;
}>;


export type FinReconcileTripAdvanceMutation = { __typename?: 'Mutation', reconcileTripAdvance: { __typename?: 'TripAdvanceView', tripId: string, status: string, resolution?: string | null, difference: number } };

export type FinLedgerQueryVariables = Exact<{
  filter?: InputMaybe<FinanceLedgerFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type FinLedgerQuery = { __typename?: 'Query', financeLedger: { __typename?: 'FinanceLedgerConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, endCursor?: string | null, startCursor?: string | null }, summary: { __typename?: 'FinanceLedgerSummary', cashIn: number, customerReceipts: number, codRemittances: number, advanceReturns: number, otherIn: number, cashOut: number, unpaidOut: number, driverPaidOut: number }, nodes: Array<{ __typename?: 'FinanceLedgerEntry', id: string, code: string, date: string, direction: string, type: string, typeLabel: string, counterpart: string, links: string, status: string, amount: number, notRevenue: boolean, cashMoved: boolean, createdByName?: string | null }> } };

export type FinPickersQueryVariables = Exact<{ [key: string]: never; }>;


export type FinPickersQuery = { __typename?: 'Query', driverOptions: Array<{ __typename?: 'DriverOption', id: string, code: string, name: string, phone: string, status: string, busy: boolean }>, vehicleOptions: Array<{ __typename?: 'VehicleOption', id: string, code: string, plate: string, status: string, typeName?: string | null }>, supplierOptions: Array<{ __typename?: 'SupplierOption', id: string, code: string, name: string, status: string, typeName?: string | null }> };

export type FinCustomerOptionsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type FinCustomerOptionsQuery = { __typename?: 'Query', customers: { __typename?: 'CustomerConnection', nodes: Array<{ __typename?: 'CustomerView', id: string, code: string, name: string, phone?: string | null, status: string, creditBalance: number }> } };

export type FinOrderOptionsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  customerId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type FinOrderOptionsQuery = { __typename?: 'Query', orders: { __typename?: 'OrderConnection', nodes: Array<{ __typename?: 'OrderView', id: string, code: string, status: string, routeSummary?: string | null, customer: { __typename?: 'OrderCustomerRef', id: string, name: string } }> } };

export type FinTripOptionsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  orderId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type FinTripOptionsQuery = { __typename?: 'Query', trips: { __typename?: 'TripConnection', nodes: Array<{ __typename?: 'TripView', id: string, code: string, status: string, orderId: string, order: { __typename?: 'TripOrderRef', id: string, code: string }, vehicle?: { __typename?: 'VehicleRef', id: string, plate: string } | null, driver?: { __typename?: 'DriverRef', id: string, name: string } | null }> } };

export type FinExpenseCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type FinExpenseCategoriesQuery = { __typename?: 'Query', catalogItems: Array<{ __typename?: 'CatalogItemView', id: string, code: string, name: string, appliesTo?: string | null, active: boolean }> };

export type OrdExportFileMutationVariables = Exact<{
  input: ExportFileInput;
}>;


export type OrdExportFileMutation = { __typename?: 'Mutation', exportFile: { __typename?: 'ExportedFile', url: string, fileName: string, rowCount: number } };

export type OrderListFieldsFragment = { __typename?: 'OrderView', id: string, code: string, status: string, orderDate: string, routeSummary?: string | null, freightAmount: number, addonTotal: number, totalAmount: number, paidAmount: number, remainingAmount: number, dueDate?: string | null, overdueDays: number, tripCount: number, warnings: Array<string>, customer: { __typename?: 'OrderCustomerRef', id: string, code: string, name: string, phone?: string | null } };

export type OrdOrdersQueryVariables = Exact<{
  filter?: InputMaybe<OrderFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
}>;


export type OrdOrdersQuery = { __typename?: 'Query', orders: { __typename?: 'OrderConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null }, nodes: Array<{ __typename?: 'OrderView', id: string, code: string, status: string, orderDate: string, routeSummary?: string | null, freightAmount: number, addonTotal: number, totalAmount: number, paidAmount: number, remainingAmount: number, dueDate?: string | null, overdueDays: number, tripCount: number, warnings: Array<string>, customer: { __typename?: 'OrderCustomerRef', id: string, code: string, name: string, phone?: string | null } }> } };

export type OrdOrderTotalsQueryVariables = Exact<{
  filter?: InputMaybe<OrderFilter>;
}>;


export type OrdOrderTotalsQuery = { __typename?: 'Query', orderTotals: { __typename?: 'OrderTotalsView', count: number, totalAmount: number, paidAmount: number, remainingAmount: number, overdueAmount: number } };

export type OrderTripFieldsFragment = { __typename?: 'TripView', id: string, code: string, status: string, plannedStartAt: string, plannedEndAt?: string | null, actualStartAt?: string | null, actualEndAt?: string | null, driverBonusAmount: number, isExternal: boolean, hasWarning: boolean, stopCount: number, routeSummary?: string | null, openIncidentCount: number, vehicle?: { __typename?: 'VehicleRef', id: string, plate: string, typeName?: string | null } | null, driver?: { __typename?: 'DriverRef', id: string, name: string, phone: string } | null, stops?: Array<{ __typename?: 'TripStopView', id: string, sequence: number }> | null };

export type OrdOrderDetailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type OrdOrderDetailQuery = { __typename?: 'Query', order: { __typename?: 'OrderView', id: string, code: string, status: string, orderDate: string, dueDate?: string | null, overdueDays: number, routeSummary?: string | null, note?: string | null, internalNote?: string | null, freightAmount: number, addonTotal: number, totalAmount: number, paidAmount: number, remainingAmount: number, priceLocked: boolean, bookingId?: string | null, cancelReason?: string | null, cancelledAt?: string | null, confirmedAt?: string | null, startedAt?: string | null, completedAt?: string | null, createdAt: string, updatedAt: string, tripCount: number, attachmentCount?: number | null, warnings: Array<string>, customerWarnings?: Array<string> | null, requiredVehicleTypeId?: string | null, requiredVehicleTypeName?: string | null, requiredCapacityTons?: number | null, customer: { __typename?: 'OrderCustomerRef', id: string, code: string, name: string, phone?: string | null }, stops?: Array<{ __typename?: 'OrderStopView', id: string, type: string, sequence: number, locationId?: string | null, locationName?: string | null, address: string, province?: string | null, lat?: number | null, lng?: number | null, contactName?: string | null, contactPhone?: string | null, plannedAt?: string | null, codExpected?: number | null, codActual?: number | null, codCollectedAt?: string | null, status: string, arrivedAt?: string | null, completedAt?: string | null, skipReason?: string | null, note?: string | null, podCount: number, tripIds: Array<string>, tripCodes: Array<string> }> | null, cargoLines?: Array<{ __typename?: 'CargoLineView', id: string, name: string, cargoTypeId?: string | null, cargoTypeName?: string | null, weightKg?: number | null, volumeM3?: number | null, quantity?: number | null, packagingUnit?: string | null, properties: Array<string>, declaredValue?: number | null, pickupStopId?: string | null, dropoffStopId?: string | null, note?: string | null }> | null, addons?: Array<{ __typename?: 'OrderAddonView', id: string, serviceId?: string | null, name: string, amount: number, note?: string | null }> | null, trips?: Array<{ __typename?: 'TripView', id: string, code: string, status: string, plannedStartAt: string, plannedEndAt?: string | null, actualStartAt?: string | null, actualEndAt?: string | null, driverBonusAmount: number, isExternal: boolean, hasWarning: boolean, stopCount: number, routeSummary?: string | null, openIncidentCount: number, vehicle?: { __typename?: 'VehicleRef', id: string, plate: string, typeName?: string | null } | null, driver?: { __typename?: 'DriverRef', id: string, name: string, phone: string } | null, stops?: Array<{ __typename?: 'TripStopView', id: string, sequence: number }> | null }> | null, financeSummary?: { __typename?: 'OrderFinanceSummary', freight: number, addonTotal: number, totalAmount: number, receivable: number, paidAmount: number, remainingAmount: number, overdueDays: number, expenseTotal: number, outsourcedCost: number, tripCost: number, otherCost: number, profit: number, margin?: number | null, provisional: boolean, driverBonusTotal: number, allocations: Array<{ __typename?: 'OrderAllocationView', id: string, paymentId: string, paymentCode: string, receivedAt: string, amount: number }>, expenses: Array<{ __typename?: 'OrderExpenseView', id: string, code: string, kind: string, categoryName?: string | null, description?: string | null, amount: number, paidBy: string, paidStatus: string, status: string, isCost: boolean, tripCode?: string | null, supplierName?: string | null, expenseDate: string }> } | null, incidents?: Array<{ __typename?: 'TripIncidentRef', id: string, code: string, title: string, severity: string, status: string, createdAt: string }> | null, externalTransports?: Array<{ __typename?: 'ExternalTransportView', id: string, tripId?: string | null, tripCode?: string | null, supplierId?: string | null, supplierName?: string | null, vehiclePlate?: string | null, driverName?: string | null, driverPhone?: string | null, agreedAmount?: number | null, note?: string | null }> | null } };

export type OrdOrderStopQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type OrdOrderStopQuery = { __typename?: 'Query', orderStop: { __typename?: 'OrderStopView', id: string, orderId: string, orderCode?: string | null, type: string, sequence: number, locationName?: string | null, address: string, contactName?: string | null, contactPhone?: string | null, plannedAt?: string | null, arrivedAt?: string | null, completedAt?: string | null, codExpected?: number | null, codActual?: number | null, codCollectedAt?: string | null, codNote?: string | null, status: string, skipReason?: string | null, note?: string | null, podCount: number, tripIds: Array<string>, tripCodes: Array<string>, podAttachments?: Array<{ __typename?: 'AttachmentView', id: string, entityType: string, entityId: string, category: string, fileName: string, mimeType: string, size: number, status: string, uploadedByType: string, uploadedByName?: string | null, capturedAt?: string | null, note?: string | null, sharedWithCustomer: boolean, createdAt: string, url?: string | null }> | null, statusHistory?: Array<{ __typename?: 'TimelineEntry', id: string, createdAt: string, summary: string, actorName?: string | null, reason?: string | null, fromStatus?: string | null, toStatus?: string | null }> | null } };

export type OrdCreateOrderMutationVariables = Exact<{
  input: CreateOrderInput;
}>;


export type OrdCreateOrderMutation = { __typename?: 'Mutation', createOrder: { __typename?: 'OrderPayload', warnings: Array<string>, order: { __typename?: 'OrderView', id: string, code: string, status: string }, trip?: { __typename?: 'TripView', id: string, code: string } | null } };

export type OrdUpdateOrderMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateOrderInput;
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type OrdUpdateOrderMutation = { __typename?: 'Mutation', updateOrder: { __typename?: 'OrderView', id: string, code: string, status: string } };

export type OrdUpdateOrderPricingMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: OrderPricingInput;
}>;


export type OrdUpdateOrderPricingMutation = { __typename?: 'Mutation', updateOrderPricing: { __typename?: 'OrderView', id: string, freightAmount: number, totalAmount: number } };

export type OrdUpdateOrderStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
}>;


export type OrdUpdateOrderStatusMutation = { __typename?: 'Mutation', updateOrderStatus: { __typename?: 'OrderView', id: string, status: string } };

export type OrdCancelOrderMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type OrdCancelOrderMutation = { __typename?: 'Mutation', cancelOrder: { __typename?: 'OrderView', id: string, status: string } };

export type OrdCreateOrderStopMutationVariables = Exact<{
  orderId: Scalars['ID']['input'];
  input: OrderStopInput;
}>;


export type OrdCreateOrderStopMutation = { __typename?: 'Mutation', createOrderStop: { __typename?: 'OrderView', id: string } };

export type OrdUpdateOrderStopMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: OrderStopInput;
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type OrdUpdateOrderStopMutation = { __typename?: 'Mutation', updateOrderStop: { __typename?: 'OrderStopView', id: string } };

export type OrdReorderOrderStopsMutationVariables = Exact<{
  orderId: Scalars['ID']['input'];
  stopIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type OrdReorderOrderStopsMutation = { __typename?: 'Mutation', reorderOrderStops: { __typename?: 'OrderView', id: string } };

export type OrdRemoveOrderStopMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type OrdRemoveOrderStopMutation = { __typename?: 'Mutation', removeOrderStop: { __typename?: 'OrderView', id: string } };

export type OrdUpsertCargoLineMutationVariables = Exact<{
  orderId: Scalars['ID']['input'];
  input: CargoLineInput;
}>;


export type OrdUpsertCargoLineMutation = { __typename?: 'Mutation', upsertCargoLine: { __typename?: 'OrderView', id: string } };

export type OrdDeleteCargoLineMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type OrdDeleteCargoLineMutation = { __typename?: 'Mutation', deleteCargoLine: { __typename?: 'OrderView', id: string } };

export type OrdUpdateStopStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  tripId?: InputMaybe<Scalars['ID']['input']>;
  actualAt?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type OrdUpdateStopStatusMutation = { __typename?: 'Mutation', updateStopStatus: { __typename?: 'OrderStopStatusView', id: string, status: string, orderStatus: string, warnings: Array<string> } };

export type OrdUpdateStopCodMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  amount: Scalars['Money']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
}>;


export type OrdUpdateStopCodMutation = { __typename?: 'Mutation', updateStopCodActual: { __typename?: 'OrderStopStatusView', id: string, codActual?: number | null, warnings: Array<string> } };

export type OrdCustomerPickQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type OrdCustomerPickQuery = { __typename?: 'Query', customers: { __typename?: 'CustomerConnection', nodes: Array<{ __typename?: 'CustomerView', id: string, code: string, name: string, phone?: string | null, status: string, defaultDebtDays?: number | null, creditLimit?: number | null, debtSummary: { __typename?: 'CustomerDebtSummaryView', remaining: number, overdueOrders: number } }> } };

export type OrdCustomerLocationsQueryVariables = Exact<{
  customerId: Scalars['ID']['input'];
}>;


export type OrdCustomerLocationsQuery = { __typename?: 'Query', customerLocations: Array<{ __typename?: 'CustomerLocationView', id: string, name: string, usage: string, address: string, province?: string | null, lat?: number | null, lng?: number | null, contactName?: string | null, contactPhone?: string | null, note?: string | null, isDefault: boolean }> };

export type OrdCreditCheckQueryVariables = Exact<{
  customerId: Scalars['ID']['input'];
  additionalAmount?: InputMaybe<Scalars['Money']['input']>;
}>;


export type OrdCreditCheckQuery = { __typename?: 'Query', customerCreditCheck: { __typename?: 'CreditLimitCheckView', overLimit: boolean, currentDebt: number, projectedDebt: number, creditLimit?: number | null, overdueOrders: number, warnings: Array<string> } };

export type OrdSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type OrdSettingsQuery = { __typename?: 'Query', merchantSettings: { __typename?: 'MerchantSettingsView', defaultDebtDays: number, defaultTripHours: number, nearOverlapMinutes: number } };

export type OrdOrderFinanceQueryVariables = Exact<{
  orderId: Scalars['ID']['input'];
}>;


export type OrdOrderFinanceQuery = { __typename?: 'Query', orderFinance: { __typename?: 'OrderFinanceView', orderId: string, revenue: number, freightAmount: number, addonTotal: number, receivable: number, paidAmount: number, remainingAmount: number, cost: number, tripCost: number, outsourcedCost: number, otherCost: number, profit: number, margin?: number | null, provisional: boolean } };

export type OrdRenderDocumentMutationVariables = Exact<{
  input: RenderDocumentInput;
}>;


export type OrdRenderDocumentMutation = { __typename?: 'Mutation', renderDocument: { __typename?: 'RenderedDocument', template: string, fileName: string, url?: string | null, html?: string | null, attachmentId?: string | null } };

export type BookingFieldsFragment = { __typename?: 'BookingView', id: string, code: string, status: string, cargoName: string, weightTon?: number | null, packages?: number | null, vehicleTypeHint?: string | null, fragile: boolean, loadingAtPickup: boolean, loadingAtDrop: boolean, pickupFrom?: string | null, deliverBefore?: string | null, flexibility?: string | null, note?: string | null, contactName: string, contactPhone: string, rejectReason?: string | null, cancelReason?: string | null, orderId?: string | null, orderCode?: string | null, customerId?: string | null, customerName?: string | null, accountName?: string | null, accountEmail?: string | null, createdAt: string, stops: Array<{ __typename?: 'BookingStopView', type: string, address: string, locationName?: string | null, contactName?: string | null, contactPhone?: string | null, note?: string | null }> };

export type OrdBookingsQueryVariables = Exact<{
  filter?: InputMaybe<BookingFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type OrdBookingsQuery = { __typename?: 'Query', bookings: { __typename?: 'BookingConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null }, nodes: Array<{ __typename?: 'BookingView', id: string, code: string, status: string, cargoName: string, weightTon?: number | null, packages?: number | null, vehicleTypeHint?: string | null, fragile: boolean, loadingAtPickup: boolean, loadingAtDrop: boolean, pickupFrom?: string | null, deliverBefore?: string | null, flexibility?: string | null, note?: string | null, contactName: string, contactPhone: string, rejectReason?: string | null, cancelReason?: string | null, orderId?: string | null, orderCode?: string | null, customerId?: string | null, customerName?: string | null, accountName?: string | null, accountEmail?: string | null, createdAt: string, stops: Array<{ __typename?: 'BookingStopView', type: string, address: string, locationName?: string | null, contactName?: string | null, contactPhone?: string | null, note?: string | null }> }> } };

export type OrdBookingQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type OrdBookingQuery = { __typename?: 'Query', booking: { __typename?: 'BookingView', id: string, code: string, status: string, cargoName: string, weightTon?: number | null, packages?: number | null, vehicleTypeHint?: string | null, fragile: boolean, loadingAtPickup: boolean, loadingAtDrop: boolean, pickupFrom?: string | null, deliverBefore?: string | null, flexibility?: string | null, note?: string | null, contactName: string, contactPhone: string, rejectReason?: string | null, cancelReason?: string | null, orderId?: string | null, orderCode?: string | null, customerId?: string | null, customerName?: string | null, accountName?: string | null, accountEmail?: string | null, createdAt: string, notes: Array<{ __typename?: 'BookingNoteView', id: string, authorType: string, authorName?: string | null, body: string, createdAt: string }>, statusHistory: Array<{ __typename?: 'BookingStatusEntry', fromStatus?: string | null, toStatus: string, reason?: string | null, actorName?: string | null, changedAt: string }>, stops: Array<{ __typename?: 'BookingStopView', type: string, address: string, locationName?: string | null, contactName?: string | null, contactPhone?: string | null, note?: string | null }> } };

export type OrdAcceptBookingMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  customerId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type OrdAcceptBookingMutation = { __typename?: 'Mutation', acceptBooking: { __typename?: 'BookingView', id: string, status: string } };

export type OrdRejectBookingMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type OrdRejectBookingMutation = { __typename?: 'Mutation', rejectBooking: { __typename?: 'BookingView', id: string, status: string } };

export type OrdAddBookingNoteMutationVariables = Exact<{
  bookingId: Scalars['ID']['input'];
  body: Scalars['String']['input'];
}>;


export type OrdAddBookingNoteMutation = { __typename?: 'Mutation', addBookingNote: { __typename?: 'BookingView', id: string } };

export type OrdOrderAttachmentsQueryVariables = Exact<{
  orderId: Scalars['ID']['input'];
}>;


export type OrdOrderAttachmentsQuery = { __typename?: 'Query', orderAttachments: Array<{ __typename?: 'AttachmentView', id: string, entityType: string, entityId: string, category: string, fileName: string, mimeType: string, size: number, status: string, uploadedByType: string, uploadedByName?: string | null, capturedAt?: string | null, note?: string | null, sharedWithCustomer: boolean, createdAt: string, url?: string | null }> };

export type PrTotalsFieldsFragment = { __typename?: 'PayrollTotalsView', driverCount: number, salary: number, bonus: number, advance: number, deduction: number, adjustment: number, net: number };

export type PrLineFieldsFragment = { __typename?: 'PayrollLineView', id?: string | null, payrollId: string, payrollCode?: string | null, payrollStatus?: string | null, periodLabel?: string | null, driverId: string, driverCode?: string | null, driverName: string, baseSalary: number, salaryEffectiveFrom?: string | null, bonusTotal: number, advanceTotal: number, deductionTotal: number, adjustmentTotal: number, netAmount: number, anomalies: Array<string>, note?: string | null };

export type PrItemFieldsFragment = { __typename?: 'PayrollItemView', id?: string | null, type: string, amount: number, description: string, sourceRef?: string | null, tripId?: string | null, expenseId?: string | null, itemDate?: string | null, reasonId?: string | null, reasonName?: string | null, note?: string | null, createdByName?: string | null };

export type PrPayrollFieldsFragment = { __typename?: 'PayrollView', id: string, code: string, status: string, periodLabel: string, periodFrom: string, periodTo: string, note?: string | null, anomalyCount: number, createdAt: string, createdByName?: string | null, submittedAt?: string | null, submittedByName?: string | null, approvedAt?: string | null, approvedByName?: string | null, approvalNote?: string | null, returnedAt?: string | null, returnReason?: string | null, paidAt?: string | null, paidByName?: string | null, cancelledAt?: string | null, cancelReason?: string | null, totals: { __typename?: 'PayrollTotalsView', driverCount: number, salary: number, bonus: number, advance: number, deduction: number, adjustment: number, net: number } };

export type PrPayrollsQueryVariables = Exact<{
  filter?: InputMaybe<PayrollFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type PrPayrollsQuery = { __typename?: 'Query', payrolls: { __typename?: 'PayrollConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null }, nodes: Array<{ __typename?: 'PayrollView', id: string, code: string, status: string, periodLabel: string, periodFrom: string, periodTo: string, note?: string | null, anomalyCount: number, createdAt: string, createdByName?: string | null, submittedAt?: string | null, submittedByName?: string | null, approvedAt?: string | null, approvedByName?: string | null, approvalNote?: string | null, returnedAt?: string | null, returnReason?: string | null, paidAt?: string | null, paidByName?: string | null, cancelledAt?: string | null, cancelReason?: string | null, totals: { __typename?: 'PayrollTotalsView', driverCount: number, salary: number, bonus: number, advance: number, deduction: number, adjustment: number, net: number } }> } };

export type PrPayrollQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type PrPayrollQuery = { __typename?: 'Query', payroll: { __typename?: 'PayrollView', previousCode?: string | null, id: string, code: string, status: string, periodLabel: string, periodFrom: string, periodTo: string, note?: string | null, anomalyCount: number, createdAt: string, createdByName?: string | null, submittedAt?: string | null, submittedByName?: string | null, approvedAt?: string | null, approvedByName?: string | null, approvalNote?: string | null, returnedAt?: string | null, returnReason?: string | null, paidAt?: string | null, paidByName?: string | null, cancelledAt?: string | null, cancelReason?: string | null, previousTotals?: { __typename?: 'PayrollTotalsView', driverCount: number, salary: number, bonus: number, advance: number, deduction: number, adjustment: number, net: number } | null, changes?: Array<{ __typename?: 'PayrollChangeView', kind: string, message: string, driverName?: string | null, amount?: number | null }> | null, lines?: Array<{ __typename?: 'PayrollLineView', id?: string | null, payrollId: string, payrollCode?: string | null, payrollStatus?: string | null, periodLabel?: string | null, driverId: string, driverCode?: string | null, driverName: string, baseSalary: number, salaryEffectiveFrom?: string | null, bonusTotal: number, advanceTotal: number, deductionTotal: number, adjustmentTotal: number, netAmount: number, anomalies: Array<string>, note?: string | null }> | null, totals: { __typename?: 'PayrollTotalsView', driverCount: number, salary: number, bonus: number, advance: number, deduction: number, adjustment: number, net: number } } };

export type PrPayrollLineQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type PrPayrollLineQuery = { __typename?: 'Query', payrollLine: { __typename?: 'PayrollLineView', id?: string | null, payrollId: string, payrollCode?: string | null, payrollStatus?: string | null, periodLabel?: string | null, driverId: string, driverCode?: string | null, driverName: string, baseSalary: number, salaryEffectiveFrom?: string | null, bonusTotal: number, advanceTotal: number, deductionTotal: number, adjustmentTotal: number, netAmount: number, anomalies: Array<string>, note?: string | null, items: Array<{ __typename?: 'PayrollItemView', id?: string | null, type: string, amount: number, description: string, sourceRef?: string | null, tripId?: string | null, expenseId?: string | null, itemDate?: string | null, reasonId?: string | null, reasonName?: string | null, note?: string | null, createdByName?: string | null }>, excluded?: Array<{ __typename?: 'PayrollExcludedView', kind: string, code: string, date?: string | null, description: string, amount: number, reason: string }> | null } };

export type PrDriverPayrollLinesQueryVariables = Exact<{
  driverId: Scalars['ID']['input'];
}>;


export type PrDriverPayrollLinesQuery = { __typename?: 'Query', driverPayrollLines: Array<{ __typename?: 'PayrollLineView', id?: string | null, payrollId: string, payrollCode?: string | null, payrollStatus?: string | null, periodLabel?: string | null, driverId: string, driverCode?: string | null, driverName: string, baseSalary: number, salaryEffectiveFrom?: string | null, bonusTotal: number, advanceTotal: number, deductionTotal: number, adjustmentTotal: number, netAmount: number, anomalies: Array<string>, note?: string | null }> };

export type PrPreviewQueryVariables = Exact<{
  input: GeneratePayrollInput;
}>;


export type PrPreviewQuery = { __typename?: 'Query', payrollPreview: { __typename?: 'PayrollPreviewView', periodLabel: string, periodFrom: string, periodTo: string, conflictPayrollCode?: string | null, warnings: Array<string>, totals: { __typename?: 'PayrollTotalsView', driverCount: number, salary: number, bonus: number, advance: number, deduction: number, adjustment: number, net: number }, lines: Array<{ __typename?: 'PayrollLineView', id?: string | null, payrollId: string, payrollCode?: string | null, payrollStatus?: string | null, periodLabel?: string | null, driverId: string, driverCode?: string | null, driverName: string, baseSalary: number, salaryEffectiveFrom?: string | null, bonusTotal: number, advanceTotal: number, deductionTotal: number, adjustmentTotal: number, netAmount: number, anomalies: Array<string>, note?: string | null, items: Array<{ __typename?: 'PayrollItemView', id?: string | null, type: string, amount: number, description: string, sourceRef?: string | null, tripId?: string | null, expenseId?: string | null, itemDate?: string | null, reasonId?: string | null, reasonName?: string | null, note?: string | null, createdByName?: string | null }> }> } };

export type PrGenerateMutationVariables = Exact<{
  input: GeneratePayrollInput;
}>;


export type PrGenerateMutation = { __typename?: 'Mutation', generatePayroll: { __typename?: 'PayrollView', id: string, code: string } };

export type PrAddItemMutationVariables = Exact<{
  input: PayrollItemInput;
}>;


export type PrAddItemMutation = { __typename?: 'Mutation', addPayrollItem: { __typename?: 'PayrollLineView', id?: string | null, netAmount: number } };

export type PrRemoveItemMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type PrRemoveItemMutation = { __typename?: 'Mutation', removePayrollItem: { __typename?: 'PayrollLineView', id?: string | null, netAmount: number } };

export type PrSubmitMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type PrSubmitMutation = { __typename?: 'Mutation', submitPayroll: { __typename?: 'PayrollView', id: string, status: string } };

export type PrApproveMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
}>;


export type PrApproveMutation = { __typename?: 'Mutation', approvePayroll: { __typename?: 'PayrollView', id: string, status: string } };

export type PrReturnMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type PrReturnMutation = { __typename?: 'Mutation', returnPayroll: { __typename?: 'PayrollView', id: string, status: string } };

export type PrMarkPaidMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  paidAt?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type PrMarkPaidMutation = { __typename?: 'Mutation', markPayrollPaid: { __typename?: 'PayrollView', id: string, status: string } };

export type PrCancelMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type PrCancelMutation = { __typename?: 'Mutation', cancelPayroll: { __typename?: 'PayrollView', id: string, status: string } };

export type PrDriverOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type PrDriverOptionsQuery = { __typename?: 'Query', driverOptions: Array<{ __typename?: 'DriverOption', id: string, code: string, name: string, status: string }> };

export type RptSummaryQueryVariables = Exact<{
  filter?: InputMaybe<ReportFilter>;
}>;


export type RptSummaryQuery = { __typename?: 'Query', reportSummary: Array<{ __typename?: 'ReportSummaryItem', key: string, group: string, title: string, headline: string, value?: number | null, route: string }> };

export type RptProfitRowFieldsFragment = { __typename?: 'ProfitRow', key: string, label: string, sublabel?: string | null, entityId?: string | null, status?: string | null, freight: number, addons: number, revenue: number, tripCost: number, outsourcedCost: number, otherCost: number, cost: number, profit: number, margin?: number | null, orderCount: number, isProvisional: boolean };

export type RptProfitQueryVariables = Exact<{
  filter?: InputMaybe<ReportFilter>;
}>;


export type RptProfitQuery = { __typename?: 'Query', reportProfit: { __typename?: 'ProfitReport', dateFrom: string, dateTo: string, groupBy: string, notes: Array<string>, rows: Array<{ __typename?: 'ProfitRow', key: string, label: string, sublabel?: string | null, entityId?: string | null, status?: string | null, freight: number, addons: number, revenue: number, tripCost: number, outsourcedCost: number, otherCost: number, cost: number, profit: number, margin?: number | null, orderCount: number, isProvisional: boolean }>, totals: { __typename?: 'ProfitRow', key: string, label: string, sublabel?: string | null, entityId?: string | null, status?: string | null, freight: number, addons: number, revenue: number, tripCost: number, outsourcedCost: number, otherCost: number, cost: number, profit: number, margin?: number | null, orderCount: number, isProvisional: boolean } } };

export type RptVehiclesQueryVariables = Exact<{
  filter?: InputMaybe<ReportFilter>;
}>;


export type RptVehiclesQuery = { __typename?: 'Query', reportVehicles: Array<{ __typename?: 'VehicleReportRow', vehicleId: string, plate: string, type?: string | null, status: string, tripCount: number, activeDays: number, utilization: number, revenue: number, vehicleCost: number, tripCost: number, grossProfit: number }> };

export type RptDriversQueryVariables = Exact<{
  filter?: InputMaybe<ReportFilter>;
}>;


export type RptDriversQuery = { __typename?: 'Query', reportDrivers: Array<{ __typename?: 'DriverReportRow', driverId: string, code: string, name: string, status: string, completedTrips: number, onTimeRate?: number | null, revenue: number, bonusTotal: number, codHeld: number, incidents: number }> };

export type RptAgingFieldsFragment = { __typename?: 'AgingReportView', current: number, d1_15: number, d16_30: number, d31_60: number, d60p: number };

export type RptCustomerDebtQueryVariables = Exact<{
  filter?: InputMaybe<ReportFilter>;
}>;


export type RptCustomerDebtQuery = { __typename?: 'Query', reportCustomerDebt: { __typename?: 'CustomerDebtReport', totalDebt: number, totalOverdue: number, totalCredit: number, aging: { __typename?: 'AgingReportView', current: number, d1_15: number, d16_30: number, d31_60: number, d60p: number }, rows: Array<{ __typename?: 'CustomerDebtReportRow', customerId: string, code: string, name: string, creditLimit?: number | null, receivable: number, paid: number, totalDebt: number, overdue: number, maxOverdueDays: number, creditBalance: number, openOrders: number, warnings: Array<string>, aging: { __typename?: 'AgingReportView', current: number, d1_15: number, d16_30: number, d31_60: number, d60p: number } }> } };

export type RptCodQueryVariables = Exact<{
  filter?: InputMaybe<ReportFilter>;
}>;


export type RptCodQuery = { __typename?: 'Query', reportCodHeld: { __typename?: 'CodHeldReport', totalHeld: number, thresholdAmount: number, thresholdDays: number, overThresholdCount: number, rows: Array<{ __typename?: 'CodHeldReportRow', driverId: string, code: string, name: string, phone: string, codCollected: number, codRemitted: number, codHeld: number, heldDays: number, oldestHeldAt?: string | null, overAmount: boolean, overDays: boolean }> } };

export type RptPayrollQueryVariables = Exact<{
  filter?: InputMaybe<ReportFilter>;
}>;


export type RptPayrollQuery = { __typename?: 'Query', reportPayroll: Array<{ __typename?: 'PayrollReportRow', payrollId: string, payrollCode: string, period: string, status: string, driverCount: number, salary: number, bonus: number, advance: number, deduction: number, adjustment: number, net: number, paidAt?: string | null, byDriver: Array<{ __typename?: 'PayrollReportDriverRow', driverId: string, driverName: string, salary: number, bonus: number, advance: number, deduction: number, adjustment: number, net: number }> }> };

export type MerchantProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type MerchantProfileQuery = { __typename?: 'Query', merchantProfile: { __typename?: 'MerchantProfile', id: string, code: string, name: string, legalName?: string | null, taxCode?: string | null, businessType?: string | null, address?: string | null, province?: string | null, district?: string | null, yardName?: string | null, representativeName?: string | null, representativeTitle?: string | null, contactName?: string | null, phone?: string | null, dispatchHotline?: string | null, email?: string | null, intro?: string | null, logoAttachmentId?: string | null, logoUrl?: string | null, publicProfile: boolean, serviceAreas: Array<string>, services: Array<string>, updatedAt: string } };

export type UpdateMerchantProfileMutationVariables = Exact<{
  input: MerchantProfileInput;
}>;


export type UpdateMerchantProfileMutation = { __typename?: 'Mutation', updateMerchantProfile: { __typename?: 'MerchantProfile', id: string, name: string, logoAttachmentId?: string | null, logoUrl?: string | null, updatedAt: string } };

export type MerchantSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type MerchantSettingsQuery = { __typename?: 'Query', merchantSettings: { __typename?: 'MerchantSettingsView', payrollPeriodType: string, payrollStartDay: number, nearOverlapMinutes: number, defaultTripHours: number, overlapWarnVehicle: boolean, overlapWarnDriver: boolean, codWarningAmount: number, codWarningDays: number, codDashboardAlert: boolean, defaultDebtDays: number, defaultCreditLimit?: number | null, warnOverLimit: boolean, warnOverdue: boolean, gpsRetentionDays: number, updatedAt: string } };

export type UpdateMerchantSettingsMutationVariables = Exact<{
  input: MerchantSettingsInput;
}>;


export type UpdateMerchantSettingsMutation = { __typename?: 'Mutation', updateMerchantSettings: { __typename?: 'MerchantSettingsView', payrollPeriodType: string, payrollStartDay: number, nearOverlapMinutes: number, defaultTripHours: number, overlapWarnVehicle: boolean, overlapWarnDriver: boolean, codWarningAmount: number, codWarningDays: number, codDashboardAlert: boolean, defaultDebtDays: number, defaultCreditLimit?: number | null, warnOverLimit: boolean, warnOverdue: boolean, gpsRetentionDays: number, updatedAt: string } };

export type NumberSequencesQueryVariables = Exact<{ [key: string]: never; }>;


export type NumberSequencesQuery = { __typename?: 'Query', numberSequences: Array<{ __typename?: 'NumberSequenceView', docType: string, label: string, prefix: string, separator: string, datePart: string, digits: number, resetPeriod: string, pattern: string, nextValue: string, issuedThisPeriod: number }> };

export type UpdateNumberFormatMutationVariables = Exact<{
  docType: DocType;
  input: NumberFormatInput;
}>;


export type UpdateNumberFormatMutation = { __typename?: 'Mutation', updateNumberSequenceFormat: { __typename?: 'NumberSequenceView', docType: string, prefix: string, separator: string, datePart: string, digits: number, resetPeriod: string, pattern: string, nextValue: string, issuedThisPeriod: number } };

export type MerchantUserFieldsFragment = { __typename?: 'MerchantUserView', id: string, email: string, name: string, phone?: string | null, title?: string | null, role: string, extraPermissions: Array<string>, effectivePermissions: Array<string>, status: string, note?: string | null, invitedByName?: string | null, invitedAt: string, joinedAt?: string | null, lastAccessAt?: string | null, isSelf: boolean, appLogin: { __typename?: 'StaffAppLoginView', phone?: string | null, hasPassword: boolean, mustChangePassword: boolean, lastLoginAt?: string | null, sharedWithOtherMerchants: boolean } };

export type ResetMerchantUserAppPasswordMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
}>;


export type ResetMerchantUserAppPasswordMutation = { __typename?: 'Mutation', resetMerchantUserAppPassword: { __typename?: 'StaffAppCredentials', phone: string, tempPassword: string } };

export type DisableMerchantUserAppLoginMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DisableMerchantUserAppLoginMutation = { __typename?: 'Mutation', disableMerchantUserAppLogin: { __typename?: 'MerchantUserView', id: string, email: string, name: string, phone?: string | null, title?: string | null, role: string, extraPermissions: Array<string>, effectivePermissions: Array<string>, status: string, note?: string | null, invitedByName?: string | null, invitedAt: string, joinedAt?: string | null, lastAccessAt?: string | null, isSelf: boolean, appLogin: { __typename?: 'StaffAppLoginView', phone?: string | null, hasPassword: boolean, mustChangePassword: boolean, lastLoginAt?: string | null, sharedWithOtherMerchants: boolean } } };

export type MerchantUsersQueryVariables = Exact<{
  filter?: InputMaybe<MerchantUserFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type MerchantUsersQuery = { __typename?: 'Query', merchantUsers: { __typename?: 'MerchantUserConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, endCursor?: string | null, startCursor?: string | null }, nodes: Array<{ __typename?: 'MerchantUserView', id: string, email: string, name: string, phone?: string | null, title?: string | null, role: string, extraPermissions: Array<string>, effectivePermissions: Array<string>, status: string, note?: string | null, invitedByName?: string | null, invitedAt: string, joinedAt?: string | null, lastAccessAt?: string | null, isSelf: boolean, appLogin: { __typename?: 'StaffAppLoginView', phone?: string | null, hasPassword: boolean, mustChangePassword: boolean, lastLoginAt?: string | null, sharedWithOtherMerchants: boolean } }> } };

export type MerchantUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MerchantUserQuery = { __typename?: 'Query', merchantUser: { __typename?: 'MerchantUserView', id: string, email: string, name: string, phone?: string | null, title?: string | null, role: string, extraPermissions: Array<string>, effectivePermissions: Array<string>, status: string, note?: string | null, invitedByName?: string | null, invitedAt: string, joinedAt?: string | null, lastAccessAt?: string | null, isSelf: boolean, appLogin: { __typename?: 'StaffAppLoginView', phone?: string | null, hasPassword: boolean, mustChangePassword: boolean, lastLoginAt?: string | null, sharedWithOtherMerchants: boolean } }, activityByActor: Array<{ __typename?: 'TimelineEntry', id: string, createdAt: string, entityType: string, category: string, action: string, summary: string, actorName?: string | null, reason?: string | null, before?: unknown | null, after?: unknown | null, sensitive: boolean }> };

export type InviteMerchantUserMutationVariables = Exact<{
  input: InviteMerchantUserInput;
}>;


export type InviteMerchantUserMutation = { __typename?: 'Mutation', inviteMerchantUser: { __typename?: 'MerchantUserView', id: string, email: string, name: string, phone?: string | null, title?: string | null, role: string, extraPermissions: Array<string>, effectivePermissions: Array<string>, status: string, note?: string | null, invitedByName?: string | null, invitedAt: string, joinedAt?: string | null, lastAccessAt?: string | null, isSelf: boolean, appLogin: { __typename?: 'StaffAppLoginView', phone?: string | null, hasPassword: boolean, mustChangePassword: boolean, lastLoginAt?: string | null, sharedWithOtherMerchants: boolean } } };

export type UpdateMerchantUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateMerchantUserInput;
}>;


export type UpdateMerchantUserMutation = { __typename?: 'Mutation', updateMerchantUser: { __typename?: 'MerchantUserView', id: string, email: string, name: string, phone?: string | null, title?: string | null, role: string, extraPermissions: Array<string>, effectivePermissions: Array<string>, status: string, note?: string | null, invitedByName?: string | null, invitedAt: string, joinedAt?: string | null, lastAccessAt?: string | null, isSelf: boolean, appLogin: { __typename?: 'StaffAppLoginView', phone?: string | null, hasPassword: boolean, mustChangePassword: boolean, lastLoginAt?: string | null, sharedWithOtherMerchants: boolean } } };

export type LockMerchantUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type LockMerchantUserMutation = { __typename?: 'Mutation', lockMerchantUser: { __typename?: 'MerchantUserView', id: string, email: string, name: string, phone?: string | null, title?: string | null, role: string, extraPermissions: Array<string>, effectivePermissions: Array<string>, status: string, note?: string | null, invitedByName?: string | null, invitedAt: string, joinedAt?: string | null, lastAccessAt?: string | null, isSelf: boolean, appLogin: { __typename?: 'StaffAppLoginView', phone?: string | null, hasPassword: boolean, mustChangePassword: boolean, lastLoginAt?: string | null, sharedWithOtherMerchants: boolean } } };

export type UnlockMerchantUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UnlockMerchantUserMutation = { __typename?: 'Mutation', unlockMerchantUser: { __typename?: 'MerchantUserView', id: string, email: string, name: string, phone?: string | null, title?: string | null, role: string, extraPermissions: Array<string>, effectivePermissions: Array<string>, status: string, note?: string | null, invitedByName?: string | null, invitedAt: string, joinedAt?: string | null, lastAccessAt?: string | null, isSelf: boolean, appLogin: { __typename?: 'StaffAppLoginView', phone?: string | null, hasPassword: boolean, mustChangePassword: boolean, lastLoginAt?: string | null, sharedWithOtherMerchants: boolean } } };

export type ResendInviteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ResendInviteMutation = { __typename?: 'Mutation', resendInvite: { __typename?: 'MerchantUserView', id: string, email: string, name: string, phone?: string | null, title?: string | null, role: string, extraPermissions: Array<string>, effectivePermissions: Array<string>, status: string, note?: string | null, invitedByName?: string | null, invitedAt: string, joinedAt?: string | null, lastAccessAt?: string | null, isSelf: boolean, appLogin: { __typename?: 'StaffAppLoginView', phone?: string | null, hasPassword: boolean, mustChangePassword: boolean, lastLoginAt?: string | null, sharedWithOtherMerchants: boolean } } };

export type RolesAndMatrixQueryVariables = Exact<{ [key: string]: never; }>;


export type RolesAndMatrixQuery = { __typename?: 'Query', roles: Array<{ __typename?: 'RoleView', key: string, name: string, userCount: number }>, permissionMatrix: Array<{ __typename?: 'PermissionMatrixRow', action: string, label: string, group: string, groupLabel: string, requiresReason: boolean, admin: string, operation: string, accountant: string, grantedUserCount: number }> };

export type UpdateRolePermissionMutationVariables = Exact<{
  role: Scalars['String']['input'];
  permission: Scalars['String']['input'];
  grant: Scalars['String']['input'];
}>;


export type UpdateRolePermissionMutation = { __typename?: 'Mutation', updateRolePermission: { __typename?: 'PermissionMatrixRow', action: string, admin: string, operation: string, accountant: string, grantedUserCount: number } };

export type CatalogItemFieldsFragment = { __typename?: 'CatalogItemView', id: string, type: string, code: string, name: string, appliesTo?: string | null, isDefault: boolean, sortOrder: number, active: boolean, usageCount: number };

export type CatalogItemsQueryVariables = Exact<{
  type?: InputMaybe<CatalogType>;
}>;


export type CatalogItemsQuery = { __typename?: 'Query', catalogItems: Array<{ __typename?: 'CatalogItemView', id: string, type: string, code: string, name: string, appliesTo?: string | null, isDefault: boolean, sortOrder: number, active: boolean, usageCount: number }> };

export type CreateCatalogItemMutationVariables = Exact<{
  input: CatalogItemInput;
}>;


export type CreateCatalogItemMutation = { __typename?: 'Mutation', createCatalogItem: { __typename?: 'CatalogItemView', id: string, type: string, code: string, name: string, appliesTo?: string | null, isDefault: boolean, sortOrder: number, active: boolean, usageCount: number } };

export type UpdateCatalogItemMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: CatalogItemInput;
}>;


export type UpdateCatalogItemMutation = { __typename?: 'Mutation', updateCatalogItem: { __typename?: 'CatalogItemView', id: string, type: string, code: string, name: string, appliesTo?: string | null, isDefault: boolean, sortOrder: number, active: boolean, usageCount: number } };

export type DeactivateCatalogItemMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeactivateCatalogItemMutation = { __typename?: 'Mutation', deactivateCatalogItem: { __typename?: 'CatalogItemView', id: string, type: string, code: string, name: string, appliesTo?: string | null, isDefault: boolean, sortOrder: number, active: boolean, usageCount: number } };

export type ActivateCatalogItemMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ActivateCatalogItemMutation = { __typename?: 'Mutation', activateCatalogItem: { __typename?: 'CatalogItemView', id: string, type: string, code: string, name: string, appliesTo?: string | null, isDefault: boolean, sortOrder: number, active: boolean, usageCount: number } };

export type ReorderCatalogItemsMutationVariables = Exact<{
  type: CatalogType;
  ids: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type ReorderCatalogItemsMutation = { __typename?: 'Mutation', reorderCatalogItems: Array<{ __typename?: 'CatalogItemView', id: string, type: string, code: string, name: string, appliesTo?: string | null, isDefault: boolean, sortOrder: number, active: boolean, usageCount: number }> };

export type IoImportJobFieldsFragment = { __typename?: 'ImportJobView', id: string, entityType: string, fileName: string, status: string, totalRows: number, validRows: number, warningRows: number, errorRows: number, createdCount?: number | null, skippedCount?: number | null, unmappedColumns: Array<string>, fields: Array<{ __typename?: 'ImportFieldView', key: string, label: string, required: boolean, sourceColumn?: string | null }>, rows: Array<{ __typename?: 'ImportRowView', line: number, values: unknown, errors: Array<string>, warnings: Array<string>, createdCode?: string | null }> };

export type IoStartImportMutationVariables = Exact<{
  input: StartImportInput;
}>;


export type IoStartImportMutation = { __typename?: 'Mutation', startImport: { __typename?: 'ImportJobView', id: string, entityType: string, fileName: string, status: string, totalRows: number, validRows: number, warningRows: number, errorRows: number, createdCount?: number | null, skippedCount?: number | null, unmappedColumns: Array<string>, fields: Array<{ __typename?: 'ImportFieldView', key: string, label: string, required: boolean, sourceColumn?: string | null }>, rows: Array<{ __typename?: 'ImportRowView', line: number, values: unknown, errors: Array<string>, warnings: Array<string>, createdCode?: string | null }> } };

export type IoImportPreviewQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  filter?: InputMaybe<ImportPreviewFilter>;
}>;


export type IoImportPreviewQuery = { __typename?: 'Query', importPreview: { __typename?: 'ImportJobView', id: string, entityType: string, fileName: string, status: string, totalRows: number, validRows: number, warningRows: number, errorRows: number, createdCount?: number | null, skippedCount?: number | null, unmappedColumns: Array<string>, fields: Array<{ __typename?: 'ImportFieldView', key: string, label: string, required: boolean, sourceColumn?: string | null }>, rows: Array<{ __typename?: 'ImportRowView', line: number, values: unknown, errors: Array<string>, warnings: Array<string>, createdCode?: string | null }> } };

export type IoCommitImportMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  skipErrors?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type IoCommitImportMutation = { __typename?: 'Mutation', commitImport: { __typename?: 'ImportJobView', id: string, entityType: string, fileName: string, status: string, totalRows: number, validRows: number, warningRows: number, errorRows: number, createdCount?: number | null, skippedCount?: number | null, unmappedColumns: Array<string>, fields: Array<{ __typename?: 'ImportFieldView', key: string, label: string, required: boolean, sourceColumn?: string | null }>, rows: Array<{ __typename?: 'ImportRowView', line: number, values: unknown, errors: Array<string>, warnings: Array<string>, createdCode?: string | null }> } };

export type IoCancelImportMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type IoCancelImportMutation = { __typename?: 'Mutation', cancelImport: { __typename?: 'ImportJobView', id: string, status: string } };

export type IoImportTemplateQueryVariables = Exact<{
  entityType: Scalars['String']['input'];
}>;


export type IoImportTemplateQuery = { __typename?: 'Query', importTemplate: { __typename?: 'ImportTemplateFile', url: string, fileName: string } };

export type IoExportFileMutationVariables = Exact<{
  input: ExportFileInput;
}>;


export type IoExportFileMutation = { __typename?: 'Mutation', exportFile: { __typename?: 'ExportedFile', template: string, fileName: string, url: string, rowCount: number } };

export type IoRenderDocumentMutationVariables = Exact<{
  input: RenderDocumentInput;
}>;


export type IoRenderDocumentMutation = { __typename?: 'Mutation', renderDocument: { __typename?: 'RenderedDocument', template: string, fileName: string, url?: string | null, html?: string | null, attachmentId?: string | null } };

export type ActivityTimelineQueryVariables = Exact<{
  entity: EntityRefInput;
  filter?: InputMaybe<TimelineFilter>;
}>;


export type ActivityTimelineQuery = { __typename?: 'Query', activityTimeline: Array<{ __typename?: 'TimelineEntry', id: string, kind: string, createdAt: string, entityType: string, entityId: string, category: string, action: string, summary: string, actorType: string, actorName?: string | null, reason?: string | null, before?: unknown | null, after?: unknown | null, sensitive: boolean, fromStatus?: string | null, toStatus?: string | null }> };

export type AttachmentFieldsFragment = { __typename?: 'AttachmentView', id: string, entityType: string, entityId: string, category: string, fileName: string, mimeType: string, size: number, status: string, uploadedByType: string, uploadedByName?: string | null, capturedAt?: string | null, note?: string | null, sharedWithCustomer: boolean, createdAt: string, url?: string | null };

export type AttachmentsQueryVariables = Exact<{
  entityType: EntityType;
  entityId: Scalars['ID']['input'];
  category?: InputMaybe<AttachmentCategory>;
}>;


export type AttachmentsQuery = { __typename?: 'Query', attachments: Array<{ __typename?: 'AttachmentView', id: string, entityType: string, entityId: string, category: string, fileName: string, mimeType: string, size: number, status: string, uploadedByType: string, uploadedByName?: string | null, capturedAt?: string | null, note?: string | null, sharedWithCustomer: boolean, createdAt: string, url?: string | null }> };

export type DeleteAttachmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type DeleteAttachmentMutation = { __typename?: 'Mutation', deleteAttachment: { __typename?: 'AttachmentView', id: string, status: string } };

export type NotificationsQueryVariables = Exact<{
  filter?: InputMaybe<NotificationFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type NotificationsQuery = { __typename?: 'Query', notifications: { __typename?: 'NotificationConnection', unreadCount: number, totalCount: number, nodes: Array<{ __typename?: 'NotificationView', id: string, type: string, title: string, body?: string | null, entityType?: string | null, entityId?: string | null, severity?: string | null, readAt?: string | null, createdAt: string }> } };

export type MarkNotificationReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkNotificationReadMutation = { __typename?: 'Mutation', markNotificationRead: number };

export type MarkAllNotificationsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsReadMutation = { __typename?: 'Mutation', markAllNotificationsRead: number };

export type CatalogOptionsQueryVariables = Exact<{
  type?: InputMaybe<CatalogType>;
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type CatalogOptionsQuery = { __typename?: 'Query', catalogItems: Array<{ __typename?: 'CatalogItemView', id: string, type: string, code: string, name: string, active: boolean }> };

export type SupplierListFieldsFragment = { __typename?: 'SupplierView', id: string, code: string, name: string, typeId?: string | null, status: string, expenseCount: number, payableAmount: number, type?: { __typename?: 'MasterRef', id: string, name: string } | null, contacts: Array<{ __typename?: 'ContactView', name?: string | null, role?: string | null, phone?: string | null, email?: string | null, zalo?: string | null }> };

export type SuppliersQueryVariables = Exact<{
  filter?: InputMaybe<SupplierFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
}>;


export type SuppliersQuery = { __typename?: 'Query', suppliers: { __typename?: 'SupplierConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null }, nodes: Array<{ __typename?: 'SupplierView', id: string, code: string, name: string, typeId?: string | null, status: string, expenseCount: number, payableAmount: number, type?: { __typename?: 'MasterRef', id: string, name: string } | null, contacts: Array<{ __typename?: 'ContactView', name?: string | null, role?: string | null, phone?: string | null, email?: string | null, zalo?: string | null }> }> } };

export type SupplierDetailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SupplierDetailQuery = { __typename?: 'Query', supplier: { __typename?: 'SupplierView', taxCode?: string | null, address?: string | null, bankName?: string | null, bankAccountNo?: string | null, paymentTerms?: string | null, note?: string | null, deactivateReason?: string | null, createdAt: string, updatedAt: string, id: string, code: string, name: string, typeId?: string | null, status: string, expenseCount: number, payableAmount: number, payable?: { __typename?: 'SupplierPayableView', total: number, unpaidCount: number, oldestDays: number, aging: { __typename?: 'SupplierAgingView', d0_15: number, d16_30: number, d31_60: number, d60p: number } } | null, recentExpenses?: Array<{ __typename?: 'MasterExpenseItem', id: string, code: string, kind: string, categoryName?: string | null, amount: number, expenseDate: string, paidBy: string, paidStatus: string, status: string, description?: string | null, orderCode?: string | null, tripCode?: string | null, vehiclePlate?: string | null }> | null, externalTransports?: Array<{ __typename?: 'SupplierExternalTransportView', id: string, orderId: string, orderCode?: string | null, tripId?: string | null, tripCode?: string | null, vehiclePlate?: string | null, driverName?: string | null, driverPhone?: string | null, agreedAmount?: number | null, note?: string | null, createdAt: string }> | null, type?: { __typename?: 'MasterRef', id: string, name: string } | null, contacts: Array<{ __typename?: 'ContactView', name?: string | null, role?: string | null, phone?: string | null, email?: string | null, zalo?: string | null }> } };

export type CreateSupplierMutationVariables = Exact<{
  input: SupplierInput;
}>;


export type CreateSupplierMutation = { __typename?: 'Mutation', createSupplier: { __typename?: 'SupplierView', id: string, code: string } };

export type UpdateSupplierMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: SupplierInput;
}>;


export type UpdateSupplierMutation = { __typename?: 'Mutation', updateSupplier: { __typename?: 'SupplierView', id: string, code: string, name: string, typeId?: string | null, status: string, expenseCount: number, payableAmount: number, type?: { __typename?: 'MasterRef', id: string, name: string } | null, contacts: Array<{ __typename?: 'ContactView', name?: string | null, role?: string | null, phone?: string | null, email?: string | null, zalo?: string | null }> } };

export type DeactivateSupplierMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type DeactivateSupplierMutation = { __typename?: 'Mutation', deactivateSupplier: { __typename?: 'SupplierView', id: string, status: string } };

export type ActivateSupplierMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ActivateSupplierMutation = { __typename?: 'Mutation', activateSupplier: { __typename?: 'SupplierView', id: string, status: string } };

export type VehicleListFieldsFragment = { __typename?: 'VehicleView', id: string, code: string, plate: string, typeId?: string | null, capacityTons?: number | null, status: string, monthCost: number, registrationExpiresAt?: string | null, insuranceExpiresAt?: string | null, expiryWarnings: Array<string>, type?: { __typename?: 'MasterRef', id: string, name: string } | null, currentTrip?: { __typename?: 'VehicleCurrentTrip', id: string, code: string, status: string, driverName?: string | null, plannedStartAt: string } | null };

export type VehiclesQueryVariables = Exact<{
  filter?: InputMaybe<VehicleFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
}>;


export type VehiclesQuery = { __typename?: 'Query', vehicles: { __typename?: 'VehicleConnection', totalCount: number, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null }, nodes: Array<{ __typename?: 'VehicleView', id: string, code: string, plate: string, typeId?: string | null, capacityTons?: number | null, status: string, monthCost: number, registrationExpiresAt?: string | null, insuranceExpiresAt?: string | null, expiryWarnings: Array<string>, type?: { __typename?: 'MasterRef', id: string, name: string } | null, currentTrip?: { __typename?: 'VehicleCurrentTrip', id: string, code: string, status: string, driverName?: string | null, plannedStartAt: string } | null }> } };

export type VehicleDetailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type VehicleDetailQuery = { __typename?: 'Query', vehicle: { __typename?: 'VehicleView', brandModel?: string | null, year?: number | null, chassisNo?: string | null, engineNo?: string | null, boxSize?: string | null, fuelNorm?: string | null, note?: string | null, createdAt: string, updatedAt: string, id: string, code: string, plate: string, typeId?: string | null, capacityTons?: number | null, status: string, monthCost: number, registrationExpiresAt?: string | null, insuranceExpiresAt?: string | null, expiryWarnings: Array<string>, stats?: { __typename?: 'VehicleStats', tripCount30d: number, cost30d: number } | null, tripHistory?: Array<{ __typename?: 'MasterTripItem', id: string, code: string, status: string, orderId: string, orderCode?: string | null, routeSummary?: string | null, driverName?: string | null, plannedStartAt: string, plannedEndAt?: string | null, actualStartAt?: string | null, actualEndAt?: string | null }> | null, expenses?: Array<{ __typename?: 'MasterExpenseItem', id: string, code: string, kind: string, categoryName?: string | null, amount: number, expenseDate: string, paidBy: string, paidStatus: string, status: string, description?: string | null, tripCode?: string | null, supplierName?: string | null }> | null, type?: { __typename?: 'MasterRef', id: string, name: string } | null, currentTrip?: { __typename?: 'VehicleCurrentTrip', id: string, code: string, status: string, driverName?: string | null, plannedStartAt: string } | null } };

export type CreateVehicleMutationVariables = Exact<{
  input: VehicleInput;
}>;


export type CreateVehicleMutation = { __typename?: 'Mutation', createVehicle: { __typename?: 'VehicleView', id: string, code: string } };

export type UpdateVehicleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: VehicleInput;
}>;


export type UpdateVehicleMutation = { __typename?: 'Mutation', updateVehicle: { __typename?: 'VehicleView', id: string, code: string, plate: string, typeId?: string | null, capacityTons?: number | null, status: string, monthCost: number, registrationExpiresAt?: string | null, insuranceExpiresAt?: string | null, expiryWarnings: Array<string>, type?: { __typename?: 'MasterRef', id: string, name: string } | null, currentTrip?: { __typename?: 'VehicleCurrentTrip', id: string, code: string, status: string, driverName?: string | null, plannedStartAt: string } | null } };

export type DeactivateVehicleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
}>;


export type DeactivateVehicleMutation = { __typename?: 'Mutation', deactivateVehicle: { __typename?: 'VehicleView', id: string, status: string } };

export type ActivateVehicleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ActivateVehicleMutation = { __typename?: 'Mutation', activateVehicle: { __typename?: 'VehicleView', id: string, status: string } };

export type SetVehicleStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type SetVehicleStatusMutation = { __typename?: 'Mutation', setVehicleStatus: { __typename?: 'VehicleView', id: string, status: string } };

export const CustomerListFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"taxCode"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"creditLimit"}},{"kind":"Field","name":{"kind":"Name","value":"defaultDebtDays"}},{"kind":"Field","name":{"kind":"Name","value":"orderCount"}},{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"groupName"}},{"kind":"Field","name":{"kind":"Name","value":"debtSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdueAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxOverdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"overdueOrders"}},{"kind":"Field","name":{"kind":"Name","value":"openOrders"}},{"kind":"Field","name":{"kind":"Name","value":"overLimit"}},{"kind":"Field","name":{"kind":"Name","value":"limitUsagePct"}}]}}]}}]} as unknown as DocumentNode<CustomerListFieldsFragment, unknown>;
export const CustomerLocationFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerLocationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerLocationView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"usage"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"usedInOrders"}}]}}]} as unknown as DocumentNode<CustomerLocationFieldsFragment, unknown>;
export const CustomerDetailFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerDetailFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerListFields"}},{"kind":"Field","name":{"kind":"Name","value":"legalName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceEmail"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"deactivateReason"}},{"kind":"Field","name":{"kind":"Name","value":"hasPortalAccount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"primaryContact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"zalo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"debtSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"receivable"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdueAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxOverdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"openOrders"}},{"kind":"Field","name":{"kind":"Name","value":"overdueOrders"}},{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"creditLimit"}},{"kind":"Field","name":{"kind":"Name","value":"overLimit"}},{"kind":"Field","name":{"kind":"Name","value":"limitUsagePct"}},{"kind":"Field","name":{"kind":"Name","value":"aging"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"d1_15"}},{"kind":"Field","name":{"kind":"Name","value":"d16_30"}},{"kind":"Field","name":{"kind":"Name","value":"d31_60"}},{"kind":"Field","name":{"kind":"Name","value":"d60p"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"locations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerLocationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"taxCode"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"creditLimit"}},{"kind":"Field","name":{"kind":"Name","value":"defaultDebtDays"}},{"kind":"Field","name":{"kind":"Name","value":"orderCount"}},{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"groupName"}},{"kind":"Field","name":{"kind":"Name","value":"debtSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdueAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxOverdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"overdueOrders"}},{"kind":"Field","name":{"kind":"Name","value":"openOrders"}},{"kind":"Field","name":{"kind":"Name","value":"overLimit"}},{"kind":"Field","name":{"kind":"Name","value":"limitUsagePct"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerLocationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerLocationView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"usage"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"usedInOrders"}}]}}]} as unknown as DocumentNode<CustomerDetailFieldsFragment, unknown>;
export const TripListFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TripListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TripView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"plannedEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"hasWarning"}},{"kind":"Field","name":{"kind":"Name","value":"isExternal"}},{"kind":"Field","name":{"kind":"Name","value":"openIncidentCount"}},{"kind":"Field","name":{"kind":"Name","value":"stopCount"}},{"kind":"Field","name":{"kind":"Name","value":"codExpectedTotal"}},{"kind":"Field","name":{"kind":"Name","value":"driverBonusAmount"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lastLocation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"capturedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isStale"}}]}}]}}]} as unknown as DocumentNode<TripListFieldsFragment, unknown>;
export const IncidentListFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IncidentListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"IncidentView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"typeId"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"tripCode"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}},{"kind":"Field","name":{"kind":"Name","value":"reportedByType"}},{"kind":"Field","name":{"kind":"Name","value":"reportedByName"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeUserId"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}}]}}]} as unknown as DocumentNode<IncidentListFieldsFragment, unknown>;
export const DriverListFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DriverListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DriverView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"fixedSalary"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"licenseExpiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"currentTrip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"appAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"mustChangePassword"}},{"kind":"Field","name":{"kind":"Name","value":"deviceInfo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ledgerSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codHeld"}},{"kind":"Field","name":{"kind":"Name","value":"companyOwesDriver"}},{"kind":"Field","name":{"kind":"Name","value":"driverOwesCompany"}},{"kind":"Field","name":{"kind":"Name","value":"netBalance"}},{"kind":"Field","name":{"kind":"Name","value":"overAmount"}},{"kind":"Field","name":{"kind":"Name","value":"overDays"}},{"kind":"Field","name":{"kind":"Name","value":"daysHeld"}}]}}]}}]} as unknown as DocumentNode<DriverListFieldsFragment, unknown>;
export const SalaryHistoryFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SalaryHistoryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DriverSalaryHistoryView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveTo"}},{"kind":"Field","name":{"kind":"Name","value":"delta"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isCurrent"}}]}}]} as unknown as DocumentNode<SalaryHistoryFieldsFragment, unknown>;
export const DsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DebtStatementView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"scope"}},{"kind":"Field","name":{"kind":"Name","value":"periodFrom"}},{"kind":"Field","name":{"kind":"Name","value":"periodTo"}},{"kind":"Field","name":{"kind":"Name","value":"lineCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"remainingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithCustomer"}},{"kind":"Field","name":{"kind":"Name","value":"finalizedAt"}},{"kind":"Field","name":{"kind":"Name","value":"finalizedByName"}},{"kind":"Field","name":{"kind":"Name","value":"sentAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}},{"kind":"Field","name":{"kind":"Name","value":"pdfAttachmentId"}},{"kind":"Field","name":{"kind":"Name","value":"pdfUrl"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceEmail"}},{"kind":"Field","name":{"kind":"Name","value":"hasPortalAccount"}}]}}]}}]} as unknown as DocumentNode<DsFieldsFragment, unknown>;
export const ExpenseFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ExpenseFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ExpenseView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"kindLabel"}},{"kind":"Field","name":{"kind":"Name","value":"isCost"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expenseDate"}},{"kind":"Field","name":{"kind":"Name","value":"paidBy"}},{"kind":"Field","name":{"kind":"Name","value":"reimbursable"}},{"kind":"Field","name":{"kind":"Name","value":"paidStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidMethod"}},{"kind":"Field","name":{"kind":"Name","value":"supplierId"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleId"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"supplier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ExpenseFieldsFragment, unknown>;
export const PaymentFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"typeLabel"}},{"kind":"Field","name":{"kind":"Name","value":"notRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payerName"}},{"kind":"Field","name":{"kind":"Name","value":"payerLabel"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"allocatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"unallocatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"bankAccount"}},{"kind":"Field","name":{"kind":"Name","value":"transferNote"}},{"kind":"Field","name":{"kind":"Name","value":"receivedBy"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"customerCreditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentCode"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"method"}}]}},{"kind":"Field","name":{"kind":"Name","value":"codItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"stopName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<PaymentFieldsFragment, unknown>;
export const DriverCodItemFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DriverCodItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DriverCodItemView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopId"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"tripCode"}},{"kind":"Field","name":{"kind":"Name","value":"stopSequence"}},{"kind":"Field","name":{"kind":"Name","value":"stopName"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"codExpected"}},{"kind":"Field","name":{"kind":"Name","value":"codActual"}},{"kind":"Field","name":{"kind":"Name","value":"collectedAt"}},{"kind":"Field","name":{"kind":"Name","value":"remitted"}},{"kind":"Field","name":{"kind":"Name","value":"held"}},{"kind":"Field","name":{"kind":"Name","value":"daysHeld"}}]}}]} as unknown as DocumentNode<DriverCodItemFieldsFragment, unknown>;
export const OrderListFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderDate"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"freightAmount"}},{"kind":"Field","name":{"kind":"Name","value":"addonTotal"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"remainingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"overdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"tripCount"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}}]}}]} as unknown as DocumentNode<OrderListFieldsFragment, unknown>;
export const OrderTripFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderTripFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TripView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"plannedEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"driverBonusAmount"}},{"kind":"Field","name":{"kind":"Name","value":"isExternal"}},{"kind":"Field","name":{"kind":"Name","value":"hasWarning"}},{"kind":"Field","name":{"kind":"Name","value":"stopCount"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"openIncidentCount"}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sequence"}}]}}]}}]} as unknown as DocumentNode<OrderTripFieldsFragment, unknown>;
export const BookingFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BookingFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BookingView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cargoName"}},{"kind":"Field","name":{"kind":"Name","value":"weightTon"}},{"kind":"Field","name":{"kind":"Name","value":"packages"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleTypeHint"}},{"kind":"Field","name":{"kind":"Name","value":"fragile"}},{"kind":"Field","name":{"kind":"Name","value":"loadingAtPickup"}},{"kind":"Field","name":{"kind":"Name","value":"loadingAtDrop"}},{"kind":"Field","name":{"kind":"Name","value":"pickupFrom"}},{"kind":"Field","name":{"kind":"Name","value":"deliverBefore"}},{"kind":"Field","name":{"kind":"Name","value":"flexibility"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"rejectReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"accountName"}},{"kind":"Field","name":{"kind":"Name","value":"accountEmail"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"stops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]}}]} as unknown as DocumentNode<BookingFieldsFragment, unknown>;
export const PrLineFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollLineView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"payrollId"}},{"kind":"Field","name":{"kind":"Name","value":"payrollCode"}},{"kind":"Field","name":{"kind":"Name","value":"payrollStatus"}},{"kind":"Field","name":{"kind":"Name","value":"periodLabel"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"driverCode"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"baseSalary"}},{"kind":"Field","name":{"kind":"Name","value":"salaryEffectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"bonusTotal"}},{"kind":"Field","name":{"kind":"Name","value":"advanceTotal"}},{"kind":"Field","name":{"kind":"Name","value":"deductionTotal"}},{"kind":"Field","name":{"kind":"Name","value":"adjustmentTotal"}},{"kind":"Field","name":{"kind":"Name","value":"netAmount"}},{"kind":"Field","name":{"kind":"Name","value":"anomalies"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]} as unknown as DocumentNode<PrLineFieldsFragment, unknown>;
export const PrItemFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollItemView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"sourceRef"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"expenseId"}},{"kind":"Field","name":{"kind":"Name","value":"itemDate"}},{"kind":"Field","name":{"kind":"Name","value":"reasonId"}},{"kind":"Field","name":{"kind":"Name","value":"reasonName"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}}]}}]} as unknown as DocumentNode<PrItemFieldsFragment, unknown>;
export const PrTotalsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrTotalsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollTotalsView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driverCount"}},{"kind":"Field","name":{"kind":"Name","value":"salary"}},{"kind":"Field","name":{"kind":"Name","value":"bonus"}},{"kind":"Field","name":{"kind":"Name","value":"advance"}},{"kind":"Field","name":{"kind":"Name","value":"deduction"}},{"kind":"Field","name":{"kind":"Name","value":"adjustment"}},{"kind":"Field","name":{"kind":"Name","value":"net"}}]}}]} as unknown as DocumentNode<PrTotalsFieldsFragment, unknown>;
export const PrPayrollFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrPayrollFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"periodLabel"}},{"kind":"Field","name":{"kind":"Name","value":"periodFrom"}},{"kind":"Field","name":{"kind":"Name","value":"periodTo"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"anomalyCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}},{"kind":"Field","name":{"kind":"Name","value":"submittedByName"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"approvedByName"}},{"kind":"Field","name":{"kind":"Name","value":"approvalNote"}},{"kind":"Field","name":{"kind":"Name","value":"returnedAt"}},{"kind":"Field","name":{"kind":"Name","value":"returnReason"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidByName"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"totals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrTotalsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrTotalsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollTotalsView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driverCount"}},{"kind":"Field","name":{"kind":"Name","value":"salary"}},{"kind":"Field","name":{"kind":"Name","value":"bonus"}},{"kind":"Field","name":{"kind":"Name","value":"advance"}},{"kind":"Field","name":{"kind":"Name","value":"deduction"}},{"kind":"Field","name":{"kind":"Name","value":"adjustment"}},{"kind":"Field","name":{"kind":"Name","value":"net"}}]}}]} as unknown as DocumentNode<PrPayrollFieldsFragment, unknown>;
export const RptProfitRowFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RptProfitRowFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProfitRow"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"sublabel"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"freight"}},{"kind":"Field","name":{"kind":"Name","value":"addons"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"tripCost"}},{"kind":"Field","name":{"kind":"Name","value":"outsourcedCost"}},{"kind":"Field","name":{"kind":"Name","value":"otherCost"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"profit"}},{"kind":"Field","name":{"kind":"Name","value":"margin"}},{"kind":"Field","name":{"kind":"Name","value":"orderCount"}},{"kind":"Field","name":{"kind":"Name","value":"isProvisional"}}]}}]} as unknown as DocumentNode<RptProfitRowFieldsFragment, unknown>;
export const RptAgingFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RptAgingFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AgingReportView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"d1_15"}},{"kind":"Field","name":{"kind":"Name","value":"d16_30"}},{"kind":"Field","name":{"kind":"Name","value":"d31_60"}},{"kind":"Field","name":{"kind":"Name","value":"d60p"}}]}}]} as unknown as DocumentNode<RptAgingFieldsFragment, unknown>;
export const MerchantUserFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MerchantUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MerchantUserView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"extraPermissions"}},{"kind":"Field","name":{"kind":"Name","value":"effectivePermissions"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"invitedByName"}},{"kind":"Field","name":{"kind":"Name","value":"invitedAt"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastAccessAt"}},{"kind":"Field","name":{"kind":"Name","value":"isSelf"}},{"kind":"Field","name":{"kind":"Name","value":"appLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"hasPassword"}},{"kind":"Field","name":{"kind":"Name","value":"mustChangePassword"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithOtherMerchants"}}]}}]}}]} as unknown as DocumentNode<MerchantUserFieldsFragment, unknown>;
export const CatalogItemFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CatalogItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CatalogItemView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"appliesTo"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"usageCount"}}]}}]} as unknown as DocumentNode<CatalogItemFieldsFragment, unknown>;
export const IoImportJobFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IoImportJobFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ImportJobView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"totalRows"}},{"kind":"Field","name":{"kind":"Name","value":"validRows"}},{"kind":"Field","name":{"kind":"Name","value":"warningRows"}},{"kind":"Field","name":{"kind":"Name","value":"errorRows"}},{"kind":"Field","name":{"kind":"Name","value":"createdCount"}},{"kind":"Field","name":{"kind":"Name","value":"skippedCount"}},{"kind":"Field","name":{"kind":"Name","value":"unmappedColumns"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"sourceColumn"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"line"}},{"kind":"Field","name":{"kind":"Name","value":"values"}},{"kind":"Field","name":{"kind":"Name","value":"errors"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"createdCode"}}]}}]}}]} as unknown as DocumentNode<IoImportJobFieldsFragment, unknown>;
export const AttachmentFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AttachmentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AttachmentView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedByType"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedByName"}},{"kind":"Field","name":{"kind":"Name","value":"capturedAt"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithCustomer"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]} as unknown as DocumentNode<AttachmentFieldsFragment, unknown>;
export const SupplierListFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SupplierListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SupplierView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"typeId"}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"expenseCount"}},{"kind":"Field","name":{"kind":"Name","value":"payableAmount"}},{"kind":"Field","name":{"kind":"Name","value":"contacts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"zalo"}}]}}]}}]} as unknown as DocumentNode<SupplierListFieldsFragment, unknown>;
export const VehicleListFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VehicleListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"typeId"}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"capacityTons"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"monthCost"}},{"kind":"Field","name":{"kind":"Name","value":"registrationExpiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"insuranceExpiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiryWarnings"}},{"kind":"Field","name":{"kind":"Name","value":"currentTrip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}}]}}]}}]} as unknown as DocumentNode<VehicleListFieldsFragment, unknown>;
export const MyAppLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyAppLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"hasAppPassword"}}]}}]}}]}}]} as unknown as DocumentNode<MyAppLoginQuery, MyAppLoginQueryVariables>;
export const SetMyAppCredentialsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetMyAppCredentials"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"phone"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"newPassword"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setMyAppCredentials"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"phone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"phone"}}},{"kind":"Argument","name":{"kind":"Name","value":"newPassword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"newPassword"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"hasAppPassword"}}]}}]}}]}}]} as unknown as DocumentNode<SetMyAppCredentialsMutation, SetMyAppCredentialsMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"memberships"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"merchantId"}},{"kind":"Field","name":{"kind":"Name","value":"merchantCode"}},{"kind":"Field","name":{"kind":"Name","value":"merchantName"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastAccessAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"current"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"membershipId"}},{"kind":"Field","name":{"kind":"Name","value":"merchantId"}},{"kind":"Field","name":{"kind":"Name","value":"merchantName"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"permissions"}}]}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const CreateMerchantDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMerchant"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMerchantInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMerchant"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"merchantId"}},{"kind":"Field","name":{"kind":"Name","value":"merchantCode"}},{"kind":"Field","name":{"kind":"Name","value":"merchantName"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastAccessAt"}}]}}]}}]} as unknown as DocumentNode<CreateMerchantMutation, CreateMerchantMutationVariables>;
export const AcceptInvitationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptInvitation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptInvitation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"membershipId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"membershipId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"merchantId"}},{"kind":"Field","name":{"kind":"Name","value":"merchantCode"}},{"kind":"Field","name":{"kind":"Name","value":"merchantName"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastAccessAt"}}]}}]}}]} as unknown as DocumentNode<AcceptInvitationMutation, AcceptInvitationMutationVariables>;
export const CustomersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Customers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerListFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"taxCode"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"creditLimit"}},{"kind":"Field","name":{"kind":"Name","value":"defaultDebtDays"}},{"kind":"Field","name":{"kind":"Name","value":"orderCount"}},{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"groupName"}},{"kind":"Field","name":{"kind":"Name","value":"debtSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdueAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxOverdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"overdueOrders"}},{"kind":"Field","name":{"kind":"Name","value":"openOrders"}},{"kind":"Field","name":{"kind":"Name","value":"overLimit"}},{"kind":"Field","name":{"kind":"Name","value":"limitUsagePct"}}]}}]}}]} as unknown as DocumentNode<CustomersQuery, CustomersQueryVariables>;
export const CustomerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Customer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerDetailFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"taxCode"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"creditLimit"}},{"kind":"Field","name":{"kind":"Name","value":"defaultDebtDays"}},{"kind":"Field","name":{"kind":"Name","value":"orderCount"}},{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"groupName"}},{"kind":"Field","name":{"kind":"Name","value":"debtSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdueAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxOverdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"overdueOrders"}},{"kind":"Field","name":{"kind":"Name","value":"openOrders"}},{"kind":"Field","name":{"kind":"Name","value":"overLimit"}},{"kind":"Field","name":{"kind":"Name","value":"limitUsagePct"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerLocationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerLocationView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"usage"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"usedInOrders"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerDetailFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerListFields"}},{"kind":"Field","name":{"kind":"Name","value":"legalName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceEmail"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"deactivateReason"}},{"kind":"Field","name":{"kind":"Name","value":"hasPortalAccount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"primaryContact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"zalo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"debtSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"receivable"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdueAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxOverdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"openOrders"}},{"kind":"Field","name":{"kind":"Name","value":"overdueOrders"}},{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"creditLimit"}},{"kind":"Field","name":{"kind":"Name","value":"overLimit"}},{"kind":"Field","name":{"kind":"Name","value":"limitUsagePct"}},{"kind":"Field","name":{"kind":"Name","value":"aging"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"d1_15"}},{"kind":"Field","name":{"kind":"Name","value":"d16_30"}},{"kind":"Field","name":{"kind":"Name","value":"d31_60"}},{"kind":"Field","name":{"kind":"Name","value":"d60p"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"locations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerLocationFields"}}]}}]}}]} as unknown as DocumentNode<CustomerQuery, CustomerQueryVariables>;
export const CreateCustomerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCustomer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCustomer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerDetailFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"taxCode"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"creditLimit"}},{"kind":"Field","name":{"kind":"Name","value":"defaultDebtDays"}},{"kind":"Field","name":{"kind":"Name","value":"orderCount"}},{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"groupName"}},{"kind":"Field","name":{"kind":"Name","value":"debtSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdueAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxOverdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"overdueOrders"}},{"kind":"Field","name":{"kind":"Name","value":"openOrders"}},{"kind":"Field","name":{"kind":"Name","value":"overLimit"}},{"kind":"Field","name":{"kind":"Name","value":"limitUsagePct"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerLocationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerLocationView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"usage"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"usedInOrders"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerDetailFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerListFields"}},{"kind":"Field","name":{"kind":"Name","value":"legalName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceEmail"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"deactivateReason"}},{"kind":"Field","name":{"kind":"Name","value":"hasPortalAccount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"primaryContact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"zalo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"debtSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"receivable"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdueAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxOverdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"openOrders"}},{"kind":"Field","name":{"kind":"Name","value":"overdueOrders"}},{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"creditLimit"}},{"kind":"Field","name":{"kind":"Name","value":"overLimit"}},{"kind":"Field","name":{"kind":"Name","value":"limitUsagePct"}},{"kind":"Field","name":{"kind":"Name","value":"aging"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"d1_15"}},{"kind":"Field","name":{"kind":"Name","value":"d16_30"}},{"kind":"Field","name":{"kind":"Name","value":"d31_60"}},{"kind":"Field","name":{"kind":"Name","value":"d60p"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"locations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerLocationFields"}}]}}]}}]} as unknown as DocumentNode<CreateCustomerMutation, CreateCustomerMutationVariables>;
export const UpdateCustomerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCustomer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCustomer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerDetailFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"taxCode"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"creditLimit"}},{"kind":"Field","name":{"kind":"Name","value":"defaultDebtDays"}},{"kind":"Field","name":{"kind":"Name","value":"orderCount"}},{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"groupName"}},{"kind":"Field","name":{"kind":"Name","value":"debtSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdueAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxOverdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"overdueOrders"}},{"kind":"Field","name":{"kind":"Name","value":"openOrders"}},{"kind":"Field","name":{"kind":"Name","value":"overLimit"}},{"kind":"Field","name":{"kind":"Name","value":"limitUsagePct"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerLocationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerLocationView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"usage"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"usedInOrders"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerDetailFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerListFields"}},{"kind":"Field","name":{"kind":"Name","value":"legalName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceEmail"}},{"kind":"Field","name":{"kind":"Name","value":"billingAddress"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"deactivateReason"}},{"kind":"Field","name":{"kind":"Name","value":"hasPortalAccount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"primaryContact"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"zalo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"debtSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"receivable"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdueAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxOverdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"openOrders"}},{"kind":"Field","name":{"kind":"Name","value":"overdueOrders"}},{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"creditLimit"}},{"kind":"Field","name":{"kind":"Name","value":"overLimit"}},{"kind":"Field","name":{"kind":"Name","value":"limitUsagePct"}},{"kind":"Field","name":{"kind":"Name","value":"aging"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"d1_15"}},{"kind":"Field","name":{"kind":"Name","value":"d16_30"}},{"kind":"Field","name":{"kind":"Name","value":"d31_60"}},{"kind":"Field","name":{"kind":"Name","value":"d60p"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"locations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerLocationFields"}}]}}]}}]} as unknown as DocumentNode<UpdateCustomerMutation, UpdateCustomerMutationVariables>;
export const DeactivateCustomerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateCustomer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateCustomer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"deactivateReason"}}]}}]}}]} as unknown as DocumentNode<DeactivateCustomerMutation, DeactivateCustomerMutationVariables>;
export const ActivateCustomerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateCustomer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateCustomer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"deactivateReason"}}]}}]}}]} as unknown as DocumentNode<ActivateCustomerMutation, ActivateCustomerMutationVariables>;
export const CustomerLocationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CustomerLocations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeInactive"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerLocations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeInactive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeInactive"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerLocationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerLocationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerLocationView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"usage"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"usedInOrders"}}]}}]} as unknown as DocumentNode<CustomerLocationsQuery, CustomerLocationsQueryVariables>;
export const CreateCustomerLocationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCustomerLocation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerLocationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCustomerLocation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerLocationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerLocationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerLocationView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"usage"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"usedInOrders"}}]}}]} as unknown as DocumentNode<CreateCustomerLocationMutation, CreateCustomerLocationMutationVariables>;
export const UpdateCustomerLocationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCustomerLocation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerLocationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCustomerLocation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CustomerLocationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CustomerLocationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerLocationView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"usage"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"usedInOrders"}}]}}]} as unknown as DocumentNode<UpdateCustomerLocationMutation, UpdateCustomerLocationMutationVariables>;
export const DeleteCustomerLocationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCustomerLocation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCustomerLocation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}]}]}}]} as unknown as DocumentNode<DeleteCustomerLocationMutation, DeleteCustomerLocationMutationVariables>;
export const CustomerTotalsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CustomerTotals"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerTotals"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerCount"}},{"kind":"Field","name":{"kind":"Name","value":"activeCount"}},{"kind":"Field","name":{"kind":"Name","value":"receivable"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdueAmount"}},{"kind":"Field","name":{"kind":"Name","value":"overdueCustomers"}},{"kind":"Field","name":{"kind":"Name","value":"overLimitCustomers"}},{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"creditCustomers"}}]}}]}}]} as unknown as DocumentNode<CustomerTotalsQuery, CustomerTotalsQueryVariables>;
export const DashSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dashboardSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"runningTrips"}},{"kind":"Field","name":{"kind":"Name","value":"todayTrips"}},{"kind":"Field","name":{"kind":"Name","value":"newOrdersToday"}},{"kind":"Field","name":{"kind":"Name","value":"ordersNeedAction"}},{"kind":"Field","name":{"kind":"Name","value":"unassignedOrders"}},{"kind":"Field","name":{"kind":"Name","value":"openIncidents"}},{"kind":"Field","name":{"kind":"Name","value":"payrollPending"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleWarnings"}},{"kind":"Field","name":{"kind":"Name","value":"codOverThreshold"}},{"kind":"Field","name":{"kind":"Name","value":"overdueDebt"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"codHeld"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"revenueMonth"}},{"kind":"Field","name":{"kind":"Name","value":"costMonth"}},{"kind":"Field","name":{"kind":"Name","value":"profitMonth"}},{"kind":"Field","name":{"kind":"Name","value":"cashInMonth"}},{"kind":"Field","name":{"kind":"Name","value":"receivable"}},{"kind":"Field","name":{"kind":"Name","value":"supplierPayable"}},{"kind":"Field","name":{"kind":"Name","value":"tripCountsByStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"todayTripList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"plannedEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"hasWarning"}},{"kind":"Field","name":{"kind":"Name","value":"openIncident"}}]}},{"kind":"Field","name":{"kind":"Name","value":"overdueOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"overdueDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"codHolders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"codHeld"}},{"kind":"Field","name":{"kind":"Name","value":"daysHeld"}},{"kind":"Field","name":{"kind":"Name","value":"overThreshold"}}]}}]}}]}}]} as unknown as DocumentNode<DashSummaryQuery, DashSummaryQueryVariables>;
export const DashProfitMonthlyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashProfitMonthly"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reportProfit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"profit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"profit"}},{"kind":"Field","name":{"kind":"Name","value":"margin"}}]}}]}}]}}]} as unknown as DocumentNode<DashProfitMonthlyQuery, DashProfitMonthlyQueryVariables>;
export const DashFinanceExtrasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashFinanceExtras"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reportCustomerDebt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"overdueOnly"},"value":{"kind":"BooleanValue","value":false}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalDebt"}},{"kind":"Field","name":{"kind":"Name","value":"totalOverdue"}},{"kind":"Field","name":{"kind":"Name","value":"totalCredit"}},{"kind":"Field","name":{"kind":"Name","value":"aging"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"d1_15"}},{"kind":"Field","name":{"kind":"Name","value":"d16_30"}},{"kind":"Field","name":{"kind":"Name","value":"d31_60"}},{"kind":"Field","name":{"kind":"Name","value":"d60p"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"reportCodHeld"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalHeld"}},{"kind":"Field","name":{"kind":"Name","value":"overThresholdCount"}}]}}]}}]} as unknown as DocumentNode<DashFinanceExtrasQuery, DashFinanceExtrasQueryVariables>;
export const DspTripsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DspTrips"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TripFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trips"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TripListFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TripListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TripView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"plannedEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"hasWarning"}},{"kind":"Field","name":{"kind":"Name","value":"isExternal"}},{"kind":"Field","name":{"kind":"Name","value":"openIncidentCount"}},{"kind":"Field","name":{"kind":"Name","value":"stopCount"}},{"kind":"Field","name":{"kind":"Name","value":"codExpectedTotal"}},{"kind":"Field","name":{"kind":"Name","value":"driverBonusAmount"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lastLocation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"capturedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isStale"}}]}}]}}]} as unknown as DocumentNode<DspTripsQuery, DspTripsQueryVariables>;
export const DspTripDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DspTrip"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"plannedEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"isExternal"}},{"kind":"Field","name":{"kind":"Name","value":"hasWarning"}},{"kind":"Field","name":{"kind":"Name","value":"driverBonusAmount"}},{"kind":"Field","name":{"kind":"Name","value":"codExpectedTotal"}},{"kind":"Field","name":{"kind":"Name","value":"codActualTotal"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"pausedAt"}},{"kind":"Field","name":{"kind":"Name","value":"pausedReasonId"}},{"kind":"Field","name":{"kind":"Name","value":"pauseReasonLabel"}},{"kind":"Field","name":{"kind":"Name","value":"pauseNote"}},{"kind":"Field","name":{"kind":"Name","value":"previousStatusBeforePause"}},{"kind":"Field","name":{"kind":"Name","value":"resumedAt"}},{"kind":"Field","name":{"kind":"Name","value":"allowedNextStatuses"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"openIncidentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"customerPhone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}},{"kind":"Field","name":{"kind":"Name","value":"capacityTons"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"sequence"}},{"kind":"Field","name":{"kind":"Name","value":"tripSequence"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"plannedAt"}},{"kind":"Field","name":{"kind":"Name","value":"arrivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"codExpected"}},{"kind":"Field","name":{"kind":"Name","value":"codActual"}},{"kind":"Field","name":{"kind":"Name","value":"codCollectedAt"}},{"kind":"Field","name":{"kind":"Name","value":"podCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"skipReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"paidBy"}},{"kind":"Field","name":{"kind":"Name","value":"paidStatus"}},{"kind":"Field","name":{"kind":"Name","value":"reimbursable"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"expenseDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"advances"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"expenseDate"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"incidents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lastLocation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"capturedAt"}},{"kind":"Field","name":{"kind":"Name","value":"speed"}},{"kind":"Field","name":{"kind":"Name","value":"isStale"}}]}},{"kind":"Field","name":{"kind":"Name","value":"warnings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"subjectLabel"}},{"kind":"Field","name":{"kind":"Name","value":"conflictTripId"}},{"kind":"Field","name":{"kind":"Name","value":"conflictTripCode"}},{"kind":"Field","name":{"kind":"Name","value":"gapMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"thresholdMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"overrideReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"externalTransport"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"supplierId"}},{"kind":"Field","name":{"kind":"Name","value":"supplierName"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"driverPhone"}},{"kind":"Field","name":{"kind":"Name","value":"agreedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]}}]}}]} as unknown as DocumentNode<DspTripQuery, DspTripQueryVariables>;
export const DspTripLocationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DspTripLocations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tripLocations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tripId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"recordedAt"}},{"kind":"Field","name":{"kind":"Name","value":"speed"}}]}}]}}]} as unknown as DocumentNode<DspTripLocationsQuery, DspTripLocationsQueryVariables>;
export const DspTripFormOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DspTripFormOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"sequence"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"plannedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"tripIds"}},{"kind":"Field","name":{"kind":"Name","value":"tripCodes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trips"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<DspTripFormOrderQuery, DspTripFormOrderQueryVariables>;
export const DspResourceOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DspResourceOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driverOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"activeOnly"},"value":{"kind":"BooleanValue","value":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"busy"}},{"kind":"Field","name":{"kind":"Name","value":"busyTripCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicleOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"activeOnly"},"value":{"kind":"BooleanValue","value":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}},{"kind":"Field","name":{"kind":"Name","value":"capacityTons"}},{"kind":"Field","name":{"kind":"Name","value":"busy"}},{"kind":"Field","name":{"kind":"Name","value":"busyTripCode"}}]}}]}}]} as unknown as DocumentNode<DspResourceOptionsQuery, DspResourceOptionsQueryVariables>;
export const DspCheckOverlapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DspCheckOverlap"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckTripOverlapInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkTripOverlap"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"subjectId"}},{"kind":"Field","name":{"kind":"Name","value":"subjectLabel"}},{"kind":"Field","name":{"kind":"Name","value":"conflictTripId"}},{"kind":"Field","name":{"kind":"Name","value":"conflictTripCode"}},{"kind":"Field","name":{"kind":"Name","value":"gapMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"thresholdMinutes"}}]}}]}}]} as unknown as DocumentNode<DspCheckOverlapQuery, DspCheckOverlapQueryVariables>;
export const DspCreateTripDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DspCreateTrip"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TripInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTrip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"warnings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"subjectLabel"}},{"kind":"Field","name":{"kind":"Name","value":"conflictTripCode"}},{"kind":"Field","name":{"kind":"Name","value":"gapMinutes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"notices"}}]}}]}}]} as unknown as DocumentNode<DspCreateTripMutation, DspCreateTripMutationVariables>;
export const DspUpdateTripDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DspUpdateTrip"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTripInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTrip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"notices"}}]}}]}}]} as unknown as DocumentNode<DspUpdateTripMutation, DspUpdateTripMutationVariables>;
export const DspUpdateTripStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DspUpdateTripStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TripStatusChangeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTripStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<DspUpdateTripStatusMutation, DspUpdateTripStatusMutationVariables>;
export const DspResumeTripDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DspResumeTrip"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"note"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resumeTrip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"note"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<DspResumeTripMutation, DspResumeTripMutationVariables>;
export const DspCancelTripDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DspCancelTrip"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelTrip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<DspCancelTripMutation, DspCancelTripMutationVariables>;
export const DspSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DspSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dispatchSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"running"}},{"kind":"Field","name":{"kind":"Name","value":"unassigned"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"openIncidents"}},{"kind":"Field","name":{"kind":"Name","value":"ordersWaitingDispatch"}},{"kind":"Field","name":{"kind":"Name","value":"byStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]} as unknown as DocumentNode<DspSummaryQuery, DspSummaryQueryVariables>;
export const DspSchedulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DspSchedules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"days"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vehicleSchedules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}},{"kind":"Argument","name":{"kind":"Name","value":"days"},"value":{"kind":"Variable","name":{"kind":"Name","value":"days"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resource"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"sublabel"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"warning"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"counterpartLabel"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"driverSchedules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}},{"kind":"Argument","name":{"kind":"Name","value":"days"},"value":{"kind":"Variable","name":{"kind":"Name","value":"days"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resource"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"sublabel"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"warning"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"counterpartLabel"}}]}}]}}]}}]} as unknown as DocumentNode<DspSchedulesQuery, DspSchedulesQueryVariables>;
export const DspScheduleWarningsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DspScheduleWarnings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ScheduleWarningFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scheduleWarnings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"subjectId"}},{"kind":"Field","name":{"kind":"Name","value":"subjectLabel"}},{"kind":"Field","name":{"kind":"Name","value":"gapMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"thresholdMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"overrideReason"}},{"kind":"Field","name":{"kind":"Name","value":"overriddenByName"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"plannedEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"conflictTrip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"plannedEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}}]}}]}}]}}]}}]} as unknown as DocumentNode<DspScheduleWarningsQuery, DspScheduleWarningsQueryVariables>;
export const DspResolveWarningDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DspResolveWarning"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resolveScheduleWarning"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DspResolveWarningMutation, DspResolveWarningMutationVariables>;
export const DspLastLocationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DspLastLocations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"running"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lastKnownLocations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"running"},"value":{"kind":"Variable","name":{"kind":"Name","value":"running"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"tripCode"}},{"kind":"Field","name":{"kind":"Name","value":"tripStatus"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"driverPhone"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"capturedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isStale"}}]}}]}}]} as unknown as DocumentNode<DspLastLocationsQuery, DspLastLocationsQueryVariables>;
export const DspIncidentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DspIncidents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"IncidentFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"incidents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IncidentListFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IncidentListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"IncidentView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"typeId"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"tripCode"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}},{"kind":"Field","name":{"kind":"Name","value":"reportedByType"}},{"kind":"Field","name":{"kind":"Name","value":"reportedByName"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeUserId"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}}]}}]} as unknown as DocumentNode<DspIncidentsQuery, DspIncidentsQueryVariables>;
export const DspIncidentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DspIncident"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"incident"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IncidentListFields"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"stopId"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"driverPhone"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleId"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedNote"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IncidentListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"IncidentView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"typeId"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"tripCode"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}},{"kind":"Field","name":{"kind":"Name","value":"reportedByType"}},{"kind":"Field","name":{"kind":"Name","value":"reportedByName"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeUserId"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}}]}}]} as unknown as DocumentNode<DspIncidentQuery, DspIncidentQueryVariables>;
export const DspCreateIncidentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DspCreateIncident"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"IncidentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createIncident"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]} as unknown as DocumentNode<DspCreateIncidentMutation, DspCreateIncidentMutationVariables>;
export const DspUpdateIncidentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DspUpdateIncident"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"IncidentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateIncident"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DspUpdateIncidentMutation, DspUpdateIncidentMutationVariables>;
export const DspAssignIncidentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DspAssignIncident"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignIncident"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"assigneeName"}}]}}]}}]} as unknown as DocumentNode<DspAssignIncidentMutation, DspAssignIncidentMutationVariables>;
export const DspCloseIncidentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DspCloseIncident"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"note"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"closeIncident"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"note"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<DspCloseIncidentMutation, DspCloseIncidentMutationVariables>;
export const DspCancelIncidentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DspCancelIncident"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelIncident"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<DspCancelIncidentMutation, DspCancelIncidentMutationVariables>;
export const DspStaffOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DspStaffOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"staffOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"effectivePermissions"}}]}}]}}]} as unknown as DocumentNode<DspStaffOptionsQuery, DspStaffOptionsQueryVariables>;
export const ShellGlobalSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ShellGlobalSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"types"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"globalSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}},{"kind":"Argument","name":{"kind":"Name","value":"types"},"value":{"kind":"Variable","name":{"kind":"Name","value":"types"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ShellGlobalSearchQuery, ShellGlobalSearchQueryVariables>;
export const ShellNavBadgesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ShellNavBadges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"navBadges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dispatch"}},{"kind":"Field","name":{"kind":"Name","value":"incidents"}},{"kind":"Field","name":{"kind":"Name","value":"finance"}},{"kind":"Field","name":{"kind":"Name","value":"codOverThreshold"}},{"kind":"Field","name":{"kind":"Name","value":"payroll"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleWarnings"}},{"kind":"Field","name":{"kind":"Name","value":"overdueCustomers"}}]}}]}}]} as unknown as DocumentNode<ShellNavBadgesQuery, ShellNavBadgesQueryVariables>;
export const DspOpsDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DspOpsDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dashboardSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"runningTrips"}},{"kind":"Field","name":{"kind":"Name","value":"todayTrips"}},{"kind":"Field","name":{"kind":"Name","value":"unassignedOrders"}},{"kind":"Field","name":{"kind":"Name","value":"ordersNeedAction"}},{"kind":"Field","name":{"kind":"Name","value":"openIncidents"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleWarnings"}},{"kind":"Field","name":{"kind":"Name","value":"tripCountsByStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"todayTripList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"plannedEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"hasWarning"}},{"kind":"Field","name":{"kind":"Name","value":"openIncident"}},{"kind":"Field","name":{"kind":"Name","value":"lastLocationAt"}}]}}]}}]}}]} as unknown as DocumentNode<DspOpsDashboardQuery, DspOpsDashboardQueryVariables>;
export const ShellPendingBookingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ShellPendingBookings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bookings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"status"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"SUBMITTED","block":false}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<ShellPendingBookingsQuery, ShellPendingBookingsQueryVariables>;
export const DspSupplierOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DspSupplierOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"supplierOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"activeOnly"},"value":{"kind":"BooleanValue","value":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}}]}}]}}]} as unknown as DocumentNode<DspSupplierOptionsQuery, DspSupplierOptionsQueryVariables>;
export const DriversDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Drivers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DriverFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"drivers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DriverListFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DriverListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DriverView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"fixedSalary"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"licenseExpiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"currentTrip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"appAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"mustChangePassword"}},{"kind":"Field","name":{"kind":"Name","value":"deviceInfo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ledgerSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codHeld"}},{"kind":"Field","name":{"kind":"Name","value":"companyOwesDriver"}},{"kind":"Field","name":{"kind":"Name","value":"driverOwesCompany"}},{"kind":"Field","name":{"kind":"Name","value":"netBalance"}},{"kind":"Field","name":{"kind":"Name","value":"overAmount"}},{"kind":"Field","name":{"kind":"Name","value":"overDays"}},{"kind":"Field","name":{"kind":"Name","value":"daysHeld"}}]}}]}}]} as unknown as DocumentNode<DriversQuery, DriversQueryVariables>;
export const DriverDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DriverDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driver"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DriverListFields"}},{"kind":"Field","name":{"kind":"Name","value":"dob"}},{"kind":"Field","name":{"kind":"Name","value":"idNumber"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContact"}},{"kind":"Field","name":{"kind":"Name","value":"licenseClass"}},{"kind":"Field","name":{"kind":"Name","value":"licenseNumber"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"salaryHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SalaryHistoryFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recentTrips"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"plannedEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"driverBonusAmount"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DriverListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DriverView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"fixedSalary"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"licenseExpiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"currentTrip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"appAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"mustChangePassword"}},{"kind":"Field","name":{"kind":"Name","value":"deviceInfo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ledgerSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codHeld"}},{"kind":"Field","name":{"kind":"Name","value":"companyOwesDriver"}},{"kind":"Field","name":{"kind":"Name","value":"driverOwesCompany"}},{"kind":"Field","name":{"kind":"Name","value":"netBalance"}},{"kind":"Field","name":{"kind":"Name","value":"overAmount"}},{"kind":"Field","name":{"kind":"Name","value":"overDays"}},{"kind":"Field","name":{"kind":"Name","value":"daysHeld"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SalaryHistoryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DriverSalaryHistoryView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveTo"}},{"kind":"Field","name":{"kind":"Name","value":"delta"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isCurrent"}}]}}]} as unknown as DocumentNode<DriverDetailQuery, DriverDetailQueryVariables>;
export const CreateDriverDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDriver"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DriverInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDriver"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"issuedTempPassword"}}]}}]}}]} as unknown as DocumentNode<CreateDriverMutation, CreateDriverMutationVariables>;
export const UpdateDriverDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDriver"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DriverInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateDriver"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DriverListFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DriverListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DriverView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"fixedSalary"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"licenseExpiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"currentTrip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"appAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"mustChangePassword"}},{"kind":"Field","name":{"kind":"Name","value":"deviceInfo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ledgerSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codHeld"}},{"kind":"Field","name":{"kind":"Name","value":"companyOwesDriver"}},{"kind":"Field","name":{"kind":"Name","value":"driverOwesCompany"}},{"kind":"Field","name":{"kind":"Name","value":"netBalance"}},{"kind":"Field","name":{"kind":"Name","value":"overAmount"}},{"kind":"Field","name":{"kind":"Name","value":"overDays"}},{"kind":"Field","name":{"kind":"Name","value":"daysHeld"}}]}}]}}]} as unknown as DocumentNode<UpdateDriverMutation, UpdateDriverMutationVariables>;
export const DeactivateDriverDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateDriver"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateDriver"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<DeactivateDriverMutation, DeactivateDriverMutationVariables>;
export const ActivateDriverDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateDriver"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateDriver"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ActivateDriverMutation, ActivateDriverMutationVariables>;
export const AddDriverSalaryHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddDriverSalaryHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"driverId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SalaryHistoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addDriverSalaryHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"driverId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"driverId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SalaryHistoryFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SalaryHistoryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DriverSalaryHistoryView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveTo"}},{"kind":"Field","name":{"kind":"Name","value":"delta"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isCurrent"}}]}}]} as unknown as DocumentNode<AddDriverSalaryHistoryMutation, AddDriverSalaryHistoryMutationVariables>;
export const CreateOrResetDriverAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOrResetDriverAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"driverId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrResetDriverAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"driverId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"driverId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"tempPassword"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateOrResetDriverAccountMutation, CreateOrResetDriverAccountMutationVariables>;
export const DisableDriverAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DisableDriverAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"driverId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"disableDriverAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"driverId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"driverId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"appAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<DisableDriverAccountMutation, DisableDriverAccountMutationVariables>;
export const DsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DsList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DebtStatementFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"debtStatements"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DsFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DebtStatementView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"scope"}},{"kind":"Field","name":{"kind":"Name","value":"periodFrom"}},{"kind":"Field","name":{"kind":"Name","value":"periodTo"}},{"kind":"Field","name":{"kind":"Name","value":"lineCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"remainingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithCustomer"}},{"kind":"Field","name":{"kind":"Name","value":"finalizedAt"}},{"kind":"Field","name":{"kind":"Name","value":"finalizedByName"}},{"kind":"Field","name":{"kind":"Name","value":"sentAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}},{"kind":"Field","name":{"kind":"Name","value":"pdfAttachmentId"}},{"kind":"Field","name":{"kind":"Name","value":"pdfUrl"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceEmail"}},{"kind":"Field","name":{"kind":"Name","value":"hasPortalAccount"}}]}}]}}]} as unknown as DocumentNode<DsListQuery, DsListQueryVariables>;
export const DsDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DsDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"debtStatement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DsFields"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sequence"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"orderDate"}},{"kind":"Field","name":{"kind":"Name","value":"route"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"remainingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"overdueDays"}}]}},{"kind":"Field","name":{"kind":"Name","value":"diffVsCurrent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"snapshotPaid"}},{"kind":"Field","name":{"kind":"Name","value":"snapshotRemaining"}},{"kind":"Field","name":{"kind":"Name","value":"currentPaid"}},{"kind":"Field","name":{"kind":"Name","value":"currentRemaining"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DebtStatementView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"scope"}},{"kind":"Field","name":{"kind":"Name","value":"periodFrom"}},{"kind":"Field","name":{"kind":"Name","value":"periodTo"}},{"kind":"Field","name":{"kind":"Name","value":"lineCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"remainingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithCustomer"}},{"kind":"Field","name":{"kind":"Name","value":"finalizedAt"}},{"kind":"Field","name":{"kind":"Name","value":"finalizedByName"}},{"kind":"Field","name":{"kind":"Name","value":"sentAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}},{"kind":"Field","name":{"kind":"Name","value":"pdfAttachmentId"}},{"kind":"Field","name":{"kind":"Name","value":"pdfUrl"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceEmail"}},{"kind":"Field","name":{"kind":"Name","value":"hasPortalAccount"}}]}}]}}]} as unknown as DocumentNode<DsDetailQuery, DsDetailQueryVariables>;
export const DsCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DsCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateDebtStatementInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDebtStatement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]} as unknown as DocumentNode<DsCreateMutation, DsCreateMutationVariables>;
export const DsRefreshDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DsRefresh"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshDebtStatement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lineCount"}}]}}]}}]} as unknown as DocumentNode<DsRefreshMutation, DsRefreshMutationVariables>;
export const DsFinalizeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DsFinalize"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"finalizeDebtStatement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"pdfUrl"}}]}}]}}]} as unknown as DocumentNode<DsFinalizeMutation, DsFinalizeMutationVariables>;
export const DsMarkSentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DsMarkSent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"share"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markDebtStatementSent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"shareWithCustomer"},"value":{"kind":"Variable","name":{"kind":"Name","value":"share"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithCustomer"}}]}}]}}]} as unknown as DocumentNode<DsMarkSentMutation, DsMarkSentMutationVariables>;
export const DsCancelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DsCancel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelDebtStatement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<DsCancelMutation, DsCancelMutationVariables>;
export const DsCustomerOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DsCustomerOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"status"},"value":{"kind":"StringValue","value":"ACTIVE","block":false}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"debtSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdueAmount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<DsCustomerOptionsQuery, DsCustomerOptionsQueryVariables>;
export const FinExpensesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinExpenses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ExpenseFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expenses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ExpenseFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ExpenseFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ExpenseView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"kindLabel"}},{"kind":"Field","name":{"kind":"Name","value":"isCost"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expenseDate"}},{"kind":"Field","name":{"kind":"Name","value":"paidBy"}},{"kind":"Field","name":{"kind":"Name","value":"reimbursable"}},{"kind":"Field","name":{"kind":"Name","value":"paidStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidMethod"}},{"kind":"Field","name":{"kind":"Name","value":"supplierId"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleId"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"supplier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FinExpensesQuery, FinExpensesQueryVariables>;
export const FinExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ExpenseFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ExpenseFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ExpenseView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"kindLabel"}},{"kind":"Field","name":{"kind":"Name","value":"isCost"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expenseDate"}},{"kind":"Field","name":{"kind":"Name","value":"paidBy"}},{"kind":"Field","name":{"kind":"Name","value":"reimbursable"}},{"kind":"Field","name":{"kind":"Name","value":"paidStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidMethod"}},{"kind":"Field","name":{"kind":"Name","value":"supplierId"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleId"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"supplier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FinExpenseQuery, FinExpenseQueryVariables>;
export const FinCreateExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FinCreateExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ExpenseFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ExpenseFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ExpenseView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"kindLabel"}},{"kind":"Field","name":{"kind":"Name","value":"isCost"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expenseDate"}},{"kind":"Field","name":{"kind":"Name","value":"paidBy"}},{"kind":"Field","name":{"kind":"Name","value":"reimbursable"}},{"kind":"Field","name":{"kind":"Name","value":"paidStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidMethod"}},{"kind":"Field","name":{"kind":"Name","value":"supplierId"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleId"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"supplier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FinCreateExpenseMutation, FinCreateExpenseMutationVariables>;
export const FinUpdateExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FinUpdateExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ExpenseInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ExpenseFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ExpenseFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ExpenseView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"kindLabel"}},{"kind":"Field","name":{"kind":"Name","value":"isCost"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expenseDate"}},{"kind":"Field","name":{"kind":"Name","value":"paidBy"}},{"kind":"Field","name":{"kind":"Name","value":"reimbursable"}},{"kind":"Field","name":{"kind":"Name","value":"paidStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidMethod"}},{"kind":"Field","name":{"kind":"Name","value":"supplierId"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleId"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"supplier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FinUpdateExpenseMutation, FinUpdateExpenseMutationVariables>;
export const FinCancelExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FinCancelExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ExpenseFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ExpenseFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ExpenseView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"kindLabel"}},{"kind":"Field","name":{"kind":"Name","value":"isCost"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expenseDate"}},{"kind":"Field","name":{"kind":"Name","value":"paidBy"}},{"kind":"Field","name":{"kind":"Name","value":"reimbursable"}},{"kind":"Field","name":{"kind":"Name","value":"paidStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidMethod"}},{"kind":"Field","name":{"kind":"Name","value":"supplierId"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleId"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"supplier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FinCancelExpenseMutation, FinCancelExpenseMutationVariables>;
export const FinMarkExpensesPaidDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FinMarkExpensesPaid"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MarkExpensePaidInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markExpensesPaid"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ExpenseFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ExpenseFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ExpenseView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"kindLabel"}},{"kind":"Field","name":{"kind":"Name","value":"isCost"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expenseDate"}},{"kind":"Field","name":{"kind":"Name","value":"paidBy"}},{"kind":"Field","name":{"kind":"Name","value":"reimbursable"}},{"kind":"Field","name":{"kind":"Name","value":"paidStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidMethod"}},{"kind":"Field","name":{"kind":"Name","value":"supplierId"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleId"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"supplier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FinMarkExpensesPaidMutation, FinMarkExpensesPaidMutationVariables>;
export const FinPaymentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinPayments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"typeLabel"}},{"kind":"Field","name":{"kind":"Name","value":"notRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payerName"}},{"kind":"Field","name":{"kind":"Name","value":"payerLabel"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"allocatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"unallocatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"bankAccount"}},{"kind":"Field","name":{"kind":"Name","value":"transferNote"}},{"kind":"Field","name":{"kind":"Name","value":"receivedBy"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"customerCreditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentCode"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"method"}}]}},{"kind":"Field","name":{"kind":"Name","value":"codItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"stopName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<FinPaymentsQuery, FinPaymentsQueryVariables>;
export const FinPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"typeLabel"}},{"kind":"Field","name":{"kind":"Name","value":"notRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payerName"}},{"kind":"Field","name":{"kind":"Name","value":"payerLabel"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"allocatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"unallocatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"bankAccount"}},{"kind":"Field","name":{"kind":"Name","value":"transferNote"}},{"kind":"Field","name":{"kind":"Name","value":"receivedBy"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"customerCreditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentCode"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"method"}}]}},{"kind":"Field","name":{"kind":"Name","value":"codItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"stopName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<FinPaymentQuery, FinPaymentQueryVariables>;
export const FinCreatePaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FinCreatePayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentInInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPaymentIn"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"typeLabel"}},{"kind":"Field","name":{"kind":"Name","value":"notRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payerName"}},{"kind":"Field","name":{"kind":"Name","value":"payerLabel"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"allocatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"unallocatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"bankAccount"}},{"kind":"Field","name":{"kind":"Name","value":"transferNote"}},{"kind":"Field","name":{"kind":"Name","value":"receivedBy"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"customerCreditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentCode"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"method"}}]}},{"kind":"Field","name":{"kind":"Name","value":"codItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"stopName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<FinCreatePaymentMutation, FinCreatePaymentMutationVariables>;
export const FinUpdatePaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FinUpdatePayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePaymentInInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePaymentIn"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"typeLabel"}},{"kind":"Field","name":{"kind":"Name","value":"notRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payerName"}},{"kind":"Field","name":{"kind":"Name","value":"payerLabel"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"allocatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"unallocatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"bankAccount"}},{"kind":"Field","name":{"kind":"Name","value":"transferNote"}},{"kind":"Field","name":{"kind":"Name","value":"receivedBy"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"customerCreditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentCode"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"method"}}]}},{"kind":"Field","name":{"kind":"Name","value":"codItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"stopName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<FinUpdatePaymentMutation, FinUpdatePaymentMutationVariables>;
export const FinCancelPaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FinCancelPayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelPaymentIn"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"typeLabel"}},{"kind":"Field","name":{"kind":"Name","value":"notRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payerName"}},{"kind":"Field","name":{"kind":"Name","value":"payerLabel"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"allocatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"unallocatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"bankAccount"}},{"kind":"Field","name":{"kind":"Name","value":"transferNote"}},{"kind":"Field","name":{"kind":"Name","value":"receivedBy"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"customerCreditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentCode"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"method"}}]}},{"kind":"Field","name":{"kind":"Name","value":"codItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"stopName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<FinCancelPaymentMutation, FinCancelPaymentMutationVariables>;
export const FinAllocatePaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FinAllocatePayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AllocatePaymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allocatePayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"typeLabel"}},{"kind":"Field","name":{"kind":"Name","value":"notRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payerName"}},{"kind":"Field","name":{"kind":"Name","value":"payerLabel"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"allocatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"unallocatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"bankAccount"}},{"kind":"Field","name":{"kind":"Name","value":"transferNote"}},{"kind":"Field","name":{"kind":"Name","value":"receivedBy"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"customerCreditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentCode"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"method"}}]}},{"kind":"Field","name":{"kind":"Name","value":"codItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"stopName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<FinAllocatePaymentMutation, FinAllocatePaymentMutationVariables>;
export const FinUnallocatePaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FinUnallocatePayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"allocationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unallocatePayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"allocationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"allocationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"typeLabel"}},{"kind":"Field","name":{"kind":"Name","value":"notRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payerName"}},{"kind":"Field","name":{"kind":"Name","value":"payerLabel"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"allocatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"unallocatedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"bankAccount"}},{"kind":"Field","name":{"kind":"Name","value":"transferNote"}},{"kind":"Field","name":{"kind":"Name","value":"receivedBy"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"customerCreditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentCode"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"method"}}]}},{"kind":"Field","name":{"kind":"Name","value":"codItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"stopName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}}]} as unknown as DocumentNode<FinUnallocatePaymentMutation, FinUnallocatePaymentMutationVariables>;
export const FinCustomerDebtDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinCustomerDebt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CustomerDebtFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerDebt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"receivable"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdueAmount"}},{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"customerCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"receivable"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdueAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxOverdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"creditLimit"}},{"kind":"Field","name":{"kind":"Name","value":"overLimit"}},{"kind":"Field","name":{"kind":"Name","value":"limitUsagePct"}},{"kind":"Field","name":{"kind":"Name","value":"openOrders"}},{"kind":"Field","name":{"kind":"Name","value":"overdueOrders"}},{"kind":"Field","name":{"kind":"Name","value":"aging"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"d1_15"}},{"kind":"Field","name":{"kind":"Name","value":"d16_30"}},{"kind":"Field","name":{"kind":"Name","value":"d31_60"}},{"kind":"Field","name":{"kind":"Name","value":"d60p"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"orders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderDate"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"allocated"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"overdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"statementCode"}}]}}]}}]}}]} as unknown as DocumentNode<FinCustomerDebtQuery, FinCustomerDebtQueryVariables>;
export const FinSupplierDebtDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinSupplierDebt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SupplierDebtFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"supplierDebt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"rows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"supplier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unpaidTotal"}},{"kind":"Field","name":{"kind":"Name","value":"oldestDays"}},{"kind":"Field","name":{"kind":"Name","value":"unpaidCount"}},{"kind":"Field","name":{"kind":"Name","value":"aging"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"d0_15"}},{"kind":"Field","name":{"kind":"Name","value":"d16_30"}},{"kind":"Field","name":{"kind":"Name","value":"d31_60"}},{"kind":"Field","name":{"kind":"Name","value":"d60p"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ExpenseFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ExpenseFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ExpenseView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"kindLabel"}},{"kind":"Field","name":{"kind":"Name","value":"isCost"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expenseDate"}},{"kind":"Field","name":{"kind":"Name","value":"paidBy"}},{"kind":"Field","name":{"kind":"Name","value":"reimbursable"}},{"kind":"Field","name":{"kind":"Name","value":"paidStatus"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidMethod"}},{"kind":"Field","name":{"kind":"Name","value":"supplierId"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleId"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"supplier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<FinSupplierDebtQuery, FinSupplierDebtQueryVariables>;
export const FinDriverCodHeldDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinDriverCodHeld"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DriverCodHeldFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driverCodHeld"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalHeld"}},{"kind":"Field","name":{"kind":"Name","value":"codWarningAmount"}},{"kind":"Field","name":{"kind":"Name","value":"codWarningDays"}},{"kind":"Field","name":{"kind":"Name","value":"rows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"codCollected"}},{"kind":"Field","name":{"kind":"Name","value":"codRemitted"}},{"kind":"Field","name":{"kind":"Name","value":"codHeld"}},{"kind":"Field","name":{"kind":"Name","value":"oldestHeldAt"}},{"kind":"Field","name":{"kind":"Name","value":"daysHeld"}},{"kind":"Field","name":{"kind":"Name","value":"overAmount"}},{"kind":"Field","name":{"kind":"Name","value":"overDays"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DriverCodItemFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DriverCodItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DriverCodItemView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopId"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"tripCode"}},{"kind":"Field","name":{"kind":"Name","value":"stopSequence"}},{"kind":"Field","name":{"kind":"Name","value":"stopName"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"codExpected"}},{"kind":"Field","name":{"kind":"Name","value":"codActual"}},{"kind":"Field","name":{"kind":"Name","value":"collectedAt"}},{"kind":"Field","name":{"kind":"Name","value":"remitted"}},{"kind":"Field","name":{"kind":"Name","value":"held"}},{"kind":"Field","name":{"kind":"Name","value":"daysHeld"}}]}}]} as unknown as DocumentNode<FinDriverCodHeldQuery, FinDriverCodHeldQueryVariables>;
export const FinDriverLedgerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinDriverLedger"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"driverId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driverLedger"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"driverId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"driverId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"codCollected"}},{"kind":"Field","name":{"kind":"Name","value":"codRemitted"}},{"kind":"Field","name":{"kind":"Name","value":"codHeld"}},{"kind":"Field","name":{"kind":"Name","value":"companyOwesDriver"}},{"kind":"Field","name":{"kind":"Name","value":"tripAdvanceOutstanding"}},{"kind":"Field","name":{"kind":"Name","value":"salaryAdvanceUndeducted"}},{"kind":"Field","name":{"kind":"Name","value":"driverOwesCompany"}},{"kind":"Field","name":{"kind":"Name","value":"netBalance"}},{"kind":"Field","name":{"kind":"Name","value":"oldestHeldAt"}},{"kind":"Field","name":{"kind":"Name","value":"daysHeld"}},{"kind":"Field","name":{"kind":"Name","value":"overAmount"}},{"kind":"Field","name":{"kind":"Name","value":"overDays"}},{"kind":"Field","name":{"kind":"Name","value":"entries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"docCode"}},{"kind":"Field","name":{"kind":"Name","value":"refId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"driverOwes"}},{"kind":"Field","name":{"kind":"Name","value":"companyOwes"}},{"kind":"Field","name":{"kind":"Name","value":"runningBalance"}}]}},{"kind":"Field","name":{"kind":"Name","value":"codItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DriverCodItemFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DriverCodItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DriverCodItemView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopId"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"tripCode"}},{"kind":"Field","name":{"kind":"Name","value":"stopSequence"}},{"kind":"Field","name":{"kind":"Name","value":"stopName"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"codExpected"}},{"kind":"Field","name":{"kind":"Name","value":"codActual"}},{"kind":"Field","name":{"kind":"Name","value":"collectedAt"}},{"kind":"Field","name":{"kind":"Name","value":"remitted"}},{"kind":"Field","name":{"kind":"Name","value":"held"}},{"kind":"Field","name":{"kind":"Name","value":"daysHeld"}}]}}]} as unknown as DocumentNode<FinDriverLedgerQuery, FinDriverLedgerQueryVariables>;
export const FinTripAdvancesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinTripAdvances"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TripAdvanceFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tripAdvances"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"tripCode"}},{"kind":"Field","name":{"kind":"Name","value":"tripStatus"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"advanceAmount"}},{"kind":"Field","name":{"kind":"Name","value":"spentFromAdvance"}},{"kind":"Field","name":{"kind":"Name","value":"actualCost"}},{"kind":"Field","name":{"kind":"Name","value":"returned"}},{"kind":"Field","name":{"kind":"Name","value":"reimbursed"}},{"kind":"Field","name":{"kind":"Name","value":"difference"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"resolution"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]}}]} as unknown as DocumentNode<FinTripAdvancesQuery, FinTripAdvancesQueryVariables>;
export const FinReconcileTripAdvanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FinReconcileTripAdvance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReconcileTripAdvanceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reconcileTripAdvance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"resolution"}},{"kind":"Field","name":{"kind":"Name","value":"difference"}}]}}]}}]} as unknown as DocumentNode<FinReconcileTripAdvanceMutation, FinReconcileTripAdvanceMutationVariables>;
export const FinLedgerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinLedger"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"FinanceLedgerFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"financeLedger"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"summary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cashIn"}},{"kind":"Field","name":{"kind":"Name","value":"customerReceipts"}},{"kind":"Field","name":{"kind":"Name","value":"codRemittances"}},{"kind":"Field","name":{"kind":"Name","value":"advanceReturns"}},{"kind":"Field","name":{"kind":"Name","value":"otherIn"}},{"kind":"Field","name":{"kind":"Name","value":"cashOut"}},{"kind":"Field","name":{"kind":"Name","value":"unpaidOut"}},{"kind":"Field","name":{"kind":"Name","value":"driverPaidOut"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"typeLabel"}},{"kind":"Field","name":{"kind":"Name","value":"counterpart"}},{"kind":"Field","name":{"kind":"Name","value":"links"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"notRevenue"}},{"kind":"Field","name":{"kind":"Name","value":"cashMoved"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}}]}}]}}]}}]} as unknown as DocumentNode<FinLedgerQuery, FinLedgerQueryVariables>;
export const FinPickersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinPickers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driverOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"activeOnly"},"value":{"kind":"BooleanValue","value":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"busy"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicleOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"activeOnly"},"value":{"kind":"BooleanValue","value":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"supplierOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"activeOnly"},"value":{"kind":"BooleanValue","value":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}}]}}]}}]} as unknown as DocumentNode<FinPickersQuery, FinPickersQueryVariables>;
export const FinCustomerOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinCustomerOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"30"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}}]}}]}}]}}]} as unknown as DocumentNode<FinCustomerOptionsQuery, FinCustomerOptionsQueryVariables>;
export const FinOrderOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinOrderOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"30"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<FinOrderOptionsQuery, FinOrderOptionsQueryVariables>;
export const FinTripOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinTripOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trips"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"30"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<FinTripOptionsQuery, FinTripOptionsQueryVariables>;
export const FinExpenseCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinExpenseCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"catalogItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"EnumValue","value":"EXPENSE_CATEGORY"}},{"kind":"Argument","name":{"kind":"Name","value":"activeOnly"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"appliesTo"}},{"kind":"Field","name":{"kind":"Name","value":"active"}}]}}]}}]} as unknown as DocumentNode<FinExpenseCategoriesQuery, FinExpenseCategoriesQueryVariables>;
export const OrdExportFileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdExportFile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ExportFileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exportFile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"rowCount"}}]}}]}}]} as unknown as DocumentNode<OrdExportFileMutation, OrdExportFileMutationVariables>;
export const OrdOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrdOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderListFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderDate"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"freightAmount"}},{"kind":"Field","name":{"kind":"Name","value":"addonTotal"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"remainingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"overdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"tripCount"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}}]}}]} as unknown as DocumentNode<OrdOrdersQuery, OrdOrdersQueryVariables>;
export const OrdOrderTotalsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrdOrderTotals"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderTotals"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"remainingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"overdueAmount"}}]}}]}}]} as unknown as DocumentNode<OrdOrderTotalsQuery, OrdOrderTotalsQueryVariables>;
export const OrdOrderDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrdOrderDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderDate"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"overdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"internalNote"}},{"kind":"Field","name":{"kind":"Name","value":"freightAmount"}},{"kind":"Field","name":{"kind":"Name","value":"addonTotal"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"paidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"remainingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"priceLocked"}},{"kind":"Field","name":{"kind":"Name","value":"bookingId"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"confirmedAt"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"tripCount"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentCount"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"customerWarnings"}},{"kind":"Field","name":{"kind":"Name","value":"requiredVehicleTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"requiredVehicleTypeName"}},{"kind":"Field","name":{"kind":"Name","value":"requiredCapacityTons"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"sequence"}},{"kind":"Field","name":{"kind":"Name","value":"locationId"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"plannedAt"}},{"kind":"Field","name":{"kind":"Name","value":"codExpected"}},{"kind":"Field","name":{"kind":"Name","value":"codActual"}},{"kind":"Field","name":{"kind":"Name","value":"codCollectedAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"arrivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"skipReason"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"podCount"}},{"kind":"Field","name":{"kind":"Name","value":"tripIds"}},{"kind":"Field","name":{"kind":"Name","value":"tripCodes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cargoLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"cargoTypeId"}},{"kind":"Field","name":{"kind":"Name","value":"cargoTypeName"}},{"kind":"Field","name":{"kind":"Name","value":"weightKg"}},{"kind":"Field","name":{"kind":"Name","value":"volumeM3"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"packagingUnit"}},{"kind":"Field","name":{"kind":"Name","value":"properties"}},{"kind":"Field","name":{"kind":"Name","value":"declaredValue"}},{"kind":"Field","name":{"kind":"Name","value":"pickupStopId"}},{"kind":"Field","name":{"kind":"Name","value":"dropoffStopId"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}},{"kind":"Field","name":{"kind":"Name","value":"addons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"serviceId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trips"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderTripFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"financeSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"freight"}},{"kind":"Field","name":{"kind":"Name","value":"addonTotal"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"receivable"}},{"kind":"Field","name":{"kind":"Name","value":"paidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"remainingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"overdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"expenseTotal"}},{"kind":"Field","name":{"kind":"Name","value":"outsourcedCost"}},{"kind":"Field","name":{"kind":"Name","value":"tripCost"}},{"kind":"Field","name":{"kind":"Name","value":"otherCost"}},{"kind":"Field","name":{"kind":"Name","value":"profit"}},{"kind":"Field","name":{"kind":"Name","value":"margin"}},{"kind":"Field","name":{"kind":"Name","value":"provisional"}},{"kind":"Field","name":{"kind":"Name","value":"driverBonusTotal"}},{"kind":"Field","name":{"kind":"Name","value":"allocations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"paymentId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentCode"}},{"kind":"Field","name":{"kind":"Name","value":"receivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"paidBy"}},{"kind":"Field","name":{"kind":"Name","value":"paidStatus"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isCost"}},{"kind":"Field","name":{"kind":"Name","value":"tripCode"}},{"kind":"Field","name":{"kind":"Name","value":"supplierName"}},{"kind":"Field","name":{"kind":"Name","value":"expenseDate"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"incidents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"externalTransports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"tripCode"}},{"kind":"Field","name":{"kind":"Name","value":"supplierId"}},{"kind":"Field","name":{"kind":"Name","value":"supplierName"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"driverPhone"}},{"kind":"Field","name":{"kind":"Name","value":"agreedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderTripFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TripView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"plannedEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"driverBonusAmount"}},{"kind":"Field","name":{"kind":"Name","value":"isExternal"}},{"kind":"Field","name":{"kind":"Name","value":"hasWarning"}},{"kind":"Field","name":{"kind":"Name","value":"stopCount"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"openIncidentCount"}},{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"typeName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"driver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sequence"}}]}}]}}]} as unknown as DocumentNode<OrdOrderDetailQuery, OrdOrderDetailQueryVariables>;
export const OrdOrderStopDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrdOrderStop"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderStop"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"sequence"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"plannedAt"}},{"kind":"Field","name":{"kind":"Name","value":"arrivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"codExpected"}},{"kind":"Field","name":{"kind":"Name","value":"codActual"}},{"kind":"Field","name":{"kind":"Name","value":"codCollectedAt"}},{"kind":"Field","name":{"kind":"Name","value":"codNote"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"skipReason"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"podCount"}},{"kind":"Field","name":{"kind":"Name","value":"tripIds"}},{"kind":"Field","name":{"kind":"Name","value":"tripCodes"}},{"kind":"Field","name":{"kind":"Name","value":"podAttachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AttachmentFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"actorName"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"fromStatus"}},{"kind":"Field","name":{"kind":"Name","value":"toStatus"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AttachmentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AttachmentView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedByType"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedByName"}},{"kind":"Field","name":{"kind":"Name","value":"capturedAt"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithCustomer"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]} as unknown as DocumentNode<OrdOrderStopQuery, OrdOrderStopQueryVariables>;
export const OrdCreateOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdCreateOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}}]}}]}}]} as unknown as DocumentNode<OrdCreateOrderMutation, OrdCreateOrderMutationVariables>;
export const OrdUpdateOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdUpdateOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateOrderInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<OrdUpdateOrderMutation, OrdUpdateOrderMutationVariables>;
export const OrdUpdateOrderPricingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdUpdateOrderPricing"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderPricingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrderPricing"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"freightAmount"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}}]}}]}}]} as unknown as DocumentNode<OrdUpdateOrderPricingMutation, OrdUpdateOrderPricingMutationVariables>;
export const OrdUpdateOrderStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdUpdateOrderStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"note"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrderStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}},{"kind":"Argument","name":{"kind":"Name","value":"note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"note"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<OrdUpdateOrderStatusMutation, OrdUpdateOrderStatusMutationVariables>;
export const OrdCancelOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdCancelOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<OrdCancelOrderMutation, OrdCancelOrderMutationVariables>;
export const OrdCreateOrderStopDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdCreateOrderStop"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderStopInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrderStop"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<OrdCreateOrderStopMutation, OrdCreateOrderStopMutationVariables>;
export const OrdUpdateOrderStopDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdUpdateOrderStop"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderStopInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrderStop"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<OrdUpdateOrderStopMutation, OrdUpdateOrderStopMutationVariables>;
export const OrdReorderOrderStopsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdReorderOrderStops"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"stopIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reorderOrderStops"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"stopIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stopIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<OrdReorderOrderStopsMutation, OrdReorderOrderStopsMutationVariables>;
export const OrdRemoveOrderStopDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdRemoveOrderStop"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeOrderStop"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<OrdRemoveOrderStopMutation, OrdRemoveOrderStopMutationVariables>;
export const OrdUpsertCargoLineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdUpsertCargoLine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CargoLineInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertCargoLine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<OrdUpsertCargoLineMutation, OrdUpsertCargoLineMutationVariables>;
export const OrdDeleteCargoLineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdDeleteCargoLine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCargoLine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<OrdDeleteCargoLineMutation, OrdDeleteCargoLineMutationVariables>;
export const OrdUpdateStopStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdUpdateStopStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"actualAt"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateStopStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}},{"kind":"Argument","name":{"kind":"Name","value":"tripId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}}},{"kind":"Argument","name":{"kind":"Name","value":"actualAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"actualAt"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderStatus"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}}]}}]}}]} as unknown as DocumentNode<OrdUpdateStopStatusMutation, OrdUpdateStopStatusMutationVariables>;
export const OrdUpdateStopCodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdUpdateStopCod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"note"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateStopCodActual"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}},{"kind":"Argument","name":{"kind":"Name","value":"note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"note"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"codActual"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}}]}}]}}]} as unknown as DocumentNode<OrdUpdateStopCodMutation, OrdUpdateStopCodMutationVariables>;
export const OrdCustomerPickDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrdCustomerPick"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"30"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"defaultDebtDays"}},{"kind":"Field","name":{"kind":"Name","value":"creditLimit"}},{"kind":"Field","name":{"kind":"Name","value":"debtSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"overdueOrders"}}]}}]}}]}}]}}]} as unknown as DocumentNode<OrdCustomerPickQuery, OrdCustomerPickQueryVariables>;
export const OrdCustomerLocationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrdCustomerLocations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerLocations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"usage"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"lat"}},{"kind":"Field","name":{"kind":"Name","value":"lng"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]}}]} as unknown as DocumentNode<OrdCustomerLocationsQuery, OrdCustomerLocationsQueryVariables>;
export const OrdCreditCheckDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrdCreditCheck"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"additionalAmount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerCreditCheck"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}},{"kind":"Argument","name":{"kind":"Name","value":"additionalAmount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"additionalAmount"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"overLimit"}},{"kind":"Field","name":{"kind":"Name","value":"currentDebt"}},{"kind":"Field","name":{"kind":"Name","value":"projectedDebt"}},{"kind":"Field","name":{"kind":"Name","value":"creditLimit"}},{"kind":"Field","name":{"kind":"Name","value":"overdueOrders"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}}]}}]}}]} as unknown as DocumentNode<OrdCreditCheckQuery, OrdCreditCheckQueryVariables>;
export const OrdSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrdSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"merchantSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"defaultDebtDays"}},{"kind":"Field","name":{"kind":"Name","value":"defaultTripHours"}},{"kind":"Field","name":{"kind":"Name","value":"nearOverlapMinutes"}}]}}]}}]} as unknown as DocumentNode<OrdSettingsQuery, OrdSettingsQueryVariables>;
export const OrdOrderFinanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrdOrderFinance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderFinance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"freightAmount"}},{"kind":"Field","name":{"kind":"Name","value":"addonTotal"}},{"kind":"Field","name":{"kind":"Name","value":"receivable"}},{"kind":"Field","name":{"kind":"Name","value":"paidAmount"}},{"kind":"Field","name":{"kind":"Name","value":"remainingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"tripCost"}},{"kind":"Field","name":{"kind":"Name","value":"outsourcedCost"}},{"kind":"Field","name":{"kind":"Name","value":"otherCost"}},{"kind":"Field","name":{"kind":"Name","value":"profit"}},{"kind":"Field","name":{"kind":"Name","value":"margin"}},{"kind":"Field","name":{"kind":"Name","value":"provisional"}}]}}]}}]} as unknown as DocumentNode<OrdOrderFinanceQuery, OrdOrderFinanceQueryVariables>;
export const OrdRenderDocumentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdRenderDocument"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RenderDocumentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"renderDocument"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"template"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"html"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentId"}}]}}]}}]} as unknown as DocumentNode<OrdRenderDocumentMutation, OrdRenderDocumentMutationVariables>;
export const OrdBookingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrdBookings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"BookingFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bookings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BookingFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BookingFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BookingView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cargoName"}},{"kind":"Field","name":{"kind":"Name","value":"weightTon"}},{"kind":"Field","name":{"kind":"Name","value":"packages"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleTypeHint"}},{"kind":"Field","name":{"kind":"Name","value":"fragile"}},{"kind":"Field","name":{"kind":"Name","value":"loadingAtPickup"}},{"kind":"Field","name":{"kind":"Name","value":"loadingAtDrop"}},{"kind":"Field","name":{"kind":"Name","value":"pickupFrom"}},{"kind":"Field","name":{"kind":"Name","value":"deliverBefore"}},{"kind":"Field","name":{"kind":"Name","value":"flexibility"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"rejectReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"accountName"}},{"kind":"Field","name":{"kind":"Name","value":"accountEmail"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"stops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]}}]} as unknown as DocumentNode<OrdBookingsQuery, OrdBookingsQueryVariables>;
export const OrdBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrdBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"booking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BookingFields"}},{"kind":"Field","name":{"kind":"Name","value":"notes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"authorType"}},{"kind":"Field","name":{"kind":"Name","value":"authorName"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fromStatus"}},{"kind":"Field","name":{"kind":"Name","value":"toStatus"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"actorName"}},{"kind":"Field","name":{"kind":"Name","value":"changedAt"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BookingFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BookingView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"cargoName"}},{"kind":"Field","name":{"kind":"Name","value":"weightTon"}},{"kind":"Field","name":{"kind":"Name","value":"packages"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleTypeHint"}},{"kind":"Field","name":{"kind":"Name","value":"fragile"}},{"kind":"Field","name":{"kind":"Name","value":"loadingAtPickup"}},{"kind":"Field","name":{"kind":"Name","value":"loadingAtDrop"}},{"kind":"Field","name":{"kind":"Name","value":"pickupFrom"}},{"kind":"Field","name":{"kind":"Name","value":"deliverBefore"}},{"kind":"Field","name":{"kind":"Name","value":"flexibility"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"rejectReason"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"accountName"}},{"kind":"Field","name":{"kind":"Name","value":"accountEmail"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"stops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"locationName"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"contactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]}}]} as unknown as DocumentNode<OrdBookingQuery, OrdBookingQueryVariables>;
export const OrdAcceptBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdAcceptBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"customerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<OrdAcceptBookingMutation, OrdAcceptBookingMutationVariables>;
export const OrdRejectBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdRejectBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rejectBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<OrdRejectBookingMutation, OrdRejectBookingMutationVariables>;
export const OrdAddBookingNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrdAddBookingNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"bookingId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"body"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addBookingNote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"bookingId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"bookingId"}}},{"kind":"Argument","name":{"kind":"Name","value":"body"},"value":{"kind":"Variable","name":{"kind":"Name","value":"body"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<OrdAddBookingNoteMutation, OrdAddBookingNoteMutationVariables>;
export const OrdOrderAttachmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrdOrderAttachments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderAttachments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AttachmentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AttachmentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AttachmentView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedByType"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedByName"}},{"kind":"Field","name":{"kind":"Name","value":"capturedAt"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithCustomer"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]} as unknown as DocumentNode<OrdOrderAttachmentsQuery, OrdOrderAttachmentsQueryVariables>;
export const PrPayrollsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PrPayrolls"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payrolls"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrPayrollFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrTotalsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollTotalsView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driverCount"}},{"kind":"Field","name":{"kind":"Name","value":"salary"}},{"kind":"Field","name":{"kind":"Name","value":"bonus"}},{"kind":"Field","name":{"kind":"Name","value":"advance"}},{"kind":"Field","name":{"kind":"Name","value":"deduction"}},{"kind":"Field","name":{"kind":"Name","value":"adjustment"}},{"kind":"Field","name":{"kind":"Name","value":"net"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrPayrollFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"periodLabel"}},{"kind":"Field","name":{"kind":"Name","value":"periodFrom"}},{"kind":"Field","name":{"kind":"Name","value":"periodTo"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"anomalyCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}},{"kind":"Field","name":{"kind":"Name","value":"submittedByName"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"approvedByName"}},{"kind":"Field","name":{"kind":"Name","value":"approvalNote"}},{"kind":"Field","name":{"kind":"Name","value":"returnedAt"}},{"kind":"Field","name":{"kind":"Name","value":"returnReason"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidByName"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"totals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrTotalsFields"}}]}}]}}]} as unknown as DocumentNode<PrPayrollsQuery, PrPayrollsQueryVariables>;
export const PrPayrollDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PrPayroll"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payroll"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrPayrollFields"}},{"kind":"Field","name":{"kind":"Name","value":"previousCode"}},{"kind":"Field","name":{"kind":"Name","value":"previousTotals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrTotalsFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"changes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrLineFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrTotalsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollTotalsView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driverCount"}},{"kind":"Field","name":{"kind":"Name","value":"salary"}},{"kind":"Field","name":{"kind":"Name","value":"bonus"}},{"kind":"Field","name":{"kind":"Name","value":"advance"}},{"kind":"Field","name":{"kind":"Name","value":"deduction"}},{"kind":"Field","name":{"kind":"Name","value":"adjustment"}},{"kind":"Field","name":{"kind":"Name","value":"net"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrPayrollFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"periodLabel"}},{"kind":"Field","name":{"kind":"Name","value":"periodFrom"}},{"kind":"Field","name":{"kind":"Name","value":"periodTo"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"anomalyCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}},{"kind":"Field","name":{"kind":"Name","value":"submittedAt"}},{"kind":"Field","name":{"kind":"Name","value":"submittedByName"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"approvedByName"}},{"kind":"Field","name":{"kind":"Name","value":"approvalNote"}},{"kind":"Field","name":{"kind":"Name","value":"returnedAt"}},{"kind":"Field","name":{"kind":"Name","value":"returnReason"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidByName"}},{"kind":"Field","name":{"kind":"Name","value":"cancelledAt"}},{"kind":"Field","name":{"kind":"Name","value":"cancelReason"}},{"kind":"Field","name":{"kind":"Name","value":"totals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrTotalsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollLineView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"payrollId"}},{"kind":"Field","name":{"kind":"Name","value":"payrollCode"}},{"kind":"Field","name":{"kind":"Name","value":"payrollStatus"}},{"kind":"Field","name":{"kind":"Name","value":"periodLabel"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"driverCode"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"baseSalary"}},{"kind":"Field","name":{"kind":"Name","value":"salaryEffectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"bonusTotal"}},{"kind":"Field","name":{"kind":"Name","value":"advanceTotal"}},{"kind":"Field","name":{"kind":"Name","value":"deductionTotal"}},{"kind":"Field","name":{"kind":"Name","value":"adjustmentTotal"}},{"kind":"Field","name":{"kind":"Name","value":"netAmount"}},{"kind":"Field","name":{"kind":"Name","value":"anomalies"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]} as unknown as DocumentNode<PrPayrollQuery, PrPayrollQueryVariables>;
export const PrPayrollLineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PrPayrollLine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payrollLine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"excluded"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollLineView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"payrollId"}},{"kind":"Field","name":{"kind":"Name","value":"payrollCode"}},{"kind":"Field","name":{"kind":"Name","value":"payrollStatus"}},{"kind":"Field","name":{"kind":"Name","value":"periodLabel"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"driverCode"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"baseSalary"}},{"kind":"Field","name":{"kind":"Name","value":"salaryEffectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"bonusTotal"}},{"kind":"Field","name":{"kind":"Name","value":"advanceTotal"}},{"kind":"Field","name":{"kind":"Name","value":"deductionTotal"}},{"kind":"Field","name":{"kind":"Name","value":"adjustmentTotal"}},{"kind":"Field","name":{"kind":"Name","value":"netAmount"}},{"kind":"Field","name":{"kind":"Name","value":"anomalies"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollItemView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"sourceRef"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"expenseId"}},{"kind":"Field","name":{"kind":"Name","value":"itemDate"}},{"kind":"Field","name":{"kind":"Name","value":"reasonId"}},{"kind":"Field","name":{"kind":"Name","value":"reasonName"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}}]}}]} as unknown as DocumentNode<PrPayrollLineQuery, PrPayrollLineQueryVariables>;
export const PrDriverPayrollLinesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PrDriverPayrollLines"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"driverId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driverPayrollLines"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"driverId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"driverId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrLineFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollLineView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"payrollId"}},{"kind":"Field","name":{"kind":"Name","value":"payrollCode"}},{"kind":"Field","name":{"kind":"Name","value":"payrollStatus"}},{"kind":"Field","name":{"kind":"Name","value":"periodLabel"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"driverCode"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"baseSalary"}},{"kind":"Field","name":{"kind":"Name","value":"salaryEffectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"bonusTotal"}},{"kind":"Field","name":{"kind":"Name","value":"advanceTotal"}},{"kind":"Field","name":{"kind":"Name","value":"deductionTotal"}},{"kind":"Field","name":{"kind":"Name","value":"adjustmentTotal"}},{"kind":"Field","name":{"kind":"Name","value":"netAmount"}},{"kind":"Field","name":{"kind":"Name","value":"anomalies"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]} as unknown as DocumentNode<PrDriverPayrollLinesQuery, PrDriverPayrollLinesQueryVariables>;
export const PrPreviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PrPreview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GeneratePayrollInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payrollPreview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"periodLabel"}},{"kind":"Field","name":{"kind":"Name","value":"periodFrom"}},{"kind":"Field","name":{"kind":"Name","value":"periodTo"}},{"kind":"Field","name":{"kind":"Name","value":"conflictPayrollCode"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"totals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrTotalsFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PrItemFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrTotalsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollTotalsView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driverCount"}},{"kind":"Field","name":{"kind":"Name","value":"salary"}},{"kind":"Field","name":{"kind":"Name","value":"bonus"}},{"kind":"Field","name":{"kind":"Name","value":"advance"}},{"kind":"Field","name":{"kind":"Name","value":"deduction"}},{"kind":"Field","name":{"kind":"Name","value":"adjustment"}},{"kind":"Field","name":{"kind":"Name","value":"net"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollLineView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"payrollId"}},{"kind":"Field","name":{"kind":"Name","value":"payrollCode"}},{"kind":"Field","name":{"kind":"Name","value":"payrollStatus"}},{"kind":"Field","name":{"kind":"Name","value":"periodLabel"}},{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"driverCode"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"baseSalary"}},{"kind":"Field","name":{"kind":"Name","value":"salaryEffectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"bonusTotal"}},{"kind":"Field","name":{"kind":"Name","value":"advanceTotal"}},{"kind":"Field","name":{"kind":"Name","value":"deductionTotal"}},{"kind":"Field","name":{"kind":"Name","value":"adjustmentTotal"}},{"kind":"Field","name":{"kind":"Name","value":"netAmount"}},{"kind":"Field","name":{"kind":"Name","value":"anomalies"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PrItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollItemView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"sourceRef"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"expenseId"}},{"kind":"Field","name":{"kind":"Name","value":"itemDate"}},{"kind":"Field","name":{"kind":"Name","value":"reasonId"}},{"kind":"Field","name":{"kind":"Name","value":"reasonName"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"createdByName"}}]}}]} as unknown as DocumentNode<PrPreviewQuery, PrPreviewQueryVariables>;
export const PrGenerateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PrGenerate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GeneratePayrollInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generatePayroll"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]} as unknown as DocumentNode<PrGenerateMutation, PrGenerateMutationVariables>;
export const PrAddItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PrAddItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PayrollItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addPayrollItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"netAmount"}}]}}]}}]} as unknown as DocumentNode<PrAddItemMutation, PrAddItemMutationVariables>;
export const PrRemoveItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PrRemoveItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removePayrollItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"netAmount"}}]}}]}}]} as unknown as DocumentNode<PrRemoveItemMutation, PrRemoveItemMutationVariables>;
export const PrSubmitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PrSubmit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitPayroll"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<PrSubmitMutation, PrSubmitMutationVariables>;
export const PrApproveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PrApprove"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"note"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"approvePayroll"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"note"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<PrApproveMutation, PrApproveMutationVariables>;
export const PrReturnDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PrReturn"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"returnPayroll"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<PrReturnMutation, PrReturnMutationVariables>;
export const PrMarkPaidDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PrMarkPaid"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"paidAt"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markPayrollPaid"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"paidAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"paidAt"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<PrMarkPaidMutation, PrMarkPaidMutationVariables>;
export const PrCancelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PrCancel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelPayroll"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<PrCancelMutation, PrCancelMutationVariables>;
export const PrDriverOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PrDriverOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driverOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"activeOnly"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<PrDriverOptionsQuery, PrDriverOptionsQueryVariables>;
export const RptSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RptSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reportSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"group"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"route"}}]}}]}}]} as unknown as DocumentNode<RptSummaryQuery, RptSummaryQueryVariables>;
export const RptProfitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RptProfit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reportProfit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dateFrom"}},{"kind":"Field","name":{"kind":"Name","value":"dateTo"}},{"kind":"Field","name":{"kind":"Name","value":"groupBy"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"rows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RptProfitRowFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RptProfitRowFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RptProfitRowFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProfitRow"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"sublabel"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"freight"}},{"kind":"Field","name":{"kind":"Name","value":"addons"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"tripCost"}},{"kind":"Field","name":{"kind":"Name","value":"outsourcedCost"}},{"kind":"Field","name":{"kind":"Name","value":"otherCost"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"profit"}},{"kind":"Field","name":{"kind":"Name","value":"margin"}},{"kind":"Field","name":{"kind":"Name","value":"orderCount"}},{"kind":"Field","name":{"kind":"Name","value":"isProvisional"}}]}}]} as unknown as DocumentNode<RptProfitQuery, RptProfitQueryVariables>;
export const RptVehiclesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RptVehicles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reportVehicles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vehicleId"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"tripCount"}},{"kind":"Field","name":{"kind":"Name","value":"activeDays"}},{"kind":"Field","name":{"kind":"Name","value":"utilization"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"vehicleCost"}},{"kind":"Field","name":{"kind":"Name","value":"tripCost"}},{"kind":"Field","name":{"kind":"Name","value":"grossProfit"}}]}}]}}]} as unknown as DocumentNode<RptVehiclesQuery, RptVehiclesQueryVariables>;
export const RptDriversDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RptDrivers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reportDrivers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"completedTrips"}},{"kind":"Field","name":{"kind":"Name","value":"onTimeRate"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"bonusTotal"}},{"kind":"Field","name":{"kind":"Name","value":"codHeld"}},{"kind":"Field","name":{"kind":"Name","value":"incidents"}}]}}]}}]} as unknown as DocumentNode<RptDriversQuery, RptDriversQueryVariables>;
export const RptCustomerDebtDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RptCustomerDebt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reportCustomerDebt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalDebt"}},{"kind":"Field","name":{"kind":"Name","value":"totalOverdue"}},{"kind":"Field","name":{"kind":"Name","value":"totalCredit"}},{"kind":"Field","name":{"kind":"Name","value":"aging"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RptAgingFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"creditLimit"}},{"kind":"Field","name":{"kind":"Name","value":"receivable"}},{"kind":"Field","name":{"kind":"Name","value":"paid"}},{"kind":"Field","name":{"kind":"Name","value":"totalDebt"}},{"kind":"Field","name":{"kind":"Name","value":"overdue"}},{"kind":"Field","name":{"kind":"Name","value":"maxOverdueDays"}},{"kind":"Field","name":{"kind":"Name","value":"creditBalance"}},{"kind":"Field","name":{"kind":"Name","value":"openOrders"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"aging"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RptAgingFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RptAgingFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AgingReportView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"d1_15"}},{"kind":"Field","name":{"kind":"Name","value":"d16_30"}},{"kind":"Field","name":{"kind":"Name","value":"d31_60"}},{"kind":"Field","name":{"kind":"Name","value":"d60p"}}]}}]} as unknown as DocumentNode<RptCustomerDebtQuery, RptCustomerDebtQueryVariables>;
export const RptCodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RptCod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reportCodHeld"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalHeld"}},{"kind":"Field","name":{"kind":"Name","value":"thresholdAmount"}},{"kind":"Field","name":{"kind":"Name","value":"thresholdDays"}},{"kind":"Field","name":{"kind":"Name","value":"overThresholdCount"}},{"kind":"Field","name":{"kind":"Name","value":"rows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"codCollected"}},{"kind":"Field","name":{"kind":"Name","value":"codRemitted"}},{"kind":"Field","name":{"kind":"Name","value":"codHeld"}},{"kind":"Field","name":{"kind":"Name","value":"heldDays"}},{"kind":"Field","name":{"kind":"Name","value":"oldestHeldAt"}},{"kind":"Field","name":{"kind":"Name","value":"overAmount"}},{"kind":"Field","name":{"kind":"Name","value":"overDays"}}]}}]}}]}}]} as unknown as DocumentNode<RptCodQuery, RptCodQueryVariables>;
export const RptPayrollDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RptPayroll"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reportPayroll"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payrollId"}},{"kind":"Field","name":{"kind":"Name","value":"payrollCode"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"driverCount"}},{"kind":"Field","name":{"kind":"Name","value":"salary"}},{"kind":"Field","name":{"kind":"Name","value":"bonus"}},{"kind":"Field","name":{"kind":"Name","value":"advance"}},{"kind":"Field","name":{"kind":"Name","value":"deduction"}},{"kind":"Field","name":{"kind":"Name","value":"adjustment"}},{"kind":"Field","name":{"kind":"Name","value":"net"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"byDriver"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"driverId"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"salary"}},{"kind":"Field","name":{"kind":"Name","value":"bonus"}},{"kind":"Field","name":{"kind":"Name","value":"advance"}},{"kind":"Field","name":{"kind":"Name","value":"deduction"}},{"kind":"Field","name":{"kind":"Name","value":"adjustment"}},{"kind":"Field","name":{"kind":"Name","value":"net"}}]}}]}}]}}]} as unknown as DocumentNode<RptPayrollQuery, RptPayrollQueryVariables>;
export const MerchantProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MerchantProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"merchantProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"legalName"}},{"kind":"Field","name":{"kind":"Name","value":"taxCode"}},{"kind":"Field","name":{"kind":"Name","value":"businessType"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"district"}},{"kind":"Field","name":{"kind":"Name","value":"yardName"}},{"kind":"Field","name":{"kind":"Name","value":"representativeName"}},{"kind":"Field","name":{"kind":"Name","value":"representativeTitle"}},{"kind":"Field","name":{"kind":"Name","value":"contactName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"dispatchHotline"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"intro"}},{"kind":"Field","name":{"kind":"Name","value":"logoAttachmentId"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"publicProfile"}},{"kind":"Field","name":{"kind":"Name","value":"serviceAreas"}},{"kind":"Field","name":{"kind":"Name","value":"services"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<MerchantProfileQuery, MerchantProfileQueryVariables>;
export const UpdateMerchantProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMerchantProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MerchantProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMerchantProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logoAttachmentId"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateMerchantProfileMutation, UpdateMerchantProfileMutationVariables>;
export const MerchantSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MerchantSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"merchantSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payrollPeriodType"}},{"kind":"Field","name":{"kind":"Name","value":"payrollStartDay"}},{"kind":"Field","name":{"kind":"Name","value":"nearOverlapMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"defaultTripHours"}},{"kind":"Field","name":{"kind":"Name","value":"overlapWarnVehicle"}},{"kind":"Field","name":{"kind":"Name","value":"overlapWarnDriver"}},{"kind":"Field","name":{"kind":"Name","value":"codWarningAmount"}},{"kind":"Field","name":{"kind":"Name","value":"codWarningDays"}},{"kind":"Field","name":{"kind":"Name","value":"codDashboardAlert"}},{"kind":"Field","name":{"kind":"Name","value":"defaultDebtDays"}},{"kind":"Field","name":{"kind":"Name","value":"defaultCreditLimit"}},{"kind":"Field","name":{"kind":"Name","value":"warnOverLimit"}},{"kind":"Field","name":{"kind":"Name","value":"warnOverdue"}},{"kind":"Field","name":{"kind":"Name","value":"gpsRetentionDays"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<MerchantSettingsQuery, MerchantSettingsQueryVariables>;
export const UpdateMerchantSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMerchantSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MerchantSettingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMerchantSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payrollPeriodType"}},{"kind":"Field","name":{"kind":"Name","value":"payrollStartDay"}},{"kind":"Field","name":{"kind":"Name","value":"nearOverlapMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"defaultTripHours"}},{"kind":"Field","name":{"kind":"Name","value":"overlapWarnVehicle"}},{"kind":"Field","name":{"kind":"Name","value":"overlapWarnDriver"}},{"kind":"Field","name":{"kind":"Name","value":"codWarningAmount"}},{"kind":"Field","name":{"kind":"Name","value":"codWarningDays"}},{"kind":"Field","name":{"kind":"Name","value":"codDashboardAlert"}},{"kind":"Field","name":{"kind":"Name","value":"defaultDebtDays"}},{"kind":"Field","name":{"kind":"Name","value":"defaultCreditLimit"}},{"kind":"Field","name":{"kind":"Name","value":"warnOverLimit"}},{"kind":"Field","name":{"kind":"Name","value":"warnOverdue"}},{"kind":"Field","name":{"kind":"Name","value":"gpsRetentionDays"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateMerchantSettingsMutation, UpdateMerchantSettingsMutationVariables>;
export const NumberSequencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NumberSequences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"numberSequences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"docType"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"prefix"}},{"kind":"Field","name":{"kind":"Name","value":"separator"}},{"kind":"Field","name":{"kind":"Name","value":"datePart"}},{"kind":"Field","name":{"kind":"Name","value":"digits"}},{"kind":"Field","name":{"kind":"Name","value":"resetPeriod"}},{"kind":"Field","name":{"kind":"Name","value":"pattern"}},{"kind":"Field","name":{"kind":"Name","value":"nextValue"}},{"kind":"Field","name":{"kind":"Name","value":"issuedThisPeriod"}}]}}]}}]} as unknown as DocumentNode<NumberSequencesQuery, NumberSequencesQueryVariables>;
export const UpdateNumberFormatDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateNumberFormat"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"docType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DocType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NumberFormatInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateNumberSequenceFormat"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"docType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"docType"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"docType"}},{"kind":"Field","name":{"kind":"Name","value":"prefix"}},{"kind":"Field","name":{"kind":"Name","value":"separator"}},{"kind":"Field","name":{"kind":"Name","value":"datePart"}},{"kind":"Field","name":{"kind":"Name","value":"digits"}},{"kind":"Field","name":{"kind":"Name","value":"resetPeriod"}},{"kind":"Field","name":{"kind":"Name","value":"pattern"}},{"kind":"Field","name":{"kind":"Name","value":"nextValue"}},{"kind":"Field","name":{"kind":"Name","value":"issuedThisPeriod"}}]}}]}}]} as unknown as DocumentNode<UpdateNumberFormatMutation, UpdateNumberFormatMutationVariables>;
export const ResetMerchantUserAppPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetMerchantUserAppPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"phone"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetMerchantUserAppPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"phone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"phone"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"tempPassword"}}]}}]}}]} as unknown as DocumentNode<ResetMerchantUserAppPasswordMutation, ResetMerchantUserAppPasswordMutationVariables>;
export const DisableMerchantUserAppLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DisableMerchantUserAppLogin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"disableMerchantUserAppLogin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MerchantUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MerchantUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MerchantUserView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"extraPermissions"}},{"kind":"Field","name":{"kind":"Name","value":"effectivePermissions"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"invitedByName"}},{"kind":"Field","name":{"kind":"Name","value":"invitedAt"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastAccessAt"}},{"kind":"Field","name":{"kind":"Name","value":"isSelf"}},{"kind":"Field","name":{"kind":"Name","value":"appLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"hasPassword"}},{"kind":"Field","name":{"kind":"Name","value":"mustChangePassword"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithOtherMerchants"}}]}}]}}]} as unknown as DocumentNode<DisableMerchantUserAppLoginMutation, DisableMerchantUserAppLoginMutationVariables>;
export const MerchantUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MerchantUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MerchantUserFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"merchantUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MerchantUserFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MerchantUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MerchantUserView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"extraPermissions"}},{"kind":"Field","name":{"kind":"Name","value":"effectivePermissions"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"invitedByName"}},{"kind":"Field","name":{"kind":"Name","value":"invitedAt"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastAccessAt"}},{"kind":"Field","name":{"kind":"Name","value":"isSelf"}},{"kind":"Field","name":{"kind":"Name","value":"appLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"hasPassword"}},{"kind":"Field","name":{"kind":"Name","value":"mustChangePassword"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithOtherMerchants"}}]}}]}}]} as unknown as DocumentNode<MerchantUsersQuery, MerchantUsersQueryVariables>;
export const MerchantUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MerchantUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"merchantUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MerchantUserFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activityByActor"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"actorId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"30"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"actorName"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"before"}},{"kind":"Field","name":{"kind":"Name","value":"after"}},{"kind":"Field","name":{"kind":"Name","value":"sensitive"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MerchantUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MerchantUserView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"extraPermissions"}},{"kind":"Field","name":{"kind":"Name","value":"effectivePermissions"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"invitedByName"}},{"kind":"Field","name":{"kind":"Name","value":"invitedAt"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastAccessAt"}},{"kind":"Field","name":{"kind":"Name","value":"isSelf"}},{"kind":"Field","name":{"kind":"Name","value":"appLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"hasPassword"}},{"kind":"Field","name":{"kind":"Name","value":"mustChangePassword"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithOtherMerchants"}}]}}]}}]} as unknown as DocumentNode<MerchantUserQuery, MerchantUserQueryVariables>;
export const InviteMerchantUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InviteMerchantUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InviteMerchantUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inviteMerchantUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MerchantUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MerchantUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MerchantUserView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"extraPermissions"}},{"kind":"Field","name":{"kind":"Name","value":"effectivePermissions"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"invitedByName"}},{"kind":"Field","name":{"kind":"Name","value":"invitedAt"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastAccessAt"}},{"kind":"Field","name":{"kind":"Name","value":"isSelf"}},{"kind":"Field","name":{"kind":"Name","value":"appLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"hasPassword"}},{"kind":"Field","name":{"kind":"Name","value":"mustChangePassword"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithOtherMerchants"}}]}}]}}]} as unknown as DocumentNode<InviteMerchantUserMutation, InviteMerchantUserMutationVariables>;
export const UpdateMerchantUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMerchantUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMerchantUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMerchantUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MerchantUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MerchantUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MerchantUserView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"extraPermissions"}},{"kind":"Field","name":{"kind":"Name","value":"effectivePermissions"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"invitedByName"}},{"kind":"Field","name":{"kind":"Name","value":"invitedAt"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastAccessAt"}},{"kind":"Field","name":{"kind":"Name","value":"isSelf"}},{"kind":"Field","name":{"kind":"Name","value":"appLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"hasPassword"}},{"kind":"Field","name":{"kind":"Name","value":"mustChangePassword"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithOtherMerchants"}}]}}]}}]} as unknown as DocumentNode<UpdateMerchantUserMutation, UpdateMerchantUserMutationVariables>;
export const LockMerchantUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LockMerchantUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lockMerchantUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MerchantUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MerchantUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MerchantUserView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"extraPermissions"}},{"kind":"Field","name":{"kind":"Name","value":"effectivePermissions"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"invitedByName"}},{"kind":"Field","name":{"kind":"Name","value":"invitedAt"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastAccessAt"}},{"kind":"Field","name":{"kind":"Name","value":"isSelf"}},{"kind":"Field","name":{"kind":"Name","value":"appLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"hasPassword"}},{"kind":"Field","name":{"kind":"Name","value":"mustChangePassword"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithOtherMerchants"}}]}}]}}]} as unknown as DocumentNode<LockMerchantUserMutation, LockMerchantUserMutationVariables>;
export const UnlockMerchantUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnlockMerchantUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unlockMerchantUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MerchantUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MerchantUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MerchantUserView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"extraPermissions"}},{"kind":"Field","name":{"kind":"Name","value":"effectivePermissions"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"invitedByName"}},{"kind":"Field","name":{"kind":"Name","value":"invitedAt"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastAccessAt"}},{"kind":"Field","name":{"kind":"Name","value":"isSelf"}},{"kind":"Field","name":{"kind":"Name","value":"appLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"hasPassword"}},{"kind":"Field","name":{"kind":"Name","value":"mustChangePassword"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithOtherMerchants"}}]}}]}}]} as unknown as DocumentNode<UnlockMerchantUserMutation, UnlockMerchantUserMutationVariables>;
export const ResendInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResendInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resendInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MerchantUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MerchantUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MerchantUserView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"extraPermissions"}},{"kind":"Field","name":{"kind":"Name","value":"effectivePermissions"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"invitedByName"}},{"kind":"Field","name":{"kind":"Name","value":"invitedAt"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastAccessAt"}},{"kind":"Field","name":{"kind":"Name","value":"isSelf"}},{"kind":"Field","name":{"kind":"Name","value":"appLogin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"hasPassword"}},{"kind":"Field","name":{"kind":"Name","value":"mustChangePassword"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithOtherMerchants"}}]}}]}}]} as unknown as DocumentNode<ResendInviteMutation, ResendInviteMutationVariables>;
export const RolesAndMatrixDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RolesAndMatrix"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"userCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"permissionMatrix"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"group"}},{"kind":"Field","name":{"kind":"Name","value":"groupLabel"}},{"kind":"Field","name":{"kind":"Name","value":"requiresReason"}},{"kind":"Field","name":{"kind":"Name","value":"admin"}},{"kind":"Field","name":{"kind":"Name","value":"operation"}},{"kind":"Field","name":{"kind":"Name","value":"accountant"}},{"kind":"Field","name":{"kind":"Name","value":"grantedUserCount"}}]}}]}}]} as unknown as DocumentNode<RolesAndMatrixQuery, RolesAndMatrixQueryVariables>;
export const UpdateRolePermissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateRolePermission"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"permission"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"grant"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateRolePermission"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"permission"},"value":{"kind":"Variable","name":{"kind":"Name","value":"permission"}}},{"kind":"Argument","name":{"kind":"Name","value":"grant"},"value":{"kind":"Variable","name":{"kind":"Name","value":"grant"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"admin"}},{"kind":"Field","name":{"kind":"Name","value":"operation"}},{"kind":"Field","name":{"kind":"Name","value":"accountant"}},{"kind":"Field","name":{"kind":"Name","value":"grantedUserCount"}}]}}]}}]} as unknown as DocumentNode<UpdateRolePermissionMutation, UpdateRolePermissionMutationVariables>;
export const CatalogItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CatalogItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CatalogType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"catalogItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CatalogItemFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CatalogItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CatalogItemView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"appliesTo"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"usageCount"}}]}}]} as unknown as DocumentNode<CatalogItemsQuery, CatalogItemsQueryVariables>;
export const CreateCatalogItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCatalogItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CatalogItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCatalogItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CatalogItemFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CatalogItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CatalogItemView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"appliesTo"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"usageCount"}}]}}]} as unknown as DocumentNode<CreateCatalogItemMutation, CreateCatalogItemMutationVariables>;
export const UpdateCatalogItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCatalogItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CatalogItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCatalogItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CatalogItemFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CatalogItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CatalogItemView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"appliesTo"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"usageCount"}}]}}]} as unknown as DocumentNode<UpdateCatalogItemMutation, UpdateCatalogItemMutationVariables>;
export const DeactivateCatalogItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateCatalogItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateCatalogItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CatalogItemFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CatalogItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CatalogItemView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"appliesTo"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"usageCount"}}]}}]} as unknown as DocumentNode<DeactivateCatalogItemMutation, DeactivateCatalogItemMutationVariables>;
export const ActivateCatalogItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateCatalogItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateCatalogItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CatalogItemFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CatalogItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CatalogItemView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"appliesTo"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"usageCount"}}]}}]} as unknown as DocumentNode<ActivateCatalogItemMutation, ActivateCatalogItemMutationVariables>;
export const ReorderCatalogItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReorderCatalogItems"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CatalogType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reorderCatalogItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}},{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CatalogItemFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CatalogItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CatalogItemView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"appliesTo"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"usageCount"}}]}}]} as unknown as DocumentNode<ReorderCatalogItemsMutation, ReorderCatalogItemsMutationVariables>;
export const IoStartImportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"IoStartImport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StartImportInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startImport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IoImportJobFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IoImportJobFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ImportJobView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"totalRows"}},{"kind":"Field","name":{"kind":"Name","value":"validRows"}},{"kind":"Field","name":{"kind":"Name","value":"warningRows"}},{"kind":"Field","name":{"kind":"Name","value":"errorRows"}},{"kind":"Field","name":{"kind":"Name","value":"createdCount"}},{"kind":"Field","name":{"kind":"Name","value":"skippedCount"}},{"kind":"Field","name":{"kind":"Name","value":"unmappedColumns"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"sourceColumn"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"line"}},{"kind":"Field","name":{"kind":"Name","value":"values"}},{"kind":"Field","name":{"kind":"Name","value":"errors"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"createdCode"}}]}}]}}]} as unknown as DocumentNode<IoStartImportMutation, IoStartImportMutationVariables>;
export const IoImportPreviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IoImportPreview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ImportPreviewFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"importPreview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IoImportJobFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IoImportJobFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ImportJobView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"totalRows"}},{"kind":"Field","name":{"kind":"Name","value":"validRows"}},{"kind":"Field","name":{"kind":"Name","value":"warningRows"}},{"kind":"Field","name":{"kind":"Name","value":"errorRows"}},{"kind":"Field","name":{"kind":"Name","value":"createdCount"}},{"kind":"Field","name":{"kind":"Name","value":"skippedCount"}},{"kind":"Field","name":{"kind":"Name","value":"unmappedColumns"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"sourceColumn"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"line"}},{"kind":"Field","name":{"kind":"Name","value":"values"}},{"kind":"Field","name":{"kind":"Name","value":"errors"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"createdCode"}}]}}]}}]} as unknown as DocumentNode<IoImportPreviewQuery, IoImportPreviewQueryVariables>;
export const IoCommitImportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"IoCommitImport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skipErrors"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commitImport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"skipErrors"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skipErrors"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"IoImportJobFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"IoImportJobFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ImportJobView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"totalRows"}},{"kind":"Field","name":{"kind":"Name","value":"validRows"}},{"kind":"Field","name":{"kind":"Name","value":"warningRows"}},{"kind":"Field","name":{"kind":"Name","value":"errorRows"}},{"kind":"Field","name":{"kind":"Name","value":"createdCount"}},{"kind":"Field","name":{"kind":"Name","value":"skippedCount"}},{"kind":"Field","name":{"kind":"Name","value":"unmappedColumns"}},{"kind":"Field","name":{"kind":"Name","value":"fields"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"sourceColumn"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"line"}},{"kind":"Field","name":{"kind":"Name","value":"values"}},{"kind":"Field","name":{"kind":"Name","value":"errors"}},{"kind":"Field","name":{"kind":"Name","value":"warnings"}},{"kind":"Field","name":{"kind":"Name","value":"createdCode"}}]}}]}}]} as unknown as DocumentNode<IoCommitImportMutation, IoCommitImportMutationVariables>;
export const IoCancelImportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"IoCancelImport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelImport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<IoCancelImportMutation, IoCancelImportMutationVariables>;
export const IoImportTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IoImportTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"entityType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"importTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"entityType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"entityType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}}]}}]}}]} as unknown as DocumentNode<IoImportTemplateQuery, IoImportTemplateQueryVariables>;
export const IoExportFileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"IoExportFile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ExportFileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exportFile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"template"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"rowCount"}}]}}]}}]} as unknown as DocumentNode<IoExportFileMutation, IoExportFileMutationVariables>;
export const IoRenderDocumentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"IoRenderDocument"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RenderDocumentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"renderDocument"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"template"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"html"}},{"kind":"Field","name":{"kind":"Name","value":"attachmentId"}}]}}]}}]} as unknown as DocumentNode<IoRenderDocumentMutation, IoRenderDocumentMutationVariables>;
export const ActivityTimelineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActivityTimeline"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"entity"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EntityRefInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TimelineFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activityTimeline"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"entity"},"value":{"kind":"Variable","name":{"kind":"Name","value":"entity"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"actorType"}},{"kind":"Field","name":{"kind":"Name","value":"actorName"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"before"}},{"kind":"Field","name":{"kind":"Name","value":"after"}},{"kind":"Field","name":{"kind":"Name","value":"sensitive"}},{"kind":"Field","name":{"kind":"Name","value":"fromStatus"}},{"kind":"Field","name":{"kind":"Name","value":"toStatus"}}]}}]}}]} as unknown as DocumentNode<ActivityTimelineQuery, ActivityTimelineQueryVariables>;
export const AttachmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Attachments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"entityType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EntityType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"entityId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AttachmentCategory"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attachments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"entityType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"entityType"}}},{"kind":"Argument","name":{"kind":"Name","value":"entityId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"entityId"}}},{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AttachmentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AttachmentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AttachmentView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"mimeType"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedByType"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedByName"}},{"kind":"Field","name":{"kind":"Name","value":"capturedAt"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"sharedWithCustomer"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]} as unknown as DocumentNode<AttachmentsQuery, AttachmentsQueryVariables>;
export const DeleteAttachmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAttachment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAttachment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<DeleteAttachmentMutation, DeleteAttachmentMutationVariables>;
export const NotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Notifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"NotificationFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unreadCount"}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<NotificationsQuery, NotificationsQueryVariables>;
export const MarkNotificationReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkNotificationRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markNotificationRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>;
export const MarkAllNotificationsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllNotificationsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllNotificationsRead"}}]}}]} as unknown as DocumentNode<MarkAllNotificationsReadMutation, MarkAllNotificationsReadMutationVariables>;
export const CatalogOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CatalogOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CatalogType"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"activeOnly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"catalogItems"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}},{"kind":"Argument","name":{"kind":"Name","value":"activeOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"activeOnly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"active"}}]}}]}}]} as unknown as DocumentNode<CatalogOptionsQuery, CatalogOptionsQueryVariables>;
export const SuppliersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Suppliers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SupplierFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"suppliers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SupplierListFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SupplierListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SupplierView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"typeId"}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"expenseCount"}},{"kind":"Field","name":{"kind":"Name","value":"payableAmount"}},{"kind":"Field","name":{"kind":"Name","value":"contacts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"zalo"}}]}}]}}]} as unknown as DocumentNode<SuppliersQuery, SuppliersQueryVariables>;
export const SupplierDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SupplierDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"supplier"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SupplierListFields"}},{"kind":"Field","name":{"kind":"Name","value":"taxCode"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"bankName"}},{"kind":"Field","name":{"kind":"Name","value":"bankAccountNo"}},{"kind":"Field","name":{"kind":"Name","value":"paymentTerms"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"deactivateReason"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"payable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"unpaidCount"}},{"kind":"Field","name":{"kind":"Name","value":"oldestDays"}},{"kind":"Field","name":{"kind":"Name","value":"aging"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"d0_15"}},{"kind":"Field","name":{"kind":"Name","value":"d16_30"}},{"kind":"Field","name":{"kind":"Name","value":"d31_60"}},{"kind":"Field","name":{"kind":"Name","value":"d60p"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"recentExpenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expenseDate"}},{"kind":"Field","name":{"kind":"Name","value":"paidBy"}},{"kind":"Field","name":{"kind":"Name","value":"paidStatus"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"tripCode"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"externalTransports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"tripId"}},{"kind":"Field","name":{"kind":"Name","value":"tripCode"}},{"kind":"Field","name":{"kind":"Name","value":"vehiclePlate"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"driverPhone"}},{"kind":"Field","name":{"kind":"Name","value":"agreedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SupplierListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SupplierView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"typeId"}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"expenseCount"}},{"kind":"Field","name":{"kind":"Name","value":"payableAmount"}},{"kind":"Field","name":{"kind":"Name","value":"contacts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"zalo"}}]}}]}}]} as unknown as DocumentNode<SupplierDetailQuery, SupplierDetailQueryVariables>;
export const CreateSupplierDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSupplier"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SupplierInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSupplier"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]} as unknown as DocumentNode<CreateSupplierMutation, CreateSupplierMutationVariables>;
export const UpdateSupplierDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSupplier"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SupplierInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSupplier"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SupplierListFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SupplierListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SupplierView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"typeId"}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"expenseCount"}},{"kind":"Field","name":{"kind":"Name","value":"payableAmount"}},{"kind":"Field","name":{"kind":"Name","value":"contacts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"zalo"}}]}}]}}]} as unknown as DocumentNode<UpdateSupplierMutation, UpdateSupplierMutationVariables>;
export const DeactivateSupplierDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateSupplier"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateSupplier"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<DeactivateSupplierMutation, DeactivateSupplierMutationVariables>;
export const ActivateSupplierDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateSupplier"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateSupplier"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ActivateSupplierMutation, ActivateSupplierMutationVariables>;
export const VehiclesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Vehicles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vehicles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VehicleListFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VehicleListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"typeId"}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"capacityTons"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"monthCost"}},{"kind":"Field","name":{"kind":"Name","value":"registrationExpiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"insuranceExpiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiryWarnings"}},{"kind":"Field","name":{"kind":"Name","value":"currentTrip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}}]}}]}}]} as unknown as DocumentNode<VehiclesQuery, VehiclesQueryVariables>;
export const VehicleDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"VehicleDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vehicle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VehicleListFields"}},{"kind":"Field","name":{"kind":"Name","value":"brandModel"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"chassisNo"}},{"kind":"Field","name":{"kind":"Name","value":"engineNo"}},{"kind":"Field","name":{"kind":"Name","value":"boxSize"}},{"kind":"Field","name":{"kind":"Name","value":"fuelNorm"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tripCount30d"}},{"kind":"Field","name":{"kind":"Name","value":"cost30d"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tripHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderCode"}},{"kind":"Field","name":{"kind":"Name","value":"routeSummary"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"plannedEndAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualStartAt"}},{"kind":"Field","name":{"kind":"Name","value":"actualEndAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"expenseDate"}},{"kind":"Field","name":{"kind":"Name","value":"paidBy"}},{"kind":"Field","name":{"kind":"Name","value":"paidStatus"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tripCode"}},{"kind":"Field","name":{"kind":"Name","value":"supplierName"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VehicleListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"typeId"}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"capacityTons"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"monthCost"}},{"kind":"Field","name":{"kind":"Name","value":"registrationExpiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"insuranceExpiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiryWarnings"}},{"kind":"Field","name":{"kind":"Name","value":"currentTrip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}}]}}]}}]} as unknown as DocumentNode<VehicleDetailQuery, VehicleDetailQueryVariables>;
export const CreateVehicleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateVehicle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createVehicle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]} as unknown as DocumentNode<CreateVehicleMutation, CreateVehicleMutationVariables>;
export const UpdateVehicleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateVehicle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateVehicle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"VehicleListFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"VehicleListFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VehicleView"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"plate"}},{"kind":"Field","name":{"kind":"Name","value":"typeId"}},{"kind":"Field","name":{"kind":"Name","value":"type"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"capacityTons"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"monthCost"}},{"kind":"Field","name":{"kind":"Name","value":"registrationExpiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"insuranceExpiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiryWarnings"}},{"kind":"Field","name":{"kind":"Name","value":"currentTrip"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"driverName"}},{"kind":"Field","name":{"kind":"Name","value":"plannedStartAt"}}]}}]}}]} as unknown as DocumentNode<UpdateVehicleMutation, UpdateVehicleMutationVariables>;
export const DeactivateVehicleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateVehicle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateVehicle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<DeactivateVehicleMutation, DeactivateVehicleMutationVariables>;
export const ActivateVehicleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateVehicle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateVehicle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ActivateVehicleMutation, ActivateVehicleMutationVariables>;
export const SetVehicleStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetVehicleStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setVehicleStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<SetVehicleStatusMutation, SetVehicleStatusMutationVariables>;