// postgres.service.ts
import { Injectable, Scope } from '@nestjs/common';
import { Client } from 'pg';

@Injectable({ scope: Scope.DEFAULT })
export class PostgresService {
  private readonly client: Client;

  constructor() {
    this.client = new Client({
      // host: process.env.PG_HOST,
      // database: process.env.PG_DATABASE,
      // user: process.env.PG_USERNAME,
      // password: process.env.PG_PASSWORD,
      // port: +process.env.PG_PORT,
      host: "db-book-instance.cq5k2jq6t1ai.eu-north-1.rds.amazonaws.com",
      database: "bookDbRDS",
      user: "postgres",
      password: "cAK6x2Aewm4dbtyuvq7c",
      port: 5432,
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
}
