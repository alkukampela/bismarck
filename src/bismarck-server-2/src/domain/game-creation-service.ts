import { initialHandStatute } from './hand-statute-machine';
import { sendLoginId } from '../service/email-service';
import { CreateGameResponse } from '../../../types/create-game-response';
import { CreateGameRequest } from '../../../types/create-game-request';
import { v4 as uuid } from 'uuid';
import { generateLoginId } from '../service/token-service';
import { shuffle } from '../service/shuffle-service';
import pino from 'pino';

const logger = pino();

const checkForDuplicatePlayers = (request: CreateGameRequest): boolean => {
  return (
    new Set(
      request.players.map((item) => {
        return item.player.name;
      })
    ).size !== request.players.length
  );
};

const generateIdentifier = (): string => {
  return uuid().replace('-', '').substring(0, 11);
};

export const createGameAndInvitatePlayers = async (
  request: CreateGameRequest,
  env: Env
): Promise<CreateGameResponse> => {
  if (request.players.length < 3 || request.players.length > 4) {
    logger.error(`Invalid number of players: ${request.players.length}`);
    return Promise.reject(new Error('Must have 3 or 4 players'));
  }

  if (checkForDuplicatePlayers(request)) {
    logger.error('Duplicate player names found');
    return Promise.reject(new Error('Players must have unique names'));
  }

  const gameId = generateIdentifier();

  const id = env.GAME_STORAGE.idFromName(gameId);
  const stub = env.GAME_STORAGE.get(id);

  for (const createPlayer of request.players) {
    const loginId = generateLoginId(5);
    await env.LOGIN_TOKENS.put(
      loginId,
      JSON.stringify({
        gameId,
        player: createPlayer.player,
      }),
      {
        // 24 hours
        expirationTtl: 864_000,
      }
    );
    logger.info(`Generated login ID for player: ${createPlayer.player.name}`);
    sendLoginId({
      email: createPlayer.email,
      name: createPlayer.player.name,
      loginId,
    });
    logger.info(`Sent login ID to player: ${createPlayer.player.name}`);
  }

  const game = {
    players: shuffle(request.players.map((item) => item.player)),
    handNumber: 0,
  };
  const handStatute = initialHandStatute(game);

  stub.storeGameState({
    ...game,
    handStatute,
    trickScores: [],
  });
  logger.info(`Initialized game with ID: ${gameId}`);

  return {
    id: gameId,
    game,
  };
};
