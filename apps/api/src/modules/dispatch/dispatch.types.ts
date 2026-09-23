import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ConnectionType } from '../../common/graphql/pagination';

@ObjectType()
export class TripBrief {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) status: string;
  @Field() plannedStartAt: Date;
  @Field(() => Date, { nullable: true }) plannedEndAt?: Date | null;
  @Field(() => String, { nullable: true }) orderCode?: string | null;
  @Field(() => String, { nullable: true }) vehiclePlate?: string | null;
  @Field(() => String, { nullable: true }) driverName?: string | null;
}

@ObjectType()
export class ScheduleWarningRecord {
  @Field(() => ID) id: string;
  @Field(() => String) type: string;
  @Field(() => String) subject: string;
  @Field(() => ID) subjectId: string;
  @Field(() => String, { nullable: true }) subjectLabel?: string | null;
  @Field(() => TripBrief) trip: TripBrief;
  @Field(() => TripBrief, { nullable: true }) conflictTrip?: TripBrief | null;
  @Field(() => Int) gapMinutes: number;
  @Field(() => Int) thresholdMinutes: number;
  /** OPEN | OVERRIDDEN | RESOLVED */
  @Field() status: string;
  @Field(() => String, { nullable: true }) overrideReason?: string | null;
  @Field(() => String, { nullable: true }) overriddenByName?: string | null;
  @Field(() => Date, { nullable: true }) resolvedAt?: Date | null;
  @Field() createdAt: Date;
}

@ObjectType()
export class ScheduleWarningConnection extends ConnectionType(ScheduleWarningRecord, 'ScheduleWarningConnection') {}

@InputType()
export class ScheduleWarningFilter {
  @Field({ nullable: true }) resolved?: boolean;
  @Field({ nullable: true }) dateFrom?: string;
  @Field({ nullable: true }) dateTo?: string;
  @Field(() => ID, { nullable: true }) tripId?: string;
  @Field(() => String, { nullable: true }) subject?: string;
}

@ObjectType()
export class ScheduleResource {
  @Field() type: string;
  @Field(() => ID) id: string;
  @Field() label: string;
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) sublabel?: string | null;
}

@ObjectType()
export class ScheduleBlock {
  @Field(() => ID) tripId: string;
  @Field() code: string;
  @Field() start: Date;
  @Field() end: Date;
  @Field(() => String) status: string;
  @Field() warning: boolean;
  @Field(() => String, { nullable: true }) orderCode?: string | null;
  @Field(() => String, { nullable: true }) routeSummary?: string | null;
  @Field(() => String, { nullable: true }) counterpartLabel?: string | null;
}

@ObjectType()
export class ScheduleRow {
  @Field(() => ScheduleResource) resource: ScheduleResource;
  @Field(() => [ScheduleBlock]) blocks: ScheduleBlock[];
}

@ObjectType()
export class StatusCount {
  @Field(() => String) status: string;
  @Field(() => Int) count: number;
}

@ObjectType()
export class DispatchSummary {
  @Field() date: string;
  @Field(() => Int) total: number;
  @Field(() => [StatusCount]) byStatus: StatusCount[];
  @Field(() => Int) running: number;
  @Field(() => Int) unassigned: number;
  @Field(() => Int) warnings: number;
  @Field(() => Int) openIncidents: number;
  @Field(() => Int) ordersWaitingDispatch: number;
}
