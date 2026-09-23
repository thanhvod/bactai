import { gqlOk, prisma, USERS } from './helpers';

/** Dữ liệu seed merchant A dùng cho test P3. */
export async function seedRefs() {
  const p = await prisma();
  const m = await p.merchant.findUniqueOrThrow({ where: { code: 'M-DEMO-A' } });
  const cus = await p.customer.findFirstOrThrow({ where: { merchantId: m.id, code: 'CUS-A-001' }, include: { locations: true } });
  const cus2 = await p.customer.findFirstOrThrow({ where: { merchantId: m.id, code: 'CUS-A-002' }, include: { locations: true } });
  const veh1 = await p.vehicle.findFirstOrThrow({ where: { merchantId: m.id, code: 'VEH-A-001' } });
  const veh2 = await p.vehicle.findFirstOrThrow({ where: { merchantId: m.id, code: 'VEH-A-002' } });
  const veh3 = await p.vehicle.findFirstOrThrow({ where: { merchantId: m.id, code: 'VEH-A-003' } });
  const drv1 = await p.driver.findFirstOrThrow({ where: { merchantId: m.id, code: 'DRV-A-001' } });
  const drv2 = await p.driver.findFirstOrThrow({ where: { merchantId: m.id, code: 'DRV-A-002' } });
  const drv3 = await p.driver.findFirstOrThrow({ where: { merchantId: m.id, code: 'DRV-A-003' } });
  return { m, cus, cus2, veh1, veh2, veh3, drv1, drv2, drv3 };
}

// Mỗi file test lấy một dải ngày ngẫu nhiên riêng để các file không trùng lịch nhau.
const dayBase = 400 + Math.floor(Math.random() * 20_000) * 5;
let dayCounter = 0;
/** Mỗi lần gọi trả 1 ngày tương lai khác nhau (tránh trùng lịch giữa các test). */
export function futureSlot(hour = 8, offsetDays?: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dayBase + (offsetDays ?? dayCounter++ * 3));
  d.setUTCHours(hour - 7, 0, 0, 0);
  return d;
}

export const ORDER_FIELDS = `id code status totalAmount freightAmount addonTotal routeSummary dueDate priceLocked
  stops { id type sequence address status codExpected codActual tripCodes }
  trips { id code status stopCount }
  financeSummary { totalAmount receivable paidAmount remainingAmount expenseTotal profit }`;

export async function createSimpleOrder(opts: { status?: string; trip?: { vehicleId: string; driverId: string; start: Date; overrideReason?: string }; freight?: number; codExpected?: number } = {}) {
  const r = await seedRefs();
  const [pick, drop] = [r.cus.locations.find((l) => l.name === 'Kho Cần Thơ')!, r.cus.locations.find((l) => l.name === 'Kho Bình Dương')!];
  const d = await gqlOk(USERS.operation, `mutation($input: CreateOrderInput!) { createOrder(input: $input) { warnings order { ${ORDER_FIELDS} } trip { id code status } } }`, {
    input: {
      customerId: r.cus.id,
      freightAmount: opts.freight ?? 10_000_000,
      status: opts.status ?? 'CONFIRMED',
      stops: [
        { type: 'PICKUP', locationId: pick.id },
        { type: 'DROPOFF', locationId: drop.id, codExpected: opts.codExpected ?? null },
      ],
      cargoLines: [{ name: '10 tấn gạo' }],
      addons: [{ name: 'Bốc xếp', amount: 500_000 }],
      createTrip: opts.trip ? { vehicleId: opts.trip.vehicleId, driverId: opts.trip.driverId, plannedStartAt: opts.trip.start.toISOString(), overrideReason: opts.trip.overrideReason } : undefined,
    },
  });
  return d.createOrder;
}
