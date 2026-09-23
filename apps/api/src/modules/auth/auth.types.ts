import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Account {
  @Field(() => ID) id: string;
  @Field() email: string;
  @Field(() => String, { nullable: true }) name?: string | null;
  @Field(() => String, { nullable: true }) avatarUrl?: string | null;
  /** SĐT đăng nhập App Merchant (D-014) */
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field() hasAppPassword: boolean;
  @Field() mustChangePassword: boolean;
}

@ObjectType()
export class Membership {
  @Field(() => ID) id: string;
  @Field(() => ID) merchantId: string;
  @Field() merchantCode: string;
  @Field() merchantName: string;
  @Field(() => String) role: string;
  @Field(() => String) status: string;
  @Field(() => Date, { nullable: true }) lastAccessAt?: Date | null;
}

@ObjectType()
export class CurrentContext {
  @Field(() => ID) membershipId: string;
  @Field(() => ID) merchantId: string;
  @Field() merchantName: string;
  @Field() merchantCode: string;
  @Field(() => String) role: string;
  @Field(() => [String]) permissions: string[];
}

@ObjectType()
export class Me {
  @Field(() => Account) account: Account;
  @Field(() => [Membership]) memberships: Membership[];
  @Field(() => CurrentContext, { nullable: true }) current?: CurrentContext | null;
  @Field() canCreateMerchant: boolean;
}

@InputType()
export class CreateMerchantInput {
  @Field() name: string;
  @Field({ nullable: true }) legalName?: string;
  @Field({ nullable: true }) taxCode?: string;
  @Field({ nullable: true }) address?: string;
  @Field({ nullable: true }) contactName?: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) email?: string;
}
