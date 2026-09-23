import { graphql } from '@/gql';

export const OrderListFields = graphql(`
  fragment OrderListFields on OrderView {
    id
    code
    status
    orderDate
    routeSummary
    freightAmount
    addonTotal
    totalAmount
    paidAmount
    remainingAmount
    dueDate
    overdueDays
    tripCount
    warnings
    customer {
      id
      code
      name
      phone
    }
  }
`);

export const OrdersQuery = graphql(`
  query OrdOrders($filter: OrderFilter, $first: Int, $after: String, $sort: String) {
    orders(filter: $filter, first: $first, after: $after, sort: $sort) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...OrderListFields
      }
    }
  }
`);

export const OrderTotalsQuery = graphql(`
  query OrdOrderTotals($filter: OrderFilter) {
    orderTotals(filter: $filter) {
      count
      totalAmount
      paidAmount
      remainingAmount
      overdueAmount
    }
  }
`);

export const OrderTripFields = graphql(`
  fragment OrderTripFields on TripView {
    id
    code
    status
    plannedStartAt
    plannedEndAt
    actualStartAt
    actualEndAt
    driverBonusAmount
    isExternal
    hasWarning
    stopCount
    routeSummary
    openIncidentCount
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
    stops {
      id
      sequence
    }
  }
`);

export const OrderDetailQuery = graphql(`
  query OrdOrderDetail($id: ID!) {
    order(id: $id) {
      id
      code
      status
      orderDate
      dueDate
      overdueDays
      routeSummary
      note
      internalNote
      freightAmount
      addonTotal
      totalAmount
      paidAmount
      remainingAmount
      priceLocked
      bookingId
      cancelReason
      cancelledAt
      confirmedAt
      startedAt
      completedAt
      createdAt
      updatedAt
      tripCount
      attachmentCount
      warnings
      customerWarnings
      requiredVehicleTypeId
      requiredVehicleTypeName
      requiredCapacityTons
      customer {
        id
        code
        name
        phone
      }
      stops {
        id
        type
        sequence
        locationId
        locationName
        address
        province
        lat
        lng
        contactName
        contactPhone
        plannedAt
        codExpected
        codActual
        codCollectedAt
        status
        arrivedAt
        completedAt
        skipReason
        note
        podCount
        tripIds
        tripCodes
      }
      cargoLines {
        id
        name
        cargoTypeId
        cargoTypeName
        weightKg
        volumeM3
        quantity
        packagingUnit
        properties
        declaredValue
        pickupStopId
        dropoffStopId
        note
      }
      addons {
        id
        serviceId
        name
        amount
        note
      }
      trips {
        ...OrderTripFields
      }
      financeSummary {
        freight
        addonTotal
        totalAmount
        receivable
        paidAmount
        remainingAmount
        overdueDays
        expenseTotal
        outsourcedCost
        tripCost
        otherCost
        profit
        margin
        provisional
        driverBonusTotal
        allocations {
          id
          paymentId
          paymentCode
          receivedAt
          amount
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
          status
          isCost
          tripCode
          supplierName
          expenseDate
        }
      }
      incidents {
        id
        code
        title
        severity
        status
        createdAt
      }
      externalTransports {
        id
        tripId
        tripCode
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

export const OrderStopDetailQuery = graphql(`
  query OrdOrderStop($id: ID!) {
    orderStop(id: $id) {
      id
      orderId
      orderCode
      type
      sequence
      locationName
      address
      contactName
      contactPhone
      plannedAt
      arrivedAt
      completedAt
      codExpected
      codActual
      codCollectedAt
      codNote
      status
      skipReason
      note
      podCount
      tripIds
      tripCodes
      podAttachments {
        ...AttachmentFields
      }
      statusHistory {
        id
        createdAt
        summary
        actorName
        reason
        fromStatus
        toStatus
      }
    }
  }
`);

export const CreateOrderMutation = graphql(`
  mutation OrdCreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      order {
        id
        code
        status
      }
      trip {
        id
        code
      }
      warnings
    }
  }
`);

export const UpdateOrderMutation = graphql(`
  mutation OrdUpdateOrder($id: ID!, $input: UpdateOrderInput!, $reason: String) {
    updateOrder(id: $id, input: $input, reason: $reason) {
      id
      code
      status
    }
  }
`);

export const UpdateOrderPricingMutation = graphql(`
  mutation OrdUpdateOrderPricing($id: ID!, $input: OrderPricingInput!) {
    updateOrderPricing(id: $id, input: $input) {
      id
      freightAmount
      totalAmount
    }
  }
`);

export const UpdateOrderStatusMutation = graphql(`
  mutation OrdUpdateOrderStatus($id: ID!, $status: String!, $reason: String, $note: String) {
    updateOrderStatus(id: $id, status: $status, reason: $reason, note: $note) {
      id
      status
    }
  }
`);

export const CancelOrderMutation = graphql(`
  mutation OrdCancelOrder($id: ID!, $reason: String!) {
    cancelOrder(id: $id, reason: $reason) {
      id
      status
    }
  }
`);

export const CreateOrderStopMutation = graphql(`
  mutation OrdCreateOrderStop($orderId: ID!, $input: OrderStopInput!) {
    createOrderStop(orderId: $orderId, input: $input) {
      id
    }
  }
`);

export const UpdateOrderStopMutation = graphql(`
  mutation OrdUpdateOrderStop($id: ID!, $input: OrderStopInput!, $reason: String) {
    updateOrderStop(id: $id, input: $input, reason: $reason) {
      id
    }
  }
