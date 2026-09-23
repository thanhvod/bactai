import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { requestContext } from '../context/request-context';
import { PrincipalResolver } from './principal.resolver';

/** Dựng RequestStore cho mọi request (REST + GraphQL) và chạy phần còn lại trong AsyncLocalStorage. */
@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(private readonly resolver: PrincipalResolver) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();
    res.setHeader('x-request-id', requestId);
    let resolved: { principal: any; merchantId: string | null } = { principal: null, merchantId: null };
    try {
      resolved = await this.resolver.resolve(req.headers.authorization, req.headers['x-merchant-id'] as string | undefined);
    } catch (e) {
      // token lỗi → coi như anonymous; guard sẽ chặn
      resolved = { principal: null, merchantId: null };
    }
    const store = {
      requestId,
      principal: resolved.principal,
      merchantId: resolved.merchantId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
    (req as any).bta = store;
    requestContext.run(store, () => next());
  }
}
