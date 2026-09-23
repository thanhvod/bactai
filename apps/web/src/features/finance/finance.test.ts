import { describe, expect, it } from 'vitest';
import { autoFillOldestFirst } from './pages/PaymentAllocatePage';
import { suggestedResolution } from './pages/TripAdvancePage';
import { emptyExpense, toExpenseInput, validateExpense } from './components/ExpenseFormBody';

describe('Phân bổ tự điền theo hạn cũ nhất (WM-PAY-04)', () => {
  const orders = [
    { orderId: 'b', remaining: 5_000_000, dueDate: '2026-09-20T00:00:00Z', orderDate: '2026-09-01' },
    { orderId: 'a', remaining: 15_000_000, dueDate: '2026-09-13T00:00:00Z', orderDate: '2026-08-20' },
    { orderId: 'c', remaining: 7_000_000, dueDate: null, orderDate: '2026-09-02' },
    { orderId: 'paid', remaining: 0, dueDate: '2026-09-01T00:00:00Z', orderDate: '2026-08-01' },
  ];
  it('ưu tiên hạn sớm nhất, không vượt số tiền phiếu, bỏ qua đơn đã đủ', () => {
    expect(autoFillOldestFirst(orders, 18_000_000)).toEqual({ a: 15_000_000, b: 3_000_000 });
  });
  it('dư tiền → điền hết các đơn, phần còn lại thành số dư', () => {
    const r = autoFillOldestFirst(orders, 30_000_000);
    expect(Object.values(r).reduce((s, v) => s + v, 0)).toBe(27_000_000);
  });
});

describe('Đối soát tạm ứng (WM-ADV-01)', () => {
  it('gợi ý cách xử lý theo dấu chênh lệch', () => {
    expect(suggestedResolution(1_200_000)).toBe('DRIVER_RETURNS');
    expect(suggestedResolution(-300_000)).toBe('COMPANY_REIMBURSES');
    expect(suggestedResolution(0)).toBe('MATCHED');
  });
});

describe('Form phiếu chi (WM-EXP-03)', () => {
  it('thuê xe ngoài bắt buộc đơn + NCC', () => {
    const s = { ...emptyExpense('EXTERNAL_TRANSPORT'), amount: 8_000_000 };
    const e = validateExpense(s);
    expect(e.orderId).toBeTruthy();
    expect(e.supplierId).toBeTruthy();
  });
  it('chi phí chuyến tài xế chi trước → hoàn tài xế, cần tài xế', () => {
    const s = { ...emptyExpense('TRIP_COST'), amount: 800_000, tripId: 't1', paidBy: 'DRIVER' as const, reimbursable: true };
    expect(validateExpense(s).driverId).toBeTruthy();
    const ok = toExpenseInput({ ...s, driverId: 'd1' });
    expect(ok).toMatchObject({ paidBy: 'DRIVER', reimbursable: true, paidStatus: 'PAID', driverId: 'd1' });
  });
  it('ứng lương luôn công ty chi, không tính chưa trả', () => {
    const input = toExpenseInput({ ...emptyExpense('SALARY_ADVANCE'), amount: 1_000_000, driverId: 'd1', paidStatus: 'UNPAID' });
    expect(input).toMatchObject({ paidBy: 'COMPANY', paidStatus: 'PAID', reimbursable: false });
  });
  it('chưa trả chỉ khi công ty chi và có NCC', () => {
    const s = { ...emptyExpense('VEHICLE_SUPPLY'), amount: 2_500_000, vehicleId: 'v1', paidStatus: 'UNPAID' as const };
    expect(validateExpense(s).paidStatus).toBeTruthy();
    expect(validateExpense({ ...s, supplierId: 's1' }).paidStatus).toBeUndefined();
  });
});
