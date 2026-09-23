import { describe, expect, it } from 'vitest';
import {
  codHeldItemsFifo,
  codWarning,
  customerCredit,
  driverLedgerSummary,
  orderDebt,
  orderProfit,
  tripAdvanceReconcile,
} from './finance';
import { detectScheduleConflicts } from './schedule';
import { payrollLineTotals, payrollPeriodFor, salaryForPeriod } from './payroll';
import { formatDocCode, periodKey } from './numbering';
import { formatVnd, parseVnd } from './money';
import { isReverseTransition, ORDER_STATUS_FLOW } from './status';
import { effectivePermissions } from './permissions';

const asOf = new Date('2026-09-23T10:00:00+07:00');

describe('Công nợ & doanh thu', () => {
  it('doanh thu = cước + add-on; đơn nháp không phát sinh phải thu; đơn hủy = 0', () => {
    const base = { freightAmount: 12_000_000, addons: [{ amount: 500_000 }], dueDate: '2026-09-13' };
    expect(orderDebt({ ...base, status: 'COMPLETED' }, [{ amount: 5_000_000 }], asOf)).toEqual({ total: 12_500_000, receivable: 12_500_000, paid: 5_000_000, remaining: 7_500_000, overdueDays: 10 });
    expect(orderDebt({ ...base, status: 'DRAFT' }, [], asOf).receivable).toBe(0);
    expect(orderDebt({ ...base, status: 'CANCELLED' }, [], asOf).receivable).toBe(0);
  });

  it('lãi/lỗ chỉ tính chi phí thật; tạm ứng/hoàn ứng không phải chi phí; đơn hủy vẫn lỗ chi phí', () => {
    const p = orderProfit({ status: 'COMPLETED', freightAmount: 20_000_000, addons: [] }, [
      { kind: 'TRIP_COST', status: 'ACTIVE', amount: 800_000 },
      { kind: 'EXTERNAL_TRANSPORT', status: 'ACTIVE', amount: 8_000_000 },
      { kind: 'TRIP_ADVANCE', status: 'ACTIVE', amount: 2_000_000 },
      { kind: 'DRIVER_REIMBURSEMENT', status: 'ACTIVE', amount: 800_000 },
      { kind: 'TRIP_COST', status: 'CANCELLED', amount: 999_999 },
    ]);
    expect(p).toMatchObject({ revenue: 20_000_000, cost: 8_800_000, outsourcedCost: 8_000_000, tripCost: 800_000, profit: 11_200_000, provisional: false });
    const cancelled = orderProfit({ status: 'CANCELLED', freightAmount: 6_000_000, addons: [] }, [{ kind: 'TRIP_COST', status: 'ACTIVE', amount: 1_000_000 }]);
    expect(cancelled.profit).toBe(-1_000_000);
  });

  it('số dư khách = phiếu thu hiệu lực − đã phân bổ', () => {
    expect(customerCredit([
      { amount: 3_000_000, status: 'ACTIVE', allocations: [] },
      { amount: 5_000_000, status: 'ACTIVE', allocations: [{ amount: 5_000_000 }] },
      { amount: 9_000_000, status: 'CANCELLED', allocations: [] },
    ])).toBe(3_000_000);
  });
});

