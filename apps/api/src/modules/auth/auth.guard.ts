import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseService } from './firebase.service';
import type { AuthContext } from './auth.types';

export const IS_PUBLIC = 'isPublic';
/** Cho phép gọi không cần token (health...) */
export const Public = () => SetMetadata(IS_PUBLIC, true);

export const ALLOW_UNREGISTERED = 'allowUnregistered';
/** Cho phép token hợp lệ nhưng chưa có user record (me, registerMerchant) */
export const AllowUnregistered = () => SetMetadata(ALLOW_UNREGISTERED, true);

function getRequest(context: ExecutionContext) {
  const gqlCtx = GqlExecutionContext.create(context);
  return gqlCtx.getContext().req ?? context.switchToHttp().getRequest();
}

/** Lấy AuthContext trong resolver: @Ctx() ctx: AuthContext */
export const Ctx = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthContext =>
    getRequest(context).authContext,
);

/** merchantId tiện dụng — nguồn duy nhất là JWT, không tin client (D-001) */
export const MerchantId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const auth: AuthContext = getRequest(context).authContext;
    if (!auth?.user) throw new UnauthorizedException('Chưa đăng ký merchant');
    return auth.user.merchantId;
  },
);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private firebase: FirebaseService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = getRequest(context);
    const header: string | undefined = req.headers?.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Thiếu token');
    }
    const decoded = await this.firebase.verifyIdToken(header.slice(7));
    const email = decoded.email;
    if (!email) throw new UnauthorizedException('Token không có email');

    const user = await this.prisma.user.findFirst({
      where: {
        isActive: true,
        OR: [{ firebaseUid: decoded.uid }, { email }],
      },
      select: {
        id: true,
        merchantId: true,
        role: true,
        email: true,
        fullName: true,
        firebaseUid: true,
      },
    });

    // Gắn firebaseUid lần đầu (user tạo sẵn bằng email, đăng nhập Google lần đầu)
    if (user && !user.firebaseUid) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid: decoded.uid },
      });
    }

    const authContext: AuthContext = {
      firebaseUid: decoded.uid,
      email,
      displayName: decoded.name,
      user,
    };
    req.authContext = authContext;

    const allowUnregistered = this.reflector.getAllAndOverride<boolean>(
      ALLOW_UNREGISTERED,
      [context.getHandler(), context.getClass()],
    );
    if (!user && !allowUnregistered) {
      throw new UnauthorizedException('Tài khoản chưa thuộc merchant nào');
    }
    return true;
  }
}
