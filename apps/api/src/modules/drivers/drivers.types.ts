import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ConnectionType } from '../../common/graphql/pagination';
import { MoneyScalar } from '../../common/graphql/scalars';
import { MasterTripItem } from './master-brief.types';

@ObjectType()
export class DriverCurrentTrip {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) vehiclePlate?: string | null;
  @Field(() => String, { nullable: true }) routeSummary?: string | null;
  @Field() plannedStartAt: Date;
}

@ObjectType()
export class DriverAppAccountView {
  @Field(() => String) status: string;
  @Field(() => Date, { nullable: true }) lastLoginAt?: Date | null;
  @Field() mustChangePassword: boolean;
  @Field(() => String, { nullable: true }) deviceInfo?: string | null;
}

@ObjectType()
export class DriverLedgerBrief {
  @Field(() => MoneyScalar) codHeld: number;
  @Field(() => MoneyScalar) companyOwesDriver: number;
  @Field(() => MoneyScalar) driverOwesCompany: number;
  @Field(() => MoneyScalar) netBalance: number;
  @Field() overAmount: boolean;
  @Field() overDays: boolean;
  @Field(() => Int) daysHeld: number;
}

@ObjectType()
export class DriverSalaryHistoryView {
  @Field(() => ID) id: string;
  @Field(() => MoneyScalar) amount: number;
  @Field() effectiveFrom: Date;
  @Field(() => Date, { nullable: true }) effectiveTo?: Date | null;
  @Field(() => MoneyScalar, { nullable: true }) delta?: number | null;
  @Field(() => String, { nullable: true }) reason?: string | null;
  @Field(() => String, { nullable: true }) createdByName?: string | null;
  @Field() createdAt: Date;
  @Field() isCurrent: boolean;
}

@ObjectType()
export class DriverView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() name: string;
  @Field() phone: string;
  @Field(() => Date, { nullable: true }) dob?: Date | null;
  @Field(() => String, { nullable: true }) idNumber?: string | null;
  @Field(() => String, { nullable: true }) address?: string | null;
  @Field(() => String, { nullable: true }) emergencyContact?: string | null;
  @Field(() => String, { nullable: true }) licenseClass?: string | null;
  @Field(() => String, { nullable: true }) licenseNumber?: string | null;
  @Field(() => Date, { nullable: true }) licenseExpiresAt?: Date | null;
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => DriverCurrentTrip, { nullable: true }) currentTrip?: DriverCurrentTrip | null;
  @Field(() => DriverAppAccountView) appAccount: DriverAppAccountView;
  @Field(() => MoneyScalar, { nullable: true }) fixedSalary?: number | null;
  @Field(() => DriverLedgerBrief) ledgerSummary: DriverLedgerBrief;
  @Field(() => [String]) warnings: string[];
  @Field(() => [DriverSalaryHistoryView], { nullable: true }) salaryHistory?: DriverSalaryHistoryView[];
  @Field(() => [MasterTripItem], { nullable: true }) recentTrips?: MasterTripItem[];
  /** Chỉ trả 1 lần khi tạo tài xế kèm tài khoản app */
  @Field(() => String, { nullable: true }) issuedTempPassword?: string | null;
}

@ObjectType()
export class DriverConnection extends ConnectionType(DriverView, 'DriverConnection') {}

@InputType()
export class DriverFilter {
  @Field({ nullable: true }) search?: string;
  @Field(() => String, { nullable: true }) status?: string;
  @Field({ nullable: true }) hasApp?: boolean;
  @Field({ nullable: true }) codWarning?: boolean;
}

@InputType()
export class DriverInput {
  @Field() name: string;
  @Field() phone: string;
  @Field({ nullable: true }) dob?: string;
  @Field({ nullable: true }) idNumber?: string;
  @Field({ nullable: true }) address?: string;
  @Field({ nullable: true }) emergencyContact?: string;
  @Field({ nullable: true }) licenseClass?: string;
  @Field({ nullable: true }) licenseNumber?: string;
  @Field({ nullable: true }) licenseExpiresAt?: string;
  @Field(() => String, { nullable: true }) status?: string;
  @Field({ nullable: true }) note?: string;
  @Field(() => MoneyScalar, { nullable: true }) fixedSalary?: number;
  @Field({ nullable: true }) salaryEffectiveFrom?: string;
  @Field({ nullable: true }) salaryReason?: string;
  @Field({ nullable: true }) appLoginEnabled?: boolean;
}

@InputType()
export class SalaryHistoryInput {
  @Field(() => MoneyScalar) amount: number;
  @Field() effectiveFrom: string;
  @Field({ nullable: true }) reason?: string;
}

@ObjectType()
export class DriverAccountCredentials {
  @Field() phone: string;
  @Field() tempPassword: string;
  @Field(() => String) status: string;
}

@ObjectType()
export class DriverOption {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() name: string;
  @Field() phone: string;
  @Field(() => String) status: string;
  @Field() busy: boolean;
  @Field(() => String, { nullable: true }) busyTripCode?: string | null;
}
