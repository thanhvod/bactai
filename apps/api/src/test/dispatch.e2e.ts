import { afterAll, describe, expect, it } from 'vitest';
import { USERS, errorCode, gql, gqlOk, prisma, testApp } from './helpers';
import { createSimpleOrder, futureSlot, seedRefs } from './p3-fixtures';

afterAll(async () => (await testApp()).close());

const CREATE_TRIP = `mutation($input: TripInput!) { createTrip(input: $input) { trip { id code status vehicle { plate } } warnings { type subject gapMinutes overrideReason } notices } }`;

describe('DIS-002 trùng lịch', () => {
  it('không override → BUSINESS_RULE_VIOLATION kèm warnings; operation override → FORBIDDEN; admin override → lưu ScheduleWarning', async () => {
    const r = await seedRefs();
    const start = futureSlot(8);
    await createSimpleOrder({ trip: { vehicleId: r.veh2.id, driverId: r.drv1.id, start } });
    const { order } = await createSimpleOrder();
    const input = { orderId: order.id, vehicleId: r.veh2.id, driverId: r.drv2.id, plannedStartAt: new Date(start.getTime() + 3600_000).toISOString() };
    const res = await gql(USERS.operation, CREATE_TRIP, { input });
    expect(errorCode(res)).toBe('BUSINESS_RULE_VIOLATION');
    expect((res.errors![0].extensions as any).details.warnings[0].type).toBe('OVERLAP');
    expect(errorCode(await gql(USERS.operation, CREATE_TRIP, { input: { ...input, overrideReason: 'Xe về sớm kịp' } }))).toBe('FORBIDDEN');
    const ok = await gqlOk(USERS.admin, CREATE_TRIP, { input: { ...input, overrideReason: 'Xe về sớm kịp' } });
    expect(ok.createTrip.warnings[0].overrideReason).toBe('Xe về sớm kịp');
    const p = await prisma();
    const w = await p.scheduleWarning.findFirstOrThrow({ where: { tripId: ok.createTrip.trip.id } });
    expect(w.overrideReason).toBe('Xe về sớm kịp');
    const list = await gqlOk(USERS.operation, `query($t: ID!) { scheduleWarnings(filter: { tripId: $t }) { totalCount nodes { status overrideReason trip { code } conflictTrip { code } } } }`, { t: ok.createTrip.trip.id });
    expect(list.scheduleWarnings.nodes[0].status).toBe('OVERRIDDEN');
  });

  it('gần trùng (cách < ngưỡng) được phát hiện qua checkTripOverlap', async () => {
    const r = await seedRefs();
    const start = futureSlot(6);
    await createSimpleOrder({ trip: { vehicleId: r.veh1.id, driverId: r.drv2.id, start } });
    const d = await gqlOk(USERS.operation, `query($i: CheckTripOverlapInput!) { checkTripOverlap(input: $i) { type subject gapMinutes thresholdMinutes } }`, {
      i: { vehicleId: r.veh1.id, plannedStartAt: new Date(start.getTime() + 9 * 3600_000).toISOString() },
    });
    expect(d.checkTripOverlap[0]).toMatchObject({ type: 'NEAR_OVERLAP', subject: 'VEHICLE', gapMinutes: 60, thresholdMinutes: 120 });
  });

  it('tài xế ngừng hoạt động không gán được; xe bảo dưỡng chỉ cảnh báo', async () => {
    const r = await seedRefs();
    const { order } = await createSimpleOrder();
    const bad = await gql(USERS.operation, CREATE_TRIP, { input: { orderId: order.id, vehicleId: r.veh1.id, driverId: r.drv3.id, plannedStartAt: futureSlot().toISOString() } });
    expect(errorCode(bad)).toBe('BUSINESS_RULE_VIOLATION');
    const ok = await gqlOk(USERS.operation, CREATE_TRIP, { input: { orderId: order.id, vehicleId: r.veh3.id, driverId: r.drv1.id, plannedStartAt: futureSlot().toISOString() } });
    expect(ok.createTrip.notices[0]).toContain('bảo dưỡng');
  });
});

