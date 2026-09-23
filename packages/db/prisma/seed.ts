/**
 * Seed dữ liệu demo — doc/3-TECHNICAL/SEED-SCENARIOS.md.
 * Idempotent: xóa dữ liệu của 2 merchant demo rồi tạo lại. Chạy: npm run db:seed
 */
import { PrismaClient, Prisma } from '@prisma/client';
import type { CatalogType } from '@bta/shared';
import { hashPassword } from '../src/password';
import { seedMerchantDefaults } from '../src/defaults';

const prisma = new PrismaClient();

const MERCHANT_A = 'M-DEMO-A';
const MERCHANT_B = 'M-DEMO-B';
export const DEMO_DRIVER_PASSWORD = 'Taixe123';
/** Mật khẩu App Merchant (D-014) cho nhân viên demo. */
export const DEMO_STAFF_PASSWORD = 'Nhanvien123';

function d(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}
function dt(iso: string): Date {
  return new Date(`${iso}:00+07:00`);
}
function daysAgo(n: number, hour = 8): Date {
  const x = new Date();
  x.setHours(hour, 0, 0, 0);
  x.setDate(x.getDate() - n);
  return x;
}
function monthTag(date = new Date()): string {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
}

async function wipeMerchant(code: string) {
  const m = await prisma.merchant.findUnique({ where: { code } });
  if (!m) return;
  const id = m.id;
  const w = { where: { merchantId: id } };
  await prisma.$transaction([
    prisma.payrollLineItem.deleteMany(w),
    prisma.payrollLine.deleteMany(w),
    prisma.payroll.deleteMany(w),
    prisma.debtStatementLine.deleteMany(w),
    prisma.debtStatement.deleteMany(w),
    prisma.codRemittanceItem.deleteMany(w),
    prisma.paymentAllocation.deleteMany(w),
    prisma.paymentIn.deleteMany(w),
    prisma.tripAdvanceReconciliation.deleteMany(w),
    prisma.expense.deleteMany(w),
    prisma.incident.deleteMany(w),
    prisma.scheduleWarning.deleteMany(w),
    prisma.tripLocation.deleteMany(w),
    prisma.externalTransportInfo.deleteMany(w),
    prisma.tripStopAssignment.deleteMany(w),
    prisma.trip.deleteMany(w),
    prisma.cargoLine.deleteMany(w),
    prisma.orderAddon.deleteMany(w),
    prisma.orderStop.deleteMany(w),
    prisma.order.deleteMany(w),
    prisma.bookingNote.deleteMany({ where: { booking: { merchantId: id } } }),
    prisma.booking.deleteMany(w),
    prisma.customerLocation.deleteMany(w),
    prisma.customer.deleteMany(w),
    prisma.driverSalaryHistory.deleteMany(w),
    prisma.driverRefreshToken.deleteMany({ where: { account: { merchantId: id } } }),
    prisma.driverAccount.deleteMany(w),
    prisma.driver.deleteMany(w),
    prisma.vehicle.deleteMany(w),
    prisma.supplier.deleteMany(w),
    prisma.catalogItem.deleteMany(w),
    prisma.attachment.deleteMany(w),
    prisma.activityLog.deleteMany(w),
    prisma.statusHistory.deleteMany(w),
    prisma.notification.deleteMany(w),
    prisma.importJob.deleteMany(w),
    prisma.idempotencyKey.deleteMany(w),
    prisma.numberSequence.deleteMany(w),
    prisma.numberFormat.deleteMany(w),
    prisma.merchantRolePermission.deleteMany(w),
    prisma.merchantUser.deleteMany(w),
    prisma.merchantSettings.deleteMany(w),
    prisma.merchant.delete({ where: { id } }),
  ]);
}

async function account(email: string, name: string, phone?: string) {
  const creds = phone ? { phone, passwordHash: hashPassword(DEMO_STAFF_PASSWORD), mustChangePassword: false, passwordUpdatedAt: new Date() } : {};
  return prisma.userAccount.upsert({ where: { email }, create: { email, name, ...creds }, update: { name, ...creds } });
}

