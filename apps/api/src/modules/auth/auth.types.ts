import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';

registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
export class MerchantInfo {
  @Field() id!: string;
  @Field() name!: string;
  @Field(() => String, { nullable: true }) taxCode?: string | null;
  @Field(() => String, { nullable: true }) address?: string | null;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field() scheduleWarnHours!: number;
}

@ObjectType()
export class CurrentUserInfo {
  @Field() id!: string;
  @Field() email!: string;
  @Field() fullName!: string;
  @Field(() => UserRole) role!: UserRole;
  @Field(() => MerchantInfo) merchant!: MerchantInfo;
}

/** Ngữ cảnh request sau khi qua guard */
export interface AuthContext {
  firebaseUid: string;
  email: string;
  displayName?: string;
  /** null khi email Google chưa gắn với user nào (chưa đăng ký merchant) */
  user: {
    id: string;
    merchantId: string;
    role: UserRole;
    email: string;
    fullName: string;
  } | null;
}
