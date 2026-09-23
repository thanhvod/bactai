import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ConnectionType } from '../../common/graphql/pagination';
import { MoneyScalar } from '../../common/graphql/scalars';

@ObjectType()
export class DebtStatementLineView {
  @Field(() => ID) id: string;
  @Field(() => ID) orderId: string;
  @Field(() => Int) sequence: number;
  @Field() orderDate: Date;
  @Field() orderCode: string;
  @Field(() => String, { nullable: true }) route?: string | null;
  @Field(() => MoneyScalar) totalAmount: number;
  @Field(() => MoneyScalar) paidAmount: number;
  @Field(() => MoneyScalar) remainingAmount: number;
  @Field(() => Date, { nullable: true }) dueDate?: Date | null;
  @Field(() => Int) overdueDays: number;
}

@ObjectType()
export class DebtStatementDiffView {
  @Field(() => ID) orderId: string;
  @Field() orderCode: string;
  @Field(() => MoneyScalar) snapshotRemaining: number;
  @Field(() => MoneyScalar) currentRemaining: number;
  @Field(() => MoneyScalar) snapshotPaid: number;
  @Field(() => MoneyScalar) currentPaid: number;
  @Field() message: string;
}

@ObjectType()
export class DebtStatementCustomerRef {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() name: string;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => String, { nullable: true }) invoiceEmail?: string | null;
  @Field() hasPortalAccount: boolean;
}

@ObjectType()
export class DebtStatementView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => DebtStatementCustomerRef) customer: DebtStatementCustomerRef;
  @Field() periodFrom: Date;
  @Field() periodTo: Date;
  @Field(() => String) scope: string;
  @Field(() => String) status: string;
  @Field(() => Int) lineCount: number;
  @Field(() => MoneyScalar) totalAmount: number;
  @Field(() => MoneyScalar) paidAmount: number;
  @Field(() => MoneyScalar) remainingAmount: number;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field() sharedWithCustomer: boolean;
  @Field(() => Date, { nullable: true }) finalizedAt?: Date | null;
  @Field(() => String, { nullable: true }) finalizedByName?: string | null;
  @Field(() => Date, { nullable: true }) sentAt?: Date | null;
  @Field(() => Date, { nullable: true }) cancelledAt?: Date | null;
  @Field(() => String, { nullable: true }) cancelReason?: string | null;
  @Field(() => String, { nullable: true }) createdByName?: string | null;
  @Field() createdAt: Date;
  @Field(() => ID, { nullable: true }) pdfAttachmentId?: string | null;
  @Field(() => String, { nullable: true }) pdfUrl?: string | null;
  @Field(() => [DebtStatementLineView], { nullable: true }) lines?: DebtStatementLineView[];
  @Field(() => [DebtStatementDiffView], { nullable: true }) diffVsCurrent?: DebtStatementDiffView[];
}

@ObjectType()
export class DebtStatementConnection extends ConnectionType(DebtStatementView, 'DebtStatementConnection') {}

@InputType()
export class DebtStatementFilter {
  @Field(() => ID, { nullable: true }) customerId?: string;
  @Field(() => [String], { nullable: true }) status?: string[];
}

@InputType()
export class CreateDebtStatementInput {
  @Field(() => ID) customerId: string;
  @Field() periodFrom: string;
  @Field() periodTo: string;
  /** UNPAID_ONLY (mặc định) | ALL_IN_PERIOD */
  @Field(() => String, { nullable: true }) scope?: string;
  @Field({ nullable: true }) note?: string;
}
