import { graphql } from '@/gql';

export const MerchantProfileQuery = graphql(`
  query MerchantProfile {
    merchantProfile {
      id
      code
      name
      legalName
      taxCode
      businessType
      address
      province
      district
      yardName
      representativeName
      representativeTitle
      contactName
      phone
      dispatchHotline
      email
      intro
      logoAttachmentId
      logoUrl
      publicProfile
      serviceAreas
      services
      updatedAt
    }
  }
`);

export const UpdateMerchantProfileMutation = graphql(`
  mutation UpdateMerchantProfile($input: MerchantProfileInput!) {
    updateMerchantProfile(input: $input) {
      id
      name
      logoAttachmentId
      logoUrl
      updatedAt
    }
  }
`);

export const MerchantSettingsQuery = graphql(`
  query MerchantSettings {
    merchantSettings {
      payrollPeriodType
      payrollStartDay
      nearOverlapMinutes
      defaultTripHours
      overlapWarnVehicle
      overlapWarnDriver
      codWarningAmount
      codWarningDays
      codDashboardAlert
      defaultDebtDays
      defaultCreditLimit
      warnOverLimit
      warnOverdue
      gpsRetentionDays
      updatedAt
    }
  }
`);

export const UpdateMerchantSettingsMutation = graphql(`
  mutation UpdateMerchantSettings($input: MerchantSettingsInput!) {
    updateMerchantSettings(input: $input) {
      payrollPeriodType
      payrollStartDay
      nearOverlapMinutes
      defaultTripHours
      overlapWarnVehicle
      overlapWarnDriver
      codWarningAmount
      codWarningDays
      codDashboardAlert
      defaultDebtDays
      defaultCreditLimit
      warnOverLimit
      warnOverdue
      gpsRetentionDays
      updatedAt
    }
  }
`);

export const NumberSequencesQuery = graphql(`
  query NumberSequences {
    numberSequences {
      docType
      label
      prefix
      separator
      datePart
      digits
      resetPeriod
      pattern
      nextValue
      issuedThisPeriod
    }
  }
`);

export const UpdateNumberFormatMutation = graphql(`
  mutation UpdateNumberFormat($docType: DocType!, $input: NumberFormatInput!) {
    updateNumberSequenceFormat(docType: $docType, input: $input) {
      docType
      prefix
      separator
      datePart
      digits
      resetPeriod
      pattern
      nextValue
      issuedThisPeriod
    }
  }
`);

export const MerchantUserFields = graphql(`
  fragment MerchantUserFields on MerchantUserView {
    id
    email
    name
    phone
    title
    role
    extraPermissions
    effectivePermissions
    status
    note
    invitedByName
    invitedAt
    joinedAt
    lastAccessAt
    isSelf
    appLogin {
      phone
      hasPassword
      mustChangePassword
      lastLoginAt
      sharedWithOtherMerchants
    }
  }
`);

/** D-014: admin cấp / đặt lại mật khẩu App Merchant (mật khẩu tạm hiển thị 1 lần). */
export const ResetMerchantUserAppPasswordMutation = graphql(`
  mutation ResetMerchantUserAppPassword($id: ID!, $phone: String) {
    resetMerchantUserAppPassword(id: $id, phone: $phone) {
      phone
      tempPassword
    }
  }
`);

export const DisableMerchantUserAppLoginMutation = graphql(`
  mutation DisableMerchantUserAppLogin($id: ID!) {
    disableMerchantUserAppLogin(id: $id) {
      ...MerchantUserFields
    }
  }
`);

export const MerchantUsersQuery = graphql(`
  query MerchantUsers($filter: MerchantUserFilter, $first: Int, $after: String) {
    merchantUsers(filter: $filter, first: $first, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      nodes {
        ...MerchantUserFields
      }
    }
  }
`);

export const MerchantUserQuery = graphql(`
  query MerchantUser($id: ID!) {
    merchantUser(id: $id) {
      ...MerchantUserFields
    }
    activityByActor(actorId: $id, first: 30) {
      id
      createdAt
      entityType
      category
      action
      summary
      actorName
      reason
      before
      after
      sensitive
    }
  }
`);

export const InviteMerchantUserMutation = graphql(`
  mutation InviteMerchantUser($input: InviteMerchantUserInput!) {
    inviteMerchantUser(input: $input) {
      ...MerchantUserFields
    }
  }
`);

export const UpdateMerchantUserMutation = graphql(`
  mutation UpdateMerchantUser($id: ID!, $input: UpdateMerchantUserInput!) {
    updateMerchantUser(id: $id, input: $input) {
      ...MerchantUserFields
    }
  }
`);

export const LockMerchantUserMutation = graphql(`
  mutation LockMerchantUser($id: ID!) {
    lockMerchantUser(id: $id) {
      ...MerchantUserFields
    }
  }
`);

export const UnlockMerchantUserMutation = graphql(`
  mutation UnlockMerchantUser($id: ID!) {
    unlockMerchantUser(id: $id) {
      ...MerchantUserFields
    }
  }
`);

export const ResendInviteMutation = graphql(`
  mutation ResendInvite($id: ID!) {
    resendInvite(id: $id) {
      ...MerchantUserFields
    }
  }
`);

export const RolesQuery = graphql(`
  query RolesAndMatrix {
    roles {
      key
      name
      userCount
    }
    permissionMatrix {
      action
      label
      group
      groupLabel
      requiresReason
      admin
      operation
      accountant
      grantedUserCount
    }
  }
`);

export const UpdateRolePermissionMutation = graphql(`
  mutation UpdateRolePermission($role: String!, $permission: String!, $grant: String!) {
    updateRolePermission(role: $role, permission: $permission, grant: $grant) {
      action
      admin
      operation
      accountant
      grantedUserCount
    }
  }
`);

export const CatalogItemFields = graphql(`
  fragment CatalogItemFields on CatalogItemView {
    id
    type
    code
    name
    appliesTo
    isDefault
    sortOrder
    active
    usageCount
  }
`);

export const CatalogItemsQuery = graphql(`
  query CatalogItems($type: CatalogType) {
    catalogItems(type: $type) {
      ...CatalogItemFields
    }
  }
`);

export const CreateCatalogItemMutation = graphql(`
  mutation CreateCatalogItem($input: CatalogItemInput!) {
    createCatalogItem(input: $input) {
      ...CatalogItemFields
    }
  }
`);

export const UpdateCatalogItemMutation = graphql(`
  mutation UpdateCatalogItem($id: ID!, $input: CatalogItemInput!) {
    updateCatalogItem(id: $id, input: $input) {
      ...CatalogItemFields
    }
  }
`);

export const DeactivateCatalogItemMutation = graphql(`
  mutation DeactivateCatalogItem($id: ID!) {
    deactivateCatalogItem(id: $id) {
      ...CatalogItemFields
    }
  }
`);

export const ActivateCatalogItemMutation = graphql(`
  mutation ActivateCatalogItem($id: ID!) {
    activateCatalogItem(id: $id) {
      ...CatalogItemFields
    }
  }
`);

export const ReorderCatalogItemsMutation = graphql(`
  mutation ReorderCatalogItems($type: CatalogType!, $ids: [ID!]!) {
    reorderCatalogItems(type: $type, ids: $ids) {
      ...CatalogItemFields
    }
  }
`);
