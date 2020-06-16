import { ErrorTypes } from '../domain/error-types';
import { fetchGamePlayer } from '../persistence/storage-service';
import { TokenResponse } from '../types/token-response';
import { sign } from 'jsonwebtoken';

export const tokenFor = async (id: string): Promise<TokenResponse> => {
  const gamePlayer = await fetchGamePlayer(id);

  if (!gamePlayer) {
    return Promise.reject(new Error(ErrorTypes.NOT_FOUND));
  }

  const token = sign(gamePlayer, process.env.JWT_SECRET, {
    expiresIn: '3h',
  });

  return {
    token,
    player: gamePlayer.player,
    gameId: gamePlayer.gameId,
  };
};
