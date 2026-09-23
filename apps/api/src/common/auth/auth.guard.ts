import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Permission } from '@bta/shared';
import { currentStore } from '../context/request-context';
import { forbidden, merchantRequired, unauthenticated } from '../errors/app-error';
import { AUTH_KIND_KEY, NO_MERCHANT_KEY, PERMISSIONS_KEY, PUBLIC_KEY, type AuthKind } from './decorators';

/** Guard toàn cục: đọc metadata @Public/@Auth/@NoMerchant/@RequirePermission, kiểm tra principal trong AsyncLocalStorage. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, targets)) return true;

    const store = currentStore();
    const principal = store?.principal;
    if (!principal) throw unauthenticated();

    const kinds = this.reflector.getAllAndOverride<AuthKind[]>(AUTH_KIND_KEY, targets) ?? ['USER'];
    if (!kinds.includes('ANY') && !kinds.includes(principal.type)) throw forbidden('Loại tài khoản không được phép');

    if (principal.type === 'USER') {
      const noMerchant = this.reflector.getAllAndOverride<boolean>(NO_MERCHANT_KEY, targets);
      if (!noMerchant && !store?.merchantId) throw merchantRequired();
      const required = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, targets) ?? [];
      const missing = required.filter((p) => !principal.permissions.includes(p));
      if (missing.length) throw forbidden(`Thiếu quyền: ${missing.join(', ')}`);
    }
    return true;
  }
}
