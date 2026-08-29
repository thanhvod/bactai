import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ExpensePaymentStatus, PaidBy, PaymentInKind } from '@prisma/client';

registerEnumType(PaidBy, { name: 'PaidBy' });
registerEnumType(ExpensePaymentStatus, { name: 'ExpensePaymentStatus' });
registerEnumType(PaymentInKind, { name: 'PaymentInKind' });

@ObjectType()
export class ExpenseType {
  @Field(() => ID) id!: string;
  @Field() categoryId!: string;
  @Field() categoryName!: string;
  @Field(() => BigInt) amount!: bigint;
  @Field() expenseDate!: Date;
  @Field(() => ExpensePaymentStatus) paymentStatus!: ExpensePaymentStatus;
  @Field(() => PaidBy) paidBy!: PaidBy;
  @Field() reimbursable!: boolean;
  @Field() isDriverAdvance!: boolean;
  @Field(() => String, { nullable: true }) supplierId?: string | null;
  @Field(() => String, { nullable: true }) supplierName?: string | null;
  @Field(() => String, { nullable: true }) orderId?: string | null;
  @Field(() => String, { nullable: true }) orderCode?: string | null;
  @Field(() => String, { nullable: true }) tripId?: string | null;
  @Field(() => String, { nullable: true }) vehicleId?: string | null;
  @Field(() => String, { nullable: true }) vehiclePlate?: string | null;
  @Field(() => String, { nullable: true }) driverId?: string | null;
  @Field(() => String, { nullable: true }) driverName?: string | null;
  @Field(() => String, { nullable: true }) notes?: string | null;
}

@InputType()
export class ExpenseInput {
  @Field(() => ID) categoryId!: string;
  @Field(() => BigInt) amount!: bigint;
  @Field(() => Date) expenseDate!: Date;
  @Field(() => PaidBy, { nullable: true }) paidBy?: PaidBy;
  @Field({ nullable: true }) reimbursable?: boolean;
  @Field({ nullable: true }) isDriverAdvance?: boolean;
  @Field(() => ID, { nullable: true }) supplierId?: string;
  @Field(() => ID, { nullable: true }) orderId?: string;
  @Field(() => ID, { nullable: true }) tripId?: string;
  @Field(() => ID, { nullable: true }) vehicleId?: string;
  @Field(() => ID, { nullable: true }) driverId?: string;
  @Field({ nullable: true }) notes?: string;
  @Field({ nullable: true }) markPaid?: boolean;
}

@ObjectType()
export class PaymentInType {
  @Field(() => ID) id!: string;
  @Field(() => PaymentInKind) kind!: PaymentInKind;
  @Field(() => String, { nullable: true }) customerId?: string | null;
  @Field(() => String, { nullable: true }) customerName?: string | null;
  @Field(() => String, { nullable: true }) driverId?: string | null;
  @Field(() => String, { nullable: true }) driverName?: string | null;
  @Field(() => BigInt) amount!: bigint;
  @Field(() => BigInt) allocatedAmount!: bigint;
  @Field() receivedDate!: Date;
  @Field(() => String, { nullable: true }) method?: string | null;
  @Field(() => String, { nullable: true }) notes?: string | null;
}

@InputType()
export class AllocationInput {
  @Field(() => ID) orderId!: string;
  @Field(() => BigInt) amount!: bigint;
}

@InputType()
export class PaymentInInput {
  @Field(() => PaymentInKind) kind!: PaymentInKind;
  @Field(() => ID, { nullable: true }) customerId?: string;
  @Field(() => ID, { nullable: true }) driverId?: string;
  @Field(() => BigInt) amount!: bigint;
  @Field(() => Date) receivedDate!: Date;
  @Field({ nullable: true }) method?: string;
  @Field({ nullable: true }) notes?: string;
  @Field(() => [AllocationInput], { nullable: true }) allocations?: AllocationInput[];
}

/** Dòng công nợ khách theo đơn — cho màn hình công nợ + bảng kê PDF (docs/03 mục 1.3) */
@ObjectType()
export class ReceivableRow {
  @Field(() => ID) orderId!: string;
  @Field() orderCode!: string;
  @Field() orderDate!: Date;
  @Field() customerId!: string;
  @Field() customerName!: string;
  @Field() route!: string; // điểm đi → điểm đến
  @Field(() => BigInt) totalAmount!: bigint;
  @Field(() => BigInt) paidAmount!: bigint;
  @Field(() => BigInt) remaining!: bigint;
  @Field(() => Date, { nullable: true }) dueDate?: Date | null;
  @Field(() => Int) overdueDays!: number;
}
