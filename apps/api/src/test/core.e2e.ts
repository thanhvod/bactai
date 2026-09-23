import { afterAll, describe, expect, it } from 'vitest';
import { USERS, driverToken, errorCode, gql, gqlOk, http, merchantId, prisma, testApp } from './helpers';

afterAll(async () => (await testApp()).close());

describe('Auth & tenant (FDN-004)', () => {
  it('me trả membership và quyền theo role', async () => {
    const d = await gqlOk(USERS.operation, `{ me { account { email } memberships { merchantCode role } current { role permissions } } }`);
    expect(d.me.account.email).toBe('operation@bta-demo.test');
    expect(d.me.current.role).toBe('OPERATION');
    expect(d.me.current.permissions).toContain('order.create');
    expect(d.me.current.permissions).not.toContain('payroll.approve');
  });

  it('user merchant B không truy cập được merchant A dù gửi header A', async () => {
    const r = await gql({ email: USERS.adminB.email, merchant: 'M-DEMO-A' }, `{ customers { totalCount } }`);
    expect(errorCode(r)).toBe('MERCHANT_REQUIRED');
  });

  it('user merchant B không đọc được khách hàng A theo id', async () => {
    const p = await prisma();
    const cusA = await p.customer.findFirstOrThrow({ where: { code: 'CUS-A-001' } });
    const r = await gql(USERS.adminB, `query($id: ID!) { customer(id: $id) { id } }`, { id: cusA.id });
    expect(errorCode(r)).toBe('NOT_FOUND');
  });

  it('không có token → UNAUTHENTICATED', async () => {
    const r = await gql(null, `{ customers { totalCount } }`);
    expect(errorCode(r)).toBe('UNAUTHENTICATED');
  });

  it('chưa có membership → current null, không vào dashboard', async () => {
    const d = await gqlOk({ email: 'newbie@example.test' }, `{ me { memberships { id } current { role } canCreateMerchant } }`);
    expect(d.me.memberships).toHaveLength(0);
    expect(d.me.current).toBeNull();
  });

  it('tạo merchant self-service → admin + catalog mặc định', async () => {
    const d = await gqlOk({ email: 'owner@newco.test' }, `mutation { createMerchant(input: { name: "Nhà xe Mới" }) { merchantId role status } }`);
    expect(d.createMerchant.role).toBe('ADMIN');
    const p = await prisma();
    expect(await p.catalogItem.count({ where: { merchantId: d.createMerchant.merchantId } })).toBeGreaterThan(20);
  });
});

describe('RBAC & sensitive (FDN-005)', () => {
  it('kế toán không quản lý nhân viên', async () => {
    const r = await gql(USERS.accountant, `{ merchantUsers { totalCount } }`);
    expect(errorCode(r)).toBe('FORBIDDEN');
  });

  it('ngừng khách đã có đơn: operation không có quyền → FORBIDDEN; admin thiếu lý do → SENSITIVE_REASON_REQUIRED', async () => {
    const p = await prisma();
    const c = await p.customer.findFirstOrThrow({ where: { code: 'CUS-A-002' } });
    const q = `mutation($id: ID!, $r: String) { deactivateCustomer(id: $id, reason: $r) { status } }`;
    expect(errorCode(await gql(USERS.operation, q, { id: c.id, r: 'Khách ngừng hợp tác' }))).toBe('FORBIDDEN');
    expect(errorCode(await gql(USERS.admin, q, { id: c.id, r: '' }))).toBe('SENSITIVE_REASON_REQUIRED');
    const ok = await gqlOk(USERS.admin, q, { id: c.id, r: 'Khách ngừng hợp tác' });
    expect(ok.deactivateCustomer.status).toBe('INACTIVE');
    const log = await p.activityLog.findFirst({ where: { entityId: c.id, action: 'customer.deactivate' } });
    expect(log?.reason).toBe('Khách ngừng hợp tác');
    await gqlOk(USERS.admin, `mutation($id: ID!) { activateCustomer(id: $id) { status } }`, { id: c.id });
  });
});

