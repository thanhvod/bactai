import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth, CurrentPrincipal, Public } from '../../common/auth/decorators';
import { currentPrincipal, type CustomerPrincipal } from '../../common/context/request-context';
import { PageArgs } from '../../common/graphql/pagination';
import { BookingsService } from '../bookings/bookings.service';
import { PortalService } from './portal.service';
import {
  BookingConnection,
  BookingFilter,
  BookingInput,
  BookingView,
  CustomerAddressInput,
  CustomerAddressView,
  CustomerMe,
  CustomerProfileInput,
  MyDebtSummary,
  MyOrderConnection,
  MyOrderFilter,
  MyOrderView,
  MyStatementView,
  PublicMerchantConnection,
  PublicMerchantFilter,
  PublicMerchantView,
} from './portal.types';

function optionalAccount(): string | null {
  const p = currentPrincipal();
  return p?.type === 'CUSTOMER' ? p.accountId : null;
}

@Resolver()
@Auth('CUSTOMER')
export class PortalResolver {
  constructor(private readonly svc: PortalService, private readonly bookings: BookingsService) {}

  @Query(() => CustomerMe)
  customerMe(@CurrentPrincipal() p: CustomerPrincipal) {
    return this.svc.me(p.accountId);
  }

  @Mutation(() => CustomerMe)
  updateCustomerProfile(@CurrentPrincipal() p: CustomerPrincipal, @Args('input') input: CustomerProfileInput) {
    return this.svc.updateProfile(p.accountId, input);
  }

  @Query(() => [CustomerAddressView])
  myAddresses(@CurrentPrincipal() p: CustomerPrincipal) {
    return this.svc.addresses(p.accountId);
  }

  @Mutation(() => CustomerAddressView)
  createMyAddress(@CurrentPrincipal() p: CustomerPrincipal, @Args('input') input: CustomerAddressInput) {
    return this.svc.createAddress(p.accountId, input);
  }

  @Mutation(() => CustomerAddressView)
  updateMyAddress(@CurrentPrincipal() p: CustomerPrincipal, @Args('id', { type: () => ID }) id: string, @Args('input') input: CustomerAddressInput) {
    return this.svc.updateAddress(p.accountId, id, input);
  }

  @Mutation(() => Boolean)
  deleteMyAddress(@CurrentPrincipal() p: CustomerPrincipal, @Args('id', { type: () => ID }) id: string) {
    return this.svc.deleteAddress(p.accountId, id);
  }

  @Public()
  @Query(() => PublicMerchantConnection)
  publicMerchants(@Args('filter', { nullable: true }) filter: PublicMerchantFilter, @Args() page: PageArgs) {
    return this.svc.publicMerchants(filter, page, optionalAccount());
  }

  @Public()
  @Query(() => PublicMerchantView)
  publicMerchant(@Args('id', { type: () => ID }) id: string) {
    return this.svc.publicMerchant(id, optionalAccount());
  }

  @Query(() => BookingConnection)
  myBookings(@CurrentPrincipal() p: CustomerPrincipal, @Args('filter', { nullable: true }) filter: BookingFilter, @Args() page: PageArgs) {
    return this.bookings.myBookings(p.accountId, filter, page);
  }

  @Query(() => BookingView)
  myBooking(@CurrentPrincipal() p: CustomerPrincipal, @Args('id', { type: () => ID }) id: string) {
    return this.bookings.myBooking(p.accountId, id);
  }

  @Mutation(() => BookingView)
  createBooking(@CurrentPrincipal() p: CustomerPrincipal, @Args('input') input: BookingInput) {
    return this.bookings.createAsCustomer(p.accountId, input);
  }

  @Mutation(() => BookingView)
  updateBooking(@CurrentPrincipal() p: CustomerPrincipal, @Args('id', { type: () => ID }) id: string, @Args('input') input: BookingInput) {
    return this.bookings.updateAsCustomer(p.accountId, id, input);
  }

  @Mutation(() => BookingView)
  cancelBooking(@CurrentPrincipal() p: CustomerPrincipal, @Args('id', { type: () => ID }) id: string, @Args('reason') reason: string) {
    return this.bookings.cancelAsCustomer(p.accountId, id, reason);
  }

  @Query(() => MyOrderConnection)
  myOrders(@CurrentPrincipal() p: CustomerPrincipal, @Args('filter', { nullable: true }) filter: MyOrderFilter, @Args() page: PageArgs) {
    return this.svc.myOrders(p.accountId, filter, page);
  }

  @Query(() => MyOrderView)
  myOrder(@CurrentPrincipal() p: CustomerPrincipal, @Args('id', { type: () => ID }) id: string) {
    return this.svc.myOrder(p.accountId, id);
  }

  @Query(() => MyDebtSummary)
  myDebtSummary(@CurrentPrincipal() p: CustomerPrincipal) {
    return this.svc.myDebtSummary(p.accountId);
  }

  @Query(() => [MyStatementView])
  myDebtStatements(@CurrentPrincipal() p: CustomerPrincipal) {
    return this.svc.myDebtStatements(p.accountId);
  }

  @Query(() => MyStatementView)
  myDebtStatement(@CurrentPrincipal() p: CustomerPrincipal, @Args('id', { type: () => ID }) id: string) {
    return this.svc.myDebtStatement(p.accountId, id);
  }
}
