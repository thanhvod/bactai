import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { AttachmentCategory, EntityType } from '@bta/shared';
import { Auth } from '../../common/auth/decorators';
import { GqlEnums } from '../../common/graphql/enums';
import { AttachmentsService } from './attachments.service';
import { AttachmentView } from './attachments.types';

@Resolver()
export class AttachmentsResolver {
  constructor(private readonly svc: AttachmentsService) {}

  @Query(() => [AttachmentView])
  @Auth('USER', 'DRIVER')
  attachments(
    @Args('entityType', { type: () => GqlEnums.EntityType }) entityType: EntityType,
    @Args('entityId', { type: () => ID }) entityId: string,
    @Args('category', { type: () => GqlEnums.AttachmentCategory, nullable: true }) category?: AttachmentCategory,
  ) {
    return this.svc.list(entityType, entityId, category);
  }

  @Query(() => [AttachmentView])
  orderAttachments(@Args('orderId', { type: () => ID }) orderId: string) {
    return this.svc.listForOrder(orderId);
  }

  @Query(() => AttachmentView)
  @Auth('USER', 'DRIVER')
  attachment(@Args('id', { type: () => ID }) id: string) {
    return this.svc.get(id);
  }

  @Mutation(() => AttachmentView)
  deleteAttachment(@Args('id', { type: () => ID }) id: string, @Args('reason') reason: string) {
    return this.svc.delete(id, reason);
  }

  @Mutation(() => AttachmentView)
  setAttachmentShared(@Args('id', { type: () => ID }) id: string, @Args('shared') shared: boolean) {
    return this.svc.setShared(id, shared);
  }
}
