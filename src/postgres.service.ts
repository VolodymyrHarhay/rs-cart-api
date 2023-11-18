/* eslint-disable @typescript-eslint/no-unused-vars */
// postgres.service.ts

import { Injectable, Scope } from '@nestjs/common';
import { Client } from 'pg';

@Injectable({ scope: Scope.DEFAULT })
export class PostgresService {
  private readonly client: Client;

  constructor() {
    this.client = new Client({
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      user: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      port: +process.env.PG_PORT,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 5000
    });
  }

  async connect(): Promise<void> {
    console.log('Connecting to the database');
    await this.client.connect();
    console.log('Connected to the database');
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }

  async onApplicationBootstrap() {
    await this.client.connect();
    console.log('Connected to PostgreSQL database');
  }

  async onApplicationShutdown() {
    await this.client.end();
    console.log('Disconnected from PostgreSQL database');
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    console.log('query', {sql, params});
    try {
      const result = await this.client.query(sql, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async beginTransaction(): Promise<void> {
    try {
      await this.query('BEGIN');
    } catch (error) {
      throw error;
    }
  }

  async commitTransaction(): Promise<void> {
    try {
      await this.query('COMMIT');
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    }
  }

  async rollbackTransaction(): Promise<void> {
    try {
      await this.query('ROLLBACK');
    } catch (error) {
      throw error;
    }
  }
}
