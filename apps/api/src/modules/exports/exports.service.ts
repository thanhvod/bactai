import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import ExcelJS from 'exceljs';
import {
  ACTIVE_STATUS,
  EXPENSE_KIND,
  EXPENSE_PAID_BY,
  ORDER_STATUS,
  PAID_STATUS,
  PAYMENT_IN_TYPE,
  PAYMENT_METHOD,
  PAYROLL_STATUS,
  VEHICLE_STATUS,
  DOC_STATUS,
  isoDate,
  labelOf,
  toDbDate,
  type Permission,
} from '@bta/shared';
import { num } from '@bta/db';
import { assertPermission } from '../../common/auth/sensitive';
import { currentMerchantId } from '../../common/context/request-context';
import { validationError } from '../../common/errors/app-error';
import { FinanceCalcService } from '../../common/finance/finance-calc.service';
import { JobRunner } from '../../common/jobs/job-runner';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';
import { CatalogsService } from '../catalogs/catalogs.service';
import { ReportsService, resolveRange } from '../reports/reports.service';
import type { ExportFileInput } from './exports.types';

export const EXPORT_TEMPLATES = ['ORDERS', 'CUSTOMER_DEBT', 'PAYROLL', 'COD_HELD', 'EXPENSES', 'PAYMENTS', 'CUSTOMERS', 'VEHICLES', 'DRIVERS', 'SUPPLIERS', 'REPORT_PROFIT'] as const;
export type ExportTemplate = (typeof EXPORT_TEMPLATES)[number];

const PERMISSION: Record<ExportTemplate, Permission> = {
  ORDERS: 'order.view',
  CUSTOMER_DEBT: 'debt.view',
  PAYROLL: 'payroll.export',
  COD_HELD: 'driverLedger.view',
  EXPENSES: 'finance.view',
  PAYMENTS: 'finance.view',
  CUSTOMERS: 'customer.view',
  VEHICLES: 'vehicle.view',
  DRIVERS: 'driver.view',
  SUPPLIERS: 'supplier.view',
  REPORT_PROFIT: 'report.export',
};

type Col = { header: string; key: string; width?: number; money?: boolean; date?: boolean };

const FILE_NAME: Record<ExportTemplate, string> = {
  ORDERS: 'don-hang', CUSTOMER_DEBT: 'cong-no-khach', PAYROLL: 'bang-luong', COD_HELD: 'cod-tai-xe', EXPENSES: 'phieu-chi', PAYMENTS: 'phieu-thu',
  CUSTOMERS: 'khach-hang', VEHICLES: 'xe', DRIVERS: 'tai-xe', SUPPLIERS: 'nha-cung-cap', REPORT_PROFIT: 'bao-cao-lai-lo',
};

