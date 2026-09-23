import { graphql } from '@/gql';

export const RptSummaryQuery = graphql(`
  query RptSummary($filter: ReportFilter) {
    reportSummary(filter: $filter) {
      key
      group
      title
      headline
      value
      route
    }
  }
`);

export const RptProfitRowFields = graphql(`
  fragment RptProfitRowFields on ProfitRow {
    key
    label
    sublabel
    entityId
    status
    freight
    addons
    revenue
    tripCost
    outsourcedCost
    otherCost
    cost
    profit
    margin
    orderCount
    isProvisional
  }
`);

export const RptProfitQuery = graphql(`
  query RptProfit($filter: ReportFilter) {
    reportProfit(filter: $filter) {
      dateFrom
      dateTo
      groupBy
      notes
      rows {
        ...RptProfitRowFields
      }
      totals {
        ...RptProfitRowFields
      }
    }
  }
`);

export const RptVehiclesQuery = graphql(`
  query RptVehicles($filter: ReportFilter) {
    reportVehicles(filter: $filter) {
      vehicleId
      plate
      type
      status
      tripCount
      activeDays
      utilization
      revenue
      vehicleCost
      tripCost
      grossProfit
    }
  }
`);

export const RptDriversQuery = graphql(`
  query RptDrivers($filter: ReportFilter) {
    reportDrivers(filter: $filter) {
      driverId
      code
      name
      status
      completedTrips
      onTimeRate
      revenue
      bonusTotal
      codHeld
      incidents
    }
  }
`);

export const RptAgingFields = graphql(`
  fragment RptAgingFields on AgingReportView {
    current
    d1_15
    d16_30
    d31_60
    d60p
  }
`);

export const RptCustomerDebtQuery = graphql(`
  query RptCustomerDebt($filter: ReportFilter) {
    reportCustomerDebt(filter: $filter) {
      totalDebt
      totalOverdue
      totalCredit
      aging {
        ...RptAgingFields
      }
      rows {
        customerId
        code
        name
        creditLimit
        receivable
        paid
        totalDebt
        overdue
        maxOverdueDays
        creditBalance
        openOrders
        warnings
        aging {
          ...RptAgingFields
        }
      }
    }
  }
`);

export const RptCodQuery = graphql(`
  query RptCod($filter: ReportFilter) {
    reportCodHeld(filter: $filter) {
      totalHeld
      thresholdAmount
      thresholdDays
      overThresholdCount
      rows {
        driverId
        code
        name
        phone
        codCollected
        codRemitted
        codHeld
        heldDays
        oldestHeldAt
        overAmount
        overDays
      }
    }
  }
`);

export const RptPayrollQuery = graphql(`
  query RptPayroll($filter: ReportFilter) {
    reportPayroll(filter: $filter) {
      payrollId
      payrollCode
      period
      status
      driverCount
      salary
      bonus
      advance
      deduction
      adjustment
      net
      paidAt
      byDriver {
        driverId
        driverName
        salary
        bonus
        advance
        deduction
        adjustment
        net
      }
    }
  }
`);
