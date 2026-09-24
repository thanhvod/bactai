import { Injectable, Logger, OnApplicationShutdown, OnApplicationBootstrap } from '@nestjs/common';
import { runAsSystem } from '../../common/context/request-context';
import { JobRunner } from '../../common/jobs/job-runner';
import { PrismaService } from '../../common/prisma/prisma.service';
import { env } from '../../config/env';
import { DebtService } from '../finance/debt.service';

const MINUTE = 60_000;

/**
 * Job định kỳ (HARD-001, D-010 chạy inline): quét cảnh báo COD / đơn quá hạn cho từng nhà xe và dọn GPS cũ
 * theo `gpsRetentionDays`. Tắt khi NODE_ENV=test hoặc SCHEDULER_ENABLED=false.
 */
@Injectable()
export class SchedulerService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(SchedulerService.name);
  private timers: NodeJS.Timeout[] = [];

  constructor(private readonly prisma: PrismaService, private readonly debt: DebtService, private readonly jobs: JobRunner) {}

  onApplicationBootstrap() {
    if (env().NODE_ENV === 'test' || process.env.SCHEDULER_ENABLED === 'false') return;
    this.every(30 * MINUTE, 'alerts', () => this.runAlerts());
    this.every(24 * 60 * MINUTE, 'gps-cleanup', () => this.cleanupGps());
    this.every(24 * 60 * MINUTE, 'housekeeping', () => this.housekeeping());
    this.logger.log('Scheduler bật: cảnh báo 30 phút/lần, dọn GPS mỗi ngày');
  }

  onApplicationShutdown() {
    this.timers.forEach(clearInterval);
  }

  private every(ms: number, name: string, fn: () => Promise<unknown>) {
    // chạy lần đầu sau 1 phút để không chặn khởi động
    const first = setTimeout(() => this.jobs.enqueue(name, fn), MINUTE);
    this.timers.push(first, setInterval(() => this.jobs.enqueue(name, fn), ms));
  }

  private async merchants() {
    return this.prisma.raw.merchant.findMany({ where: { status: 'ACTIVE' }, select: { id: true, code: true } });
  }

  /** Mỗi nhà xe: cảnh báo COD tài xế giữ quá ngưỡng + đơn quá hạn thanh toán (không trùng trong 24h — xử lý trong DebtService). */
  async runAlerts() {
    let cod = 0;
    let overdue = 0;
    for (const m of await this.merchants()) {
      await runAsSystem(m.id, async () => {
        cod += await this.debt.scanCodWarnings();
        overdue += await this.debt.scanOverdueOrders();
      }).catch((e) => this.logger.error(`alerts ${m.code}: ${(e as Error).message}`));
    }
    return { cod, overdue };
  }

  /** Giữ raw GPS theo cài đặt merchant (mặc định 180 ngày); điểm cuối của chuyến vẫn lưu trên bảng trips. */
  async cleanupGps() {
    let deleted = 0;
    for (const m of await this.merchants()) {
      const s = await this.prisma.raw.merchantSettings.findUnique({ where: { merchantId: m.id } });
      const days = s?.gpsRetentionDays ?? 180;
      const r = await this.prisma.raw.tripLocation.deleteMany({ where: { merchantId: m.id, recordedAt: { lt: new Date(Date.now() - days * 86_400_000) } } });
      deleted += r.count;
    }
    if (deleted) this.logger.log(`Dọn ${deleted} điểm GPS quá hạn lưu trữ`);
    return { deleted };
  }

  /** Dọn dữ liệu phụ: thông báo đã đọc > 180 ngày, khóa chống ghi trùng > 30 ngày, OTP > 7 ngày, phiên hết hạn. */
  async housekeeping() {
    const day = 86_400_000;
    const now = Date.now();
    const [n, i, o, r1, r2, r3] = await Promise.all([
      this.prisma.raw.notification.deleteMany({ where: { readAt: { lt: new Date(now - 180 * day) } } }),
      this.prisma.raw.idempotencyKey.deleteMany({ where: { createdAt: { lt: new Date(now - 30 * day) } } }),
      this.prisma.raw.otpCode.deleteMany({ where: { createdAt: { lt: new Date(now - 7 * day) } } }),
      this.prisma.raw.driverRefreshToken.deleteMany({ where: { expiresAt: { lt: new Date(now) } } }),
      this.prisma.raw.userRefreshToken.deleteMany({ where: { expiresAt: { lt: new Date(now) } } }),
      this.prisma.raw.customerRefreshToken.deleteMany({ where: { expiresAt: { lt: new Date(now) } } }),
    ]);
    const res = { notifications: n.count, idempotencyKeys: i.count, otpCodes: o.count, expiredSessions: r1.count + r2.count + r3.count };
    this.logger.log(`Housekeeping: ${JSON.stringify(res)}`);
    return res;
  }
}
