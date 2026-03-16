import { AutoRouter, cors } from 'itty-router';
import {
  addCardToTrick,
  chooseGameType,
  getCurrentTrick,
  getGameScores,
  getHandsTrickCounts,
  getPlayersHand,
  getStatute,
  getTableCards,
  initHand,
  removePlayersCard,
  startTrick,
} from './domain/hand-service';
import { StatusCodes } from 'http-status-codes';
import { generateTokenForPlayer } from './service/token-service';
import { FetchTokenRequest } from './types/fetch-token-request';
import {
  getTypedContent,
  withCreateGameRequest,
  withFetchTokenRequest,
  withGameTypeChoiceRequest,
  withCardRequest,
} from './utils/type-guard-middleware';
import { createGameAndInvitatePlayers } from './service/game-creation-service';
import { CreateGameRequest } from '../../types/create-game-request';
import { CardRequest } from '../../types/card-request';
import { handleError, jsonResponse } from './utils/api-helper';
import { GameStorage } from './persistence/game-storage';
import { loadGamePlayerByLoginId } from './service/login-token-service';
import { authenticatedRoute } from './utils/auth-middleware';
import { GameTypeChoiceRequest } from '../../types/game-type-choice-request';
import { GameError } from './utils/game-error';
import { ErrorTypes } from './types/error-types';
import { Card, Rank, Suit } from '../../types/card';
import { ServiceResult } from './types/service-result';

export { GameStorage } from './persistence/game-storage';

const handleWebSocketUpgrade = async (
  request: Request,
  env: Env
): Promise<Response> => {
  const url = new URL(request.url);
  const gameId = url.searchParams.get('gameId');

  if (!gameId) {
    return handleError(new GameError(ErrorTypes.GAME_NOT_FOUND));
  }

  const stub = getStub(gameId, env);
  return await stub.fetch(request);
};

const { preflight, corsify } = cors({
  origin: '*',
});

const router = AutoRouter({ base: '/api' });

const getStub = (gameId: string, env: Env): DurableObjectStub<GameStorage> => {
  if (!env.GAME_STORAGE) {
    throw new Error('Internal server error');
  }
  const id = env.GAME_STORAGE.idFromName(gameId);
  return env.GAME_STORAGE.get(id);
};

const storeAndBroadcast = async <T>(
  stub: DurableObjectStub<GameStorage>,
  result: ServiceResult<T>
): Promise<void> => {
  await stub.store(result.updates);
  if (result.broadcastValue) {
    await stub.broadcastTrick(result.broadcastValue);
  }
};

