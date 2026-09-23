import { Injectable } from '@nestjs/common';
import { TRIP_RUNNING_STATUSES, driverSchema, formatVnd, salaryHistorySchema, startOfVnDay } from '@bta/shared';
import { big, generateTempPassword, hashPassword, num } from '@bta/db';
import { AuditService, diffFields } from '../../common/audit/audit.service';
import { assertPermission } from '../../common/auth/sensitive';
import { currentPrincipal } from '../../common/context/request-context';
import { conflict, notFound, reasonRequired, validationError } from '../../common/errors/app-error';
import { FinanceCalcService } from '../../common/finance/finance-calc.service';
import { pageParams, toConnection } from '../../common/graphql/pagination';
import { NumberingService } from '../../common/numbering/numbering.service';
import { PrismaService, type DbClient } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';
import { TRIP_ITEM_INCLUDE, dateOnly, toTripItem, todayDate } from './master-helpers';
import type { DriverFilter, DriverInput, SalaryHistoryInput } from './drivers.types';

export function normalizePhone(p: string): string {
  return p.trim().replace(/[^\d+]/g, '').replace(/^\+84/, '0').replace(/^84(\d{9})$/, '0$1');
}

const OPEN_TRIP_STATUSES = ['SCHEDULED', ...TRIP_RUNNING_STATUSES] as any[];

