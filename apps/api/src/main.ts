import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: false });
  app.enableCors({ origin: true, credentials: true, exposedHeaders: ['x-request-id'] });
  app.useBodyParser('json', { limit: '5mb' });
  app.enableShutdownHooks();
  await app.listen(env().PORT);
  Logger.log(`BTA API http://localhost:${env().PORT}/graphql`, 'Bootstrap');
}
bootstrap();
