import { graphql } from '@/gql';

export const CustomerMeQuery = graphql(`
  query CustomerMe {
    customerMe {
      account { id email phone fullName companyName taxCode billingAddress contactTitle notificationPrefs }
      merchantLinks { merchantId merchantName customerCode paymentTermDays orderCount }
    }
  }
`);

export const UpdateCustomerProfileMutation = graphql(`
  mutation UpdateCustomerProfile($input: CustomerProfileInput!) {
    updateCustomerProfile(input: $input) {
      account { id email phone fullName companyName taxCode billingAddress contactTitle notificationPrefs }
      merchantLinks { merchantId merchantName customerCode paymentTermDays orderCount }
    }
  }
`);

export const PublicMerchantsQuery = graphql(`
  query PublicMerchants($filter: PublicMerchantFilter, $first: Int, $after: String) {
    publicMerchants(filter: $filter, first: $first, after: $after) {
      totalCount
      pageInfo { hasNextPage hasPreviousPage endCursor }
      nodes { id name intro serviceAreas services vehicleTypes province hasRelationship myOrderCount vehicleCount logoUrl dispatchHotline }
    }
  }
`);

export const PublicMerchantQuery = graphql(`
  query PublicMerchant($id: ID!) {
    publicMerchant(id: $id) {
      id name intro serviceAreas services vehicleTypes phone dispatchHotline email address province logoUrl vehicleCount hasRelationship myOrderCount
    }
  }
`);

export const MyAddressesQuery = graphql(`
  query MyAddresses {
    myAddresses { id name address usage lat lng contactName contactPhone note isDefaultPickup }
  }
`);

export const CreateMyAddressMutation = graphql(`
  mutation CreateMyAddress($input: CustomerAddressInput!) {
    createMyAddress(input: $input) { id }
  }
`);

export const UpdateMyAddressMutation = graphql(`
  mutation UpdateMyAddress($id: ID!, $input: CustomerAddressInput!) {
    updateMyAddress(id: $id, input: $input) { id }
  }
`);

export const DeleteMyAddressMutation = graphql(`
  mutation DeleteMyAddress($id: ID!) {
    deleteMyAddress(id: $id)
  }
`);

export const MyBookingsQuery = graphql(`
  query MyBookings($filter: BookingFilter, $first: Int, $after: String) {
    myBookings(filter: $filter, first: $first, after: $after) {
      totalCount
      pageInfo { hasNextPage hasPreviousPage endCursor }
      nodes {
        id code status merchantId merchantName cargoName weightTon packages pickupFrom createdAt orderId orderCode
        stops { type address locationName }
      }
    }
  }
`);

export const MyBookingQuery = graphql(`
  query MyBooking($id: ID!) {
    myBooking(id: $id) {
      id code status merchantId merchantName cargoName weightTon packages vehicleTypeHint fragile loadingAtPickup loadingAtDrop
      pickupFrom deliverBefore flexibility note contactName contactPhone rejectReason cancelReason orderId orderCode createdAt orderAdjustments
      stops { type address locationName contactName contactPhone note }
      notes { id authorType authorName body createdAt }
      statusHistory { fromStatus toStatus reason actorName changedAt }
    }
  }
`);

export const CreateBookingMutation = graphql(`
  mutation CreateBooking($input: BookingInput!) {
    createBooking(input: $input) { id code status }
  }
`);

export const UpdateBookingMutation = graphql(`
  mutation UpdateBooking($id: ID!, $input: BookingInput!) {
    updateBooking(id: $id, input: $input) { id code status }
  }
`);

export const CancelBookingMutation = graphql(`
  mutation CancelBooking($id: ID!, $reason: String!) {
    cancelBooking(id: $id, reason: $reason) { id status cancelReason }
  }
`);

export const AddBookingNoteMutation = graphql(`
  mutation AddBookingNote($bookingId: ID!, $body: String!) {
    addBookingNote(bookingId: $bookingId, body: $body) { id notes { id authorType authorName body createdAt } }
  }
`);

export const MyOrdersQuery = graphql(`
  query MyOrders($filter: MyOrderFilter, $first: Int, $after: String) {
    myOrders(filter: $filter, first: $first, after: $after) {
      totalCount
      pageInfo { hasNextPage hasPreviousPage endCursor }
      nodes { id code status orderDate merchantName merchantId routeSummary bookingCode bookingId totalAmount paidAmount remainingAmount dueDate overdueDays }
    }
    myDebtSummary { total paid remaining overdue openOrders }
  }
`);

export const MyOrderQuery = graphql(`
  query MyOrder($id: ID!) {
    myOrder(id: $id) {
      id code status orderDate merchantName merchantId routeSummary bookingCode bookingId totalAmount paidAmount remainingAmount dueDate overdueDays statementCode
      stops { type place address contactName plannedAt actualAt status }
      cargo
      trips { code plate vehicleType driverName status lastUpdateAt }
      pricingLines { label amount }
      sharedAttachments { id fileName category createdAt url }
    }
  }
`);

export const MyDebtStatementsQuery = graphql(`
  query MyDebtStatements {
    myDebtStatements { id code merchantName periodFrom periodTo sentAt orderCount total paid remaining status pdfUrl }
    myDebtSummary { total paid remaining overdue openOrders }
  }
`);

export const MyDebtStatementQuery = graphql(`
  query MyDebtStatement($id: ID!) {
    myDebtStatement(id: $id) {
      id code pdfUrl
      lines { orderDate orderCode orderId route total paid remaining dueDate overdueDays }
    }
  }
`);

export const NotificationsQuery = graphql(`
  query CustomerNotifications($filter: NotificationFilter, $first: Int, $after: String) {
    notifications(filter: $filter, first: $first, after: $after) {
      totalCount
      unreadCount
      pageInfo { hasNextPage endCursor }
      nodes { id type title body entityType entityId severity readAt createdAt }
    }
  }
`);

export const UnreadCountQuery = graphql(`
  query CustomerUnreadCount {
    unreadNotificationCount
  }
`);

export const MarkNotificationsReadMutation = graphql(`
  mutation MarkNotificationsRead($ids: [ID!]) {
    markNotificationsRead(ids: $ids)
  }
`);

export const MarkAllNotificationsReadMutation = graphql(`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`);
