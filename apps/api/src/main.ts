import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

// Tiền VND lưu BigInt (07-data-model). REST/JSON serialize về number (an toàn < 2^53).
(BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  const port = process.env.PORT || 2001;
  await app.listen(port);
  Logger.log(`🚀 API: http://localhost:${port}/graphql`);
}

bootstrap();
