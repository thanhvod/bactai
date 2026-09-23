import { Module } from '@nestjs/common';
import { ExportsModule } from '../exports/exports.module';
import { ImportsResolver } from './imports.resolver';
import { ImportsService } from './imports.service';

@Module({ imports: [ExportsModule], providers: [ImportsService, ImportsResolver] })
export class ImportsModule {}
