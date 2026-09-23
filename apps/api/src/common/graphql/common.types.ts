import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { MoneyScalar } from './scalars';

export { GraphQLJSON };

@ObjectType()
export class BusinessWarning {
  @Field() code: string;
  @Field() message: string;
  @Field(() => String, { nullable: true }) severity?: 'info' | 'warning' | 'danger';
  @Field(() => GraphQLJSON, { nullable: true }) details?: unknown;
}

@ObjectType()
export class ScheduleWarningView {
  @Field(() => ID, { nullable: true }) id?: string | null;
  @Field() type: string;
  @Field() subject: string;
  @Field() subjectId: string;
  @Field(() => String, { nullable: true }) subjectLabel?: string | null;
  @Field(() => ID, { nullable: true }) conflictTripId?: string | null;
  @Field(() => String, { nullable: true }) conflictTripCode?: string | null;
  @Field(() => Int) gapMinutes: number;
  @Field(() => Int) thresholdMinutes: number;
  @Field(() => String, { nullable: true }) overrideReason?: string | null;
}

@ObjectType()
export class RefView {
  @Field(() => ID) id: string;
  @Field(() => String, { nullable: true }) code?: string | null;
  @Field(() => String, { nullable: true }) name?: string | null;
}

@ObjectType()
export class OkPayload {
  @Field() ok: boolean;
  @Field(() => String, { nullable: true }) message?: string | null;
}

@ObjectType()
export class MoneyBreakdownItem {
  @Field() key: string;
  @Field() label: string;
  @Field(() => MoneyScalar) amount: number;
}

export { MoneyScalar };
