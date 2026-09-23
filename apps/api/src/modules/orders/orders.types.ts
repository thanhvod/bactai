import { Field, Float, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ConnectionType } from '../../common/graphql/pagination';
import { MoneyScalar } from '../../common/graphql/scalars';
import { AttachmentView } from '../attachments/attachments.types';
import { TimelineEntry } from '../activity/activity.types';
import { ExternalTransportView, TripIncidentRef, TripView } from '../trips/trips.types';

@ObjectType()
export class OrderCustomerRef {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() name: string;
  @Field(() => String, { nullable: true }) phone?: string | null;
}

@ObjectType()
export class OrderStopView {
  @Field(() => ID) id: string;
  @Field(() => ID) orderId: string;
  @Field(() => String) type: string;
  @Field(() => Int) sequence: number;
  @Field(() => ID, { nullable: true }) locationId?: string | null;
  @Field(() => String, { nullable: true }) locationName?: string | null;
  @Field() address: string;
  @Field(() => String, { nullable: true }) province?: string | null;
  @Field(() => Float, { nullable: true }) lat?: number | null;
  @Field(() => Float, { nullable: true }) lng?: number | null;
  @Field(() => String, { nullable: true }) contactName?: string | null;
  @Field(() => String, { nullable: true }) contactPhone?: string | null;
  @Field(() => Date, { nullable: true }) plannedAt?: Date | null;
  @Field(() => MoneyScalar, { nullable: true }) codExpected?: number | null;
  @Field(() => MoneyScalar, { nullable: true }) codActual?: number | null;
  @Field(() => Date, { nullable: true }) codCollectedAt?: Date | null;
  @Field(() => String, { nullable: true }) codNote?: string | null;
  @Field(() => String) status: string;
  @Field(() => Date, { nullable: true }) arrivedAt?: Date | null;
  @Field(() => Date, { nullable: true }) completedAt?: Date | null;
  @Field(() => String, { nullable: true }) skipReason?: string | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field(() => Int) podCount: number;
  @Field(() => [ID]) tripIds: string[];
  @Field(() => [String]) tripCodes: string[];
  @Field(() => String, { nullable: true }) orderCode?: string | null;
  @Field(() => [TimelineEntry], { nullable: true }) statusHistory?: TimelineEntry[];
  @Field(() => [AttachmentView], { nullable: true }) podAttachments?: AttachmentView[];
}

@ObjectType()
export class CargoLineView {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field(() => ID, { nullable: true }) cargoTypeId?: string | null;
  @Field(() => String, { nullable: true }) cargoTypeName?: string | null;
  @Field(() => Float, { nullable: true }) weightKg?: number | null;
  @Field(() => Float, { nullable: true }) volumeM3?: number | null;
  @Field(() => Float, { nullable: true }) quantity?: number | null;
  @Field(() => ID, { nullable: true }) packagingUnitId?: string | null;
  @Field(() => String, { nullable: true }) packagingUnit?: string | null;
  @Field(() => [String]) properties: string[];
  @Field(() => MoneyScalar, { nullable: true }) declaredValue?: number | null;
  @Field(() => ID, { nullable: true }) pickupStopId?: string | null;
  @Field(() => ID, { nullable: true }) dropoffStopId?: string | null;
  @Field(() => String, { nullable: true }) note?: string | null;
}

@ObjectType()
export class OrderAddonView {
  @Field(() => ID) id: string;
  @Field(() => ID, { nullable: true }) serviceId?: string | null;
  @Field() name: string;
  @Field(() => MoneyScalar) amount: number;
  @Field(() => String, { nullable: true }) note?: string | null;
}

@ObjectType()
export class OrderAllocationView {
  @Field(() => ID) id: string;
  @Field(() => ID) paymentId: string;
  @Field() paymentCode: string;
  @Field() receivedAt: Date;
  @Field(() => MoneyScalar) amount: number;
}

@ObjectType()
export class OrderExpenseView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) kind: string;
  @Field(() => String, { nullable: true }) categoryName?: string | null;
  @Field(() => MoneyScalar) amount: number;
  @Field(() => String) paidBy: string;
  @Field(() => String) paidStatus: string;
  @Field(() => String) status: string;
  @Field() expenseDate: Date;
  @Field(() => String, { nullable: true }) tripCode?: string | null;
  @Field(() => String, { nullable: true }) supplierName?: string | null;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field() isCost: boolean;
}

