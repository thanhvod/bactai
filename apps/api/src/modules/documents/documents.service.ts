import { Injectable } from '@nestjs/common';
import type { EntityType, Permission } from '@bta/shared';
import { isoDate, toDbDate } from '@bta/shared';
import { num } from '@bta/db';
import { assertPermission } from '../../common/auth/sensitive';
import { currentMerchantId } from '../../common/context/request-context';
import { businessRule, merchantRequired, notFound, validationError } from '../../common/errors/app-error';
import { FinanceCalcService } from '../../common/finance/finance-calc.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { CatalogsService } from '../catalogs/catalogs.service';
import { PdfService } from './pdf.service';
import type { MerchantHeader } from './templates/layout';
import { debtStatementHtml, payrollHtml, payslipHtml, reconciliationHtml } from './templates/finance.templates';
import { deliveryNoteHtml, dispatchNoteHtml, tripCostSheetHtml } from './templates/order.templates';
import type { RenderDocumentInput } from './documents.types';

export const DOCUMENT_TEMPLATES = ['DELIVERY_NOTE', 'DISPATCH_NOTE', 'TRIP_COST_SHEET', 'DRIVER_RECONCILIATION', 'PAYROLL', 'PAYSLIP', 'DEBT_STATEMENT'] as const;
export type DocumentTemplate = (typeof DOCUMENT_TEMPLATES)[number];

const TEMPLATE_PERMISSION: Record<DocumentTemplate, Permission> = {
  DELIVERY_NOTE: 'order.view',
  DISPATCH_NOTE: 'order.view',
  TRIP_COST_SHEET: 'order.view',
  DRIVER_RECONCILIATION: 'driverLedger.view',
  PAYROLL: 'payroll.export',
  PAYSLIP: 'payroll.export',
  DEBT_STATEMENT: 'debt.view',
};

