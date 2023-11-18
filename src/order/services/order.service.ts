import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { PostgresService } from '../../postgres.service';
import { Order, CreateOrderDto } from '../models';

@Injectable()
export class OrderService {
  constructor(
    private readonly postgresService: PostgresService,
  ) {}

  async findById(orderId: string): Promise<Order> {
    const query = 'SELECT * FROM orders WHERE id = $1';
    const params = [orderId];
    const result = await this.postgresService.query(query, params);

    if (result && result.length > 0) {
      return result[0];
    }

    return null;
  }


  async create(data: CreateOrderDto): Promise<any> {
    try {
      const query = `INSERT INTO orders (id, user_id, cart_id, payment, delivery, comments, status, total) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;

      const payment = {
        type: 'credit_card',
        creditCard: {
          cardNumber: '1234 5678 9101 1121',
          expiry: '12/24',
          cvv: '123'
        }
      };
      
      const delivery = {
        type: 'home_delivery',
        address: {
          street: '123 Main St',
          city: 'Example City',
          postalCode: '12345',
          country: 'Example Country'
        }
      };
      
      // Serialize objects to JSON strings
      const paymentJSON = JSON.stringify(payment);
      const deliveryJSON = JSON.stringify(delivery);

      const params = [
        v4(),
        data.userId,
        data.cartId,
        paymentJSON,
        deliveryJSON,
        "IT WORKS",
        "OPEN",
        data.total,
      ];

      const createdOrder = await this.postgresService.query(query, params);
      console.log({createdOrder});

      if (!createdOrder || createdOrder.length === 0) {
        throw new Error('Failed to create order');
      }

      return createdOrder[0];
    } catch (error) {
      throw new Error('Failed to create order');
    }
  }

  async update(orderId: string, data: any): Promise<Order> {
      try {
      const order = await this.findById(orderId);

      if (!order) {
        throw new Error('Order does not exist.');
      }

      const updatedOrder = {
        ...order,
        ...data,
      };

      const query = `
        UPDATE orders
        SET user_id = $1,
            cart_id = $2,
            payment = $3,
            delivery = $4,
            comments = $5,
            status = $6,
            total = $7
        WHERE id = $8
        RETURNING *
      `;
      const params = [
        updatedOrder.userId,
        updatedOrder.cartId,
        updatedOrder.payment,
        updatedOrder.delivery,
        updatedOrder.comments,
        updatedOrder.status,
        updatedOrder.total,
        updatedOrder.id,
      ];
      const result = await this.postgresService.query(query, params);

      if (result && result.length > 0) {
        return result[0];
      } else {
        throw new Error('Error updating order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error('Error updating order');
    }
  }
}
