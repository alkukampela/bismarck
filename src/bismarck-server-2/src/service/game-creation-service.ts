import { initialHandStatute } from '../domain/hand-statute-machine';
import { sendLoginId } from './email-service';
import { CreateGameResponse } from '../../../types/create-game-response';
import { CreateGameRequest } from '../../../types/create-game-request';
import { v4 as uuid } from 'uuid';
import { generateLoginId } from './token-service';
import { storeLoginToken } from './login-token-service';
import { shuffle } from './shuffle-service';
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
    await storeLoginToken(
      loginId,
      {
        gameId,
        player: createPlayer.player,
      },
      env
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

  logger.info(`About to store game state for gameId: ${gameId}`);
  await stub.storeGameState({
    ...game,
    handStatute,
    trickScores: [],
  });
  logger.info(`Successfully stored game state for gameId: ${gameId}`);

  return {
    id: gameId,
    game,
  };
};
