import { graphql } from '@/gql';

export const PrTotalsFields = graphql(`
  fragment PrTotalsFields on PayrollTotalsView {
    driverCount
    salary
    bonus
    advance
    deduction
    adjustment
    net
  }
`);

export const PrLineFields = graphql(`
  fragment PrLineFields on PayrollLineView {
    id
    payrollId
    payrollCode
    payrollStatus
    periodLabel
    driverId
    driverCode
    driverName
    baseSalary
    salaryEffectiveFrom
    bonusTotal
    advanceTotal
    deductionTotal
    adjustmentTotal
    netAmount
    anomalies
    note
  }
`);

export const PrItemFields = graphql(`
  fragment PrItemFields on PayrollItemView {
    id
    type
    amount
    description
    sourceRef
    tripId
    expenseId
    itemDate
    reasonId
    reasonName
    note
    createdByName
  }
`);

export const PrPayrollFields = graphql(`
  fragment PrPayrollFields on PayrollView {
    id
    code
    status
    periodLabel
    periodFrom
    periodTo
    note
    anomalyCount
    createdAt
    createdByName
    submittedAt
    submittedByName
    approvedAt
    approvedByName
    approvalNote
    returnedAt
    returnReason
    paidAt
    paidByName
    cancelledAt
    cancelReason
    totals {
      ...PrTotalsFields
    }
  }
`);

export const PrPayrollsQuery = graphql(`
  query PrPayrolls($filter: PayrollFilter, $first: Int, $after: String) {
    payrolls(filter: $filter, first: $first, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...PrPayrollFields
      }
    }
  }
`);

export const PrPayrollQuery = graphql(`
  query PrPayroll($id: ID!) {
    payroll(id: $id) {
      ...PrPayrollFields
      previousCode
      previousTotals {
        ...PrTotalsFields
      }
      changes {
        kind
        message
        driverName
        amount
      }
      lines {
        ...PrLineFields
      }
    }
  }
`);

export const PrPayrollLineQuery = graphql(`
  query PrPayrollLine($id: ID!) {
    payrollLine(id: $id) {
      ...PrLineFields
      items {
        ...PrItemFields
      }
      excluded {
        kind
        code
        date
        description
        amount
        reason
      }
    }
  }
`);

export const PrDriverPayrollLinesQuery = graphql(`
  query PrDriverPayrollLines($driverId: ID!) {
    driverPayrollLines(driverId: $driverId) {
      ...PrLineFields
    }
  }
`);

export const PrPreviewQuery = graphql(`
  query PrPreview($input: GeneratePayrollInput!) {
    payrollPreview(input: $input) {
      periodLabel
      periodFrom
      periodTo
      conflictPayrollCode
      warnings
      totals {
        ...PrTotalsFields
      }
      lines {
        ...PrLineFields
        items {
          ...PrItemFields
        }
      }
    }
  }
`);

export const PrGenerateMutation = graphql(`
  mutation PrGenerate($input: GeneratePayrollInput!) {
    generatePayroll(input: $input) {
      id
      code
    }
  }
`);

export const PrAddItemMutation = graphql(`
  mutation PrAddItem($input: PayrollItemInput!) {
    addPayrollItem(input: $input) {
      id
      netAmount
    }
  }
`);

export const PrRemoveItemMutation = graphql(`
  mutation PrRemoveItem($id: ID!, $reason: String!) {
    removePayrollItem(id: $id, reason: $reason) {
      id
      netAmount
    }
  }
`);

export const PrSubmitMutation = graphql(`
  mutation PrSubmit($id: ID!) {
    submitPayroll(id: $id) {
      id
      status
    }
  }
`);

export const PrApproveMutation = graphql(`
  mutation PrApprove($id: ID!, $note: String) {
    approvePayroll(id: $id, note: $note) {
      id
      status
    }
  }
`);

export const PrReturnMutation = graphql(`
  mutation PrReturn($id: ID!, $reason: String) {
    returnPayroll(id: $id, reason: $reason) {
      id
      status
    }
  }
`);

export const PrMarkPaidMutation = graphql(`
  mutation PrMarkPaid($id: ID!, $paidAt: DateTime) {
    markPayrollPaid(id: $id, paidAt: $paidAt) {
      id
      status
    }
  }
`);

export const PrCancelMutation = graphql(`
  mutation PrCancel($id: ID!, $reason: String!) {
    cancelPayroll(id: $id, reason: $reason) {
      id
      status
    }
  }
`);

export const PrDriverOptionsQuery = graphql(`
  query PrDriverOptions {
    driverOptions(activeOnly: true) {
      id
      code
      name
      status
    }
  }
`);
