import { afterAll, describe, expect, it } from 'vitest';
import { USERS, errorCode, gql, gqlOk, prisma, testApp } from './helpers';
import { ORDER_FIELDS, createSimpleOrder, futureSlot, seedRefs } from './p3-fixtures';

afterAll(async () => (await testApp()).close());

describe('ORD-001/002 tạo đơn', () => {
  it('đơn 1 xe nhanh: mã DH, thứ tự stop, add-on cộng tổng không tạo chi phí, tạo chuyến gán hết điểm → Đã xếp xe', async () => {
    const r = await seedRefs();
    const res = await createSimpleOrder({ trip: { vehicleId: r.veh1.id, driverId: r.drv1.id, start: futureSlot() } });
    const o = res.order;
    expect(o.code).toMatch(/^DH-\d{6}-\d{4}$/);
    expect(o.stops.map((s: any) => [s.type, s.sequence])).toEqual([['PICKUP', 1], ['DROPOFF', 2]]);
    expect(o.stops[0].address).toContain('Trà Nóc'); // snapshot từ sổ địa chỉ
    expect(o.totalAmount).toBe(10_500_000);
    expect(o.financeSummary.expenseTotal).toBe(0);
    expect(o.routeSummary).toBe('Kho Cần Thơ → Kho Bình Dương');
    expect(res.trip.code).toMatch(/^CX-\d{6}-\d{4}$/);
    expect(o.trips[0].stopCount).toBe(2);
    expect(o.status).toBe('DISPATCHED');
    expect(o.dueDate).toBeTruthy(); // gợi ý hạn thanh toán từ số ngày công nợ mặc định
    const p = await prisma();
    expect(await p.expense.count({ where: { orderId: o.id } })).toBe(0);
  });

  it('đơn 2 điểm lấy 3 điểm trả giữ đúng thứ tự; hàng chỉ bắt buộc tên', async () => {
    const r = await seedRefs();
    const d = await gqlOk(USERS.operation, `mutation($input: CreateOrderInput!) { createOrder(input: $input) { order { ${ORDER_FIELDS} cargoLines { name weightKg } } } }`, {
      input: {
        customerId: r.cus2.id, freightAmount: 35_000_000, dueDate: null,
        stops: [
          { type: 'PICKUP', address: 'Kho A' }, { type: 'PICKUP', address: 'Kho B' },
          { type: 'DROPOFF', address: 'Điểm 1' }, { type: 'DROPOFF', address: 'Điểm 2' }, { type: 'DROPOFF', address: 'Điểm 3', codExpected: 1_000_000 },
        ],
        cargoLines: [{ name: 'Thép' }],
      },
    });
    const o = d.createOrder.order;
    expect(o.stops.map((s: any) => s.address)).toEqual(['Kho A', 'Kho B', 'Điểm 1', 'Điểm 2', 'Điểm 3']);
    expect(o.stops.map((s: any) => s.sequence)).toEqual([1, 2, 3, 4, 5]);
    expect(o.status).toBe('DRAFT');
    expect(o.dueDate).toBeNull();
    expect(o.cargoLines[0]).toEqual({ name: 'Thép', weightKg: null });
    expect(o.routeSummary).toBe('Kho A → Điểm 1, Điểm 2, Điểm 3');
  });

  it('thiếu tên hàng → VALIDATION_ERROR', async () => {
    const r = await seedRefs();
    const res = await gql(USERS.operation, `mutation($input: CreateOrderInput!) { createOrder(input: $input) { order { id } } }`, {
      input: { customerId: r.cus.id, freightAmount: 1, stops: [{ type: 'PICKUP', address: 'A' }, { type: 'DROPOFF', address: 'B' }], cargoLines: [{ name: '' }] },
    });
    expect(errorCode(res)).toBe('VALIDATION_ERROR');
  });
});

describe('Sửa giá nhạy cảm', () => {
  it('đơn đã xác nhận: operation FORBIDDEN, admin thiếu lý do → SENSITIVE_REASON_REQUIRED, có lý do → audit trước/sau', async () => {
    const { order } = await createSimpleOrder();
    const q = `mutation($id: ID!, $input: OrderPricingInput!) { updateOrderPricing(id: $id, input: $input) { freightAmount totalAmount } }`;
    expect(errorCode(await gql(USERS.operation, q, { id: order.id, input: { freightAmount: 12_000_000, reason: 'Khách đồng ý tăng giá' } }))).toBe('FORBIDDEN');
    expect(errorCode(await gql(USERS.admin, q, { id: order.id, input: { freightAmount: 12_000_000 } }))).toBe('SENSITIVE_REASON_REQUIRED');
    const ok = await gqlOk(USERS.admin, q, { id: order.id, input: { freightAmount: 12_000_000, reason: 'Khách đồng ý tăng giá' } });
    expect(ok.updateOrderPricing.totalAmount).toBe(12_500_000);
    const p = await prisma();
    const log = await p.activityLog.findFirstOrThrow({ where: { entityId: order.id, action: 'order.price.update' } });
    expect(log.sensitive).toBe(true);
    expect(log.reason).toBe('Khách đồng ý tăng giá');
    expect((log.before as any).freightAmount).toBe(10_000_000);
    expect((log.after as any).freightAmount).toBe(12_000_000);
  });

  it('đơn nháp: sửa giá tự do không cần lý do', async () => {
    const { order } = await createSimpleOrder({ status: 'DRAFT' });
    const d = await gqlOk(USERS.operation, `mutation($id: ID!) { upsertOrderAddon(orderId: $id, input: { name: "Giao đêm", amount: 300000 }) { totalAmount } }`, { id: order.id });
    expect(d.upsertOrderAddon.totalAmount).toBe(10_800_000);
  });
});

