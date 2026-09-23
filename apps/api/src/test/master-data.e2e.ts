import { afterAll, describe, expect, it } from 'vitest';
import { USERS, errorCode, gql, gqlOk, http, prisma, testApp } from './helpers';

afterAll(async () => (await testApp()).close());

const rndPhone = () => `09${String(Math.floor(Math.random() * 1e8)).padStart(8, '0')}`;

const CREATE_DRIVER = `mutation($input: DriverInput!) { createDriver(input: $input) { id code phone fixedSalary issuedTempPassword appAccount { status } } }`;

describe('Drivers (MD-004)', () => {
  it('trùng SĐT trong merchant → CONFLICT (kể cả dạng +84)', async () => {
    const r = await gql(USERS.operation, CREATE_DRIVER, { input: { name: 'Trùng SĐT', phone: '+84900000001' } });
    expect(errorCode(r)).toBe('CONFLICT');
  });

  it('danh sách tài xế có ledger COD và chuyến hiện tại', async () => {
    const d = await gqlOk(USERS.operation, `{ drivers(first: 10) { totalCount nodes { code status fixedSalary currentTrip { code } ledgerSummary { codHeld overAmount } appAccount { status } } } }`);
    const lai = d.drivers.nodes.find((n: any) => n.code === 'DRV-A-002');
    expect(lai.ledgerSummary.codHeld).toBe(5_500_000);
    expect(lai.ledgerSummary.overAmount).toBe(true);
    const tai = d.drivers.nodes.find((n: any) => n.code === 'DRV-A-001');
    expect(tai.currentTrip).not.toBeNull();
    expect(tai.fixedSalary).toBe(10_000_000);
  });

  it('đổi lương ngày 15 không đổi mốc cũ', async () => {
    const c = await gqlOk(USERS.admin, CREATE_DRIVER, { input: { name: 'Tài xế Lương', phone: rndPhone(), fixedSalary: 10_000_000, salaryEffectiveFrom: '2026-08-01' } });
    expect(c.createDriver.code).toMatch(/^TX-\d{6}-\d{4}$/);
    const h = await gqlOk(
      USERS.admin,
      `mutation($id: ID!) { addDriverSalaryHistory(driverId: $id, input: { amount: 12000000, effectiveFrom: "2026-08-15", reason: "Tăng lương" }) { amount effectiveFrom effectiveTo delta } }`,
      { id: c.createDriver.id },
    );
    const rows = h.addDriverSalaryHistory;
    expect(rows).toHaveLength(2);
    const old = rows.find((r: any) => r.amount === 10_000_000);
    const neu = rows.find((r: any) => r.amount === 12_000_000);
    expect(old.effectiveFrom.slice(0, 10)).toBe('2026-08-01');
    expect(old.effectiveTo.slice(0, 10)).toBe('2026-08-14');
    expect(neu.delta).toBe(2_000_000);
    const dup = await gql(USERS.admin, `mutation($id: ID!) { addDriverSalaryHistory(driverId: $id, input: { amount: 1, effectiveFrom: "2026-08-15" }) { id } }`, { id: c.createDriver.id });
    expect(errorCode(dup)).toBe('VALIDATION_ERROR');
  });

  it('operation không được thêm mốc lương (driver.salary.manage ⚠️)', async () => {
    const p = await prisma();
    const drv = await p.driver.findFirstOrThrow({ where: { code: 'DRV-A-001' } });
    const r = await gql(USERS.operation, `mutation($id: ID!) { addDriverSalaryHistory(driverId: $id, input: { amount: 1, effectiveFrom: "2026-10-01" }) { id } }`, { id: drv.id });
    expect(errorCode(r)).toBe('FORBIDDEN');
  });

  it('reset tài khoản → mật khẩu tạm đăng nhập được, mustChangePassword=true', async () => {
    const phone = rndPhone();
    const c = await gqlOk(USERS.operation, CREATE_DRIVER, { input: { name: 'Tài xế App', phone } });
    expect(c.createDriver.appAccount.status).toBe('NONE');
    const r = await gqlOk(USERS.operation, `mutation($id: ID!) { createOrResetDriverAccount(driverId: $id) { phone tempPassword status } }`, { id: c.createDriver.id });
    expect(r.createOrResetDriverAccount.tempPassword).toHaveLength(8);
    const login = await (await http()).post('/driver/auth/login').send({ phone, password: r.createOrResetDriverAccount.tempPassword });
    expect(login.status).toBe(200);
    expect(login.body.driver.mustChangePassword).toBe(true);
    const log = await (await prisma()).activityLog.findFirst({ where: { entityId: c.createDriver.id, action: 'driver.account.create' } });
    expect(JSON.stringify(log)).not.toContain(r.createOrResetDriverAccount.tempPassword);
  });

  it('tạo tài xế kèm tài khoản app trả mật khẩu tạm một lần', async () => {
    const c = await gqlOk(USERS.operation, CREATE_DRIVER, { input: { name: 'Tài xế Kèm App', phone: rndPhone(), appLoginEnabled: true } });
    expect(c.createDriver.issuedTempPassword).toHaveLength(8);
    expect(c.createDriver.appAccount.status).toBe('MUST_CHANGE_PASSWORD');
  });

  it('ngừng hoạt động cần lý do, khóa app, tài xế không đăng nhập được', async () => {
    const phone = rndPhone();
    const c = await gqlOk(USERS.operation, CREATE_DRIVER, { input: { name: 'Tài xế Nghỉ', phone, appLoginEnabled: true } });
    const q = `mutation($id: ID!, $r: String!) { deactivateDriver(id: $id, reason: $r) { status appAccount { status } } }`;
    expect(errorCode(await gql(USERS.operation, q, { id: c.createDriver.id, r: '' }))).toBe('SENSITIVE_REASON_REQUIRED');
    const d = await gqlOk(USERS.operation, q, { id: c.createDriver.id, r: 'Nghỉ việc từ tháng 10' });
    expect(d.deactivateDriver.status).toBe('INACTIVE');
    expect(d.deactivateDriver.appAccount.status).toBe('DISABLED');
    const login = await (await http()).post('/driver/auth/login').send({ phone, password: c.createDriver.issuedTempPassword });
    expect(login.status).toBe(401);
    const opts = await gqlOk(USERS.operation, `{ driverOptions { id } }`);
    expect(opts.driverOptions.some((o: any) => o.id === c.createDriver.id)).toBe(false);
  });

  it('kế toán không tạo được tài xế', async () => {
    const r = await gql(USERS.accountant, CREATE_DRIVER, { input: { name: 'KT tạo', phone: rndPhone() } });
    expect(errorCode(r)).toBe('FORBIDDEN');
  });
});

