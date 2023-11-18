import { Module } from '@nestjs/common';
import { OrderService } from './services';
import { PostgresService } from '../postgres.service';

@Module({
  providers: [ OrderService, PostgresService ],
  exports: [ OrderService ]
})
export class OrderModule {}
