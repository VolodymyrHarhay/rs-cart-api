import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { Cart, CartItem, Product } from '../models';
import { PostgresService } from '../../postgres.service';
import { DynamoDB } from 'aws-sdk';
import AWS from 'aws-sdk';

@Injectable()
export class CartService {
  private readonly docClient: DynamoDB.DocumentClient;

  constructor(private readonly postgresService: PostgresService) {
    this.docClient = new DynamoDB.DocumentClient({ region: 'eu-north-1' });
  }


  async getProduct(productId: string): Promise<Product> {
    AWS.config.update({
      region: 'eu-north-1'
    });
    
    const paramsProducts = {
      TableName: "Products",
      Key: {
        id: productId,
      },
    };
    const productData = await this.docClient.get(paramsProducts).promise();
    const product = productData?.Item as Product;

    // const products = [
    //   {
    //     "description": "Description for Book 1",
    //     "id": "bc84a80e-31ce-4ca6-9816-73272b87ca42",
    //     "price": 1000,
    //     "title": "Book 1"
    //   },
    //   {
    //     "description": "Description for Book 2",
    //     "id": "f655e062-cdd4-40a8-ad66-e442115b6dbb",
    //     "price": 1500,
    //     "title": "Book 2"
    //   },
    //   {
    //     "description": "Description for Book 8",
    //     "id": "c9a16662-0c1a-40c7-b478-02b36c506b85",
    //     "price": 4000,
    //     "title": "Book 8"
    //   },
    // ];

    // const product = products.find(x => x.id === productId);

    if (product) {
      return product;
    }
    else {
      return null;
    }
  }

  async findCartItems(cartId: string): Promise<CartItem[]> {
    const query = 'SELECT * FROM cart_items WHERE cart_id = $1';
    const params = [cartId];

    try {
      const result = await this.postgresService.query(query, params);

      if (result && result.length > 0) {
        const cartItems: CartItem[] = await Promise.all(
          result.map(async row => {
            const product = await this.getProduct(row.product_id);

            return {
              product,
              count: row.count,
            };
          })
        );

        return cartItems;
      }
    } catch (error) {
      console.log('error = ', error);
      throw error;
    }

    return null;
  }

  private async getCartIdByUserId(userId: string): Promise<string | null> {
    const query = 'SELECT id FROM carts WHERE user_id = $1 LIMIT 1';
    const params = [userId];

    try {
      const result = await this.postgresService.query(query, params);

      if (result && result.length > 0) {
        return result[0].id;
      }
    } catch (error) {
      console.log('can not find cart id');
      throw error;
    }

    return null;
  }

  async findUserCart(userId: string): Promise<Cart> {
    try {
      const cartId = await this.getCartIdByUserId(userId);

      if (!cartId) {
        console.log('Cart not found for user:', userId);
        return null;
      }

      const cartItems = await this.findCartItems(cartId);

      const userCart: Cart = {
        id: cartId,
        items: cartItems,
      };

      return userCart;
    } catch (error) {
      console.log("ERROR", error)
      throw error;
    }
  }

  async updateByUserId(userId: string, cartItem: CartItem): Promise<Cart> {
    try {
      await this.postgresService.beginTransaction();

      const cartId = await this.getCartIdByUserId(userId);
      if (!cartId) {
        throw new Error('Cart not found for the user ID provided.');
      }

      if (cartItem.count === 0) {
        const deleteQuery = 'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2';
        await this.postgresService.query(deleteQuery, [cartId, cartItem.product.id]);
      } else {
        const existingCartItem = await this.postgresService.query(
          'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2 FOR UPDATE',
          [cartId, cartItem.product.id]
        );
    
        if (existingCartItem && existingCartItem.length > 0) {
          const updateQuery = 'UPDATE cart_items SET count = $1 WHERE cart_id = $2 AND product_id = $3';
          await this.postgresService.query(updateQuery, [cartItem.count, cartId, cartItem.product.id]);
        } else {
          const insertQuery = 'INSERT INTO cart_items (id, cart_id, product_id, count) VALUES ($1, $2, $3, $4)';
          const cartItemId = v4();
          const insertParams = [cartItemId, cartId, cartItem.product.id, cartItem.count];
          await this.postgresService.query(insertQuery, insertParams);
        }
      }
  
      const updateCartQuery = 'UPDATE carts SET updated_at = NOW() WHERE id = $1 RETURNING id';
      await this.postgresService.query(updateCartQuery, [cartId]);
  
      await this.postgresService.commitTransaction();
      return await this.findUserCart(userId);
    } catch (error) {
      await this.postgresService.rollbackTransaction();
      console.error('Error updating cart:', error);
      throw new Error(`Error updating cart: ${error.message}`);
    }
  }
}
