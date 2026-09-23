import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from '../../common/graphql/common.types';

@ObjectType()
export class TimelineEntry {
  @Field(() => ID) id: string;
  @Field() kind: string; // ACTIVITY | STATUS
  @Field() createdAt: Date;
  @Field(() => String) entityType: string;
  @Field(() => ID) entityId: string;
  @Field(() => String) category: string;
  @Field() action: string;
  @Field() summary: string;
  @Field(() => String) actorType: string;
  @Field(() => String, { nullable: true }) actorId?: string | null;
  @Field(() => String, { nullable: true }) actorName?: string | null;
  @Field(() => String, { nullable: true }) reason?: string | null;
  @Field(() => GraphQLJSON, { nullable: true }) before?: unknown;
  @Field(() => GraphQLJSON, { nullable: true }) after?: unknown;
  @Field() sensitive: boolean;
  @Field(() => String, { nullable: true }) fromStatus?: string | null;
  @Field(() => String, { nullable: true }) toStatus?: string | null;
}

@InputType()
export class EntityRefInput {
  @Field(() => String) type: string;
  @Field(() => ID) id: string;
}

@InputType()
export class TimelineFilter {
  @Field(() => [String], { nullable: true }) categories?: string[];
  @Field({ nullable: true }) includeChildren?: boolean;
}
