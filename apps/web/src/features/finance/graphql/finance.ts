import { graphql } from '@/gql';

// ---------- Phiếu chi ----------

export const ExpenseFields = graphql(`
  fragment ExpenseFields on ExpenseView {
    id
    code
    kind
    kindLabel
    isCost
    categoryId
    categoryName
    amount
    expenseDate
    paidBy
    reimbursable
    paidStatus
    paidAt
    paidMethod
    supplierId
    orderId
    tripId
    vehicleId
    driverId
    supplier { id code name }
    order { id code name }
    trip { id code name }
    vehicle { id code name }
    driver { id code name }
    description
    note
    status
    cancelReason
    cancelledAt
    attachmentCount
    createdAt
  }
`);

export const ExpensesQuery = graphql(`
  query FinExpenses($filter: ExpenseFilter, $first: Int, $after: String) {
    expenses(filter: $filter, first: $first, after: $after) {
      totalCount
      totalAmount
      pageInfo { hasNextPage hasPreviousPage endCursor startCursor }
      nodes { ...ExpenseFields }
    }
  }
`);

export const ExpenseQuery = graphql(`
  query FinExpense($id: ID!) {
    expense(id: $id) { ...ExpenseFields }
  }
`);

export const CreateExpenseMutation = graphql(`
  mutation FinCreateExpense($input: ExpenseInput!) {
    createExpense(input: $input) { ...ExpenseFields }
  }
`);

export const UpdateExpenseMutation = graphql(`
  mutation FinUpdateExpense($id: ID!, $input: ExpenseInput!, $reason: String!) {
    updateExpense(id: $id, input: $input, reason: $reason) { ...ExpenseFields }
  }
`);

export const CancelExpenseMutation = graphql(`
  mutation FinCancelExpense($id: ID!, $reason: String!) {
    cancelExpense(id: $id, reason: $reason) { ...ExpenseFields }
  }
`);

export const MarkExpensesPaidMutation = graphql(`
  mutation FinMarkExpensesPaid($ids: [ID!]!, $input: MarkExpensePaidInput) {
    markExpensesPaid(ids: $ids, input: $input) { ...ExpenseFields }
  }
`);

// ---------- Phiếu thu ----------

export const PaymentFields = graphql(`
  fragment PaymentFields on PaymentView {
    id
    code
    type
    typeLabel
    notRevenue
    customer { id code name }
    driver { id code name }
    trip { id code name }
    payerName
    payerLabel
    amount
    allocatedAmount
    unallocatedAmount
    method
    bankAccount
    transferNote
    receivedBy
    note
    receivedAt
    status
    cancelReason
    cancelledAt
    customerCreditBalance
    attachmentCount
    createdAt
    allocations { id paymentId paymentCode orderId orderCode amount createdAt receivedAt method }
    codItems { stopId orderCode stopName amount }
  }
`);

export const PaymentsQuery = graphql(`
  query FinPayments($filter: PaymentFilter, $first: Int, $after: String) {
    payments(filter: $filter, first: $first, after: $after) {
      totalCount
      totalAmount
      pageInfo { hasNextPage hasPreviousPage endCursor startCursor }
      nodes { ...PaymentFields }
    }
  }
`);

export const PaymentQuery = graphql(`
  query FinPayment($id: ID!) {
    payment(id: $id) { ...PaymentFields }
  }
`);

export const CreatePaymentMutation = graphql(`
  mutation FinCreatePayment($input: PaymentInInput!) {
    createPaymentIn(input: $input) { ...PaymentFields }
  }
`);

export const UpdatePaymentMutation = graphql(`
  mutation FinUpdatePayment($id: ID!, $input: UpdatePaymentInInput!, $reason: String!) {
    updatePaymentIn(id: $id, input: $input, reason: $reason) { ...PaymentFields }
  }
`);

export const CancelPaymentMutation = graphql(`
  mutation FinCancelPayment($id: ID!, $reason: String!) {
    cancelPaymentIn(id: $id, reason: $reason) { ...PaymentFields }
  }
`);

export const AllocatePaymentMutation = graphql(`
  mutation FinAllocatePayment($input: AllocatePaymentInput!) {
    allocatePayment(input: $input) {
      creditBalance
      payment { ...PaymentFields }
    }
  }
`);

export const UnallocatePaymentMutation = graphql(`
  mutation FinUnallocatePayment($allocationId: ID!, $reason: String!) {
    unallocatePayment(allocationId: $allocationId, reason: $reason) { ...PaymentFields }
  }
`);

// ---------- Công nợ ----------

