import { CreateGameRequest } from '../../../types/create-game-request';
import { FetchTokenRequest } from '../types/fetch-token-request';
import { GameTypeChoiceRequest } from '../../../types/game-type-choice-request';
import { GameType } from '../../../types/game-type';
import { SuitEnum } from '../../../types/suit';

const isCreateGameRequest = (obj: any): obj is CreateGameRequest => {
  return (
    obj &&
    Array.isArray(obj.players) &&
    obj.players.every(
      (p: any) =>
        typeof p === 'object' &&
        typeof p.email === 'string' &&
        typeof p.player === 'object' &&
        typeof p.player.name === 'string'
    )
  );
};

const isFetchTokenRequest = (obj: any): obj is FetchTokenRequest => {
  return obj && typeof obj.loginId === 'string';
};

const isGameTypeChoice = (obj: any): obj is GameTypeChoiceRequest => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const validGameTypes = Object.values(GameType);
  if (!validGameTypes.includes(obj.gameType)) {
    return false;
  }

  // trumpSuit is optional
  if (obj.trumpSuit !== undefined) {
    const validSuits = Object.values(SuitEnum).filter(
      (v) => typeof v === 'number'
    );
    if (!validSuits.includes(obj.trumpSuit)) {
      return false;
    }
  }

  return true;
};

type TypeGuard<T> = (obj: any) => obj is T;

const withTypedContent =
  <T>(typeGuard: TypeGuard<T>) =>
  async (request: Request, env?: Env, ctx?: unknown) => {
    const content = await request.json().catch(() => undefined);
    if (!typeGuard(content)) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    (request as any).content = content as T;
  };

export const withFetchTokenRequest =
  withTypedContent<FetchTokenRequest>(isFetchTokenRequest);
export const withCreateGameRequest =
  withTypedContent<CreateGameRequest>(isCreateGameRequest);
export const withGameTypeChoiceRequest =
  withTypedContent<GameTypeChoiceRequest>(isGameTypeChoice);

export const getTypedContent = <T>(request: Request): T => {
  return (request as any).content;
};