router
  .all('*', preflight)
  .get('/games/:id/hand/statute', async (request, env: Env) => {
    const stub = getStub(request.params.id, env);
    try {
      const { gameState } = await stub.fetchGameData();
      const result = getStatute(gameState);
      return jsonResponse(result.retval);
    } catch (err) {
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
        const { gameState } = await stub.fetchGameData();

        const result = chooseGameType(
          request.player,
          gameTypeChoice,
          gameState
        );

        await storeAndBroadcast(stub, result);

        return jsonResponse(result.retval);
      } catch (err) {
        return handleError(err);
      }
    })
  )
  .get(
    '/games/:id/hand/cards',
    authenticatedRoute(async (request, env: Env) => {
      try {
        const stub = getStub(request.params.id, env);
        const { gameState, deck } = await stub.fetchGameData();
        const result = getPlayersHand(request.player, gameState, deck);
        return jsonResponse(result.retval);
      } catch (err) {
        return handleError(err);
      }
    })
  )
  .delete(
    '/games/:id/hand/cards',
    authenticatedRoute(async (request, env: Env) => {
      try {
        const { rank, suit } = request.query;

        if (!rank || !suit) {
          throw new GameError(ErrorTypes.INVALID_QUERY_PARAMETERS);
        }
        const card: Card = {
          rank: request.query.rank as Rank,
          suit: request.query.suit as Suit,
        };
        const stub = getStub(request.params.id, env);
        const { gameState, deck } = await stub.fetchGameData();

        const result = removePlayersCard(request.player, card, gameState, deck);

        await storeAndBroadcast(stub, result);

        return new Response(null, { status: StatusCodes.NO_CONTENT });
      } catch (err: unknown) {
        return handleError(err);
      }
    })
  )
  .get('/games/:id/hand/trick', async (request, env: Env) => {
    try {
      const stub = getStub(request.params.id, env);
      const { trick, gameState } = await stub.fetchGameData();
      const result = getCurrentTrick(trick, gameState);
      return jsonResponse(result.retval);
    } catch (err) {
      return handleError(err);
    }
  })
  .post(
    '/games/:id/hand/trick',
    withCardRequest,
    authenticatedRoute(async (request, env: Env) => {
      try {
        const stub = getStub(request.params.id, env);
        const card = getTypedContent<CardRequest>(request);
        const {
          gameState,
          trick: previousTrick,
          deck,
        } = await stub.fetchGameData();

        const result = startTrick(
          request.player,
          card,
          gameState,
          previousTrick,
          deck
        );

        await storeAndBroadcast(stub, result);

        return jsonResponse(result.retval);
      } catch (err) {
        return handleError(err);
      }
    })
  )
  .post(
    '/games/:id/hand/trick/cards',
    withCardRequest,
    authenticatedRoute(async (request, env: Env) => {
      try {
        const stub = getStub(request.params.id, env);
        const card = getTypedContent<CardRequest>(request);
        const { gameState, trick, deck, trickPoints } =
          await stub.fetchGameData();

        const result = addCardToTrick(
          request.player,
          card,
          gameState,
          trick,
          deck,
          trickPoints
        );

        await storeAndBroadcast(stub, result);

        return jsonResponse(result.retval);
      } catch (err) {
        return handleError(err);
      }
    })
  )
  .get('/games/:id/hand/trick-count', async (request, env: Env) => {
    const stub = getStub(request.params.id, env);
    try {
      const { trickPoints } = await stub.fetchGameData();
      const result = getHandsTrickCounts(trickPoints);
      return jsonResponse(result.retval);
    } catch (err) {
      return handleError(err);
    }
  })
  .get('/games/:id/hand/tablecards', async (request, env: Env) => {
    const stub = getStub(request.params.id, env);
    try {
      const { deck } = await stub.fetchGameData();
      const result = getTableCards(deck);
      return jsonResponse(result.retval);
    } catch (err) {
      return handleError(err);
    }
  })
  .get('/games/:id/score', async (request, env: Env) => {
    const stub = getStub(request.params.id, env);
    try {
      const { gameState } = await stub.fetchGameData();
      const result = getGameScores(gameState);
      return jsonResponse(result.retval);
    } catch (err) {
      return handleError(err);
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
    } catch (err) {
      return handleError(err);
    }
  })
  .post(
    '/games/:id/hand',
    authenticatedRoute(async (request, env: Env) => {
      try {
        const stub = getStub(request.params.id, env);
        const { gameState, deck: currentDeck } = await stub.fetchGameData();

        const result = initHand(gameState, currentDeck);

        await storeAndBroadcast(stub, result);

        return jsonResponse(result.retval);
      } catch (err) {
        return handleError(err);
      }
    })
  )
  .post('/fetch-token', withFetchTokenRequest, async (request, env: Env) => {
    const content = getTypedContent<FetchTokenRequest>(request);
    try {
      const gamePlayer = await loadGamePlayerByLoginId(content.loginId, env);
      const result = await generateTokenForPlayer(gamePlayer, env.JWT_SECRET);
      return jsonResponse(result);
    } catch (err) {
      return handleError(err);
    }
  });

export default {
  fetch: (req, env, ctx) => {
    const upgradeHeader = req.headers.get('Upgrade');
    if (upgradeHeader === 'websocket') {
      return handleWebSocketUpgrade(req, env);
    }
    return router.fetch(req, env, ctx).then(corsify);
  },
} satisfies ExportedHandler<Env>;
