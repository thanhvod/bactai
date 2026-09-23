import { afterAll, describe, expect, it } from 'vitest';
import { toDbDate, isoDate } from '@bta/shared';
import { USERS, errorCode, gql, gqlOk, merchantId, prisma, testApp } from './helpers';

afterAll(async () => (await testApp()).close());

const now = new Date();
const Y = now.getFullYear();
const M = now.getMonth() + 1;

const PAYROLL_FIELDS = `id code status periodLabel totals { salary bonus advance deduction net driverCount }
  lines { id driverId driverName baseSalary bonusTotal advanceTotal deductionTotal netAmount anomalies items { id type amount description sourceRef } }`;

describe('Payroll (PAY-001..003, D-012)', () => {
  it('preview kỳ hiện tại merchant A: lương cố định theo mốc hiện hành (DRV-A-001 = 10tr) và báo trùng kỳ', async () => {
    const d = await gqlOk(USERS.operation, `query($i: GeneratePayrollInput!) { payrollPreview(input: $i) { periodLabel conflictPayrollCode warnings lines { driverCode baseSalary items { type amount } excluded { code } } } }`, { i: { year: Y, month: M } });
    const l1 = d.payrollPreview.lines.find((l: any) => l.driverCode === 'DRV-A-001');
    expect(l1.baseSalary).toBe(10_000_000);
    expect(d.payrollPreview.conflictPayrollCode).toMatch(/^BL-/);
    expect(d.payrollPreview.lines.some((l: any) => l.driverCode === 'DRV-A-003')).toBe(false);
  });

  it('tạo trùng kỳ với bảng lương đang mở → CONFLICT', async () => {
    const r = await gql(USERS.operation, `mutation($i: GeneratePayrollInput!) { generatePayroll(input: $i) { id } }`, { i: { year: Y, month: M } });
    expect(errorCode(r)).toBe('CONFLICT');
  });

  it('kế toán không tạo được bảng lương', async () => {
    const r = await gql(USERS.accountant, `mutation($i: GeneratePayrollInput!) { generatePayroll(input: $i) { id } }`, { i: { year: Y, month: M } });
    expect(errorCode(r)).toBe('FORBIDDEN');
  });

  it('duyệt: operation FORBIDDEN, trả về thiếu lý do → SENSITIVE_REASON_REQUIRED, admin duyệt OK', async () => {
    const p = await prisma();
    const mid = await merchantId('M-DEMO-A');
    const bl = await p.payroll.findFirstOrThrow({ where: { merchantId: mid, status: 'SUBMITTED' } });
    expect(errorCode(await gql(USERS.operation, `mutation($id: ID!) { approvePayroll(id: $id) { status } }`, { id: bl.id }))).toBe('FORBIDDEN');
    expect(errorCode(await gql(USERS.admin, `mutation($id: ID!) { returnPayroll(id: $id, reason: "") { status } }`, { id: bl.id }))).toBe('SENSITIVE_REASON_REQUIRED');
    const d = await gqlOk(USERS.admin, `mutation($id: ID!) { approvePayroll(id: $id, note: "OK") { status approvedByName } }`, { id: bl.id });
    expect(d.approvePayroll.status).toBe('APPROVED');
    // D-012: đã duyệt nhưng chưa chi → trả về nháp được, có lý do
    const r = await gqlOk(USERS.admin, `mutation($id: ID!) { returnPayroll(id: $id, reason: "Sai thưởng chuyến") { status returnReason } }`, { id: bl.id });
    expect(r.returnPayroll.status).toBe('RETURNED');
    const hist = await p.statusHistory.findMany({ where: { entityType: 'PAYROLL', entityId: bl.id }, orderBy: { changedAt: 'asc' } });
    expect(hist.map((h) => h.toStatus)).toEqual(['APPROVED', 'RETURNED']);
  });

  it('merchant B: generate → snapshot không đổi khi dữ liệu gốc đổi → submit/approve/paid → không sửa được nữa', async () => {
    const p = await prisma();
    const mid = await merchantId('M-DEMO-B');
    const drv = await p.driver.findFirstOrThrow({ where: { merchantId: mid } });
    await p.driverSalaryHistory.create({ data: { merchantId: mid, driverId: drv.id, amount: 8_000_000n, effectiveFrom: toDbDate(`${Y}-01-01`) } });
    const trip = await p.trip.findFirstOrThrow({ where: { merchantId: mid } });
    await p.trip.update({ where: { id: trip.id }, data: { status: 'COMPLETED', actualEndAt: new Date(), driverBonusAmount: 400_000n } });
    await p.expense.create({ data: { merchantId: mid, code: `PC-B-${Date.now()}`, kind: 'SALARY_ADVANCE', amount: 1_000_000n, expenseDate: toDbDate(isoDate(new Date())), driverId: drv.id } });

    const g = await gqlOk(USERS.adminB, `mutation($i: GeneratePayrollInput!) { generatePayroll(input: $i) { ${PAYROLL_FIELDS} } }`, { i: { year: Y, month: M } });
    const pr = g.generatePayroll;
    expect(pr.status).toBe('DRAFT');
    expect(pr.code).toMatch(/^BL-\d{6}-\d{4}$/);
    const line = pr.lines.find((l: any) => l.driverId === drv.id);
    expect(line.baseSalary).toBe(8_000_000);
    expect(line.bonusTotal).toBe(400_000);
    expect(line.advanceTotal).toBe(1_000_000);
    expect(line.netAmount).toBe(7_400_000);

    // đổi dữ liệu gốc sau khi tạo → snapshot giữ nguyên
    await p.trip.update({ where: { id: trip.id }, data: { driverBonusAmount: 900_000n } });
    const again = await gqlOk(USERS.adminB, `query($id: ID!) { payroll(id: $id) { totals { net bonus } } }`, { id: pr.id });
    expect(again.payroll.totals.bonus).toBe(400_000);
    expect(again.payroll.totals.net).toBe(7_400_000);

    // giảm trừ cần lý do
    const noReason = await gql(USERS.adminB, `mutation($i: PayrollItemInput!) { addPayrollItem(input: $i) { netAmount } }`, { i: { lineId: line.id, type: 'DEDUCTION', amount: 200_000, description: 'x', reason: '' } });
    expect(errorCode(noReason)).toBe('SENSITIVE_REASON_REQUIRED');
    const ded = await gqlOk(USERS.adminB, `mutation($i: PayrollItemInput!) { addPayrollItem(input: $i) { netAmount deductionTotal } }`, { i: { lineId: line.id, type: 'DEDUCTION', amount: 200_000, description: 'Đền hàng hư', reason: 'Làm vỡ 2 thùng hàng' } });
    expect(ded.addPayrollItem.netAmount).toBe(7_200_000);

    await gqlOk(USERS.adminB, `mutation($id: ID!) { submitPayroll(id: $id) { status } }`, { id: pr.id });
    await gqlOk(USERS.adminB, `mutation($id: ID!) { approvePayroll(id: $id) { status } }`, { id: pr.id });
    const paid = await gqlOk(USERS.adminB, `mutation($id: ID!) { markPayrollPaid(id: $id) { status paidAt } }`, { id: pr.id });
    expect(paid.markPayrollPaid.status).toBe('PAID');
    const after = await gql(USERS.adminB, `mutation($i: PayrollItemInput!) { addPayrollItem(input: $i) { netAmount } }`, { i: { lineId: line.id, type: 'ADJUSTMENT', amount: 100_000, description: 'Bù' } });
    expect(errorCode(after)).toBe('BUSINESS_RULE_VIOLATION');
    expect(errorCode(await gql(USERS.adminB, `mutation($id: ID!) { returnPayroll(id: $id, reason: "Muốn sửa lại") { status } }`, { id: pr.id }))).toBe('BUSINESS_RULE_VIOLATION');

    // ứng lương đã trừ không bị trừ lại ở preview kỳ sau
    const next = await gqlOk(USERS.adminB, `query($i: GeneratePayrollInput!) { payrollPreview(input: $i) { lines { driverId advanceTotal bonusTotal } } }`, { i: { year: M === 12 ? Y + 1 : Y, month: M === 12 ? 1 : M + 1 } });
    expect(next.payrollPreview.lines.find((l: any) => l.driverId === drv.id).advanceTotal).toBe(0);

    const payslip = await gqlOk(USERS.adminB, `mutation($i: RenderDocumentInput!) { renderDocument(input: $i) { html fileName } }`, { i: { template: 'PAYSLIP', entityId: line.id, format: 'HTML' } });
    expect(payslip.renderDocument.html).toContain('PHIẾU LƯƠNG');
  });

  it('user B không đọc bảng lương A', async () => {
    const p = await prisma();
    const bl = await p.payroll.findFirstOrThrow({ where: { merchant: { code: 'M-DEMO-A' } } });
    expect(errorCode(await gql(USERS.adminB, `query($id: ID!) { payroll(id: $id) { id } }`, { id: bl.id }))).toBe('NOT_FOUND');
  });
});
