import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { PostgresService } from './postgres.service';

import { CartModule } from './cart/cart.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    AuthModule,
    CartModule,
    OrderModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [PostgresService],
})
export class AppModule {}
