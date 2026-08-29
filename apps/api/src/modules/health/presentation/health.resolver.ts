import { Query, Resolver } from '@nestjs/graphql';
import { Public } from '../../auth/auth.guard';

@Resolver()
export class HealthResolver {
  @Public()
  @Query(() => String, { description: 'Health check' })
  health(): string {
    return 'ok';
  }
}
