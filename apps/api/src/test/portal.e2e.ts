import { afterAll, describe, expect, it } from 'vitest';
import { USERS, errorCode, gql, gqlOk, http, merchantId, prisma, testApp } from './helpers';

afterAll(async () => (await testApp()).close());

/** SĐT di động ngẫu nhiên cho mỗi lần chạy (DB test không reset). */
function randomPhone() {
  return `09${String(Math.floor(Math.random() * 1e8)).padStart(8, '0')}`;
}

/** Đăng nhập/đăng ký bằng OTP (test env trả devCode). */
async function register(_label = '', phone = randomPhone(), fullName: string | null = 'Chị Khách') {
  const h = await http();
  const r1 = await h.post('/customer/auth/otp/request').send({ phone });
  const res = await h.post('/customer/auth/otp/verify').send({ phone, code: r1.body.devCode, fullName });
  return res;
}

describe('Web Khách hàng (P9)', () => {
  it('OTP: gửi mã, sai mã bị đếm, đúng mã tạo tài khoản; đăng nhập lại cùng SĐT ra cùng tài khoản', async () => {
    const h = await http();
    const phone = randomPhone();
    const r1 = await h.post('/customer/auth/otp/request').send({ phone });
    expect(r1.status).toBe(200);
    expect(r1.body.devCode).toMatch(/^\d{6}$/);
    const wrong = await h.post('/customer/auth/otp/verify').send({ phone, code: r1.body.devCode === '000000' ? '111111' : '000000' });
    expect(wrong.status).toBe(401);
    const ok = await h.post('/customer/auth/otp/verify').send({ phone, code: r1.body.devCode });
    expect(ok.status).toBe(200);
    expect(ok.body.accessToken).toMatch(/^cus\./);
    expect(ok.body.isNew).toBe(true);
    expect(ok.body.profileIncomplete).toBe(true);
    // mã đã dùng không dùng lại được
    expect((await h.post('/customer/auth/otp/verify').send({ phone, code: r1.body.devCode })).status).toBe(401);
    // gửi lại quá nhanh bị chặn
    expect((await h.post('/customer/auth/otp/request').send({ phone })).status).toBe(422);
    const me = await gqlOk(ok.body.accessToken, `{ customerMe { account { id phone email } } }`);
    expect(me.customerMe.account.phone).toBe(phone);
  });

  it('OTP: SĐT không hợp lệ; sai quá 5 lần phải xin mã mới', async () => {
    const h = await http();
    expect((await h.post('/customer/auth/otp/request').send({ phone: '12345' })).status).toBe(400);
    const phone = randomPhone();
    const r = await h.post('/customer/auth/otp/request').send({ phone });
    const bad = r.body.devCode === '999999' ? '888888' : '999999';
    for (let i = 0; i < 5; i++) await h.post('/customer/auth/otp/verify').send({ phone, code: bad });
    const locked = await h.post('/customer/auth/otp/verify').send({ phone, code: r.body.devCode });
    expect(locked.status).toBe(401);
    expect(locked.body.message).toContain('quá số lần');
  });

  it('khám phá chỉ thấy nhà xe public; khách không gọi được API nhà xe', async () => {
    const tok = (await register()).body.accessToken;
    const d = await gqlOk(tok, `{ publicMerchants { nodes { id name vehicleTypes } } }`);
    const names = d.publicMerchants.nodes.map((m: any) => m.name);
    expect(names).toContain('BTA Demo Transport');
    expect(names).not.toContain('Tenant Isolation Transport');
    expect(errorCode(await gql(tok, `{ customers { totalCount } }`))).toBe('FORBIDDEN');
    // public không cần đăng nhập
    expect((await gqlOk(null, `{ publicMerchants { totalCount } }`)).publicMerchants.totalCount).toBeGreaterThan(0);
  });

  it('booking: khách gửi → nhà xe thấy & tiếp nhận → khách thấy trạng thái; khách khác không xem được', async () => {
    const tok = (await register()).body.accessToken;
    const mid = await merchantId('M-DEMO-A');
    const input = {
      merchantId: mid, cargoName: '5 tấn phân bón', contactName: 'Chị Ba', contactPhone: '0987654321',
      stops: [{ type: 'PICKUP', address: 'Cần Giuộc, Long An' }, { type: 'DROPOFF', address: 'Quận 8, TP.HCM' }],
    };
    const c = await gqlOk(tok, `mutation($i: BookingInput!) { createBooking(input: $i) { id code status merchantName } }`, { i: input });
    expect(c.createBooking.code).toMatch(/^BK-/);
    expect(c.createBooking.status).toBe('SUBMITTED');
    const list = await gqlOk(USERS.operation, `{ bookings(filter: { status: ["SUBMITTED"] }) { nodes { id code accountEmail } } }`);
    expect(list.bookings.nodes.some((b: any) => b.id === c.createBooking.id)).toBe(true);
    const p = await prisma();
    const notif = await p.notification.findFirst({ where: { type: 'BOOKING_NEW', entityId: c.createBooking.id } });
    expect(notif).toBeTruthy();
    const cus = await p.customer.findFirstOrThrow({ where: { code: 'CUS-A-003' } });
    await gqlOk(USERS.operation, `mutation($id: ID!, $c: ID) { acceptBooking(id: $id, customerId: $c) { status } }`, { id: c.createBooking.id, c: cus.id });
    const mine = await gqlOk(tok, `query($id: ID!) { myBooking(id: $id) { status statusHistory { toStatus } } }`, { id: c.createBooking.id });
    expect(mine.myBooking.status).toBe('ACCEPTED');
    // khách được liên kết CUS-A-003 → thấy đơn của khách đó
    const orders = await gqlOk(tok, `{ myOrders { totalCount nodes { code merchantName remainingAmount } } myDebtSummary { remaining } customerMe { merchantLinks { customerCode } } }`);
    expect(orders.customerMe.merchantLinks[0].customerCode).toBe('CUS-A-003');
    expect(orders.myOrders.totalCount).toBeGreaterThan(0);
    // khách khác
    const tok2 = (await register()).body.accessToken;
    expect(errorCode(await gql(tok2, `query($id: ID!) { myBooking(id: $id) { id } }`, { id: c.createBooking.id }))).toBe('NOT_FOUND');
    expect((await gqlOk(tok2, `{ myOrders { totalCount } }`)).myOrders.totalCount).toBe(0);
  });

  it('khách chỉ hủy được khi chờ tiếp nhận, phải có lý do', async () => {
    const tok = (await register()).body.accessToken;
    const mid = await merchantId('M-DEMO-A');
    const c = await gqlOk(tok, `mutation($i: BookingInput!) { createBooking(input: $i) { id } }`, {
      i: { merchantId: mid, cargoName: 'Gạo', contactName: 'A', contactPhone: '0987000111', stops: [{ type: 'PICKUP', address: 'A' }, { type: 'DROPOFF', address: 'B' }] },
    });
    expect(errorCode(await gql(tok, `mutation($id: ID!) { cancelBooking(id: $id, reason: "") { status } }`, { id: c.createBooking.id }))).toBe('BUSINESS_RULE_VIOLATION');
    const ok = await gqlOk(tok, `mutation($id: ID!) { cancelBooking(id: $id, reason: "Đổi kế hoạch") { status } }`, { id: c.createBooking.id });
    expect(ok.cancelBooking.status).toBe('CANCELLED');
  });

  it('sổ địa chỉ khách', async () => {
    const tok = (await register()).body.accessToken;
    const a = await gqlOk(tok, `mutation { createMyAddress(input: { name: "Kho nhà", address: "Q7", isDefaultPickup: true }) { id isDefaultPickup } }`);
    expect(a.createMyAddress.isDefaultPickup).toBe(true);
    expect((await gqlOk(tok, `{ myAddresses { id } }`)).myAddresses).toHaveLength(1);
    await gqlOk(tok, `mutation($id: ID!) { deleteMyAddress(id: $id) }`, { id: a.createMyAddress.id });
  });
});
