import { ErrorTypes } from '../domain/error-types';
import { fetchPlayerWithLoginId } from '../persistence/storage-service';
import { TokenResponse } from '../types/token-response';
import { sign } from 'jsonwebtoken';

export const tokenForLoginId = async (
  loginId: string
): Promise<TokenResponse> => {
  const gamePlayer = await fetchPlayerWithLoginId(loginId);

  if (!gamePlayer) {
    return Promise.reject(new Error(ErrorTypes.NOT_FOUND));
  }

  const token = sign(gamePlayer, process.env.JWT_SECRET, {
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
    return idChars[Math.floor(Math.random() * idChars.length)];
  };

  return [...Array(loginIdLength).keys()].reduce(
    (previous) => previous + randonmChar(),
    ''
  );
};