@Injectable()
export class DriversService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
    private readonly finance: FinanceCalcService,
  ) {}

  /** Trip đang chạy; nếu không có thì chuyến đã lên lịch gần nhất từ đầu hôm nay. */
  private async currentTrips(driverIds: string[]) {
    const map = new Map<string, any>();
    if (!driverIds.length) return map;
    const running = await this.prisma.db.trip.findMany({
      where: { driverId: { in: driverIds }, status: { in: TRIP_RUNNING_STATUSES as any } },
      include: TRIP_ITEM_INCLUDE,
      orderBy: { plannedStartAt: 'asc' },
    });
    for (const t of running) if (!map.has(t.driverId!)) map.set(t.driverId!, t);
    const rest = driverIds.filter((id) => !map.has(id));
    if (rest.length) {
      const scheduled = await this.prisma.db.trip.findMany({
        where: { driverId: { in: rest }, status: 'SCHEDULED', plannedStartAt: { gte: startOfVnDay() } },
        include: TRIP_ITEM_INCLUDE,
        orderBy: { plannedStartAt: 'asc' },
      });
      for (const t of scheduled) if (!map.has(t.driverId!)) map.set(t.driverId!, t);
    }
    return map;
  }

  private async decorate(rows: any[]) {
    const ids = rows.map((r) => r.id);
    const today = todayDate();
    const [trips, ledgers, salaries, accounts, openTrips] = await Promise.all([
      this.currentTrips(ids),
      this.finance.driverLedgers(ids),
      this.prisma.db.driverSalaryHistory.findMany({ where: { driverId: { in: ids }, effectiveFrom: { lte: today } }, orderBy: { effectiveFrom: 'desc' } }),
      this.prisma.raw.driverAccount.findMany({ where: { driverId: { in: ids } } }),
      this.prisma.db.trip.groupBy({ by: ['driverId'], where: { driverId: { in: ids }, status: { in: OPEN_TRIP_STATUSES } }, _count: true }),
    ]);
    return rows.map((r) => {
      const t = trips.get(r.id);
      const l = ledgers.get(r.id)!;
      const s = salaries.find((x) => x.driverId === r.id);
      const acc = accounts.find((a) => a.driverId === r.id);
      const open = (openTrips.find((o: any) => o.driverId === r.id) as any)?._count ?? 0;
      const warnings: string[] = [];
      if (l.overAmount || l.overDays) warnings.push(`Đang giữ COD ${formatVnd(l.codHeld)}${l.overDays ? ` (${l.daysHeld} ngày)` : ''}`);
      if (r.status === 'INACTIVE' && open) warnings.push(`Còn ${open} chuyến chưa hoàn thành`);
      if (r.licenseExpiresAt && r.licenseExpiresAt.getTime() - today.getTime() <= 30 * 86_400_000) warnings.push('Bằng lái sắp/đã hết hạn');
      return {
        ...r,
        currentTrip: t ? { id: t.id, code: t.code, status: t.status, vehiclePlate: t.vehicle?.plate ?? null, routeSummary: t.routeSummary, plannedStartAt: t.plannedStartAt } : null,
        appAccount: acc
          ? { status: acc.status, lastLoginAt: acc.lastLoginAt, mustChangePassword: acc.mustChangePassword, deviceInfo: acc.deviceInfo }
          : { status: 'NONE', lastLoginAt: null, mustChangePassword: false, deviceInfo: null },
        fixedSalary: s ? num(s.amount) : null,
        ledgerSummary: { codHeld: l.codHeld, companyOwesDriver: l.companyOwesDriver, driverOwesCompany: l.driverOwesCompany, netBalance: l.netBalance, overAmount: l.overAmount, overDays: l.overDays, daysHeld: l.daysHeld },
        warnings,
      };
    });
  }

  async list(filter: DriverFilter = {}, page: { first?: number; after?: string | null }, sort?: string | null) {
    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.hasApp === true) where.account = { is: { status: { not: 'DISABLED' } } };
    if (filter.hasApp === false) where.OR = [{ account: { is: null } }, { account: { is: { status: 'DISABLED' } } }];
    if (filter.search) {
      const q = filter.search.trim();
      where.AND = [{ OR: [{ name: { contains: q, mode: 'insensitive' } }, { code: { contains: q, mode: 'insensitive' } }, { phone: { contains: normalizePhone(q) || q } }] }];
    }
    const orderBy = sort === 'code' ? { code: 'asc' as const } : sort === '-createdAt' ? { createdAt: 'desc' as const } : { name: 'asc' as const };
    const { take, skip } = pageParams(page);
    if (filter.codWarning) {
      const all = await this.decorate(await this.prisma.db.driver.findMany({ where, orderBy: [{ status: 'asc' }, orderBy] }));
      const f = all.filter((d) => d.ledgerSummary.overAmount || d.ledgerSummary.overDays);
      return toConnection(f.slice(skip, skip + take), f.length, skip, take);
    }
    const [rows, total] = await Promise.all([
      this.prisma.db.driver.findMany({ where, orderBy: [{ status: 'asc' }, orderBy], take, skip }),
      this.prisma.db.driver.count({ where }),
    ]);
    return toConnection(await this.decorate(rows), total, skip, take);
  }

  async salaryHistory(driverId: string) {
    const rows = await this.prisma.db.driverSalaryHistory.findMany({ where: { driverId }, orderBy: { effectiveFrom: 'asc' } });
    const userIds = [...new Set(rows.map((r) => r.createdByUserId).filter(Boolean) as string[])];
    const users = userIds.length ? await this.prisma.db.merchantUser.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } }) : [];
    const today = todayDate().getTime();
    let currentId: string | null = null;
    for (const r of rows) if (r.effectiveFrom.getTime() <= today) currentId = r.id;
    return rows
      .map((r, i) => {
        const next = rows[i + 1];
        return {
          id: r.id,
          amount: num(r.amount),
          effectiveFrom: r.effectiveFrom,
          effectiveTo: next ? new Date(next.effectiveFrom.getTime() - 86_400_000) : null,
          delta: i > 0 ? num(r.amount) - num(rows[i - 1].amount) : null,
          reason: r.reason,
          createdByName: users.find((u) => u.id === r.createdByUserId)?.name ?? null,
          createdAt: r.createdAt,
          isCurrent: r.id === currentId,
        };
      })
      .reverse();
  }

  async get(id: string) {
    const d = await this.prisma.db.driver.findFirst({ where: { id } });
    if (!d) throw notFound('tài xế');
    const [view] = await this.decorate([d]);
    const [salaryHistory, trips] = await Promise.all([
      this.salaryHistory(id),
      this.prisma.db.trip.findMany({ where: { driverId: id }, include: TRIP_ITEM_INCLUDE, orderBy: { plannedStartAt: 'desc' }, take: 5 }),
    ]);
    return { ...view, salaryHistory, recentTrips: trips.map(toTripItem) };
  }

  private profileData(data: ReturnType<typeof driverSchema.parse>) {
    return {
      name: data.name,
      phone: normalizePhone(data.phone),
      dob: dateOnly(data.dob),
      idNumber: data.idNumber,
      address: data.address,
      emergencyContact: data.emergencyContact,
      licenseClass: data.licenseClass,
      licenseNumber: data.licenseNumber,
      licenseExpiresAt: dateOnly(data.licenseExpiresAt),
      note: data.note,
    };
  }

  private async assertPhoneFree(phone: string, exceptId?: string) {
    const dup = await this.prisma.db.driver.findFirst({ where: { phone, ...(exceptId ? { id: { not: exceptId } } : {}) } });
    if (dup) throw conflict(`Số điện thoại ${phone} đã thuộc tài xế ${dup.code} · ${dup.name}`);
  }

  async create(input: DriverInput) {
    const data = parse(driverSchema, input);
    const profile = this.profileData(data);
    await this.assertPhoneFree(profile.phone);
    let tempPassword: string | null = null;
    const created = await this.prisma.tx(async (tx) => {
      const code = await this.numbering.next('DRIVER', tx);
      const d = await tx.driver.create({ data: { ...profile, code, status: data.status ?? 'ACTIVE' } as any });
      if (data.fixedSalary !== undefined && data.fixedSalary !== null) {
        await tx.driverSalaryHistory.create({
          data: { driverId: d.id, amount: big(data.fixedSalary), effectiveFrom: dateOnly(data.salaryEffectiveFrom) ?? todayDate(), reason: data.salaryReason ?? 'Lương khởi điểm', createdByUserId: this.actorUserId() } as any,
        });
      }
      if (data.appLoginEnabled) {
        tempPassword = generateTempPassword();
        await tx.driverAccount.create({ data: { driverId: d.id, passwordHash: hashPassword(tempPassword), status: 'MUST_CHANGE_PASSWORD', mustChangePassword: true } as any });
      }
      await this.audit.log({
        entityType: 'DRIVER', entityId: d.id, category: 'CREATE', action: 'driver.create',
        summary: `Tạo tài xế ${d.code} · ${d.name}${data.fixedSalary ? ` · lương cố định ${formatVnd(data.fixedSalary)}` : ''}${data.appLoginEnabled ? ' · cấp tài khoản app' : ''}`,
      }, tx);
      return d;
    });
    return { ...(await this.get(created.id)), issuedTempPassword: tempPassword };
  }

  private actorUserId(): string | null {
    // membershipId của nhân viên đang thao tác (dùng cho createdByUserId)
    const p = currentPrincipal();
    return p?.type === 'USER' ? p.membershipId ?? null : null;
  }

  async update(id: string, input: DriverInput) {
    const before = await this.prisma.db.driver.findFirst({ where: { id } });
    if (!before) throw notFound('tài xế');
    const data = parse(driverSchema, input);
    const next = this.profileData(data);
    if (next.phone !== before.phone) await this.assertPhoneFree(next.phone, id);
    await this.prisma.tx(async (tx) => {
      await tx.driver.update({ where: { id }, data: next as any });
      const d = diffFields(before as any, next as any);
      if (d.changed.length) {
        await this.audit.log({ entityType: 'DRIVER', entityId: id, category: 'UPDATE', action: 'driver.update', summary: `Cập nhật tài xế (${d.changed.join(', ')})`, before: d.before, after: d.after }, tx);
      }
    });
    return this.get(id);
  }

  async deactivate(id: string, reason: string | null | undefined) {
    const d = await this.prisma.db.driver.findFirst({ where: { id } });
    if (!d) throw notFound('tài xế');
    const r = (reason ?? '').trim();
    if (r.length < 5) throw reasonRequired();
    const open = await this.prisma.db.trip.count({ where: { driverId: id, status: { in: OPEN_TRIP_STATUSES } } });
    await this.prisma.tx(async (tx) => {
      await tx.driver.update({ where: { id }, data: { status: 'INACTIVE' } });
      await tx.driverAccount.updateMany({ where: { driverId: id }, data: { status: 'DISABLED' } });
      await this.revokeTokens(id, tx);
      await this.audit.log({
        entityType: 'DRIVER', entityId: id, category: 'SENSITIVE', sensitive: true, action: 'driver.deactivate',
        summary: `Ngừng hoạt động tài xế ${d.name}${open ? ` (còn ${open} chuyến chưa hoàn thành)` : ''}`, reason: r,
        before: { status: d.status }, after: { status: 'INACTIVE' },
      }, tx);
    });
    return this.get(id);
  }

  async activate(id: string) {
    const d = await this.prisma.db.driver.findFirst({ where: { id } });
    if (!d) throw notFound('tài xế');
    await this.prisma.tx(async (tx) => {
      await tx.driver.update({ where: { id }, data: { status: 'ACTIVE' } });
      await this.audit.log({ entityType: 'DRIVER', entityId: id, category: 'UPDATE', action: 'driver.activate', summary: `Kích hoạt lại tài xế ${d.name}`, before: { status: d.status }, after: { status: 'ACTIVE' } }, tx);
    });
    return this.get(id);
  }

  async addSalary(driverId: string, input: SalaryHistoryInput) {
    const d = await this.prisma.db.driver.findFirst({ where: { id: driverId } });
    if (!d) throw notFound('tài xế');
    const data = parse(salaryHistorySchema, input);
    const effectiveFrom = dateOnly(data.effectiveFrom)!;
    const dup = await this.prisma.db.driverSalaryHistory.findFirst({ where: { driverId, effectiveFrom } });
    if (dup) throw validationError([{ field: 'effectiveFrom', message: 'Đã có mốc lương cùng ngày hiệu lực' }]);
    const prev = await this.prisma.db.driverSalaryHistory.findFirst({ where: { driverId, effectiveFrom: { lt: effectiveFrom } }, orderBy: { effectiveFrom: 'desc' } });
    await this.prisma.tx(async (tx) => {
      const row = await tx.driverSalaryHistory.create({ data: { driverId, amount: big(data.amount), effectiveFrom, reason: data.reason, createdByUserId: this.actorUserId() } as any });
      await this.audit.log({
        entityType: 'DRIVER', entityId: driverId, category: 'MONEY', action: 'driver.salary.add',
        summary: `Thêm mốc lương ${formatVnd(data.amount)} từ ${data.effectiveFrom.split('-').reverse().join('/')}`,
        reason: data.reason, before: prev ? { amount: num(prev.amount) } : null, after: { amount: data.amount, effectiveFrom: data.effectiveFrom }, metadata: { salaryHistoryId: row.id },
      }, tx);
    });
    return this.salaryHistory(driverId);
  }

  private async revokeTokens(driverId: string, db: DbClient) {
    const acc = await (db as any).driverAccount.findFirst({ where: { driverId } });
    if (acc) await this.prisma.raw.driverRefreshToken.updateMany({ where: { accountId: acc.id, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async createOrResetAccount(driverId: string) {
    assertPermission('driver.account.manage');
    const d = await this.prisma.db.driver.findFirst({ where: { id: driverId }, include: { account: true } });
    if (!d) throw notFound('tài xế');
    if (d.status !== 'ACTIVE') throw validationError([{ field: 'status', message: 'Tài xế đang ngừng hoạt động' }]);
    const tempPassword = generateTempPassword();
    await this.prisma.tx(async (tx) => {
      if (d.account) {
        await tx.driverAccount.update({ where: { id: d.account.id }, data: { passwordHash: hashPassword(tempPassword), status: 'MUST_CHANGE_PASSWORD', mustChangePassword: true } });
        await this.revokeTokens(driverId, tx);
      } else {
        await tx.driverAccount.create({ data: { driverId, passwordHash: hashPassword(tempPassword), status: 'MUST_CHANGE_PASSWORD', mustChangePassword: true } as any });
      }
      await this.audit.log({
        entityType: 'DRIVER', entityId: driverId, category: 'SENSITIVE', sensitive: true, action: d.account ? 'driver.account.reset' : 'driver.account.create',
        summary: `${d.account ? 'Đặt lại mật khẩu' : 'Cấp tài khoản'} app tài xế cho ${d.name}`,
      }, tx);
    });
    return { phone: d.phone, tempPassword, status: 'MUST_CHANGE_PASSWORD' };
  }

  async disableAccount(driverId: string) {
    assertPermission('driver.account.manage');
    const d = await this.prisma.db.driver.findFirst({ where: { id: driverId }, include: { account: true } });
    if (!d) throw notFound('tài xế');
    if (!d.account) throw notFound('tài khoản app');
    await this.prisma.tx(async (tx) => {
      await tx.driverAccount.update({ where: { id: d.account!.id }, data: { status: 'DISABLED' } });
      await this.revokeTokens(driverId, tx);
      await this.audit.log({ entityType: 'DRIVER', entityId: driverId, category: 'SENSITIVE', sensitive: true, action: 'driver.account.disable', summary: `Khóa tài khoản app của ${d.name}`, before: { status: d.account!.status }, after: { status: 'DISABLED' } }, tx);
    });
    return this.get(driverId);
  }

  async options(activeOnly = true) {
    const rows = await this.prisma.db.driver.findMany({ where: activeOnly ? { status: 'ACTIVE' } : {}, orderBy: [{ status: 'asc' }, { name: 'asc' }] });
    const running = await this.prisma.db.trip.findMany({ where: { driverId: { in: rows.map((r) => r.id) }, status: { in: TRIP_RUNNING_STATUSES as any } }, select: { driverId: true, code: true } });
    return rows.map((r) => {
      const t = running.find((x) => x.driverId === r.id);
      return { id: r.id, code: r.code, name: r.name, phone: r.phone, status: r.status, busy: !!t, busyTripCode: t?.code ?? null };
    });
  }
}
