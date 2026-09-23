import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { customerSchema, driverSchema, parseVnd, todayDbDate, toDbDate, vehicleSchema, type ImportEntityType, type Permission } from '@bta/shared';
import { big } from '@bta/db';
import { AuditService } from '../../common/audit/audit.service';
import { assertPermission } from '../../common/auth/sensitive';
import { currentPrincipal } from '../../common/context/request-context';
import { businessRule, notFound, validationError } from '../../common/errors/app-error';
import { NumberingService } from '../../common/numbering/numbering.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ExportsService } from '../exports/exports.service';
import type { ImportPreviewFilter, StartImportInput } from './imports.types';

interface FieldDef {
  key: string;
  label: string;
  required?: boolean;
  aliases: string[];
  kind?: 'money' | 'number' | 'date' | 'text';
}

/** Header tiếng Việt tự nhận diện (IMP-001). */
const FIELDS: Record<ImportEntityType, FieldDef[]> = {
  CUSTOMER: [
    { key: 'name', label: 'Tên khách hàng', required: true, aliases: ['tên khách hàng', 'khách hàng', 'tên', 'ten khach hang', 'name'] },
    { key: 'phone', label: 'SĐT', aliases: ['sđt', 'số điện thoại', 'điện thoại', 'sdt', 'phone'] },
    { key: 'taxCode', label: 'MST', aliases: ['mst', 'mã số thuế', 'ma so thue', 'tax code'] },
    { key: 'billingAddress', label: 'Địa chỉ', aliases: ['địa chỉ', 'dia chi', 'địa chỉ xuất hóa đơn', 'address'] },
    { key: 'email', label: 'Email', aliases: ['email', 'e-mail'] },
    { key: 'legalName', label: 'Tên pháp lý', aliases: ['tên pháp lý', 'tên công ty', 'ten phap ly'] },
    { key: 'creditLimit', label: 'Hạn mức nợ', kind: 'money', aliases: ['hạn mức nợ', 'hạn mức', 'han muc no', 'credit limit'] },
    { key: 'defaultDebtDays', label: 'Số ngày công nợ', kind: 'number', aliases: ['số ngày công nợ', 'ngày công nợ', 'so ngay cong no'] },
    { key: 'note', label: 'Ghi chú', aliases: ['ghi chú', 'ghi chu', 'note'] },
  ],
  VEHICLE: [
    { key: 'plate', label: 'Biển số', required: true, aliases: ['biển số', 'bien so', 'biển số xe', 'plate'] },
    { key: 'typeName', label: 'Loại xe', aliases: ['loại xe', 'loai xe', 'type'] },
    { key: 'capacityTons', label: 'Tải trọng', kind: 'number', aliases: ['tải trọng', 'tải trọng (tấn)', 'tai trong', 'capacity'] },
    { key: 'brandModel', label: 'Hiệu xe', aliases: ['hiệu xe', 'nhãn hiệu', 'hiệu', 'brand'] },
    { key: 'year', label: 'Năm SX', kind: 'number', aliases: ['năm sx', 'năm sản xuất', 'nam sx', 'year'] },
    { key: 'chassisNo', label: 'Số khung', aliases: ['số khung', 'so khung'] },
    { key: 'engineNo', label: 'Số máy', aliases: ['số máy', 'so may'] },
    { key: 'registrationExpiresAt', label: 'Hạn đăng kiểm', kind: 'date', aliases: ['hạn đăng kiểm', 'han dang kiem'] },
    { key: 'insuranceExpiresAt', label: 'Hạn bảo hiểm', kind: 'date', aliases: ['hạn bảo hiểm', 'han bao hiem'] },
    { key: 'note', label: 'Ghi chú', aliases: ['ghi chú', 'ghi chu'] },
  ],
  DRIVER: [
    { key: 'name', label: 'Họ tên', required: true, aliases: ['họ tên', 'họ và tên', 'tên tài xế', 'ho ten', 'name'] },
    { key: 'phone', label: 'SĐT', required: true, aliases: ['sđt', 'số điện thoại', 'điện thoại', 'sdt', 'phone'] },
    { key: 'licenseNumber', label: 'GPLX', aliases: ['gplx', 'số gplx', 'giấy phép lái xe', 'bằng lái'] },
    { key: 'licenseClass', label: 'Hạng GPLX', aliases: ['hạng gplx', 'hạng', 'hang gplx'] },
    { key: 'licenseExpiresAt', label: 'Hạn GPLX', kind: 'date', aliases: ['hạn gplx', 'han gplx'] },
    { key: 'idNumber', label: 'CCCD', aliases: ['cccd', 'cmnd', 'số cccd'] },
    { key: 'address', label: 'Địa chỉ', aliases: ['địa chỉ', 'dia chi'] },
    { key: 'fixedSalary', label: 'Lương cố định', kind: 'money', aliases: ['lương cố định', 'lương', 'luong co dinh'] },
    { key: 'note', label: 'Ghi chú', aliases: ['ghi chú', 'ghi chu'] },
  ],
};

