import { Args, Field, InputType, Mutation, Resolver } from '@nestjs/graphql';
import { z } from 'zod';
import { Auth, NoMerchant } from '../../common/auth/decorators';
import { currentPrincipal } from '../../common/context/request-context';
import { forbidden } from '../../common/errors/app-error';
import { PrismaService } from '../../common/prisma/prisma.service';
import { parse } from '../../common/validation/zod';

@InputType()
export class RegisterPushTokenInput {
  @Field() token: string;
  /** ANDROID | IOS | WEB */
  @Field() platform: string;
  @Field({ nullable: true }) deviceInfo?: string;
}

const schema = z.object({
  token: z.string().trim().min(20).max(4096),
  platform: z.enum(['ANDROID', 'IOS', 'WEB']),
  deviceInfo: z.string().max(300).optional().nullable(),
});

/**
 * D-017: app gọi sau khi đăng nhập / khi FCM đổi token; gọi unregister trước khi đăng xuất.
 * Token là duy nhất theo máy — máy đổi tài khoản thì token chuyển sang tài khoản mới.
 */
@Resolver()
@Auth('USER', 'DRIVER')
@NoMerchant()
export class DevicesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Mutation(() => Boolean)
  async registerPushToken(@Args('input') input: RegisterPushTokenInput) {
    const d = parse(schema, input);
    const p = currentPrincipal();
    if (!p || p.type === 'CUSTOMER') throw forbidden();
    const owner =
      p.type === 'DRIVER'
        ? { app: 'DRIVER' as const, driverId: p.driverId, userAccountId: null, merchantId: p.merchantId }
        : { app: 'MERCHANT' as const, driverId: null, userAccountId: p.accountId, merchantId: null };
    await this.prisma.raw.deviceToken.upsert({
      where: { token: d.token },
      create: { token: d.token, platform: d.platform, deviceInfo: d.deviceInfo ?? null, ...owner },
      update: { platform: d.platform, deviceInfo: d.deviceInfo ?? null, lastSeenAt: new Date(), ...owner },
    });
    return true;
  }

  @Mutation(() => Boolean)
  async unregisterPushToken(@Args('token') token: string) {
    const p = currentPrincipal();
    if (!p || p.type === 'CUSTOMER') throw forbidden();
    const where = p.type === 'DRIVER' ? { token, driverId: p.driverId } : { token, userAccountId: p.accountId };
    await this.prisma.raw.deviceToken.deleteMany({ where });
    return true;
  }
}
