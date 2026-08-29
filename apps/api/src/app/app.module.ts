import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { BigIntScalar } from '../common/bigint.scalar';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../modules/auth/auth.module';
import { CatalogsModule } from '../modules/catalogs/catalogs.module';
import { CustomersModule } from '../modules/customers/customers.module';
import { DriversModule } from '../modules/drivers/drivers.module';
import { FinanceModule } from '../modules/finance/finance.module';
import { HealthModule } from '../modules/health/health.module';
import { MerchantModule } from '../modules/merchant/merchant.module';
import { OrdersModule } from '../modules/orders/orders.module';
import { PayrollsModule } from '../modules/payrolls/payrolls.module';
import { ReportsModule } from '../modules/reports/reports.module';
import { SuppliersModule } from '../modules/suppliers/suppliers.module';
import { TripsModule } from '../modules/trips/trips.module';
import { VehiclesModule } from '../modules/vehicles/vehicles.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // code-first: schema sinh ra tại apps/api/src/schema.gql (08-kien-truc.md mục 2)
      autoSchemaFile: join(process.cwd(), 'apps/api/src/schema.gql'),
      sortSchema: true,
      playground: true,
    }),
    PrismaModule,
    AuthModule,
    HealthModule,
    CatalogsModule,
    MerchantModule,
    CustomersModule,
    VehiclesModule,
    DriversModule,
    SuppliersModule,
    OrdersModule,
    TripsModule,
    FinanceModule,
    PayrollsModule,
    ReportsModule,
  ],
  providers: [BigIntScalar],
})
export class AppModule {}
