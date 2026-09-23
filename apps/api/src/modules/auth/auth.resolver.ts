import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth, CurrentPrincipal, NoMerchant } from '../../common/auth/decorators';
import type { UserPrincipal } from '../../common/context/request-context';
import { AuthService } from './auth.service';
import { CreateMerchantInput, Me, Membership } from './auth.types';

@Resolver()
@Auth('USER')
@NoMerchant()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Query(() => Me)
  me(@CurrentPrincipal() p: UserPrincipal) {
    return this.auth.me(p);
  }

  @Mutation(() => Membership)
  createMerchant(@CurrentPrincipal() p: UserPrincipal, @Args('input') input: CreateMerchantInput) {
    return this.auth.createMerchant(p, input);
  }

  @Mutation(() => Me)
  setMyAppCredentials(@CurrentPrincipal() p: UserPrincipal, @Args('phone') phone: string, @Args('newPassword') newPassword: string) {
    return this.auth.setMyAppCredentials(p, phone, newPassword);
  }

  @Mutation(() => Membership)
  acceptInvitation(@CurrentPrincipal() p: UserPrincipal, @Args('membershipId', { type: () => ID }) id: string) {
    return this.auth.acceptInvitation(p, id);
  }
}
