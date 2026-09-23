import { graphql } from '@/gql';

/** WM-DEBT-03/04 — bảng kê công nợ (module P6). Tiền tố Ds để không trùng tên với operations Fin*. */
export const DsFields = graphql(`
  fragment DsFields on DebtStatementView {
    id
    code
    status
    scope
    periodFrom
    periodTo
    lineCount
    totalAmount
    paidAmount
    remainingAmount
    note
    sharedWithCustomer
    finalizedAt
    finalizedByName
    sentAt
    cancelledAt
    cancelReason
    createdAt
    createdByName
    pdfAttachmentId
    pdfUrl
    customer {
      id
      code
      name
      phone
      invoiceEmail
      hasPortalAccount
    }
  }
`);

export const DsListQuery = graphql(`
  query DsList($filter: DebtStatementFilter, $first: Int, $after: String) {
    debtStatements(filter: $filter, first: $first, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...DsFields
      }
    }
  }
`);

export const DsDetailQuery = graphql(`
  query DsDetail($id: ID!) {
    debtStatement(id: $id) {
      ...DsFields
      lines {
        id
        sequence
        orderId
        orderCode
        orderDate
        route
        totalAmount
        paidAmount
        remainingAmount
        dueDate
        overdueDays
      }
      diffVsCurrent {
        orderId
        orderCode
        snapshotPaid
        snapshotRemaining
        currentPaid
        currentRemaining
        message
      }
    }
  }
`);

export const DsCreateMutation = graphql(`
  mutation DsCreate($input: CreateDebtStatementInput!) {
    createDebtStatement(input: $input) {
      id
      code
    }
  }
`);

export const DsRefreshMutation = graphql(`
  mutation DsRefresh($id: ID!) {
    refreshDebtStatement(id: $id) {
      id
      lineCount
    }
  }
`);

export const DsFinalizeMutation = graphql(`
  mutation DsFinalize($id: ID!) {
    finalizeDebtStatement(id: $id) {
      id
      status
      pdfUrl
    }
  }
`);

export const DsMarkSentMutation = graphql(`
  mutation DsMarkSent($id: ID!, $share: Boolean) {
    markDebtStatementSent(id: $id, shareWithCustomer: $share) {
      id
      status
      sharedWithCustomer
    }
  }
`);

export const DsCancelMutation = graphql(`
  mutation DsCancel($id: ID!, $reason: String) {
    cancelDebtStatement(id: $id, reason: $reason) {
      id
      status
    }
  }
`);

export const DsCustomerOptionsQuery = graphql(`
  query DsCustomerOptions($search: String) {
    customers(filter: { search: $search, status: "ACTIVE" }, first: 50) {
      nodes {
        id
        code
        name
        phone
        status
        debtSummary {
          remaining
          overdueAmount
        }
      }
    }
  }
`);
