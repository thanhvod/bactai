import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth } from '../../common/auth/decorators';
import { PageArgs } from '../../common/graphql/pagination';
import { NotificationsService } from './notifications.service';
import { NotificationConnection, NotificationFilter } from './notifications.types';

@Resolver()
@Auth('USER', 'DRIVER', 'CUSTOMER')
export class NotificationsResolver {
  constructor(private readonly svc: NotificationsService) {}

  @Query(() => NotificationConnection)
  notifications(@Args('filter', { nullable: true }) filter: NotificationFilter, @Args() page: PageArgs) {
    return this.svc.list(filter, page);
  }

  @Query(() => Int)
  unreadNotificationCount() {
    return this.svc.unreadCount();
  }

  /** Trả về số chưa đọc còn lại. */
  @Mutation(() => Int)
  markNotificationRead(@Args('id', { type: () => ID }) id: string) {
    return this.svc.markRead([id]);
  }

  @Mutation(() => Int)
  markNotificationsRead(@Args('ids', { type: () => [ID], nullable: true }) ids?: string[]) {
    return this.svc.markRead(ids ?? null);
  }

  @Mutation(() => Int)
  markAllNotificationsRead() {
    return this.svc.markRead(null);
  }
}
