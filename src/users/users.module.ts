import { Module } from '@nestjs/common';
import { PostgresService } from '../postgres.service';
import { UsersService } from './services';

@Module({
  providers: [ UsersService, PostgresService ],
  exports: [ UsersService ],
})
export class UsersModule {}