`);

export const ReorderOrderStopsMutation = graphql(`
  mutation OrdReorderOrderStops($orderId: ID!, $stopIds: [ID!]!) {
    reorderOrderStops(orderId: $orderId, stopIds: $stopIds) {
      id
    }
  }
`);

export const RemoveOrderStopMutation = graphql(`
  mutation OrdRemoveOrderStop($id: ID!, $reason: String) {
    removeOrderStop(id: $id, reason: $reason) {
      id
    }
  }
`);

export const UpsertCargoLineMutation = graphql(`
  mutation OrdUpsertCargoLine($orderId: ID!, $input: CargoLineInput!) {
    upsertCargoLine(orderId: $orderId, input: $input) {
      id
    }
  }
`);

export const DeleteCargoLineMutation = graphql(`
  mutation OrdDeleteCargoLine($id: ID!) {
    deleteCargoLine(id: $id) {
      id
    }
  }
`);

export const StopStatusMutation = graphql(`
  mutation OrdUpdateStopStatus($id: ID!, $status: String!, $reason: String, $tripId: ID, $actualAt: DateTime) {
    updateStopStatus(id: $id, status: $status, reason: $reason, tripId: $tripId, actualAt: $actualAt) {
      id
      status
      orderStatus
      warnings
    }
  }
`);

export const StopCodMutation = graphql(`
  mutation OrdUpdateStopCod($id: ID!, $amount: Money!, $reason: String, $note: String) {
    updateStopCodActual(id: $id, amount: $amount, reason: $reason, note: $note) {
      id
      codActual
      warnings
    }
  }
`);

export const CustomerPickQuery = graphql(`
  query OrdCustomerPick($search: String) {
    customers(filter: { search: $search }, first: 30) {
      nodes {
        id
        code
        name
        phone
        status
        defaultDebtDays
        creditLimit
        debtSummary {
          remaining
          overdueOrders
        }
      }
    }
  }
`);

export const CustomerLocationsPickQuery = graphql(`
  query OrdCustomerLocations($customerId: ID!) {
    customerLocations(customerId: $customerId) {
      id
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
    }
  }
`);

export const CreditCheckQuery = graphql(`
  query OrdCreditCheck($customerId: ID!, $additionalAmount: Money) {
    customerCreditCheck(customerId: $customerId, additionalAmount: $additionalAmount) {
      overLimit
      currentDebt
      projectedDebt
      creditLimit
      overdueOrders
      warnings
    }
  }
`);

export const OrderSettingsQuery = graphql(`
  query OrdSettings {
    merchantSettings {
      defaultDebtDays
      defaultTripHours
      nearOverlapMinutes
    }
  }
`);

export const OrderFinanceQuery = graphql(`
  query OrdOrderFinance($orderId: ID!) {
    orderFinance(orderId: $orderId) {
      orderId
      revenue
      freightAmount
      addonTotal
      receivable
      paidAmount
      remainingAmount
      cost
      tripCost
      outsourcedCost
      otherCost
      profit
      margin
      provisional
    }
  }
`);

export const RenderDocumentMutation = graphql(`
  mutation OrdRenderDocument($input: RenderDocumentInput!) {
    renderDocument(input: $input) {
      template
      fileName
      url
      html
      attachmentId
    }
  }
`);

// ---------- Bookings (yêu cầu từ khách) ----------

export const BookingFields = graphql(`
  fragment BookingFields on BookingView {
    id
    code
    status
    cargoName
    weightTon
    packages
    vehicleTypeHint
    fragile
    loadingAtPickup
    loadingAtDrop
    pickupFrom
    deliverBefore
    flexibility
    note
    contactName
    contactPhone
    rejectReason
    cancelReason
    orderId
    orderCode
    customerId
    customerName
    accountName
    accountEmail
    createdAt
    stops {
      type
      address
      locationName
      contactName
      contactPhone
      note
    }
  }
`);

export const BookingsQuery = graphql(`
  query OrdBookings($filter: BookingFilter, $first: Int, $after: String) {
    bookings(filter: $filter, first: $first, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...BookingFields
      }
    }
  }
`);

export const BookingDetailQuery = graphql(`
  query OrdBooking($id: ID!) {
    booking(id: $id) {
      ...BookingFields
      notes {
        id
        authorType
        authorName
        body
        createdAt
      }
      statusHistory {
        fromStatus
        toStatus
        reason
        actorName
        changedAt
      }
    }
  }
`);

export const AcceptBookingMutation = graphql(`
  mutation OrdAcceptBooking($id: ID!, $customerId: ID) {
    acceptBooking(id: $id, customerId: $customerId) {
      id
      status
    }
  }
`);

export const RejectBookingMutation = graphql(`
  mutation OrdRejectBooking($id: ID!, $reason: String!) {
    rejectBooking(id: $id, reason: $reason) {
      id
      status
    }
  }
`);

export const AddBookingNoteMutation = graphql(`
  mutation OrdAddBookingNote($bookingId: ID!, $body: String!) {
    addBookingNote(bookingId: $bookingId, body: $body) {
      id
    }
  }
`);

export const OrderAttachmentsQuery = graphql(`
  query OrdOrderAttachments($orderId: ID!) {
    orderAttachments(orderId: $orderId) {
      ...AttachmentFields
    }
  }
`);
