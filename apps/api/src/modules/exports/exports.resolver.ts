import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ExportsService } from './exports.service';
import { ExportFileInput, ExportedFile } from './exports.types';

@Resolver()
export class ExportsResolver {
  constructor(private readonly svc: ExportsService) {}

  /** Xuất Excel — quyền kiểm tra theo template trong service. */
  @Mutation(() => ExportedFile)
  exportFile(@Args('input') input: ExportFileInput) {
    return this.svc.export(input);
  }
}
