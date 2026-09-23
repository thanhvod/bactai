import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ConnectionType } from '../../common/graphql/pagination';

@ObjectType()
export class StaffAppLoginView {
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field() hasPassword: boolean;
  @Field() mustChangePassword: boolean;
  @Field(() => Date, { nullable: true }) lastLoginAt?: Date | null;
  /** Tài khoản thuộc nhà xe khác → admin không đặt lại được, nhân viên tự đặt */
  @Field() sharedWithOtherMerchants: boolean;
}

@ObjectType()
export class StaffAppCredentials {
  @Field() phone: string;
  @Field() tempPassword: string;
}

@ObjectType()
export class MerchantUserView {
  @Field(() => ID) id: string;
  @Field() email: string;
  @Field() name: string;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => String, { nullable: true }) title?: string | null;
  @Field(() => String) role: string;
  @Field(() => [String]) extraPermissions: string[];
  @Field(() => [String]) effectivePermissions: string[];
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field(() => String, { nullable: true }) invitedByName?: string | null;
  @Field() invitedAt: Date;
  @Field(() => Date, { nullable: true }) joinedAt?: Date | null;
  @Field(() => Date, { nullable: true }) lastAccessAt?: Date | null;
  @Field() isSelf: boolean;
  @Field(() => StaffAppLoginView) appLogin: StaffAppLoginView;
}

@ObjectType()
export class MerchantUserConnection extends ConnectionType(MerchantUserView, 'MerchantUserConnection') {}

@InputType()
export class MerchantUserFilter {
  @Field({ nullable: true }) search?: string;
  @Field(() => String, { nullable: true }) role?: string;
  @Field(() => String, { nullable: true }) status?: string;
}

@InputType()
export class InviteMerchantUserInput {
  @Field() email: string;
  @Field() name: string;
  @Field({ nullable: true }) phone?: string;
  @Field(() => String) role: string;
  @Field(() => [String], { nullable: true }) extraPermissions?: string[];
  @Field({ nullable: true }) note?: string;
}

@InputType()
export class UpdateMerchantUserInput {
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) title?: string;
  @Field(() => String, { nullable: true }) role?: string;
  @Field(() => [String], { nullable: true }) extraPermissions?: string[];
  @Field({ nullable: true }) note?: string;
}

@ObjectType()
export class RoleView {
  @Field() key: string;
  @Field() name: string;
  @Field(() => Int) userCount: number;
}

@ObjectType()
export class PermissionMatrixRow {
  @Field() action: string;
  @Field() label: string;
  @Field() group: string;
  @Field() groupLabel: string;
  @Field() requiresReason: boolean;
  @Field(() => String) admin: string;
  @Field(() => String) operation: string;
  @Field(() => String) accountant: string;
  @Field(() => Int) grantedUserCount: number;
}