async function seedMerchantA() {
  const m = await prisma.merchant.create({
    data: {
      code: MERCHANT_A,
      name: 'BTA Demo Transport',
      legalName: 'Công ty TNHH Vận tải BTA Demo',
      taxCode: '0312345678',
      address: '12 Quốc lộ 1A, Bình Chánh',
      province: 'TP. Hồ Chí Minh',
      contactName: 'Nguyễn Văn An',
      phone: '0281234567',
      dispatchHotline: '0901234567',
      email: 'dispatch@bta-demo.test',
      publicProfile: true,
      intro: 'Nhà xe tải thùng, mui bạt, xe lạnh chạy tuyến miền Tây – TP.HCM – miền Đông.',
      serviceAreas: ['TP.HCM', 'Cần Thơ', 'Bình Dương', 'Long An'],
      services: ['Tải thùng', 'Mui bạt', 'Xe lạnh', 'Bốc xếp'],
    },
  });
  await prisma.$transaction(async (tx) => seedMerchantDefaults(tx, m.id));
  await prisma.merchantSettings.update({
    where: { merchantId: m.id },
    data: { nearOverlapMinutes: 120, codWarningAmount: 5_000_000n, codWarningDays: 2, defaultDebtDays: 15 },
  });
  const cat = async (type: CatalogType, code: string) =>
    (await prisma.catalogItem.findUniqueOrThrow({ where: { merchantId_type_code: { merchantId: m.id, type, code } } })).id;

  // Users
  const adminAcc = await account('admin@bta-demo.test', 'Giám đốc Demo', '0911000001');
  const opAcc = await account('operation@bta-demo.test', 'Điều phối Demo', '0911000002');
  const accAcc = await account('accountant@bta-demo.test', 'Kế toán Demo', '0911000003');
  const [admin, op, acc] = await Promise.all(
    [
      [adminAcc, 'ADMIN'],
      [opAcc, 'OPERATION'],
      [accAcc, 'ACCOUNTANT'],
    ].map(([a, role]) =>
      prisma.merchantUser.create({
        data: {
          merchantId: m.id,
          accountId: (a as { id: string }).id,
          email: (a as { email: string }).email,
          name: (a as { name: string }).name!,
          role: role as 'ADMIN',
          status: 'ACTIVE',
          joinedAt: daysAgo(60),
        },
      }),
    ),
  );

  // Customers
  const cusA1 = await prisma.customer.create({
    data: {
      merchantId: m.id, code: 'CUS-A-001', name: 'Công ty Gạo Miền Tây', legalName: 'Công ty TNHH Gạo Miền Tây',
      taxCode: '1801234567', phone: '0292123456', creditLimit: 100_000_000n, defaultDebtDays: 15,
      primaryContact: { name: 'Anh Nam', phone: '0912000001', role: 'Trưởng kho' },
      groupId: await cat('CUSTOMER_GROUP', 'REGULAR'),
      locations: {
        create: [
          { merchantId: m.id, name: 'Kho Cần Thơ', usage: 'PICKUP', address: 'KCN Trà Nóc, Bình Thủy, Cần Thơ', province: 'Cần Thơ', contactName: 'Anh Nam', contactPhone: '0912000001', isDefault: true, lat: 10.0964, lng: 105.7005 },
          { merchantId: m.id, name: 'Kho Bình Dương', usage: 'DROPOFF', address: 'KCN Sóng Thần, Dĩ An, Bình Dương', province: 'Bình Dương', contactName: 'Chị Hạnh', contactPhone: '0912000002', lat: 10.8898, lng: 106.7529 },
        ],
      },
    },
    include: { locations: true },
  });
  const cusA2 = await prisma.customer.create({
    data: {
      merchantId: m.id, code: 'CUS-A-002', name: 'Kho Thép An Phát', taxCode: '1101234567', phone: '0272123456',
      creditLimit: 200_000_000n, defaultDebtDays: 20, primaryContact: { name: 'Anh Phát', phone: '0912000003' },
      locations: {
        create: [
          { merchantId: m.id, name: 'Nhà máy Long An', usage: 'PICKUP', address: 'KCN Đức Hòa, Long An', province: 'Long An', contactName: 'Anh Phát', contactPhone: '0912000003', isDefault: true, lat: 10.8858, lng: 106.4262 },
          { merchantId: m.id, name: 'Công trình Quận 7', usage: 'DROPOFF', address: 'Nguyễn Văn Linh, Quận 7, TP.HCM', province: 'TP.HCM', contactName: 'Anh Tuấn', contactPhone: '0912000004', lat: 10.7296, lng: 106.7219 },
          { merchantId: m.id, name: 'Công trình Thủ Đức', usage: 'DROPOFF', address: 'Xa lộ Hà Nội, Thủ Đức, TP.HCM', province: 'TP.HCM', contactName: 'Anh Long', contactPhone: '0912000005', lat: 10.8506, lng: 106.7719 },
        ],
      },
    },
    include: { locations: true },
  });
  const cusA3 = await prisma.customer.create({
    data: {
      merchantId: m.id, code: 'CUS-A-003', name: 'Bao bì Hưng Lợi', phone: '0283123456', creditLimit: 50_000_000n, defaultDebtDays: 7,
      primaryContact: { name: 'Chị Lợi', phone: '0912000006' },
      locations: { create: [{ merchantId: m.id, name: 'Xưởng Hóc Môn', usage: 'BOTH', address: 'Xuân Thới Sơn, Hóc Môn, TP.HCM', province: 'TP.HCM', isDefault: true }] },
    },
  });

  // Drivers
  const mkDriver = async (code: string, name: string, phone: string, status: 'ACTIVE' | 'INACTIVE', salaries: [number, string][]) => {
    const drv = await prisma.driver.create({
      data: { merchantId: m.id, code, name, phone, status, licenseClass: 'C', licenseNumber: `79${phone.slice(-6)}`, licenseExpiresAt: d('2028-12-31') },
    });
    await prisma.driverSalaryHistory.createMany({
      data: salaries.map(([amount, from]) => ({ merchantId: m.id, driverId: drv.id, amount: BigInt(amount), effectiveFrom: d(from), createdByUserId: admin.id })),
    });
    await prisma.driverAccount.create({
      data: { merchantId: m.id, driverId: drv.id, passwordHash: hashPassword(DEMO_DRIVER_PASSWORD), status: status === 'ACTIVE' ? 'ACTIVE' : 'DISABLED', mustChangePassword: false },
    });
    return drv;
  };
  const drv1 = await mkDriver('DRV-A-001', 'Nguyễn Văn Tài', '0900000001', 'ACTIVE', [[9_000_000, '2026-01-01'], [10_000_000, '2026-07-01']]);
  const drv2 = await mkDriver('DRV-A-002', 'Trần Minh Lái', '0900000002', 'ACTIVE', [[11_000_000, '2026-01-01']]);
  await mkDriver('DRV-A-003', 'Phạm Văn Dự', '0900000003', 'INACTIVE', [[9_500_000, '2026-01-01']]);

  // Vehicles
  const veh1 = await prisma.vehicle.create({ data: { merchantId: m.id, code: 'VEH-A-001', plate: '51C-123.45', typeId: await cat('VEHICLE_TYPE', 'BOX'), capacityTons: 8, brandModel: 'Hino FC', year: 2021, status: 'ACTIVE', registrationExpiresAt: d('2027-03-31') } });
  const veh2 = await prisma.vehicle.create({ data: { merchantId: m.id, code: 'VEH-A-002', plate: '51D-678.90', typeId: await cat('VEHICLE_TYPE', 'TARPAULIN'), capacityTons: 15, brandModel: 'Isuzu FVR', year: 2020, status: 'ACTIVE' } });
  await prisma.vehicle.create({ data: { merchantId: m.id, code: 'VEH-A-003', plate: '51H-111.22', typeId: await cat('VEHICLE_TYPE', 'REEFER'), capacityTons: 5, brandModel: 'Hyundai Mighty', year: 2022, status: 'MAINTENANCE' } });

  // Suppliers
  const sup1 = await prisma.supplier.create({ data: { merchantId: m.id, code: 'SUP-A-001', name: 'Chành Xe Miền Trung', typeId: await cat('SUPPLIER_TYPE', 'TRANSPORT'), contacts: [{ name: 'Anh Trung', phone: '0913000001' }] } });
  const sup2 = await prisma.supplier.create({ data: { merchantId: m.id, code: 'SUP-A-002', name: 'Xăng dầu Minh Phát', typeId: await cat('SUPPLIER_TYPE', 'FUEL'), paymentTerms: 'Công nợ 30 ngày' } });
  await prisma.supplier.create({ data: { merchantId: m.id, code: 'SUP-A-003', name: 'Gara Đại Lộc', typeId: await cat('SUPPLIER_TYPE', 'REPAIR') } });

  const tag = monthTag();
  const lastTag = monthTag(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));
  const loc = (c: typeof cusA1, name: string) => c.locations.find((l) => l.name === name)!;
  const stopFrom = (l: { id: string; name: string; address: string; province: string | null; contactName: string | null; contactPhone: string | null; lat: number | null; lng: number | null }, type: 'PICKUP' | 'DROPOFF', sequence: number, extra: Partial<Prisma.OrderStopUncheckedCreateInput> = {}) => ({
    merchantId: m.id, type, sequence, locationId: l.id, locationName: l.name, address: l.address, province: l.province,
    contactName: l.contactName, contactPhone: l.contactPhone, lat: l.lat, lng: l.lng, ...extra,
  });

  // ---- Order 1: 1 xe, đang chạy ----
  const o1 = await prisma.order.create({
    data: {
      merchantId: m.id, code: `DH-${tag}-0001`, customerId: cusA1.id, orderDate: daysAgo(1), freightAmount: 12_000_000n,
      dueDate: daysAgo(-14), status: 'IN_PROGRESS', routeSummary: 'Kho Cần Thơ → Kho Bình Dương', createdByUserId: op.id,
      confirmedAt: daysAgo(1, 9), startedAt: daysAgo(0, 6), note: 'Giao trong giờ hành chính',
      stops: { create: [stopFrom(loc(cusA1, 'Kho Cần Thơ'), 'PICKUP', 1, { status: 'COMPLETED', arrivedAt: daysAgo(0, 6), completedAt: daysAgo(0, 7), plannedAt: daysAgo(0, 6) }), stopFrom(loc(cusA1, 'Kho Bình Dương'), 'DROPOFF', 2, { codExpected: 12_500_000n, plannedAt: daysAgo(0, 14) })] },
      addons: { create: [{ merchantId: m.id, serviceId: await cat('ADDON_SERVICE', 'LOADING'), name: 'Bốc xếp', amount: 500_000n }] },
      cargoLines: { create: [{ merchantId: m.id, name: 'Gạo ST25 đóng bao 50kg', cargoTypeId: await cat('CARGO_TYPE', 'AGRI'), weightKg: 8000, quantity: 160, packagingUnit: 'Bao' }] },
    },
    include: { stops: true },
  });
  const trip1 = await prisma.trip.create({
    data: {
      merchantId: m.id, code: `CX-${tag}-0001`, orderId: o1.id, vehicleId: veh1.id, driverId: drv1.id, status: 'IN_TRANSIT',
      plannedStartAt: daysAgo(0, 6), plannedEndAt: daysAgo(0, 15), actualStartAt: daysAgo(0, 6), driverBonusAmount: 500_000n,
      routeSummary: o1.routeSummary, lastLat: 10.6, lastLng: 106.3, lastLocationAt: new Date(), createdByUserId: op.id,
      stopAssignments: { create: o1.stops.map((s) => ({ merchantId: m.id, stopId: s.id, sequence: s.sequence, arrivedAt: s.arrivedAt, completedAt: s.completedAt })) },
    },
  });
  await prisma.tripLocation.createMany({
    data: [
      { merchantId: m.id, tripId: trip1.id, driverId: drv1.id, lat: 10.0964, lng: 105.7005, recordedAt: daysAgo(0, 6), accuracy: 12 },
      { merchantId: m.id, tripId: trip1.id, driverId: drv1.id, lat: 10.35, lng: 106.0, recordedAt: daysAgo(0, 8), accuracy: 15 },
      { merchantId: m.id, tripId: trip1.id, driverId: drv1.id, lat: 10.6, lng: 106.3, recordedAt: new Date(), accuracy: 10, speed: 52 },
    ],
  });
  const inc1 = await prisma.incident.create({
    data: {
      merchantId: m.id, code: `SC-${tag}-0001`, typeId: await cat('INCIDENT_TYPE', 'LATE'), title: 'Kẹt xe cao tốc Trung Lương', severity: 'MEDIUM',
      description: 'Kẹt xe kéo dài ~1 giờ, dự kiến trễ điểm trả.', orderId: o1.id, tripId: trip1.id, driverId: drv1.id, vehicleId: veh1.id,
      reportedByType: 'DRIVER', reportedById: drv1.id, reportedByName: drv1.name, status: 'OPEN',
    },
  });

  // ---- Order 2: nhiều xe ----
  const o2 = await prisma.order.create({
    data: {
      merchantId: m.id, code: `DH-${tag}-0002`, customerId: cusA2.id, orderDate: daysAgo(0), freightAmount: 35_000_000n, dueDate: daysAgo(-20),
      status: 'DISPATCHED', routeSummary: 'Nhà máy Long An → Công trình Quận 7, Thủ Đức', createdByUserId: op.id, confirmedAt: daysAgo(0, 8),
      stops: { create: [stopFrom(loc(cusA2, 'Nhà máy Long An'), 'PICKUP', 1, { plannedAt: daysAgo(-1, 7) }), stopFrom(loc(cusA2, 'Công trình Quận 7'), 'DROPOFF', 2, { plannedAt: daysAgo(-1, 10) }), stopFrom(loc(cusA2, 'Công trình Thủ Đức'), 'DROPOFF', 3, { plannedAt: daysAgo(-1, 11) })] },
      cargoLines: { create: [{ merchantId: m.id, name: 'Thép cuộn', cargoTypeId: await cat('CARGO_TYPE', 'STEEL'), weightKg: 22000, properties: ['OVERSIZE'] }] },
    },
    include: { stops: { orderBy: { sequence: 'asc' } } },
  });
  const [s21, s22, s23] = o2.stops;
  const tripA = await prisma.trip.create({
    data: { merchantId: m.id, code: `CX-${tag}-0002`, orderId: o2.id, vehicleId: veh1.id, driverId: drv1.id, status: 'SCHEDULED', plannedStartAt: daysAgo(-1, 7), plannedEndAt: daysAgo(-1, 12), routeSummary: 'Long An → Quận 7', driverBonusAmount: 700_000n, createdByUserId: op.id,
      stopAssignments: { create: [{ merchantId: m.id, stopId: s21.id, sequence: 1 }, { merchantId: m.id, stopId: s22.id, sequence: 2 }] } },
  });
  const tripB = await prisma.trip.create({
    data: { merchantId: m.id, code: `CX-${tag}-0003`, orderId: o2.id, vehicleId: veh2.id, driverId: drv2.id, status: 'SCHEDULED', plannedStartAt: daysAgo(-1, 7), plannedEndAt: daysAgo(-1, 13), routeSummary: 'Long An → Thủ Đức', driverBonusAmount: 800_000n, createdByUserId: op.id,
      stopAssignments: { create: [{ merchantId: m.id, stopId: s21.id, sequence: 1 }, { merchantId: m.id, stopId: s23.id, sequence: 2 }] } },
  });
  await prisma.scheduleWarning.create({
    data: { merchantId: m.id, tripId: tripA.id, type: 'NEAR_OVERLAP', subject: 'VEHICLE', subjectId: veh1.id, conflictTripId: trip1.id, gapMinutes: 90, thresholdMinutes: 120 },
  });

  // ---- Order 3: hoàn thành, quá hạn 10 ngày ----
  const o3 = await prisma.order.create({
    data: {
      merchantId: m.id, code: `DH-${lastTag}-0009`, customerId: cusA1.id, orderDate: daysAgo(30), freightAmount: 19_000_000n, dueDate: daysAgo(10),
      status: 'COMPLETED', routeSummary: 'Kho Cần Thơ → Kho Bình Dương', createdByUserId: op.id, confirmedAt: daysAgo(30), completedAt: daysAgo(28),
      stops: { create: [stopFrom(loc(cusA1, 'Kho Cần Thơ'), 'PICKUP', 1, { status: 'COMPLETED', arrivedAt: daysAgo(29, 6), completedAt: daysAgo(29, 7) }), stopFrom(loc(cusA1, 'Kho Bình Dương'), 'DROPOFF', 2, { status: 'COMPLETED', arrivedAt: daysAgo(29, 13), completedAt: daysAgo(29, 14) })] },
      addons: { create: [{ merchantId: m.id, name: 'Bốc xếp', amount: 1_000_000n }] },
      cargoLines: { create: [{ merchantId: m.id, name: 'Gạo tấm 25kg', weightKg: 7500 }] },
    },
    include: { stops: true },
  });
  const trip3 = await prisma.trip.create({
    data: { merchantId: m.id, code: `CX-${lastTag}-0009`, orderId: o3.id, vehicleId: veh2.id, driverId: drv2.id, status: 'COMPLETED', plannedStartAt: daysAgo(29, 6), plannedEndAt: daysAgo(29, 15), actualStartAt: daysAgo(29, 6), actualEndAt: daysAgo(29, 14), driverBonusAmount: 1_000_000n, routeSummary: o3.routeSummary,
      stopAssignments: { create: o3.stops.map((s) => ({ merchantId: m.id, stopId: s.id, sequence: s.sequence, arrivedAt: s.arrivedAt, completedAt: s.completedAt })) } },
  });
  await prisma.attachment.create({
    data: { merchantId: m.id, entityType: 'ORDER_STOP', entityId: o3.stops[1].id, category: 'POD', fileName: 'pod-binh-duong.jpg', storageKey: `merchant/${m.id}/ORDER_STOP/${o3.stops[1].id}/seed-pod.jpg`, mimeType: 'image/jpeg', size: 1024, status: 'READY', uploadedByType: 'DRIVER', uploadedById: drv2.id, uploadedByName: drv2.name, capturedAt: daysAgo(29, 14) },
  });

  // ---- Order 4: đã hủy, vẫn có chi phí ----
  const o4 = await prisma.order.create({
    data: {
      merchantId: m.id, code: `DH-${tag}-0004`, customerId: cusA3.id, orderDate: daysAgo(3), freightAmount: 6_000_000n, status: 'CANCELLED', routeSummary: 'Xưởng Hóc Môn → Chợ Bình Điền',
      createdByUserId: op.id, cancelledAt: daysAgo(2), cancelReason: 'Khách hủy đơn do đổi lịch sản xuất',
      stops: { create: [{ merchantId: m.id, type: 'PICKUP', sequence: 1, locationName: 'Xưởng Hóc Môn', address: 'Xuân Thới Sơn, Hóc Môn, TP.HCM' }, { merchantId: m.id, type: 'DROPOFF', sequence: 2, locationName: 'Chợ Bình Điền', address: 'Nguyễn Văn Linh, Bình Chánh, TP.HCM' }] },
      cargoLines: { create: [{ merchantId: m.id, name: 'Thùng carton', quantity: 300, packagingUnit: 'Kiện' }] },
    },
  });
  const trip4 = await prisma.trip.create({
    data: { merchantId: m.id, code: `CX-${tag}-0004`, orderId: o4.id, vehicleId: veh1.id, driverId: drv2.id, status: 'CANCELLED', plannedStartAt: daysAgo(2, 7), cancelReason: 'Đơn bị hủy' },
  });

  // ---- COD thực thu của tài xế 2 (đơn cũ hoàn thành) ----
  const oCod = await prisma.order.create({
    data: {
      merchantId: m.id, code: `DH-${lastTag}-0010`, customerId: cusA3.id, orderDate: daysAgo(6), freightAmount: 7_500_000n, dueDate: daysAgo(-1),
      status: 'COMPLETED', routeSummary: 'Xưởng Hóc Môn → Chợ Lớn', createdByUserId: op.id, completedAt: daysAgo(5),
      stops: { create: [{ merchantId: m.id, type: 'PICKUP', sequence: 1, locationName: 'Xưởng Hóc Môn', address: 'Xuân Thới Sơn, Hóc Môn', status: 'COMPLETED', completedAt: daysAgo(5, 7) }, { merchantId: m.id, type: 'DROPOFF', sequence: 2, locationName: 'Kho Chợ Lớn', address: 'Hải Thượng Lãn Ông, Quận 5', status: 'COMPLETED', completedAt: daysAgo(5, 10), codExpected: 7_500_000n, codActual: 7_500_000n, codCollectedAt: daysAgo(5, 10) }] },
    },
    include: { stops: true },
  });
  const tripCod = await prisma.trip.create({
    data: { merchantId: m.id, code: `CX-${lastTag}-0010`, orderId: oCod.id, vehicleId: veh2.id, driverId: drv2.id, status: 'COMPLETED', plannedStartAt: daysAgo(5, 7), actualStartAt: daysAgo(5, 7), actualEndAt: daysAgo(5, 11), driverBonusAmount: 300_000n,
      stopAssignments: { create: oCod.stops.map((s) => ({ merchantId: m.id, stopId: s.id, sequence: s.sequence, completedAt: s.completedAt })) } },
  });

  // ---- Finance ----
  const pt1 = await prisma.paymentIn.create({
    data: { merchantId: m.id, code: `PT-${tag}-0001`, type: 'CUSTOMER_PAYMENT', customerId: cusA1.id, amount: 5_000_000n, receivedAt: daysAgo(12), method: 'BANK_TRANSFER', transferNote: 'GAO MIEN TAY TT DH0009', createdByUserId: acc.id,
      allocations: { create: [{ merchantId: m.id, orderId: o3.id, amount: 5_000_000n, createdByUserId: acc.id }] } },
  });
  await prisma.paymentIn.create({
    data: { merchantId: m.id, code: `PT-${tag}-0002`, type: 'CUSTOMER_PAYMENT', customerId: cusA3.id, amount: 3_000_000n, receivedAt: daysAgo(4), method: 'BANK_TRANSFER', note: 'Khách chuyển trước, chưa phân bổ', createdByUserId: acc.id },
  });
  await prisma.paymentIn.create({
    data: { merchantId: m.id, code: `PT-${tag}-0003`, type: 'DRIVER_COD_REMITTANCE', driverId: drv2.id, amount: 2_000_000n, receivedAt: daysAgo(3), method: 'CASH', receivedBy: acc.name, createdByUserId: acc.id,
      codItems: { create: [{ merchantId: m.id, stopId: oCod.stops[1].id, amount: 2_000_000n }] } },
  });
  const pc1 = await prisma.expense.create({
    data: { merchantId: m.id, code: `PC-${tag}-0001`, kind: 'TRIP_COST', categoryId: await cat('EXPENSE_CATEGORY', 'TOLL'), amount: 800_000n, expenseDate: daysAgo(0), paidBy: 'DRIVER', reimbursable: true, tripId: trip1.id, orderId: o1.id, driverId: drv1.id, vehicleId: veh1.id, description: 'Cầu đường Trung Lương – Mỹ Thuận', createdByUserId: op.id },
  });
  await prisma.attachment.create({
    data: { merchantId: m.id, entityType: 'EXPENSE', entityId: pc1.id, category: 'EXPENSE_RECEIPT', fileName: 'bien-lai-cau-duong.jpg', storageKey: `merchant/${m.id}/EXPENSE/${pc1.id}/seed-receipt.jpg`, mimeType: 'image/jpeg', size: 2048, status: 'READY', uploadedByType: 'DRIVER', uploadedById: drv1.id, uploadedByName: drv1.name },
  });
  await prisma.expense.create({
    data: { merchantId: m.id, code: `PC-${tag}-0002`, kind: 'VEHICLE_SUPPLY', categoryId: await cat('EXPENSE_CATEGORY', 'FUEL'), amount: 2_500_000n, expenseDate: daysAgo(2), paidBy: 'COMPANY', paidStatus: 'UNPAID', supplierId: sup2.id, vehicleId: veh1.id, description: 'Đổ dầu 51C-123.45', createdByUserId: acc.id },
  });
  await prisma.expense.create({
    data: { merchantId: m.id, code: `PC-${tag}-0003`, kind: 'EXTERNAL_TRANSPORT', categoryId: await cat('EXPENSE_CATEGORY', 'OUTSOURCE'), amount: 8_000_000n, expenseDate: daysAgo(0), paidBy: 'COMPANY', paidStatus: 'UNPAID', supplierId: sup1.id, orderId: o2.id, description: 'Thuê chành chở phần thép còn lại', createdByUserId: acc.id },
  });
  await prisma.externalTransportInfo.create({
    data: { merchantId: m.id, orderId: o2.id, supplierId: sup1.id, vehiclePlate: '43C-999.99', driverName: 'Anh Bình', driverPhone: '0914000001', agreedAmount: 8_000_000n, note: 'Chành nhận hàng tại Long An sáng mai' },
  });
  await prisma.expense.create({
    data: { merchantId: m.id, code: `PC-${tag}-0004`, kind: 'TRIP_ADVANCE', amount: 2_000_000n, expenseDate: daysAgo(0), paidBy: 'COMPANY', tripId: trip1.id, orderId: o1.id, driverId: drv1.id, description: 'Tạm ứng tiền đi đường chuyến Cần Thơ', createdByUserId: acc.id },
  });
  await prisma.tripAdvanceReconciliation.create({ data: { merchantId: m.id, tripId: trip1.id, status: 'OPEN', advanceAmount: 2_000_000n, actualCost: 0n, differenceAmount: 2_000_000n } });
  await prisma.expense.create({
    data: { merchantId: m.id, code: `PC-${tag}-0005`, kind: 'TRIP_COST', categoryId: await cat('EXPENSE_CATEGORY', 'LOADING'), amount: 1_000_000n, expenseDate: daysAgo(2), paidBy: 'COMPANY', tripId: trip4.id, orderId: o4.id, description: 'Bốc xếp đã thuê trước khi khách hủy', createdByUserId: op.id },
  });
  await prisma.expense.create({
    data: { merchantId: m.id, code: `PC-${tag}-0006`, kind: 'SALARY_ADVANCE', amount: 2_000_000n, expenseDate: daysAgo(8), paidBy: 'COMPANY', driverId: drv1.id, description: 'Ứng lương tháng', createdByUserId: acc.id },
  });
  const pcAdv2 = await prisma.expense.create({
    data: { merchantId: m.id, code: `PC-${tag}-0007`, kind: 'TRIP_COST', categoryId: await cat('EXPENSE_CATEGORY', 'ALLOWANCE'), amount: 300_000n, expenseDate: daysAgo(29), paidBy: 'DRIVER', reimbursable: true, tripId: trip3.id, orderId: o3.id, driverId: drv2.id, description: 'Bồi dưỡng bốc xếp', createdByUserId: op.id },
  });

  // ---- Payroll: tháng hiện tại, chờ duyệt ----
  const now = new Date();
  const from = d(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const payroll = await prisma.payroll.create({
    data: {
      merchantId: m.id, code: `BL-${tag}-0001`, periodFrom: from, periodTo: d(`${to.getFullYear()}-${String(to.getMonth() + 1).padStart(2, '0')}-${String(to.getDate()).padStart(2, '0')}`),
      periodLabel: `Tháng ${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`, status: 'SUBMITTED', createdByUserId: op.id, submittedAt: daysAgo(0), submittedByUserId: op.id,
      salaryTotal: 21_000_000n, bonusTotal: 3_500_000n, advanceTotal: 2_000_000n, deductionTotal: 500_000n, netTotal: 22_000_000n,
    },
  });
  const line1 = await prisma.payrollLine.create({ data: { merchantId: m.id, payrollId: payroll.id, driverId: drv1.id, driverName: drv1.name, baseSalary: 10_000_000n, salaryEffectiveFrom: d('2026-07-01'), bonusTotal: 1_500_000n, advanceTotal: 2_000_000n, netAmount: 9_500_000n } });
  const line2 = await prisma.payrollLine.create({ data: { merchantId: m.id, payrollId: payroll.id, driverId: drv2.id, driverName: drv2.name, baseSalary: 11_000_000n, salaryEffectiveFrom: d('2026-01-01'), bonusTotal: 2_000_000n, deductionTotal: 500_000n, netAmount: 12_500_000n, anomalies: ['Đang giữ COD 5.500.000 đ'] } });
  const salaryAdvance = await prisma.expense.findFirstOrThrow({ where: { merchantId: m.id, code: `PC-${tag}-0006` } });
  await prisma.payrollLineItem.createMany({
    data: [
      { merchantId: m.id, lineId: line1.id, type: 'BASE', amount: 10_000_000n, description: 'Lương cố định', createdByUserId: op.id },
      { merchantId: m.id, lineId: line1.id, type: 'BONUS', amount: 500_000n, description: `Thưởng chuyến ${trip1.code}`, tripId: trip1.id, createdByUserId: op.id },
      { merchantId: m.id, lineId: line1.id, type: 'BONUS', amount: 1_000_000n, description: 'Thưởng chuyến bù tháng trước', createdByUserId: op.id },
      { merchantId: m.id, lineId: line1.id, type: 'ADVANCE', amount: 2_000_000n, description: `Ứng lương ${salaryAdvance.code}`, expenseId: salaryAdvance.id, createdByUserId: op.id },
      { merchantId: m.id, lineId: line2.id, type: 'BASE', amount: 11_000_000n, description: 'Lương cố định', createdByUserId: op.id },
      { merchantId: m.id, lineId: line2.id, type: 'BONUS', amount: 1_000_000n, description: `Thưởng chuyến ${trip3.code}`, tripId: trip3.id, createdByUserId: op.id },
      { merchantId: m.id, lineId: line2.id, type: 'BONUS', amount: 300_000n, description: `Thưởng chuyến ${tripCod.code}`, tripId: tripCod.id, createdByUserId: op.id },
      { merchantId: m.id, lineId: line2.id, type: 'BONUS', amount: 700_000n, description: 'Thưởng chuyến khác', createdByUserId: op.id },
      { merchantId: m.id, lineId: line2.id, type: 'DEDUCTION', amount: 500_000n, description: 'Trễ giờ giao hàng', reasonId: await cat('DEDUCTION_REASON', 'VIOLATION'), createdByUserId: op.id },
    ],
  });

  // ---- Notifications ----
  await prisma.notification.createMany({
    data: [
      { merchantId: m.id, recipientType: 'USER', recipientId: op.id, type: 'SCHEDULE_CONFLICT', title: `Chuyến ${tripA.code} gần trùng lịch xe 51C-123.45`, body: 'Cách chuyến trước 90 phút (ngưỡng 120 phút).', entityType: 'TRIP', entityId: tripA.id, severity: 'warning' },
      { merchantId: m.id, recipientType: 'USER', recipientId: acc.id, type: 'COD_HELD_WARNING', title: `Tài xế ${drv2.name} đang giữ COD 5.500.000 đ`, body: 'Vượt ngưỡng cảnh báo 5.000.000 đ.', entityType: 'DRIVER', entityId: drv2.id, severity: 'warning' },
      { merchantId: m.id, recipientType: 'USER', recipientId: admin.id, type: 'PAYROLL_SUBMITTED', title: `Bảng lương ${payroll.code} chờ duyệt`, body: 'Tổng thực lãnh 22.000.000 đ.', entityType: 'PAYROLL', entityId: payroll.id, severity: 'info' },
      { merchantId: m.id, recipientType: 'USER', recipientId: op.id, type: 'INCIDENT_NEW', title: `Sự cố mới: ${inc1.title}`, body: `Chuyến ${trip1.code}`, entityType: 'INCIDENT', entityId: inc1.id, severity: 'danger' },
      { merchantId: m.id, recipientType: 'DRIVER', recipientId: drv1.id, type: 'TRIP_ASSIGNED', title: `Bạn được giao chuyến ${tripA.code}`, body: 'Long An → Quận 7, xuất phát 07:00 ngày mai.', entityType: 'TRIP', entityId: tripA.id, severity: 'info' },
      { merchantId: m.id, recipientType: 'DRIVER', recipientId: drv2.id, type: 'TRIP_ASSIGNED', title: `Bạn được giao chuyến ${tripB.code}`, body: 'Long An → Thủ Đức, xuất phát 07:00 ngày mai.', entityType: 'TRIP', entityId: tripB.id, severity: 'info' },
    ],
  });

  // ---- Activity / status history mẫu ----
  await prisma.statusHistory.createMany({
    data: [
      { merchantId: m.id, entityType: 'ORDER', entityId: o1.id, fromStatus: 'CONFIRMED', toStatus: 'DISPATCHED', actorType: 'USER', actorId: op.id, actorName: op.name, changedAt: daysAgo(1, 10) },
      { merchantId: m.id, entityType: 'ORDER', entityId: o1.id, fromStatus: 'DISPATCHED', toStatus: 'IN_PROGRESS', actorType: 'SYSTEM', changedAt: daysAgo(0, 6) },
      { merchantId: m.id, entityType: 'TRIP', entityId: trip1.id, fromStatus: 'SCHEDULED', toStatus: 'TO_PICKUP', actorType: 'DRIVER', actorId: drv1.id, actorName: drv1.name, changedAt: daysAgo(0, 6) },
      { merchantId: m.id, entityType: 'TRIP', entityId: trip1.id, fromStatus: 'PICKING_UP', toStatus: 'IN_TRANSIT', actorType: 'DRIVER', actorId: drv1.id, actorName: drv1.name, changedAt: daysAgo(0, 7) },
      { merchantId: m.id, entityType: 'ORDER', entityId: o4.id, fromStatus: 'CONFIRMED', toStatus: 'CANCELLED', reason: 'Khách hủy đơn do đổi lịch sản xuất', actorType: 'USER', actorId: op.id, actorName: op.name, changedAt: daysAgo(2) },
    ],
  });
  await prisma.activityLog.createMany({
    data: [
      { merchantId: m.id, entityType: 'ORDER', entityId: o1.id, category: 'CREATE', action: 'order.create', summary: `Tạo đơn ${o1.code}`, actorType: 'USER', actorId: op.id, actorName: op.name, createdAt: daysAgo(1, 9) },
      { merchantId: m.id, entityType: 'TRIP', entityId: trip1.id, parentEntityType: 'ORDER', parentEntityId: o1.id, category: 'ASSIGNMENT', action: 'trip.assign', summary: `Gán xe 51C-123.45 / tài xế ${drv1.name}`, actorType: 'USER', actorId: op.id, actorName: op.name, createdAt: daysAgo(1, 10) },
      { merchantId: m.id, entityType: 'ORDER', entityId: o4.id, category: 'SENSITIVE', action: 'order.cancel', summary: `Hủy đơn ${o4.code}`, reason: 'Khách hủy đơn do đổi lịch sản xuất', sensitive: true, actorType: 'USER', actorId: op.id, actorName: op.name, before: { status: 'CONFIRMED' }, after: { status: 'CANCELLED' }, createdAt: daysAgo(2) },
      { merchantId: m.id, entityType: 'PAYMENT_IN', entityId: pt1.id, category: 'MONEY', action: 'payment.allocate', summary: `Phân bổ 5.000.000 đ vào ${o3.code}`, actorType: 'USER', actorId: acc.id, actorName: acc.name, createdAt: daysAgo(12) },
    ],
  });

  // Counter sequences khớp mã đã seed
  await prisma.numberSequence.createMany({
    data: [
      { merchantId: m.id, docType: 'ORDER', period: tag, currentValue: 4 },
      { merchantId: m.id, docType: 'ORDER', period: lastTag, currentValue: 10 },
      { merchantId: m.id, docType: 'TRIP', period: tag, currentValue: 4 },
      { merchantId: m.id, docType: 'TRIP', period: lastTag, currentValue: 10 },
      { merchantId: m.id, docType: 'PAYMENT_IN', period: tag, currentValue: 3 },
      { merchantId: m.id, docType: 'EXPENSE', period: tag, currentValue: 7 },
      { merchantId: m.id, docType: 'PAYROLL', period: tag, currentValue: 1 },
      { merchantId: m.id, docType: 'INCIDENT', period: tag, currentValue: 1 },
    ],
  });
  void pcAdv2;
  return m;
}

