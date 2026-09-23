import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequirePermission } from '../../common/auth/decorators';
import { PageArgs } from '../../common/graphql/pagination';
import { DebtStatementsService } from './debt-statements.service';
import { CreateDebtStatementInput, DebtStatementConnection, DebtStatementFilter, DebtStatementView } from './debt-statements.types';

@Resolver()
export class DebtStatementsResolver {
  constructor(private readonly svc: DebtStatementsService) {}

  @Query(() => DebtStatementConnection)
  @RequirePermission('debt.view')
  debtStatements(@Args('filter', { nullable: true }) filter: DebtStatementFilter, @Args() page: PageArgs) {
    return this.svc.list(filter, page);
  }

  @Query(() => DebtStatementView)
  @RequirePermission('debt.view')
  debtStatement(@Args('id', { type: () => ID }) id: string) {
    return this.svc.get(id);
  }

  @Mutation(() => DebtStatementView)
  @RequirePermission('debtStatement.create')
  createDebtStatement(@Args('input') input: CreateDebtStatementInput) {
    return this.svc.create(input);
  }

  @Mutation(() => DebtStatementView)
  @RequirePermission('debtStatement.create')
  refreshDebtStatement(@Args('id', { type: () => ID }) id: string) {
    return this.svc.refresh(id);
  }

  @Mutation(() => DebtStatementView)
  @RequirePermission('debtStatement.finalize')
  finalizeDebtStatement(@Args('id', { type: () => ID }) id: string) {
    return this.svc.finalize(id);
  }

  @Mutation(() => DebtStatementView)
  @RequirePermission('debtStatement.finalize')
  markDebtStatementSent(@Args('id', { type: () => ID }) id: string, @Args('shareWithCustomer', { nullable: true }) share?: boolean) {
    return this.svc.markSent(id, share);
  }

  @Mutation(() => DebtStatementView)
  cancelDebtStatement(@Args('id', { type: () => ID }) id: string, @Args('reason', { nullable: true }) reason: string) {
    return this.svc.cancel(id, reason);
  }
}