describe('Numbering (FDN-006)', () => {
  it('tạo 10 khách đồng thời không trùng mã; 2 merchant counter riêng', async () => {
    const q = `mutation($n: String!) { createCustomer(input: { type: "COMPANY", name: $n }) { code } }`;
    const res = await Promise.all(Array.from({ length: 10 }, (_, i) => gqlOk(USERS.operation, q, { n: `KH đồng thời ${i}` })));
    const codes = res.map((r) => r.createCustomer.code);
    expect(new Set(codes).size).toBe(10);
    expect(codes[0]).toMatch(/^KH-\d{6}-\d{4}$/);
    const b = await gqlOk(USERS.adminB, q, { n: 'KH tenant B' });
    expect(b.createCustomer.code.endsWith('-0001')).toBe(true);
  });
});

describe('Driver auth & attachment scope (D-009, FDN-008)', () => {
  it('sai mật khẩu → 401', async () => {
    const res = await (await http()).post('/driver/auth/login').send({ phone: '0900000001', password: 'sai' });
    expect(res.status).toBe(401);
  });

  it('tài xế upload POD chuyến của mình; không upload được chuyến merchant khác', async () => {
    const tok = await driverToken();
    const p = await prisma();
    const mid = await merchantId('M-DEMO-A');
    const trip = await p.trip.findFirstOrThrow({ where: { merchantId: mid, status: 'IN_TRANSIT' } });
    const h = await http();
    const pre = await h.post('/uploads/presign').set('authorization', `Bearer ${tok}`).send({ entityType: 'TRIP', entityId: trip.id, category: 'POD', fileName: 'pod.jpg', contentType: 'image/jpeg', fileSize: 3 });
    expect(pre.status).toBe(200);
    const url = new URL(pre.body.uploadUrl);
    await h.put(url.pathname).set('content-type', 'image/jpeg').send(Buffer.from('abc'));
    const conf = await h.post('/uploads/confirm').set('authorization', `Bearer ${tok}`).send({ attachmentId: pre.body.attachmentId });
    expect(conf.body.status).toBe('READY');
    const tripB = await p.trip.findFirstOrThrow({ where: { merchant: { code: 'M-DEMO-B' } } });
    const bad = await h.post('/uploads/presign').set('authorization', `Bearer ${tok}`).send({ entityType: 'TRIP', entityId: tripB.id, category: 'POD', fileName: 'x.jpg', contentType: 'image/jpeg', fileSize: 3 });
    expect(bad.status).toBe(403);
  });

  it('confirm khi chưa upload file → lỗi, metadata vẫn PENDING', async () => {
    const tok = await driverToken();
    const p = await prisma();
    const trip = await p.trip.findFirstOrThrow({ where: { merchant: { code: 'M-DEMO-A' }, status: 'IN_TRANSIT' } });
    const h = await http();
    const pre = await h.post('/uploads/presign').set('authorization', `Bearer ${tok}`).send({ entityType: 'TRIP', entityId: trip.id, category: 'POD', fileName: 'y.jpg', contentType: 'image/jpeg', fileSize: 3 });
    const conf = await h.post('/uploads/confirm').set('authorization', `Bearer ${tok}`).send({ attachmentId: pre.body.attachmentId });
    expect(conf.status).toBe(422);
  });
});

describe('Timeline (FDN-007)', () => {
  it('timeline đơn gồm status history của chuyến con', async () => {
    const p = await prisma();
    const trip = await p.trip.findFirstOrThrow({ where: { merchant: { code: 'M-DEMO-A' }, status: 'IN_TRANSIT' } });
    const d = await gqlOk(USERS.operation, `query($id: ID!) { activityTimeline(entity: { type: "ORDER", id: $id }) { kind entityType summary } }`, { id: trip.orderId });
    expect(d.activityTimeline.some((e: any) => e.entityType === 'TRIP' && e.kind === 'STATUS')).toBe(true);
  });
});
