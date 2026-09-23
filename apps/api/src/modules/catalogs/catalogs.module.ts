import { Global, Module } from '@nestjs/common';
import { CatalogsResolver } from './catalogs.resolver';
import { CatalogsService } from './catalogs.service';

@Global()
@Module({ providers: [CatalogsService, CatalogsResolver], exports: [CatalogsService] })
export class CatalogsModule {}
