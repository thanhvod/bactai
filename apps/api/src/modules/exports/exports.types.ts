import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from '../../common/graphql/common.types';

@InputType()
export class ExportFileInput {
  /** ORDERS | CUSTOMER_DEBT | PAYROLL | COD_HELD | EXPENSES | PAYMENTS | CUSTOMERS | VEHICLES | DRIVERS | SUPPLIERS | REPORT_PROFIT */
  @Field() template: string;
  /** Bộ lọc tùy template: {dateFrom, dateTo, status, customerId, driverId, payrollId, groupBy, ...} */
  @Field(() => GraphQLJSON, { nullable: true }) filter?: Record<string, any>;
}

@ObjectType()
export class ExportedFile {
  @Field() template: string;
  @Field() fileName: string;
  @Field() url: string;
  @Field(() => Int) rowCount: number;
}
