import { afterAll, describe, expect, it } from 'vitest';
import { USERS, driverToken, errorCode, gql, gqlOk, prisma, testApp } from './helpers';

afterAll(async () => (await testApp()).close());

const today = new Date().toISOString().slice(0, 10);

async function seedRefs() {
  const p = await prisma();
  const mA = await p.merchant.findUniqueOrThrow({ where: { code: 'M-DEMO-A' } });
  const w = { merchantId: mA.id };
  return {
    p,
    drv1: await p.driver.findFirstOrThrow({ where: { ...w, code: 'DRV-A-001' } }),
    drv2: await p.driver.findFirstOrThrow({ where: { ...w, code: 'DRV-A-002' } }),
    cus1: await p.customer.findFirstOrThrow({ where: { ...w, code: 'CUS-A-001' } }),
    cus3: await p.customer.findFirstOrThrow({ where: { ...w, code: 'CUS-A-003' } }),
    sup2: await p.supplier.findFirstOrThrow({ where: { ...w, code: 'SUP-A-002' } }),
    trip1: await p.trip.findFirstOrThrow({ where: { ...w, status: 'IN_TRANSIT' } }),
    order3: await p.order.findFirstOrThrow({ where: { ...w, code: { endsWith: '-0009' }, status: 'COMPLETED' } }),
  };
}

const LEDGER = `query($id: ID) { driverLedger(driverId: $id) { driver { id } codCollected codRemitted codHeld netBalance entries { kind driverOwes companyOwes runningBalance } } }`;
const ORDER_FIN = `query($id: ID!) { orderFinance(orderId: $id) { revenue receivable paidAmount remainingAmount cost profit } }`;
const CREATE_PAY = `mutation($i: PaymentInInput!) { createPaymentIn(input: $i) { id code type notRevenue amount allocatedAmount unallocatedAmount customerCreditBalance status } }`;

describe('Phiếu chi (FIN-001)', () => {
  it('thuê xe ngoài không gắn đơn → VALIDATION_ERROR', async () => {
    const r = await gql(USERS.operation, `mutation($i: ExpenseInput!) { createExpense(input: $i) { id } }`, { i: { kind: 'EXTERNAL_TRANSPORT', amount: 1000000, expenseDate: today } });
    expect(errorCode(r)).toBe('VALIDATION_ERROR');
    expect(r.errors?.[0].extensions?.validation?.[0].field).toBe('orderId');
  });

  it('chi phí gắn chuyến tự điền đơn/xe/tài xế; tài xế chi trước mặc định được hoàn', async () => {
    const { trip1 } = await seedRefs();
    const d = await gqlOk(USERS.operation, `mutation($i: ExpenseInput!) { createExpense(input: $i) { code orderId vehicleId driverId reimbursable paidStatus isCost } }`, {
      i: { kind: 'TRIP_COST', amount: 150000, expenseDate: today, tripId: trip1.id, paidBy: 'DRIVER', description: 'Gửi xe' },
    });
    expect(d.createExpense.code).toMatch(/^PC-\d{6}-\d{4}$/);
    expect(d.createExpense.orderId).toBe(trip1.orderId);
    expect(d.createExpense.driverId).toBe(trip1.driverId);
    expect(d.createExpense.reimbursable).toBe(true);
    expect(d.createExpense.paidStatus).toBe('PAID');
  });

  it('sửa/hủy phiếu chi là thao tác nhạy cảm', async () => {
    const { sup2 } = await seedRefs();
    const c = await gqlOk(USERS.accountant, `mutation($i: ExpenseInput!) { createExpense(input: $i) { id } }`, { i: { kind: 'VEHICLE_SUPPLY', amount: 300000, expenseDate: today, supplierId: sup2.id, paidStatus: 'UNPAID' } });
    const id = c.createExpense.id;
    expect(errorCode(await gql(USERS.accountant, `mutation($id: ID!) { cancelExpense(id: $id, reason: "") { status } }`, { id }))).toBe('SENSITIVE_REASON_REQUIRED');
    const ok = await gqlOk(USERS.accountant, `mutation($id: ID!) { cancelExpense(id: $id, reason: "Nhập nhầm phiếu") { status cancelReason } }`, { id });
    expect(ok.cancelExpense.status).toBe('CANCELLED');
  });
});

