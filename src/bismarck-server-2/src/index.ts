import { AutoRouter } from 'itty-router';
import {
  chooseGameType,
  getCurrentTrick,
  getHandsTrickCounts,
  getStatute,
  getTableCards,
} from './domain/hand-service';
import { StatusCodes } from 'http-status-codes';
import { generateTokenForPlayer } from './service/token-service';
import { FetchTokenRequest } from './types/fetch-token-request';
import {
  getTypedContent,
  withCreateGameRequest,
  withFetchTokenRequest,
  withGameTypeChoiceRequest,
} from './utils/type-guard-middleware';
import { createGameAndInvitatePlayers } from './service/game-creation-service';
import { CreateGameRequest } from '../../types/create-game-request';
import { handleError, jsonResponse } from './utils/api-helper';
import { GameStorage } from './persistence/game-storage';
import { getTotalScores } from './domain/game-score-manager';
import { loadGamePlayerByLoginId } from './service/login-token-service';
import { authenticatedRoute } from './utils/auth-middleware';
import { GameTypeChoiceRequest } from '../../types/game-type-choice-request';


export { GameStorage } from './persistence/game-storage';

const router = AutoRouter({ base: '/api' });

const getStub = (gameId: string, env: Env): DurableObjectStub<GameStorage> => {
  const id = env.GAME_STORAGE.idFromName(gameId);
  return env.GAME_STORAGE.get(id);
};

router
  .get('/games/:id/hand/statute', async (request, env: Env) => {
    const stub = getStub(request.params.id, env);
    try {
      const statute = await getStatute(stub);
      return jsonResponse(statute);
    } catch (err: unknown) {
      return handleError(err);
    }
  })
  .post(
    '/games/:id/hand/statute',
    withGameTypeChoiceRequest,
    authenticatedRoute(async (request, env: Env) => {
      try {
        const gameTypeChoice = getTypedContent<GameTypeChoiceRequest>(request);
        const stub = getStub(request.params.id, env);
        const statute = await chooseGameType(
          request.player,
          gameTypeChoice,
          stub
        );
        // TODO implement publishing
        //publishTrick(trickResponseDuringCardRemoval(), req.gameId);
        return jsonResponse(statute);
      } catch (err: unknown) {
        return handleError(err);
      }

      return new Response('Not implemented', { status: 501 });
    })
  )
  .get(
    '/games/:id/hand/cards',
    authenticatedRoute(async (request, env: Env) => {
      return new Response('Not implemented', { status: 501 });
    })
  )
  .delete(
    '/games/:id/hand/cards',
    authenticatedRoute(async (request, env: Env) => {
      return new Response('Not implemented', { status: 501 });
    })
  )
  .get('/games/:id/hand/trick', async (request, env: Env) => {
    const gameId = request.params.id;
    const trick = await getCurrentTrick(gameId);
    return jsonResponse(trick);
  })
  .post(
    '/games/:id/hand/trick',
    authenticatedRoute(async (request, env: Env) => {
      return new Response('Not implemented', { status: 501 });
    })
  )
  .post(
    '/games/:id/hand/trick/cards',
    authenticatedRoute(async (request, env: Env) => {
      return new Response('Not implemented', { status: 501 });
    })
  )
  .get('/games/:id/hand/trick-count', async (request, env: Env) => {
    const stub = getStub(request.params.id, env);
    try {
      const scores = await getHandsTrickCounts(stub);
      return jsonResponse(scores);
    } catch (err: unknown) {
      return handleError(err);
    }
  })
  .get('/games/:id/hand/tablecards', async (request, env: Env) => {
    const stub = getStub(request.params.id, env);
    try {
      const cards = await getTableCards(stub);
      return jsonResponse(cards);
    } catch (err: unknown) {
      return handleError(err);
    }
  })
  .get('/games/:id/score', async (request, env: Env) => {
    const stub = getStub(request.params.id, env);
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
    authenticatedRoute(async (request, env: Env) => {
      return new Response('Not implemented', { status: 501 });
    })
  )
  .post('/fetch-token', withFetchTokenRequest, async (request, env: Env) => {
    const content = getTypedContent<FetchTokenRequest>(request);
    try {
      const gamePlayer = await loadGamePlayerByLoginId(content.loginId, env);
      const result = await generateTokenForPlayer(gamePlayer, env.JWT_SECRET);
      return jsonResponse(result);
    } catch (err: unknown) {
      return handleError(err, StatusCodes.FORBIDDEN);
    }
  })
  .get('/dev/:id', () => new Response('Not implemented', { status: 501 }))
  .post('/dev/:id', () => new Response('Not implemented', { status: 501 }));

export default { ...router } satisfies ExportedHandler<Env>;
