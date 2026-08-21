import { Module } from '@nestjs/common';
import { HealthResolver } from './presentation/health.resolver';

@Module({
  providers: [HealthResolver],
})
export class HealthModule {}
