import { Module } from '@nestjs/common';
import { CatalogsResolver } from './catalogs.resolver';

@Module({ providers: [CatalogsResolver] })
export class CatalogsModule {}
