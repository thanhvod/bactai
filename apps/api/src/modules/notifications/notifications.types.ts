import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ConnectionType } from '../../common/graphql/pagination';

@ObjectType()
export class NotificationView {
  @Field(() => ID) id: string;
  @Field(() => String) type: string;
  @Field() title: string;
  @Field(() => String, { nullable: true }) body?: string | null;
  @Field(() => String, { nullable: true }) entityType?: string | null;
  @Field(() => ID, { nullable: true }) entityId?: string | null;
  @Field(() => String, { nullable: true }) severity?: string | null;
  @Field(() => Date, { nullable: true }) readAt?: Date | null;
  @Field() createdAt: Date;
}

@ObjectType()
export class NotificationConnection extends ConnectionType(NotificationView, 'NotificationConnection') {
  @Field(() => Int) unreadCount: number;
}

@InputType()
export class NotificationFilter {
  @Field({ nullable: true }) unread?: boolean;
  @Field(() => [String], { nullable: true }) types?: string[];
}
