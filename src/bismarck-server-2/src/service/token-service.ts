import { ErrorTypes } from '../types/error-types';
import { TokenResponse } from '../../../types/token-response';
import jwt from 'jsonwebtoken';
import { randomInt } from 'crypto';
import pino from 'pino';
import { GamePlayer } from '../types/game-player';

const logger = pino();

export const tokenForLoginId = async (
  loginId: string,
  env: Env
): Promise<TokenResponse> => {
  logger.info(`Fetching player for login ID: ${loginId}`);
  const rawGamePlayer = await env.LOGIN_TOKENS.get(loginId);

  if (!rawGamePlayer) {
    return Promise.reject(new Error(ErrorTypes.NOT_FOUND));
  }

  let gamePlayer: GamePlayer;
  try {
    gamePlayer = JSON.parse(rawGamePlayer);

    if (!gamePlayer.gameId || !gamePlayer.player) {
      logger.error(`Invalid game player data`);
      return Promise.reject(new Error(ErrorTypes.UNEXPECTED_ERROR));
    }
  } catch (error) {
    logger.error(`Error parsing game player data`);
    return Promise.reject(new Error(ErrorTypes.UNEXPECTED_ERROR));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  logger.info(
    `Generating token for player: ${gamePlayer.player.name}, game ID: ${gamePlayer.gameId}`
  );
  const token = jwt.sign(gamePlayer, secret, {
    expiresIn: '24h',
  });

  return {
    token,
    player: gamePlayer.player,
    gameId: gamePlayer.gameId,
  };
};

export const generateLoginId = (loginIdLength: number): string => {
  const idChars: string[] = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'M',
    'N',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];

  const randonmChar = () => {
    // use secureRandomInt instead of crypto.randomInt directly
    return idChars[randomInt(idChars.length)];
  };

  return [...Array(loginIdLength).keys()].reduce(
    (previous) => previous + randonmChar(),
    ''
  );
};
