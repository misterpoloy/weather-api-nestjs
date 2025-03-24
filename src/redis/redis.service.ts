import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: port,
    });
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    await this.client.set(key, value, 'EX', ttl);
  }
}