/** Export Excel (EXP-001) — tenant-safe (prisma.db), số tiền là number định dạng #,##0. */
@Injectable()
export class ExportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly finance: FinanceCalcService,
    private readonly reports: ReportsService,
    private readonly catalogs: CatalogsService,
    private readonly jobs: JobRunner,
  ) {}

  async export(input: ExportFileInput) {
    const template = input.template as ExportTemplate;
    if (!EXPORT_TEMPLATES.includes(template)) throw validationError([{ field: 'template', message: 'Mẫu xuất không hợp lệ' }]);
    assertPermission(PERMISSION[template]);
    const f = input.filter ?? {};
    return this.jobs.run(`export.${template}`, async () => {
      const { title, columns, rows } = await this.build(template, f);
      const buffer = await this.workbook(title, columns, rows);
      const fileName = `${FILE_NAME[template]}-${isoDate(new Date())}.xlsx`;
      const url = await this.store(fileName, buffer, template);
      return { template, fileName, url, rowCount: rows.length };
    });
  }

  async store(fileName: string, buffer: Buffer, scope: string) {
    const key = this.storage.buildKey(currentMerchantId(), 'EXPORT', scope, randomUUID().replace(/-/g, ''), fileName);
    await this.storage.adapter.putObject(key, buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return this.storage.adapter.presignGet(key, fileName, false);
  }

  async workbook(title: string, columns: Col[], rows: Record<string, unknown>[]): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'BTA';
    const ws = wb.addWorksheet(title.slice(0, 31));
    ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width ?? (c.money ? 16 : c.date ? 12 : 20) }));
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F4F7' } };
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    for (const r of rows) ws.addRow(r);
    columns.forEach((c, i) => {
      const col = ws.getColumn(i + 1);
      if (c.money) {
        col.numFmt = '#,##0';
        col.alignment = { horizontal: 'right' };
      }
      if (c.date) col.numFmt = 'dd/mm/yyyy';
    });
    return Buffer.from(await wb.xlsx.writeBuffer());
  }

  private async build(t: ExportTemplate, f: Record<string, any>): Promise<{ title: string; columns: Col[]; rows: Record<string, unknown>[] }> {
    const db = this.prisma.db;
    switch (t) {
      case 'ORDERS': {
        const r = resolveRange({ dateFrom: f.dateFrom, dateTo: f.dateTo });
        const orders = await db.order.findMany({
          where: {
            ...(f.dateFrom || f.dateTo ? { orderDate: { gte: r.fromDb, lte: r.toDb } } : {}),
            ...(f.status ? { status: { in: [].concat(f.status) } } : {}),
            ...(f.customerId ? { customerId: f.customerId } : {}),
            ...(f.search ? { OR: [{ code: { contains: f.search, mode: 'insensitive' } }, { customer: { name: { contains: f.search, mode: 'insensitive' } } }] } : {}),
          },
          include: { customer: { select: { name: true, code: true } }, addons: { select: { amount: true } }, _count: { select: { trips: true } } },
          orderBy: { orderDate: 'desc' },
        });
        const debts = await this.finance.orderDebtMap(orders.map((o) => o.id));
        const profits = await this.finance.orderProfits(orders.map((o) => o.id));
        return {
          title: 'Đơn hàng',
          columns: [
            { header: 'Mã đơn', key: 'code' }, { header: 'Ngày đơn', key: 'orderDate', date: true }, { header: 'Khách hàng', key: 'customer', width: 30 },
            { header: 'Tuyến', key: 'route', width: 40 }, { header: 'Trạng thái', key: 'status', width: 16 }, { header: 'Giá cước', key: 'freight', money: true },
            { header: 'Add-on', key: 'addons', money: true }, { header: 'Tổng tiền', key: 'total', money: true }, { header: 'Đã thu', key: 'paid', money: true },
            { header: 'Còn nợ', key: 'remaining', money: true }, { header: 'Hạn TT', key: 'dueDate', date: true }, { header: 'Quá hạn (ngày)', key: 'overdue', width: 12 },
            { header: 'Chi phí', key: 'cost', money: true }, { header: 'Lãi/lỗ', key: 'profit', money: true }, { header: 'Số chuyến', key: 'trips', width: 10 },
          ],
          rows: orders.map((o) => {
            const d = debts.get(o.id);
            const p = profits.get(o.id);
            return {
              code: o.code, orderDate: o.orderDate, customer: o.customer.name, route: o.routeSummary ?? '', status: labelOf(ORDER_STATUS, o.status), freight: num(o.freightAmount),
              addons: o.addons.reduce((s, a) => s + num(a.amount), 0), total: d?.total ?? 0, paid: d?.paid ?? 0, remaining: d?.remaining ?? 0, dueDate: o.dueDate,
              overdue: d?.overdueDays ?? 0, cost: p?.cost ?? 0, profit: p?.profit ?? 0, trips: o._count.trips,
            };
          }),
        };
      }
      case 'CUSTOMER_DEBT': {
        const rep = await this.reports.customerDebt({ customerId: f.customerId, overdueOnly: f.overdueOnly });
        return {
          title: 'Công nợ khách',
          columns: [
            { header: 'Mã KH', key: 'code' }, { header: 'Khách hàng', key: 'name', width: 32 }, { header: 'Phải thu', key: 'receivable', money: true },
            { header: 'Đã thu', key: 'paid', money: true }, { header: 'Còn nợ', key: 'totalDebt', money: true }, { header: 'Quá hạn', key: 'overdue', money: true },
            { header: 'Quá hạn tối đa (ngày)', key: 'maxOverdueDays', width: 14 }, { header: 'Số dư (credit)', key: 'creditBalance', money: true },
            { header: 'Hạn mức', key: 'creditLimit', money: true }, { header: 'Chưa đến hạn', key: 'a0', money: true }, { header: '1–15 ngày', key: 'a1', money: true },
            { header: '16–30 ngày', key: 'a2', money: true }, { header: '31–60 ngày', key: 'a3', money: true }, { header: '> 60 ngày', key: 'a4', money: true },
            { header: 'Cảnh báo', key: 'warnings', width: 36 },
          ],
          rows: rep.rows.map((r) => ({
            ...r, creditLimit: r.creditLimit ?? null, a0: r.aging.current, a1: r.aging.d1_15, a2: r.aging.d16_30, a3: r.aging.d31_60, a4: r.aging.d60p, warnings: r.warnings.join('; '),
          })),
        };
      }
      case 'PAYROLL': {
        const rows = f.payrollId
          ? (await this.reports.payroll({ year: f.year })).filter((p) => p.payrollId === f.payrollId)
          : await this.reports.payroll({ year: f.year, status: f.status ? [].concat(f.status) : undefined, driverId: f.driverId });
        return {
          title: 'Bảng lương',
          columns: [
            { header: 'Mã bảng lương', key: 'code' }, { header: 'Kỳ', key: 'period', width: 24 }, { header: 'Trạng thái', key: 'status', width: 14 },
            { header: 'Tài xế', key: 'driver', width: 28 }, { header: 'Lương cố định', key: 'salary', money: true }, { header: 'Thưởng', key: 'bonus', money: true },
            { header: 'Trừ ứng', key: 'advance', money: true }, { header: 'Giảm trừ', key: 'deduction', money: true }, { header: 'Điều chỉnh', key: 'adjustment', money: true },
            { header: 'Thực lãnh', key: 'net', money: true },
          ],
          rows: rows.flatMap((p) => p.byDriver.map((d) => ({ code: p.payrollCode, period: p.period, status: labelOf(PAYROLL_STATUS, p.status), driver: d.driverName, ...d }))),
        };
      }
      case 'COD_HELD': {
        const rep = await this.reports.codHeld({ driverId: f.driverId });
        return {
          title: 'COD tài xế đang giữ',
          columns: [
            { header: 'Tài xế', key: 'driver', width: 26 }, { header: 'SĐT', key: 'phone', width: 14 }, { header: 'Mã đơn', key: 'orderCode' }, { header: 'Mã chuyến', key: 'tripCode' },
            { header: 'Khách hàng', key: 'customer', width: 28 }, { header: 'Điểm', key: 'stop', width: 30 }, { header: 'Ngày thu', key: 'collectedAt', date: true },
            { header: 'COD dự kiến', key: 'codExpected', money: true }, { header: 'COD thực thu', key: 'codActual', money: true }, { header: 'Đã nộp', key: 'remitted', money: true },
            { header: 'Đang giữ', key: 'held', money: true }, { header: 'Số ngày giữ', key: 'daysHeld', width: 10 },
          ],
          rows: rep.rows.flatMap((d) =>
            d.items.map((i) => ({
              driver: d.name, phone: d.phone, orderCode: i.orderCode, tripCode: i.tripCode ?? '', customer: i.customerName, stop: `${i.stopSequence}. ${i.stopName ?? i.address}`,
              collectedAt: i.collectedAt, codExpected: i.codExpected, codActual: i.codActual, remitted: i.remitted, held: i.held, daysHeld: i.daysHeld,
            })),
          ),
        };
      }
      case 'EXPENSES': {
        const r = resolveRange({ dateFrom: f.dateFrom, dateTo: f.dateTo });
        const rows = await db.expense.findMany({
          where: {
            ...(f.dateFrom || f.dateTo ? { expenseDate: { gte: r.fromDb, lte: r.toDb } } : {}),
            ...(f.kind ? { kind: { in: [].concat(f.kind) } } : {}), ...(f.supplierId ? { supplierId: f.supplierId } : {}),
            ...(f.driverId ? { driverId: f.driverId } : {}), ...(f.paidStatus ? { paidStatus: f.paidStatus } : {}), ...(f.status ? { status: f.status } : {}),
          },
          include: { supplier: { select: { name: true } }, order: { select: { code: true } }, trip: { select: { code: true } }, vehicle: { select: { plate: true } }, driver: { select: { name: true } } },
          orderBy: { expenseDate: 'desc' },
        });
        const cats = await this.catalogs.labels(rows.map((e) => e.categoryId));
        return {
          title: 'Phiếu chi',
          columns: [
            { header: 'Mã phiếu', key: 'code' }, { header: 'Ngày', key: 'date', date: true }, { header: 'Nhóm', key: 'kind', width: 20 }, { header: 'Loại chi', key: 'category', width: 20 },
            { header: 'Diễn giải', key: 'description', width: 36 }, { header: 'NCC', key: 'supplier', width: 24 }, { header: 'Đơn', key: 'order' }, { header: 'Chuyến', key: 'trip' },
            { header: 'Xe', key: 'vehicle', width: 12 }, { header: 'Tài xế', key: 'driver', width: 22 }, { header: 'Người chi', key: 'paidBy', width: 18 },
            { header: 'Thanh toán NCC', key: 'paidStatus', width: 14 }, { header: 'Trạng thái', key: 'status', width: 12 }, { header: 'Số tiền', key: 'amount', money: true },
          ],
          rows: rows.map((e) => ({
            code: e.code, date: e.expenseDate, kind: labelOf(EXPENSE_KIND, e.kind), category: e.categoryId ? cats.get(e.categoryId) ?? '' : '', description: e.description ?? '',
            supplier: e.supplier?.name ?? '', order: e.order?.code ?? '', trip: e.trip?.code ?? '', vehicle: e.vehicle?.plate ?? '', driver: e.driver?.name ?? '',
            paidBy: labelOf(EXPENSE_PAID_BY, e.paidBy), paidStatus: labelOf(PAID_STATUS, e.paidStatus), status: labelOf(DOC_STATUS, e.status), amount: num(e.amount),
          })),
        };
      }
      case 'PAYMENTS': {
        const r = resolveRange({ dateFrom: f.dateFrom, dateTo: f.dateTo });
        const rows = await db.paymentIn.findMany({
          where: {
            ...(f.dateFrom || f.dateTo ? { receivedAt: { gte: r.start, lte: r.end } } : {}), ...(f.type ? { type: { in: [].concat(f.type) } } : {}),
            ...(f.customerId ? { customerId: f.customerId } : {}), ...(f.driverId ? { driverId: f.driverId } : {}),
          },
          include: { customer: { select: { name: true } }, driver: { select: { name: true } }, allocations: { select: { amount: true } } },
          orderBy: { receivedAt: 'desc' },
        });
        return {
          title: 'Phiếu thu',
          columns: [
            { header: 'Mã phiếu', key: 'code' }, { header: 'Ngày thu', key: 'date', date: true }, { header: 'Loại', key: 'type', width: 20 }, { header: 'Người nộp', key: 'payer', width: 28 },
            { header: 'Hình thức', key: 'method', width: 14 }, { header: 'Số tiền', key: 'amount', money: true }, { header: 'Đã phân bổ', key: 'allocated', money: true },
            { header: 'Chưa phân bổ', key: 'unallocated', money: true }, { header: 'Trạng thái', key: 'status', width: 12 }, { header: 'Ghi chú', key: 'note', width: 30 },
          ],
          rows: rows.map((p) => {
            const allocated = p.allocations.reduce((s, a) => s + num(a.amount), 0);
            return {
              code: p.code, date: p.receivedAt, type: labelOf(PAYMENT_IN_TYPE, p.type), payer: p.customer?.name ?? p.driver?.name ?? p.payerName ?? '', method: labelOf(PAYMENT_METHOD, p.method),
              amount: num(p.amount), allocated, unallocated: p.type === 'CUSTOMER_PAYMENT' ? num(p.amount) - allocated : 0, status: labelOf(DOC_STATUS, p.status), note: p.note ?? p.transferNote ?? '',
            };
          }),
        };
      }
      case 'CUSTOMERS': {
        const rows = await db.customer.findMany({ where: f.status ? { status: f.status } : {}, orderBy: { name: 'asc' } });
        const debts = await this.finance.customerDebtSummaries(rows.map((c) => c.id));
        return {
          title: 'Khách hàng',
          columns: [
            { header: 'Mã KH', key: 'code' }, { header: 'Tên khách hàng', key: 'name', width: 32 }, { header: 'SĐT', key: 'phone', width: 14 }, { header: 'MST', key: 'taxCode', width: 14 },
            { header: 'Địa chỉ', key: 'billingAddress', width: 36 }, { header: 'Hạn mức nợ', key: 'creditLimit', money: true }, { header: 'Số ngày công nợ', key: 'defaultDebtDays', width: 12 },
            { header: 'Còn nợ', key: 'remaining', money: true }, { header: 'Số dư', key: 'credit', money: true }, { header: 'Trạng thái', key: 'status', width: 16 },
          ],
          rows: rows.map((c) => ({
            code: c.code, name: c.name, phone: c.phone ?? '', taxCode: c.taxCode ?? '', billingAddress: c.billingAddress ?? '', creditLimit: c.creditLimit === null ? null : num(c.creditLimit),
            defaultDebtDays: c.defaultDebtDays, remaining: debts.get(c.id)?.remaining ?? 0, credit: debts.get(c.id)?.creditBalance ?? 0, status: labelOf(ACTIVE_STATUS, c.status),
          })),
        };
      }
      case 'VEHICLES': {
        const rows = await db.vehicle.findMany({ where: f.status ? { status: f.status } : {}, orderBy: { plate: 'asc' } });
        const types = await this.catalogs.labels(rows.map((v) => v.typeId));
        return {
          title: 'Xe',
          columns: [
            { header: 'Mã xe', key: 'code' }, { header: 'Biển số', key: 'plate', width: 14 }, { header: 'Loại xe', key: 'type' }, { header: 'Tải trọng (tấn)', key: 'capacityTons', width: 12 },
            { header: 'Hiệu xe', key: 'brandModel' }, { header: 'Năm SX', key: 'year', width: 8 }, { header: 'Hạn đăng kiểm', key: 'registrationExpiresAt', date: true },
            { header: 'Hạn bảo hiểm', key: 'insuranceExpiresAt', date: true }, { header: 'Trạng thái', key: 'status', width: 14 },
          ],
          rows: rows.map((v) => ({ ...v, type: v.typeId ? types.get(v.typeId) ?? '' : '', status: labelOf(VEHICLE_STATUS, v.status) })),
        };
      }
      case 'DRIVERS': {
        const rows = await db.driver.findMany({ where: f.status ? { status: f.status } : {}, orderBy: { name: 'asc' }, include: { salaryHistory: { orderBy: { effectiveFrom: 'desc' }, take: 1 } } });
        const ledgers = await this.finance.driverLedgers(rows.map((d) => d.id));
        return {
          title: 'Tài xế',
          columns: [
            { header: 'Mã TX', key: 'code' }, { header: 'Họ tên', key: 'name', width: 26 }, { header: 'SĐT', key: 'phone', width: 14 }, { header: 'Hạng GPLX', key: 'licenseClass', width: 10 },
            { header: 'Số GPLX', key: 'licenseNumber', width: 16 }, { header: 'Hạn GPLX', key: 'licenseExpiresAt', date: true }, { header: 'Lương cố định', key: 'salary', money: true },
            { header: 'COD đang giữ', key: 'codHeld', money: true }, { header: 'Trạng thái', key: 'status', width: 16 },
          ],
          rows: rows.map((d) => ({
            code: d.code, name: d.name, phone: d.phone, licenseClass: d.licenseClass ?? '', licenseNumber: d.licenseNumber ?? '', licenseExpiresAt: d.licenseExpiresAt,
            salary: d.salaryHistory[0] ? num(d.salaryHistory[0].amount) : null, codHeld: ledgers.get(d.id)?.codHeld ?? 0, status: labelOf(ACTIVE_STATUS, d.status),
          })),
        };
      }
      case 'SUPPLIERS': {
        const rows = await db.supplier.findMany({ where: f.status ? { status: f.status } : {}, orderBy: { name: 'asc' }, include: { expenses: { where: { status: 'ACTIVE', paidStatus: 'UNPAID', paidBy: 'COMPANY' }, select: { amount: true } } } });
        const types = await this.catalogs.labels(rows.map((s) => s.typeId));
        return {
          title: 'Nhà cung cấp',
          columns: [
            { header: 'Mã NCC', key: 'code' }, { header: 'Tên NCC', key: 'name', width: 32 }, { header: 'Loại', key: 'type', width: 22 }, { header: 'MST', key: 'taxCode', width: 14 },
            { header: 'Địa chỉ', key: 'address', width: 34 }, { header: 'Ngân hàng', key: 'bankName' }, { header: 'Số TK', key: 'bankAccountNo', width: 18 },
            { header: 'Công nợ phải trả', key: 'payable', money: true }, { header: 'Trạng thái', key: 'status', width: 16 },
          ],
          rows: rows.map((s) => ({
            code: s.code, name: s.name, type: s.typeId ? types.get(s.typeId) ?? '' : '', taxCode: s.taxCode ?? '', address: s.address ?? '', bankName: s.bankName ?? '', bankAccountNo: s.bankAccountNo ?? '',
            payable: s.expenses.reduce((a, e) => a + num(e.amount), 0), status: labelOf(ACTIVE_STATUS, s.status),
          })),
        };
      }
      case 'REPORT_PROFIT': {
        const rep = await this.reports.profit({ ...f });
        return {
          title: 'Lãi lỗ',
          columns: [
            { header: 'Nhóm', key: 'label', width: 30 }, { header: 'Chi tiết', key: 'sublabel', width: 34 }, { header: 'Số đơn', key: 'orderCount', width: 8 },
            { header: 'Giá cước', key: 'freight', money: true }, { header: 'Add-on', key: 'addons', money: true }, { header: 'Doanh thu', key: 'revenue', money: true },
            { header: 'Chi phí chuyến', key: 'tripCost', money: true }, { header: 'Thuê ngoài', key: 'outsourcedCost', money: true }, { header: 'Chi phí khác', key: 'otherCost', money: true },
            { header: 'Tổng chi phí', key: 'cost', money: true }, { header: 'Lãi/lỗ', key: 'profit', money: true }, { header: 'Biên LN (%)', key: 'margin', width: 10 },
            { header: 'Tạm tính', key: 'provisional', width: 10 },
          ],
          rows: [...rep.rows, rep.totals].map((r) => ({ ...r, sublabel: r.sublabel ?? '', provisional: r.isProvisional ? 'Có' : '' })),
        };
      }
    }
  }

  /** Dùng cho import: file mẫu. */
  static dateCell(v: string | null | undefined) {
    return v ? toDbDate(v) : null;
  }
}
