import { Module } from '@nestjs/common';

import { OrderModule } from '../order/order.module';

import { CartController } from './cart.controller';
import { CartService } from './services';
import { PostgresService } from '../postgres.service';


@Module({
  imports: [ OrderModule ],
  providers: [ CartService, PostgresService ],
  controllers: [ CartController ]
})
export class CartModule {}
