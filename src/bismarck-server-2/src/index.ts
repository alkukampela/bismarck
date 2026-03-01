import { AutoRouter } from 'itty-router';
import {
  getCurrentTrick,
  getStatute,
  getTableCards,
} from './domain/hand-service';
import { StatusCodes } from 'http-status-codes';
import { tokenForLoginId } from './service/token-service';
import { FetchTokenRequest } from './types/fetch-token-request';
import {
  getTypedContent,
  withCreateGameRequest,
  withFetchTokenRequest,
} from './utils/type-guard-middleware';
import { createGameAndInvitatePlayers } from './domain/game-creation-service';
import { CreateGameRequest } from '../../types/create-game-request';
import { handleError, jsonResponse } from './utils/api-helper';
import { GameStorage } from './persistence/game-storage';
import { getTotalScores } from './domain/game-score-manager';

export { GameStorage } from './persistence/game-storage';

const router = AutoRouter({ base: '/api' });

const getStub = (gameId: string, env: Env): DurableObjectStub<GameStorage> => {
  const id = env.GAME_STORAGE.idFromName(gameId);
  return env.GAME_STORAGE.get(id);
};

router
  .get('/games/:id/hand/statute', async (request, env: Env) => {
    const gameId = request.params.id;
    const stub = getStub(gameId, env);
    try {
      const statute = await getStatute(stub);
      return jsonResponse(statute);
    } catch (err: unknown) {
      return handleError(err);
    }
  })
  .post(
    '/games/:id/hand/statute',
    () => new Response('Not implemented', { status: 501 })
  )
  .get(
    '/games/:id/hand/cards',
    () => new Response('Not implemented', { status: 501 })
  )
  .delete(
    '/games/:id/hand/cards',
    () => new Response('Not implemented', { status: 501 })
  )
  .get('/games/:id/hand/trick', async (request, env: Env) => {
    const gameId = request.params.id;
    const trick = await getCurrentTrick(gameId);
    return jsonResponse(trick);
  })
  .post(
    '/games/:id/hand/trick',
    () => new Response('Not implemented', { status: 501 })
  )
  .post(
    '/games/:id/hand/trick/cards',
    () => new Response('Not implemented', { status: 501 })
  )
  .get(
    '/games/:id/hand/trick-count',
    () => new Response('Not implemented', { status: 501 })
  )
  .get('/games/:id/hand/tablecards', async (request, env: Env) => {
    const gameId = request.params.id;
    const stub = getStub(gameId, env);
    try {
      const cards = await getTableCards(stub);
      return jsonResponse(cards);
    } catch (err: unknown) {
      return handleError(err);
    }
  })
  .get('/games/:id/score', async (request, env: Env) => {
    const gameId = request.params.id;
    const stub = getStub(gameId, env);
    try {
      const gameState = await stub.fetchGameState();
      if (!gameState) {
        return handleError(
          new Error('Game state not found'),
          StatusCodes.NOT_FOUND
        );
      }
      const scores = getTotalScores(gameState);
      jsonResponse(scores);
    } catch (err: unknown) {
      handleError(err);
    }
  })
  .post('/games', withCreateGameRequest, async (request, env: Env) => {
    try {
      const createGameRequest = getTypedContent<CreateGameRequest>(request);
      const creatGameResponse = await createGameAndInvitatePlayers(
        createGameRequest,
        env
      );
      return jsonResponse(creatGameResponse, StatusCodes.CREATED);
    } catch (err: unknown) {
      return handleError(err, StatusCodes.FORBIDDEN);
    }
  })
  .post(
    '/games/:id/hand',
    () => new Response('Not implemented', { status: 501 })
  )
  .post('/fetch-token', withFetchTokenRequest, async (request, env: Env) => {
    const content = getTypedContent<FetchTokenRequest>(request);
    try {
      const result = await tokenForLoginId(content.loginId, env);
      return jsonResponse(result);
    } catch (err: unknown) {
      return handleError(err, StatusCodes.FORBIDDEN);
    }
  })
  .get('/dev/:id', () => new Response('Not implemented', { status: 501 }))
  .post('/dev/:id', () => new Response('Not implemented', { status: 501 }));

export default { ...router } satisfies ExportedHandler<Env>;