describe('DIS-004 trạng thái chuyến', () => {
  it('tạm dừng cần lý do; tiếp tục về trạng thái trước; đổi ngược cần quyền', async () => {
    const r = await seedRefs();
    const { trip } = await createSimpleOrder({ trip: { vehicleId: r.veh2.id, driverId: r.drv2.id, start: futureSlot() } });
    const st = `mutation($id: ID!, $input: TripStatusChangeInput!) { updateTripStatus(id: $id, input: $input) { status previousStatusBeforePause pauseReasonLabel } }`;
    await gqlOk(USERS.operation, st, { id: trip.id, input: { status: 'TO_PICKUP' } });
    await gqlOk(USERS.operation, st, { id: trip.id, input: { status: 'PICKING_UP' } });
    await gqlOk(USERS.operation, st, { id: trip.id, input: { status: 'IN_TRANSIT' } });
    expect(errorCode(await gql(USERS.operation, st, { id: trip.id, input: { status: 'PAUSED' } }))).toBe('VALIDATION_ERROR');
    const p = await prisma();
    const reason = await p.catalogItem.findFirstOrThrow({ where: { merchantId: r.m.id, type: 'PAUSE_REASON', code: 'FERRY' } });
    const paused = await gqlOk(USERS.operation, st, { id: trip.id, input: { status: 'PAUSED', pauseReasonId: reason.id, note: 'Chờ phà Cần Thơ' } });
    expect(paused.updateTripStatus).toMatchObject({ status: 'PAUSED', previousStatusBeforePause: 'IN_TRANSIT', pauseReasonLabel: 'Chờ phà / chờ cầu' });
    const resumed = await gqlOk(USERS.operation, `mutation($id: ID!) { resumeTrip(id: $id) { status resumedAt } }`, { id: trip.id });
    expect(resumed.resumeTrip.status).toBe('IN_TRANSIT');
    expect(errorCode(await gql(USERS.operation, st, { id: trip.id, input: { status: 'TO_PICKUP', reason: 'Bấm nhầm trạng thái' } }))).toBe('FORBIDDEN');
    expect(errorCode(await gql(USERS.admin, st, { id: trip.id, input: { status: 'TO_PICKUP' } }))).toBe('SENSITIVE_REASON_REQUIRED');
    const back = await gqlOk(USERS.admin, st, { id: trip.id, input: { status: 'TO_PICKUP', reason: 'Bấm nhầm trạng thái' } });
    expect(back.updateTripStatus.status).toBe('TO_PICKUP');
  });

  it('COD: nhập lần đầu không cần lý do; sửa sau cần cod.update + lý do (operation FORBIDDEN)', async () => {
    const r = await seedRefs();
    const { order } = await createSimpleOrder({ codExpected: 2_000_000, trip: { vehicleId: r.veh1.id, driverId: r.drv1.id, start: futureSlot() } });
    const drop = order.stops.find((s: any) => s.type === 'DROPOFF');
    const q = `mutation($id: ID!, $a: Money!, $r: String) { updateStopCodActual(id: $id, amount: $a, reason: $r) { codActual warnings } }`;
    const first = await gqlOk(USERS.operation, q, { id: drop.id, a: 1_500_000 });
    expect(first.updateStopCodActual.codActual).toBe(1_500_000);
    expect(first.updateStopCodActual.warnings[0]).toContain('khác dự kiến');
    expect(errorCode(await gql(USERS.operation, q, { id: drop.id, a: 2_000_000, r: 'Nhập sai số' }))).toBe('FORBIDDEN');
    const edit = await gqlOk(USERS.admin, q, { id: drop.id, a: 2_000_000, r: 'Tài xế nhập sai số' });
    expect(edit.updateStopCodActual.codActual).toBe(2_000_000);
    const p = await prisma();
    const log = await p.activityLog.findFirstOrThrow({ where: { entityId: drop.id, action: 'cod.update' } });
    expect((log.before as any).codActual).toBe(1_500_000);
  });

  it('bỏ qua điểm dừng cần lý do', async () => {
    const { order } = await createSimpleOrder();
    const q = `mutation($id: ID!, $r: String) { updateStopStatus(id: $id, status: "SKIPPED", reason: $r) { status } }`;
    expect(errorCode(await gql(USERS.operation, q, { id: order.stops[1].id }))).toBe('SENSITIVE_REASON_REQUIRED');
    expect((await gqlOk(USERS.operation, q, { id: order.stops[1].id, r: 'Khách đổi điểm' })).updateStopStatus.status).toBe('SKIPPED');
  });
});

