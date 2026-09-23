import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { MoneyScalar } from '../../common/graphql/scalars';

@ObjectType()
export class MerchantProfile {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() name: string;
  @Field(() => String, { nullable: true }) legalName?: string | null;
  @Field(() => String, { nullable: true }) taxCode?: string | null;
  @Field(() => String, { nullable: true }) businessType?: string | null;
  @Field(() => String, { nullable: true }) address?: string | null;
  @Field(() => String, { nullable: true }) province?: string | null;
  @Field(() => String, { nullable: true }) district?: string | null;
  @Field(() => String, { nullable: true }) yardName?: string | null;
  @Field(() => String, { nullable: true }) representativeName?: string | null;
  @Field(() => String, { nullable: true }) representativeTitle?: string | null;
  @Field(() => String, { nullable: true }) contactName?: string | null;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => String, { nullable: true }) dispatchHotline?: string | null;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) intro?: string | null;
  @Field(() => String, { nullable: true }) logoAttachmentId?: string | null;
  @Field(() => String, { nullable: true }) logoUrl?: string | null;
  @Field() publicProfile: boolean;
  @Field(() => [String]) serviceAreas: string[];
  @Field(() => [String]) services: string[];
  @Field() updatedAt: Date;
}

@InputType()
export class MerchantProfileInput {
  @Field() name: string;
  @Field({ nullable: true }) legalName?: string;
  @Field({ nullable: true }) taxCode?: string;
  @Field({ nullable: true }) businessType?: string;
  @Field({ nullable: true }) address?: string;
  @Field({ nullable: true }) province?: string;
  @Field({ nullable: true }) district?: string;
  @Field({ nullable: true }) yardName?: string;
  @Field({ nullable: true }) representativeName?: string;
  @Field({ nullable: true }) representativeTitle?: string;
  @Field({ nullable: true }) contactName?: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) dispatchHotline?: string;
  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) intro?: string;
  @Field({ nullable: true }) publicProfile?: boolean;
  @Field(() => [String], { nullable: true }) serviceAreas?: string[];
  @Field(() => [String], { nullable: true }) services?: string[];
  @Field(() => ID, { nullable: true }) logoAttachmentId?: string;
}

@ObjectType()
export class MerchantSettingsView {
  @Field(() => String) payrollPeriodType: string;
  @Field(() => Int) payrollStartDay: number;
  @Field(() => Int) nearOverlapMinutes: number;
  @Field(() => Int) defaultTripHours: number;
  @Field() overlapWarnVehicle: boolean;
  @Field() overlapWarnDriver: boolean;
  @Field(() => MoneyScalar) codWarningAmount: number;
  @Field(() => Int) codWarningDays: number;
  @Field() codDashboardAlert: boolean;
  @Field(() => Int) defaultDebtDays: number;
  @Field(() => MoneyScalar, { nullable: true }) defaultCreditLimit?: number | null;
  @Field() warnOverLimit: boolean;
  @Field() warnOverdue: boolean;
  @Field(() => Int) gpsRetentionDays: number;
  @Field() updatedAt: Date;
}

@InputType()
export class MerchantSettingsInput {
  @Field(() => String, { nullable: true }) payrollPeriodType?: string;
  @Field(() => Int, { nullable: true }) payrollStartDay?: number;
  @Field(() => Int, { nullable: true }) nearOverlapMinutes?: number;
  @Field(() => Int, { nullable: true }) defaultTripHours?: number;
  @Field({ nullable: true }) overlapWarnVehicle?: boolean;
  @Field({ nullable: true }) overlapWarnDriver?: boolean;
  @Field(() => MoneyScalar, { nullable: true }) codWarningAmount?: number;
  @Field(() => Int, { nullable: true }) codWarningDays?: number;
  @Field({ nullable: true }) codDashboardAlert?: boolean;
  @Field(() => Int, { nullable: true }) defaultDebtDays?: number;
  @Field(() => MoneyScalar, { nullable: true }) defaultCreditLimit?: number | null;
  @Field({ nullable: true }) warnOverLimit?: boolean;
  @Field({ nullable: true }) warnOverdue?: boolean;
  @Field(() => Int, { nullable: true }) gpsRetentionDays?: number;
}

@ObjectType()
export class NumberSequenceView {
  @Field(() => String) docType: string;
  @Field() label: string;
  @Field() prefix: string;
  @Field() separator: string;
  @Field() datePart: string;
  @Field(() => Int) digits: number;
  @Field(() => String) resetPeriod: string;
  @Field() pattern: string;
  @Field() nextValue: string;
  @Field(() => Int) issuedThisPeriod: number;
}

@InputType()
export class NumberFormatInput {
  @Field() prefix: string;
  @Field() separator: string;
  @Field() datePart: string;
  @Field(() => Int) digits: number;
  @Field(() => String) resetPeriod: string;
}
