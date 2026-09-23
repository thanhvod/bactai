import { PAYROLL_ITEM_TYPE, labelOf } from '@bta/shared';
import { date, esc, kv, layout, money, signatures, table, type MerchantHeader } from './layout';

export interface DebtStatementData {
  merchant: MerchantHeader;
  statement: { code: string; periodFrom: Date; periodTo: Date; createdAt: Date; note: string | null; totalAmount: number; paidAmount: number; remainingAmount: number };
  customer: { name: string; legalName: string | null; taxCode: string | null; billingAddress: string | null; phone: string | null };
  lines: { orderDate: Date; orderCode: string; route: string | null; totalAmount: number; paidAmount: number; remainingAmount: number; dueDate: Date | null; overdueDays: number }[];
}

/** Bảng kê công nợ khách (03 §1.3) — cột: ngày đơn, mã đơn, tuyến, tổng, đã thu, còn lại, hạn TT, quá hạn. */
export function debtStatementHtml(d: DebtStatementData): string {
  const s = d.statement;
  const body = `
${kv([
  ['Khách hàng', `<b>${esc(d.customer.legalName || d.customer.name)}</b>`],
  ['MST', esc(d.customer.taxCode ?? '')],
  ['Địa chỉ', esc(d.customer.billingAddress ?? '')],
  ['Kỳ đối chiếu', `${date(s.periodFrom)} – ${date(s.periodTo)}`],
])}
${table(
  d.lines,
  [
    { label: 'Ngày đơn', value: (l) => date(l.orderDate), width: '9%' },
    { label: 'Mã đơn', value: (l) => esc(l.orderCode), width: '13%' },
    { label: 'Tuyến', value: (l) => esc(l.route ?? '') },
    { label: 'Tổng tiền', value: (l) => money(l.totalAmount), align: 'right', width: '11%' },
    { label: 'Đã thu', value: (l) => money(l.paidAmount), align: 'right', width: '11%' },
    { label: 'Còn lại', value: (l) => money(l.remainingAmount), align: 'right', width: '11%' },
    { label: 'Hạn TT', value: (l) => date(l.dueDate), width: '9%' },
    { label: 'Quá hạn', value: (l) => (l.overdueDays > 0 ? `${l.overdueDays} ngày` : ''), align: 'right', width: '8%' },
  ],
  `<tfoot><tr><td colspan="3">Tổng cộng (${d.lines.length} đơn)</td><td class="num">${money(s.totalAmount)}</td><td class="num">${money(s.paidAmount)}</td><td class="num">${money(s.remainingAmount)}</td><td colspan="2"></td></tr></tfoot>`,
)}
<p class="total">Số tiền còn phải thanh toán: ${money(s.remainingAmount)}</p>
${s.note ? `<div class="note">Ghi chú: ${esc(s.note)}</div>` : ''}
<div class="note">Đề nghị Quý khách kiểm tra, đối chiếu và phản hồi nếu có sai lệch.</div>
${signatures(['Đại diện khách hàng', 'Kế toán nhà xe'])}`;
  return layout({ merchant: d.merchant, title: 'BẢNG KÊ CÔNG NỢ', code: s.code, subtitle: `Lập ngày ${date(s.createdAt)}`, body });
}

export interface PayrollDocData {
  merchant: MerchantHeader;
  payroll: { code: string; periodLabel: string; status: string; salaryTotal: number; bonusTotal: number; advanceTotal: number; deductionTotal: number; adjustmentTotal: number; netTotal: number };
  lines: { driverName: string; baseSalary: number; bonusTotal: number; advanceTotal: number; deductionTotal: number; adjustmentTotal: number; netAmount: number }[];
}

export function payrollHtml(d: PayrollDocData): string {
  const p = d.payroll;
  const body = `${table(
    d.lines,
    [
      { label: '#', value: (_l, i) => String(i + 1), align: 'center', width: '4%' },
      { label: 'Tài xế', value: (l) => esc(l.driverName) },
      { label: 'Lương cố định', value: (l) => money(l.baseSalary), align: 'right' },
      { label: 'Thưởng', value: (l) => money(l.bonusTotal), align: 'right' },
      { label: 'Trừ ứng', value: (l) => money(l.advanceTotal), align: 'right' },
      { label: 'Giảm trừ', value: (l) => money(l.deductionTotal), align: 'right' },
      { label: 'Điều chỉnh', value: (l) => money(l.adjustmentTotal), align: 'right' },
      { label: 'Thực lãnh', value: (l) => `<b>${money(l.netAmount)}</b>`, align: 'right' },
      { label: 'Ký nhận', value: () => '', width: '10%' },
    ],
    `<tfoot><tr><td colspan="2">Tổng</td><td class="num">${money(p.salaryTotal)}</td><td class="num">${money(p.bonusTotal)}</td><td class="num">${money(p.advanceTotal)}</td><td class="num">${money(p.deductionTotal)}</td><td class="num">${money(p.adjustmentTotal)}</td><td class="num">${money(p.netTotal)}</td><td></td></tr></tfoot>`,
  )}${signatures(['Người lập', 'Kế toán', 'Giám đốc duyệt'])}`;
  return layout({ merchant: d.merchant, title: 'BẢNG LƯƠNG TÀI XẾ', code: p.code, subtitle: p.periodLabel, body });
}

