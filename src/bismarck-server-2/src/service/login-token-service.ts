import { ErrorTypes } from '../types/error-types';
import { GamePlayer } from '../types/game-player';
import pino from 'pino';

const logger = pino();

const TTL_24_HOURS = 86400;

/**
 * Store login token in KV storage
 */
export const storeLoginToken = async (
  loginId: string,
  gamePlayer: GamePlayer,
  env: Env
): Promise<void> => {
  await env.LOGIN_TOKENS.put(loginId, JSON.stringify(gamePlayer), {
    expirationTtl: TTL_24_HOURS,
  });
  logger.info(
    `Stored login token for player: ${gamePlayer.player.name}, game ID: ${gamePlayer.gameId}`
  );
};

/**
 * Load GamePlayer from login token in KV storage
 */
export const loadGamePlayerByLoginId = async (
  loginId: string,
  env: Env
): Promise<GamePlayer> => {
  logger.info(`Fetching player for login ID: ${loginId}`);
  const rawGamePlayer = await env.LOGIN_TOKENS.get(loginId);

  if (!rawGamePlayer) {
    throw new Error(ErrorTypes.NOT_FOUND);
  }

  try {
    const gamePlayer = JSON.parse(rawGamePlayer) as GamePlayer;

    if (!gamePlayer.gameId || !gamePlayer.player) {
      logger.error(`Invalid game player data`);
      throw new Error(ErrorTypes.UNEXPECTED_ERROR);
    }

    return gamePlayer;
  } catch (error) {
    logger.error(`Error parsing game player data: ${error}`);
    throw new Error(ErrorTypes.UNEXPECTED_ERROR);
  }
};
