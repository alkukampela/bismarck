import { CardContainer } from '../types/card-container';
import { GamePlayer } from '../types/game-player';
import { Trick } from '../types/trick';
import { PlayerScore } from '../../types/player-score';
import { TrickScore } from '../../types/trick-score';
import Redis from 'ioredis';
import { GameState } from '../types/game-state';

type StorageType =
  | CardContainer[]
  | PlayerScore[]
  | Trick
  | TrickScore[]
  | GamePlayer
  | GameState;

const ONE_DAY_EXPIRATION = 86400;

const redis = new Redis(process.env.REDIS_URL);

const store = (key: string, subject: StorageType): void => {
  redis.set(key, JSON.stringify(subject), 'EX', ONE_DAY_EXPIRATION);
};

const fetch = async (key: string): Promise<string> => {
  return redis.get(key);
};

const del = (key: string): void => {
  redis.del(key);
};

const getScoresKey = (identifier: string): string => `scores:${identifier}`;

const getCardsKey = (identifier: string): string => `cards:${identifier}`;

const getTrickKey = (identifier: string): string => `trick:${identifier}`;

const getTrickScoresKey = (identifier: string): string =>
  `trickscores:${identifier}`;

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

export const storeTrickScores = (
  trickScores: TrickScore[],
  identifier: string
): void => {
  store(getTrickScoresKey(identifier), trickScores);
};

export const fetchTrickScores = async (
  identifier: string
): Promise<TrickScore[]> => {
  const result = await fetch(getTrickScoresKey(identifier));
  return JSON.parse(result) as TrickScore[];
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
