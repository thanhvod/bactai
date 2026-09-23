import { afterAll, describe, expect, it } from 'vitest';
import { USERS, driverToken, errorCode, gql, gqlOk, http, prisma, testApp } from './helpers';

afterAll(async () => (await testApp()).close());

const TRIP_FIELDS = `id code status allowedNextStatuses isRunning stops { id type sequence status codExpected codActual podCount } codExpectedTotal`;

describe('App tài xế (P4)', () => {
  it('driverMe + việc hôm nay chỉ gồm chuyến của mình', async () => {
    const tok = await driverToken('0900000001');
    const d = await gqlOk(tok, `{ driverMe { name merchantName codHeld } driverJobs(filter: { bucket: "TODAY" }) { ${TRIP_FIELDS} } }`);
    expect(d.driverMe.name).toBe('Nguyễn Văn Tài');
    expect(d.driverJobs.some((t: any) => t.status === 'IN_TRANSIT')).toBe(true);
    const p = await prisma();
    const other = await p.trip.findFirstOrThrow({ where: { driver: { phone: '0900000002' }, merchant: { code: 'M-DEMO-A' } } });
    expect(errorCode(await gql(tok, `query($id: ID!) { driverTrip(id: $id) { id } }`, { id: other.id }))).toBe('NOT_FOUND');
  });

  it('luồng hiện trường: tới điểm trả → COD (idempotent) → POD → hoàn thành điểm → hoàn thành chuyến', async () => {
    const tok = await driverToken('0900000001');
    const jobs = await gqlOk(tok, `{ driverJobs(filter: { bucket: "RUNNING" }) { ${TRIP_FIELDS} } }`);
    const trip = jobs.driverJobs.find((t: any) => t.status === 'IN_TRANSIT');
    const drop = trip.stops.find((s: any) => s.type === 'DROPOFF');

    const st = `mutation($i: DriverTripStatusInput!) { driverUpdateTripStatus(input: $i) { trip { status allowedNextStatuses } warnings } }`;
    const r1 = await gqlOk(tok, st, { i: { tripId: trip.id, status: 'DELIVERING', idempotencyKey: 'k-deliver-1' } });
    expect(r1.driverUpdateTripStatus.trip.status).toBe('DELIVERING');

    const arr = `mutation($i: DriverStopStatusInput!) { driverUpdateStopStatus(input: $i) { stop { status } warnings orderStatus } }`;
    await gqlOk(tok, arr, { i: { stopId: drop.id, tripId: trip.id, status: 'ARRIVED', idempotencyKey: 'k-arrive-1' } });

    const cod = `mutation($i: DriverCodInput!) { driverSubmitCod(input: $i) { stop { codActual } warnings } }`;
    const c1 = await gqlOk(tok, cod, { i: { stopId: drop.id, amount: 12_000_000, idempotencyKey: 'k-cod-1' } });
    expect(c1.driverSubmitCod.stop.codActual).toBe(12_000_000);
    expect(c1.driverSubmitCod.warnings[0]).toContain('khác dự kiến');
    // gửi lại (offline replay) không ghi trùng
    await gqlOk(tok, cod, { i: { stopId: drop.id, amount: 12_000_000, idempotencyKey: 'k-cod-1' } });
    const p = await prisma();
    expect(await p.activityLog.count({ where: { entityId: drop.id, action: 'cod.submit' } })).toBe(1);
    // sửa COD đã lưu cần lý do
    expect(errorCode(await gql(tok, cod, { i: { stopId: drop.id, amount: 12_500_000, idempotencyKey: 'k-cod-2' } }))).toBe('SENSITIVE_REASON_REQUIRED');
    const c3 = await gqlOk(tok, cod, { i: { stopId: drop.id, amount: 12_500_000, reason: 'Nhập nhầm, khách trả đủ', idempotencyKey: 'k-cod-3' } });
    expect(c3.driverSubmitCod.stop.codActual).toBe(12_500_000);

    const h = await http();
    const pre = await h.post('/uploads/presign').set('authorization', `Bearer ${tok}`).send({ entityType: 'ORDER_STOP', entityId: drop.id, category: 'POD', fileName: 'pod.jpg', contentType: 'image/jpeg', fileSize: 3 });
    await h.put(new URL(pre.body.uploadUrl).pathname).set('content-type', 'image/jpeg').send(Buffer.from('abc'));
    await h.post('/uploads/confirm').set('authorization', `Bearer ${tok}`).send({ attachmentId: pre.body.attachmentId });

    const done = await gqlOk(tok, arr, { i: { stopId: drop.id, tripId: trip.id, status: 'COMPLETED', idempotencyKey: 'k-done-stop' } });
    expect(done.driverUpdateStopStatus.stop.status).toBe('COMPLETED');
    const t2 = await gqlOk(tok, st, { i: { tripId: trip.id, status: 'COMPLETED', idempotencyKey: 'k-done-trip' } });
    expect(t2.driverUpdateTripStatus.trip.status).toBe('COMPLETED');
    // web thấy đơn hoàn thành + COD tài xế tăng
    const order = await p.order.findFirstOrThrow({ where: { trips: { some: { id: trip.id } } } });
    expect(order.status).toBe('COMPLETED');
    const web = await gqlOk(USERS.operation, `query($id: ID!) { orderStop(id: $id) { codActual podAttachments { id } } }`, { id: drop.id });
    expect(web.orderStop.podAttachments.length).toBeGreaterThan(0);
  });

  it('tài xế không được hủy chuyến; tạm dừng cần lý do rồi tiếp tục', async () => {
    const tok = await driverToken('0900000002');
    const jobs = await gqlOk(tok, `{ driverJobs(filter: { bucket: "UPCOMING" }) { id status } }`);
    const trip = jobs.driverJobs[0];
    const st = `mutation($i: DriverTripStatusInput!) { driverUpdateTripStatus(input: $i) { trip { status } } }`;
    expect(errorCode(await gql(tok, st, { i: { tripId: trip.id, status: 'CANCELLED' } }))).toBe('FORBIDDEN');
    await gqlOk(tok, st, { i: { tripId: trip.id, status: 'TO_PICKUP' } });
    const p = await prisma();
    const reason = await p.catalogItem.findFirstOrThrow({ where: { type: 'PAUSE_REASON', code: 'TRAFFIC', merchant: { code: 'M-DEMO-A' } } });
    expect(errorCode(await gql(tok, st, { i: { tripId: trip.id, status: 'PAUSED' } }))).toBeTruthy();
    const paused = await gqlOk(tok, st, { i: { tripId: trip.id, status: 'PAUSED', pauseReasonId: reason.id } });
    expect(paused.driverUpdateTripStatus.trip.status).toBe('PAUSED');
    const res = await gqlOk(tok, `mutation($id: ID!) { driverResumeTrip(tripId: $id) { trip { status } } }`, { id: trip.id });
    expect(res.driverResumeTrip.trip.status).toBe('TO_PICKUP');
  });

  it('GPS batch: chỉ chuyến đang chạy, chống trùng; báo sự cố', async () => {
    const tok = await driverToken('0900000002');
    const jobs = await gqlOk(tok, `{ driverJobs(filter: { bucket: "RUNNING" }) { id } }`);
    const tripId = jobs.driverJobs[0].id;
    const h = await http();
    const points = [{ lat: 10.8, lng: 106.6, recordedAt: new Date(Date.now() - 60_000).toISOString() }, { lat: 10.81, lng: 106.61, recordedAt: new Date().toISOString() }];
    const b1 = await h.post('/driver/gps/batch').set('authorization', `Bearer ${tok}`).send({ clientRequestId: 'gps-1', tripId, points });
    expect(b1.body).toEqual({ accepted: 2, duplicates: 0 });
    const b2 = await h.post('/driver/gps/batch').set('authorization', `Bearer ${tok}`).send({ clientRequestId: 'gps-2', tripId, points });
    expect(b2.body).toEqual({ accepted: 0, duplicates: 2 });
    const inc = await gqlOk(tok, `mutation($i: DriverIncidentInput!) { driverReportIncident(input: $i) { code status } }`, { i: { tripId, title: 'Thủng lốp', severity: 'HIGH', idempotencyKey: 'inc-1' } });
    expect(inc.driverReportIncident.code).toMatch(/^SC-/);
    const again = await gqlOk(tok, `mutation($i: DriverIncidentInput!) { driverReportIncident(input: $i) { code } }`, { i: { tripId, title: 'Thủng lốp', severity: 'HIGH', idempotencyKey: 'inc-1' } });
    expect(again.driverReportIncident.code).toBe(inc.driverReportIncident.code);
  });
});
