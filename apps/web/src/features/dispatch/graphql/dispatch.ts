import { graphql } from '@/gql';

export const TripListFields = graphql(`
  fragment TripListFields on TripView {
    id
    code
    status
    plannedStartAt
    plannedEndAt
    actualStartAt
    actualEndAt
    routeSummary
    hasWarning
    isExternal
    openIncidentCount
    stopCount
    codExpectedTotal
    driverBonusAmount
    order {
      id
      code
      customerName
    }
    vehicle {
      id
      plate
      typeName
    }
    driver {
      id
      name
      phone
    }
    lastLocation {
      capturedAt
      isStale
    }
  }
`);

export const TripsQuery = graphql(`
  query DspTrips($filter: TripFilter, $first: Int, $after: String, $sort: String) {
    trips(filter: $filter, first: $first, after: $after, sort: $sort) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...TripListFields
      }
    }
  }
`);

export const TripDetailQuery = graphql(`
  query DspTrip($id: ID!) {
    trip(id: $id) {
      id
      code
      status
      orderId
      plannedStartAt
      plannedEndAt
      actualStartAt
      actualEndAt
      routeSummary
      note
      isExternal
      hasWarning
      driverBonusAmount
      codExpectedTotal
      codActualTotal
      cancelReason
      pausedAt
      pausedReasonId
      pauseReasonLabel
      pauseNote
      previousStatusBeforePause
      resumedAt
      allowedNextStatuses
      attachmentCount
      openIncidentCount
      createdAt
      order {
        id
        code
        status
        customerId
        customerName
        customerPhone
      }
      vehicle {
        id
        code
        plate
        typeName
        capacityTons
        status
      }
      driver {
        id
        code
        name
        phone
        status
      }
      stops {
        id
        orderId
        type
        sequence
        tripSequence
        locationName
        address
        lat
        lng
        contactName
        contactPhone
        plannedAt
        arrivedAt
        completedAt
        codExpected
        codActual
        codCollectedAt
        podCount
        status
        skipReason
      }
      expenses {
        id
        code
        kind
        categoryName
        description
        amount
        paidBy
        paidStatus
        reimbursable
        status
        expenseDate
      }
      advances {
        id
        code
        amount
        status
        expenseDate
        description
      }
      incidents {
        id
        code
        title
        severity
        status
        createdAt
      }
      lastLocation {
        lat
        lng
        capturedAt
        speed
        isStale
      }
      warnings {
        id
        type
        subject
        subjectLabel
        conflictTripId
        conflictTripCode
        gapMinutes
        thresholdMinutes
        overrideReason
      }
      externalTransport {
        id
        supplierId
        supplierName
        vehiclePlate
        driverName
        driverPhone
        agreedAmount
        note
      }
    }
  }
`);

export const TripLocationsQuery = graphql(`
  query DspTripLocations($tripId: ID!) {
    tripLocations(tripId: $tripId) {
      lat
      lng
      recordedAt
      speed
    }
  }
`);

export const TripFormOrderQuery = graphql(`
  query DspTripFormOrder($id: ID!) {
    order(id: $id) {
      id
      code
      status
      routeSummary
      customer {
        id
        name
      }
      stops {
        id
        type
        sequence
        locationName
        address
        plannedAt
        status
        tripIds
        tripCodes
      }
      trips {
        id
        code
        status
      }
    }
  }
`);

export const ResourceOptionsQuery = graphql(`
  query DspResourceOptions {
    driverOptions(activeOnly: false) {
      id
      code
      name
      phone
      status
      busy
      busyTripCode
    }
    vehicleOptions(activeOnly: false) {
      id
      code
      plate
      status
      typeName
      capacityTons
      busy
      busyTripCode
    }
  }
`);

export const CheckOverlapQuery = graphql(`
  query DspCheckOverlap($input: CheckTripOverlapInput!) {
    checkTripOverlap(input: $input) {
      type
      subject
      subjectId
      subjectLabel
      conflictTripId
      conflictTripCode
      gapMinutes
      thresholdMinutes
    }
  }
`);

export const CreateTripMutation = graphql(`
  mutation DspCreateTrip($input: TripInput!) {
    createTrip(input: $input) {
      trip {
        id
        code
      }
      warnings {
        type
        subject
        subjectLabel
        conflictTripCode
        gapMinutes
      }
      notices
    }
  }
`);

export const UpdateTripMutation = graphql(`
  mutation DspUpdateTrip($id: ID!, $input: UpdateTripInput!, $reason: String) {
    updateTrip(id: $id, input: $input, reason: $reason) {
      trip {
        id
        code
      }
      notices
    }
  }
`);

export const UpdateTripStatusMutation = graphql(`
  mutation DspUpdateTripStatus($id: ID!, $input: TripStatusChangeInput!) {
    updateTripStatus(id: $id, input: $input) {
      id
      status
    }
  }
`);

export const ResumeTripMutation = graphql(`
  mutation DspResumeTrip($id: ID!, $note: String) {
    resumeTrip(id: $id, note: $note) {
      id
      status
    }
  }
`);

export const CancelTripMutation = graphql(`
  mutation DspCancelTrip($id: ID!, $reason: String!) {
    cancelTrip(id: $id, reason: $reason) {
      id
      status
    }
  }
`);

