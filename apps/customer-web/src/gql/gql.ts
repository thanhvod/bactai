/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query CustomerMe {\n    customerMe {\n      account { id email phone fullName companyName taxCode billingAddress contactTitle notificationPrefs }\n      merchantLinks { merchantId merchantName customerCode paymentTermDays orderCount }\n    }\n  }\n": typeof types.CustomerMeDocument,
    "\n  mutation UpdateCustomerProfile($input: CustomerProfileInput!) {\n    updateCustomerProfile(input: $input) {\n      account { id email phone fullName companyName taxCode billingAddress contactTitle notificationPrefs }\n      merchantLinks { merchantId merchantName customerCode paymentTermDays orderCount }\n    }\n  }\n": typeof types.UpdateCustomerProfileDocument,
    "\n  query PublicMerchants($filter: PublicMerchantFilter, $first: Int, $after: String) {\n    publicMerchants(filter: $filter, first: $first, after: $after) {\n      totalCount\n      pageInfo { hasNextPage hasPreviousPage endCursor }\n      nodes { id name intro serviceAreas services vehicleTypes province hasRelationship myOrderCount vehicleCount logoUrl dispatchHotline }\n    }\n  }\n": typeof types.PublicMerchantsDocument,
    "\n  query PublicMerchant($id: ID!) {\n    publicMerchant(id: $id) {\n      id name intro serviceAreas services vehicleTypes phone dispatchHotline email address province logoUrl vehicleCount hasRelationship myOrderCount\n    }\n  }\n": typeof types.PublicMerchantDocument,
    "\n  query MyAddresses {\n    myAddresses { id name address usage lat lng contactName contactPhone note isDefaultPickup }\n  }\n": typeof types.MyAddressesDocument,
    "\n  mutation CreateMyAddress($input: CustomerAddressInput!) {\n    createMyAddress(input: $input) { id }\n  }\n": typeof types.CreateMyAddressDocument,
    "\n  mutation UpdateMyAddress($id: ID!, $input: CustomerAddressInput!) {\n    updateMyAddress(id: $id, input: $input) { id }\n  }\n": typeof types.UpdateMyAddressDocument,
    "\n  mutation DeleteMyAddress($id: ID!) {\n    deleteMyAddress(id: $id)\n  }\n": typeof types.DeleteMyAddressDocument,
    "\n  query MyBookings($filter: BookingFilter, $first: Int, $after: String) {\n    myBookings(filter: $filter, first: $first, after: $after) {\n      totalCount\n      pageInfo { hasNextPage hasPreviousPage endCursor }\n      nodes {\n        id code status merchantId merchantName cargoName weightTon packages pickupFrom createdAt orderId orderCode\n        stops { type address locationName }\n      }\n    }\n  }\n": typeof types.MyBookingsDocument,
    "\n  query MyBooking($id: ID!) {\n    myBooking(id: $id) {\n      id code status merchantId merchantName cargoName weightTon packages vehicleTypeHint fragile loadingAtPickup loadingAtDrop\n      pickupFrom deliverBefore flexibility note contactName contactPhone rejectReason cancelReason orderId orderCode createdAt orderAdjustments\n      stops { type address locationName contactName contactPhone note }\n      notes { id authorType authorName body createdAt }\n      statusHistory { fromStatus toStatus reason actorName changedAt }\n    }\n  }\n": typeof types.MyBookingDocument,
    "\n  mutation CreateBooking($input: BookingInput!) {\n    createBooking(input: $input) { id code status }\n  }\n": typeof types.CreateBookingDocument,
    "\n  mutation UpdateBooking($id: ID!, $input: BookingInput!) {\n    updateBooking(id: $id, input: $input) { id code status }\n  }\n": typeof types.UpdateBookingDocument,
    "\n  mutation CancelBooking($id: ID!, $reason: String!) {\n    cancelBooking(id: $id, reason: $reason) { id status cancelReason }\n  }\n": typeof types.CancelBookingDocument,
    "\n  mutation AddBookingNote($bookingId: ID!, $body: String!) {\n    addBookingNote(bookingId: $bookingId, body: $body) { id notes { id authorType authorName body createdAt } }\n  }\n": typeof types.AddBookingNoteDocument,
    "\n  query MyOrders($filter: MyOrderFilter, $first: Int, $after: String) {\n    myOrders(filter: $filter, first: $first, after: $after) {\n      totalCount\n      pageInfo { hasNextPage hasPreviousPage endCursor }\n      nodes { id code status orderDate merchantName merchantId routeSummary bookingCode bookingId totalAmount paidAmount remainingAmount dueDate overdueDays }\n    }\n    myDebtSummary { total paid remaining overdue openOrders }\n  }\n": typeof types.MyOrdersDocument,
    "\n  query MyOrder($id: ID!) {\n    myOrder(id: $id) {\n      id code status orderDate merchantName merchantId routeSummary bookingCode bookingId totalAmount paidAmount remainingAmount dueDate overdueDays statementCode\n      stops { type place address contactName plannedAt actualAt status }\n      cargo\n      trips { code plate vehicleType driverName status lastUpdateAt }\n      pricingLines { label amount }\n      sharedAttachments { id fileName category createdAt url }\n    }\n  }\n": typeof types.MyOrderDocument,
    "\n  query MyDebtStatements {\n    myDebtStatements { id code merchantName periodFrom periodTo sentAt orderCount total paid remaining status pdfUrl }\n    myDebtSummary { total paid remaining overdue openOrders }\n  }\n": typeof types.MyDebtStatementsDocument,
    "\n  query MyDebtStatement($id: ID!) {\n    myDebtStatement(id: $id) {\n      id code pdfUrl\n      lines { orderDate orderCode orderId route total paid remaining dueDate overdueDays }\n    }\n  }\n": typeof types.MyDebtStatementDocument,
    "\n  query CustomerNotifications($filter: NotificationFilter, $first: Int, $after: String) {\n    notifications(filter: $filter, first: $first, after: $after) {\n      totalCount\n      unreadCount\n      pageInfo { hasNextPage endCursor }\n      nodes { id type title body entityType entityId severity readAt createdAt }\n    }\n  }\n": typeof types.CustomerNotificationsDocument,
    "\n  query CustomerUnreadCount {\n    unreadNotificationCount\n  }\n": typeof types.CustomerUnreadCountDocument,
    "\n  mutation MarkNotificationsRead($ids: [ID!]) {\n    markNotificationsRead(ids: $ids)\n  }\n": typeof types.MarkNotificationsReadDocument,
    "\n  mutation MarkAllNotificationsRead {\n    markAllNotificationsRead\n  }\n": typeof types.MarkAllNotificationsReadDocument,
};
const documents: Documents = {
    "\n  query CustomerMe {\n    customerMe {\n      account { id email phone fullName companyName taxCode billingAddress contactTitle notificationPrefs }\n      merchantLinks { merchantId merchantName customerCode paymentTermDays orderCount }\n    }\n  }\n": types.CustomerMeDocument,
    "\n  mutation UpdateCustomerProfile($input: CustomerProfileInput!) {\n    updateCustomerProfile(input: $input) {\n      account { id email phone fullName companyName taxCode billingAddress contactTitle notificationPrefs }\n      merchantLinks { merchantId merchantName customerCode paymentTermDays orderCount }\n    }\n  }\n": types.UpdateCustomerProfileDocument,
    "\n  query PublicMerchants($filter: PublicMerchantFilter, $first: Int, $after: String) {\n    publicMerchants(filter: $filter, first: $first, after: $after) {\n      totalCount\n      pageInfo { hasNextPage hasPreviousPage endCursor }\n      nodes { id name intro serviceAreas services vehicleTypes province hasRelationship myOrderCount vehicleCount logoUrl dispatchHotline }\n    }\n  }\n": types.PublicMerchantsDocument,
    "\n  query PublicMerchant($id: ID!) {\n    publicMerchant(id: $id) {\n      id name intro serviceAreas services vehicleTypes phone dispatchHotline email address province logoUrl vehicleCount hasRelationship myOrderCount\n    }\n  }\n": types.PublicMerchantDocument,
    "\n  query MyAddresses {\n    myAddresses { id name address usage lat lng contactName contactPhone note isDefaultPickup }\n  }\n": types.MyAddressesDocument,
    "\n  mutation CreateMyAddress($input: CustomerAddressInput!) {\n    createMyAddress(input: $input) { id }\n  }\n": types.CreateMyAddressDocument,
    "\n  mutation UpdateMyAddress($id: ID!, $input: CustomerAddressInput!) {\n    updateMyAddress(id: $id, input: $input) { id }\n  }\n": types.UpdateMyAddressDocument,
    "\n  mutation DeleteMyAddress($id: ID!) {\n    deleteMyAddress(id: $id)\n  }\n": types.DeleteMyAddressDocument,
    "\n  query MyBookings($filter: BookingFilter, $first: Int, $after: String) {\n    myBookings(filter: $filter, first: $first, after: $after) {\n      totalCount\n      pageInfo { hasNextPage hasPreviousPage endCursor }\n      nodes {\n        id code status merchantId merchantName cargoName weightTon packages pickupFrom createdAt orderId orderCode\n        stops { type address locationName }\n      }\n    }\n  }\n": types.MyBookingsDocument,
    "\n  query MyBooking($id: ID!) {\n    myBooking(id: $id) {\n      id code status merchantId merchantName cargoName weightTon packages vehicleTypeHint fragile loadingAtPickup loadingAtDrop\n      pickupFrom deliverBefore flexibility note contactName contactPhone rejectReason cancelReason orderId orderCode createdAt orderAdjustments\n      stops { type address locationName contactName contactPhone note }\n      notes { id authorType authorName body createdAt }\n      statusHistory { fromStatus toStatus reason actorName changedAt }\n    }\n  }\n": types.MyBookingDocument,
    "\n  mutation CreateBooking($input: BookingInput!) {\n    createBooking(input: $input) { id code status }\n  }\n": types.CreateBookingDocument,
    "\n  mutation UpdateBooking($id: ID!, $input: BookingInput!) {\n    updateBooking(id: $id, input: $input) { id code status }\n  }\n": types.UpdateBookingDocument,
    "\n  mutation CancelBooking($id: ID!, $reason: String!) {\n    cancelBooking(id: $id, reason: $reason) { id status cancelReason }\n  }\n": types.CancelBookingDocument,
    "\n  mutation AddBookingNote($bookingId: ID!, $body: String!) {\n    addBookingNote(bookingId: $bookingId, body: $body) { id notes { id authorType authorName body createdAt } }\n  }\n": types.AddBookingNoteDocument,
    "\n  query MyOrders($filter: MyOrderFilter, $first: Int, $after: String) {\n    myOrders(filter: $filter, first: $first, after: $after) {\n      totalCount\n      pageInfo { hasNextPage hasPreviousPage endCursor }\n      nodes { id code status orderDate merchantName merchantId routeSummary bookingCode bookingId totalAmount paidAmount remainingAmount dueDate overdueDays }\n    }\n    myDebtSummary { total paid remaining overdue openOrders }\n  }\n": types.MyOrdersDocument,
    "\n  query MyOrder($id: ID!) {\n    myOrder(id: $id) {\n      id code status orderDate merchantName merchantId routeSummary bookingCode bookingId totalAmount paidAmount remainingAmount dueDate overdueDays statementCode\n      stops { type place address contactName plannedAt actualAt status }\n      cargo\n      trips { code plate vehicleType driverName status lastUpdateAt }\n      pricingLines { label amount }\n      sharedAttachments { id fileName category createdAt url }\n    }\n  }\n": types.MyOrderDocument,
    "\n  query MyDebtStatements {\n    myDebtStatements { id code merchantName periodFrom periodTo sentAt orderCount total paid remaining status pdfUrl }\n    myDebtSummary { total paid remaining overdue openOrders }\n  }\n": types.MyDebtStatementsDocument,
    "\n  query MyDebtStatement($id: ID!) {\n    myDebtStatement(id: $id) {\n      id code pdfUrl\n      lines { orderDate orderCode orderId route total paid remaining dueDate overdueDays }\n    }\n  }\n": types.MyDebtStatementDocument,
    "\n  query CustomerNotifications($filter: NotificationFilter, $first: Int, $after: String) {\n    notifications(filter: $filter, first: $first, after: $after) {\n      totalCount\n      unreadCount\n      pageInfo { hasNextPage endCursor }\n      nodes { id type title body entityType entityId severity readAt createdAt }\n    }\n  }\n": types.CustomerNotificationsDocument,
    "\n  query CustomerUnreadCount {\n    unreadNotificationCount\n  }\n": types.CustomerUnreadCountDocument,
    "\n  mutation MarkNotificationsRead($ids: [ID!]) {\n    markNotificationsRead(ids: $ids)\n  }\n": types.MarkNotificationsReadDocument,
    "\n  mutation MarkAllNotificationsRead {\n    markAllNotificationsRead\n  }\n": types.MarkAllNotificationsReadDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CustomerMe {\n    customerMe {\n      account { id email phone fullName companyName taxCode billingAddress contactTitle notificationPrefs }\n      merchantLinks { merchantId merchantName customerCode paymentTermDays orderCount }\n    }\n  }\n"): (typeof documents)["\n  query CustomerMe {\n    customerMe {\n      account { id email phone fullName companyName taxCode billingAddress contactTitle notificationPrefs }\n      merchantLinks { merchantId merchantName customerCode paymentTermDays orderCount }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateCustomerProfile($input: CustomerProfileInput!) {\n    updateCustomerProfile(input: $input) {\n      account { id email phone fullName companyName taxCode billingAddress contactTitle notificationPrefs }\n      merchantLinks { merchantId merchantName customerCode paymentTermDays orderCount }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateCustomerProfile($input: CustomerProfileInput!) {\n    updateCustomerProfile(input: $input) {\n      account { id email phone fullName companyName taxCode billingAddress contactTitle notificationPrefs }\n      merchantLinks { merchantId merchantName customerCode paymentTermDays orderCount }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PublicMerchants($filter: PublicMerchantFilter, $first: Int, $after: String) {\n    publicMerchants(filter: $filter, first: $first, after: $after) {\n      totalCount\n      pageInfo { hasNextPage hasPreviousPage endCursor }\n      nodes { id name intro serviceAreas services vehicleTypes province hasRelationship myOrderCount vehicleCount logoUrl dispatchHotline }\n    }\n  }\n"): (typeof documents)["\n  query PublicMerchants($filter: PublicMerchantFilter, $first: Int, $after: String) {\n    publicMerchants(filter: $filter, first: $first, after: $after) {\n      totalCount\n      pageInfo { hasNextPage hasPreviousPage endCursor }\n      nodes { id name intro serviceAreas services vehicleTypes province hasRelationship myOrderCount vehicleCount logoUrl dispatchHotline }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PublicMerchant($id: ID!) {\n    publicMerchant(id: $id) {\n      id name intro serviceAreas services vehicleTypes phone dispatchHotline email address province logoUrl vehicleCount hasRelationship myOrderCount\n    }\n  }\n"): (typeof documents)["\n  query PublicMerchant($id: ID!) {\n    publicMerchant(id: $id) {\n      id name intro serviceAreas services vehicleTypes phone dispatchHotline email address province logoUrl vehicleCount hasRelationship myOrderCount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyAddresses {\n    myAddresses { id name address usage lat lng contactName contactPhone note isDefaultPickup }\n  }\n"): (typeof documents)["\n  query MyAddresses {\n    myAddresses { id name address usage lat lng contactName contactPhone note isDefaultPickup }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateMyAddress($input: CustomerAddressInput!) {\n    createMyAddress(input: $input) { id }\n  }\n"): (typeof documents)["\n  mutation CreateMyAddress($input: CustomerAddressInput!) {\n    createMyAddress(input: $input) { id }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateMyAddress($id: ID!, $input: CustomerAddressInput!) {\n    updateMyAddress(id: $id, input: $input) { id }\n  }\n"): (typeof documents)["\n  mutation UpdateMyAddress($id: ID!, $input: CustomerAddressInput!) {\n    updateMyAddress(id: $id, input: $input) { id }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteMyAddress($id: ID!) {\n    deleteMyAddress(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteMyAddress($id: ID!) {\n    deleteMyAddress(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyBookings($filter: BookingFilter, $first: Int, $after: String) {\n    myBookings(filter: $filter, first: $first, after: $after) {\n      totalCount\n      pageInfo { hasNextPage hasPreviousPage endCursor }\n      nodes {\n        id code status merchantId merchantName cargoName weightTon packages pickupFrom createdAt orderId orderCode\n        stops { type address locationName }\n      }\n    }\n  }\n"): (typeof documents)["\n  query MyBookings($filter: BookingFilter, $first: Int, $after: String) {\n    myBookings(filter: $filter, first: $first, after: $after) {\n      totalCount\n      pageInfo { hasNextPage hasPreviousPage endCursor }\n      nodes {\n        id code status merchantId merchantName cargoName weightTon packages pickupFrom createdAt orderId orderCode\n        stops { type address locationName }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyBooking($id: ID!) {\n    myBooking(id: $id) {\n      id code status merchantId merchantName cargoName weightTon packages vehicleTypeHint fragile loadingAtPickup loadingAtDrop\n      pickupFrom deliverBefore flexibility note contactName contactPhone rejectReason cancelReason orderId orderCode createdAt orderAdjustments\n      stops { type address locationName contactName contactPhone note }\n      notes { id authorType authorName body createdAt }\n      statusHistory { fromStatus toStatus reason actorName changedAt }\n    }\n  }\n"): (typeof documents)["\n  query MyBooking($id: ID!) {\n    myBooking(id: $id) {\n      id code status merchantId merchantName cargoName weightTon packages vehicleTypeHint fragile loadingAtPickup loadingAtDrop\n      pickupFrom deliverBefore flexibility note contactName contactPhone rejectReason cancelReason orderId orderCode createdAt orderAdjustments\n      stops { type address locationName contactName contactPhone note }\n      notes { id authorType authorName body createdAt }\n      statusHistory { fromStatus toStatus reason actorName changedAt }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateBooking($input: BookingInput!) {\n    createBooking(input: $input) { id code status }\n  }\n"): (typeof documents)["\n  mutation CreateBooking($input: BookingInput!) {\n    createBooking(input: $input) { id code status }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateBooking($id: ID!, $input: BookingInput!) {\n    updateBooking(id: $id, input: $input) { id code status }\n  }\n"): (typeof documents)["\n  mutation UpdateBooking($id: ID!, $input: BookingInput!) {\n    updateBooking(id: $id, input: $input) { id code status }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CancelBooking($id: ID!, $reason: String!) {\n    cancelBooking(id: $id, reason: $reason) { id status cancelReason }\n  }\n"): (typeof documents)["\n  mutation CancelBooking($id: ID!, $reason: String!) {\n    cancelBooking(id: $id, reason: $reason) { id status cancelReason }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddBookingNote($bookingId: ID!, $body: String!) {\n    addBookingNote(bookingId: $bookingId, body: $body) { id notes { id authorType authorName body createdAt } }\n  }\n"): (typeof documents)["\n  mutation AddBookingNote($bookingId: ID!, $body: String!) {\n    addBookingNote(bookingId: $bookingId, body: $body) { id notes { id authorType authorName body createdAt } }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyOrders($filter: MyOrderFilter, $first: Int, $after: String) {\n    myOrders(filter: $filter, first: $first, after: $after) {\n      totalCount\n      pageInfo { hasNextPage hasPreviousPage endCursor }\n      nodes { id code status orderDate merchantName merchantId routeSummary bookingCode bookingId totalAmount paidAmount remainingAmount dueDate overdueDays }\n    }\n    myDebtSummary { total paid remaining overdue openOrders }\n  }\n"): (typeof documents)["\n  query MyOrders($filter: MyOrderFilter, $first: Int, $after: String) {\n    myOrders(filter: $filter, first: $first, after: $after) {\n      totalCount\n      pageInfo { hasNextPage hasPreviousPage endCursor }\n      nodes { id code status orderDate merchantName merchantId routeSummary bookingCode bookingId totalAmount paidAmount remainingAmount dueDate overdueDays }\n    }\n    myDebtSummary { total paid remaining overdue openOrders }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyOrder($id: ID!) {\n    myOrder(id: $id) {\n      id code status orderDate merchantName merchantId routeSummary bookingCode bookingId totalAmount paidAmount remainingAmount dueDate overdueDays statementCode\n      stops { type place address contactName plannedAt actualAt status }\n      cargo\n      trips { code plate vehicleType driverName status lastUpdateAt }\n      pricingLines { label amount }\n      sharedAttachments { id fileName category createdAt url }\n    }\n  }\n"): (typeof documents)["\n  query MyOrder($id: ID!) {\n    myOrder(id: $id) {\n      id code status orderDate merchantName merchantId routeSummary bookingCode bookingId totalAmount paidAmount remainingAmount dueDate overdueDays statementCode\n      stops { type place address contactName plannedAt actualAt status }\n      cargo\n      trips { code plate vehicleType driverName status lastUpdateAt }\n      pricingLines { label amount }\n      sharedAttachments { id fileName category createdAt url }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyDebtStatements {\n    myDebtStatements { id code merchantName periodFrom periodTo sentAt orderCount total paid remaining status pdfUrl }\n    myDebtSummary { total paid remaining overdue openOrders }\n  }\n"): (typeof documents)["\n  query MyDebtStatements {\n    myDebtStatements { id code merchantName periodFrom periodTo sentAt orderCount total paid remaining status pdfUrl }\n    myDebtSummary { total paid remaining overdue openOrders }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyDebtStatement($id: ID!) {\n    myDebtStatement(id: $id) {\n      id code pdfUrl\n      lines { orderDate orderCode orderId route total paid remaining dueDate overdueDays }\n    }\n  }\n"): (typeof documents)["\n  query MyDebtStatement($id: ID!) {\n    myDebtStatement(id: $id) {\n      id code pdfUrl\n      lines { orderDate orderCode orderId route total paid remaining dueDate overdueDays }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CustomerNotifications($filter: NotificationFilter, $first: Int, $after: String) {\n    notifications(filter: $filter, first: $first, after: $after) {\n      totalCount\n      unreadCount\n      pageInfo { hasNextPage endCursor }\n      nodes { id type title body entityType entityId severity readAt createdAt }\n    }\n  }\n"): (typeof documents)["\n  query CustomerNotifications($filter: NotificationFilter, $first: Int, $after: String) {\n    notifications(filter: $filter, first: $first, after: $after) {\n      totalCount\n      unreadCount\n      pageInfo { hasNextPage endCursor }\n      nodes { id type title body entityType entityId severity readAt createdAt }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CustomerUnreadCount {\n    unreadNotificationCount\n  }\n"): (typeof documents)["\n  query CustomerUnreadCount {\n    unreadNotificationCount\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkNotificationsRead($ids: [ID!]) {\n    markNotificationsRead(ids: $ids)\n  }\n"): (typeof documents)["\n  mutation MarkNotificationsRead($ids: [ID!]) {\n    markNotificationsRead(ids: $ids)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkAllNotificationsRead {\n    markAllNotificationsRead\n  }\n"): (typeof documents)["\n  mutation MarkAllNotificationsRead {\n    markAllNotificationsRead\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;