import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { ConnectionType } from '../../common/graphql/pagination';
import { AttachmentView } from '../attachments/attachments.types';
import { TimelineEntry } from '../activity/activity.types';

@ObjectType()
export class IncidentView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => ID, { nullable: true }) typeId?: string | null;
  @Field(() => String, { nullable: true }) typeName?: string | null;
  @Field() title: string;
  @Field(() => String) severity: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => ID, { nullable: true }) orderId?: string | null;
  @Field(() => String, { nullable: true }) orderCode?: string | null;
  @Field(() => ID, { nullable: true }) tripId?: string | null;
  @Field(() => String, { nullable: true }) tripCode?: string | null;
  @Field(() => ID, { nullable: true }) stopId?: string | null;
  @Field(() => ID, { nullable: true }) driverId?: string | null;
  @Field(() => String, { nullable: true }) driverName?: string | null;
  @Field(() => String, { nullable: true }) driverPhone?: string | null;
  @Field(() => ID, { nullable: true }) vehicleId?: string | null;
  @Field(() => String, { nullable: true }) vehiclePlate?: string | null;
  @Field(() => String, { nullable: true }) location?: string | null;
  @Field(() => String) reportedByType: string;
  @Field(() => String, { nullable: true }) reportedByName?: string | null;
  @Field(() => ID, { nullable: true }) assigneeUserId?: string | null;
  @Field(() => String, { nullable: true }) assigneeName?: string | null;
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) resolvedNote?: string | null;
  @Field(() => Date, { nullable: true }) resolvedAt?: Date | null;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => [AttachmentView], { nullable: true }) attachments?: AttachmentView[];
  @Field(() => [TimelineEntry], { nullable: true }) activity?: TimelineEntry[];
}

@ObjectType()
export class IncidentConnection extends ConnectionType(IncidentView, 'IncidentConnection') {}

@InputType()
export class IncidentFilter {
  @Field(() => [String], { nullable: true }) status?: string[];
  @Field(() => [String], { nullable: true }) severity?: string[];
  @Field(() => ID, { nullable: true }) typeId?: string;
  @Field(() => ID, { nullable: true }) assigneeId?: string;
  @Field(() => ID, { nullable: true }) orderId?: string;
  @Field(() => ID, { nullable: true }) tripId?: string;
  @Field({ nullable: true }) dateFrom?: string;
  @Field({ nullable: true }) dateTo?: string;
  @Field({ nullable: true }) search?: string;
}

@InputType()
export class IncidentInput {
  @Field(() => ID, { nullable: true }) typeId?: string;
  @Field() title: string;
  @Field(() => String) severity: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => ID, { nullable: true }) orderId?: string;
  @Field(() => ID, { nullable: true }) tripId?: string;
  @Field(() => ID, { nullable: true }) stopId?: string;
  @Field({ nullable: true }) location?: string;
  @Field(() => ID, { nullable: true }) assigneeUserId?: string;
  @Field(() => String, { nullable: true }) status?: string;
  @Field(() => [ID], { nullable: true }) attachmentIds?: string[];
  @Field({ nullable: true }) clientRequestId?: string;
}