async function seedMerchantB() {
  const m = await prisma.merchant.create({ data: { code: MERCHANT_B, name: 'Tenant Isolation Transport', phone: '0289999999' } });
  await prisma.$transaction(async (tx) => seedMerchantDefaults(tx, m.id));
  const adminAcc = await account('admin@tenant-b.test', 'Admin Tenant B', '0911000099');
  await prisma.merchantUser.create({ data: { merchantId: m.id, accountId: adminAcc.id, email: adminAcc.email, name: adminAcc.name!, role: 'ADMIN', status: 'ACTIVE', joinedAt: new Date() } });
  const cus = await prisma.customer.create({ data: { merchantId: m.id, code: 'CUS-B-001', name: 'Khách Tenant B' } });
  const drv = await prisma.driver.create({ data: { merchantId: m.id, code: 'DRV-B-001', name: 'Tài xế B', phone: '0900000099' } });
  await prisma.driverAccount.create({ data: { merchantId: m.id, driverId: drv.id, passwordHash: hashPassword(DEMO_DRIVER_PASSWORD), status: 'ACTIVE', mustChangePassword: false } });
  const veh = await prisma.vehicle.create({ data: { merchantId: m.id, code: 'VEH-B-001', plate: '30B-000.01' } });
  const tag = monthTag();
  const o = await prisma.order.create({
    data: { merchantId: m.id, code: `DH-${tag}-0001`, customerId: cus.id, orderDate: new Date(), freightAmount: 1_000_000n, status: 'CONFIRMED', routeSummary: 'Hà Nội → Hải Phòng',
      stops: { create: [{ merchantId: m.id, type: 'PICKUP', sequence: 1, address: 'Hà Nội' }, { merchantId: m.id, type: 'DROPOFF', sequence: 2, address: 'Hải Phòng' }] } },
  });
  await prisma.trip.create({ data: { merchantId: m.id, code: `CX-${tag}-0001`, orderId: o.id, vehicleId: veh.id, driverId: drv.id, plannedStartAt: new Date() } });
  await prisma.numberSequence.createMany({ data: [{ merchantId: m.id, docType: 'ORDER', period: tag, currentValue: 1 }, { merchantId: m.id, docType: 'TRIP', period: tag, currentValue: 1 }] });
  return m;
}

export async function seedAll() {
  await wipeMerchant(MERCHANT_A);
  await wipeMerchant(MERCHANT_B);
  const a = await seedMerchantA();
  const b = await seedMerchantB();
  return { a, b };
}

if (require.main === module) {
  seedAll()
    .then(({ a, b }) => {
      console.log(`Seeded ${a.code} (${a.id}) và ${b.code} (${b.id}).`);
      console.log(`Tài khoản web: admin@bta-demo.test / operation@bta-demo.test / accountant@bta-demo.test / admin@tenant-b.test`);
      console.log(`Tài xế app: 0900000001, 0900000002 (mật khẩu ${DEMO_DRIVER_PASSWORD})`);
      console.log(`App Merchant: 0911000001 (admin) / 0911000002 (operation) / 0911000003 (kế toán) / 0911000099 (tenant B), mật khẩu ${DEMO_STAFF_PASSWORD}`);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
