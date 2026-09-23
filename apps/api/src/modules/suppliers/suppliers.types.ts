import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ConnectionType } from '../../common/graphql/pagination';
import { MoneyScalar } from '../../common/graphql/scalars';
import { ContactInput, ContactView } from '../customers/customers.types';
import { MasterExpenseItem, MasterRef } from '../drivers/master-brief.types';

@ObjectType()
export class SupplierAgingView {
  @Field(() => MoneyScalar) d0_15: number;
  @Field(() => MoneyScalar) d16_30: number;
  @Field(() => MoneyScalar) d31_60: number;
  @Field(() => MoneyScalar) d60p: number;
}

@ObjectType()
export class SupplierPayableView {
  @Field(() => MoneyScalar) total: number;
  @Field(() => Int) unpaidCount: number;
  @Field(() => Int) oldestDays: number;
  @Field(() => SupplierAgingView) aging: SupplierAgingView;
}

@ObjectType()
export class SupplierExternalTransportView {
  @Field(() => ID) id: string;
  @Field(() => ID) orderId: string;
  @Field(() => String, { nullable: true }) orderCode?: string | null;
  @Field(() => ID, { nullable: true }) tripId?: string | null;
  @Field(() => String, { nullable: true }) tripCode?: string | null;
  @Field(() => String, { nullable: true }) vehiclePlate?: string | null;
  @Field(() => String, { nullable: true }) driverName?: string | null;
  @Field(() => String, { nullable: true }) driverPhone?: string | null;
  @Field(() => MoneyScalar, { nullable: true }) agreedAmount?: number | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field() createdAt: Date;
}

@ObjectType()
export class SupplierView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() name: string;
  @Field(() => ID, { nullable: true }) typeId?: string | null;
  @Field(() => MasterRef, { nullable: true }) type?: MasterRef | null;
  @Field(() => String, { nullable: true }) taxCode?: string | null;
  @Field(() => String, { nullable: true }) address?: string | null;
  @Field(() => String, { nullable: true }) bankName?: string | null;
  @Field(() => String, { nullable: true }) bankAccountNo?: string | null;
  @Field(() => String, { nullable: true }) paymentTerms?: string | null;
  @Field(() => [ContactView]) contacts: ContactView[];
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) deactivateReason?: string | null;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => Int) expenseCount: number;
  @Field(() => MoneyScalar) payableAmount: number;
  @Field(() => SupplierPayableView, { nullable: true }) payable?: SupplierPayableView;
  @Field(() => [MasterExpenseItem], { nullable: true }) recentExpenses?: MasterExpenseItem[];
  @Field(() => [SupplierExternalTransportView], { nullable: true }) externalTransports?: SupplierExternalTransportView[];
}

@ObjectType()
export class SupplierConnection extends ConnectionType(SupplierView, 'SupplierConnection') {}

@InputType()
export class SupplierFilter {
  @Field({ nullable: true }) search?: string;
  @Field(() => ID, { nullable: true }) typeId?: string;
  @Field(() => String, { nullable: true }) status?: string;
  @Field({ nullable: true }) hasDebt?: boolean;
}

@InputType()
export class SupplierInput {
  @Field() name: string;
  @Field(() => ID, { nullable: true }) typeId?: string;
  @Field({ nullable: true }) taxCode?: string;
  @Field({ nullable: true }) address?: string;
  @Field({ nullable: true }) bankName?: string;
  @Field({ nullable: true }) bankAccountNo?: string;
  @Field({ nullable: true }) paymentTerms?: string;
  @Field(() => [ContactInput], { nullable: true }) contacts?: ContactInput[];
  @Field({ nullable: true }) note?: string;
  @Field(() => String, { nullable: true }) status?: string;
}

@ObjectType()
export class SupplierOption {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() name: string;
  @Field(() => String, { nullable: true }) typeName?: string | null;
  @Field(() => String) status: string;
}
