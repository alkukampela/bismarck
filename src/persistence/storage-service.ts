import { GamePlayer } from './game-player';
import { Trick } from './trick';
import { Card } from '../types/card';
import { Game } from '../types/game';
import { HandStatute } from '../types/hand-statute';
import { PlayerScore } from '../types/player-score';
import Redis from 'ioredis';
import { TrickScore } from '../types/trick-score';

type StorageType =
  | CardContainer[]
  | PlayerScore[]
  | HandStatute
  | Trick
  | Game
  | TrickScore[]
  | GamePlayer;

export type CardContainer = {
  card: Card;
  isPlayed: boolean;
};

const ONE_DAY_EXPIRATION = 86400;

const _redis: Redis.Redis = new Redis(process.env.REDIS_URL);

const store = (key: string, subject: StorageType): void => {
  _redis.set(key, JSON.stringify(subject), 'EX', ONE_DAY_EXPIRATION);
};

const fetch = async (key: string): Promise<string> => {
  return _redis.get(key);
};

const del = (key: string) => {
  _redis.del(key);
};

const getGamesKey = (identifier: string): string => `game:${identifier}`;

const getScoresKey = (identifier: string) => `scores:${identifier}`;

const getCardsKey = (identifier: string) => `cards:${identifier}`;

const getHandStatuteKey = (identifier: string): string =>
  `statute:${identifier}`;

const getTrickKey = (identifier: string): string => `trick:${identifier}`;

const getTrickScoresKey = (identifier: string): string =>
  `trickscores:${identifier}`;

const getGamePlayerKey = (identifier: string): string =>
  `gameplayer:${identifier}`;

export const storeGame = (game: Game, identifier: string): void => {
  store(getGamesKey(identifier), game);
};

export const fetchGame = async (identifier: string): Promise<Game> => {
  const result = await fetch(getGamesKey(identifier));
  return JSON.parse(result);
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
  return JSON.parse(result);
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
  return JSON.parse(result);
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
  return JSON.parse(result);
};

export const storeTrick = (identifier: string, trick: Trick): void => {
  store(getTrickKey(identifier), trick);
};

export const fetchTrick = async (identifier: string): Promise<Trick> => {
  const result = await fetch(getTrickKey(identifier));
  return JSON.parse(result);
};

export const clearTrick = (identifier: string) => {
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
  return JSON.parse(result);
};

export const storeGamePlayer = (gamePlayer: GamePlayer, identifier: string) => {
  store(getGamePlayerKey(identifier), gamePlayer);
};

export const fetchGamePlayer = async (
  identifier: string
): Promise<GamePlayer> => {
  const result = await fetch(getGamePlayerKey(identifier));
  return JSON.parse(result);
};
