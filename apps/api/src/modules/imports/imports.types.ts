import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from '../../common/graphql/common.types';

@InputType()
export class StartImportInput {
  /** CUSTOMER | VEHICLE | DRIVER */
  @Field() entityType: string;
  @Field() fileName: string;
  /** Nội dung file .xlsx/.csv dạng base64 */
  @Field() fileBase64: string;
  /** Tùy chọn: { "<tên cột trong file>": "<field hệ thống>" } — mặc định tự nhận diện header tiếng Việt */
  @Field(() => GraphQLJSON, { nullable: true }) mapping?: Record<string, string>;
}

@ObjectType()
export class ImportRowView {
  @Field(() => Int) line: number;
  @Field(() => GraphQLJSON) values: Record<string, unknown>;
  @Field(() => [String]) errors: string[];
  @Field(() => [String]) warnings: string[];
  @Field(() => String, { nullable: true }) createdCode?: string | null;
}

@ObjectType()
export class ImportFieldView {
  @Field() key: string;
  @Field() label: string;
  @Field() required: boolean;
  @Field(() => String, { nullable: true }) sourceColumn?: string | null;
}

@ObjectType()
export class ImportJobView {
  @Field(() => ID) id: string;
  @Field(() => String) entityType: string;
  @Field() fileName: string;
  @Field(() => String) status: string;
  @Field(() => Int) totalRows: number;
  @Field(() => Int) validRows: number;
  @Field(() => Int) warningRows: number;
  @Field(() => Int) errorRows: number;
  @Field(() => [ImportFieldView]) fields: ImportFieldView[];
  @Field(() => [String]) unmappedColumns: string[];
  @Field(() => [ImportRowView]) rows: ImportRowView[];
  @Field(() => Int, { nullable: true }) createdCount?: number | null;
  @Field(() => Int, { nullable: true }) skippedCount?: number | null;
  @Field(() => Date, { nullable: true }) committedAt?: Date | null;
  @Field() createdAt: Date;
}

@InputType()
export class ImportPreviewFilter {
  @Field({ nullable: true }) onlyErrors?: boolean;
  @Field({ nullable: true }) onlyWarnings?: boolean;
}

@ObjectType()
export class ImportTemplateFile {
  @Field() fileName: string;
  @Field() url: string;
}
