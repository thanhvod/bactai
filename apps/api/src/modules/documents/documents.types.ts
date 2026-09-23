import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class RenderDocumentInput {
  /** DELIVERY_NOTE | DISPATCH_NOTE | TRIP_COST_SHEET | DRIVER_RECONCILIATION | PAYROLL | PAYSLIP | DEBT_STATEMENT */
  @Field() template: string;
  @Field(() => ID) entityId: string;
  /** YYYY-MM-DD — cho DRIVER_RECONCILIATION */
  @Field({ nullable: true }) from?: string;
  @Field({ nullable: true }) to?: string;
  /** PDF | HTML */
  @Field({ nullable: true, defaultValue: 'PDF' }) format?: string;
}

@ObjectType()
export class RenderedDocument {
  @Field() template: string;
  @Field() fileName: string;
  @Field(() => String, { nullable: true }) url?: string | null;
  @Field(() => ID, { nullable: true }) attachmentId?: string | null;
  @Field(() => String, { nullable: true }) html?: string | null;
}
