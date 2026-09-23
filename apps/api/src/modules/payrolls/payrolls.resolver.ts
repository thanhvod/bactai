import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequirePermission } from '../../common/auth/decorators';
import { PageArgs } from '../../common/graphql/pagination';
import { PayrollsService } from './payrolls.service';
import { GeneratePayrollInput, PayrollConnection, PayrollFilter, PayrollItemInput, PayrollLineView, PayrollPreviewView, PayrollView } from './payrolls.types';

@Resolver()
export class PayrollsResolver {
  constructor(private readonly svc: PayrollsService) {}

  @Query(() => PayrollConnection)
  @RequirePermission('payroll.view')
  payrolls(@Args('filter', { nullable: true }) filter: PayrollFilter, @Args() page: PageArgs) {
    return this.svc.list(filter, page);
  }

  @Query(() => PayrollView)
  @RequirePermission('payroll.view')
  payroll(@Args('id', { type: () => ID }) id: string) {
    return this.svc.get(id);
  }

  @Query(() => PayrollLineView)
  @RequirePermission('payroll.view')
  payrollLine(@Args('id', { type: () => ID }) id: string) {
    return this.svc.line(id);
  }

  @Query(() => [PayrollLineView])
  @RequirePermission('payroll.view')
  driverPayrollLines(@Args('driverId', { type: () => ID }) driverId: string) {
    return this.svc.driverLines(driverId);
  }

  @Query(() => PayrollPreviewView)
  @RequirePermission('payroll.generate')
  payrollPreview(@Args('input') input: GeneratePayrollInput) {
    return this.svc.preview(input);
  }

  @Mutation(() => PayrollView)
  @RequirePermission('payroll.generate')
  generatePayroll(@Args('input') input: GeneratePayrollInput) {
    return this.svc.generate(input);
  }

  /** Thêm giảm trừ/điều chỉnh/thưởng tay — quyền payroll.line.update kiểm tra trong service (giảm trừ cần lý do). */
  @Mutation(() => PayrollLineView)
  addPayrollItem(@Args('input') input: PayrollItemInput) {
    return this.svc.addItem(input);
  }

  @Mutation(() => PayrollLineView)
  removePayrollItem(@Args('id', { type: () => ID }) id: string, @Args('reason') reason: string) {
    return this.svc.removeItem(id, reason);
  }

  @Mutation(() => PayrollView)
  @RequirePermission('payroll.submit')
  submitPayroll(@Args('id', { type: () => ID }) id: string) {
    return this.svc.submit(id);
  }

  @Mutation(() => PayrollView)
  @RequirePermission('payroll.approve')
  approvePayroll(@Args('id', { type: () => ID }) id: string, @Args('note', { nullable: true }) note?: string) {
    return this.svc.approve(id, note);
  }

  @Mutation(() => PayrollView)
  returnPayroll(@Args('id', { type: () => ID }) id: string, @Args('reason', { nullable: true }) reason: string) {
    return this.svc.returnPayroll(id, reason);
  }

  @Mutation(() => PayrollView)
  @RequirePermission('payroll.markPaid')
  markPayrollPaid(@Args('id', { type: () => ID }) id: string, @Args('paidAt', { nullable: true }) paidAt?: Date) {
    return this.svc.markPaid(id, paidAt);
  }

  @Mutation(() => PayrollView)
  cancelPayroll(@Args('id', { type: () => ID }) id: string, @Args('reason') reason: string) {
    return this.svc.cancel(id, reason);
  }
}