describe('Vehicles (MD-005)', () => {
  const CREATE = `mutation($input: VehicleInput!) { createVehicle(input: $input) { id code plate } }`;

  it('trùng biển số cùng merchant → CONFLICT; khác merchant OK', async () => {
    expect(errorCode(await gql(USERS.operation, CREATE, { input: { plate: '51c-123.45' } }))).toBe('CONFLICT');
    const b = await gqlOk(USERS.adminB, CREATE, { input: { plate: '51C-123.45', capacityTons: 8 } });
    expect(b.createVehicle.plate).toBe('51C-123.45');
    expect(b.createVehicle.code).toMatch(/^XE-/);
  });

  it('tenant B không thấy xe A', async () => {
    const d = await gqlOk(USERS.adminB, `{ vehicles(first: 50) { nodes { id plate } } }`);
    const p = await prisma();
    const vA = await p.vehicle.findFirstOrThrow({ where: { code: 'VEH-A-002' } });
    expect(d.vehicles.nodes.some((v: any) => v.id === vA.id)).toBe(false);
    expect(errorCode(await gql(USERS.adminB, `query($id: ID!) { vehicle(id: $id) { id } }`, { id: vA.id }))).toBe('NOT_FOUND');
  });

  it('chi tiết xe có lịch sử chuyến, chi phí tháng; xe bảo dưỡng không nằm trong options', async () => {
    const p = await prisma();
    const v1 = await p.vehicle.findFirstOrThrow({ where: { code: 'VEH-A-001' } });
    const d = await gqlOk(USERS.operation, `query($id: ID!) { vehicle(id: $id) { plate type { name } monthCost currentTrip { code } tripHistory { code } expenses { code } stats { tripCount30d } } }`, { id: v1.id });
    expect(d.vehicle.type.name).toBe('Tải thùng');
    expect(d.vehicle.tripHistory.length).toBeGreaterThan(0);
    expect(d.vehicle.monthCost).toBeGreaterThanOrEqual(800_000);
    const opts = await gqlOk(USERS.operation, `{ vehicleOptions { plate busy } }`);
    expect(opts.vehicleOptions.some((o: any) => o.plate === '51H-111.22')).toBe(false);
    expect(opts.vehicleOptions.find((o: any) => o.plate === '51C-123.45').busy).toBe(true);
  });

  it('kế toán không tạo được xe', async () => {
    expect(errorCode(await gql(USERS.accountant, CREATE, { input: { plate: '60A-000.01' } }))).toBe('FORBIDDEN');
  });

  it('ngừng sử dụng cần lý do', async () => {
    const c = await gqlOk(USERS.operation, CREATE, { input: { plate: `62C-${Math.floor(Math.random() * 90000 + 10000)}` } });
    const q = `mutation($id: ID!, $r: String!) { deactivateVehicle(id: $id, reason: $r) { status } }`;
    expect(errorCode(await gql(USERS.operation, q, { id: c.createVehicle.id, r: 'x' }))).toBe('SENSITIVE_REASON_REQUIRED');
    expect((await gqlOk(USERS.operation, q, { id: c.createVehicle.id, r: 'Bán xe thanh lý' })).deactivateVehicle.status).toBe('INACTIVE');
  });
});

