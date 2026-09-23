import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CatalogItemView {
  @Field(() => ID) id: string;
  @Field(() => String) type: string;
  @Field() code: string;
  @Field() name: string;
  @Field(() => String, { nullable: true }) appliesTo?: string | null;
  @Field() isDefault: boolean;
  @Field(() => Int) sortOrder: number;
  @Field() active: boolean;
  @Field(() => Int) usageCount: number;
}

@InputType()
export class CatalogItemInput {
  @Field(() => String) type: string;
  @Field({ nullable: true }) code?: string;
  @Field() name: string;
  @Field({ nullable: true }) appliesTo?: string;
  @Field(() => Int, { nullable: true }) sortOrder?: number;
  @Field({ nullable: true }) active?: boolean;
}
