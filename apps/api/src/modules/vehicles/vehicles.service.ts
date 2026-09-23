import { Injectable } from '@nestjs/common';
import { COST_EXPENSE_KINDS, TRIP_RUNNING_STATUSES, VEHICLE_STATUS, formatDate, labelOf, startOfVnDay, vehicleSchema, vnParts } from '@bta/shared';
import { num } from '@bta/db';
import { AuditService, diffFields } from '../../common/audit/audit.service';
import { businessRule, conflict, notFound, reasonRequired, validationError } from '../../common/errors/app-error';
import { pageParams, toConnection } from '../../common/graphql/pagination';
import { NumberingService } from '../../common/numbering/numbering.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';
import { CatalogsService } from '../catalogs/catalogs.service';
import { EXPENSE_ITEM_INCLUDE, TRIP_ITEM_INCLUDE, dateOnly, toExpenseItem, toTripItem, todayDate } from '../drivers/master-helpers';
import type { VehicleFilter, VehicleInput } from './vehicles.types';

export function normalizePlate(p: string): string {
  return p.trim().toUpperCase().replace(/\s+/g, '');
}

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
    private readonly catalogs: CatalogsService,
  ) {}

  private monthStart(): Date {
    const p = vnParts(new Date());
    return new Date(Date.UTC(p.y, p.m - 1, 1));
  }

  private async decorate(rows: any[]) {
    const ids = rows.map((r) => r.id);
    const today = todayDate();
    const [labels, costs, running, scheduled] = await Promise.all([
      this.catalogs.labels(rows.map((r) => r.typeId)),
      this.prisma.db.expense.groupBy({
        by: ['vehicleId'],
        where: { vehicleId: { in: ids }, status: 'ACTIVE', kind: { in: COST_EXPENSE_KINDS as any }, expenseDate: { gte: this.monthStart() } },
        _sum: { amount: true },
      }),
      this.prisma.db.trip.findMany({ where: { vehicleId: { in: ids }, status: { in: TRIP_RUNNING_STATUSES as any } }, include: { driver: { select: { name: true } } }, orderBy: { plannedStartAt: 'asc' } }),
      this.prisma.db.trip.findMany({ where: { vehicleId: { in: ids }, status: 'SCHEDULED', plannedStartAt: { gte: startOfVnDay() } }, include: { driver: { select: { name: true } } }, orderBy: { plannedStartAt: 'asc' } }),
    ]);
    return rows.map((r) => {
      const t = running.find((x) => x.vehicleId === r.id) ?? scheduled.find((x) => x.vehicleId === r.id);
      const warnings: string[] = [];
      const check = (d: Date | null, label: string) => {
        if (!d) return;
        const days = Math.floor((d.getTime() - today.getTime()) / 86_400_000);
        if (days < 0) warnings.push(`${label} đã hết hạn ${formatDate(d)}`);
        else if (days <= 30) warnings.push(`${label} hết hạn ${formatDate(d)} (còn ${days} ngày)`);
      };
      check(r.registrationExpiresAt, 'Đăng kiểm');
      check(r.insuranceExpiresAt, 'Bảo hiểm');
      return {
        ...r,
        type: r.typeId ? { id: r.typeId, name: labels.get(r.typeId) ?? '' } : null,
        currentTrip: t ? { id: t.id, code: t.code, status: t.status, driverName: t.driver?.name ?? null, plannedStartAt: t.plannedStartAt } : null,
        monthCost: num((costs.find((c: any) => c.vehicleId === r.id) as any)?._sum?.amount ?? 0),
        expiryWarnings: warnings,
      };
    });
  }

  async list(filter: VehicleFilter = {}, page: { first?: number; after?: string | null }, sort?: string | null) {
    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.typeId) where.typeId = filter.typeId;
    if (filter.search) {
      const q = filter.search.trim();
      where.OR = [{ plate: { contains: normalizePlate(q), mode: 'insensitive' } }, { plate: { contains: q, mode: 'insensitive' } }, { code: { contains: q, mode: 'insensitive' } }, { brandModel: { contains: q, mode: 'insensitive' } }];
    }
    const orderBy = sort === 'code' ? { code: 'asc' as const } : sort === '-createdAt' ? { createdAt: 'desc' as const } : { plate: 'asc' as const };
    const { take, skip } = pageParams(page);
    const [rows, total] = await Promise.all([
      this.prisma.db.vehicle.findMany({ where, orderBy: [{ status: 'asc' }, orderBy], take, skip }),
      this.prisma.db.vehicle.count({ where }),
    ]);
    return toConnection(await this.decorate(rows), total, skip, take);
  }

  async get(id: string) {
    const v = await this.prisma.db.vehicle.findFirst({ where: { id } });
    if (!v) throw notFound('xe');
    const [view] = await this.decorate([v]);
    const since = new Date(Date.now() - 30 * 86_400_000);
    const [trips, expenses, tripCount30d, cost30d] = await Promise.all([
      this.prisma.db.trip.findMany({ where: { vehicleId: id }, include: TRIP_ITEM_INCLUDE, orderBy: { plannedStartAt: 'desc' }, take: 10 }),
      this.prisma.db.expense.findMany({ where: { vehicleId: id }, include: EXPENSE_ITEM_INCLUDE, orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }], take: 20 }),
      this.prisma.db.trip.count({ where: { vehicleId: id, status: { not: 'CANCELLED' }, plannedStartAt: { gte: since } } }),
      this.prisma.db.expense.aggregate({ where: { vehicleId: id, status: 'ACTIVE', kind: { in: COST_EXPENSE_KINDS as any }, expenseDate: { gte: since } }, _sum: { amount: true } }),
    ]);
    const labels = await this.catalogs.labels(expenses.map((e) => e.categoryId));
    return {
      ...view,
      tripHistory: trips.map(toTripItem),
      expenses: expenses.map((e) => toExpenseItem(e, labels)),
      stats: { tripCount30d, cost30d: num(cost30d._sum.amount ?? 0) },
    };
  }

  private toData(data: ReturnType<typeof vehicleSchema.parse>) {
    return {
      plate: normalizePlate(data.plate),
      typeId: data.typeId,
      capacityTons: data.capacityTons,
      brandModel: data.brandModel,
      year: data.year,
      chassisNo: data.chassisNo,
      engineNo: data.engineNo,
      boxSize: data.boxSize,
      fuelNorm: data.fuelNorm,
      registrationExpiresAt: dateOnly(data.registrationExpiresAt),
      insuranceExpiresAt: dateOnly(data.insuranceExpiresAt),
      note: data.note,
    };
  }

  private async assertPlateFree(plate: string, exceptId?: string) {
    const dup = await this.prisma.db.vehicle.findFirst({ where: { plate, ...(exceptId ? { id: { not: exceptId } } : {}) } });
    if (dup) throw conflict(`Biển số ${plate} đã tồn tại (${dup.code})`);
  }

  async create(input: VehicleInput) {
    const data = parse(vehicleSchema, input);
    const next = this.toData(data);
    await this.assertPlateFree(next.plate);
    const v = await this.prisma.tx(async (tx) => {
      const code = await this.numbering.next('VEHICLE', tx);
      const v = await tx.vehicle.create({ data: { ...next, code, status: data.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'ACTIVE' } as any });
      await this.audit.log({ entityType: 'VEHICLE', entityId: v.id, category: 'CREATE', action: 'vehicle.create', summary: `Tạo xe ${v.plate} (${v.code})` }, tx);
      return v;
    });
    return this.get(v.id);
  }

  async update(id: string, input: VehicleInput) {
    const before = await this.prisma.db.vehicle.findFirst({ where: { id } });
    if (!before) throw notFound('xe');
    const data = parse(vehicleSchema, input);
    const next = this.toData(data);
    if (next.plate !== before.plate) await this.assertPlateFree(next.plate, id);
    await this.prisma.tx(async (tx) => {
      await tx.vehicle.update({ where: { id }, data: next as any });
      const d = diffFields(before as any, next as any);
      if (d.changed.length) await this.audit.log({ entityType: 'VEHICLE', entityId: id, category: 'UPDATE', action: 'vehicle.update', summary: `Cập nhật xe ${next.plate} (${d.changed.join(', ')})`, before: d.before, after: d.after }, tx);
    });
    return this.get(id);
  }

  /** ACTIVE ↔ MAINTENANCE ↔ INACTIVE. Ngừng sử dụng cần lý do (sensitive, WM-VEH-02). */
  async setStatus(id: string, status: string, reason?: string | null) {
    if (!(status in VEHICLE_STATUS)) throw validationError([{ field: 'status', message: 'Trạng thái xe không hợp lệ' }]);
    const v = await this.prisma.db.vehicle.findFirst({ where: { id } });
    if (!v) throw notFound('xe');
    const r = (reason ?? '').trim();
    if (status === 'INACTIVE' && r.length < 5) throw reasonRequired();
    if (status !== 'ACTIVE') {
      const running = await this.prisma.db.trip.count({ where: { vehicleId: id, status: { in: TRIP_RUNNING_STATUSES as any } } });
      if (running && status === 'INACTIVE') throw businessRule('Xe đang chạy chuyến, không thể ngừng sử dụng');
    }
    await this.prisma.tx(async (tx) => {
      await tx.vehicle.update({ where: { id }, data: { status: status as any } });
      await this.audit.log({
        entityType: 'VEHICLE', entityId: id, category: status === 'INACTIVE' ? 'SENSITIVE' : 'UPDATE', sensitive: status === 'INACTIVE',
        action: 'vehicle.status', summary: `Xe ${v.plate}: ${labelOf(VEHICLE_STATUS, v.status)} → ${labelOf(VEHICLE_STATUS, status)}`, reason: r || null,
        before: { status: v.status }, after: { status },
      }, tx);
    });
    return this.get(id);
  }

  async options(activeOnly = true) {
    const rows = await this.prisma.db.vehicle.findMany({ where: activeOnly ? { status: 'ACTIVE' } : {}, orderBy: [{ status: 'asc' }, { plate: 'asc' }] });
    const [labels, running] = await Promise.all([
      this.catalogs.labels(rows.map((r) => r.typeId)),
      this.prisma.db.trip.findMany({ where: { vehicleId: { in: rows.map((r) => r.id) }, status: { in: TRIP_RUNNING_STATUSES as any } }, select: { vehicleId: true, code: true } }),
    ]);
    return rows.map((r) => {
      const t = running.find((x) => x.vehicleId === r.id);
      return { id: r.id, code: r.code, plate: r.plate, typeName: r.typeId ? labels.get(r.typeId) ?? null : null, capacityTons: r.capacityTons, status: r.status, busy: !!t, busyTripCode: t?.code ?? null };
    });
  }
}
