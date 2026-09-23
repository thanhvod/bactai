import { Module } from '@nestjs/common';
import { IncidentsResolver } from './incidents.resolver';
import { IncidentsService } from './incidents.service';

@Module({ providers: [IncidentsService, IncidentsResolver], exports: [IncidentsService] })
export class IncidentsModule {}
