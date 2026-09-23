import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/auth/decorators';
import { PrismaService } from '../../common/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async health() {
    let db = 'ok';
    try {
      await this.prisma.raw.$queryRaw`SELECT 1`;
    } catch {
      db = 'error';
    }
    return { status: db === 'ok' ? 'ok' : 'degraded', db, time: new Date().toISOString() };
  }
}
