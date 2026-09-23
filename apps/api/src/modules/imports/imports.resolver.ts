import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ImportsService } from './imports.service';
import { ImportJobView, ImportPreviewFilter, ImportTemplateFile, StartImportInput } from './imports.types';

/** Import Excel (IMP-001) — quyền imports.run + quyền sửa entity kiểm tra trong service. */
@Resolver()
export class ImportsResolver {
  constructor(private readonly svc: ImportsService) {}

  @Mutation(() => ImportJobView)
  startImport(@Args('input') input: StartImportInput) {
    return this.svc.start(input);
  }

  @Query(() => ImportJobView)
  importPreview(@Args('id', { type: () => ID }) id: string, @Args('filter', { nullable: true }) filter?: ImportPreviewFilter) {
    return this.svc.preview(id, filter ?? {});
  }

  @Mutation(() => ImportJobView)
  commitImport(@Args('id', { type: () => ID }) id: string, @Args('skipErrors', { nullable: true, defaultValue: false }) skipErrors: boolean) {
    return this.svc.commit(id, skipErrors);
  }

  @Mutation(() => ImportJobView)
  cancelImport(@Args('id', { type: () => ID }) id: string) {
    return this.svc.cancel(id);
  }

  @Query(() => ImportTemplateFile)
  importTemplate(@Args('entityType') entityType: string) {
    return this.svc.template(entityType);
  }
}
