import { Field, Float, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from '../../common/graphql/common.types';
import { ConnectionType } from '../../common/graphql/pagination';
import { MoneyScalar } from '../../common/graphql/scalars';

@ObjectType()
export class CustomerAccountView {
  @Field(() => ID) id: string;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field() phone: string;
  @Field() fullName: string;
  @Field(() => String, { nullable: true }) companyName?: string | null;
  @Field(() => String, { nullable: true }) taxCode?: string | null;
  @Field(() => String, { nullable: true }) billingAddress?: string | null;
  @Field(() => String, { nullable: true }) contactTitle?: string | null;
  @Field(() => GraphQLJSON, { nullable: true }) notificationPrefs?: unknown;
}

@ObjectType()
export class MerchantLinkView {
  @Field(() => ID) merchantId: string;
  @Field() merchantName: string;
  @Field() customerCode: string;
  @Field(() => Int, { nullable: true }) paymentTermDays?: number | null;
  @Field(() => Int) orderCount: number;
}

@ObjectType()
export class CustomerMe {
  @Field(() => CustomerAccountView) account: CustomerAccountView;
  @Field(() => [MerchantLinkView]) merchantLinks: MerchantLinkView[];
}

@InputType()
export class CustomerProfileInput {
  @Field() fullName: string;
  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) companyName?: string;
  @Field({ nullable: true }) taxCode?: string;
  @Field({ nullable: true }) billingAddress?: string;
  @Field({ nullable: true }) contactTitle?: string;
  @Field(() => GraphQLJSON, { nullable: true }) notificationPrefs?: unknown;
}

@ObjectType()
export class CustomerAddressView {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field() address: string;
  @Field(() => String) usage: string;
  @Field(() => Float, { nullable: true }) lat?: number | null;
  @Field(() => Float, { nullable: true }) lng?: number | null;
  @Field(() => String, { nullable: true }) contactName?: string | null;
  @Field(() => String, { nullable: true }) contactPhone?: string | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field() isDefaultPickup: boolean;
}

@InputType()
export class CustomerAddressInput {
  @Field() name: string;
  @Field() address: string;
  @Field(() => String, { nullable: true }) usage?: string;
  @Field(() => Float, { nullable: true }) lat?: number;
  @Field(() => Float, { nullable: true }) lng?: number;
  @Field({ nullable: true }) contactName?: string;
  @Field({ nullable: true }) contactPhone?: string;
  @Field({ nullable: true }) note?: string;
  @Field({ nullable: true }) isDefaultPickup?: boolean;
}

@ObjectType()
export class PublicMerchantView {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field(() => String, { nullable: true }) intro?: string | null;
  @Field(() => [String]) serviceAreas: string[];
  @Field(() => [String]) services: string[];
  @Field(() => [String]) vehicleTypes: string[];
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => String, { nullable: true }) dispatchHotline?: string | null;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) address?: string | null;
  @Field(() => String, { nullable: true }) province?: string | null;
  @Field(() => String, { nullable: true }) logoUrl?: string | null;
  @Field(() => Int) vehicleCount: number;
  @Field() hasRelationship: boolean;
  @Field(() => Int) myOrderCount: number;
}

@ObjectType()
export class PublicMerchantConnection extends ConnectionType(PublicMerchantView, 'PublicMerchantConnection') {}

@InputType()
export class PublicMerchantFilter {
  @Field({ nullable: true }) keyword?: string;
  @Field({ nullable: true }) area?: string;
  @Field({ nullable: true }) service?: string;
  @Field({ nullable: true }) vehicleType?: string;
}

@ObjectType()
export class BookingStopView {
  @Field(() => String) type: string;
  @Field() address: string;
  @Field(() => String, { nullable: true }) locationName?: string | null;
  @Field(() => String, { nullable: true }) contactName?: string | null;
  @Field(() => String, { nullable: true }) contactPhone?: string | null;
  @Field(() => String, { nullable: true }) note?: string | null;
}

@ObjectType()
export class BookingNoteView {
  @Field(() => ID) id: string;
  @Field(() => String) authorType: string;
  @Field(() => String, { nullable: true }) authorName?: string | null;
  @Field() body: string;
  @Field() createdAt: Date;
}

