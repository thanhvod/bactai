import { Field, Float, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { MoneyScalar } from '../../common/graphql/scalars';

@ObjectType()
export class DriverMeView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() name: string;
  @Field() phone: string;
  @Field(() => ID) merchantId: string;
  @Field() merchantName: string;
  @Field(() => String, { nullable: true }) merchantHotline?: string | null;
  @Field() mustChangePassword: boolean;
  @Field(() => String, { nullable: true }) licenseClass?: string | null;
  @Field(() => Date, { nullable: true }) licenseExpiresAt?: Date | null;
  @Field(() => Int) unreadNotifications: number;
  @Field(() => MoneyScalar) codHeld: number;
}

@ObjectType()
export class DriverStopView {
  @Field(() => ID) id: string;
  @Field(() => ID) orderId: string;
  @Field(() => String) type: string;
  @Field(() => Int) sequence: number;
  @Field(() => String, { nullable: true }) locationName?: string | null;
  @Field() address: string;
  @Field(() => Float, { nullable: true }) lat?: number | null;
  @Field(() => Float, { nullable: true }) lng?: number | null;
  @Field(() => String, { nullable: true }) contactName?: string | null;
  @Field(() => String, { nullable: true }) contactPhone?: string | null;
  @Field(() => Date, { nullable: true }) plannedAt?: Date | null;
  @Field(() => Date, { nullable: true }) arrivedAt?: Date | null;
  @Field(() => Date, { nullable: true }) completedAt?: Date | null;
  @Field(() => MoneyScalar, { nullable: true }) codExpected?: number | null;
  @Field(() => MoneyScalar, { nullable: true }) codActual?: number | null;
  @Field(() => Date, { nullable: true }) codCollectedAt?: Date | null;
  @Field(() => String, { nullable: true }) codNote?: string | null;
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) skipReason?: string | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field(() => Int) podCount: number;
  @Field(() => [String]) cargoSummary: string[];
}

@ObjectType()
export class DriverCargoView {
  @Field() name: string;
  @Field(() => String, { nullable: true }) type?: string | null;
  @Field(() => Float, { nullable: true }) weightKg?: number | null;
  @Field(() => Float, { nullable: true }) volumeM3?: number | null;
  @Field(() => Float, { nullable: true }) quantity?: number | null;
  @Field(() => String, { nullable: true }) packagingUnit?: string | null;
  @Field(() => [String]) properties: string[];
  @Field(() => String, { nullable: true }) note?: string | null;
}

@ObjectType()
export class DriverIncidentBrief {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() title: string;
  @Field(() => String) severity: string;
  @Field(() => String) status: string;
  @Field() createdAt: Date;
}

@ObjectType()
export class DriverTripView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) previousStatusBeforePause?: string | null;
  @Field(() => String, { nullable: true }) pauseReason?: string | null;
  @Field(() => ID) orderId: string;
  @Field() orderCode: string;
  @Field() customerName: string;
  @Field(() => String, { nullable: true }) routeSummary?: string | null;
  @Field(() => String, { nullable: true }) vehiclePlate?: string | null;
  @Field(() => String, { nullable: true }) vehicleType?: string | null;
  @Field() plannedStartAt: Date;
  @Field(() => Date, { nullable: true }) plannedEndAt?: Date | null;
  @Field(() => Date, { nullable: true }) actualStartAt?: Date | null;
  @Field(() => Date, { nullable: true }) actualEndAt?: Date | null;
  @Field(() => MoneyScalar) codExpectedTotal: number;
  @Field(() => MoneyScalar) codActualTotal: number;
  @Field(() => MoneyScalar) driverBonusAmount: number;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field(() => String, { nullable: true }) orderNote?: string | null;
  @Field(() => Int) stopCount: number;
  @Field(() => Int) completedStopCount: number;
  @Field(() => Int) attachmentCount: number;
  @Field(() => [DriverStopView]) stops: DriverStopView[];
  @Field(() => [DriverCargoView]) cargoLines: DriverCargoView[];
  @Field(() => [DriverIncidentBrief]) incidents: DriverIncidentBrief[];
  @Field(() => [String]) allowedNextStatuses: string[];
  @Field(() => Date, { nullable: true }) lastLocationAt?: Date | null;
  @Field() isRunning: boolean;
}

@InputType()
export class DriverJobsFilter {
  /** TODAY | UPCOMING | RUNNING | DONE */
  @Field({ nullable: true }) bucket?: string;
  @Field({ nullable: true }) date?: string;
  @Field({ nullable: true }) from?: string;
  @Field({ nullable: true }) to?: string;
  @Field(() => [String], { nullable: true }) status?: string[];
}

@ObjectType()
export class DriverCalendarDay {
  @Field() date: string;
  @Field(() => Int) tripCount: number;
  @Field(() => [String]) statuses: string[];
}

@ObjectType()
export class DriverTripPayload {
  @Field(() => DriverTripView) trip: DriverTripView;
  @Field(() => [String]) warnings: string[];
}

@ObjectType()
export class DriverStopPayload {
  @Field(() => DriverStopView) stop: DriverStopView;
  @Field(() => [String]) warnings: string[];
  @Field(() => String, { nullable: true }) orderStatus?: string | null;
}

@InputType()
export class DriverTripStatusInput {
  @Field(() => ID) tripId: string;
  @Field() status: string;
  @Field({ nullable: true }) reason?: string;
  @Field({ nullable: true }) note?: string;
  @Field(() => ID, { nullable: true }) pauseReasonId?: string;
  @Field({ nullable: true }) actualAt?: Date;
  @Field({ nullable: true }) idempotencyKey?: string;
}

@InputType()
export class DriverStopStatusInput {
  @Field(() => ID) stopId: string;
  @Field(() => ID, { nullable: true }) tripId?: string;
  @Field() status: string;
  @Field({ nullable: true }) reason?: string;
  @Field({ nullable: true }) note?: string;
  @Field({ nullable: true }) actualAt?: Date;
  @Field({ nullable: true }) idempotencyKey?: string;
}

@InputType()
export class DriverCodInput {
  @Field(() => ID) stopId: string;
  @Field(() => MoneyScalar) amount: number;
  @Field({ nullable: true }) note?: string;
  @Field({ nullable: true }) reason?: string;
  @Field({ nullable: true }) idempotencyKey?: string;
}

@InputType()
export class DriverIncidentInput {
  @Field(() => ID) tripId: string;
  @Field(() => ID, { nullable: true }) stopId?: string;
  @Field(() => ID, { nullable: true }) typeId?: string;
  @Field() title: string;
  @Field() severity: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) location?: string;
  @Field(() => [ID], { nullable: true }) attachmentIds?: string[];
  @Field({ nullable: true }) idempotencyKey?: string;
}