describe('Hủy đơn', () => {
  it('hủy giữ chi phí đã phát sinh và hủy chuyến con; cần quyền + lý do', async () => {
    const r = await seedRefs();
    const { order, trip } = await createSimpleOrder({ trip: { vehicleId: r.veh2.id, driverId: r.drv2.id, start: futureSlot() } });
    const p = await prisma();
    await p.expense.create({ data: { merchantId: r.m.id, code: `PC-TEST-${Date.now()}`, kind: 'TRIP_COST', amount: 700_000n, expenseDate: new Date(), tripId: trip.id, orderId: order.id } });
    const q = `mutation($id: ID!, $r: String!) { cancelOrder(id: $id, reason: $r) { status cancelReason trips { status } financeSummary { expenseTotal profit receivable } } }`;
    expect(errorCode(await gql(USERS.operation, q, { id: order.id, r: 'Khách hủy' }))).toBe('FORBIDDEN');
    expect(errorCode(await gql(USERS.admin, q, { id: order.id, r: '' }))).toBe('SENSITIVE_REASON_REQUIRED');
    const d = await gqlOk(USERS.admin, q, { id: order.id, r: 'Khách hủy do đổi lịch' });
    expect(d.cancelOrder.status).toBe('CANCELLED');
    expect(d.cancelOrder.trips.every((t: any) => t.status === 'CANCELLED')).toBe(true);
    expect(d.cancelOrder.financeSummary.expenseTotal).toBe(700_000);
    expect(d.cancelOrder.financeSummary.receivable).toBe(0);
    expect(d.cancelOrder.financeSummary.profit).toBe(-700_000);
    const hist = await p.statusHistory.findFirst({ where: { entityType: 'TRIP', entityId: trip.id, toStatus: 'CANCELLED' } });
    expect(hist).toBeTruthy();
  });
});

describe('Đồng bộ trạng thái đơn theo chuyến', () => {
  it('chạy chuyến → Đang thực hiện; hoàn thành mọi điểm + chuyến → Hoàn thành; điểm đã hoàn thành không xóa được', async () => {
    const r = await seedRefs();
    const { order, trip } = await createSimpleOrder({ trip: { vehicleId: r.veh1.id, driverId: r.drv2.id, start: futureSlot() } });
    const st = `mutation($id: ID!, $s: String!) { updateTripStatus(id: $id, input: { status: $s }) { status order { status } } }`;
    const t1 = await gqlOk(USERS.operation, st, { id: trip.id, s: 'TO_PICKUP' });
    expect(t1.updateTripStatus.order.status).toBe('IN_PROGRESS');
    const ss = `mutation($id: ID!, $s: String!) { updateStopStatus(id: $id, status: $s) { status orderStatus warnings } }`;
    for (const s of order.stops) await gqlOk(USERS.operation, ss, { id: s.id, s: 'COMPLETED' });
    const rm = await gql(USERS.operation, `mutation($id: ID!) { removeOrderStop(id: $id) { id } }`, { id: order.stops[0].id });
    expect(errorCode(rm)).toBe('BUSINESS_RULE_VIOLATION');
    const t2 = await gqlOk(USERS.operation, st, { id: trip.id, s: 'COMPLETED' });
    expect(t2.updateTripStatus.status).toBe('COMPLETED');
    expect(t2.updateTripStatus.order.status).toBe('COMPLETED');
  });

  it('đổi ngược trạng thái đơn cần status.reverse + lý do', async () => {
    const { order } = await createSimpleOrder();
    const q = `mutation($id: ID!, $s: String!, $r: String) { updateOrderStatus(id: $id, status: $s, reason: $r) { status } }`;
    expect(errorCode(await gql(USERS.operation, q, { id: order.id, s: 'DRAFT', r: 'Khách chưa chốt' }))).toBe('FORBIDDEN');
    const d = await gqlOk(USERS.admin, q, { id: order.id, s: 'DRAFT', r: 'Khách chưa chốt' });
    expect(d.updateOrderStatus.status).toBe('DRAFT');
  });
});

describe('Danh sách & tenant', () => {
  it('orders lọc theo khách + trạng thái, có tiền và cảnh báo', async () => {
    const r = await seedRefs();
    const d = await gqlOk(USERS.accountant, `query($c: ID!) { orders(filter: { customerId: $c, debtStatus: "OVERDUE" }) { totalCount nodes { code overdueDays remainingAmount warnings } } }`, { c: r.cus.id });
    expect(d.orders.totalCount).toBeGreaterThanOrEqual(1);
    expect(d.orders.nodes[0].overdueDays).toBeGreaterThan(0);
    expect(d.orders.nodes[0].warnings.join(' ')).toContain('Quá hạn');
  });

  it('user merchant B không đọc được đơn merchant A', async () => {
    const { order } = await createSimpleOrder();
    const res = await gql(USERS.adminB, `query($id: ID!) { order(id: $id) { id } }`, { id: order.id });
    expect(errorCode(res)).toBe('NOT_FOUND');
  });

  it('chi tiết điểm dừng có lịch sử trạng thái', async () => {
    const { order } = await createSimpleOrder();
    await gqlOk(USERS.operation, `mutation($id: ID!) { updateStopStatus(id: $id, status: "ARRIVED") { status } }`, { id: order.stops[0].id });
    const d = await gqlOk(USERS.operation, `query($id: ID!) { orderStop(id: $id) { status statusHistory { toStatus } podAttachments { id } } }`, { id: order.stops[0].id });
    expect(d.orderStop.statusHistory.map((h: any) => h.toStatus)).toContain('ARRIVED');
  });
});
