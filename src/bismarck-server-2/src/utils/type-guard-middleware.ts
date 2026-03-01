import { CreateGameRequest } from '../../../types/create-game-request';
import { FetchTokenRequest } from '../types/fetch-token-request';

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

export const getTypedContent = <T>(request: Request): T => {
  return (request as any).content;
};
