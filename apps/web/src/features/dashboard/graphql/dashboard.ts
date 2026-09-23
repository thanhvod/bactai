import { graphql } from '@/gql';

/** WM-DASH-01/03 — dashboardSummary (RPT-001). Polling 30s ở page. */
export const DashSummaryQuery = graphql(`
  query DashSummary($date: String) {
    dashboardSummary(date: $date) {
      date
      runningTrips
      todayTrips
      newOrdersToday
      ordersNeedAction
      unassignedOrders
      openIncidents
      payrollPending
      scheduleWarnings
      codOverThreshold
      overdueDebt {
        amount
        count
      }
      codHeld {
        amount
        count
      }
      revenueMonth
      costMonth
      profitMonth
      cashInMonth
      receivable
      supplierPayable
      tripCountsByStatus {
        status
        count
      }
      todayTripList {
        id
        code
        orderId
        orderCode
        routeSummary
        driverName
        vehiclePlate
        plannedStartAt
        plannedEndAt
        status
        hasWarning
        openIncident
      }
      overdueOrders {
        orderId
        code
        customerId
        customerName
        remaining
        dueDate
        overdueDays
      }
      codHolders {
        driverId
        name
        phone
        codHeld
        daysHeld
        overThreshold
      }
    }
  }
`);

export const DashProfitMonthlyQuery = graphql(`
  query DashProfitMonthly($filter: ReportFilter) {
    reportProfit(filter: $filter) {
      rows {
        key
        label
        revenue
        cost
        profit
      }
      totals {
        revenue
        cost
        profit
        margin
      }
    }
  }
`);

export const DashFinanceExtrasQuery = graphql(`
  query DashFinanceExtras {
    reportCustomerDebt(filter: { overdueOnly: false }) {
      totalDebt
      totalOverdue
      totalCredit
      aging {
        current
        d1_15
        d16_30
        d31_60
        d60p
      }
    }
    reportCodHeld {
      totalHeld
      overThresholdCount
    }
  }
`);