describe('Suppliers (MD-006)', () => {
  it('kế toán tạo được NCC, có mã NCC và audit', async () => {
    const d = await gqlOk(USERS.accountant, `mutation { createSupplier(input: { name: "Lốp Bình Minh", contacts: [{ name: "Anh Minh", phone: "0911" }] }) { id code contacts { name } payableAmount } }`);
    expect(d.createSupplier.code).toMatch(/^NCC-/);
    expect(d.createSupplier.contacts[0].name).toBe('Anh Minh');
    const log = await (await prisma()).activityLog.findFirst({ where: { entityId: d.createSupplier.id, action: 'supplier.create' } });
    expect(log).not.toBeNull();
  });

  it('công nợ SUP-A-002 = 2.500.000', async () => {
    const p = await prisma();
    const s = await p.supplier.findFirstOrThrow({ where: { code: 'SUP-A-002' } });
    const d = await gqlOk(USERS.accountant, `query($id: ID!) { supplier(id: $id) { payableAmount payable { total unpaidCount aging { d0_15 } } recentExpenses { code } } }`, { id: s.id });
    expect(d.supplier.payableAmount).toBe(2_500_000);
    expect(d.supplier.payable.aging.d0_15).toBe(2_500_000);
    const list = await gqlOk(USERS.accountant, `{ suppliers(filter: { hasDebt: true }) { nodes { code payableAmount } } }`);
    expect(list.suppliers.nodes.map((n: any) => n.code).sort()).toEqual(['SUP-A-001', 'SUP-A-002']);
  });

  it('NCC vận tải thấy thông tin thuê xe ngoài', async () => {
    const p = await prisma();
    const s = await p.supplier.findFirstOrThrow({ where: { code: 'SUP-A-001' } });
    const d = await gqlOk(USERS.operation, `query($id: ID!) { supplier(id: $id) { externalTransports { orderCode vehiclePlate agreedAmount } } }`, { id: s.id });
    expect(d.supplier.externalTransports[0].vehiclePlate).toBe('43C-999.99');
  });

  it('ngừng giao dịch cần lý do', async () => {
    const c = await gqlOk(USERS.operation, `mutation { createSupplier(input: { name: "NCC tạm" }) { id } }`);
    const q = `mutation($id: ID!, $r: String!) { deactivateSupplier(id: $id, reason: $r) { status } }`;
    expect(errorCode(await gql(USERS.operation, q, { id: c.createSupplier.id, r: '' }))).toBe('SENSITIVE_REASON_REQUIRED');
    expect((await gqlOk(USERS.operation, q, { id: c.createSupplier.id, r: 'Không còn hợp tác' })).deactivateSupplier.status).toBe('INACTIVE');
  });
});
