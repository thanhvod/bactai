import { afterAll, describe, expect, it } from 'vitest';
import { USERS, driverToken, gqlOk, http, prisma, testApp } from './helpers';

afterAll(async () => (await testApp()).close());

const TOKEN_A = `fcm-driver-${Date.now()}-aaaaaaaaaaaaaaaaaaaa`;
const TOKEN_M = `fcm-merchant-${Date.now()}-bbbbbbbbbbbbbbbbbbbb`;

async function pushSvc() {
  const { PushService } = await import('../common/push/push.service');
  return (await testApp()).get(PushService);
}

describe('Push FCM (D-017)', () => {
  it('tài xế đăng ký token → giao chuyến mới gửi push tới máy tài xế', async () => {
    const tok = await driverToken('0900000002');
    await gqlOk(tok, `mutation($i: RegisterPushTokenInput!) { registerPushToken(input: $i) }`, { i: { token: TOKEN_A, platform: 'ANDROID' } });
    const push = await pushSvc();
    const sender = push.sender as any;
    sender.sent.length = 0;
    const p = await prisma();
    const drv = await p.driver.findFirstOrThrow({ where: { phone: '0900000002', merchant: { code: 'M-DEMO-A' } } });
    const trip = await p.trip.findFirstOrThrow({ where: { driverId: drv.id, status: 'SCHEDULED' } });
    const { runAsSystem } = await import('../common/context/request-context');
    const { NotifyService } = await import('../common/notifications/notify.service');
    const notify = (await testApp()).get(NotifyService);
    await runAsSystem(trip.merchantId, () => notify.toDriver(drv.id, { type: 'TRIP_ASSIGNED', title: `Chuyến mới ${trip.code}`, entityType: 'TRIP', entityId: trip.id }));
    await push.idle();
    const last = sender.sent.at(-1);
    expect(last.tokens).toContain(TOKEN_A);
    expect(last.msg.data).toMatchObject({ type: 'TRIP_ASSIGNED', entityType: 'TRIP', entityId: trip.id, merchantId: trip.merchantId });
  });

  it('nhân viên App Merchant đăng ký token → notification gửi tới membership đó có push; token hỏng bị xóa', async () => {
    const login = await (await http()).post('/merchant/auth/login').send({ phone: '0911000001', password: 'Nhanvien123' });
    await gqlOk(login.body.accessToken, `mutation($i: RegisterPushTokenInput!) { registerPushToken(input: $i) }`, { i: { token: TOKEN_M, platform: 'IOS' } });
    const push = await pushSvc();
    const sender = push.sender as any;
    sender.sent.length = 0;
    const { NotifyService } = await import('../common/notifications/notify.service');
    const notify = (await testApp()).get(NotifyService);
    const p = await prisma();
    const admin = await p.merchantUser.findFirstOrThrow({ where: { email: USERS.admin.email } });
    await notify.toRecipients([{ type: 'USER', id: admin.id }], { type: 'PAYROLL_SUBMITTED', title: 'Bảng lương chờ duyệt' }, undefined, admin.merchantId);
    await push.idle();
    expect(sender.sent.some((s: any) => s.tokens.includes(TOKEN_M) && s.msg.title === 'Bảng lương chờ duyệt')).toBe(true);
    // token không còn hợp lệ → FCM báo lỗi → xóa khỏi DB
    sender.invalid.add(TOKEN_M);
    await push.sendNow([{ type: 'USER', id: admin.id }], { type: 'SYSTEM', title: 'x' });
    expect(await p.deviceToken.count({ where: { token: TOKEN_M } })).toBe(0);
  });

  it('unregister khi đăng xuất', async () => {
    const tok = await driverToken('0900000002');
    await gqlOk(tok, `mutation($t: String!) { unregisterPushToken(token: $t) }`, { t: TOKEN_A });
    expect(await (await prisma()).deviceToken.count({ where: { token: TOKEN_A } })).toBe(0);
  });
});

describe('Push không gửi cho tài xế đã khóa', () => {
  it('tài xế ngừng hoạt động → không có token nhận', async () => {
    const tok = await driverToken('0900000001');
    const token = `fcm-inactive-${Date.now()}-cccccccccccccccccccc`;
    await gqlOk(tok, `mutation($i: RegisterPushTokenInput!) { registerPushToken(input: $i) }`, { i: { token, platform: 'ANDROID' } });
    const p = await prisma();
    const drv = await p.driver.findFirstOrThrow({ where: { phone: '0900000001', merchant: { code: 'M-DEMO-A' } } });
    const push = await pushSvc();
    expect(await push.tokensFor([{ type: 'DRIVER', id: drv.id }])).toContain(token);
    await p.driver.update({ where: { id: drv.id }, data: { status: 'INACTIVE' } });
    expect(await push.tokensFor([{ type: 'DRIVER', id: drv.id }])).not.toContain(token);
  });
});
