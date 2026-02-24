import { ErrorTypes } from '../domain/error-types';
import { fetchPlayerWithLoginId } from '../persistence/storage-service';
import { TokenResponse } from '../../types/token-response';
import jwt from 'jsonwebtoken';
import { randomInt, randomBytes } from 'crypto';

// `crypto.randomInt` was added in Node 14.10.0. some environments (e.g. older
// Docker images) may not expose it, leading to the "is not a function" error
// seen in production.  Provide a simple fallback so the service still works
// when the native helper is missing.
const secureRandomInt = (max: number): number => {
  if (typeof randomInt === 'function') {
    return randomInt(max);
  }
  // fall back to a pseudo‑random value based on randomBytes
  const buf = randomBytes(4);
  return buf.readUInt32BE(0) % max;
};

export const tokenForLoginId = async (
  loginId: string
): Promise<TokenResponse> => {
  const gamePlayer = await fetchPlayerWithLoginId(loginId);

  if (!gamePlayer) {
    return Promise.reject(new Error(ErrorTypes.NOT_FOUND));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
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
    return idChars[secureRandomInt(idChars.length)];
  };

  return [...Array(loginIdLength).keys()].reduce(
    (previous) => previous + randonmChar(),
    ''
  );
};
