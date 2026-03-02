import { Trick } from '../types/trick';
import Redis from 'ioredis';
import pino from 'pino';

const logger = pino();

type StorageType = Trick;

const ONE_DAY_EXPIRATION = 86400;

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const store = (key: string, subject: StorageType): void => {
  redis.set(key, JSON.stringify(subject), 'EX', ONE_DAY_EXPIRATION);
};

const fetch = async (key: string): Promise<string> => {
  let value: string | null;
  try {
    value = await redis.get(key);
  } catch (error) {
    logger.error(`Error fetching key ${key} from Redis: ${error}`);
    throw new Error(`Error fetching key ${key} from storage`);
  }
  if (value === null) {
    throw new Error(`Key not found: ${key}`);
  }
  return value;
};

const del = (key: string): void => {
  redis.del(key);
};

const getTrickKey = (identifier: string): string => `trick:${identifier}`;

export const storeTrick = (trick: Trick, identifier: string): void => {
  store(getTrickKey(identifier), trick);
};

export const fetchTrick = async (identifier: string): Promise<Trick> => {
  const result = await fetch(getTrickKey(identifier));
  return JSON.parse(result) as Trick;
};

export const clearTrick = (identifier: string): void => {
  del(getTrickKey(identifier));
};
