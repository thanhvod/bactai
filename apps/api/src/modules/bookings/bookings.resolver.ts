import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth, RequirePermission } from '../../common/auth/decorators';
import { PageArgs } from '../../common/graphql/pagination';
import { BookingConnection, BookingFilter, BookingView } from '../customer-portal/portal.types';
import { BookingsService } from './bookings.service';

@Resolver()
export class BookingsResolver {
  constructor(private readonly svc: BookingsService) {}

  @Query(() => BookingConnection)
  @RequirePermission('order.view')
  bookings(@Args('filter', { nullable: true }) filter: BookingFilter, @Args() page: PageArgs) {
    return this.svc.list(filter, page);
  }

  @Query(() => BookingView)
  @RequirePermission('order.view')
  booking(@Args('id', { type: () => ID }) id: string) {
    return this.svc.get(id);
  }

  @Mutation(() => BookingView)
  @RequirePermission('booking.manage')
  acceptBooking(@Args('id', { type: () => ID }) id: string, @Args('customerId', { type: () => ID, nullable: true }) customerId?: string) {
    return this.svc.accept(id, customerId);
  }

  @Mutation(() => BookingView)
  @RequirePermission('booking.manage')
  rejectBooking(@Args('id', { type: () => ID }) id: string, @Args('reason') reason: string) {
    return this.svc.reject(id, reason);
  }

  /** Nhà xe hoặc khách ghi chú trao đổi trên booking. */
  @Mutation(() => BookingView)
  @Auth('USER', 'CUSTOMER')
  addBookingNote(@Args('bookingId', { type: () => ID }) bookingId: string, @Args('body') body: string) {
    return this.svc.addNote(bookingId, body);
  }
}