export const DispatchSummaryQuery = graphql(`
  query DspSummary($date: String) {
    dispatchSummary(date: $date) {
      date
      total
      running
      unassigned
      warnings
      openIncidents
      ordersWaitingDispatch
      byStatus {
        status
        count
      }
    }
  }
`);

export const SchedulesQuery = graphql(`
  query DspSchedules($date: String, $days: Int) {
    vehicleSchedules(date: $date, days: $days) {
      resource {
        id
        type
        label
        sublabel
        status
      }
      blocks {
        tripId
        code
        start
        end
        status
        warning
        orderCode
        routeSummary
        counterpartLabel
      }
    }
    driverSchedules(date: $date, days: $days) {
      resource {
        id
        type
        label
        sublabel
        status
      }
      blocks {
        tripId
        code
        start
        end
        status
        warning
        orderCode
        routeSummary
        counterpartLabel
      }
    }
  }
`);

export const ScheduleWarningsQuery = graphql(`
  query DspScheduleWarnings($filter: ScheduleWarningFilter, $first: Int, $after: String) {
    scheduleWarnings(filter: $filter, first: $first, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        type
        subject
        subjectId
        subjectLabel
        gapMinutes
        thresholdMinutes
        status
        overrideReason
        overriddenByName
        resolvedAt
        createdAt
        trip {
          id
          code
          orderCode
          plannedStartAt
          plannedEndAt
          status
          vehiclePlate
          driverName
        }
        conflictTrip {
          id
          code
          orderCode
          plannedStartAt
          plannedEndAt
          status
          vehiclePlate
          driverName
        }
      }
    }
  }
`);

export const ResolveWarningMutation = graphql(`
  mutation DspResolveWarning($id: ID!) {
    resolveScheduleWarning(id: $id)
  }
`);

export const LastLocationsQuery = graphql(`
  query DspLastLocations($running: Boolean) {
    lastKnownLocations(running: $running) {
      tripId
      tripCode
      tripStatus
      orderCode
      vehiclePlate
      driverName
      driverPhone
      lat
      lng
      capturedAt
      isStale
    }
  }
`);

// ---------- Sự cố ----------

export const IncidentListFields = graphql(`
  fragment IncidentListFields on IncidentView {
    id
    code
    title
    severity
    status
    typeId
    typeName
    orderId
    orderCode
    tripId
    tripCode
    driverName
    vehiclePlate
    reportedByType
    reportedByName
    assigneeUserId
    assigneeName
    createdAt
    resolvedAt
  }
`);

export const IncidentsQuery = graphql(`
  query DspIncidents($filter: IncidentFilter, $first: Int, $after: String) {
    incidents(filter: $filter, first: $first, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...IncidentListFields
      }
    }
  }
`);

export const IncidentDetailQuery = graphql(`
  query DspIncident($id: ID!) {
    incident(id: $id) {
      ...IncidentListFields
      description
      location
      stopId
      driverId
      driverPhone
      vehicleId
      resolvedNote
      updatedAt
    }
  }
`);

export const CreateIncidentMutation = graphql(`
  mutation DspCreateIncident($input: IncidentInput!) {
    createIncident(input: $input) {
      id
      code
    }
  }
`);

export const UpdateIncidentMutation = graphql(`
  mutation DspUpdateIncident($id: ID!, $input: IncidentInput!) {
    updateIncident(id: $id, input: $input) {
      id
    }
  }
`);

export const AssignIncidentMutation = graphql(`
  mutation DspAssignIncident($id: ID!, $userId: ID!) {
    assignIncident(id: $id, userId: $userId) {
      id
      assigneeName
    }
  }
`);

export const CloseIncidentMutation = graphql(`
  mutation DspCloseIncident($id: ID!, $note: String!) {
    closeIncident(id: $id, note: $note) {
      id
      status
    }
  }
`);

export const CancelIncidentMutation = graphql(`
  mutation DspCancelIncident($id: ID!, $reason: String!) {
    cancelIncident(id: $id, reason: $reason) {
      id
      status
    }
  }
`);

export const StaffOptionsQuery = graphql(`
  query DspStaffOptions {
    staffOptions {
      id
      name
      role
      effectivePermissions
    }
  }
`);

// ---------- Shell ----------

export const GlobalSearchQuery = graphql(`
  query ShellGlobalSearch($query: String!, $types: [String!], $first: Int) {
    globalSearch(query: $query, types: $types, first: $first) {
      type
      id
      code
      title
      subtitle
      status
    }
  }
`);

export const NavBadgesQuery = graphql(`
  query ShellNavBadges {
    navBadges {
      dispatch
      incidents
      finance
      codOverThreshold
      payroll
      scheduleWarnings
      overdueCustomers
    }
  }
`);

export const OpsDashboardQuery = graphql(`
  query DspOpsDashboard {
    dashboardSummary {
      date
      runningTrips
      todayTrips
      unassignedOrders
      ordersNeedAction
      openIncidents
      scheduleWarnings
      tripCountsByStatus {
        status
        count
      }
      todayTripList {
        id
        code
        status
        orderId
        orderCode
        routeSummary
        vehiclePlate
        driverName
        plannedStartAt
        plannedEndAt
        hasWarning
        openIncident
        lastLocationAt
      }
    }
  }
`);

export const PendingBookingsQuery = graphql(`
  query ShellPendingBookings {
    bookings(filter: { status: ["SUBMITTED"] }, first: 1) {
      totalCount
    }
  }
`);