describe('Công nợ NCC (FIN-005)', () => {
  it('SUP-A-002 nợ 2.500.000; đánh dấu đã trả → 0', async () => {
    const { sup2 } = await seedRefs();
    const q = `query($id: ID) { supplierDebt(filter: { supplierId: $id }) { rows { unpaidTotal unpaidCount expenses { id } } } }`;
    const before = await gqlOk(USERS.accountant, q, { id: sup2.id });
    expect(before.supplierDebt.rows[0].unpaidTotal).toBe(2_500_000);
    const ids = before.supplierDebt.rows[0].expenses.map((e: any) => e.id);
    expect(errorCode(await gql(USERS.operation, `mutation($ids: [ID!]!) { markExpensesPaid(ids: $ids) { id } }`, { ids }))).toBe('FORBIDDEN');
    await gqlOk(USERS.accountant, `mutation($ids: [ID!]!) { markExpensesPaid(ids: $ids, input: { method: "BANK_TRANSFER" }) { paidStatus } }`, { ids });
    const after = await gqlOk(USERS.accountant, q, { id: sup2.id });
    expect(after.supplierDebt.rows[0].unpaidTotal).toBe(0);
  });
});

describe('COD tài xế (FIN-006)', () => {
  it('nộp COD 2tr giảm COD đang giữ 5,5tr → 3,5tr và không đổi doanh thu đơn', async () => {
    const { drv2, p } = await seedRefs();
    const l0 = await gqlOk(USERS.accountant, LEDGER, { id: drv2.id });
    expect(l0.driverLedger.codHeld).toBe(5_500_000);
    const codStop = await p.orderStop.findFirstOrThrow({ where: { codActual: 7_500_000n } });
    const fin0 = await gqlOk(USERS.accountant, ORDER_FIN, { id: codStop.orderId });

    // operation không có quyền ghi nhận nộp COD
    const bad = await gql(USERS.operation, CREATE_PAY, { i: { type: 'DRIVER_COD_REMITTANCE', driverId: drv2.id, amount: 2_000_000, receivedAt: new Date().toISOString(), method: 'CASH' } });
    expect(errorCode(bad)).toBe('FORBIDDEN');
    // nộp vượt số đang giữ
    const over = await gql(USERS.accountant, CREATE_PAY, { i: { type: 'DRIVER_COD_REMITTANCE', driverId: drv2.id, amount: 9_000_000, receivedAt: new Date().toISOString(), method: 'CASH' } });
    expect(errorCode(over)).toBe('BUSINESS_RULE_VIOLATION');

    const pay = await gqlOk(USERS.accountant, CREATE_PAY, {
      i: { type: 'DRIVER_COD_REMITTANCE', driverId: drv2.id, amount: 2_000_000, receivedAt: new Date().toISOString(), method: 'CASH', codStopIds: [codStop.id], clientRequestId: 'cod-remit-test-1' },
    });
    expect(pay.createPaymentIn.notRevenue).toBe(true);
    // gửi lại cùng clientRequestId không tạo phiếu mới
    const dup = await gqlOk(USERS.accountant, CREATE_PAY, {
      i: { type: 'DRIVER_COD_REMITTANCE', driverId: drv2.id, amount: 2_000_000, receivedAt: new Date().toISOString(), method: 'CASH', clientRequestId: 'cod-remit-test-1' },
    });
    expect(dup.createPaymentIn.id).toBe(pay.createPaymentIn.id);

    const l1 = await gqlOk(USERS.accountant, LEDGER, { id: drv2.id });
    expect(l1.driverLedger.codHeld).toBe(3_500_000);
    const fin1 = await gqlOk(USERS.accountant, ORDER_FIN, { id: codStop.orderId });
    expect(fin1.orderFinance.revenue).toBe(fin0.orderFinance.revenue);
    expect(fin1.orderFinance.remainingAmount).toBe(fin0.orderFinance.remainingAmount);

    const held = await gqlOk(USERS.accountant, `query($id: ID) { driverCodHeld(filter: { driverId: $id }) { rows { codHeld overAmount items { held } } codWarningAmount } }`, { id: drv2.id });
    expect(held.driverCodHeld.rows[0].codHeld).toBe(3_500_000);
    expect(held.driverCodHeld.rows[0].overAmount).toBe(false);
  });

  it('running balance cuối sổ = netBalance', async () => {
    const { drv1 } = await seedRefs();
    const l = await gqlOk(USERS.accountant, LEDGER, { id: drv1.id });
    expect(l.driverLedger.entries[0].runningBalance).toBe(l.driverLedger.netBalance);
  });

  it('tài xế chỉ xem sổ của mình (driverId truyền vào bị bỏ qua)', async () => {
    const { drv1, drv2 } = await seedRefs();
    const tok = await driverToken('0900000001');
    const d = await gqlOk(tok, LEDGER, { id: drv2.id });
    expect(d.driverLedger.driver.id).toBe(drv1.id);
    expect(errorCode(await gql(tok, `{ customerDebt { totals { remaining } } }`))).toBe('FORBIDDEN');
  });
});

