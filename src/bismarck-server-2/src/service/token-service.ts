import { TokenResponse } from '../../../types/token-response';
import jwt from '@tsndr/cloudflare-worker-jwt';
import pino from 'pino';
import { GamePlayer } from '../types/game-player';
import { ErrorTypes } from '../types/error-types';
import { loadGamePlayerByLoginId } from './login-token-service';

const logger = pino();

const randomInt = (max: number): number => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
};

export const generateTokenForPlayer = async (
  gamePlayer: GamePlayer,
  secret: string
): Promise<TokenResponse> => {
  logger.info(
    `Generating token for player: ${gamePlayer.player.name}, game ID: ${gamePlayer.gameId}`
  );

  const payload = {
    ...gamePlayer,
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
  };
  const token = await jwt.sign(payload, secret);

  return {
    token,
    player: gamePlayer.player,
    gameId: gamePlayer.gameId,
  };
};

export const extrractGamePlayerFromValidToken = async (
  token: string,
  secret: string
): Promise<GamePlayer> => {
  const isValid = await jwt.verify(token, secret);

  if (!isValid) {
    throw new Error(ErrorTypes.FORBIDDEN);
  }

  const decoded = jwt.decode(token);
  const payload = decoded.payload as GamePlayer;

  if (!payload.gameId || !payload.player) {
    throw new Error(ErrorTypes.UNEXPECTED_ERROR);
  }

  return payload;
};

export const tokenForLoginId = async (
  loginId: string,
  secret: string,
  env: Env
): Promise<TokenResponse> => {
  const gamePlayer = await loadGamePlayerByLoginId(loginId, env);
  return generateTokenForPlayer(gamePlayer, secret);
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

  const randomChar = () => {
    return idChars[randomInt(idChars.length)];
  };

  return [...Array(loginIdLength).keys()].reduce(
    (previous) => previous + randomChar(),
    ''
  );
};
