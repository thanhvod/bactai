import { graphql } from '@/gql';

export const VehicleListFields = graphql(`
  fragment VehicleListFields on VehicleView {
    id
    code
    plate
    typeId
    type {
      id
      name
    }
    capacityTons
    status
    monthCost
    registrationExpiresAt
    insuranceExpiresAt
    expiryWarnings
    currentTrip {
      id
      code
      status
      driverName
      plannedStartAt
    }
  }
`);

export const VehiclesQuery = graphql(`
  query Vehicles($filter: VehicleFilter, $first: Int, $after: String, $sort: String) {
    vehicles(filter: $filter, first: $first, after: $after, sort: $sort) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...VehicleListFields
      }
    }
  }
`);

export const VehicleDetailQuery = graphql(`
  query VehicleDetail($id: ID!) {
    vehicle(id: $id) {
      ...VehicleListFields
      brandModel
      year
      chassisNo
      engineNo
      boxSize
      fuelNorm
      note
      createdAt
      updatedAt
      stats {
        tripCount30d
        cost30d
      }
      tripHistory {
        id
        code
        status
        orderId
        orderCode
        routeSummary
        driverName
        plannedStartAt
        plannedEndAt
        actualStartAt
        actualEndAt
      }
      expenses {
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
        tripCode
        supplierName
      }
    }
  }
`);

export const CreateVehicleMutation = graphql(`
  mutation CreateVehicle($input: VehicleInput!) {
    createVehicle(input: $input) {
      id
      code
    }
  }
`);

export const UpdateVehicleMutation = graphql(`
  mutation UpdateVehicle($id: ID!, $input: VehicleInput!) {
    updateVehicle(id: $id, input: $input) {
      ...VehicleListFields
    }
  }
`);

export const DeactivateVehicleMutation = graphql(`
  mutation DeactivateVehicle($id: ID!, $reason: String!) {
    deactivateVehicle(id: $id, reason: $reason) {
      id
      status
    }
  }
`);

export const ActivateVehicleMutation = graphql(`
  mutation ActivateVehicle($id: ID!) {
    activateVehicle(id: $id) {
      id
      status
    }
  }
`);

export const SetVehicleStatusMutation = graphql(`
  mutation SetVehicleStatus($id: ID!, $status: String!, $reason: String) {
    setVehicleStatus(id: $id, status: $status, reason: $reason) {
      id
      status
    }
  }
`);
