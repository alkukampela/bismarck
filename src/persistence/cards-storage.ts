import { Card } from '../types/card';
import Redis from 'ioredis';

export type CardContainer = {
  card: Card;
  isPlayed: boolean;
};

export class CardStorage {
  private readonly KEY_PREFIX = 'cards:';

  private redis: Redis.Redis;

  private static _instance: CardStorage;

  private constructor() {
    this.redis = new Redis();
  }

  public static getInstance() {
    return this._instance || (this._instance = new this());
  }

  public store(identifier: string, cards: CardContainer[]): void {
    console.log(`saving with key ${identifier}`);
    this.redis.set(this.getKey(identifier), JSON.stringify(cards));
  }

  public async fetch(identifier: string): Promise<CardContainer[]> {
    console.log(`fetching with key ${identifier}`);
    const result = await this.redis.get(this.getKey(identifier));
    return JSON.parse(result);
  }

  private getKey(identifier: string) {
    return this.KEY_PREFIX + identifier;
  }
}
