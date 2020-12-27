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
