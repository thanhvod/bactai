import { ArgsType, Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import type { Type } from '@nestjs/common';

@ObjectType()
export class PageInfo {
  @Field() hasNextPage: boolean;
  @Field() hasPreviousPage: boolean;
  @Field(() => String, { nullable: true }) endCursor: string | null;
  @Field(() => String, { nullable: true }) startCursor: string | null;
}

@ArgsType()
export class PageArgs {
  @Field(() => Int, { nullable: true, defaultValue: 20 }) first?: number;
  @Field(() => String, { nullable: true }) after?: string | null;
}

@InputType()
export class DateRangeInput {
  @Field({ nullable: true }) from?: string;
  @Field({ nullable: true }) to?: string;
}

export interface Connection<T> {
  nodes: T[];
  totalCount: number;
  pageInfo: PageInfo;
}

/** Tạo type Connection cho một node type: { nodes, totalCount, pageInfo }. */
export function ConnectionType<T>(classRef: Type<T>, name?: string) {
  @ObjectType(name ?? `${classRef.name}Connection`, { isAbstract: false })
  class ConnectionClass {
    @Field(() => [classRef]) nodes: T[];
    @Field(() => Int) totalCount: number;
    @Field(() => PageInfo) pageInfo: PageInfo;
  }
  return ConnectionClass as Type<Connection<T>>;
}

/** Cursor = base64("o:<offset>") — đơn giản, hỗ trợ sort whitelist bất kỳ. */
export function decodeCursor(cursor?: string | null): number {
  if (!cursor) return 0;
  try {
    const s = Buffer.from(cursor, 'base64url').toString('utf8');
    const n = Number(s.replace(/^o:/, ''));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function encodeCursor(offset: number): string {
  return Buffer.from(`o:${offset}`).toString('base64url');
}

export function pageParams(args: { first?: number | null; after?: string | null }, max = 200) {
  const take = Math.min(Math.max(args.first ?? 20, 1), max);
  const skip = decodeCursor(args.after);
  return { take, skip };
}

export function toConnection<T>(nodes: T[], totalCount: number, skip: number, take: number): Connection<T> {
  const end = skip + nodes.length;
  return {
    nodes,
    totalCount,
    pageInfo: {
      hasNextPage: end < totalCount,
      hasPreviousPage: skip > 0,
      endCursor: nodes.length ? encodeCursor(end) : null,
      startCursor: skip > 0 ? encodeCursor(Math.max(skip - take, 0)) : null,
    },
  };
}

/** Chạy findMany + count song song và trả Connection. */
export async function paginate<T>(
  delegate: { findMany: (args: any) => Promise<T[]>; count: (args: any) => Promise<number> },
  args: { where?: any; orderBy?: any; include?: any; select?: any },
  page: { first?: number | null; after?: string | null },
): Promise<Connection<T>> {
  const { take, skip } = pageParams(page);
  const [nodes, total] = await Promise.all([
    delegate.findMany({ ...args, take, skip }),
    delegate.count({ where: args.where }),
  ]);
  return toConnection(nodes, total, skip, take);
}