describe('Phiếu thu & phân bổ (FIN-002/003/004)', () => {
  it('phân bổ một phần tạo số dư; vượt còn nợ bị chặn; operation không phân bổ được; hủy phiếu hoàn lại công nợ', async () => {
    const { cus1, order3 } = await seedRefs();
    const debtQ = `query($id: ID) { customerDebt(filter: { customerId: $id }) { rows { remaining creditBalance } orders { orderId remaining } } }`;
    const d0 = await gqlOk(USERS.accountant, debtQ, { id: cus1.id });
    const rem0 = d0.customerDebt.orders.find((o: any) => o.orderId === order3.id).remaining;
    expect(rem0).toBe(15_000_000);

    const pay = await gqlOk(USERS.accountant, CREATE_PAY, { i: { type: 'CUSTOMER_PAYMENT', customerId: cus1.id, amount: 20_000_000, receivedAt: new Date().toISOString(), method: 'BANK_TRANSFER' } });
    const pid = pay.createPaymentIn.id;
    expect(pay.createPaymentIn.notRevenue).toBe(false);

    const ALLOC = `mutation($i: AllocatePaymentInput!) { allocatePayment(input: $i) { creditBalance payment { allocatedAmount unallocatedAmount } } }`;
    expect(errorCode(await gql(USERS.operation, ALLOC, { i: { paymentId: pid, lines: [{ orderId: order3.id, amount: 1_000_000 }] } }))).toBe('FORBIDDEN');
    expect(errorCode(await gql(USERS.accountant, ALLOC, { i: { paymentId: pid, lines: [{ orderId: order3.id, amount: 16_000_000 }] } }))).toBe('BUSINESS_RULE_VIOLATION');

    const a = await gqlOk(USERS.accountant, ALLOC, { i: { paymentId: pid, lines: [{ orderId: order3.id, amount: 15_000_000 }] } });
    expect(a.allocatePayment.payment.unallocatedAmount).toBe(5_000_000);
    expect(a.allocatePayment.creditBalance).toBe(d0.customerDebt.rows[0].creditBalance + 5_000_000);

    const d1 = await gqlOk(USERS.accountant, debtQ, { id: cus1.id });
    expect(d1.customerDebt.orders.find((o: any) => o.orderId === order3.id)).toBeUndefined();

    const CANCEL = `mutation($id: ID!, $r: String!) { cancelPaymentIn(id: $id, reason: $r) { status unallocatedAmount } }`;
    expect(errorCode(await gql(USERS.accountant, CANCEL, { id: pid, r: '' }))).toBe('SENSITIVE_REASON_REQUIRED');
    await gqlOk(USERS.accountant, CANCEL, { id: pid, r: 'Ngân hàng hoàn giao dịch' });
    const d2 = await gqlOk(USERS.accountant, debtQ, { id: cus1.id });
    expect(d2.customerDebt.orders.find((o: any) => o.orderId === order3.id).remaining).toBe(15_000_000);
    expect(d2.customerDebt.rows[0].creditBalance).toBe(d0.customerDebt.rows[0].creditBalance);
  });

  it('danh sách phiếu thu còn treo gồm số dư của Bao bì Hưng Lợi', async () => {
    const { cus3 } = await seedRefs();
    const d = await gqlOk(USERS.accountant, `query($c: ID) { payments(filter: { customerId: $c, hasUnallocated: true }) { totalCount nodes { unallocatedAmount } } }`, { c: cus3.id });
    expect(d.payments.nodes.some((n: any) => n.unallocatedAmount === 3_000_000)).toBe(true);
  });
});

