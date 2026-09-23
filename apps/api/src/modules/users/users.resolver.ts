import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Grant, MerchantRole, Permission } from '@bta/shared';
import { RequirePermission } from '../../common/auth/decorators';
import { PageArgs } from '../../common/graphql/pagination';
import { UsersService } from './users.service';
import {
  InviteMerchantUserInput,
  MerchantUserConnection,
  MerchantUserFilter,
  MerchantUserView,
  PermissionMatrixRow,
  RoleView,
  StaffAppCredentials,
  UpdateMerchantUserInput,
} from './users.types';

@Resolver()
export class UsersResolver {
  constructor(private readonly svc: UsersService) {}

  @Query(() => MerchantUserConnection)
  @RequirePermission('users.manage')
  merchantUsers(@Args('filter', { nullable: true }) filter: MerchantUserFilter, @Args() page: PageArgs) {
    return this.svc.list(filter, page);
  }

  @Query(() => MerchantUserView)
  @RequirePermission('users.manage')
  merchantUser(@Args('id', { type: () => ID }) id: string) {
    return this.svc.get(id);
  }

  /** Danh sách nhân viên rút gọn cho picker (gán người xử lý sự cố...). */
  @Query(() => [MerchantUserView])
  staffOptions() {
    return this.svc.list({ status: 'ACTIVE' }, { first: 200 }).then((c) => c.nodes);
  }

  @Mutation(() => MerchantUserView)
  @RequirePermission('users.manage')
  inviteMerchantUser(@Args('input') input: InviteMerchantUserInput) {
    return this.svc.invite(input);
  }

  @Mutation(() => MerchantUserView)
  @RequirePermission('users.manage')
  updateMerchantUser(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateMerchantUserInput) {
    return this.svc.update(id, input);
  }

  @Mutation(() => MerchantUserView)
  @RequirePermission('users.manage')
  lockMerchantUser(@Args('id', { type: () => ID }) id: string) {
    return this.svc.setLocked(id, true);
  }

  @Mutation(() => MerchantUserView)
  @RequirePermission('users.manage')
  unlockMerchantUser(@Args('id', { type: () => ID }) id: string) {
    return this.svc.setLocked(id, false);
  }

  @Mutation(() => MerchantUserView)
  @RequirePermission('users.manage')
  resendInvite(@Args('id', { type: () => ID }) id: string) {
    return this.svc.resendInvite(id);
  }

  @Mutation(() => StaffAppCredentials)
  @RequirePermission('users.manage')
  resetMerchantUserAppPassword(@Args('id', { type: () => ID }) id: string, @Args('phone', { nullable: true }) phone?: string) {
    return this.svc.resetAppPassword(id, phone);
  }

  @Mutation(() => MerchantUserView)
  @RequirePermission('users.manage')
  disableMerchantUserAppLogin(@Args('id', { type: () => ID }) id: string) {
    return this.svc.disableAppLogin(id);
  }

  @Query(() => [RoleView])
  roles() {
    return this.svc.roles();
  }

  @Query(() => [PermissionMatrixRow])
  permissionMatrix() {
    return this.svc.permissionMatrix();
  }

  @Mutation(() => PermissionMatrixRow)
  @RequirePermission('users.manage')
  updateRolePermission(@Args('role') role: string, @Args('permission') permission: string, @Args('grant') grant: string) {
    return this.svc.updateRolePermission(role as MerchantRole, permission as Permission, grant as Grant);
  }
}
