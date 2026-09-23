import { gql } from '@apollo/client';

// TODO: thay bằng typed document từ src/gql sau khi chạy codegen (schema apps/api/schema.gql).
export type MerchantRole = 'ADMIN' | 'OPERATION' | 'ACCOUNTANT';
export type MemberStatus = 'INVITED' | 'ACTIVE' | 'LOCKED';

export interface MeAccount {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}
export interface MeMembership {
  id: string;
  merchantId: string;
  merchantCode: string;
  merchantName: string;
  role: MerchantRole;
  status: MemberStatus;
  lastAccessAt: string | null;
}
export interface MeCurrent {
  membershipId: string;
  merchantId: string;
  merchantName: string;
  role: MerchantRole;
  permissions: string[];
}
export interface MeData {
  me: { account: MeAccount; memberships: MeMembership[]; current: MeCurrent | null };
}

export const ME_QUERY = gql`
  query Me {
    me {
      account { id email name avatarUrl }
      memberships { id merchantId merchantCode merchantName role status lastAccessAt }
      current { membershipId merchantId merchantName role permissions }
    }
  }
`;

export const CREATE_MERCHANT = gql`
  mutation CreateMerchant($input: CreateMerchantInput!) {
    createMerchant(input: $input) { id merchantId merchantCode merchantName role status lastAccessAt }
  }
`;

export const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($membershipId: ID!) {
    acceptInvitation(membershipId: $membershipId) { id merchantId merchantCode merchantName role status lastAccessAt }
  }
`;
