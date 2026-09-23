import { Global, Module } from '@nestjs/common';
import { BookingsResolver } from './bookings.resolver';
import { BookingsService } from './bookings.service';

@Global()
@Module({ providers: [BookingsService, BookingsResolver], exports: [BookingsService] })
export class BookingsModule {}
