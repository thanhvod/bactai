import { Injectable } from '@nestjs/common';
import { createMerchantSchema } from '@bta/shared';
import { hashPassword, seedMerchantDefaults } from '@bta/db';
import { AuditService } from '../../common/audit/audit.service';
import { currentStore, runWithStore, type UserPrincipal } from '../../common/context/request-context';
import { businessRule, conflict, forbidden, notFound, validationError } from '../../common/errors/app-error';
import { isValidVnMobile, normalizeVnPhone } from '../../common/otp/sms.sender';
import { PrismaService } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';
import { env } from '../../config/env';
import type { CreateMerchantInput, Me, Membership } from './auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async me(p: UserPrincipal): Promise<Me> {
    const [account, memberships] = await Promise.all([
      this.prisma.raw.userAccount.findUniqueOrThrow({ where: { id: p.accountId } }),
      this.prisma.raw.merchantUser.findMany({
        where: { accountId: p.accountId, status: { in: ['ACTIVE', 'INVITED'] }, merchant: { status: 'ACTIVE' } },
        include: { merchant: true },
        orderBy: [{ lastAccessAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'asc' }],
      }),
    ]);
    const current = p.membershipId ? memberships.find((m) => m.id === p.membershipId) : undefined;
    return {
      account: { id: account.id, email: account.email, name: account.name, avatarUrl: account.avatarUrl, phone: account.phone, hasAppPassword: !!account.passwordHash, mustChangePassword: account.mustChangePassword },
      memberships: memberships.map(toMembership),
      current: current
        ? {
            membershipId: current.id,
            merchantId: current.merchantId,
            merchantName: current.merchant.name,
            merchantCode: current.merchant.code,
            role: current.role,
            permissions: p.permissions,
          }
        : null,
      canCreateMerchant: env().ALLOW_SELF_SERVICE_MERCHANT,
    };
  }

  /** WM-AUTH-02: tạo merchant self-service, người tạo thành ADMIN; seed catalog mặc định. */
  async createMerchant(p: UserPrincipal, input: CreateMerchantInput): Promise<Membership> {
    if (!env().ALLOW_SELF_SERVICE_MERCHANT) throw forbidden('Chưa mở đăng ký nhà xe tự phục vụ');
    const data = parse(createMerchantSchema, input);
    const account = await this.prisma.raw.userAccount.findUniqueOrThrow({ where: { id: p.accountId } });
    const code = await this.nextMerchantCode();
    const result = await this.prisma.raw.$transaction(async (tx) => {
      const merchant = await tx.merchant.create({
        data: { code, name: data.name, legalName: data.legalName, taxCode: data.taxCode, address: data.address, contactName: data.contactName, phone: data.phone, email: data.email ?? account.email },
      });
      await seedMerchantDefaults(tx, merchant.id);
      const membership = await tx.merchantUser.create({
        data: { merchantId: merchant.id, accountId: account.id, email: account.email, name: account.name ?? account.email, role: 'ADMIN', status: 'ACTIVE', joinedAt: new Date() },
        include: { merchant: true },
      });
      return membership;
    });
    await runWithStore({ ...(currentStore() ?? { requestId: 'x', principal: p }), merchantId: result.merchantId, principal: { ...p, membershipId: result.id, merchantId: result.merchantId } }, () =>
      this.audit.log({ entityType: 'MERCHANT', entityId: result.merchantId, category: 'CREATE', action: 'merchant.create', summary: `Tạo nhà xe ${result.merchant.name}` }),
    );
    return toMembership(result);
  }

  async acceptInvitation(p: UserPrincipal, membershipId: string): Promise<Membership> {
    const m = await this.prisma.raw.merchantUser.findFirst({ where: { id: membershipId, accountId: p.accountId }, include: { merchant: true } });
    if (!m) throw notFound('lời mời');
    if (m.status === 'LOCKED') throw businessRule('Tài khoản đã bị khóa tại nhà xe này');
    if (m.status === 'ACTIVE') return toMembership(m);
    const updated = await this.prisma.raw.merchantUser.update({ where: { id: m.id }, data: { status: 'ACTIVE', joinedAt: new Date() }, include: { merchant: true } });
    return toMembership(updated);
  }

  /** Nhân viên tự đặt SĐT + mật khẩu App Merchant từ web (đã đăng nhập Google) — D-014. */
  async setMyAppCredentials(p: UserPrincipal, rawPhone: string, newPassword: string) {
    const phone = normalizeVnPhone(rawPhone ?? '');
    if (!isValidVnMobile(phone)) throw validationError([{ field: 'phone', message: 'Số điện thoại di động không hợp lệ' }]);
    if (!newPassword || newPassword.length < 6) throw validationError([{ field: 'newPassword', message: 'Mật khẩu tối thiểu 6 ký tự' }]);
    const dup = await this.prisma.raw.userAccount.findFirst({ where: { phone, id: { not: p.accountId } } });
    if (dup) throw conflict('Số điện thoại đã được dùng cho tài khoản khác');
    await this.prisma.raw.userAccount.update({
      where: { id: p.accountId },
      data: { phone, passwordHash: hashPassword(newPassword), mustChangePassword: false, passwordUpdatedAt: new Date() },
    });
    await this.prisma.raw.userRefreshToken.updateMany({ where: { accountId: p.accountId, revokedAt: null }, data: { revokedAt: new Date() } });
    return this.me(p);
  }

  private async nextMerchantCode(): Promise<string> {
    const count = await this.prisma.raw.merchant.count();
    for (let i = count + 1; i < count + 1000; i++) {
      const code = `M${String(i).padStart(5, '0')}`;
      if (!(await this.prisma.raw.merchant.findUnique({ where: { code } }))) return code;
    }
    return `M${Date.now()}`;
  }
}

function toMembership(m: { id: string; merchantId: string; role: string; status: string; lastAccessAt: Date | null; merchant: { code: string; name: string } }): Membership {
  return { id: m.id, merchantId: m.merchantId, merchantCode: m.merchant.code, merchantName: m.merchant.name, role: m.role, status: m.status, lastAccessAt: m.lastAccessAt };
}