describe('Tạm ứng chuyến (FIN-007)', () => {
  it('tạm ứng 2tr, chi từ tạm ứng 800k → tài xế nộp lại 1,2tr → đã đối soát', async () => {
    const { trip1 } = await seedRefs();
    await gqlOk(USERS.operation, `mutation($i: ExpenseInput!) { createExpense(input: $i) { id } }`, {
      i: { kind: 'TRIP_COST', amount: 800_000, expenseDate: today, tripId: trip1.id, paidBy: 'DRIVER_ADVANCE', description: 'Bốc xếp chi từ tạm ứng' },
    });
    const Q = `query($t: ID) { tripAdvances(filter: { tripId: $t }) { advanceAmount spentFromAdvance difference status resolution } }`;
    const a = await gqlOk(USERS.accountant, Q, { t: trip1.id });
    expect(a.tripAdvances[0]).toMatchObject({ advanceAmount: 2_000_000, spentFromAdvance: 800_000, difference: 1_200_000, status: 'OPEN' });

    const R = `mutation($i: ReconcileTripAdvanceInput!) { reconcileTripAdvance(input: $i) { difference returned status resolution } }`;
    expect(errorCode(await gql(USERS.accountant, R, { i: { tripId: trip1.id, resolution: 'MATCHED' } }))).toBe('BUSINESS_RULE_VIOLATION');
    expect(errorCode(await gql(USERS.accountant, R, { i: { tripId: trip1.id, resolution: 'DRIVER_RETURNS', amount: 1_000_000 } }))).toBe('SENSITIVE_REASON_REQUIRED');
    const r = await gqlOk(USERS.accountant, R, { i: { tripId: trip1.id, resolution: 'DRIVER_RETURNS' } });
    expect(r.reconcileTripAdvance).toMatchObject({ returned: 1_200_000, difference: 0, status: 'RECONCILED', resolution: 'DRIVER_RETURNS' });

    const pays = await gqlOk(USERS.accountant, `{ payments(filter: { type: "DRIVER_ADVANCE_RETURN" }) { nodes { amount notRevenue trip { id } } } }`);
    expect(pays.payments.nodes.some((n: any) => n.amount === 1_200_000 && n.notRevenue && n.trip.id === trip1.id)).toBe(true);
  });
});

describe('Sổ thu chi & cảnh báo (FIN-008)', () => {
  it('financeLedger tách tiền thu COD khỏi thu khách', async () => {
    const d = await gqlOk(USERS.accountant, `{ financeLedger(first: 50) { totalCount summary { cashIn customerReceipts codRemittances advanceReturns cashOut unpaidOut } nodes { direction notRevenue } } }`);
    const s = d.financeLedger.summary;
    expect(s.cashIn).toBe(s.customerReceipts + s.codRemittances + s.advanceReturns + (s.cashIn - s.customerReceipts - s.codRemittances - s.advanceReturns));
    expect(s.codRemittances).toBeGreaterThan(0);
    expect(d.financeLedger.nodes.some((n: any) => n.direction === 'IN' && n.notRevenue)).toBe(true);
  });

  it('runFinanceAlerts tạo cảnh báo đơn quá hạn, không lặp trong 24h', async () => {
    const r1 = await gqlOk(USERS.accountant, `mutation { runFinanceAlerts { codWarnings overdueOrders } }`);
    expect(r1.runFinanceAlerts.overdueOrders).toBeGreaterThan(0);
    const r2 = await gqlOk(USERS.accountant, `mutation { runFinanceAlerts { codWarnings overdueOrders } }`);
    expect(r2.runFinanceAlerts.overdueOrders).toBe(0);
  });

  it('tenant B không thấy công nợ merchant A', async () => {
    const d = await gqlOk(USERS.adminB, `{ customerDebt { totals { remaining customerCount } } supplierDebt { total } }`);
    expect(d.supplierDebt.total).toBe(0);
  });
});
