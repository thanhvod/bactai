import { Field, Float, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ScheduleWarningView } from '../../common/graphql/common.types';
import { ConnectionType } from '../../common/graphql/pagination';
import { MoneyScalar } from '../../common/graphql/scalars';

@ObjectType()
export class VehicleRef {
  @Field(() => ID) id: string;
  @Field() plate: string;
  @Field(() => String, { nullable: true }) code?: string | null;
  @Field(() => String, { nullable: true }) typeName?: string | null;
  @Field(() => Float, { nullable: true }) capacityTons?: number | null;
  @Field(() => String) status: string;
}

@ObjectType()
export class DriverRef {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field() phone: string;
  @Field(() => String, { nullable: true }) code?: string | null;
  @Field(() => String) status: string;
}

@ObjectType()
export class TripOrderRef {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) status: string;
  @Field(() => ID) customerId: string;
  @Field() customerName: string;
  @Field(() => String, { nullable: true }) customerPhone?: string | null;
}

@ObjectType()
export class TripStopView {
  @Field(() => ID) id: string;
  @Field(() => ID) orderId: string;
  @Field(() => String) type: string;
  @Field(() => Int) sequence: number;
  @Field(() => Int) tripSequence: number;
  @Field(() => String, { nullable: true }) locationName?: string | null;
  @Field() address: string;
  @Field(() => Float, { nullable: true }) lat?: number | null;
  @Field(() => Float, { nullable: true }) lng?: number | null;
  @Field(() => String, { nullable: true }) contactName?: string | null;
  @Field(() => String, { nullable: true }) contactPhone?: string | null;
  @Field(() => Date, { nullable: true }) plannedAt?: Date | null;
  @Field(() => MoneyScalar, { nullable: true }) codExpected?: number | null;
  @Field(() => MoneyScalar, { nullable: true }) codActual?: number | null;
  @Field(() => Date, { nullable: true }) codCollectedAt?: Date | null;
  @Field(() => String) status: string;
  @Field(() => Date, { nullable: true }) arrivedAt?: Date | null;
  @Field(() => Date, { nullable: true }) completedAt?: Date | null;
  @Field(() => String, { nullable: true }) skipReason?: string | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field(() => Int) podCount: number;
}

@ObjectType()
export class TripExpenseView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) kind: string;
  @Field(() => String, { nullable: true }) categoryName?: string | null;
  @Field(() => MoneyScalar) amount: number;
  @Field(() => String) paidBy: string;
  @Field() reimbursable: boolean;
  @Field(() => String) paidStatus: string;
  @Field(() => String) status: string;
  @Field() expenseDate: Date;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => String, { nullable: true }) tripCode?: string | null;
}

@ObjectType()
export class LastLocationView {
  @Field(() => Float) lat: number;
  @Field(() => Float) lng: number;
  @Field() capturedAt: Date;
  @Field(() => Float, { nullable: true }) speed?: number | null;
  @Field() isStale: boolean;
}

@ObjectType()
export class ExternalTransportView {
  @Field(() => ID) id: string;
  @Field(() => ID) orderId: string;
  @Field(() => String, { nullable: true }) orderCode?: string | null;
  @Field(() => ID, { nullable: true }) tripId?: string | null;
  @Field(() => String, { nullable: true }) tripCode?: string | null;
  @Field(() => ID, { nullable: true }) supplierId?: string | null;
  @Field(() => String, { nullable: true }) supplierName?: string | null;
  @Field(() => String, { nullable: true }) vehiclePlate?: string | null;
  @Field(() => String, { nullable: true }) driverName?: string | null;
  @Field(() => String, { nullable: true }) driverPhone?: string | null;
  @Field(() => MoneyScalar, { nullable: true }) agreedAmount?: number | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field() createdAt: Date;
}

@ObjectType()
export class TripIncidentRef {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() title: string;
  @Field(() => String) severity: string;
  @Field(() => String) status: string;
  @Field() createdAt: Date;
}

@ObjectType()
export class TripView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) status: string;
  @Field(() => ID) orderId: string;
  @Field(() => TripOrderRef) order: TripOrderRef;
  @Field(() => VehicleRef, { nullable: true }) vehicle?: VehicleRef | null;
  @Field(() => DriverRef, { nullable: true }) driver?: DriverRef | null;
  @Field() isExternal: boolean;
  @Field() plannedStartAt: Date;
  @Field(() => Date, { nullable: true }) plannedEndAt?: Date | null;
  @Field(() => Date, { nullable: true }) actualStartAt?: Date | null;
  @Field(() => Date, { nullable: true }) actualEndAt?: Date | null;
  @Field(() => MoneyScalar) driverBonusAmount: number;
  @Field(() => String, { nullable: true }) routeSummary?: string | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field(() => String, { nullable: true }) cancelReason?: string | null;
  @Field(() => ID, { nullable: true }) pausedReasonId?: string | null;
  @Field(() => String, { nullable: true }) pauseReasonLabel?: string | null;
  @Field(() => String, { nullable: true }) pauseNote?: string | null;
  @Field(() => String, { nullable: true }) previousStatusBeforePause?: string | null;
  @Field(() => Date, { nullable: true }) pausedAt?: Date | null;
  @Field(() => Date, { nullable: true }) resumedAt?: Date | null;
  @Field(() => LastLocationView, { nullable: true }) lastLocation?: LastLocationView | null;
  @Field(() => Int) stopCount: number;
  @Field(() => MoneyScalar) codExpectedTotal: number;
  @Field(() => MoneyScalar) codActualTotal: number;
  @Field() hasWarning: boolean;
  @Field(() => Int) openIncidentCount: number;
  @Field(() => [String]) allowedNextStatuses: string[];
  @Field() createdAt: Date;
  // chi tiết (chỉ có khi query trip(id))
  @Field(() => [TripStopView], { nullable: true }) stops?: TripStopView[];
  @Field(() => [TripExpenseView], { nullable: true }) expenses?: TripExpenseView[];
  @Field(() => [TripExpenseView], { nullable: true }) advances?: TripExpenseView[];
  @Field(() => [TripIncidentRef], { nullable: true }) incidents?: TripIncidentRef[];
  @Field(() => [ScheduleWarningView], { nullable: true }) warnings?: ScheduleWarningView[];
  @Field(() => ExternalTransportView, { nullable: true }) externalTransport?: ExternalTransportView | null;
  @Field(() => Int, { nullable: true }) attachmentCount?: number;
}

