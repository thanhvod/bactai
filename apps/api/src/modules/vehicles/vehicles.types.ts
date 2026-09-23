import { Field, Float, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ConnectionType } from '../../common/graphql/pagination';
import { MoneyScalar } from '../../common/graphql/scalars';
import { MasterExpenseItem, MasterRef, MasterTripItem } from '../drivers/master-brief.types';

@ObjectType()
export class VehicleCurrentTrip {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) driverName?: string | null;
  @Field() plannedStartAt: Date;
}

@ObjectType()
export class VehicleStats {
  @Field(() => Int) tripCount30d: number;
  @Field(() => MoneyScalar) cost30d: number;
}

@ObjectType()
export class VehicleView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() plate: string;
  @Field(() => ID, { nullable: true }) typeId?: string | null;
  @Field(() => MasterRef, { nullable: true }) type?: MasterRef | null;
  @Field(() => Float, { nullable: true }) capacityTons?: number | null;
  @Field(() => String, { nullable: true }) brandModel?: string | null;
  @Field(() => Int, { nullable: true }) year?: number | null;
  @Field(() => String, { nullable: true }) chassisNo?: string | null;
  @Field(() => String, { nullable: true }) engineNo?: string | null;
  @Field(() => String, { nullable: true }) boxSize?: string | null;
  @Field(() => String, { nullable: true }) fuelNorm?: string | null;
  @Field(() => Date, { nullable: true }) registrationExpiresAt?: Date | null;
  @Field(() => Date, { nullable: true }) insuranceExpiresAt?: Date | null;
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => VehicleCurrentTrip, { nullable: true }) currentTrip?: VehicleCurrentTrip | null;
  @Field(() => MoneyScalar) monthCost: number;
  @Field(() => [String]) expiryWarnings: string[];
  @Field(() => [MasterTripItem], { nullable: true }) tripHistory?: MasterTripItem[];
  @Field(() => [MasterExpenseItem], { nullable: true }) expenses?: MasterExpenseItem[];
  @Field(() => VehicleStats, { nullable: true }) stats?: VehicleStats;
}

@ObjectType()
export class VehicleConnection extends ConnectionType(VehicleView, 'VehicleConnection') {}

@InputType()
export class VehicleFilter {
  @Field({ nullable: true }) search?: string;
  @Field(() => String, { nullable: true }) status?: string;
  @Field(() => ID, { nullable: true }) typeId?: string;
}

@InputType()
export class VehicleInput {
  @Field() plate: string;
  @Field(() => ID, { nullable: true }) typeId?: string;
  @Field(() => Float, { nullable: true }) capacityTons?: number;
  @Field({ nullable: true }) brandModel?: string;
  @Field(() => Int, { nullable: true }) year?: number;
  @Field({ nullable: true }) chassisNo?: string;
  @Field({ nullable: true }) engineNo?: string;
  @Field({ nullable: true }) boxSize?: string;
  @Field({ nullable: true }) fuelNorm?: string;
  @Field({ nullable: true }) registrationExpiresAt?: string;
  @Field({ nullable: true }) insuranceExpiresAt?: string;
  @Field(() => String, { nullable: true }) status?: string;
  @Field({ nullable: true }) note?: string;
}

@ObjectType()
export class VehicleOption {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() plate: string;
  @Field(() => String, { nullable: true }) typeName?: string | null;
  @Field(() => Float, { nullable: true }) capacityTons?: number | null;
  @Field(() => String) status: string;
  @Field() busy: boolean;
  @Field(() => String, { nullable: true }) busyTripCode?: string | null;
}
