import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { OrderStatus } from '@bta/shared';
import { RequirePermission } from '../../common/auth/decorators';
import { PageArgs } from '../../common/graphql/pagination';
import { OrdersService } from './orders.service';
import {
  CargoLineInput,
  CreateOrderInput,
  OrderAddonInput,
  OrderConnection,
  OrderFilter,
  OrderPayload,
  OrderPricingInput,
  OrderStopInput,
  OrderStopView,
  OrderTotalsView,
  OrderView,
  UpdateOrderInput,
} from './orders.types';

@Resolver()
export class OrdersResolver {
  constructor(private readonly svc: OrdersService) {}

  @Query(() => OrderConnection)
  @RequirePermission('order.view')
  orders(@Args('filter', { nullable: true }) filter: OrderFilter, @Args() page: PageArgs, @Args('sort', { nullable: true }) sort?: string) {
    return this.svc.list(filter, page, sort);
  }

  @Query(() => OrderTotalsView)
  @RequirePermission('order.view')
  orderTotals(@Args('filter', { nullable: true }) filter: OrderFilter) {
    return this.svc.totals(filter);
  }

  @Query(() => OrderView)
  @RequirePermission('order.view')
  order(@Args('id', { type: () => ID }) id: string) {
    return this.svc.get(id);
  }

  @Query(() => OrderStopView)
  @RequirePermission('order.view')
  orderStop(@Args('id', { type: () => ID }) id: string) {
    return this.svc.orderStop(id);
  }

  @Mutation(() => OrderPayload)
  @RequirePermission('order.create')
  createOrder(@Args('input') input: CreateOrderInput) {
    return this.svc.create(input);
  }

  @Mutation(() => OrderView)
  @RequirePermission('order.update')
  updateOrder(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateOrderInput, @Args('reason', { nullable: true }) reason?: string) {
    return this.svc.update(id, input, reason);
  }

  /** Drawer WM-ORD-06: giá cước + add-on + hạn thanh toán. Quyền nhạy cảm kiểm tra trong service. */
  @Mutation(() => OrderView)
  @RequirePermission('order.view')
  updateOrderPricing(@Args('id', { type: () => ID }) id: string, @Args('input') input: OrderPricingInput) {
    return this.svc.updatePricing(id, input);
  }

  @Mutation(() => OrderView)
  @RequirePermission('order.update')
  updateOrderStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status') status: string,
    @Args('reason', { nullable: true }) reason?: string,
    @Args('note', { nullable: true }) note?: string,
  ) {
    return this.svc.updateStatus(id, status as OrderStatus, reason, note);
  }

  @Mutation(() => OrderView)
  cancelOrder(@Args('id', { type: () => ID }) id: string, @Args('reason') reason: string) {
    return this.svc.cancel(id, reason);
  }

  @Mutation(() => OrderView)
  @RequirePermission('order.update')
  createOrderStop(@Args('orderId', { type: () => ID }) orderId: string, @Args('input') input: OrderStopInput) {
    return this.svc.createStop(orderId, input);
  }

  @Mutation(() => OrderStopView)
  @RequirePermission('order.update')
  updateOrderStop(@Args('id', { type: () => ID }) id: string, @Args('input') input: OrderStopInput, @Args('reason', { nullable: true }) reason?: string) {
    return this.svc.updateStop(id, input, reason);
  }

  @Mutation(() => OrderView)
  @RequirePermission('order.update')
  reorderOrderStops(@Args('orderId', { type: () => ID }) orderId: string, @Args('stopIds', { type: () => [ID] }) stopIds: string[]) {
    return this.svc.reorderStops(orderId, stopIds);
  }

  @Mutation(() => OrderView)
  @RequirePermission('order.update')
  removeOrderStop(@Args('id', { type: () => ID }) id: string, @Args('reason', { nullable: true }) reason?: string) {
    return this.svc.removeStop(id, reason);
  }

  @Mutation(() => OrderView)
  @RequirePermission('order.update')
  upsertCargoLine(@Args('orderId', { type: () => ID }) orderId: string, @Args('input') input: CargoLineInput) {
    return this.svc.upsertCargo(orderId, input);
  }

  @Mutation(() => OrderView)
  @RequirePermission('order.update')
  deleteCargoLine(@Args('id', { type: () => ID }) id: string) {
    return this.svc.deleteCargo(id);
  }

  @Mutation(() => OrderView)
  @RequirePermission('order.update')
  upsertOrderAddon(@Args('orderId', { type: () => ID }) orderId: string, @Args('input') input: OrderAddonInput, @Args('reason', { nullable: true }) reason?: string) {
    return this.svc.upsertAddon(orderId, input, reason);
  }

  @Mutation(() => OrderView)
  @RequirePermission('order.update')
  deleteOrderAddon(@Args('id', { type: () => ID }) id: string, @Args('reason', { nullable: true }) reason?: string) {
    return this.svc.deleteAddon(id, reason);
  }
}
