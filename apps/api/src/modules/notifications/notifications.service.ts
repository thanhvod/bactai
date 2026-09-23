import { Injectable } from '@nestjs/common';
import { currentPrincipal } from '../../common/context/request-context';
import { unauthenticated } from '../../common/errors/app-error';
import { paginate } from '../../common/graphql/pagination';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { NotificationFilter } from './notifications.types';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Người nhận hiện tại: USER = membership (theo merchant đang chọn), DRIVER = driverId, CUSTOMER = accountId. */
  recipient(): { recipientType: 'USER' | 'DRIVER' | 'CUSTOMER'; recipientId: string } {
    const p = currentPrincipal();
    if (!p) throw unauthenticated();
    if (p.type === 'USER') {
      if (!p.membershipId) throw unauthenticated();
      return { recipientType: 'USER', recipientId: p.membershipId };
    }
    if (p.type === 'DRIVER') return { recipientType: 'DRIVER', recipientId: p.driverId };
    return { recipientType: 'CUSTOMER', recipientId: p.accountId };
  }

  async list(filter: NotificationFilter = {}, page: { first?: number; after?: string | null }) {
    const r = this.recipient();
    const where: any = { ...r };
    if (filter.unread) where.readAt = null;
    if (filter.types?.length) where.type = { in: filter.types };
    const [conn, unreadCount] = await Promise.all([
      paginate(this.prisma.raw.notification as any, { where, orderBy: { createdAt: 'desc' } }, page),
      this.prisma.raw.notification.count({ where: { ...r, readAt: null } }),
    ]);
    return { ...conn, unreadCount };
  }

  async unreadCount() {
    return this.prisma.raw.notification.count({ where: { ...this.recipient(), readAt: null } });
  }

  async markRead(ids: string[] | null) {
    const r = this.recipient();
    await this.prisma.raw.notification.updateMany({ where: { ...r, readAt: null, ...(ids ? { id: { in: ids } } : {}) }, data: { readAt: new Date() } });
    return this.unreadCount();
  }
}
