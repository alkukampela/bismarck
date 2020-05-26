import { TokenResponse } from '../types/token-response';
import { StorageService } from '../persistence/storage-service';
import { ErrorTypes } from '../domain/error-types';
import { sign } from 'jsonwebtoken';

const storageService = StorageService.getInstance();

export const tokenFor = async (id: string): Promise<TokenResponse> => {
  const gamePlayer = await storageService.fetchGamePlayer(id);

  if (!gamePlayer) {
    return Promise.reject(new Error(ErrorTypes.NOT_FOUND));
  }

  const token = sign(gamePlayer, process.env.JWT_SECRET, {
    expiresIn: '3h',
  });

  console.log(token);
  return {
    token,
    gameId: gamePlayer.gameId,
  };
};
