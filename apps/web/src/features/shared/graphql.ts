import { graphql } from '@/gql';

export const ActivityTimelineQuery = graphql(`
  query ActivityTimeline($entity: EntityRefInput!, $filter: TimelineFilter) {
    activityTimeline(entity: $entity, filter: $filter) {
      id
      kind
      createdAt
      entityType
      entityId
      category
      action
      summary
      actorType
      actorName
      reason
      before
      after
      sensitive
      fromStatus
      toStatus
    }
  }
`);

export const AttachmentFields = graphql(`
  fragment AttachmentFields on AttachmentView {
    id
    entityType
    entityId
    category
    fileName
    mimeType
    size
    status
    uploadedByType
    uploadedByName
    capturedAt
    note
    sharedWithCustomer
    createdAt
    url
  }
`);

export const AttachmentsQuery = graphql(`
  query Attachments($entityType: EntityType!, $entityId: ID!, $category: AttachmentCategory) {
    attachments(entityType: $entityType, entityId: $entityId, category: $category) {
      ...AttachmentFields
    }
  }
`);

export const DeleteAttachmentMutation = graphql(`
  mutation DeleteAttachment($id: ID!, $reason: String!) {
    deleteAttachment(id: $id, reason: $reason) {
      id
      status
    }
  }
`);

export const NotificationsQuery = graphql(`
  query Notifications($filter: NotificationFilter, $first: Int) {
    notifications(filter: $filter, first: $first) {
      unreadCount
      totalCount
      nodes {
        id
        type
        title
        body
        entityType
        entityId
        severity
        readAt
        createdAt
      }
    }
  }
`);

export const MarkNotificationReadMutation = graphql(`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id)
  }
`);

export const MarkAllNotificationsReadMutation = graphql(`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`);

export const CatalogOptionsQuery = graphql(`
  query CatalogOptions($type: CatalogType, $activeOnly: Boolean) {
    catalogItems(type: $type, activeOnly: $activeOnly) {
      id
      type
      code
      name
      active
    }
  }
`);
