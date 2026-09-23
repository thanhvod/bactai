import { Field, ID, ObjectType } from '@nestjs/graphql';
import { MoneyScalar } from '../../common/graphql/scalars';

/** Tham chiếu gọn dùng chung cho drivers/vehicles/suppliers (tên GraphQL có tiền tố Master để không trùng module khác). */
@ObjectType()
export class MasterRef {
  @Field(() => ID) id: string;
  @Field() name: string;
}

@ObjectType()
export class MasterTripItem {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) status: string;
  @Field(() => ID) orderId: string;
  @Field(() => String, { nullable: true }) orderCode?: string | null;
  @Field(() => String, { nullable: true }) routeSummary?: string | null;
  @Field(() => String, { nullable: true }) vehiclePlate?: string | null;
  @Field(() => String, { nullable: true }) driverName?: string | null;
  @Field() plannedStartAt: Date;
  @Field(() => Date, { nullable: true }) plannedEndAt?: Date | null;
  @Field(() => Date, { nullable: true }) actualStartAt?: Date | null;
  @Field(() => Date, { nullable: true }) actualEndAt?: Date | null;
  @Field(() => MoneyScalar) driverBonusAmount: number;
}

@ObjectType()
export class MasterExpenseItem {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) kind: string;
  @Field(() => String, { nullable: true }) categoryName?: string | null;
  @Field(() => MoneyScalar) amount: number;
  @Field() expenseDate: Date;
  @Field(() => String) paidBy: string;
  @Field(() => String) paidStatus: string;
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => String, { nullable: true }) orderCode?: string | null;
  @Field(() => String, { nullable: true }) tripCode?: string | null;
  @Field(() => String, { nullable: true }) supplierName?: string | null;
  @Field(() => String, { nullable: true }) vehiclePlate?: string | null;
}
