import { graphql } from '@/gql';

export const SupplierListFields = graphql(`
  fragment SupplierListFields on SupplierView {
    id
    code
    name
    typeId
    type {
      id
      name
    }
    status
    expenseCount
    payableAmount
    contacts {
      name
      role
      phone
      email
      zalo
    }
  }
`);

export const SuppliersQuery = graphql(`
  query Suppliers($filter: SupplierFilter, $first: Int, $after: String, $sort: String) {
    suppliers(filter: $filter, first: $first, after: $after, sort: $sort) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...SupplierListFields
      }
    }
  }
`);

export const SupplierDetailQuery = graphql(`
  query SupplierDetail($id: ID!) {
    supplier(id: $id) {
      ...SupplierListFields
      taxCode
      address
      bankName
      bankAccountNo
      paymentTerms
      note
      deactivateReason
      createdAt
      updatedAt
      payable {
        total
        unpaidCount
        oldestDays
        aging {
          d0_15
          d16_30
          d31_60
          d60p
        }
      }
      recentExpenses {
        id
        code
        kind
        categoryName
        amount
        expenseDate
        paidBy
        paidStatus
        status
        description
        orderCode
        tripCode
        vehiclePlate
      }
      externalTransports {
        id
        orderId
        orderCode
        tripId
        tripCode
        vehiclePlate
        driverName
        driverPhone
        agreedAmount
        note
        createdAt
      }
    }
  }
`);

export const CreateSupplierMutation = graphql(`
  mutation CreateSupplier($input: SupplierInput!) {
    createSupplier(input: $input) {
      id
      code
    }
  }
`);

export const UpdateSupplierMutation = graphql(`
  mutation UpdateSupplier($id: ID!, $input: SupplierInput!) {
    updateSupplier(id: $id, input: $input) {
      ...SupplierListFields
    }
  }
`);

export const DeactivateSupplierMutation = graphql(`
  mutation DeactivateSupplier($id: ID!, $reason: String!) {
    deactivateSupplier(id: $id, reason: $reason) {
      id
      status
    }
  }
`);

export const ActivateSupplierMutation = graphql(`
  mutation ActivateSupplier($id: ID!) {
    activateSupplier(id: $id) {
      id
      status
    }
  }
`);
