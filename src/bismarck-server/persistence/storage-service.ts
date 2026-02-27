import { CardContainer } from '../types/card-container';
import { GamePlayer } from '../types/game-player';
import { Trick } from '../types/trick';
import { PlayerScore } from '../../types/player-score';
import Redis from 'ioredis';
import { GameState } from '../types/game-state';

type StorageType =
  | CardContainer[]
  | PlayerScore[]
  | Trick
  | GamePlayer
  | GameState;

const ONE_DAY_EXPIRATION = 86400;

const redis = new Redis(process.env.REDIS_URL);

const store = (key: string, subject: StorageType): void => {
  redis.set(key, JSON.stringify(subject), 'EX', ONE_DAY_EXPIRATION);
};

const fetch = async (key: string): Promise<string> => {
  const value = await redis.get(key);
  if (value === null) {
    throw new Error(`Key not found: ${key}`);
  }
  return value;
};

const del = (key: string): void => {
  redis.del(key);
};

const getScoresKey = (identifier: string): string => `scores:${identifier}`;

const getCardsKey = (identifier: string): string => `cards:${identifier}`;

const getTrickKey = (identifier: string): string => `trick:${identifier}`;

const getGameStateKey = (identifier: string): string =>
  `gamestate:${identifier}`;

const playerLoginPrefix = 'gameplayer';

const getPlayerLoginIdKey = (identifier: string): string =>
  `${playerLoginPrefix}:${identifier}`;

export const storeGameState = (
  gameState: GameState,
  identifier: string
): void => {
  store(getGameStateKey(identifier), gameState);
};

export const fetchGameState = async (
  identifier: string
): Promise<GameState> => {
  const result = await fetch(getGameStateKey(identifier));
  return JSON.parse(result) as GameState;
};

export const storeCards = (
  cards: CardContainer[],
  identifier: string
): void => {
  store(getCardsKey(identifier), cards);
};

export const fetchCards = async (
  identifier: string
): Promise<CardContainer[]> => {
  const result = await fetch(getCardsKey(identifier));
  return JSON.parse(result) as CardContainer[];
};

export const storeScores = (
  scores: PlayerScore[],
  identifier: string
): void => {
  store(getScoresKey(identifier), scores);
};

export const fetchScores = async (
  identifier: string
): Promise<PlayerScore[]> => {
  const result = await fetch(getScoresKey(identifier));
  return JSON.parse(result) as PlayerScore[];
};

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

export const storeLoginIdForPlayer = (
  gamePlayer: GamePlayer,
  loginId: string
): void => {
  store(getPlayerLoginIdKey(loginId), gamePlayer);
};

export const fetchPlayerWithLoginId = async (
  loginId: string
): Promise<GamePlayer> => {
  const result = await fetch(getPlayerLoginIdKey(loginId));
  return JSON.parse(result) as GamePlayer;
};

export const fetchGamesLogins = async (
  gameId: string
): Promise<Map<string, GamePlayer>> => {
  const results = new Map<string, GamePlayer>();
  const keys = await redis.keys(`${playerLoginPrefix}:*`);

  for (const key of keys) {
    const loginId = key.replace(`${playerLoginPrefix}:`, '');
    const gamePlayer = await fetchPlayerWithLoginId(loginId);

    if (gamePlayer.gameId === gameId) {
      results.set(loginId, gamePlayer);
    }
  }

  return results;
};
