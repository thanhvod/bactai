import 'reflect-metadata';
import './common/graphql/enums';
import * as path from 'node:path';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { CommonModule } from './common/common.module';
import { AuthGuard } from './common/auth/auth.guard';
import { ContextMiddleware } from './common/auth/context.middleware';
import { formatGraphQLError } from './common/errors/error-format';
import { RestExceptionFilter } from './common/errors/rest-exception.filter';
import { env } from './config/env';
import { DOMAIN_MODULES } from './modules';

@Module({
  imports: [
    CommonModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: env().NODE_ENV === 'test' ? true : path.resolve(__dirname, '../schema.gql'),
      sortSchema: true,
      playground: false,
      introspection: env().NODE_ENV !== 'production',
      context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
      formatError: formatGraphQLError,
      buildSchemaOptions: { dateScalarMode: 'isoDate' },
    }),
    ...DOMAIN_MODULES,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_FILTER, useClass: RestExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware).forRoutes('*path');
  }
}
