import { Field, ID, Int, ObjectType, Float } from '@nestjs/graphql';

@ObjectType()
export class AttachmentView {
  @Field(() => ID) id: string;
  @Field(() => String) entityType: string;
  @Field(() => ID) entityId: string;
  @Field(() => String) category: string;
  @Field() fileName: string;
  @Field() mimeType: string;
  @Field(() => Int) size: number;
  @Field(() => String) status: string;
  @Field(() => String) uploadedByType: string;
  @Field(() => String, { nullable: true }) uploadedByName?: string | null;
  @Field(() => Date, { nullable: true }) capturedAt?: Date | null;
  @Field(() => Float, { nullable: true }) lat?: number | null;
  @Field(() => Float, { nullable: true }) lng?: number | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field() sharedWithCustomer: boolean;
  @Field() createdAt: Date;
  @Field(() => String, { nullable: true }) url?: string | null;
}