@ObjectType()
export class BookingStatusEntry {
  @Field(() => String, { nullable: true }) fromStatus?: string | null;
  @Field() toStatus: string;
  @Field(() => String, { nullable: true }) reason?: string | null;
  @Field(() => String, { nullable: true }) actorName?: string | null;
  @Field() changedAt: Date;
}

@ObjectType()
export class BookingView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) status: string;
  @Field(() => ID) merchantId: string;
  @Field() merchantName: string;
  @Field(() => [BookingStopView]) stops: BookingStopView[];
  @Field() cargoName: string;
  @Field(() => Float, { nullable: true }) weightTon?: number | null;
  @Field(() => Int, { nullable: true }) packages?: number | null;
  @Field(() => String, { nullable: true }) vehicleTypeHint?: string | null;
  @Field() fragile: boolean;
  @Field() loadingAtPickup: boolean;
  @Field() loadingAtDrop: boolean;
  @Field(() => Date, { nullable: true }) pickupFrom?: Date | null;
  @Field(() => Date, { nullable: true }) deliverBefore?: Date | null;
  @Field(() => String, { nullable: true }) flexibility?: string | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field() contactName: string;
  @Field() contactPhone: string;
  @Field(() => String, { nullable: true }) rejectReason?: string | null;
  @Field(() => String, { nullable: true }) cancelReason?: string | null;
  @Field(() => ID, { nullable: true }) orderId?: string | null;
  @Field(() => String, { nullable: true }) orderCode?: string | null;
  @Field(() => ID, { nullable: true }) customerId?: string | null;
  @Field(() => String, { nullable: true }) customerName?: string | null;
  @Field(() => String, { nullable: true }) accountName?: string | null;
  @Field(() => String, { nullable: true }) accountEmail?: string | null;
  @Field(() => [BookingNoteView]) notes: BookingNoteView[];
  @Field(() => [BookingStatusEntry]) statusHistory: BookingStatusEntry[];
  @Field(() => GraphQLJSON, { nullable: true }) orderAdjustments?: unknown;
  @Field() createdAt: Date;
}

@ObjectType()
export class BookingConnection extends ConnectionType(BookingView, 'BookingConnection') {}

@InputType()
export class BookingFilter {
  @Field(() => [String], { nullable: true }) status?: string[];
  @Field({ nullable: true }) keyword?: string;
  @Field({ nullable: true }) dateFrom?: string;
  @Field({ nullable: true }) dateTo?: string;
}

@InputType()
export class BookingStopInput {
  @Field(() => String) type: string;
  @Field(() => ID, { nullable: true }) addressId?: string;
  @Field() address: string;
  @Field({ nullable: true }) locationName?: string;
  @Field({ nullable: true }) contactName?: string;
  @Field({ nullable: true }) contactPhone?: string;
  @Field({ nullable: true }) note?: string;
}

@InputType()
export class BookingInput {
  @Field(() => ID) merchantId: string;
  @Field(() => [BookingStopInput]) stops: BookingStopInput[];
  @Field() cargoName: string;
  @Field(() => Float, { nullable: true }) weightTon?: number;
  @Field(() => Int, { nullable: true }) packages?: number;
  @Field({ nullable: true }) vehicleTypeHint?: string;
  @Field({ nullable: true }) fragile?: boolean;
  @Field({ nullable: true }) loadingAtPickup?: boolean;
  @Field({ nullable: true }) loadingAtDrop?: boolean;
  @Field({ nullable: true }) pickupFrom?: Date;
  @Field({ nullable: true }) deliverBefore?: Date;
  @Field({ nullable: true }) flexibility?: string;
  @Field({ nullable: true }) note?: string;
  @Field() contactName: string;
  @Field() contactPhone: string;
}

@ObjectType()
export class MyOrderStopView {
  @Field(() => String) type: string;
  @Field(() => String, { nullable: true }) place?: string | null;
  @Field() address: string;
  @Field(() => String, { nullable: true }) contactName?: string | null;
  @Field(() => Date, { nullable: true }) plannedAt?: Date | null;
  @Field(() => Date, { nullable: true }) actualAt?: Date | null;
  @Field(() => String) status: string;
}

