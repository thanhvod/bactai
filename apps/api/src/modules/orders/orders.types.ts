import { Field, Float, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { OrderStatus, StopStatus, StopType, TripStatus } from '@prisma/client';

registerEnumType(OrderStatus, { name: 'OrderStatus' });
registerEnumType(TripStatus, { name: 'TripStatus' });
registerEnumType(StopType, { name: 'StopType' });
registerEnumType(StopStatus, { name: 'StopStatus' });

@ObjectType()
export class OrderStopType {
  @Field(() => ID) id!: string;
  @Field(() => StopType) type!: StopType;
  @Field(() => Int) sequence!: number;
  @Field() address!: string;
  @Field(() => String, { nullable: true }) contactName?: string | null;
  @Field(() => String, { nullable: true }) contactPhone?: string | null;
  @Field(() => StopStatus) status!: StopStatus;
  @Field(() => BigInt) codExpected!: bigint;
  @Field(() => BigInt, { nullable: true }) codCollected?: bigint | null;
  @Field(() => String, { nullable: true }) notes?: string | null;
}

@ObjectType()
export class CargoLineType {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field(() => String, { nullable: true }) cargoTypeId?: string | null;
  @Field(() => Float, { nullable: true }) weightKg?: number | null;
  @Field(() => Float, { nullable: true }) volumeM3?: number | null;
  @Field(() => Float, { nullable: true }) quantity?: number | null;
  @Field(() => String, { nullable: true }) unit?: string | null;
  @Field(() => [String]) properties!: string[];
  @Field(() => String, { nullable: true }) notes?: string | null;
}

@ObjectType()
export class OrderAddonType {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field(() => BigInt) amount!: bigint;
}

@ObjectType()
export class TripType {
  @Field(() => ID) id!: string;
  @Field() orderId!: string;
  @Field(() => String, { nullable: true }) orderCode?: string;
  @Field() vehicleId!: string;
  @Field(() => String, { nullable: true }) vehiclePlate?: string;
  @Field() driverId!: string;
  @Field(() => String, { nullable: true }) driverName?: string;
  @Field(() => TripStatus) status!: TripStatus;
  @Field(() => Date, { nullable: true }) plannedStartAt?: Date | null;
  @Field(() => Date, { nullable: true }) plannedEndAt?: Date | null;
  @Field(() => String, { nullable: true }) pauseReasonId?: string | null;
  @Field(() => String, { nullable: true }) pauseReasonName?: string | null;
  @Field(() => String, { nullable: true }) pauseNote?: string | null;
  @Field(() => BigInt) driverBonus!: bigint;
  @Field(() => String, { nullable: true }) notes?: string | null;
}

@ObjectType()
export class StatusHistoryType {
  @Field(() => ID) id!: string;
  @Field() entityType!: string;
  @Field() entityId!: string;
  @Field(() => String, { nullable: true }) fromStatus?: string | null;
  @Field() toStatus!: string;
  @Field(() => String, { nullable: true }) reason?: string | null;
  @Field(() => String, { nullable: true }) byUserName?: string | null;
  @Field() createdAt!: Date;
}

@ObjectType()
export class OrderExpenseType {
  @Field(() => ID) id!: string;
  @Field() categoryName!: string;
  @Field(() => BigInt) amount!: bigint;
  @Field(() => String, { nullable: true }) tripId?: string | null;
  @Field() paidByDriver!: boolean;
  @Field() paymentStatus!: string;
}

@ObjectType()
export class OrderAllocationType {
  @Field(() => ID) id!: string;
  @Field(() => BigInt) amount!: bigint;
  @Field() receivedDate!: Date;
  @Field(() => String, { nullable: true }) method?: string | null;
}

@ObjectType()
export class OrderType {
  @Field(() => ID) id!: string;
  @Field() code!: string;
  @Field() customerId!: string;
  @Field() customerName!: string;
  @Field(() => OrderStatus) status!: OrderStatus;
  @Field(() => BigInt) price!: bigint;
  @Field(() => Date, { nullable: true }) dueDate?: Date | null;
  @Field(() => String, { nullable: true }) notes?: string | null;
  @Field() createdAt!: Date;
  // Suy ra
  @Field(() => BigInt) totalAmount!: bigint; // price + Σ addon
  @Field(() => BigInt) paidAmount!: bigint; // Σ allocation
  @Field(() => Int) overdueDays!: number; // 0 nếu chưa quá hạn / đã thu đủ
  @Field(() => Int) tripCount!: number;
  @Field(() => [OrderStopType]) stops!: OrderStopType[];
  @Field(() => [CargoLineType]) cargoLines!: CargoLineType[];
  @Field(() => [OrderAddonType]) addons!: OrderAddonType[];
  @Field(() => [TripType]) trips!: TripType[];
  @Field(() => [OrderExpenseType]) expenses!: OrderExpenseType[];
  @Field(() => [OrderAllocationType]) allocations!: OrderAllocationType[];
  @Field(() => [StatusHistoryType]) history!: StatusHistoryType[];
  @Field(() => BigInt) profit!: bigint; // (price+addon) − Σ expense gắn đơn & chuyến (docs/02 mục 7.3)
}

// ===== Inputs =====

@InputType()
export class StopInput {
  @Field(() => StopType) type!: StopType;
  @Field() address!: string;
  @Field({ nullable: true }) contactName?: string;
  @Field({ nullable: true }) contactPhone?: string;
  @Field(() => BigInt, { nullable: true }) codExpected?: bigint;
  @Field({ nullable: true }) notes?: string;
}

@InputType()
export class CargoLineInput {
  @Field() name!: string;
  @Field(() => ID, { nullable: true }) cargoTypeId?: string;
  @Field(() => Float, { nullable: true }) weightKg?: number;
  @Field(() => Float, { nullable: true }) volumeM3?: number;
  @Field(() => Float, { nullable: true }) quantity?: number;
  @Field({ nullable: true }) unit?: string;
  @Field(() => [String], { nullable: true }) properties?: string[];
  @Field({ nullable: true }) notes?: string;
}

@InputType()
export class AddonInput {
  @Field(() => ID, { nullable: true }) catalogItemId?: string;
  @Field() name!: string;
  @Field(() => BigInt) amount!: bigint;
}

@InputType()
export class CreateOrderInput {
  @Field(() => ID) customerId!: string;
  @Field(() => BigInt) price!: bigint;
  @Field(() => Date, { nullable: true }) dueDate?: Date;
  @Field({ nullable: true }) notes?: string;
  @Field(() => [StopInput]) stops!: StopInput[];
  @Field(() => [CargoLineInput], { nullable: true }) cargoLines?: CargoLineInput[];
  @Field(() => [AddonInput], { nullable: true }) addons?: AddonInput[];
}
