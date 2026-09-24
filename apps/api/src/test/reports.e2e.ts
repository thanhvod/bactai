import { afterAll, describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import { RECEIVABLE_ORDER_STATUSES, isoDate, toDbDate } from '@bta/shared';
import { USERS, errorCode, gql, gqlOk, http, merchantId, prisma, testApp } from './helpers';

afterAll(async () => (await testApp()).close());

const today = isoDate(new Date());
const from60 = isoDate(new Date(Date.now() - 60 * 86_400_000));

async function fetchSigned(url: string) {
  const u = new URL(url);
  return (await http()).get(u.pathname).buffer(true).parse((res, cb) => {
    const chunks: Buffer[] = [];
    res.on('data', (c: Buffer) => chunks.push(c));
    res.on('end', () => cb(null, Buffer.concat(chunks)));
  });
}

describe('Dashboard & báo cáo (RPT-001/002)', () => {
  it('dashboardSummary: COD tài xế DRV-A-002 = 5,5tr, payrollPending khớp DB', async () => {
    const p = await prisma();
    const mid = await merchantId('M-DEMO-A');
    const d = await gqlOk(USERS.admin, `{ dashboardSummary { runningTrips codHeld { amount count } codOverThreshold payrollPending openIncidents overdueDebt { amount count } revenueMonth receivable supplierPayable codHolders { name codHeld overThreshold } overdueOrders { code overdueDays remaining } todayTripList { code } } navBadges { dispatch finance payroll } }`);
    const s = d.dashboardSummary;
    const holder = s.codHolders.find((h: any) => h.name === 'Trần Minh Lái');
    expect(holder.codHeld).toBe(5_500_000);
    expect(holder.overThreshold).toBe(true);
    expect(s.payrollPending).toBe(await p.payroll.count({ where: { merchantId: mid, status: 'SUBMITTED' } }));
    expect(s.runningTrips).toBeGreaterThanOrEqual(1);
    expect(s.overdueOrders[0].remaining).toBe(15_000_000);
    expect(s.supplierPayable).toBe(10_500_000);
    expect(d.navBadges.finance).toBeGreaterThanOrEqual(2);
  });

  it('reportProfit: doanh thu = giá cước + add-on theo đơn, không cộng phiếu thu COD', async () => {
    const p = await prisma();
    const mid = await merchantId('M-DEMO-A');
    const d = await gqlOk(USERS.accountant, `query($f: ReportFilter) { reportProfit(filter: $f) { totals { revenue cost profit orderCount } rows { label revenue isProvisional } notes } }`, { f: { dateFrom: from60, dateTo: today, groupBy: 'CUSTOMER' } });
    const orders = await p.order.findMany({ where: { merchantId: mid, orderDate: { gte: toDbDate(from60), lte: toDbDate(today) }, status: { in: RECEIVABLE_ORDER_STATUSES as any } }, include: { addons: true } });
    const expected = orders.reduce((s, o) => s + Number(o.freightAmount) + o.addons.reduce((a, x) => a + Number(x.amount), 0), 0);
    expect(d.reportProfit.totals.revenue).toBe(expected);
    expect(d.reportProfit.totals.cost).toBeGreaterThan(0);
    const byOrder = await gqlOk(USERS.accountant, `query($f: ReportFilter) { reportProfit(filter: $f) { rows { label revenue cost status } } }`, { f: { dateFrom: from60, dateTo: today, groupBy: 'ORDER' } });
    const cancelled = byOrder.reportProfit.rows.find((r: any) => r.status === 'CANCELLED');
    expect(cancelled.revenue).toBe(0);
    expect(cancelled.cost).toBe(1_000_000);
  });

  it('các báo cáo khác trả dữ liệu', async () => {
    const d = await gqlOk(USERS.admin, `{ reportVehicles { plate tripCount } reportDrivers { name completedTrips bonusTotal codHeld } reportCustomerDebt { totalDebt totalOverdue rows { name totalDebt } } reportCodHeld { totalHeld rows { name codHeld items { orderCode held } } } reportPayroll { payrollCode net } reportSummary { key headline } }`);
    expect(d.reportCodHeld.totalHeld).toBe(5_500_000);
    expect(d.reportCustomerDebt.totalOverdue).toBe(15_000_000);
    expect(d.reportSummary.length).toBeGreaterThan(5);
  });

  it('user B không thấy số liệu A', async () => {
    const d = await gqlOk(USERS.adminB, `{ reportCodHeld { totalHeld } reportCustomerDebt { totalOverdue } }`);
    expect(d.reportCodHeld.totalHeld).toBe(0);
    expect(d.reportCustomerDebt.totalOverdue).toBe(0);
  });
});

describe('Bảng kê công nợ (PDF-001)', () => {
  it('tạo → chốt (PDF) → snapshot giữ nguyên khi thanh toán sau đó; hủy cần lý do', async () => {
    const p = await prisma();
    const mid = await merchantId('M-DEMO-A');
    const cus = await p.customer.findFirstOrThrow({ where: { merchantId: mid, code: 'CUS-A-001' } });
    const fields = `id code status totalAmount paidAmount remainingAmount pdfUrl lines { orderCode remainingAmount overdueDays } diffVsCurrent { orderCode currentRemaining snapshotRemaining }`;
    expect(errorCode(await gql(USERS.operation, `mutation($i: CreateDebtStatementInput!) { createDebtStatement(input: $i) { id } }`, { i: { customerId: cus.id, periodFrom: from60, periodTo: today } }))).toBe('FORBIDDEN');
    const c = await gqlOk(USERS.accountant, `mutation($i: CreateDebtStatementInput!) { createDebtStatement(input: $i) { ${fields} } }`, { i: { customerId: cus.id, periodFrom: from60, periodTo: today } });
    const st = c.createDebtStatement;
    expect(st.code).toMatch(/^CN-\d{6}-\d{4}$/);
    const overdueLine = st.lines.find((l: any) => l.overdueDays > 0);
    expect(overdueLine.remainingAmount).toBe(15_000_000);

    const f = await gqlOk(USERS.accountant, `mutation($id: ID!) { finalizeDebtStatement(id: $id) { ${fields} } }`, { id: st.id });
    expect(f.finalizeDebtStatement.status).toBe('FINALIZED');
    expect(f.finalizeDebtStatement.pdfUrl).toBeTruthy();
    const pdf = await fetchSigned(f.finalizeDebtStatement.pdfUrl);
    expect(pdf.status).toBe(200);
    expect(Buffer.from(pdf.body).subarray(0, 4).toString()).toBe('%PDF');

    // thanh toán sau khi chốt
    const order = await p.order.findFirstOrThrow({ where: { merchantId: mid, code: overdueLine.orderCode } });
    await p.paymentIn.create({
      data: { merchantId: mid, code: `PT-T-${Date.now()}`, type: 'CUSTOMER_PAYMENT', customerId: cus.id, amount: 1_000_000n, receivedAt: new Date(), allocations: { create: [{ merchantId: mid, orderId: order.id, amount: 1_000_000n }] } },
    });
    const after = await gqlOk(USERS.accountant, `query($id: ID!) { debtStatement(id: $id) { ${fields} } }`, { id: st.id });
    expect(after.debtStatement.lines.find((l: any) => l.orderCode === overdueLine.orderCode).remainingAmount).toBe(15_000_000);
    const diff = after.debtStatement.diffVsCurrent.find((x: any) => x.orderCode === overdueLine.orderCode);
    expect(diff.currentRemaining).toBe(14_000_000);

    const sent = await gqlOk(USERS.accountant, `mutation($id: ID!) { markDebtStatementSent(id: $id, shareWithCustomer: true) { status } }`, { id: st.id });
    expect(sent.markDebtStatementSent.status).toBe('SENT');
    expect(errorCode(await gql(USERS.accountant, `mutation($id: ID!) { cancelDebtStatement(id: $id, reason: "") { status } }`, { id: st.id }))).toBe('SENSITIVE_REASON_REQUIRED');
    const cx = await gqlOk(USERS.accountant, `mutation($id: ID!) { cancelDebtStatement(id: $id, reason: "Gửi nhầm kỳ đối chiếu") { status } }`, { id: st.id });
    expect(cx.cancelDebtStatement.status).toBe('CANCELLED');
  }, 60_000);
});

describe('Mẫu in (WM-ORD-09 / WM-SHELL-05)', () => {
  it('phiếu giao hàng HTML + phiếu điều xe PDF', async () => {
    const p = await prisma();
    const mid = await merchantId('M-DEMO-A');
    const trip = await p.trip.findFirstOrThrow({ where: { merchantId: mid, status: 'IN_TRANSIT' } });
    const h = await gqlOk(USERS.operation, `mutation($i: RenderDocumentInput!) { renderDocument(input: $i) { html } }`, { i: { template: 'DELIVERY_NOTE', entityId: trip.orderId, format: 'HTML' } });
    expect(h.renderDocument.html).toContain('PHIẾU GIAO HÀNG');
    const pdf = await gqlOk(USERS.operation, `mutation($i: RenderDocumentInput!) { renderDocument(input: $i) { url fileName attachmentId } }`, { i: { template: 'DISPATCH_NOTE', entityId: trip.id } });
    expect(pdf.renderDocument.fileName).toMatch(/\.pdf$/);
    const res = await fetchSigned(pdf.renderDocument.url);
    expect(Buffer.from(res.body).subarray(0, 4).toString()).toBe('%PDF');
    // operation không in bảng lương (payroll.export)
    const bl = await p.payroll.findFirstOrThrow({ where: { merchantId: mid } });
    expect(errorCode(await gql(USERS.operation, `mutation($i: RenderDocumentInput!) { renderDocument(input: $i) { url } }`, { i: { template: 'PAYROLL', entityId: bl.id, format: 'HTML' } }))).toBe('FORBIDDEN');
    const drv = await p.driver.findFirstOrThrow({ where: { merchantId: mid, code: 'DRV-A-002' } });
    const rec = await gqlOk(USERS.accountant, `mutation($i: RenderDocumentInput!) { renderDocument(input: $i) { html } }`, { i: { template: 'DRIVER_RECONCILIATION', entityId: drv.id, from: from60, to: today, format: 'HTML' } });
    expect(rec.renderDocument.html).toContain('BẢNG ĐỐI SOÁT TÀI XẾ');
  }, 60_000);
});

describe('Export / Import Excel (EXP-001, IMP-001)', () => {
  it('export ORDERS trả file xlsx tải được', async () => {
    const d = await gqlOk(USERS.operation, `mutation($i: ExportFileInput!) { exportFile(input: $i) { url fileName rowCount } }`, { i: { template: 'ORDERS', filter: {} } });
    expect(d.exportFile.rowCount).toBeGreaterThanOrEqual(5);
    const res = await fetchSigned(d.exportFile.url);
    expect(res.status).toBe(200);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(res.body as any);
    expect(wb.worksheets[0].getRow(1).getCell(1).value).toBe('Mã đơn');
    expect(errorCode(await gql(USERS.operation, `mutation($i: ExportFileInput!) { exportFile(input: $i) { url } }`, { i: { template: 'PAYROLL' } }))).toBe('FORBIDDEN');
  });

  it('import 3 khách (1 dòng thiếu tên) → preview lỗi → commit bỏ dòng lỗi tạo 2 khách', async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('KH');
    ws.addRow(['Tên khách hàng', 'SĐT', 'MST', 'Hạn mức nợ', 'Cột lạ']);
    ws.addRow(['Công ty Import Một', '0911000101', '0301111111', '50.000.000', 'x']);
    ws.addRow(['', '0911000102', '', '', '']);
    ws.addRow(['Công ty Import Ba', '0911000103', '', 20000000, '']);
    const b64 = Buffer.from(await wb.xlsx.writeBuffer()).toString('base64');
    const s = await gqlOk(USERS.operation, `mutation($i: StartImportInput!) { startImport(input: $i) { id status totalRows validRows errorRows unmappedColumns rows { line errors warnings } } }`, { i: { entityType: 'CUSTOMER', fileName: 'kh.xlsx', fileBase64: b64 } });
    const job = s.startImport;
    expect(job.totalRows).toBe(3);
    expect(job.errorRows).toBe(1);
    expect(job.validRows).toBe(2);
    expect(job.unmappedColumns).toContain('Cột lạ');
    expect(job.rows.find((r: any) => r.line === 3).errors[0]).toContain('Tên khách hàng');
    const onlyErr = await gqlOk(USERS.operation, `query($id: ID!) { importPreview(id: $id, filter: { onlyErrors: true }) { rows { line } } }`, { id: job.id });
    expect(onlyErr.importPreview.rows).toHaveLength(1);
    expect(errorCode(await gql(USERS.operation, `mutation($id: ID!) { commitImport(id: $id) { status } }`, { id: job.id }))).toBe('BUSINESS_RULE_VIOLATION');
    const c = await gqlOk(USERS.operation, `mutation($id: ID!) { commitImport(id: $id, skipErrors: true) { status createdCount skippedCount rows { line createdCode } } }`, { id: job.id });
    expect(c.commitImport.status).toBe('COMMITTED');
    expect(c.commitImport.createdCount).toBe(2);
    const p = await prisma();
    const created = await p.customer.findFirstOrThrow({ where: { name: 'Công ty Import Một', merchant: { code: 'M-DEMO-A' } } });
    expect(Number(created.creditLimit)).toBe(50_000_000);
    // import lại cùng SĐT → lỗi trùng
    const again = await gqlOk(USERS.operation, `mutation($i: StartImportInput!) { startImport(input: $i) { errorRows } }`, { i: { entityType: 'CUSTOMER', fileName: 'kh.xlsx', fileBase64: b64 } });
    expect(again.startImport.errorRows).toBe(3);
    const tpl = await gqlOk(USERS.operation, `{ importTemplate(entityType: "VEHICLE") { url fileName } }`);
    expect(tpl.importTemplate.fileName).toContain('vehicle');
    expect(errorCode(await gql(USERS.accountant, `mutation($i: StartImportInput!) { startImport(input: $i) { id } }`, { i: { entityType: 'DRIVER', fileName: 'x.xlsx', fileBase64: b64 } }))).toBe('FORBIDDEN');
  });
});

describe('Export theo dòng chọn', () => {
  it('ORDERS với filter.ids chỉ xuất đúng các đơn đã chọn', async () => {
    const { gqlOk, USERS, prisma } = await import('./helpers');
    const p = await prisma();
    const two = await p.order.findMany({ where: { merchant: { code: 'M-DEMO-A' } }, take: 2, select: { id: true } });
    const d = await gqlOk(USERS.operation, `mutation($i: ExportFileInput!) { exportFile(input: $i) { rowCount } }`, { i: { template: 'ORDERS', filter: { ids: two.map((o) => o.id) } } });
    expect(d.exportFile.rowCount).toBe(2);
  });
});