@ObjectType()
export class MyTripProgress {
  @Field() code: string;
  @Field(() => String, { nullable: true }) plate?: string | null;
  @Field(() => String, { nullable: true }) vehicleType?: string | null;
  @Field(() => String, { nullable: true }) driverName?: string | null;
  @Field(() => String) status: string;
  @Field() lastUpdateAt: Date;
}

@ObjectType()
export class PricingLine {
  @Field() label: string;
  @Field(() => MoneyScalar) amount: number;
}

@ObjectType()
export class SharedAttachmentView {
  @Field(() => ID) id: string;
  @Field() fileName: string;
  @Field(() => String) category: string;
  @Field() createdAt: Date;
  @Field(() => String, { nullable: true }) url?: string | null;
}

@ObjectType()
export class MyOrderView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field(() => String) status: string;
  @Field() orderDate: Date;
  @Field() merchantName: string;
  @Field(() => ID) merchantId: string;
  @Field(() => String, { nullable: true }) routeSummary?: string | null;
  @Field(() => String, { nullable: true }) bookingCode?: string | null;
  @Field(() => ID, { nullable: true }) bookingId?: string | null;
  @Field(() => MoneyScalar) totalAmount: number;
  @Field(() => MoneyScalar) paidAmount: number;
  @Field(() => MoneyScalar) remainingAmount: number;
  @Field(() => Date, { nullable: true }) dueDate?: Date | null;
  @Field(() => Int) overdueDays: number;
  @Field(() => [MyOrderStopView], { nullable: true }) stops?: MyOrderStopView[];
  @Field(() => [String], { nullable: true }) cargo?: string[];
  @Field(() => [MyTripProgress], { nullable: true }) trips?: MyTripProgress[];
  @Field(() => [PricingLine], { nullable: true }) pricingLines?: PricingLine[];
  @Field(() => [SharedAttachmentView], { nullable: true }) sharedAttachments?: SharedAttachmentView[];
  @Field(() => String, { nullable: true }) statementCode?: string | null;
}

@ObjectType()
export class MyOrderConnection extends ConnectionType(MyOrderView, 'MyOrderConnection') {}

@InputType()
export class MyOrderFilter {
  @Field(() => [String], { nullable: true }) status?: string[];
  @Field({ nullable: true }) keyword?: string;
  @Field({ nullable: true }) dateFrom?: string;
  @Field({ nullable: true }) dateTo?: string;
  @Field({ nullable: true }) unpaidOnly?: boolean;
}

@ObjectType()
export class MyDebtSummary {
  @Field(() => MoneyScalar) total: number;
  @Field(() => MoneyScalar) paid: number;
  @Field(() => MoneyScalar) remaining: number;
  @Field(() => MoneyScalar) overdue: number;
  @Field(() => Int) openOrders: number;
}

@ObjectType()
export class MyStatementLine {
  @Field() orderDate: Date;
  @Field() orderCode: string;
  @Field(() => ID) orderId: string;
  @Field(() => String, { nullable: true }) route?: string | null;
  @Field(() => MoneyScalar) total: number;
  @Field(() => MoneyScalar) paid: number;
  @Field(() => MoneyScalar) remaining: number;
  @Field(() => Date, { nullable: true }) dueDate?: Date | null;
  @Field(() => Int) overdueDays: number;
}

@ObjectType()
export class MyStatementView {
  @Field(() => ID) id: string;
  @Field() code: string;
  @Field() merchantName: string;
  @Field() periodFrom: Date;
  @Field() periodTo: Date;
  @Field(() => Date, { nullable: true }) sentAt?: Date | null;
  @Field(() => Int) orderCount: number;
  @Field(() => MoneyScalar) total: number;
  @Field(() => MoneyScalar) paid: number;
  @Field(() => MoneyScalar) remaining: number;
  @Field(() => String) status: string;
  @Field(() => String, { nullable: true }) pdfUrl?: string | null;
  @Field(() => [MyStatementLine], { nullable: true }) lines?: MyStatementLine[];
}
