# PRD — API Contract Map

> Ngày lập: 2026-09-23
> Mục tiêu: định nghĩa contract cấp cao để backend, Web Merchant, Driver App, App Merchant và Web Khách hàng không lệch nhau khi implement song song.

## 1. GraphQL conventions

- Query names: danh từ số ít/số nhiều theo domain, ví dụ `orders`, `order`.
- Mutation names: động từ + entity, ví dụ `createOrder`, `updateOrderStatus`.
- Input types suffix `Input`.
- Payload types suffix `Payload`.
- Pagination: `first`, `after`, `filter`, `sort`.
- Money fields: `Int` VND.
- IDs: `ID`.
- Errors: GraphQL error `extensions.code`, field validation in `extensions.validation`.

## 2. Common types

```graphql
type PageInfo {
  hasNextPage: Boolean!
  endCursor: String
}

type MoneySummary {
  amount: Int!
  currency: String!
}

type ValidationError {
  field: String!
  message: String!
}
```

## 3. Auth/Merchant

| Operation | Type | Input | Output | Used by |
|---|---|---|---|---|
| `me` | Query | none | current user, merchant memberships, permissions | WM shell |
| `selectMerchant` | Mutation | `merchantId` | session/context payload | WM-AUTH-03 |
| `createMerchant` | Mutation | company/contact fields | merchant + admin membership | WM-AUTH-02 |
| `merchantSettings` | Query | none | settings | WM-SET-01 |
| `updateMerchantSettings` | Mutation | settings input | settings | WM-SET-01 |

## 4. Master data

### Customers

| Operation | Type | Notes |
|---|---|---|
| `customers(filter, sort, first, after)` | Query | list for WM-CUS-01 |
| `customer(id)` | Query | detail with locations/debt summary |
| `createCustomer(input)` | Mutation | create |
| `updateCustomer(id, input)` | Mutation | edit |
| `deactivateCustomer(id, reason)` | Mutation | soft deactivate |
| `createCustomerLocation(customerId, input)` | Mutation | address book |
| `updateCustomerLocation(id, input)` | Mutation | edit |

### Drivers

| Operation | Type | Notes |
|---|---|---|
| `drivers(filter, sort, first, after)` | Query | list |
| `driver(id)` | Query | detail + salary history |
| `createDriver(input)` | Mutation | profile |
| `updateDriver(id, input)` | Mutation | profile |
| `addDriverSalaryHistory(driverId, input)` | Mutation | effective salary |
| `createOrResetDriverAccount(driverId)` | Mutation | depends auth decision |

### Vehicles/Suppliers/Catalogs

Use equivalent CRUD:

- `vehicles`, `vehicle`, `createVehicle`, `updateVehicle`, `deactivateVehicle`
- `suppliers`, `supplier`, `createSupplier`, `updateSupplier`, `deactivateSupplier`
- `catalogItems(type)`, `createCatalogItem`, `updateCatalogItem`, `deactivateCatalogItem`

## 5. Order and dispatch

| Operation | Type | Input | Output | Used by |
|---|---|---|---|---|
| `orders(filter, sort, first, after)` | Query | status/customer/date/debt filters | order connection | WM-ORD-01 |
| `order(id)` | Query | id | order detail including stops/cargo/addons/trips/finance summary | WM-ORD-02 |
| `createOrder(input)` | Mutation | customer, freight, due date, stops, cargo, addons | order | WM-ORD-03 |
| `updateOrder(id, input, reason?)` | Mutation | editable order fields | order | WM-ORD-03 |
| `updateOrderStatus(id, status, reason?)` | Mutation | status | order + status history | WM-ORD-02 |
| `cancelOrder(id, reason)` | Mutation | reason | order | WM-ORD-08 |
| `createTrip(input)` | Mutation | order, vehicle, driver, times, stop assignments, bonus | trip + warnings | WM-TRIP-02 |
| `updateTrip(id, input, reason?)` | Mutation | assignment/time/bonus | trip + warnings | WM-TRIP-02 |
| `trip(id)` | Query | id | trip detail | WM-TRIP-01, DA-TRIP-01 |
| `trips(filter, sort, first, after)` | Query | date/status/driver/vehicle | trip connection | WM-DISPATCH-01 |
| `checkTripOverlap(input)` | Query | vehicle/driver/times | warnings | WM-DISPATCH-03 |
| `updateTripStatus(id, status, reason?)` | Mutation | status | trip | WM/DA status |
| `updateStopStatus(id, status, reason?)` | Mutation | status | stop | WM/DA stop |

