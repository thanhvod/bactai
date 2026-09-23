import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ConnectionType } from '../../common/graphql/pagination';
import { MoneyScalar } from '../../common/graphql/scalars';

@ObjectType()
export class PayrollTotalsView {
  @Field(() => MoneyScalar) salary: number;
  @Field(() => MoneyScalar) bonus: number;
  @Field(() => MoneyScalar) advance: number;
  @Field(() => MoneyScalar) deduction: number;
  @Field(() => MoneyScalar) adjustment: number;
  @Field(() => MoneyScalar) net: number;
  @Field(() => Int) driverCount: number;
}

@ObjectType()
export class PayrollItemView {
  @Field(() => ID, { nullable: true }) id?: string | null;
  @Field(() => String) type: string;
  @Field() description: string;
  @Field(() => MoneyScalar) amount: number;
  @Field(() => String, { nullable: true }) sourceRef?: string | null;
  @Field(() => ID, { nullable: true }) tripId?: string | null;
  @Field(() => ID, { nullable: true }) expenseId?: string | null;
  @Field(() => ID, { nullable: true }) reasonId?: string | null;
  @Field(() => String, { nullable: true }) reasonName?: string | null;
  @Field(() => Date, { nullable: true }) itemDate?: Date | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field(() => String, { nullable: true }) createdByName?: string | null;
}

@ObjectType()
export class PayrollExcludedView {
  @Field() code: string;
  @Field() kind: string;
  @Field() description: string;
  @Field(() => MoneyScalar) amount: number;
  @Field(() => Date, { nullable: true }) date?: Date | null;
  @Field() reason: string;
}

@ObjectType()
export class PayrollLineView {
  @Field(() => ID, { nullable: true }) id?: string | null;
  @Field(() => ID) payrollId: string;
  @Field(() => ID) driverId: string;
  @Field() driverName: string;
  @Field(() => String, { nullable: true }) driverCode?: string | null;
  @Field(() => MoneyScalar) baseSalary: number;
  @Field(() => Date, { nullable: true }) salaryEffectiveFrom?: Date | null;
  @Field(() => MoneyScalar) bonusTotal: number;
  @Field(() => MoneyScalar) advanceTotal: number;
  @Field(() => MoneyScalar) deductionTotal: number;
  @Field(() => MoneyScalar) adjustmentTotal: number;
  @Field(() => MoneyScalar) netAmount: number;
  @Field(() => [String]) anomalies: string[];
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field(() => [PayrollItemView]) items: PayrollItemView[];
  @Field(() => [PayrollExcludedView], { nullable: true }) excluded?: PayrollExcludedView[];
  @Field(() => String, { nullable: true }) payrollCode?: string | null;
  @Field(() => String, { nullable: true }) payrollStatus?: string | null;
  @Field(() => String, { nullable: true }) periodLabel?: string | null;
}

@ObjectType()
export class PayrollChangeView {
  @Field() kind: string; // SALARY_CHANGED | DEDUCTION | NEW_DRIVER | REMOVED_DRIVER | ANOMALY
  @Field() message: string;
  @Field(() => String, { nullable: true }) driverName?: string | null;
  @Field(() => MoneyScalar, { nullable: true }) amount?: number | null;
}

@ObjectType()
export class PayrollView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() periodFrom: Date;
  @Field() periodTo: Date;
  @Field() periodLabel: string;
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field(() => PayrollTotalsView) totals: PayrollTotalsView;
  @Field(() => String, { nullable: true }) createdByName?: string | null;
  @Field() createdAt: Date;
  @Field(() => Date, { nullable: true }) submittedAt?: Date | null;
  @Field(() => String, { nullable: true }) submittedByName?: string | null;
  @Field(() => Date, { nullable: true }) approvedAt?: Date | null;
  @Field(() => String, { nullable: true }) approvedByName?: string | null;
  @Field(() => String, { nullable: true }) approvalNote?: string | null;
  @Field(() => Date, { nullable: true }) returnedAt?: Date | null;
  @Field(() => String, { nullable: true }) returnReason?: string | null;
  @Field(() => Date, { nullable: true }) paidAt?: Date | null;
  @Field(() => String, { nullable: true }) paidByName?: string | null;
  @Field(() => Date, { nullable: true }) cancelledAt?: Date | null;
  @Field(() => String, { nullable: true }) cancelReason?: string | null;
  @Field(() => Int) anomalyCount: number;
  @Field(() => [PayrollLineView], { nullable: true }) lines?: PayrollLineView[];
  @Field(() => PayrollTotalsView, { nullable: true }) previousTotals?: PayrollTotalsView | null;
  @Field(() => String, { nullable: true }) previousCode?: string | null;
  @Field(() => [PayrollChangeView], { nullable: true }) changes?: PayrollChangeView[];
}

@ObjectType()
export class PayrollConnection extends ConnectionType(PayrollView, 'PayrollConnection') {}

@InputType()
export class PayrollFilter {
  @Field(() => [String], { nullable: true }) status?: string[];
  @Field(() => Int, { nullable: true }) year?: number;
  @Field(() => ID, { nullable: true }) driverId?: string;
}

@InputType()
export class GeneratePayrollInput {
  @Field(() => Int) year: number;
  @Field(() => Int) month: number;
  @Field(() => [ID], { nullable: true }) driverIds?: string[];
  @Field({ nullable: true }) note?: string;
}

@ObjectType()
export class PayrollPreviewView {
  @Field() periodFrom: string;
  @Field() periodTo: string;
  @Field() periodLabel: string;
  @Field(() => [PayrollLineView]) lines: PayrollLineView[];
  @Field(() => PayrollTotalsView) totals: PayrollTotalsView;
  @Field(() => [String]) warnings: string[];
  @Field(() => String, { nullable: true }) conflictPayrollCode?: string | null;
}

@InputType()
export class PayrollItemInput {
  @Field(() => ID) lineId: string;
  /** DEDUCTION (mặc định) | ADJUSTMENT | BONUS */
  @Field(() => String, { nullable: true }) type?: string;
  @Field(() => ID, { nullable: true }) reasonId?: string;
  @Field(() => MoneyScalar) amount: number;
  @Field() description: string;
  @Field({ nullable: true }) note?: string;
  @Field({ nullable: true }) reason?: string;
}
