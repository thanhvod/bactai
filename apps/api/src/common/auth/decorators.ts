import { SetMetadata, createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Permission } from '@bta/shared';
import { currentPrincipal, type Principal } from '../context/request-context';

export const PUBLIC_KEY = 'bta:public';
export const AUTH_KIND_KEY = 'bta:authKind';
export const PERMISSIONS_KEY = 'bta:permissions';
export const NO_MERCHANT_KEY = 'bta:noMerchant';

export type AuthKind = 'USER' | 'DRIVER' | 'CUSTOMER' | 'ANY';

/** Không cần đăng nhập. */
export const Public = () => SetMetadata(PUBLIC_KEY, true);
/** Loại principal được phép (mặc định USER + phải có merchant). */
export const Auth = (...kinds: AuthKind[]) => SetMetadata(AUTH_KIND_KEY, kinds.length ? kinds : ['USER']);
/** USER không cần chọn merchant (me, createMerchant...). */
export const NoMerchant = () => SetMetadata(NO_MERCHANT_KEY, true);
/** Yêu cầu đủ tất cả permission. */
export const RequirePermission = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);

export const CurrentPrincipal = createParamDecorator((_: unknown, __: ExecutionContext): Principal | null => currentPrincipal());
