import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { PostgresService } from '../../postgres.service';
import { User } from '../models';

@Injectable()
export class UsersService {
  private readonly users: Record<string, User>;
  
  constructor(
    private readonly postgresService: PostgresService,
  ) {}
  async findOne(username: string): Promise<User> {

    console.log({username});
    const query = 'SELECT * FROM users WHERE username = $1';
    const params = [username];

    try {
      const result = await this.postgresService.query(query, params);
      console.log({result});
      if (result && result.length > 0) {
        return result[0];
      }
      return null;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  async createOne(name: string, password: string): Promise<User> {
    console.log({name, password});
    const id = v4();
    const query = 'INSERT INTO users (id, username, password) VALUES ($1, $2, $3) RETURNING *';
    const params = [id, name, password];

    try {
      const result = await this.postgresService.query(query, params);
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Error creating user');
    }
  }

}
