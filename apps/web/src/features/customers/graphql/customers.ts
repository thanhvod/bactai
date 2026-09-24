import { graphql } from '@/gql';

export const CustomerListFields = graphql(`
  fragment CustomerListFields on CustomerView {
    id
    code
    type
    name
    phone
    taxCode
    status
    creditLimit
    defaultDebtDays
    orderCount
    creditBalance
    warnings
    groupName
    debtSummary {
      remaining
      overdueAmount
      maxOverdueDays
      overdueOrders
      openOrders
      overLimit
      limitUsagePct
    }
  }
`);

export const CustomersQuery = graphql(`
  query Customers($filter: CustomerFilter, $first: Int, $after: String) {
    customers(filter: $filter, first: $first, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      nodes {
        ...CustomerListFields
      }
    }
  }
`);

export const CustomerLocationFields = graphql(`
  fragment CustomerLocationFields on CustomerLocationView {
    id
    customerId
    name
    usage
    address
    province
    lat
    lng
    contactName
    contactPhone
    note
    isDefault
    active
    usedInOrders
  }
`);

export const CustomerDetailFields = graphql(`
  fragment CustomerDetailFields on CustomerView {
    ...CustomerListFields
    legalName
    email
    invoiceEmail
    billingAddress
    groupId
    note
    deactivateReason
    hasPortalAccount
    createdAt
    updatedAt
    primaryContact {
      name
      role
      phone
      email
      zalo
    }
    debtSummary {
      receivable
      paid
      remaining
      overdueAmount
      maxOverdueDays
      openOrders
      overdueOrders
      creditBalance
      creditLimit
      overLimit
      limitUsagePct
      aging {
        current
        d1_15
        d16_30
        d31_60
        d60p
      }
    }
    locations {
      ...CustomerLocationFields
    }
  }
`);

export const CustomerQuery = graphql(`
  query Customer($id: ID!) {
    customer(id: $id) {
      ...CustomerDetailFields
    }
  }
`);

export const CreateCustomerMutation = graphql(`
  mutation CreateCustomer($input: CustomerInput!) {
    createCustomer(input: $input) {
      ...CustomerDetailFields
    }
  }
`);

export const UpdateCustomerMutation = graphql(`
  mutation UpdateCustomer($id: ID!, $input: CustomerInput!) {
    updateCustomer(id: $id, input: $input) {
      ...CustomerDetailFields
    }
  }
`);

export const DeactivateCustomerMutation = graphql(`
  mutation DeactivateCustomer($id: ID!, $reason: String) {
    deactivateCustomer(id: $id, reason: $reason) {
      id
      status
      deactivateReason
    }
  }
`);

export const ActivateCustomerMutation = graphql(`
  mutation ActivateCustomer($id: ID!) {
    activateCustomer(id: $id) {
      id
      status
      deactivateReason
    }
  }
`);

export const CustomerLocationsQuery = graphql(`
  query CustomerLocations($customerId: ID!, $includeInactive: Boolean) {
    customerLocations(customerId: $customerId, includeInactive: $includeInactive) {
      ...CustomerLocationFields
    }
  }
`);

export const CreateCustomerLocationMutation = graphql(`
  mutation CreateCustomerLocation($customerId: ID!, $input: CustomerLocationInput!) {
    createCustomerLocation(customerId: $customerId, input: $input) {
      ...CustomerLocationFields
    }
  }
`);

export const UpdateCustomerLocationMutation = graphql(`
  mutation UpdateCustomerLocation($id: ID!, $input: CustomerLocationInput!) {
    updateCustomerLocation(id: $id, input: $input) {
      ...CustomerLocationFields
    }
  }
`);

export const DeleteCustomerLocationMutation = graphql(`
  mutation DeleteCustomerLocation($id: ID!, $reason: String) {
    deleteCustomerLocation(id: $id, reason: $reason)
  }
`);

/** KPI WM-CUS-01 — tổng hợp phía API trên toàn bộ khách (không phụ thuộc phân trang). */
export const CustomerTotalsQuery = graphql(`
  query CustomerTotals($filter: CustomerFilter) {
    customerTotals(filter: $filter) {
      customerCount
      activeCount
      receivable
      remaining
      overdueAmount
      overdueCustomers
      overLimitCustomers
      creditBalance
      creditCustomers
    }
  }
`);
