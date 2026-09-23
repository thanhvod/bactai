import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { DocumentsService } from './documents.service';
import { RenderDocumentInput, RenderedDocument } from './documents.types';

@Resolver()
export class DocumentsResolver {
  constructor(private readonly svc: DocumentsService) {}

  /** Mẫu in / chia sẻ nhanh (WM-ORD-09, WM-SHELL-05). Quyền kiểm tra theo template trong service. */
  @Mutation(() => RenderedDocument)
  renderDocument(@Args('input') input: RenderDocumentInput) {
    return this.svc.render(input);
  }
}
