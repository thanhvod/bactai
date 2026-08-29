import { BadRequestException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CatalogKind, UserRole } from '@prisma/client';
import { CATALOG_DEFAULTS } from '@bta/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AllowUnregistered, Ctx } from './auth.guard';
import type { AuthContext } from './auth.types';
import { CurrentUserInfo } from './auth.types';

@Resolver()
export class AuthResolver {
  constructor(private prisma: PrismaService) {}

  /** null = đã đăng nhập Google nhưng chưa đăng ký merchant → web hiện form đăng ký */
  @Query(() => CurrentUserInfo, { nullable: true })
  @AllowUnregistered()
  async me(@Ctx() ctx: AuthContext): Promise<CurrentUserInfo | null> {
    if (!ctx.user) return null;
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: ctx.user.id },
      include: { merchant: true },
    });
    return user as unknown as CurrentUserInfo;
  }

  /** Đăng ký merchant self-service (docs/06 A1): người đăng ký thành ADMIN */
  @Mutation(() => CurrentUserInfo)
  @AllowUnregistered()
  async registerMerchant(
    @Ctx() ctx: AuthContext,
    @Args('merchantName') merchantName: string,
    @Args('phone', { nullable: true }) phone?: string,
  ): Promise<CurrentUserInfo> {
    if (ctx.user) {
      throw new BadRequestException('Tài khoản đã thuộc một merchant');
    }
    if (!merchantName.trim()) {
      throw new BadRequestException('Tên nhà xe không được trống');
    }

    const user = await this.prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant.create({
        data: { name: merchantName.trim(), phone, email: ctx.email },
      });
      // Seed danh mục mặc định cho merchant mới (docs/07)
      for (const [kind, names] of Object.entries(CATALOG_DEFAULTS)) {
        await tx.catalogItem.createMany({
          data: ([...names] as string[]).map((name, i) => ({
            merchantId: merchant.id,
            kind: kind as CatalogKind,
            name,
            sortOrder: i,
          })),
        });
      }
      return tx.user.create({
        data: {
          merchantId: merchant.id,
          email: ctx.email,
          firebaseUid: ctx.firebaseUid,
          fullName: ctx.displayName ?? ctx.email,
          role: UserRole.ADMIN,
        },
        include: { merchant: true },
      });
    });
    return user as unknown as CurrentUserInfo;
  }
}
