import { graphql } from '@/gql';

export const DriverListFields = graphql(`
  fragment DriverListFields on DriverView {
    id
    code
    name
    phone
    status
    fixedSalary
    warnings
    licenseExpiresAt
    currentTrip {
      id
      code
      status
      vehiclePlate
      routeSummary
      plannedStartAt
    }
    appAccount {
      status
      lastLoginAt
      mustChangePassword
      deviceInfo
    }
    ledgerSummary {
      codHeld
      companyOwesDriver
      driverOwesCompany
      netBalance
      overAmount
      overDays
      daysHeld
    }
  }
`);

export const DriversQuery = graphql(`
  query Drivers($filter: DriverFilter, $first: Int, $after: String, $sort: String) {
    drivers(filter: $filter, first: $first, after: $after, sort: $sort) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...DriverListFields
      }
    }
  }
`);

export const SalaryHistoryFields = graphql(`
  fragment SalaryHistoryFields on DriverSalaryHistoryView {
    id
    amount
    effectiveFrom
    effectiveTo
    delta
    reason
    createdByName
    createdAt
    isCurrent
  }
`);

export const DriverDetailQuery = graphql(`
  query DriverDetail($id: ID!) {
    driver(id: $id) {
      ...DriverListFields
      dob
      idNumber
      address
      emergencyContact
      licenseClass
      licenseNumber
      note
      createdAt
      updatedAt
      salaryHistory {
        ...SalaryHistoryFields
      }
      recentTrips {
        id
        code
        status
        orderId
        orderCode
        routeSummary
        vehiclePlate
        plannedStartAt
        plannedEndAt
        actualStartAt
        actualEndAt
        driverBonusAmount
      }
    }
  }
`);

export const CreateDriverMutation = graphql(`
  mutation CreateDriver($input: DriverInput!) {
    createDriver(input: $input) {
      id
      code
      phone
      issuedTempPassword
    }
  }
`);

export const UpdateDriverMutation = graphql(`
  mutation UpdateDriver($id: ID!, $input: DriverInput!) {
    updateDriver(id: $id, input: $input) {
      ...DriverListFields
    }
  }
`);

export const DeactivateDriverMutation = graphql(`
  mutation DeactivateDriver($id: ID!, $reason: String!) {
    deactivateDriver(id: $id, reason: $reason) {
      id
      status
    }
  }
`);

export const ActivateDriverMutation = graphql(`
  mutation ActivateDriver($id: ID!) {
    activateDriver(id: $id) {
      id
      status
    }
  }
`);

export const AddSalaryHistoryMutation = graphql(`
  mutation AddDriverSalaryHistory($driverId: ID!, $input: SalaryHistoryInput!) {
    addDriverSalaryHistory(driverId: $driverId, input: $input) {
      ...SalaryHistoryFields
    }
  }
`);

export const ResetDriverAccountMutation = graphql(`
  mutation CreateOrResetDriverAccount($driverId: ID!) {
    createOrResetDriverAccount(driverId: $driverId) {
      phone
      tempPassword
      status
    }
  }
`);

export const DisableDriverAccountMutation = graphql(`
  mutation DisableDriverAccount($driverId: ID!) {
    disableDriverAccount(driverId: $driverId) {
      id
      appAccount {
        status
      }
    }
  }
`);