describe('Công nợ tài xế / COD', () => {
  it('COD giữ = thu − nộp; FIFO trừ khoản cũ trước', () => {
    const collected = [
      { amount: 7_500_000, collectedAt: '2026-09-18T10:00:00+07:00' },
      { amount: 1_000_000, collectedAt: '2026-09-20T10:00:00+07:00' },
    ];
    const s = driverLedgerSummary({ codCollected: collected, codRemittances: [{ amount: 2_000_000 }], expenses: [], advanceReturns: [] });
    expect(s.codHeld).toBe(6_500_000);
    const items = codHeldItemsFifo(collected, 2_000_000);
    expect(items[0]).toMatchObject({ held: 5_500_000, remitted: 2_000_000 });
    expect(codWarning(s.codHeld, items[0].collectedAt, { codWarningAmount: 5_000_000, codWarningDays: 2 }, asOf)).toMatchObject({ overAmount: true, overDays: true, daysHeld: 5 });
  });

  it('2 chiều: tài xế chi trước (công ty nợ) và tạm ứng/ứng lương (tài xế nợ)', () => {
    const s = driverLedgerSummary({
      codCollected: [], codRemittances: [], advanceReturns: [],
      expenses: [
        { kind: 'TRIP_COST', paidBy: 'DRIVER', reimbursable: true, amount: 800_000 },
        { kind: 'DRIVER_REIMBURSEMENT', paidBy: 'COMPANY', reimbursable: false, amount: 300_000 },
        { kind: 'TRIP_ADVANCE', paidBy: 'COMPANY', reimbursable: false, amount: 2_000_000 },
        { kind: 'TRIP_COST', paidBy: 'DRIVER_ADVANCE', reimbursable: false, amount: 500_000 },
        { kind: 'SALARY_ADVANCE', paidBy: 'COMPANY', reimbursable: false, amount: 1_000_000 },
        { kind: 'SALARY_ADVANCE', paidBy: 'COMPANY', reimbursable: false, amount: 700_000, payrollDeducted: true },
      ],
    });
    expect(s).toMatchObject({ companyOwesDriver: 500_000, tripAdvanceOutstanding: 1_500_000, salaryAdvanceUndeducted: 1_000_000, driverOwesCompany: 2_500_000, netBalance: 2_000_000 });
  });

  it('đối soát tạm ứng', () => {
    expect(tripAdvanceReconcile({ advances: [{ amount: 2_000_000 }], spentFromAdvance: [{ amount: 800_000 }], returned: [], reimbursed: [] }).difference).toBe(1_200_000);
    expect(tripAdvanceReconcile({ advances: [{ amount: 1_000_000 }], spentFromAdvance: [{ amount: 1_300_000 }], returned: [], reimbursed: [] }).difference).toBe(-300_000);
  });
});

describe('Điều phối, lương, mã, tiền', () => {
  it('trùng / gần trùng lịch', () => {
    const w = detectScheduleConflicts(
      { start: '2026-09-24T07:00:00+07:00', end: '2026-09-24T12:00:00+07:00' },
      [
        { id: 'a', code: 'CX-1', start: '2026-09-24T11:00:00+07:00', end: '2026-09-24T15:00:00+07:00' },
        { id: 'b', code: 'CX-2', start: '2026-09-24T13:00:00+07:00', end: null },
        { id: 'c', code: 'CX-3', start: '2026-09-25T13:00:00+07:00' },
      ],
      { subject: 'VEHICLE', subjectId: 'v', nearOverlapMinutes: 120, defaultTripHours: 8 },
    );
    expect(w.map((x) => [x.conflictTripCode, x.type, x.gapMinutes])).toEqual([['CX-1', 'OVERLAP', 0], ['CX-2', 'NEAR_OVERLAP', 60]]);
  });

  it('kỳ lương + mốc lương hiệu lực + thực lãnh', () => {
    expect(payrollPeriodFor(2026, 9, 'MONTHLY')).toMatchObject({ from: '2026-09-01', to: '2026-09-30' });
    expect(payrollPeriodFor(2026, 9, 'CUSTOM', 5)).toMatchObject({ from: '2026-09-05', to: '2026-10-04' });
    const hist = [{ amount: 9_000_000, effectiveFrom: '2026-01-01' }, { amount: 10_000_000, effectiveFrom: '2026-09-15' }];
    expect(salaryForPeriod(hist, '2026-08-31')?.amount).toBe(9_000_000);
    expect(salaryForPeriod(hist, '2026-09-30')?.amount).toBe(10_000_000);
    expect(payrollLineTotals([
      { type: 'BASE', amount: 10_000_000 }, { type: 'BONUS', amount: 1_500_000 }, { type: 'ADVANCE', amount: 2_000_000 },
      { type: 'DEDUCTION', amount: 500_000 }, { type: 'ADJUSTMENT', amount: -100_000 },
    ]).net).toBe(8_900_000);
  });

  it('mã chứng từ, tiền, trạng thái ngược, quyền', () => {
    const at = new Date('2026-09-23T10:00:00+07:00');
    expect(formatDocCode({ prefix: 'DH', separator: '-', datePart: 'YYYYMM', digits: 4, resetPeriod: 'MONTHLY' }, 1, at)).toBe('DH-202609-0001');
    expect(periodKey('YEARLY', at)).toBe('2026');
    expect(formatVnd(1250000)).toBe('1.250.000 đ');
    expect(parseVnd('1.250.000 đ')).toBe(1250000);
    expect(isReverseTransition(ORDER_STATUS_FLOW, 'COMPLETED', 'IN_PROGRESS')).toBe(true);
    expect(effectivePermissions('OPERATION')).not.toContain('order.price.update');
    expect(effectivePermissions('OPERATION', ['order.price.update'])).toContain('order.price.update');
    expect(effectivePermissions('ACCOUNTANT', [], { 'order.create': 'ALLOWED' })).toContain('order.create');
  });
});
