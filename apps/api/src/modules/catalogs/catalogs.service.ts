import { Injectable } from '@nestjs/common';
import { CATALOG_TYPE, catalogItemSchema, type CatalogType } from '@bta/shared';
import { AuditService, diffFields } from '../../common/audit/audit.service';
import { conflict, notFound } from '../../common/errors/app-error';
import { PrismaService } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';
import type { CatalogItemInput } from './catalogs.types';

/** Bảng + cột tham chiếu catalog để đếm usageCount. */
const USAGE: Record<CatalogType, { model: string; field: string }[]> = {
  EXPENSE_CATEGORY: [{ model: 'expense', field: 'categoryId' }],
  ADDON_SERVICE: [{ model: 'orderAddon', field: 'serviceId' }],
  CARGO_TYPE: [{ model: 'cargoLine', field: 'cargoTypeId' }],
  PACKAGING_UNIT: [{ model: 'cargoLine', field: 'packagingUnitId' }],
  PAUSE_REASON: [{ model: 'trip', field: 'pausedReasonId' }],
  DEDUCTION_REASON: [{ model: 'payrollLineItem', field: 'reasonId' }],
  DOCUMENT_TYPE: [],
  INCIDENT_TYPE: [{ model: 'incident', field: 'typeId' }],
  VEHICLE_TYPE: [{ model: 'vehicle', field: 'typeId' }, { model: 'order', field: 'requiredVehicleTypeId' }],
  SUPPLIER_TYPE: [{ model: 'supplier', field: 'typeId' }],
  CUSTOMER_GROUP: [{ model: 'customer', field: 'groupId' }],
};

function slug(name: string) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'D')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);
}

@Injectable()
export class CatalogsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  private async usage(type: CatalogType, id: string): Promise<number> {
    let total = 0;
    for (const u of USAGE[type]) total += await (this.prisma.db as any)[u.model].count({ where: { [u.field]: id } });
    return total;
  }

  async list(type?: CatalogType | null, includeInactive = true) {
    const items = await this.prisma.db.catalogItem.findMany({
      where: { ...(type ? { type } : {}), ...(includeInactive ? {} : { active: true }) },
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });
    return Promise.all(items.map(async (i) => ({ ...i, usageCount: await this.usage(i.type as CatalogType, i.id) })));
  }

  async create(input: CatalogItemInput) {
    const data = parse(catalogItemSchema, input);
    const code = data.code?.trim() || slug(data.name) || `ITEM_${Date.now()}`;
    const exists = await this.prisma.db.catalogItem.findFirst({ where: { type: data.type, code } });
    if (exists) throw conflict(`Mã "${code}" đã tồn tại trong danh mục`);
    const max = await this.prisma.db.catalogItem.aggregate({ where: { type: data.type }, _max: { sortOrder: true } });
    const item = await this.prisma.db.catalogItem.create({
      data: { type: data.type, code, name: data.name, appliesTo: data.appliesTo, sortOrder: data.sortOrder ?? (max._max.sortOrder ?? 0) + 1, active: data.active ?? true } as any,
    });
    await this.audit.log({ entityType: 'CATALOG_ITEM', entityId: item.id, category: 'CREATE', action: 'catalog.create', summary: `Thêm "${item.name}" vào ${CATALOG_TYPE[item.type as CatalogType]}` });
    return { ...item, usageCount: 0 };
  }

  async update(id: string, input: Partial<CatalogItemInput>) {
    const before = await this.prisma.db.catalogItem.findFirst({ where: { id } });
    if (!before) throw notFound('mục danh mục');
    const data = parse(catalogItemSchema.partial(), input);
    delete (data as any).type;
    if (before.isDefault) delete (data as any).code;
    const item = await this.prisma.db.catalogItem.update({ where: { id }, data: data as any });
    const d = diffFields(before as any, data as any);
    if (d.changed.length) await this.audit.log({ entityType: 'CATALOG_ITEM', entityId: id, category: 'UPDATE', action: 'catalog.update', summary: `Sửa danh mục "${item.name}"`, before: d.before, after: d.after });
    return { ...item, usageCount: await this.usage(item.type as CatalogType, item.id) };
  }

  /** Mục đã dùng chỉ ngừng, không xóa (WM-CAT-01). */
  async setActive(id: string, active: boolean) {
    return this.update(id, { active });
  }

  async reorder(type: CatalogType, ids: string[]) {
    await this.prisma.tx(async (tx) => {
      for (let i = 0; i < ids.length; i++) await tx.catalogItem.updateMany({ where: { id: ids[i], type }, data: { sortOrder: i } });
    });
    return this.list(type);
  }

  /** Lấy label theo id (dữ liệu cũ vẫn hiển thị label dù item đã ngừng). */
  async labels(ids: (string | null | undefined)[]): Promise<Map<string, string>> {
    const clean = [...new Set(ids.filter(Boolean) as string[])];
    if (!clean.length) return new Map();
    const items = await this.prisma.db.catalogItem.findMany({ where: { id: { in: clean } } });
    return new Map(items.map((i) => [i.id, i.name]));
  }
}