export const CustomerDebtQuery = graphql(`
  query FinCustomerDebt($filter: CustomerDebtFilter) {
    customerDebt(filter: $filter) {
      totals { receivable paid remaining overdueAmount creditBalance customerCount }
      rows {
        customer { id code name }
        phone
        receivable
        paid
        remaining
        overdueAmount
        maxOverdueDays
        creditBalance
        creditLimit
        overLimit
        limitUsagePct
        openOrders
        overdueOrders
        aging { current d1_15 d16_30 d31_60 d60p }
      }
      orders { orderId code customerId status orderDate routeSummary total allocated remaining dueDate overdueDays statementCode }
    }
  }
`);

export const SupplierDebtQuery = graphql(`
  query FinSupplierDebt($filter: SupplierDebtFilter) {
    supplierDebt(filter: $filter) {
      total
      rows {
        supplier { id code name }
        unpaidTotal
        oldestDays
        unpaidCount
        aging { d0_15 d16_30 d31_60 d60p }
        expenses { ...ExpenseFields }
      }
    }
  }
`);

export const DriverCodItemFields = graphql(`
  fragment DriverCodItemFields on DriverCodItemView {
    stopId
    orderId
    orderCode
    customerName
    tripId
    tripCode
    stopSequence
    stopName
    address
    codExpected
    codActual
    collectedAt
    remitted
    held
    daysHeld
  }
`);

export const DriverCodHeldQuery = graphql(`
  query FinDriverCodHeld($filter: DriverCodHeldFilter) {
    driverCodHeld(filter: $filter) {
      totalHeld
      codWarningAmount
      codWarningDays
      rows {
        driver { id code name }
        phone
        codCollected
        codRemitted
        codHeld
        oldestHeldAt
        daysHeld
        overAmount
        overDays
        items { ...DriverCodItemFields }
      }
    }
  }
`);

export const DriverLedgerQuery = graphql(`
  query FinDriverLedger($driverId: ID) {
    driverLedger(driverId: $driverId) {
      driver { id code name }
      codCollected
      codRemitted
      codHeld
      companyOwesDriver
      tripAdvanceOutstanding
      salaryAdvanceUndeducted
      driverOwesCompany
      netBalance
      oldestHeldAt
      daysHeld
      overAmount
      overDays
      entries { date kind docCode refId description driverOwes companyOwes runningBalance }
      codItems { ...DriverCodItemFields }
    }
  }
`);

// ---------- Tạm ứng chuyến ----------

export const TripAdvancesQuery = graphql(`
  query FinTripAdvances($filter: TripAdvanceFilter) {
    tripAdvances(filter: $filter) {
      tripId
      tripCode
      tripStatus
      plannedStartAt
      orderId
      orderCode
      driver { id code name }
      advanceAmount
      spentFromAdvance
      actualCost
      returned
      reimbursed
      difference
      status
      resolution
      resolvedAt
      reason
      note
    }
  }
`);

export const ReconcileTripAdvanceMutation = graphql(`
  mutation FinReconcileTripAdvance($input: ReconcileTripAdvanceInput!) {
    reconcileTripAdvance(input: $input) { tripId status resolution difference }
  }
`);

// ---------- Sổ thu chi ----------

export const FinanceLedgerQuery = graphql(`
  query FinLedger($filter: FinanceLedgerFilter, $first: Int, $after: String) {
    financeLedger(filter: $filter, first: $first, after: $after) {
      totalCount
      pageInfo { hasNextPage hasPreviousPage endCursor startCursor }
      summary { cashIn customerReceipts codRemittances advanceReturns otherIn cashOut unpaidOut driverPaidOut }
      nodes { id code date direction type typeLabel counterpart links status amount notRevenue cashMoved createdByName }
    }
  }
`);

// ---------- Picker ----------

export const FinPickersQuery = graphql(`
  query FinPickers {
    driverOptions(activeOnly: false) { id code name phone status busy }
    vehicleOptions(activeOnly: false) { id code plate status typeName }
    supplierOptions(activeOnly: false) { id code name status typeName }
  }
`);

export const FinCustomerOptionsQuery = graphql(`
  query FinCustomerOptions($search: String) {
    customers(filter: { search: $search }, first: 30) {
      nodes { id code name phone status creditBalance }
    }
  }
`);

export const FinOrderOptionsQuery = graphql(`
  query FinOrderOptions($search: String, $customerId: ID) {
    orders(filter: { search: $search, customerId: $customerId }, first: 30) {
      nodes { id code status routeSummary customer { id name } }
    }
  }
`);

export const FinTripOptionsQuery = graphql(`
  query FinTripOptions($search: String, $orderId: ID) {
    trips(filter: { search: $search, orderId: $orderId }, first: 30) {
      nodes { id code status orderId order { id code } vehicle { id plate } driver { id name } }
    }
  }
`);

export const ExpenseCategoriesQuery = graphql(`
  query FinExpenseCategories {
    catalogItems(type: EXPENSE_CATEGORY, activeOnly: true) { id code name appliesTo active }
  }
`);
