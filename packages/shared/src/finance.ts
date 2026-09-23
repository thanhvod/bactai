/**
 * Công thức tài chính dùng chung — mọi màn chi tiết, công nợ, báo cáo PHẢI gọi các hàm này để không lệch số.
 * Ref: ARCHITECTURE §12.4, doc/1-BRD/03, 04, 07.
 *
 * Nguyên tắc:
 *  - Doanh thu đơn = giá cước + Σ add-on (KHÔNG lấy từ phiếu thu).
 *  - Phiếu thu "Tài xế nộp COD" là thu hồi phải thu, không phải doanh thu.
 *  - Chi phí lãi/lỗ chỉ gồm phiếu chi có EXPENSE_KIND.isCost; hoàn ứng/ứng lương/tạm ứng là dòng tiền.
 */
import { diffVnDays } from './date';
import { sumMoney, type Money } from './money';
import {
  EXPENSE_KIND,
  type ExpenseKind,
  type ExpensePaidBy,
  type OrderStatus,
  type DocStatus,
  type PaidStatus,
} from './status';

/** Đơn ở các trạng thái này mới phát sinh doanh thu/phải thu. */
export const RECEIVABLE_ORDER_STATUSES: OrderStatus[] = ['CONFIRMED', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED'];

export function isReceivableStatus(status: OrderStatus): boolean {
  return RECEIVABLE_ORDER_STATUSES.includes(status);
}

export interface OrderAmountsInput {
  status: OrderStatus;
  freightAmount: number | bigint;
  addons: { amount: number | bigint }[];
}

/** Tổng thu khách của đơn (giá cước + add-on). Đơn nháp/chờ xác nhận vẫn có giá trị "báo giá". */
export function orderTotal(input: Pick<OrderAmountsInput, 'freightAmount' | 'addons'>): Money {
  return sumMoney([input.freightAmount, ...input.addons.map((a) => a.amount)]);
}

/** Phải thu thực tế: chỉ đơn đã xác nhận trở đi, đơn hủy = 0. */
export function orderReceivable(input: OrderAmountsInput): Money {
  return isReceivableStatus(input.status) ? orderTotal(input) : 0;
}

export function allocatedAmount(allocations: { amount: number | bigint }[]): Money {
  return sumMoney(allocations.map((a) => a.amount));
}

export function overdueDays(dueDate: Date | string | null | undefined, remaining: Money, asOf: Date = new Date()): number {
  if (!dueDate || remaining <= 0) return 0;
  const d = diffVnDays(dueDate, asOf);
  return d > 0 ? d : 0;
}

export interface OrderDebt {
  total: Money;
  receivable: Money;
  paid: Money;
  remaining: Money;
  overdueDays: number;
}

export function orderDebt(
  order: OrderAmountsInput & { dueDate?: Date | string | null },
  allocations: { amount: number | bigint }[],
  asOf: Date = new Date(),
): OrderDebt {
  const total = orderTotal(order);
  const receivable = orderReceivable(order);
  const paid = allocatedAmount(allocations);
  const remaining = receivable - paid;
  return { total, receivable, paid, remaining, overdueDays: overdueDays(order.dueDate, remaining, asOf) };
}

export interface ExpenseLike {
  kind: ExpenseKind;
  status: DocStatus;
  amount: number | bigint;
}

export function isCostExpense(e: Pick<ExpenseLike, 'kind' | 'status'>): boolean {
  return e.status === 'ACTIVE' && EXPENSE_KIND[e.kind].isCost;
}

export function costTotal(expenses: ExpenseLike[]): Money {
  return sumMoney(expenses.filter(isCostExpense).map((e) => e.amount));
}

export interface OrderProfit {
  revenue: Money;
  tripCost: Money;
  outsourcedCost: Money;
  otherCost: Money;
  cost: Money;
  profit: Money;
  /** % lợi nhuận / doanh thu, 1 chữ số thập phân; null nếu doanh thu = 0 */
  margin: number | null;
  provisional: boolean;
}

/**
 * Lãi/lỗ đơn = (giá cước + add-on) − (chi phí các chuyến + chi phí gắn đơn, gồm thuê xe ngoài).
 * `expenses` = mọi phiếu chi gắn order hoặc trip thuộc order.
 */
export function orderProfit(order: OrderAmountsInput, expenses: ExpenseLike[]): OrderProfit {
  const revenue = orderReceivable(order);
  const active = expenses.filter(isCostExpense);
  const outsourcedCost = sumMoney(active.filter((e) => e.kind === 'EXTERNAL_TRANSPORT').map((e) => e.amount));
  const tripCost = sumMoney(active.filter((e) => e.kind === 'TRIP_COST').map((e) => e.amount));
  const cost = sumMoney(active.map((e) => e.amount));
  const otherCost = cost - outsourcedCost - tripCost;
  const profit = revenue - cost;
  return {
    revenue,
    tripCost,
    outsourcedCost,
    otherCost,
    cost,
    profit,
    margin: revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : null,
    provisional: order.status !== 'COMPLETED',
  };
}

/** Số dư (credit) khách = Σ phiếu thu khách còn hiệu lực − Σ đã phân bổ từ các phiếu đó. */
export function customerCredit(
  payments: { amount: number | bigint; status: DocStatus; allocations: { amount: number | bigint }[] }[],
): Money {
  const active = payments.filter((p) => p.status === 'ACTIVE');
  return sumMoney(active.map((p) => p.amount)) - sumMoney(active.flatMap((p) => p.allocations.map((a) => a.amount)));
}

export interface CreditLimitCheck {
  overLimit: boolean;
  usagePct: number | null;
}

export function creditLimitCheck(remainingDebt: Money, creditLimit: number | bigint | null | undefined): CreditLimitCheck {
  const limit = creditLimit === null || creditLimit === undefined ? null : Number(creditLimit);
  if (!limit || limit <= 0) return { overLimit: false, usagePct: null };
  return { overLimit: remainingDebt > limit, usagePct: Math.round((remainingDebt / limit) * 100) };
}

export const AGING_BUCKETS = [
  { key: 'current', label: 'Chưa đến hạn', min: -Infinity, max: 0 },
  { key: 'd1_15', label: '1–15 ngày', min: 1, max: 15 },
  { key: 'd16_30', label: '16–30 ngày', min: 16, max: 30 },
  { key: 'd31_60', label: '31–60 ngày', min: 31, max: 60 },
  { key: 'd60p', label: '> 60 ngày', min: 61, max: Infinity },
] as const;
export type AgingKey = (typeof AGING_BUCKETS)[number]['key'];

export function agingBucket(days: number): AgingKey {
  return AGING_BUCKETS.find((b) => days >= b.min && days <= b.max)!.key;
}

export function agingSummary(items: { remaining: Money; overdueDays: number }[]): Record<AgingKey, Money> {
  const res = { current: 0, d1_15: 0, d16_30: 0, d31_60: 0, d60p: 0 } as Record<AgingKey, Money>;
  for (const i of items) if (i.remaining > 0) res[agingBucket(i.overdueDays)] += i.remaining;
  return res;
}

// ---------------- Công nợ tài xế (sổ đối chiếu 2 chiều) ----------------

export interface DriverLedgerInput {
  /** COD thực thu tại các điểm dừng của chuyến tài xế chạy */
  codCollected: { amount: number | bigint; collectedAt: Date | string }[];
  /** Phiếu thu DRIVER_COD_REMITTANCE còn hiệu lực */
  codRemittances: { amount: number | bigint }[];
  /** Phiếu chi gắn tài xế (mọi kind), còn hiệu lực */
  expenses: { kind: ExpenseKind; paidBy: ExpensePaidBy; reimbursable: boolean; amount: number | bigint; payrollDeducted?: boolean }[];
  /** Phiếu thu DRIVER_ADVANCE_RETURN còn hiệu lực */
  advanceReturns: { amount: number | bigint }[];
}

export interface DriverLedgerSummary {
  codCollected: Money;
  codRemitted: Money;
  codHeld: Money;
  /** Chi phí tài xế tự chi trước chưa được hoàn */
  companyOwesDriver: Money;
  /** Tạm ứng chuyến còn trong tay tài xế (âm = tài xế đã chi vượt tạm ứng) */
  tripAdvanceOutstanding: Money;
  /** Ứng lương chưa trừ vào bảng lương */
  salaryAdvanceUndeducted: Money;
  /** Tổng tài xế đang giữ/nợ công ty */
  driverOwesCompany: Money;
  /** driverOwesCompany − companyOwesDriver; dương = tài xế nợ công ty */
  netBalance: Money;
}

export function driverLedgerSummary(input: DriverLedgerInput): DriverLedgerSummary {
  const codCollected = sumMoney(input.codCollected.map((c) => c.amount));
  const codRemitted = sumMoney(input.codRemittances.map((c) => c.amount));
  const codHeld = codCollected - codRemitted;
  const driverPaid = sumMoney(
    input.expenses.filter((e) => e.paidBy === 'DRIVER' && e.reimbursable && EXPENSE_KIND[e.kind].isCost).map((e) => e.amount),
  );
  const reimbursed = sumMoney(input.expenses.filter((e) => e.kind === 'DRIVER_REIMBURSEMENT').map((e) => e.amount));
  const companyOwesDriver = driverPaid - reimbursed;
  const advances = sumMoney(input.expenses.filter((e) => e.kind === 'TRIP_ADVANCE').map((e) => e.amount));
  const spentFromAdvance = sumMoney(input.expenses.filter((e) => e.paidBy === 'DRIVER_ADVANCE').map((e) => e.amount));
  const returned = sumMoney(input.advanceReturns.map((r) => r.amount));
  const tripAdvanceOutstanding = advances - spentFromAdvance - returned;
  const salaryAdvanceUndeducted = sumMoney(
    input.expenses.filter((e) => e.kind === 'SALARY_ADVANCE' && !e.payrollDeducted).map((e) => e.amount),
  );
  const driverOwesCompany = codHeld + Math.max(tripAdvanceOutstanding, 0) + salaryAdvanceUndeducted;
  const companyOwesTotal = companyOwesDriver + Math.max(-tripAdvanceOutstanding, 0);
  return {
    codCollected,
    codRemitted,
    codHeld,
    companyOwesDriver: companyOwesTotal,
    tripAdvanceOutstanding,
    salaryAdvanceUndeducted,
    driverOwesCompany,
    netBalance: driverOwesCompany - companyOwesTotal,
  };
}

export interface CodWarningSettings {
  codWarningAmount: number | bigint;
  codWarningDays: number;
}

/** Cảnh báo COD giữ quá số tiền hoặc quá số ngày (tính từ khoản COD cũ nhất chưa nộp). */
export function codWarning(
  codHeld: Money,
  oldestHeldAt: Date | string | null,
  settings: CodWarningSettings,
  asOf: Date = new Date(),
): { overAmount: boolean; overDays: boolean; daysHeld: number } {
  const daysHeld = oldestHeldAt && codHeld > 0 ? Math.max(diffVnDays(oldestHeldAt, asOf), 0) : 0;
  return {
    overAmount: codHeld > 0 && codHeld >= Number(settings.codWarningAmount),
    overDays: codHeld > 0 && daysHeld >= settings.codWarningDays,
    daysHeld,
  };
}

/**
 * FIFO: xác định các khoản COD thu được còn "đang giữ" sau khi trừ số đã nộp (nộp trả khoản cũ nhất trước).
 * Dùng cho danh sách COD chưa nộp và tính tuổi nợ.
 */
export function codHeldItemsFifo<T extends { amount: number | bigint; collectedAt: Date | string }>(
  collected: T[],
  remittedTotal: Money,
): (T & { held: Money; remitted: Money })[] {
  const sorted = [...collected].sort((a, b) => new Date(a.collectedAt).getTime() - new Date(b.collectedAt).getTime());
  let left = remittedTotal;
  const out: (T & { held: Money; remitted: Money })[] = [];
  for (const c of sorted) {
    const amt = Number(c.amount);
    const used = Math.min(Math.max(left, 0), amt);
    left -= used;
    if (amt - used > 0) out.push({ ...c, remitted: used, held: amt - used });
  }
  return out;
}

export interface TripAdvanceReconcile {
  advanceAmount: Money;
  spentFromAdvance: Money;
  returned: Money;
  reimbursed: Money;
  /** dương: tài xế cần nộp lại; âm: công ty cần hoàn thêm cho tài xế; 0: khớp */
  difference: Money;
}

export function tripAdvanceReconcile(input: {
  advances: { amount: number | bigint }[];
  spentFromAdvance: { amount: number | bigint }[];
  returned: { amount: number | bigint }[];
  reimbursed: { amount: number | bigint }[];
}): TripAdvanceReconcile {
  const advanceAmount = sumMoney(input.advances.map((a) => a.amount));
  const spent = sumMoney(input.spentFromAdvance.map((a) => a.amount));
  const returned = sumMoney(input.returned.map((a) => a.amount));
  const reimbursed = sumMoney(input.reimbursed.map((a) => a.amount));
  return {
    advanceAmount,
    spentFromAdvance: spent,
    returned,
    reimbursed,
    difference: advanceAmount - spent - returned + reimbursed,
  };
}

export function isUnpaidSupplierExpense(e: { supplierId?: string | null; paidStatus: PaidStatus; status: DocStatus; paidBy: ExpensePaidBy }): boolean {
  return !!e.supplierId && e.status === 'ACTIVE' && e.paidStatus === 'UNPAID' && e.paidBy === 'COMPANY';
}
