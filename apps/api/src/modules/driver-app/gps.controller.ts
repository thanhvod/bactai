import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { TRIP_RUNNING_STATUSES } from '@bta/shared';
import { z } from 'zod';
import { Auth } from '../../common/auth/decorators';
import { businessRule } from '../../common/errors/app-error';
import { IdempotencyService } from '../../common/idempotency/idempotency.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';
import { DriverAppService } from './driver-app.service';

const batchSchema = z.object({
  clientRequestId: z.string().min(1).max(100),
  tripId: z.string().min(1),
  points: z
    .array(
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        accuracyMeters: z.number().min(0).optional().nullable(),
        speed: z.number().optional().nullable(),
        heading: z.number().optional().nullable(),
        recordedAt: z.coerce.date(),
        batteryLevel: z.number().min(0).max(1).optional().nullable(),
      }),
    )
    .min(1)
    .max(500),
});

/** GPS-001: app gửi batch khi chuyến đang chạy (có buffer offline). Idempotent theo clientRequestId + unique (tripId, recordedAt). */
@Controller('driver')
export class GpsController {
  constructor(private readonly prisma: PrismaService, private readonly app: DriverAppService, private readonly idem: IdempotencyService) {}

  @Auth('DRIVER')
  @Post('gps/batch')
  @HttpCode(200)
  async batch(@Body() body: unknown) {
    const d = parse(batchSchema, body);
    return this.idem.run(d.clientRequestId, 'gps.batch', async () => {
      const trip = await this.app.assertOwnTrip(d.tripId);
      // Chấp nhận điểm ghi trong lúc chạy; cho phép gửi bù sau khi chuyến vừa hoàn thành (buffer offline) trong 6 giờ.
      const running = TRIP_RUNNING_STATUSES.includes(trip.status as any);
      const recentlyClosed = trip.actualEndAt && Date.now() - trip.actualEndAt.getTime() < 6 * 3_600_000;
      if (!running && !recentlyClosed) throw businessRule('Chuyến không ở trạng thái đang chạy');
      const me = this.app.me();
      const res = await this.prisma.db.tripLocation.createMany({
        data: d.points.map((p) => ({
          tripId: trip.id, driverId: me.driverId, lat: p.lat, lng: p.lng, accuracy: p.accuracyMeters ?? null, speed: p.speed ?? null,
          heading: p.heading ?? null, batteryLevel: p.batteryLevel ?? null, recordedAt: p.recordedAt,
        })) as any,
        skipDuplicates: true,
      });
      const latest = d.points.reduce((a, b) => (a.recordedAt > b.recordedAt ? a : b));
      if (!trip.lastLocationAt || latest.recordedAt > trip.lastLocationAt) {
        await this.prisma.db.trip.update({ where: { id: trip.id }, data: { lastLat: latest.lat, lastLng: latest.lng, lastLocationAt: latest.recordedAt } });
      }
      return { accepted: res.count, duplicates: d.points.length - res.count };
    });
  }
}