const TEMPLATE_ENTITY: Record<DocumentTemplate, EntityType> = {
  DELIVERY_NOTE: 'ORDER',
  DISPATCH_NOTE: 'TRIP',
  TRIP_COST_SHEET: 'TRIP',
  DRIVER_RECONCILIATION: 'DRIVER',
  PAYROLL: 'PAYROLL',
  PAYSLIP: 'PAYROLL',
  DEBT_STATEMENT: 'DEBT_STATEMENT',
};

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdf: PdfService,
    private readonly attachments: AttachmentsService,
    private readonly storage: StorageService,
    private readonly finance: FinanceCalcService,
    private readonly catalogs: CatalogsService,
  ) {}

  async merchantHeader(): Promise<MerchantHeader> {
    const id = currentMerchantId();
    if (!id) throw merchantRequired();
    const m = await this.prisma.raw.merchant.findUniqueOrThrow({ where: { id } });
    return { name: m.name, legalName: m.legalName, taxCode: m.taxCode, address: m.address, phone: m.phone ?? m.dispatchHotline, email: m.email };
  }

  private stopRows(stops: any[]) {
    return stops.map((s) => ({
      sequence: s.sequence, type: s.type, locationName: s.locationName, address: s.address, contactName: s.contactName, contactPhone: s.contactPhone,
      codExpected: num(s.codExpected), plannedAt: s.plannedAt,
    }));
  }

  private cargoRows(cargo: any[]) {
    return cargo.map((c) => ({ name: c.name, weightKg: c.weightKg, volumeM3: c.volumeM3, quantity: c.quantity, packagingUnit: c.packagingUnit, note: c.note }));
  }

  async deliveryNote(orderId: string) {
    const o = await this.prisma.db.order.findFirst({
      where: { id: orderId },
      include: {
        customer: true,
        stops: { orderBy: { sequence: 'asc' } },
        cargoLines: { orderBy: { sortOrder: 'asc' } },
        trips: { where: { status: { not: 'CANCELLED' } }, include: { vehicle: true, driver: true } },
      },
    });
    if (!o) throw notFound('đơn hàng');
    return {
      code: o.code,
      html: deliveryNoteHtml({
        merchant: await this.merchantHeader(),
        order: { code: o.code, orderDate: o.orderDate, dueDate: o.dueDate, note: o.note, routeSummary: o.routeSummary, customer: { name: o.customer.name, phone: o.customer.phone, billingAddress: o.customer.billingAddress, taxCode: o.customer.taxCode } },
        stops: this.stopRows(o.stops),
        cargo: this.cargoRows(o.cargoLines),
        trips: o.trips.map((t) => ({ code: t.code, plate: t.vehicle?.plate ?? null, driverName: t.driver?.name ?? null, driverPhone: t.driver?.phone ?? null })),
      }),
    };
  }

  private async loadTrip(tripId: string) {
    const t = await this.prisma.db.trip.findFirst({
      where: { id: tripId },
      include: {
        order: { include: { customer: true, cargoLines: { orderBy: { sortOrder: 'asc' } } } },
        vehicle: true,
        driver: true,
        stopAssignments: { include: { stop: true }, orderBy: { sequence: 'asc' } },
        expenses: { orderBy: { expenseDate: 'asc' } },
      },
    });
    if (!t) throw notFound('chuyến');
    return t;
  }

  async dispatchNote(tripId: string) {
    const t = await this.loadTrip(tripId);
    const types = await this.catalogs.labels([t.vehicle?.typeId]);
    const advance = t.expenses.filter((e) => e.kind === 'TRIP_ADVANCE' && e.status === 'ACTIVE').reduce((s, e) => s + num(e.amount), 0);
    return {
      code: t.code,
      html: dispatchNoteHtml({
        merchant: await this.merchantHeader(),
        trip: {
          code: t.code, plannedStartAt: t.plannedStartAt, plannedEndAt: t.plannedEndAt, note: t.note, driverBonusAmount: num(t.driverBonusAmount),
          orderCode: t.order.code, customerName: t.order.customer.name, plate: t.vehicle?.plate ?? null, vehicleType: t.vehicle?.typeId ? types.get(t.vehicle.typeId) ?? null : null,
          driverName: t.driver?.name ?? null, driverPhone: t.driver?.phone ?? null, licenseNumber: t.driver?.licenseNumber ?? null,
        },
        stops: this.stopRows(t.stopAssignments.map((a) => a.stop)),
        cargo: this.cargoRows(t.order.cargoLines),
        advanceAmount: advance,
      }),
    };
  }

  async tripCostSheet(tripId: string) {
    const t = await this.loadTrip(tripId);
    const cats = await this.catalogs.labels(t.expenses.map((e) => e.categoryId));
    const advance = t.expenses.filter((e) => e.kind === 'TRIP_ADVANCE' && e.status === 'ACTIVE').reduce((s, e) => s + num(e.amount), 0);
    return {
      code: `${t.code}-chi-phi`,
      html: tripCostSheetHtml({
        merchant: await this.merchantHeader(),
        trip: { code: t.code, orderCode: t.order.code, customerName: t.order.customer.name, plate: t.vehicle?.plate ?? null, driverName: t.driver?.name ?? null, plannedStartAt: t.plannedStartAt, actualEndAt: t.actualEndAt },
        expenses: t.expenses.map((e) => ({
          code: e.code, expenseDate: e.expenseDate, kind: e.kind, category: e.categoryId ? cats.get(e.categoryId) ?? null : null, description: e.description,
          paidBy: e.paidBy, reimbursable: e.reimbursable, amount: num(e.amount), status: e.status,
        })),
        advanceAmount: advance,
      }),
    };
  }

  async driverReconciliation(driverId: string, from?: string, to?: string) {
    const d = await this.prisma.db.driver.findFirst({ where: { id: driverId } });
    if (!d) throw notFound('tài xế');
    const now = new Date();
    const fromIso = from ?? isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
    const toIso = to ?? isoDate(now);
    const start = new Date(`${fromIso}T00:00:00+07:00`);
    const end = new Date(`${toIso}T23:59:59.999+07:00`);
    const summary = (await this.finance.driverLedgers([driverId])).get(driverId)!;
    const [stops, payments, expenses] = await Promise.all([
      this.prisma.db.orderStop.findMany({
        where: { codActual: { gt: 0 }, codCollectedAt: { gte: start, lte: end }, assignments: { some: { trip: { driverId, status: { not: 'CANCELLED' } } } } },
        include: { order: { select: { code: true } } },
      }),
      this.prisma.db.paymentIn.findMany({ where: { driverId, status: 'ACTIVE', receivedAt: { gte: start, lte: end } } }),
      this.prisma.db.expense.findMany({ where: { driverId, status: 'ACTIVE', expenseDate: { gte: toDbDate(fromIso), lte: toDbDate(toIso) } } }),
    ]);
    const entries = [
      ...stops.map((s) => ({ date: s.codCollectedAt!, docCode: s.order.code, description: `Thu hộ COD điểm ${s.sequence} ${s.locationName ?? ''}`.trim(), driverOwes: num(s.codActual), companyOwes: 0 })),
      ...payments.map((p) => ({ date: p.receivedAt, docCode: p.code, description: p.type === 'DRIVER_COD_REMITTANCE' ? 'Tài xế nộp COD' : p.type === 'DRIVER_ADVANCE_RETURN' ? 'Tài xế hoàn tạm ứng' : 'Phiếu thu', driverOwes: -num(p.amount), companyOwes: 0 })),
      ...expenses.map((e) => {
        const amt = num(e.amount);
        if (e.kind === 'TRIP_ADVANCE') return { date: e.expenseDate, docCode: e.code, description: 'Tạm ứng chuyến', driverOwes: amt, companyOwes: 0 };
        if (e.kind === 'SALARY_ADVANCE') return { date: e.expenseDate, docCode: e.code, description: 'Ứng lương', driverOwes: amt, companyOwes: 0 };
        if (e.kind === 'DRIVER_REIMBURSEMENT') return { date: e.expenseDate, docCode: e.code, description: 'Công ty hoàn ứng', driverOwes: 0, companyOwes: -amt };
        if (e.paidBy === 'DRIVER' && e.reimbursable) return { date: e.expenseDate, docCode: e.code, description: `Tài xế chi trước: ${e.description ?? ''}`.trim(), driverOwes: 0, companyOwes: amt };
        if (e.paidBy === 'DRIVER_ADVANCE') return { date: e.expenseDate, docCode: e.code, description: `Chi từ tạm ứng: ${e.description ?? ''}`.trim(), driverOwes: -amt, companyOwes: 0 };
        return null;
      }),
    ]
      .filter(Boolean)
      .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime()) as any[];
    return {
      code: `doi-soat-${d.code}-${fromIso}`,
      html: reconciliationHtml({ merchant: await this.merchantHeader(), driver: { name: d.name, code: d.code, phone: d.phone }, period: { from: fromIso, to: toIso }, summary, entries }),
    };
  }

  async payroll(payrollId: string) {
    const p = await this.prisma.db.payroll.findFirst({ where: { id: payrollId }, include: { lines: { orderBy: { driverName: 'asc' } } } });
    if (!p) throw notFound('bảng lương');
    return {
      code: p.code,
      html: payrollHtml({
        merchant: await this.merchantHeader(),
        payroll: { code: p.code, periodLabel: p.periodLabel, status: p.status, salaryTotal: num(p.salaryTotal), bonusTotal: num(p.bonusTotal), advanceTotal: num(p.advanceTotal), deductionTotal: num(p.deductionTotal), adjustmentTotal: num(p.adjustmentTotal), netTotal: num(p.netTotal) },
        lines: p.lines.map((l) => ({ driverName: l.driverName, baseSalary: num(l.baseSalary), bonusTotal: num(l.bonusTotal), advanceTotal: num(l.advanceTotal), deductionTotal: num(l.deductionTotal), adjustmentTotal: num(l.adjustmentTotal), netAmount: num(l.netAmount) })),
      }),
    };
  }

  /** entityId = payroll line id */
  async payslip(lineId: string) {
    const l = await this.prisma.db.payrollLine.findFirst({
      where: { id: lineId },
      include: { payroll: true, driver: true, items: { orderBy: [{ type: 'asc' }, { createdAt: 'asc' }], include: { trip: { select: { code: true } }, expense: { select: { code: true } } } } },
    });
    if (!l) throw notFound('dòng lương');
    return {
      code: `${l.payroll.code}-${l.driver.code}`,
      html: payslipHtml({
        merchant: await this.merchantHeader(),
        payroll: { code: l.payroll.code, periodLabel: l.payroll.periodLabel },
        line: { driverName: l.driverName, driverCode: l.driver.code, baseSalary: num(l.baseSalary), salaryEffectiveFrom: l.salaryEffectiveFrom, netAmount: num(l.netAmount) },
        items: l.items.map((i) => ({ type: i.type, description: i.description, itemDate: i.itemDate, amount: num(i.amount), sourceRef: i.trip?.code ?? i.expense?.code ?? null })),
      }),
    };
  }

  async debtStatement(statementId: string) {
    const s = await this.prisma.db.debtStatement.findFirst({ where: { id: statementId }, include: { customer: true, lines: { orderBy: { sequence: 'asc' } } } });
    if (!s) throw notFound('bảng kê');
    return {
      code: s.code,
      html: debtStatementHtml({
        merchant: await this.merchantHeader(),
        statement: { code: s.code, periodFrom: s.periodFrom, periodTo: s.periodTo, createdAt: s.createdAt, note: s.note, totalAmount: num(s.totalAmount), paidAmount: num(s.paidAmount), remainingAmount: num(s.remainingAmount) },
        customer: { name: s.customer.name, legalName: s.customer.legalName, taxCode: s.customer.taxCode, billingAddress: s.customer.billingAddress, phone: s.customer.phone },
        lines: s.lines.map((l) => ({ orderDate: l.orderDate, orderCode: l.orderCode, route: l.route, totalAmount: num(l.totalAmount), paidAmount: num(l.paidAmount), remainingAmount: num(l.remainingAmount), dueDate: l.dueDate, overdueDays: l.overdueDays })),
      }),
    };
  }

  async html(template: DocumentTemplate, entityId: string, from?: string, to?: string): Promise<{ code: string; html: string }> {
    switch (template) {
      case 'DELIVERY_NOTE': return this.deliveryNote(entityId);
      case 'DISPATCH_NOTE': return this.dispatchNote(entityId);
      case 'TRIP_COST_SHEET': return this.tripCostSheet(entityId);
      case 'DRIVER_RECONCILIATION': return this.driverReconciliation(entityId, from, to);
      case 'PAYROLL': return this.payroll(entityId);
      case 'PAYSLIP': return this.payslip(entityId);
      case 'DEBT_STATEMENT': return this.debtStatement(entityId);
    }
  }

  async render(input: RenderDocumentInput) {
    const template = input.template as DocumentTemplate;
    if (!DOCUMENT_TEMPLATES.includes(template)) throw validationError([{ field: 'template', message: 'Mẫu in không hợp lệ' }]);
    assertPermission(TEMPLATE_PERMISSION[template]);
    const { code, html } = await this.html(template, input.entityId, input.from, input.to);
    const fileBase = `${template.toLowerCase().replace(/_/g, '-')}-${code}`;
    if ((input.format ?? 'PDF') === 'HTML') return { template, fileName: `${fileBase}.html`, html, url: null, attachmentId: null };
    const body = await this.pdf.render(html);
    let entityType = TEMPLATE_ENTITY[template];
    let entityId = input.entityId;
    if (template === 'PAYSLIP') {
      const line = await this.prisma.db.payrollLine.findFirst({ where: { id: input.entityId }, select: { payrollId: true } });
      if (!line) throw businessRule('Không tìm thấy dòng lương');
      entityId = line.payrollId;
      entityType = 'PAYROLL';
    }
    const att = await this.attachments.createFromBuffer({ entityType, entityId, category: 'PRINT_DOCUMENT', fileName: `${fileBase}.pdf`, mimeType: 'application/pdf', body });
    return { template, fileName: att.fileName, attachmentId: att.id, url: await this.storage.adapter.presignGet(att.storageKey, att.fileName), html: null };
  }
}
