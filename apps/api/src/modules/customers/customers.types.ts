import { Field, Float, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from '../../common/graphql/common.types';
import { ConnectionType } from '../../common/graphql/pagination';
import { MoneyScalar } from '../../common/graphql/scalars';

@ObjectType()
export class ContactView {
  @Field(() => String, { nullable: true }) name?: string | null;
  @Field(() => String, { nullable: true }) role?: string | null;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) zalo?: string | null;
}

@InputType()
export class ContactInput {
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) role?: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) zalo?: string;
}

@ObjectType()
export class AgingView {
  @Field(() => MoneyScalar) current: number;
  @Field(() => MoneyScalar) d1_15: number;
  @Field(() => MoneyScalar) d16_30: number;
  @Field(() => MoneyScalar) d31_60: number;
  @Field(() => MoneyScalar) d60p: number;
}

@ObjectType()
export class CustomerDebtSummaryView {
  @Field(() => MoneyScalar) receivable: number;
  @Field(() => MoneyScalar) paid: number;
  @Field(() => MoneyScalar) remaining: number;
  @Field(() => MoneyScalar) overdueAmount: number;
  @Field(() => Int) maxOverdueDays: number;
  @Field(() => Int) openOrders: number;
  @Field(() => Int) overdueOrders: number;
  @Field(() => MoneyScalar) creditBalance: number;
  @Field(() => MoneyScalar, { nullable: true }) creditLimit?: number | null;
  @Field() overLimit: boolean;
  @Field(() => Int, { nullable: true }) limitUsagePct?: number | null;
  @Field(() => AgingView) aging: AgingView;
}

@ObjectType()
export class CustomerLocationView {
  @Field(() => ID) id: string;
  @Field(() => ID) customerId: string;
  @Field() name: string;
  @Field(() => String) usage: string;
  @Field() address: string;
  @Field(() => String, { nullable: true }) province?: string | null;
  @Field(() => Float, { nullable: true }) lat?: number | null;
  @Field(() => Float, { nullable: true }) lng?: number | null;
  @Field(() => String, { nullable: true }) contactName?: string | null;
  @Field(() => String, { nullable: true }) contactPhone?: string | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field() isDefault: boolean;
  @Field() active: boolean;
  @Field(() => Int) usedInOrders: number;
}

@ObjectType()
export class CustomerView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) type: string;
  @Field() name: string;
  @Field(() => String, { nullable: true }) legalName?: string | null;
  @Field(() => String, { nullable: true }) taxCode?: string | null;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) invoiceEmail?: string | null;
  @Field(() => String, { nullable: true }) billingAddress?: string | null;
  @Field(() => ID, { nullable: true }) groupId?: string | null;
  @Field(() => String, { nullable: true }) groupName?: string | null;
  @Field(() => ContactView, { nullable: true }) primaryContact?: ContactView | null;
  @Field(() => MoneyScalar, { nullable: true }) creditLimit?: number | null;
  @Field(() => Int, { nullable: true }) defaultDebtDays?: number | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) deactivateReason?: string | null;
  @Field() hasPortalAccount: boolean;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => Int) orderCount: number;
  @Field(() => CustomerDebtSummaryView) debtSummary: CustomerDebtSummaryView;
  @Field(() => MoneyScalar) creditBalance: number;
  @Field(() => [String]) warnings: string[];
  @Field(() => [CustomerLocationView], { nullable: true }) locations?: CustomerLocationView[];
}

@ObjectType()
export class CustomerConnection extends ConnectionType(CustomerView, 'CustomerConnection') {}

@InputType()
export class CustomerFilter {
  @Field({ nullable: true }) search?: string;
  @Field(() => String, { nullable: true }) status?: string;
  @Field(() => ID, { nullable: true }) groupId?: string;
  /** OVERDUE | OVER_LIMIT | HAS_DEBT | HAS_CREDIT */
  @Field(() => String, { nullable: true }) debtStatus?: string;
}

@InputType()
export class CustomerInput {
  @Field(() => String) type: string;
  @Field() name: string;
  @Field({ nullable: true }) legalName?: string;
  @Field({ nullable: true }) taxCode?: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) invoiceEmail?: string;
  @Field({ nullable: true }) billingAddress?: string;
  @Field(() => ID, { nullable: true }) groupId?: string;
  @Field(() => ContactInput, { nullable: true }) primaryContact?: ContactInput;
  @Field(() => MoneyScalar, { nullable: true }) creditLimit?: number | null;
  @Field(() => Int, { nullable: true }) defaultDebtDays?: number | null;
  @Field({ nullable: true }) note?: string;
  @Field(() => String, { nullable: true }) status?: string;
}

@InputType()
export class CustomerLocationInput {
  @Field() name: string;
  @Field(() => String) usage: string;
  @Field() address: string;
  @Field({ nullable: true }) province?: string;
  @Field(() => Float, { nullable: true }) lat?: number;
  @Field(() => Float, { nullable: true }) lng?: number;
  @Field({ nullable: true }) contactName?: string;
  @Field({ nullable: true }) contactPhone?: string;
  @Field({ nullable: true }) note?: string;
  @Field({ nullable: true }) isDefault?: boolean;
}

@ObjectType()
export class CreditLimitCheckView {
  @Field() overLimit: boolean;
  @Field(() => MoneyScalar) currentDebt: number;
  @Field(() => MoneyScalar) projectedDebt: number;
  @Field(() => MoneyScalar, { nullable: true }) creditLimit?: number | null;
  @Field(() => Int) overdueOrders: number;
  @Field(() => [String]) warnings: string[];
  @Field(() => GraphQLJSON, { nullable: true }) details?: unknown;
}

@ObjectType()
export class CustomerTotalsView {
  @Field(() => Int) customerCount: number;
  @Field(() => Int) activeCount: number;
  @Field(() => MoneyScalar) receivable: number;
  @Field(() => MoneyScalar) remaining: number;
  @Field(() => MoneyScalar) overdueAmount: number;
  @Field(() => Int) overdueCustomers: number;
  @Field(() => Int) overLimitCustomers: number;
  @Field(() => MoneyScalar) creditBalance: number;
  @Field(() => Int) creditCustomers: number;
}