@ObjectType()
export class OrderFinanceSummary {
  @Field(() => MoneyScalar) freight: number;
  @Field(() => MoneyScalar) addonTotal: number;
  @Field(() => MoneyScalar) totalAmount: number;
  @Field(() => MoneyScalar) receivable: number;
  @Field(() => MoneyScalar) paidAmount: number;
  @Field(() => MoneyScalar) remainingAmount: number;
  @Field(() => Int) overdueDays: number;
  @Field(() => MoneyScalar) expenseTotal: number;
  @Field(() => MoneyScalar) tripCost: number;
  @Field(() => MoneyScalar) outsourcedCost: number;
  @Field(() => MoneyScalar) otherCost: number;
  @Field(() => MoneyScalar) profit: number;
  @Field(() => Float, { nullable: true }) margin?: number | null;
  @Field() provisional: boolean;
  @Field(() => MoneyScalar) driverBonusTotal: number;
  @Field(() => [OrderAllocationView]) allocations: OrderAllocationView[];
  @Field(() => [OrderExpenseView]) expenses: OrderExpenseView[];
}

@ObjectType()
export class OrderView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) status: string;
  @Field(() => OrderCustomerRef) customer: OrderCustomerRef;
  @Field() orderDate: Date;
  @Field(() => String, { nullable: true }) routeSummary?: string | null;
  @Field(() => MoneyScalar) freightAmount: number;
  @Field(() => MoneyScalar) addonTotal: number;
  @Field(() => MoneyScalar) totalAmount: number;
  @Field(() => MoneyScalar) paidAmount: number;
  @Field(() => MoneyScalar) remainingAmount: number;
  @Field(() => Date, { nullable: true }) dueDate?: Date | null;
  @Field(() => Int) overdueDays: number;
  @Field(() => Int) tripCount: number;
  @Field(() => [String]) warnings: string[];
  @Field(() => ID, { nullable: true }) requiredVehicleTypeId?: string | null;
  @Field(() => String, { nullable: true }) requiredVehicleTypeName?: string | null;
  @Field(() => Float, { nullable: true }) requiredCapacityTons?: number | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field(() => String, { nullable: true }) internalNote?: string | null;
  @Field(() => String, { nullable: true }) cancelReason?: string | null;
  @Field(() => ID, { nullable: true }) bookingId?: string | null;
  @Field(() => Date, { nullable: true }) confirmedAt?: Date | null;
  @Field(() => Date, { nullable: true }) startedAt?: Date | null;
  @Field(() => Date, { nullable: true }) completedAt?: Date | null;
  @Field(() => Date, { nullable: true }) cancelledAt?: Date | null;
  @Field() priceLocked: boolean;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  // chi tiết
  @Field(() => [OrderStopView], { nullable: true }) stops?: OrderStopView[];
  @Field(() => [CargoLineView], { nullable: true }) cargoLines?: CargoLineView[];
  @Field(() => [OrderAddonView], { nullable: true }) addons?: OrderAddonView[];
  @Field(() => [TripView], { nullable: true }) trips?: TripView[];
  @Field(() => OrderFinanceSummary, { nullable: true }) financeSummary?: OrderFinanceSummary;
  @Field(() => [TripIncidentRef], { nullable: true }) incidents?: TripIncidentRef[];
  @Field(() => [ExternalTransportView], { nullable: true }) externalTransports?: ExternalTransportView[];
  @Field(() => Int, { nullable: true }) attachmentCount?: number;
  @Field(() => [String], { nullable: true }) customerWarnings?: string[];
}

@ObjectType()
export class OrderConnection extends ConnectionType(OrderView, 'OrderConnection') {}

@ObjectType()
export class OrderPayload {
  @Field(() => OrderView) order: OrderView;
  @Field(() => [String]) warnings: string[];
  @Field(() => TripView, { nullable: true }) trip?: TripView | null;
}

@ObjectType()
export class OrderTotalsView {
  @Field(() => Int) count: number;
  @Field(() => MoneyScalar) totalAmount: number;
  @Field(() => MoneyScalar) paidAmount: number;
  @Field(() => MoneyScalar) remainingAmount: number;
  @Field(() => MoneyScalar) overdueAmount: number;
}

@InputType()
export class OrderFilter {
  @Field({ nullable: true }) search?: string;
  @Field(() => [String], { nullable: true }) status?: string[];
  @Field(() => ID, { nullable: true }) customerId?: string;
  @Field({ nullable: true }) dateFrom?: string;
  @Field({ nullable: true }) dateTo?: string;
  /** OVERDUE | HAS_DEBT | PAID */
  @Field({ nullable: true }) debtStatus?: string;
  @Field({ nullable: true }) needsAction?: boolean;
  @Field({ nullable: true }) warning?: boolean;
}