export interface PayslipData {
  merchant: MerchantHeader;
  payroll: { code: string; periodLabel: string };
  line: { driverName: string; driverCode: string; baseSalary: number; salaryEffectiveFrom: Date | null; netAmount: number };
  items: { type: string; description: string; itemDate: Date | null; amount: number; sourceRef: string | null }[];
}

export function payslipHtml(d: PayslipData): string {
  const body = `
${kv([
  ['Tài xế', `<b>${esc(d.line.driverName)}</b> (${esc(d.line.driverCode)})`],
  ['Kỳ lương', esc(d.payroll.periodLabel)],
  ['Lương cố định áp dụng', `${money(d.line.baseSalary)}${d.line.salaryEffectiveFrom ? ` <span class="muted">(từ ${date(d.line.salaryEffectiveFrom)})</span>` : ''}`],
])}
${table(
  d.items,
  [
    { label: 'Khoản', value: (i) => esc(labelOf(PAYROLL_ITEM_TYPE, i.type)), width: '16%' },
    { label: 'Diễn giải', value: (i) => esc(i.description) },
    { label: 'Chứng từ', value: (i) => esc(i.sourceRef ?? ''), width: '15%' },
    { label: 'Ngày', value: (i) => date(i.itemDate), width: '11%' },
    { label: 'Số tiền', value: (i) => `${PAYROLL_ITEM_TYPE[i.type as keyof typeof PAYROLL_ITEM_TYPE]?.sign === -1 ? '−' : ''}${money(i.amount)}`, align: 'right', width: '15%' },
  ],
  `<tfoot><tr><td colspan="4">Thực lãnh</td><td class="num">${money(d.line.netAmount)}</td></tr></tfoot>`,
)}
${signatures(['Kế toán', 'Tài xế ký nhận'])}`;
  return layout({ merchant: d.merchant, title: 'PHIẾU LƯƠNG', code: d.payroll.code, subtitle: d.payroll.periodLabel, body });
}

export interface ReconciliationData {
  merchant: MerchantHeader;
  driver: { name: string; code: string; phone: string };
  period: { from: string; to: string };
  summary: { codCollected: number; codRemitted: number; codHeld: number; companyOwesDriver: number; tripAdvanceOutstanding: number; salaryAdvanceUndeducted: number; netBalance: number };
  entries: { date: Date; docCode: string; description: string; driverOwes: number; companyOwes: number }[];
}

/** Bảng đối soát tài xế (sổ công nợ 2 chiều, 04 §3). */
export function reconciliationHtml(d: ReconciliationData): string {
  const s = d.summary;
  const body = `
${kv([
  ['Tài xế', `<b>${esc(d.driver.name)}</b> (${esc(d.driver.code)}) · ${esc(d.driver.phone)}`],
  ['Kỳ', `${esc(d.period.from)} – ${esc(d.period.to)}`],
])}
${table(
  d.entries,
  [
    { label: 'Ngày', value: (e) => date(e.date), width: '10%' },
    { label: 'Chứng từ', value: (e) => esc(e.docCode), width: '16%' },
    { label: 'Diễn giải', value: (e) => esc(e.description) },
    { label: 'Tài xế nợ công ty', value: (e) => (e.driverOwes ? money(e.driverOwes) : ''), align: 'right', width: '16%' },
    { label: 'Công ty nợ tài xế', value: (e) => (e.companyOwes ? money(e.companyOwes) : ''), align: 'right', width: '16%' },
  ],
)}
<div class="section">Số dư hiện tại (toàn thời gian)</div>
${kv([
  ['COD đã thu / đã nộp', `${money(s.codCollected)} / ${money(s.codRemitted)}`],
  ['COD tài xế đang giữ', money(s.codHeld)],
  ['Tạm ứng chuyến chưa đối soát', money(s.tripAdvanceOutstanding)],
  ['Ứng lương chưa trừ', money(s.salaryAdvanceUndeducted)],
  ['Công ty còn nợ tài xế', money(s.companyOwesDriver)],
  ['Số dư ròng', `<b>${money(s.netBalance)}</b> <span class="muted">(dương: tài xế nợ công ty)</span>`],
])}
${signatures(['Kế toán', 'Tài xế'])}`;
  return layout({ merchant: d.merchant, title: 'BẢNG ĐỐI SOÁT TÀI XẾ', subtitle: `${d.period.from} – ${d.period.to}`, body });
}
