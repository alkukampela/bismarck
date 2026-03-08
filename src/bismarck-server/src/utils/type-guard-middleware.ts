import { CreateGameRequest } from '../../../types/create-game-request';
import { FetchTokenRequest } from '../types/fetch-token-request';
import { GameTypeChoiceRequest } from '../../../types/game-type-choice-request';
import { GameType } from '../../../types/game-type';
import { SuitEnum } from '../../../types/suit';
import { CardRequest } from '../../../types/card-request';
import { Rank, Suit, ALL_RANKS, ALL_SUITS } from '../../../types/card';

const isCreateGameRequest = (obj: unknown): obj is CreateGameRequest => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  const record = obj as Record<string, unknown>;
  return (
    Array.isArray(record.players) &&
    record.players.every(
      (p: unknown) =>
        typeof p === 'object' &&
        p !== null &&
        'email' in p &&
        typeof p.email === 'string' &&
        'player' in p &&
        typeof p.player === 'object' &&
        p.player !== null &&
        'name' in p.player &&
        typeof (p.player as Record<string, unknown>).name === 'string'
    )
  );
};

const isFetchTokenRequest = (obj: unknown): obj is FetchTokenRequest => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  const record = obj as Record<string, unknown>;
  return typeof record.loginId === 'string';
};

const isGameTypeChoice = (obj: unknown): obj is GameTypeChoiceRequest => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const record = obj as Record<string, unknown>;
  const validGameTypes = Object.values(GameType);
  if (!validGameTypes.includes(record.gameType as GameType)) {
    return false;
  }

  // trumpSuit is optional
  if (record.trumpSuit !== undefined) {
    const validSuits = Object.values(SuitEnum).filter(
      (v) => typeof v === 'number'
    );
    if (!validSuits.includes(record.trumpSuit as number)) {
      return false;
    }
  }

  return true;
};

const isCardRequest = (obj: unknown): obj is CardRequest => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const record = obj as Record<string, unknown>;
  return (
    typeof record.rank === 'string' &&
    ALL_RANKS.includes(record.rank as Rank) &&
    typeof record.suit === 'string' &&
    ALL_SUITS.includes(record.suit as Suit)
  );
};

type TypeGuard<T> = (obj: unknown) => obj is T;

const withTypedContent =
  <T>(typeGuard: TypeGuard<T>) =>
  async (request: Request, _env?: Env, _ctx?: unknown) => {
    const content = await request.json().catch(() => undefined);
    if (!typeGuard(content)) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // eslint-disable-next-line
    (request as any).content = content;
  };

export const withFetchTokenRequest =
  withTypedContent<FetchTokenRequest>(isFetchTokenRequest);
export const withCreateGameRequest =
  withTypedContent<CreateGameRequest>(isCreateGameRequest);
export const withGameTypeChoiceRequest =
  withTypedContent<GameTypeChoiceRequest>(isGameTypeChoice);
export const withCardRequest = withTypedContent<CardRequest>(isCardRequest);

export const getTypedContent = <T>(request: Request): T => {
  // eslint-disable-next-line
  return (request as any).content;
};