@InputType()
export class OrderStopInput {
  @Field(() => ID, { nullable: true }) id?: string;
  @Field(() => String) type: string;
  @Field(() => Int, { nullable: true }) sequence?: number;
  @Field(() => ID, { nullable: true }) locationId?: string;
  @Field({ nullable: true }) locationName?: string;
  @Field({ nullable: true }) address?: string;
  @Field({ nullable: true }) province?: string;
  @Field(() => Float, { nullable: true }) lat?: number;
  @Field(() => Float, { nullable: true }) lng?: number;
  @Field({ nullable: true }) contactName?: string;
  @Field({ nullable: true }) contactPhone?: string;
  @Field({ nullable: true }) plannedAt?: Date;
  @Field(() => MoneyScalar, { nullable: true }) codExpected?: number | null;
  @Field({ nullable: true }) note?: string;
}

@InputType()
export class CargoLineInput {
  @Field(() => ID, { nullable: true }) id?: string;
  @Field() name: string;
  @Field(() => ID, { nullable: true }) cargoTypeId?: string;
  @Field(() => Float, { nullable: true }) weightKg?: number;
  @Field(() => Float, { nullable: true }) volumeM3?: number;
  @Field(() => Float, { nullable: true }) quantity?: number;
  @Field(() => ID, { nullable: true }) packagingUnitId?: string;
  @Field({ nullable: true }) packagingUnit?: string;
  @Field(() => [String], { nullable: true }) properties?: string[];
  @Field(() => MoneyScalar, { nullable: true }) declaredValue?: number;
  @Field(() => ID, { nullable: true }) pickupStopId?: string;
  @Field(() => ID, { nullable: true }) dropoffStopId?: string;
  @Field({ nullable: true }) note?: string;
}

@InputType()
export class OrderAddonInput {
  @Field(() => ID, { nullable: true }) id?: string;
  @Field(() => ID, { nullable: true }) serviceId?: string;
  @Field() name: string;
  @Field(() => MoneyScalar) amount: number;
  @Field({ nullable: true }) note?: string;
}

@InputType()
export class QuickTripInput {
  @Field(() => ID, { nullable: true }) vehicleId?: string;
  @Field(() => ID, { nullable: true }) driverId?: string;
  @Field() plannedStartAt: Date;
  @Field(() => Date, { nullable: true }) plannedEndAt?: Date;
  @Field(() => MoneyScalar, { nullable: true }) driverBonusAmount?: number;
  @Field({ nullable: true }) overrideReason?: string;
}

@InputType()
export class CreateOrderInput {
  @Field(() => ID) customerId: string;
  @Field({ nullable: true }) orderDate?: string;
  @Field(() => MoneyScalar) freightAmount: number;
  @Field(() => String, { nullable: true }) dueDate?: string | null;
  @Field(() => String, { nullable: true }) status?: string;
  @Field(() => ID, { nullable: true }) requiredVehicleTypeId?: string;
  @Field(() => Float, { nullable: true }) requiredCapacityTons?: number;
  @Field({ nullable: true }) note?: string;
  @Field({ nullable: true }) internalNote?: string;
  @Field(() => [OrderStopInput]) stops: OrderStopInput[];
  @Field(() => [CargoLineInput], { nullable: true }) cargoLines?: CargoLineInput[];
  @Field(() => [OrderAddonInput], { nullable: true }) addons?: OrderAddonInput[];
  @Field(() => ID, { nullable: true }) bookingId?: string;
  @Field(() => QuickTripInput, { nullable: true }) createTrip?: QuickTripInput;
}

@InputType()
export class UpdateOrderInput {
  @Field(() => ID, { nullable: true }) customerId?: string;
  @Field({ nullable: true }) orderDate?: string;
  @Field(() => MoneyScalar, { nullable: true }) freightAmount?: number;
  @Field(() => String, { nullable: true }) dueDate?: string | null;
  @Field(() => ID, { nullable: true }) requiredVehicleTypeId?: string;
  @Field(() => Float, { nullable: true }) requiredCapacityTons?: number;
  @Field({ nullable: true }) note?: string;
  @Field({ nullable: true }) internalNote?: string;
  @Field(() => [OrderStopInput], { nullable: true }) stops?: OrderStopInput[];
  @Field(() => [CargoLineInput], { nullable: true }) cargoLines?: CargoLineInput[];
  @Field(() => [OrderAddonInput], { nullable: true }) addons?: OrderAddonInput[];
}

@InputType()
export class OrderPricingInput {
  @Field(() => MoneyScalar) freightAmount: number;
  @Field(() => [OrderAddonInput], { nullable: true }) addons?: OrderAddonInput[];
  @Field(() => String, { nullable: true }) dueDate?: string | null;
  @Field({ nullable: true }) reason?: string;
}

@ObjectType()
export class GlobalSearchResult {
  @Field() type: string;
  @Field(() => ID) id: string;
  @Field(() => String, { nullable: true }) code?: string | null;
  @Field() title: string;
  @Field(() => String, { nullable: true }) subtitle?: string | null;
  @Field(() => String, { nullable: true }) status?: string | null;
}