describe('DIS-005 sự cố', () => {
  it('tạo → giao người xử lý → đóng (ghi chú bắt buộc)', async () => {
    const r = await seedRefs();
    const { trip } = await createSimpleOrder({ trip: { vehicleId: r.veh2.id, driverId: r.drv1.id, start: futureSlot() } });
    const inc = await gqlOk(USERS.operation, `mutation($t: ID!) { createIncident(input: { title: "Hư xe", severity: "HIGH", tripId: $t }) { id code status orderCode vehiclePlate } }`, { t: trip.id });
    expect(inc.createIncident.code).toMatch(/^SC-/);
    expect(inc.createIncident.orderCode).toMatch(/^DH-/);
    const p = await prisma();
    const op = await p.merchantUser.findFirstOrThrow({ where: { email: 'operation@bta-demo.test' } });
    const a = await gqlOk(USERS.admin, `mutation($id: ID!, $u: ID!) { assignIncident(id: $id, userId: $u) { status assigneeName } }`, { id: inc.createIncident.id, u: op.id });
    expect(a.assignIncident.status).toBe('IN_PROGRESS');
    expect(await p.notification.count({ where: { recipientId: op.id, type: 'INCIDENT_ASSIGNED', entityId: inc.createIncident.id } })).toBe(1);
    expect(errorCode(await gql(USERS.operation, `mutation($id: ID!) { closeIncident(id: $id, note: "") { status } }`, { id: inc.createIncident.id }))).toBe('VALIDATION_ERROR');
    const c = await gqlOk(USERS.operation, `mutation($id: ID!) { closeIncident(id: $id, note: "Đã thay xe khác") { status resolvedNote activity { action } } }`, { id: inc.createIncident.id });
    expect(c.closeIncident.status).toBe('RESOLVED');
  });
});

describe('Điều phối: lịch, tóm tắt, vị trí, tìm kiếm, thuê ngoài', () => {
  it('vehicleSchedules có khối chuyến; dispatchSummary; lastKnownLocations; globalSearch', async () => {
    const r = await seedRefs();
    const start = futureSlot(9);
    const { trip } = await createSimpleOrder({ trip: { vehicleId: r.veh2.id, driverId: r.drv2.id, start } });
    const day = new Date(start.getTime() + 7 * 3600_000).toISOString().slice(0, 10);
    const s = await gqlOk(USERS.operation, `query($d: String) { vehicleSchedules(date: $d) { resource { label } blocks { code warning } } driverSchedules(date: $d) { resource { label } blocks { code } } dispatchSummary(date: $d) { total running } }`, { d: day });
    expect(s.vehicleSchedules.find((x: any) => x.resource.label === '51D-678.90').blocks.map((b: any) => b.code)).toContain(trip.code);
    expect(s.dispatchSummary.total).toBeGreaterThanOrEqual(1);
    const loc = await gqlOk(USERS.operation, `{ lastKnownLocations { tripCode lat isStale } }`);
    expect(loc.lastKnownLocations.length).toBeGreaterThanOrEqual(1);
    const g = await gqlOk(USERS.operation, `query($q: String!) { globalSearch(query: $q) { type code title } }`, { q: trip.code });
    expect(g.globalSearch.some((x: any) => x.type === 'TRIP' && x.code === trip.code)).toBe(true);
  });

  it('chuyến thuê xe ngoài + thông tin xe/tài xế ngoài', async () => {
    const r = await seedRefs();
    const { order } = await createSimpleOrder();
    const p = await prisma();
    const sup = await p.supplier.findFirstOrThrow({ where: { merchantId: r.m.id, code: 'SUP-A-001' } });
    const d = await gqlOk(USERS.operation, CREATE_TRIP.replace('notices }', 'notices trip { isExternal externalTransport { vehiclePlate supplierName } } }'), {
      input: { orderId: order.id, isExternal: true, plannedStartAt: futureSlot().toISOString(), externalTransport: { supplierId: sup.id, vehiclePlate: '43C-111.11', driverName: 'Anh Ba', agreedAmount: 5_000_000 } },
    });
    expect(d.createTrip.trip.externalTransport).toEqual({ vehiclePlate: '43C-111.11', supplierName: 'Chành Xe Miền Trung' });
    const o = await gqlOk(USERS.operation, `query($id: ID!) { order(id: $id) { status externalTransports { vehiclePlate agreedAmount } } }`, { id: order.id });
    expect(o.order.status).toBe('DISPATCHED');
    expect(o.order.externalTransports[0].agreedAmount).toBe(5_000_000);
  });
});
