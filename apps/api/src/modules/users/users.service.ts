import { Injectable } from '@nestjs/common';
import {
  MERCHANT_ROLE_LABEL,
  MERCHANT_ROLES,
  PERMISSION_GROUPS,
  PERMISSION_KEYS,
  PERMISSIONS,
  inviteUserSchema,
  type Grant,
  type MerchantRole,
  type Permission,
} from '@bta/shared';
import { generateTempPassword, hashPassword } from '@bta/db';
import { isValidVnMobile, normalizeVnPhone } from '../../common/otp/sms.sender';
import { AuditService, diffFields } from '../../common/audit/audit.service';
import { PermissionService } from '../../common/auth/permission.service';
import { currentMerchantId, currentPrincipal } from '../../common/context/request-context';
import { businessRule, conflict, notFound, validationError } from '../../common/errors/app-error';
import { paginate } from '../../common/graphql/pagination';
import { NotifyService } from '../../common/notifications/notify.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';
import type { InviteMerchantUserInput, MerchantUserFilter, UpdateMerchantUserInput } from './users.types';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly permissions: PermissionService,
    private readonly notify: NotifyService,
  ) {}

  private selfId() {
    const p = currentPrincipal();
    return p?.type === 'USER' ? p.membershipId : undefined;
  }

  private async view(u: any) {
    const merchantId = currentMerchantId()!;
    const inviter = u.invitedByUserId ? await this.prisma.db.merchantUser.findFirst({ where: { id: u.invitedByUserId } }) : null;
    const acc = u.accountId ? await this.prisma.raw.userAccount.findUnique({ where: { id: u.accountId } }) : null;
    const others = u.accountId ? await this.prisma.raw.merchantUser.count({ where: { accountId: u.accountId, merchantId: { not: merchantId }, status: { in: ['ACTIVE', 'INVITED'] } } }) : 0;
    return {
      ...u,
      appLogin: {
        phone: acc?.phone ?? null,
        hasPassword: !!acc?.passwordHash,
        mustChangePassword: acc?.mustChangePassword ?? false,
        lastLoginAt: acc?.lastLoginAt ?? null,
        sharedWithOtherMerchants: others > 0,
      },
      invitedByName: inviter?.name ?? null,
      effectivePermissions: await this.permissions.effectiveFor(merchantId, u.role, u.extraPermissions),
      isSelf: u.id === this.selfId(),
    };
  }

  async list(filter: MerchantUserFilter = {}, page: { first?: number; after?: string | null }) {
    const where: any = {};
    if (filter.role) where.role = filter.role;
    if (filter.status) where.status = filter.status;
    if (filter.search) where.OR = [{ name: { contains: filter.search, mode: 'insensitive' } }, { email: { contains: filter.search, mode: 'insensitive' } }];
    const conn = await paginate(this.prisma.db.merchantUser as any, { where, orderBy: [{ status: 'asc' }, { name: 'asc' }] }, page);
    return { ...conn, nodes: await Promise.all(conn.nodes.map((u) => this.view(u))) };
  }

  async get(id: string) {
    const u = await this.prisma.db.merchantUser.findFirst({ where: { id } });
    if (!u) throw notFound('nhân viên');
    return this.view(u);
  }

  private validPerms(perms: string[] | undefined) {
    const bad = (perms ?? []).filter((p) => !(PERMISSIONS as Record<string, unknown>)[p]);
    if (bad.length) throw validationError([{ field: 'extraPermissions', message: `Quyền không hợp lệ: ${bad.join(', ')}` }]);
    return perms ?? [];
  }

  async invite(input: InviteMerchantUserInput) {
    const data = parse(inviteUserSchema, input);
    const email = data.email.toLowerCase();
    const exists = await this.prisma.db.merchantUser.findFirst({ where: { email } });
    if (exists) throw conflict('Email này đã là nhân viên/đã được mời');
    const account = await this.prisma.raw.userAccount.findUnique({ where: { email } });
    const u = await this.prisma.db.merchantUser.create({
      data: {
        email,
        name: data.name,
        phone: data.phone,
        role: data.role,
        extraPermissions: this.validPerms(data.extraPermissions),
        note: data.note,
        status: 'INVITED',
        accountId: account?.id,
        invitedByUserId: this.selfId(),
      } as any,
    });
    await this.audit.log({ entityType: 'MERCHANT_USER', entityId: u.id, category: 'CREATE', action: 'user.invite', summary: `Mời ${u.name} (${u.email}) vai trò ${MERCHANT_ROLE_LABEL[u.role as MerchantRole]}` });
    return this.view(u);
  }

  async update(id: string, input: UpdateMerchantUserInput) {
    const before = await this.prisma.db.merchantUser.findFirst({ where: { id } });
    if (!before) throw notFound('nhân viên');
    if (input.role && input.role !== before.role && before.id === this.selfId()) throw businessRule('Không thể tự đổi vai trò của chính mình');
    if (input.role && !MERCHANT_ROLES.includes(input.role as MerchantRole)) throw validationError([{ field: 'role', message: 'Vai trò không hợp lệ' }]);
    if (before.role === 'ADMIN' && input.role && input.role !== 'ADMIN') await this.assertNotLastAdmin(before.id);
    const data: any = {};
    for (const k of ['name', 'phone', 'title', 'role', 'note'] as const) if (input[k] !== undefined) data[k] = input[k];
    if (input.extraPermissions) data.extraPermissions = this.validPerms(input.extraPermissions);
    const u = await this.prisma.db.merchantUser.update({ where: { id }, data });
    const d = diffFields(before as any, data);
    if (d.changed.length) {
      await this.audit.log({
        entityType: 'MERCHANT_USER', entityId: id, category: d.changed.includes('role') || d.changed.includes('extraPermissions') ? 'SENSITIVE' : 'UPDATE',
        action: 'user.update', summary: `Cập nhật nhân viên ${u.name} (${d.changed.join(', ')})`, before: d.before, after: d.after,
        sensitive: d.changed.includes('role') || d.changed.includes('extraPermissions'),
      });
    }
    return this.view(u);
  }

  private async assertNotLastAdmin(exceptId: string) {
    const admins = await this.prisma.db.merchantUser.count({ where: { role: 'ADMIN', status: 'ACTIVE', id: { not: exceptId } } });
    if (admins === 0) throw businessRule('Nhà xe cần ít nhất 1 admin đang hoạt động');
  }

  async setLocked(id: string, locked: boolean) {
    const u = await this.prisma.db.merchantUser.findFirst({ where: { id } });
    if (!u) throw notFound('nhân viên');
    if (id === this.selfId()) throw businessRule('Không thể tự khóa tài khoản của chính mình');
    if (locked && u.role === 'ADMIN') await this.assertNotLastAdmin(id);
    const status = locked ? 'LOCKED' : u.joinedAt ? 'ACTIVE' : 'INVITED';
    const updated = await this.prisma.db.merchantUser.update({ where: { id }, data: { status } });
    await this.audit.log({ entityType: 'MERCHANT_USER', entityId: id, category: 'SENSITIVE', sensitive: true, action: locked ? 'user.lock' : 'user.unlock', summary: `${locked ? 'Khóa' : 'Mở khóa'} tài khoản ${u.name}`, before: { status: u.status }, after: { status } });
    return this.view(updated);
  }

  async resendInvite(id: string) {
    const u = await this.prisma.db.merchantUser.findFirst({ where: { id } });
    if (!u) throw notFound('nhân viên');
    if (u.status !== 'INVITED') throw businessRule('Chỉ gửi lại lời mời cho tài khoản đang chờ chấp nhận');
    const updated = await this.prisma.db.merchantUser.update({ where: { id }, data: { invitedAt: new Date() } });
    await this.audit.log({ entityType: 'MERCHANT_USER', entityId: id, category: 'UPDATE', action: 'user.resendInvite', summary: `Gửi lại lời mời cho ${u.email}` });
    return this.view(updated);
  }

  /**
   * D-014: admin cấp/đặt lại mật khẩu App Merchant cho nhân viên (mật khẩu tạm, bắt đổi khi đăng nhập).
   * Tài khoản đang thuộc nhà xe khác và đã có mật khẩu → không cho (tránh chiếm tài khoản xuyên nhà xe).
   */
  async resetAppPassword(id: string, rawPhone?: string | null) {
    const u = await this.prisma.db.merchantUser.findFirst({ where: { id } });
    if (!u) throw notFound('nhân viên');
    if (u.status === 'LOCKED') throw businessRule('Tài khoản đang bị khóa');
    const phone = normalizeVnPhone(rawPhone || u.phone || '');
    if (!isValidVnMobile(phone)) throw validationError([{ field: 'phone', message: 'Nhập số điện thoại di động hợp lệ của nhân viên' }]);
    const merchantId = currentMerchantId()!;
    let acc = u.accountId ? await this.prisma.raw.userAccount.findUnique({ where: { id: u.accountId } }) : null;
    if (!acc) {
      acc = await this.prisma.raw.userAccount.upsert({ where: { email: u.email }, create: { email: u.email, name: u.name }, update: {} });
      await this.prisma.db.merchantUser.update({ where: { id }, data: { accountId: acc.id } });
    }
    const others = await this.prisma.raw.merchantUser.count({ where: { accountId: acc.id, merchantId: { not: merchantId }, status: { in: ['ACTIVE', 'INVITED'] } } });
    if (others > 0 && acc.passwordHash) throw businessRule('Tài khoản này thuộc cả nhà xe khác — nhân viên tự đặt mật khẩu app trong menu tài khoản trên web');
    const dup = await this.prisma.raw.userAccount.findFirst({ where: { phone, id: { not: acc.id } } });
    if (dup) throw conflict('Số điện thoại đã được dùng cho tài khoản khác');
    const tempPassword = generateTempPassword();
    await this.prisma.raw.userAccount.update({ where: { id: acc.id }, data: { phone, passwordHash: hashPassword(tempPassword), mustChangePassword: true, passwordUpdatedAt: new Date() } });
    await this.prisma.raw.userRefreshToken.updateMany({ where: { accountId: acc.id, revokedAt: null }, data: { revokedAt: new Date() } });
    if (u.phone !== phone) await this.prisma.db.merchantUser.update({ where: { id }, data: { phone } });
    await this.audit.log({ entityType: 'MERCHANT_USER', entityId: id, category: 'SENSITIVE', sensitive: true, action: 'user.appPassword.reset', summary: `Cấp/đặt lại mật khẩu App Merchant cho ${u.name} (${phone})` });
    return { phone, tempPassword };
  }

  async disableAppLogin(id: string) {
    const u = await this.prisma.db.merchantUser.findFirst({ where: { id } });
    if (!u) throw notFound('nhân viên');
    if (!u.accountId) return this.view(u);
    const merchantId = currentMerchantId()!;
    const others = await this.prisma.raw.merchantUser.count({ where: { accountId: u.accountId, merchantId: { not: merchantId }, status: { in: ['ACTIVE', 'INVITED'] } } });
    if (others > 0) throw businessRule('Tài khoản thuộc cả nhà xe khác — khóa nhân viên tại nhà xe này thay vì tắt đăng nhập app');
    await this.prisma.raw.userAccount.update({ where: { id: u.accountId }, data: { passwordHash: null } });
    await this.prisma.raw.userRefreshToken.updateMany({ where: { accountId: u.accountId, revokedAt: null }, data: { revokedAt: new Date() } });
    await this.audit.log({ entityType: 'MERCHANT_USER', entityId: id, category: 'SENSITIVE', sensitive: true, action: 'user.appLogin.disable', summary: `Tắt đăng nhập App Merchant của ${u.name}` });
    return this.view(u);
  }

  async roles() {
    const counts = await this.prisma.db.merchantUser.groupBy({ by: ['role'], _count: true, where: { status: { not: 'LOCKED' } } });
    return MERCHANT_ROLES.map((r) => ({ key: r, name: MERCHANT_ROLE_LABEL[r], userCount: counts.find((c: any) => c.role === r)?._count ?? 0 }));
  }

  async permissionMatrix() {
    const merchantId = currentMerchantId()!;
    const rows = await this.prisma.raw.merchantRolePermission.findMany({ where: { merchantId } });
    const users = await this.prisma.db.merchantUser.findMany({ where: { status: 'ACTIVE' }, select: { extraPermissions: true } });
    const grant = (p: Permission, role: MerchantRole): Grant =>
      (rows.find((r) => r.permission === p && r.role === role)?.grant as Grant) ?? PERMISSIONS[p].grants[MERCHANT_ROLES.indexOf(role)];
    return PERMISSION_KEYS.map((p) => ({
      action: p,
      label: PERMISSIONS[p].label,
      group: PERMISSIONS[p].group,
      groupLabel: PERMISSION_GROUPS[PERMISSIONS[p].group],
      requiresReason: (PERMISSIONS[p] as any).reason === true,
      admin: grant(p, 'ADMIN'),
      operation: grant(p, 'OPERATION'),
      accountant: grant(p, 'ACCOUNTANT'),
      grantedUserCount: users.filter((u) => u.extraPermissions.includes(p)).length,
    }));
  }

  async updateRolePermission(role: MerchantRole, permission: Permission, g: Grant) {
    if (!(PERMISSIONS as Record<string, unknown>)[permission]) throw validationError([{ field: 'permission', message: 'Quyền không hợp lệ' }]);
    if (role === 'ADMIN' && (permission === 'users.manage' || permission === 'settings.manage') && g !== 'ALLOWED') throw businessRule('Không thể gỡ quyền quản trị của Admin');
    const merchantId = currentMerchantId()!;
    const before = await this.prisma.raw.merchantRolePermission.findUnique({ where: { merchantId_role_permission: { merchantId, role, permission } } });
    await this.prisma.raw.merchantRolePermission.upsert({
      where: { merchantId_role_permission: { merchantId, role, permission } },
      create: { merchantId, role, permission, grant: g },
      update: { grant: g },
    });
    await this.audit.log({ entityType: 'SETTINGS', entityId: `rbac:${role}`, category: 'SENSITIVE', sensitive: true, action: 'rbac.update', summary: `Đổi quyền "${PERMISSIONS[permission].label}" của ${MERCHANT_ROLE_LABEL[role]}`, before: { grant: before?.grant }, after: { grant: g } });
    return (await this.permissionMatrix()).find((r) => r.action === permission)!;
  }
}
