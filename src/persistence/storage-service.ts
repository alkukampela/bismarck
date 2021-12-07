import { CardContainer } from './card-container';
import { GamePlayer } from './game-player';
import { Trick } from './trick';
import { Game } from '../types/game';
import { HandStatute } from '../types/hand-statute';
import { PlayerScore } from '../types/player-score';
import { TrickScore } from '../types/trick-score';
import Redis from 'ioredis';

type StorageType =
  | CardContainer[]
  | PlayerScore[]
  | HandStatute
  | Trick
  | Game
  | TrickScore[]
  | GamePlayer;

const ONE_DAY_EXPIRATION = 86400;

const redis: Redis.Redis = new Redis(process.env.REDIS_URL);

const store = (key: string, subject: StorageType): void => {
  void redis.set(key, JSON.stringify(subject), 'EX', ONE_DAY_EXPIRATION);
};

const fetch = async (key: string): Promise<string> => {
  return redis.get(key);
};

const del = (key: string): void => {
  void redis.del(key);
};

const getGamesKey = (identifier: string): string => `game:${identifier}`;

const getScoresKey = (identifier: string): string => `scores:${identifier}`;

const getCardsKey = (identifier: string): string => `cards:${identifier}`;

const getHandStatuteKey = (identifier: string): string =>
  `statute:${identifier}`;

const getTrickKey = (identifier: string): string => `trick:${identifier}`;

const getTrickScoresKey = (identifier: string): string =>
  `trickscores:${identifier}`;

const playerLoginPrefix = 'gameplayer';

const getPlayerLoginIdKey = (identifier: string): string =>
  `${playerLoginPrefix}:${identifier}`;

export const storeGame = (game: Game, identifier: string): void => {
  store(getGamesKey(identifier), game);
};

export const fetchGame = async (identifier: string): Promise<Game> => {
  const result = await fetch(getGamesKey(identifier));
  return JSON.parse(result) as Game;
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

export const storeHandStatute = (
  statute: HandStatute,
  identifier: string
): void => {
  store(getHandStatuteKey(identifier), statute);
};

export const fetchHandStatute = async (
  identifier: string
): Promise<HandStatute> => {
  const result = await fetch(getHandStatuteKey(identifier));
  return JSON.parse(result) as HandStatute;
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
