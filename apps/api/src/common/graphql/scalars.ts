import { CustomScalar, Scalar } from '@nestjs/graphql';
import { GraphQLError, Kind, type ValueNode } from 'graphql';

/** Tiền VND: số nguyên an toàn (safe integer), serialize BigInt → number. Contract 07 §1 "Money fields: Int VND". */
@Scalar('Money', () => MoneyScalar)
export class MoneyScalar implements CustomScalar<number, number> {
  description = 'Số tiền VND (số nguyên, có thể > 2^31)';

  parseValue(value: unknown): number {
    const n = typeof value === 'string' ? Number(value) : (value as number);
    if (!Number.isSafeInteger(n)) throw new GraphQLError('Money phải là số nguyên VND');
    return n;
  }

  serialize(value: unknown): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'bigint') return Number(value);
    return Math.trunc(Number(value));
  }

  parseLiteral(ast: ValueNode): number {
    if (ast.kind === Kind.INT || ast.kind === Kind.STRING) return this.parseValue(ast.value);
    throw new GraphQLError('Money phải là số nguyên VND');
  }
}
