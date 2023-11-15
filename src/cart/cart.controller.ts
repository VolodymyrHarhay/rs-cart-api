import { Controller, Get, Delete, Put, Body, Req, Post, UseGuards, HttpStatus } from '@nestjs/common';

import { BasicAuthGuard } from '../auth';
import { OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';

import { calculateCartTotal } from './models-rules';
import { CartService } from './services';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService
  ) { }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest) {
    try {
      const userId = getUserIdFromRequest(req);
      const cart = await this.cartService.findUserCart(userId);
      const cartItems = cart.items;
      cartItems.sort((x,y) => x.product.title.localeCompare(y.product.title))
      if (cart) {
        return cartItems;
          {
          // statusCode: HttpStatus.OK,
          // message: 'OK',
          // data: { cart, total: calculateCartTotal(cart) },
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cart not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Internal Server Error -  ${error.message}`,
      };
    }
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(@Req() req: AppRequest, @Body() body) {
    try {
      const userId = getUserIdFromRequest(req);
      const updatedCart = await this.cartService.updateByUserId(userId, body);
  
      if (updatedCart) {
        const total = calculateCartTotal(updatedCart);
        return {
          statusCode: HttpStatus.OK,
          message: 'OK',
          data: { cart: updatedCart, total },
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cart not found',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      };
    }
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Delete()
  clearUserCart(@Req() req: AppRequest) {
    const userId = getUserIdFromRequest(req);
    this.cartService.removeByUserId(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    }
  }


  @UseGuards(BasicAuthGuard)
  @Post('checkout')
  async checkout(@Req() req: AppRequest) {
    const userId = getUserIdFromRequest(req);
    return await this.cartService.checkout(userId);
  }
}