const EDIT_PERMISSION: Record<ImportEntityType, Permission> = { CUSTOMER: 'customer.edit', VEHICLE: 'vehicle.edit', DRIVER: 'driver.edit' };

const norm = (s: string) => s.normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ');
const normPhone = (p: string) => p.replace(/[^\d+]/g, '').replace(/^\+84/, '0');
const normPlate = (p: string) => p.trim().toUpperCase().replace(/\s+/g, '');

function cellText(v: ExcelJS.CellValue): string {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'object') {
    if ('text' in v && typeof (v as any).text === 'string') return (v as any).text;
    if ('result' in v) return cellText((v as any).result);
    if ('richText' in v) return (v as any).richText.map((r: any) => r.text).join('');
  }
  return String(v).trim();
}

function toIsoDate(s: string): string | null {
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : null;
}

@Injectable()
export class ImportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
    private readonly exportsSvc: ExportsService,
  ) {}

  private assertAccess(t: ImportEntityType) {
    assertPermission('imports.run');
    assertPermission(EDIT_PERMISSION[t]);
  }

  private async readRows(fileName: string, base64: string): Promise<{ headers: string[]; rows: string[][] }> {
    const buf = Buffer.from(base64, 'base64');
    if (!buf.length) throw validationError([{ field: 'fileBase64', message: 'File rỗng' }]);
    if (buf.length > 5 * 1024 * 1024) throw validationError([{ field: 'fileBase64', message: 'File tối đa 5MB' }]);
    const wb = new ExcelJS.Workbook();
    if (fileName.toLowerCase().endsWith('.csv')) {
      const text = buf.toString('utf8').replace(/^﻿/, '');
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const split = (l: string) => l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((c) => c.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
      return { headers: split(lines[0] ?? ''), rows: lines.slice(1).map(split) };
    }
    try {
      await wb.xlsx.load(buf as any);
    } catch {
      throw validationError([{ field: 'fileBase64', message: 'Không đọc được file Excel (.xlsx)' }]);
    }
    const ws = wb.worksheets[0];
    if (!ws) throw validationError([{ field: 'fileBase64', message: 'File không có sheet dữ liệu' }]);
    const headerRow = ws.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell({ includeEmpty: true }, (c, col) => (headers[col - 1] = cellText(c.value)));
    const rows: string[][] = [];
    ws.eachRow((row, idx) => {
      if (idx === 1) return;
      const vals = headers.map((_, i) => cellText(row.getCell(i + 1).value));
      if (vals.some((v) => v !== '')) rows.push(vals);
    });
    return { headers, rows };
  }

  private mapHeaders(t: ImportEntityType, headers: string[], mapping?: Record<string, string> | null) {
    const fields = FIELDS[t];
    const colOf = new Map<string, number>();
    headers.forEach((h, i) => {
      const explicit = mapping?.[h];
      const f = explicit ? fields.find((x) => x.key === explicit) : fields.find((x) => x.aliases.includes(norm(h)) || norm(x.label) === norm(h));
      if (f && !colOf.has(f.key)) colOf.set(f.key, i);
    });
    const unmapped = headers.filter((h, i) => h && ![...colOf.values()].includes(i));
    return { colOf, unmapped, fields };
  }

  private async validate(t: ImportEntityType, raw: Record<string, string>[]) {
    const db = this.prisma.db;
    const vehicleTypes = t === 'VEHICLE' ? await db.catalogItem.findMany({ where: { type: 'VEHICLE_TYPE' } }) : [];
    const existing = new Set<string>();
    if (t === 'CUSTOMER') (await db.customer.findMany({ where: { phone: { not: null } }, select: { phone: true } })).forEach((c) => existing.add(normPhone(c.phone!)));
    if (t === 'DRIVER') (await db.driver.findMany({ select: { phone: true } })).forEach((d) => existing.add(normPhone(d.phone)));
    if (t === 'VEHICLE') (await db.vehicle.findMany({ select: { plate: true } })).forEach((v) => existing.add(normPlate(v.plate)));
    const seen = new Map<string, number>();
    return raw.map((values, i) => {
      const line = i + 2;
      const errors: string[] = [];
      const warnings: string[] = [];
      const fields = FIELDS[t];
      for (const f of fields) if (f.required && !values[f.key]) errors.push(`Thiếu "${f.label}"`);
      const conv: Record<string, unknown> = {};
      for (const f of fields) {
        const v = values[f.key] ?? '';
        if (!v) continue;
        if (f.kind === 'money') {
          const n = parseVnd(v);
          if (n === null || n < 0) errors.push(`"${f.label}" không phải số tiền hợp lệ`);
          else conv[f.key] = n;
        } else if (f.kind === 'number') {
          const n = Number(v.replace(',', '.'));
          if (!Number.isFinite(n)) errors.push(`"${f.label}" phải là số`);
          else conv[f.key] = n;
        } else if (f.kind === 'date') {
          const d = toIsoDate(v);
          if (!d) errors.push(`"${f.label}" sai định dạng ngày (dd/mm/yyyy)`);
          else conv[f.key] = d;
        } else conv[f.key] = v;
      }
      let data: Record<string, unknown> | null = null;
      let dupKey: string | null = null;
      if (t === 'CUSTOMER') {
        const r = customerSchema.safeParse({ type: conv.taxCode ? 'COMPANY' : 'COMPANY', ...conv });
        if (!r.success && !errors.length) r.error.issues.forEach((x) => errors.push(`${x.path.join('.')}: ${x.message}`));
        data = r.success ? r.data : null;
        if (conv.phone) dupKey = normPhone(String(conv.phone));
        if (!conv.phone) warnings.push('Không có số điện thoại');
      } else if (t === 'VEHICLE') {
        let typeId: string | null = null;
        if (conv.typeName) {
          typeId = vehicleTypes.find((c) => norm(c.name) === norm(String(conv.typeName)))?.id ?? null;
          if (!typeId) warnings.push(`Loại xe "${conv.typeName}" chưa có trong danh mục — bỏ trống`);
        }
        const { typeName: _t, ...rest } = conv;
        const r = vehicleSchema.safeParse({ ...rest, plate: conv.plate ? normPlate(String(conv.plate)) : conv.plate, typeId });
        if (!r.success && !errors.length) r.error.issues.forEach((x) => errors.push(`${x.path.join('.')}: ${x.message}`));
        data = r.success ? r.data : null;
        if (conv.plate) dupKey = normPlate(String(conv.plate));
      } else {
        const r = driverSchema.safeParse({ ...conv, phone: conv.phone ? normPhone(String(conv.phone)) : conv.phone });
        if (!r.success && !errors.length) r.error.issues.forEach((x) => errors.push(`${x.path.join('.')}: ${x.message}`));
        data = r.success ? r.data : null;
        if (conv.phone) dupKey = normPhone(String(conv.phone));
        if (!conv.fixedSalary) warnings.push('Chưa có lương cố định');
      }
      if (dupKey) {
        const label = t === 'VEHICLE' ? 'Biển số' : 'SĐT';
        if (existing.has(dupKey)) errors.push(`${label} ${dupKey} đã tồn tại trong hệ thống`);
        if (seen.has(dupKey)) errors.push(`${label} ${dupKey} trùng với dòng ${seen.get(dupKey)}`);
        else seen.set(dupKey, line);
      }
      return { line, values, errors, warnings, data: errors.length ? null : data };
    });
  }

  private view(job: any) {
    const rows = (job.rows as any[]).map(({ data: _d, ...r }) => r);
    const meta = (job.mapping ?? {}) as { fields?: any[]; unmapped?: string[] };
    const result = (job.result ?? {}) as { created?: number; skipped?: number };
    return {
      ...job, rows, fields: meta.fields ?? [], unmappedColumns: meta.unmapped ?? [], createdCount: result.created ?? null, skippedCount: result.skipped ?? null,
    };
  }

  async start(input: StartImportInput) {
    const t = input.entityType as ImportEntityType;
    if (!FIELDS[t]) throw validationError([{ field: 'entityType', message: 'Chỉ import khách hàng, xe, tài xế' }]);
    this.assertAccess(t);
    const { headers, rows } = await this.readRows(input.fileName, input.fileBase64);
    const { colOf, unmapped, fields } = this.mapHeaders(t, headers, input.mapping);
    const missing = fields.filter((f) => f.required && !colOf.has(f.key));
    if (missing.length) throw validationError(missing.map((f) => ({ field: f.key, message: `Không tìm thấy cột "${f.label}" trong file` })));
    if (!rows.length) throw businessRule('File không có dòng dữ liệu');
    if (rows.length > 2000) throw businessRule('Tối đa 2000 dòng mỗi lần import');
    const raw = rows.map((r) => Object.fromEntries([...colOf.entries()].map(([k, i]) => [k, (r[i] ?? '').trim()])));
    const checked = await this.validate(t, raw);
    const p = currentPrincipal();
    const job = await this.prisma.db.importJob.create({
      data: {
        entityType: t, fileName: input.fileName, status: 'PREVIEW', totalRows: checked.length,
        validRows: checked.filter((r) => !r.errors.length).length, warningRows: checked.filter((r) => !r.errors.length && r.warnings.length).length,
        errorRows: checked.filter((r) => r.errors.length).length, rows: checked as any,
        mapping: { fields: fields.map((f) => ({ key: f.key, label: f.label, required: !!f.required, sourceColumn: colOf.has(f.key) ? headers[colOf.get(f.key)!] : null })), unmapped } as any,
        createdByUserId: p?.type === 'USER' ? p.membershipId : null,
      } as any,
    });
    return this.view(job);
  }

  async preview(id: string, filter: ImportPreviewFilter = {}) {
    const job = await this.prisma.db.importJob.findFirst({ where: { id } });
    if (!job) throw notFound('phiên import');
    this.assertAccess(job.entityType as ImportEntityType);
    const v = this.view(job);
    if (filter.onlyErrors) v.rows = v.rows.filter((r: any) => r.errors.length);
    if (filter.onlyWarnings) v.rows = v.rows.filter((r: any) => r.warnings.length);
    return v;
  }

  async commit(id: string, skipErrors: boolean) {
    const job = await this.prisma.db.importJob.findFirst({ where: { id } });
    if (!job) throw notFound('phiên import');
    const t = job.entityType as ImportEntityType;
    this.assertAccess(t);
    if (job.status !== 'PREVIEW') throw businessRule('Phiên import đã được xác nhận hoặc hủy');
    const rows = job.rows as any[];
    if (rows.some((r) => r.errors.length) && !skipErrors) throw businessRule('Còn dòng lỗi — sửa file hoặc chọn bỏ qua dòng lỗi');
    // Kiểm tra lại trùng lặp tại thời điểm commit (dữ liệu có thể đã đổi sau preview)
    const recheck = await this.validate(t, rows.map((r) => r.values));
    let created = 0;
    const out = [...rows];
    await this.prisma.tx(async (tx) => {
      for (let i = 0; i < rows.length; i++) {
        const r = recheck[i];
        if (r.errors.length || !r.data) {
          out[i] = { ...rows[i], errors: r.errors.length ? r.errors : rows[i].errors };
          continue;
        }
        const d = r.data as any;
        let code = '';
        if (t === 'CUSTOMER') {
          code = await this.numbering.next('CUSTOMER', tx);
          const c = await tx.customer.create({ data: { ...d, code, creditLimit: d.creditLimit === undefined || d.creditLimit === null ? null : big(d.creditLimit), status: 'ACTIVE' } as any });
          await this.audit.log({ entityType: 'CUSTOMER', entityId: c.id, category: 'CREATE', action: 'customer.import', summary: `Import khách hàng ${code} · ${c.name} (file ${job.fileName})` }, tx);
        } else if (t === 'VEHICLE') {
          code = await this.numbering.next('VEHICLE', tx);
          const v = await tx.vehicle.create({
            data: { ...d, code, registrationExpiresAt: d.registrationExpiresAt ? toDbDate(d.registrationExpiresAt) : null, insuranceExpiresAt: d.insuranceExpiresAt ? toDbDate(d.insuranceExpiresAt) : null, status: 'ACTIVE' } as any,
          });
          await this.audit.log({ entityType: 'VEHICLE', entityId: v.id, category: 'CREATE', action: 'vehicle.import', summary: `Import xe ${v.plate} (file ${job.fileName})` }, tx);
        } else {
          code = await this.numbering.next('DRIVER', tx);
          const { fixedSalary, salaryEffectiveFrom: _s, salaryReason: _r, appLoginEnabled: _a, ...rest } = d;
          const drv = await tx.driver.create({
            data: { ...rest, code, dob: rest.dob ? toDbDate(rest.dob) : null, licenseExpiresAt: rest.licenseExpiresAt ? toDbDate(rest.licenseExpiresAt) : null, status: 'ACTIVE' } as any,
          });
          if (fixedSalary) await tx.driverSalaryHistory.create({ data: { driverId: drv.id, amount: big(fixedSalary), effectiveFrom: todayDbDate(), reason: 'Import Excel' } as any });
          await this.audit.log({ entityType: 'DRIVER', entityId: drv.id, category: 'CREATE', action: 'driver.import', summary: `Import tài xế ${code} · ${drv.name} (file ${job.fileName})` }, tx);
        }
        out[i] = { ...rows[i], createdCode: code };
        created++;
      }
      await tx.importJob.update({ where: { id }, data: { status: 'COMMITTED', committedAt: new Date(), rows: out as any, result: { created, skipped: rows.length - created } as any } });
    }, { timeout: 120_000 });
    return this.preview(id);
  }

  async cancel(id: string) {
    const job = await this.prisma.db.importJob.findFirst({ where: { id } });
    if (!job) throw notFound('phiên import');
    this.assertAccess(job.entityType as ImportEntityType);
    if (job.status !== 'PREVIEW') throw businessRule('Phiên import không còn ở bước xem trước');
    return this.view(await this.prisma.db.importJob.update({ where: { id }, data: { status: 'CANCELLED' } }));
  }

  async template(entityType: string) {
    const t = entityType as ImportEntityType;
    if (!FIELDS[t]) throw validationError([{ field: 'entityType', message: 'Chỉ import khách hàng, xe, tài xế' }]);
    this.assertAccess(t);
    const sample: Record<ImportEntityType, Record<string, unknown>> = {
      CUSTOMER: { name: 'Công ty TNHH Mẫu', phone: '0901234567', taxCode: '0312345678', billingAddress: '12 Nguyễn Huệ, Q1, TP.HCM', creditLimit: 50000000, defaultDebtDays: 15 },
      VEHICLE: { plate: '51C-123.45', typeName: 'Tải thùng', capacityTons: 8, brandModel: 'Hino FC', year: 2021, registrationExpiresAt: '31/12/2027' },
      DRIVER: { name: 'Nguyễn Văn A', phone: '0901234567', licenseNumber: '790123456789', licenseClass: 'C', fixedSalary: 10000000 },
    };
    const cols = FIELDS[t].map((f) => ({ header: f.label, key: f.key, money: f.kind === 'money' }));
    const buffer = await this.exportsSvc.workbook(`Mẫu import`, cols, [sample[t]]);
    const fileName = `mau-import-${t.toLowerCase()}.xlsx`;
    return { fileName, url: await this.exportsSvc.store(fileName, buffer, 'IMPORT_TEMPLATE') };
  }
}
