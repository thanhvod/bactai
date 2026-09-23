import { afterAll, describe, expect, it } from 'vitest';
import { prisma, testApp } from './helpers';

afterAll(async () => (await testApp()).close());

describe('Scheduler (HARD-001)', () => {
  it('quét cảnh báo tạo notification COD + quá hạn, chạy lại trong 24h không trùng', async () => {
    const { SchedulerService } = await import('../modules/scheduler/scheduler.service');
    const s = (await testApp()).get(SchedulerService);
    const p = await prisma();
    await p.notification.deleteMany({ where: { type: { in: ['COD_HELD_WARNING', 'ORDER_OVERDUE'] } } });
    const r1 = await s.runAlerts();
    expect(r1.cod).toBeGreaterThan(0);
    expect(r1.overdue).toBeGreaterThan(0);
    const r2 = await s.runAlerts();
    expect(r2).toEqual({ cod: 0, overdue: 0 });
  });

  it('dọn GPS quá hạn lưu trữ, giữ điểm mới', async () => {
    const { SchedulerService } = await import('../modules/scheduler/scheduler.service');
    const s = (await testApp()).get(SchedulerService);
    const p = await prisma();
    const trip = await p.trip.findFirstOrThrow({ where: { merchant: { code: 'M-DEMO-A' }, status: 'IN_TRANSIT' } });
    await p.tripLocation.create({ data: { merchantId: trip.merchantId, tripId: trip.id, lat: 10, lng: 106, recordedAt: new Date(Date.now() - 400 * 86_400_000) } });
    const before = await p.tripLocation.count({ where: { tripId: trip.id } });
    const r = await s.cleanupGps();
    expect(r.deleted).toBeGreaterThanOrEqual(1);
    expect(await p.tripLocation.count({ where: { tripId: trip.id } })).toBe(before - 1);
  });
});
