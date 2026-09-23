import { Injectable } from '@nestjs/common';
import { RECEIVABLE_ORDER_STATUSES, debtStatementSchema, formatVnd, toDbDate } from '@bta/shared';
import { big, num } from '@bta/db';
import { AuditService } from '../../common/audit/audit.service';
import { assertSensitive } from '../../common/auth/sensitive';
import { currentPrincipal } from '../../common/context/request-context';
import { businessRule, notFound, validationError } from '../../common/errors/app-error';
import { FinanceCalcService, type OrderDebtRow } from '../../common/finance/finance-calc.service';
import { pageParams, toConnection } from '../../common/graphql/pagination';
import { NotifyService } from '../../common/notifications/notify.service';
import { NumberingService } from '../../common/numbering/numbering.service';
import { PrismaService, type Tx } from '../../common/prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';
import { parse } from '../../common/validation/zod';
import { AttachmentsService } from '../attachments/attachments.service';
import { DocumentsService } from '../documents/documents.service';
import { PdfService } from '../documents/pdf.service';
import type { CreateDebtStatementInput, DebtStatementFilter } from './debt-statements.types';

/** Bảng kê công nợ có snapshot (PDF-001, 09 §2.6). Số đã chốt không đổi khi đơn/thanh toán đổi sau đó. */
@Injectable()
export class DebtStatementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly numbering: NumberingService,
    private readonly finance: FinanceCalcService,
    private readonly notify: NotifyService,
    private readonly attachments: AttachmentsService,
    private readonly documents: DocumentsService,
    private readonly pdf: PdfService,
    private readonly storage: StorageService,
  ) {}

  private me(): string | null {
    const p = currentPrincipal();
    return p?.type === 'USER' ? p.membershipId ?? null : null;
  }

  /** Dòng bảng kê tính tại thời điểm gọi: đơn của khách có ngày đơn trong kỳ (đơn phát sinh phải thu). */
  private async computeLines(customerId: string, from: Date, to: Date, scope: string): Promise<OrderDebtRow[]> {
    const rows = await this.finance.orderDebts({ customerId, orderDate: { gte: from, lte: to }, status: { in: RECEIVABLE_ORDER_STATUSES } });
    return scope === 'ALL_IN_PERIOD' ? rows : rows.filter((r) => r.remaining > 0);
  }

  private async writeLines(tx: Tx, statementId: string, rows: OrderDebtRow[]) {
    await tx.debtStatementLine.deleteMany({ where: { statementId } });
    if (rows.length) {
      await tx.debtStatementLine.createMany({
        data: rows.map((r, i) => ({
          statementId, orderId: r.orderId, sequence: i + 1, orderDate: r.orderDate, orderCode: r.code, route: r.routeSummary,
          totalAmount: big(r.receivable), paidAmount: big(r.paid), remainingAmount: big(r.remaining), dueDate: r.dueDate, overdueDays: r.overdueDays,
        })) as any,
      });
    }
    const sum = (k: 'receivable' | 'paid' | 'remaining') => rows.reduce((s, r) => s + r[k], 0);
    await tx.debtStatement.update({
      where: { id: statementId },
      data: { lineCount: rows.length, totalAmount: big(sum('receivable')), paidAmount: big(sum('paid')), remainingAmount: big(sum('remaining')) },
    });
  }

  async create(input: CreateDebtStatementInput) {
    const data = parse(debtStatementSchema, input);
    if (data.periodFrom > data.periodTo) throw validationError([{ field: 'periodTo', message: 'Ngày kết thúc phải sau ngày bắt đầu' }]);
    const customer = await this.prisma.db.customer.findFirst({ where: { id: data.customerId } });
    if (!customer) throw notFound('khách hàng');
    const scope = data.scope ?? 'UNPAID_ONLY';
    const from = toDbDate(data.periodFrom);
    const to = toDbDate(data.periodTo);
    const rows = await this.computeLines(customer.id, from, to, scope);
    const id = await this.prisma.tx(async (tx) => {
      const code = await this.numbering.next('DEBT_STATEMENT', tx);
      const s = await tx.debtStatement.create({
        data: { code, customerId: customer.id, periodFrom: from, periodTo: to, scope, status: 'DRAFT', note: data.note ?? null, createdByUserId: this.me() } as any,
      });
      await this.writeLines(tx, s.id, rows);
      await this.audit.log({ entityType: 'DEBT_STATEMENT', entityId: s.id, category: 'CREATE', action: 'debtStatement.create', summary: `Tạo bảng kê ${code} cho ${customer.name} (${rows.length} đơn)` }, tx);
      await this.audit.statusChange({ entityType: 'DEBT_STATEMENT', entityId: s.id, from: null, to: 'DRAFT' }, tx);
      return s.id;
    });
    return this.get(id);
  }

  private async load(id: string) {
    const s = await this.prisma.db.debtStatement.findFirst({ where: { id } });
    if (!s) throw notFound('bảng kê');
    return s;
  }

  async refresh(id: string) {
    const s = await this.load(id);
    if (s.status !== 'DRAFT') throw businessRule('Chỉ tính lại được bảng kê Nháp');
    const rows = await this.computeLines(s.customerId, s.periodFrom, s.periodTo, s.scope);
    await this.prisma.tx(async (tx) => {
      await this.writeLines(tx, id, rows);
      await this.audit.log({ entityType: 'DEBT_STATEMENT', entityId: id, category: 'UPDATE', action: 'debtStatement.refresh', summary: `Tính lại số liệu bảng kê (${rows.length} đơn)` }, tx);
    });
    return this.get(id);
  }

  /** Chốt: snapshot lần cuối + render PDF + lưu attachment. */
  async finalize(id: string) {
    const s = await this.load(id);
    if (s.status !== 'DRAFT') throw businessRule('Chỉ chốt được bảng kê Nháp');
    const rows = await this.computeLines(s.customerId, s.periodFrom, s.periodTo, s.scope);
    if (!rows.length) throw businessRule('Bảng kê không có đơn nào để chốt');
    await this.prisma.tx(async (tx) => {
      await this.writeLines(tx, id, rows);
      await tx.debtStatement.update({ where: { id }, data: { status: 'FINALIZED', finalizedAt: new Date(), finalizedByUserId: this.me() } });
      await this.audit.statusChange({ entityType: 'DEBT_STATEMENT', entityId: id, from: 'DRAFT', to: 'FINALIZED' }, tx);
      await this.audit.log({ entityType: 'DEBT_STATEMENT', entityId: id, category: 'MONEY', action: 'debtStatement.finalize', summary: `Chốt bảng kê ${s.code} · còn phải thu ${formatVnd(rows.reduce((a, r) => a + r.remaining, 0))}` }, tx);
    });
    const { html } = await this.documents.debtStatement(id);
    const body = await this.pdf.render(html);
    const att = await this.attachments.createFromBuffer({ entityType: 'DEBT_STATEMENT', entityId: id, category: 'DEBT_STATEMENT_PDF', fileName: `bang-ke-${s.code}.pdf`, mimeType: 'application/pdf', body });
    await this.prisma.db.debtStatement.update({ where: { id }, data: { pdfAttachmentId: att.id } });
    return this.get(id);
  }

  async markSent(id: string, shareWithCustomer?: boolean | null) {
    const s = await this.load(id);
    if (s.status !== 'FINALIZED' && s.status !== 'SENT') throw businessRule('Chỉ đánh dấu đã gửi cho bảng kê Đã chốt');
    const share = shareWithCustomer ?? s.sharedWithCustomer;
    await this.prisma.tx(async (tx) => {
      await tx.debtStatement.update({ where: { id }, data: { status: 'SENT', sentAt: s.sentAt ?? new Date(), sharedWithCustomer: share } });
      if (s.pdfAttachmentId) await tx.attachment.update({ where: { id: s.pdfAttachmentId }, data: { sharedWithCustomer: share } });
      if (s.status !== 'SENT') await this.audit.statusChange({ entityType: 'DEBT_STATEMENT', entityId: id, from: s.status, to: 'SENT' }, tx);
      await this.audit.log({ entityType: 'DEBT_STATEMENT', entityId: id, category: 'STATUS', action: 'debtStatement.sent', summary: `Đánh dấu đã gửi bảng kê${share ? ' (chia sẻ trên cổng khách hàng)' : ''}` }, tx);
    });
    if (share) {
      const c = await this.prisma.db.customer.findFirst({ where: { id: s.customerId } });
      if (c?.portalAccountId) {
        await this.notify.toCustomerAccount(c.portalAccountId, {
          type: 'DEBT_STATEMENT_SENT', title: `Bảng kê công nợ mới ${s.code}`, body: `Còn phải thanh toán ${formatVnd(num(s.remainingAmount))}`, entityType: 'DEBT_STATEMENT', entityId: id, severity: 'info',
        });
      }
    }
    return this.get(id);
  }

  async cancel(id: string, reason: string) {
    const r = assertSensitive('debtStatement.cancel', reason);
    const s = await this.load(id);
    if (s.status === 'CANCELLED') throw businessRule('Bảng kê đã hủy');
    await this.prisma.tx(async (tx) => {
      await tx.debtStatement.update({ where: { id }, data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: r, sharedWithCustomer: false } });
      await this.audit.statusChange({ entityType: 'DEBT_STATEMENT', entityId: id, from: s.status, to: 'CANCELLED', reason: r }, tx);
      await this.audit.log({ entityType: 'DEBT_STATEMENT', entityId: id, category: 'SENSITIVE', sensitive: true, action: 'debtStatement.cancel', summary: `Hủy bảng kê ${s.code}`, reason: r, before: { status: s.status }, after: { status: 'CANCELLED' } }, tx);
    });
    return this.get(id);
  }

  private async names(ids: (string | null)[]) {
    const clean = [...new Set(ids.filter(Boolean) as string[])];
    const users = clean.length ? await this.prisma.db.merchantUser.findMany({ where: { id: { in: clean } }, select: { id: true, name: true } }) : [];
    return new Map(users.map((u) => [u.id, u.name]));
  }

  private view(s: any, names: Map<string, string>) {
    return {
      ...s,
      totalAmount: num(s.totalAmount), paidAmount: num(s.paidAmount), remainingAmount: num(s.remainingAmount),
      customer: { id: s.customer.id, code: s.customer.code, name: s.customer.name, phone: s.customer.phone, invoiceEmail: s.customer.invoiceEmail, hasPortalAccount: !!s.customer.portalAccountId },
      createdByName: names.get(s.createdByUserId) ?? null,
      finalizedByName: names.get(s.finalizedByUserId) ?? null,
    };
  }

  async list(filter: DebtStatementFilter = {}, page: { first?: number; after?: string | null }) {
    const where: any = {};
    if (filter.customerId) where.customerId = filter.customerId;
    if (filter.status?.length) where.status = { in: filter.status };
    const { take, skip } = pageParams(page);
    const [rows, total] = await Promise.all([
      this.prisma.db.debtStatement.findMany({ where, include: { customer: true }, orderBy: { createdAt: 'desc' }, take, skip }),
      this.prisma.db.debtStatement.count({ where }),
    ]);
    const names = await this.names(rows.flatMap((r) => [r.createdByUserId, r.finalizedByUserId]));
    return toConnection(rows.map((r) => this.view(r, names)), total, skip, take);
  }

  async get(id: string) {
    const s = await this.prisma.db.debtStatement.findFirst({ where: { id }, include: { customer: true, lines: { orderBy: { sequence: 'asc' } } } });
    if (!s) throw notFound('bảng kê');
    const names = await this.names([s.createdByUserId, s.finalizedByUserId]);
    const current = await this.finance.orderDebtMap(s.lines.map((l) => l.orderId));
    const diffVsCurrent = s.status === 'CANCELLED' ? [] : s.lines
      .map((l) => {
        const c = current.get(l.orderId);
        if (!c) return null;
        const snapRemaining = num(l.remainingAmount);
        const snapPaid = num(l.paidAmount);
        if (c.remaining === snapRemaining && c.paid === snapPaid) return null;
        return {
          orderId: l.orderId, orderCode: l.orderCode, snapshotRemaining: snapRemaining, currentRemaining: c.remaining, snapshotPaid: snapPaid, currentPaid: c.paid,
          message: `${l.orderCode}: còn lại ${formatVnd(snapRemaining)} trên bảng kê, hiện tại ${formatVnd(c.remaining)}`,
        };
      })
      .filter(Boolean);
    let pdfUrl: string | null = null;
    if (s.pdfAttachmentId) {
      const a = await this.prisma.db.attachment.findFirst({ where: { id: s.pdfAttachmentId, status: 'READY' } });
      if (a) pdfUrl = await this.storage.adapter.presignGet(a.storageKey, a.fileName);
    }
    return {
      ...this.view(s, names),
      lines: s.lines.map((l) => ({ ...l, totalAmount: num(l.totalAmount), paidAmount: num(l.paidAmount), remainingAmount: num(l.remainingAmount) })),
      diffVsCurrent,
      pdfUrl,
    };
  }
}