## 6. Driver App operations

| Operation | Type | Input | Output |
|---|---|---|---|
| `driverMe` | Query | none | driver profile/session |
| `driverJobs(filter)` | Query | date/status | assigned trips |
| `driverTrip(id)` | Query | trip id | trip detail scoped to driver |
| `driverUpdateTripStatus(input)` | Mutation | trip/status/reason/idempotencyKey | trip |
| `driverUpdateStopStatus(input)` | Mutation | stop/status/reason/idempotencyKey | stop |
| `driverSubmitCod(input)` | Mutation | stopId, amount, note, reason if edit | stop/COD ledger summary |
| `driverReportIncident(input)` | Mutation | trip/order, type, severity, description, attachments | incident |

## 7. Finance

| Operation | Type | Notes |
|---|---|---|
| `expenses(filter, sort, first, after)` | Query | list |
| `expense(id)` | Query | detail |
| `createExpense(input)` | Mutation | create expense |
| `updateExpense(id, input, reason)` | Mutation | sensitive |
| `cancelExpense(id, reason)` | Mutation | sensitive |
| `payments(filter, sort, first, after)` | Query | payment in list |
| `payment(id)` | Query | payment detail |
| `createPaymentIn(input)` | Mutation | customer payment / driver COD remittance |
| `updatePaymentIn(id, input, reason)` | Mutation | sensitive |
| `allocatePayment(input)` | Mutation | payment allocation lines |
| `customerDebt(filter)` | Query | customer/order AR |
| `supplierDebt(filter)` | Query | AP by supplier |
| `driverLedger(driverId)` | Query | COD held, reimbursable, advances |
| `driverCodHeld(filter)` | Query | COD held list |

## 8. Payroll, reports, statements

| Operation | Type | Notes |
|---|---|---|
| `payrolls(filter, first, after)` | Query | list |
| `payroll(id)` | Query | detail |
| `generatePayroll(input)` | Mutation | create draft |
| `submitPayroll(id)` | Mutation | submit |
| `approvePayroll(id, reason?)` | Mutation | admin |
| `returnPayroll(id, reason)` | Mutation | admin |
| `markPayrollPaid(id)` | Mutation | accountant/admin |
| `debtStatements(filter)` | Query | list |
| `debtStatement(id)` | Query | detail |
| `createDebtStatement(input)` | Mutation | draft |
| `finalizeDebtStatement(id)` | Mutation | snapshot + PDF |
| `cancelDebtStatement(id, reason)` | Mutation | sensitive |
| `dashboardSummary(filter)` | Query | dashboard |
| `reportProfit(filter)` | Query | profit |
| `reportCustomerDebt(filter)` | Query | AR |
| `reportCodHeld(filter)` | Query | COD |
| `reportPayroll(filter)` | Query | payroll |

## 9. Attachment, import/export, notification

| Operation | Type | Notes |
|---|---|---|
| `requestUpload(input)` | REST/Mutation | returns presigned URL |
| `confirmAttachment(input)` | Mutation | metadata after upload |
| `attachments(entity)` | Query | list |
| `activityTimeline(entity)` | Query | audit/status timeline |
| `notifications(filter)` | Query | web/app notification list |
| `markNotificationRead(id)` | Mutation | read |
| `startImport(input)` | Mutation | creates import preview session |
| `commitImport(sessionId)` | Mutation | commits valid rows |
| `exportFile(input)` | Mutation/Query | returns job/file URL |

## 10. REST endpoints

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `POST` | `/uploads/presign` | create presigned upload URL | merchant/driver/customer depending entity |
| `POST` | `/uploads/confirm` | confirm metadata if not GraphQL | same |
| `POST` | `/driver/gps/batch` | GPS batch ingest | driver |
| `GET` | `/files/:attachmentId/download` | signed download redirect | scoped |
| `GET` | `/exports/:exportId/download` | export download | scoped |

## 11. Error code convention

| Code | Meaning |
|---|---|
| `UNAUTHENTICATED` | no/invalid session |
| `FORBIDDEN` | role/permission denied |
| `TENANT_SCOPE_VIOLATION` | access outside tenant |
| `VALIDATION_ERROR` | input validation failed |
| `CONFLICT` | overlap/duplicate/race conflict |
| `SENSITIVE_REASON_REQUIRED` | reason missing |
| `NOT_FOUND` | entity missing or inaccessible |
| `BUSINESS_RULE_VIOLATION` | domain rule failed |