@ObjectType()
export class TripConnection extends ConnectionType(TripView, 'TripConnection') {}

@ObjectType()
export class TripPayload {
  @Field(() => TripView) trip: TripView;
  @Field(() => [ScheduleWarningView]) warnings: ScheduleWarningView[];
  @Field(() => [String]) notices: string[];
}

@InputType()
export class TripFilter {
  @Field({ nullable: true }) dateFrom?: string;
  @Field({ nullable: true }) dateTo?: string;
  @Field(() => [String], { nullable: true }) status?: string[];
  @Field(() => ID, { nullable: true }) driverId?: string;
  @Field(() => ID, { nullable: true }) vehicleId?: string;
  @Field(() => ID, { nullable: true }) orderId?: string;
  @Field({ nullable: true }) hasWarning?: boolean;
  @Field({ nullable: true }) running?: boolean;
  @Field({ nullable: true }) search?: string;
}

@InputType()
export class ExternalTransportInput {
  @Field(() => ID, { nullable: true }) supplierId?: string;
  @Field({ nullable: true }) vehiclePlate?: string;
  @Field({ nullable: true }) driverName?: string;
  @Field({ nullable: true }) driverPhone?: string;
  @Field(() => MoneyScalar, { nullable: true }) agreedAmount?: number;
  @Field({ nullable: true }) note?: string;
}

@InputType()
export class TripInput {
  @Field(() => ID) orderId: string;
  @Field(() => ID, { nullable: true }) vehicleId?: string | null;
  @Field(() => ID, { nullable: true }) driverId?: string | null;
  @Field(() => [ID], { nullable: true }) stopIds?: string[];
  @Field() plannedStartAt: Date;
  @Field(() => Date, { nullable: true }) plannedEndAt?: Date | null;
  @Field(() => MoneyScalar, { nullable: true }) driverBonusAmount?: number | null;
  @Field({ nullable: true }) note?: string;
  @Field({ nullable: true }) isExternal?: boolean;
  @Field(() => ExternalTransportInput, { nullable: true }) externalTransport?: ExternalTransportInput | null;
  @Field({ nullable: true }) overrideReason?: string;
}

@InputType()
export class UpdateTripInput {
  @Field(() => ID, { nullable: true }) vehicleId?: string | null;
  @Field(() => ID, { nullable: true }) driverId?: string | null;
  @Field(() => [ID], { nullable: true }) stopIds?: string[];
  @Field({ nullable: true }) plannedStartAt?: Date;
  @Field(() => Date, { nullable: true }) plannedEndAt?: Date | null;
  @Field(() => MoneyScalar, { nullable: true }) driverBonusAmount?: number | null;
  @Field({ nullable: true }) note?: string;
  @Field({ nullable: true }) isExternal?: boolean;
  @Field(() => ExternalTransportInput, { nullable: true }) externalTransport?: ExternalTransportInput | null;
  @Field({ nullable: true }) overrideReason?: string;
}

@InputType()
export class CheckTripOverlapInput {
  @Field(() => ID, { nullable: true }) tripId?: string;
  @Field(() => ID, { nullable: true }) vehicleId?: string;
  @Field(() => ID, { nullable: true }) driverId?: string;
  @Field() plannedStartAt: Date;
  @Field(() => Date, { nullable: true }) plannedEndAt?: Date | null;
}

@ObjectType()
export class OrderStopStatusView {
  @Field(() => ID) id: string;
  @Field(() => ID) orderId: string;
  @Field(() => String) status: string;
  @Field(() => Date, { nullable: true }) arrivedAt?: Date | null;
  @Field(() => Date, { nullable: true }) completedAt?: Date | null;
  @Field(() => MoneyScalar, { nullable: true }) codExpected?: number | null;
  @Field(() => MoneyScalar, { nullable: true }) codActual?: number | null;
  @Field(() => Date, { nullable: true }) codCollectedAt?: Date | null;
  @Field(() => String, { nullable: true }) skipReason?: string | null;
  @Field(() => String) orderStatus: string;
  @Field(() => [String]) warnings: string[];
}

@ObjectType()
export class TripLocationPoint {
  @Field(() => Float) lat: number;
  @Field(() => Float) lng: number;
  @Field() recordedAt: Date;
  @Field(() => Float, { nullable: true }) speed?: number | null;
  @Field(() => Float, { nullable: true }) accuracy?: number | null;
}
