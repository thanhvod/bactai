import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { DocType } from '@bta/shared';
import { RequirePermission } from '../../common/auth/decorators';
import { GqlEnums } from '../../common/graphql/enums';
import { MerchantsService } from './merchants.service';
import {
  MerchantProfile,
  MerchantProfileInput,
  MerchantSettingsInput,
  MerchantSettingsView,
  NumberFormatInput,
  NumberSequenceView,
} from './merchants.types';

@Resolver()
export class MerchantsResolver {
  constructor(private readonly svc: MerchantsService) {}

  @Query(() => MerchantProfile)
  merchantProfile() {
    return this.svc.profile();
  }

  @Mutation(() => MerchantProfile)
  @RequirePermission('settings.manage')
  updateMerchantProfile(@Args('input') input: MerchantProfileInput) {
    return this.svc.updateProfile(input);
  }

  @Query(() => MerchantSettingsView)
  merchantSettings() {
    return this.svc.settings();
  }

  @Mutation(() => MerchantSettingsView)
  @RequirePermission('settings.manage')
  updateMerchantSettings(@Args('input') input: MerchantSettingsInput) {
    return this.svc.updateSettings(input);
  }

  @Query(() => [NumberSequenceView])
  numberSequences() {
    return this.svc.numberSequences();
  }

  @Mutation(() => NumberSequenceView)
  @RequirePermission('settings.manage')
  updateNumberSequenceFormat(@Args('docType', { type: () => GqlEnums.DocType }) docType: DocType, @Args('input') input: NumberFormatInput) {
    return this.svc.updateNumberFormat(docType, input);
  }
}
