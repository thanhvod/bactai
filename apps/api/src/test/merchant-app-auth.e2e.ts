import { afterAll, describe, expect, it } from 'vitest';
import { USERS, errorCode, gql, gqlOk, http, merchantId, testApp } from './helpers';

afterAll(async () => (await testApp()).close());

async function staffLogin(phone: string, password: string) {
  return (await http()).post('/merchant/auth/login').send({ phone, password });
}

describe('App Merchant SĐT + mật khẩu (D-014)', () => {
  it('đăng nhập bằng SĐT seed, token usr. dùng được với x-merchant-id và đúng quyền', async () => {
    const res = await staffLogin('0911000002', 'Nhanvien123');
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toMatch(/^usr\./);
    const app = await testApp();
    const r = await (await import('supertest')).default(app.getHttpServer())
      .post('/graphql')
      .set('authorization', `Bearer ${res.body.accessToken}`)
      .set('x-merchant-id', await merchantId('M-DEMO-A'))
      .send({ query: '{ me { current { role permissions } } }' });
    expect(r.body.data.me.current.role).toBe('OPERATION');
    expect(r.body.data.me.current.permissions).not.toContain('payroll.approve');
    expect((await staffLogin('0911000002', 'sai')).status).toBe(401);
  });

  it('admin cấp mật khẩu tạm cho nhân viên mới → đăng nhập được, mustChangePassword; đổi mật khẩu', async () => {
    const email = `nv-${Date.now()}@bta-demo.test`;
    const inv = await gqlOk(USERS.admin, `mutation($i: InviteMerchantUserInput!) { inviteMerchantUser(input: $i) { id } }`, { i: { email, name: 'NV app', role: 'ACCOUNTANT' } });
    const phone = `09${String(Math.floor(Math.random() * 1e8)).padStart(8, '0')}`;
    const c = await gqlOk(USERS.admin, `mutation($id: ID!, $p: String) { resetMerchantUserAppPassword(id: $id, phone: $p) { phone tempPassword } }`, { id: inv.inviteMerchantUser.id, p: phone });
    expect(c.resetMerchantUserAppPassword.phone).toBe(phone);
    const login = await staffLogin(phone, c.resetMerchantUserAppPassword.tempPassword);
    expect(login.status).toBe(200);
    expect(login.body.account.mustChangePassword).toBe(true);
    const ch = await (await http()).post('/merchant/auth/change-password').set('authorization', `Bearer ${login.body.accessToken}`).send({ oldPassword: c.resetMerchantUserAppPassword.tempPassword, newPassword: 'MatKhauMoi1' });
    expect(ch.status).toBe(200);
    expect((await staffLogin(phone, 'MatKhauMoi1')).status).toBe(200);
    // operation không có quyền cấp mật khẩu
    expect(errorCode(await gql(USERS.operation, `mutation($id: ID!) { resetMerchantUserAppPassword(id: $id) { phone } }`, { id: inv.inviteMerchantUser.id }))).toBe('FORBIDDEN');
  });

  it('nhân viên tự đặt SĐT + mật khẩu từ web; trùng SĐT → CONFLICT', async () => {
    const d = await gqlOk({ email: USERS.accountant.email }, `mutation { setMyAppCredentials(phone: "0911000003", newPassword: "KeToan123") { account { phone hasAppPassword } } }`);
    expect(d.setMyAppCredentials.account.hasAppPassword).toBe(true);
    expect((await staffLogin('0911000003', 'KeToan123')).status).toBe(200);
    expect(errorCode(await gql({ email: USERS.accountant.email }, `mutation { setMyAppCredentials(phone: "0911000001", newPassword: "abcdef1") { account { phone } } }`))).toBe('CONFLICT');
  });
});
