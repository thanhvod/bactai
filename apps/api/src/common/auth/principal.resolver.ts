import { Injectable, Logger } from '@nestjs/common';
import type { MerchantRole } from '@bta/shared';
import { env } from '../../config/env';
import { PrismaService } from '../prisma/prisma.service';
import type { Principal, UserPrincipal } from '../context/request-context';
import { FirebaseService } from './firebase.service';
import { JwtService } from './jwt.service';
import { PermissionService } from './permission.service';

/**
 * Giải mã Authorization header thành Principal + merchant context.
 *  - `Bearer <firebase id token>`  → USER (nhân viên merchant)
 *  - `Bearer dev:<email>`          → USER (chỉ khi AUTH_DEV_BYPASS)
 *  - `Bearer drv.<jwt>`            → DRIVER
 *  - `Bearer cus.<jwt>`            → CUSTOMER
 *  - `Bearer usr.<jwt>`            → USER qua App Merchant SĐT + mật khẩu (D-014)
 */
@Injectable()
export class PrincipalResolver {
  private readonly logger = new Logger(PrincipalResolver.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
    private readonly jwt: JwtService,
    private readonly permissions: PermissionService,
  ) {}

  async resolve(authorization: string | undefined, merchantHeader: string | undefined): Promise<{ principal: Principal | null; merchantId: string | null }> {
    if (!authorization?.startsWith('Bearer ')) return { principal: null, merchantId: null };
    const token = authorization.slice(7).trim();
    if (!token) return { principal: null, merchantId: null };

    if (token.startsWith('drv.')) return this.resolveDriver(token.slice(4));
    if (token.startsWith('cus.')) return this.resolveCustomer(token.slice(4));
    if (token.startsWith('usr.')) {
      const claims = this.jwt.verify(token.slice(4), 'user');
      if (!claims) return { principal: null, merchantId: null };
      const acc = await this.prisma.raw.userAccount.findUnique({ where: { id: claims.sub } });
      if (!acc || !acc.passwordHash) return { principal: null, merchantId: null };
      return this.membershipContext(acc, merchantHeader);
    }
    if (token.startsWith('dev:')) {
      if (!env().AUTH_DEV_BYPASS) return { principal: null, merchantId: null };
      return this.resolveUser({ email: token.slice(4).toLowerCase(), name: undefined, uid: undefined }, merchantHeader);
    }
    const identity = await this.firebase.verifyIdToken(token);
    if (!identity) return { principal: null, merchantId: null };
    return this.resolveUser({ email: identity.email, name: identity.name, uid: identity.uid, picture: identity.picture }, merchantHeader);
  }

  private async resolveUser(
    identity: { email: string; name?: string; uid?: string; picture?: string },
    merchantHeader: string | undefined,
  ): Promise<{ principal: UserPrincipal; merchantId: string | null }> {
    const account = await this.prisma.raw.userAccount.upsert({
      where: { email: identity.email },
      create: { email: identity.email, name: identity.name ?? identity.email.split('@')[0], firebaseUid: identity.uid, avatarUrl: identity.picture, lastLoginAt: new Date() },
      update: { ...(identity.uid ? { firebaseUid: identity.uid } : {}), ...(identity.name ? { name: identity.name } : {}), ...(identity.picture ? { avatarUrl: identity.picture } : {}) },
    });
    // Lời mời theo email chưa gắn account → gắn ngay (status vẫn INVITED cho tới khi chấp nhận).
    await this.prisma.raw.merchantUser.updateMany({ where: { email: identity.email, accountId: null }, data: { accountId: account.id } });
    return this.membershipContext(account, merchantHeader);
  }

  private async membershipContext(
    account: { id: string; email: string; name: string | null },
    merchantHeader: string | undefined,
  ): Promise<{ principal: UserPrincipal; merchantId: string | null }> {
    const principal: UserPrincipal = { type: 'USER', accountId: account.id, email: account.email, name: account.name ?? account.email, permissions: [] };
    if (!merchantHeader) return { principal, merchantId: null };

    const membership = await this.prisma.raw.merchantUser.findFirst({
      where: { accountId: account.id, merchantId: merchantHeader, status: 'ACTIVE', merchant: { status: 'ACTIVE' } },
    });
    if (!membership) return { principal, merchantId: null };
    principal.membershipId = membership.id;
    principal.merchantId = membership.merchantId;
    principal.role = membership.role as MerchantRole;
    principal.name = membership.name || principal.name;
    principal.permissions = await this.permissions.effectiveFor(membership.merchantId, principal.role, membership.extraPermissions);
    // lastAccessAt cập nhật thưa (mỗi 5 phút) để tránh ghi DB mỗi request
    if (!membership.lastAccessAt || Date.now() - membership.lastAccessAt.getTime() > 5 * 60_000) {
      this.prisma.raw.merchantUser.update({ where: { id: membership.id }, data: { lastAccessAt: new Date() } }).catch(() => undefined);
    }
    return { principal, merchantId: membership.merchantId };
  }

  private async resolveDriver(token: string): Promise<{ principal: Principal | null; merchantId: string | null }> {
    const claims = this.jwt.verify(token, 'driver');
    if (!claims?.did) return { principal: null, merchantId: null };
    const account = await this.prisma.raw.driverAccount.findUnique({ where: { id: claims.sub }, include: { driver: true } });
    if (!account || account.status === 'DISABLED' || account.driver.status !== 'ACTIVE') return { principal: null, merchantId: null };
    return {
      principal: { type: 'DRIVER', driverId: account.driverId, merchantId: account.merchantId, name: account.driver.name, accountId: account.id },
      merchantId: account.merchantId,
    };
  }

  private async resolveCustomer(token: string): Promise<{ principal: Principal | null; merchantId: string | null }> {
    const claims = this.jwt.verify(token, 'customer');
    if (!claims) return { principal: null, merchantId: null };
    const account = await this.prisma.raw.customerAccount.findUnique({ where: { id: claims.sub } });
    if (!account || account.status !== 'ACTIVE') return { principal: null, merchantId: null };
    return { principal: { type: 'CUSTOMER', accountId: account.id, email: account.email, phone: account.phone, name: account.fullName }, merchantId: null };
  }
}
