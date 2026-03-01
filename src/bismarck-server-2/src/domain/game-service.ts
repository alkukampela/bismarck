import { ErrorTypes } from '../types/error-types';
import { isCurrentHandFinished, setUpHand } from './hand-service';
import { HandStatute } from '../../../types/hand-statute';
import {
  clearTrick,
  fetchGameState,
  storeGameState,
} from '../persistence/storage-service';

export const initHand = async (gameId: string): Promise<HandStatute> => {
  const isHandFinished = await isCurrentHandFinished(gameId);

  if (!isHandFinished) {
    return Promise.reject(new Error(ErrorTypes.CURRENT_HAND_NOT_FINISHED));
  }

  const gameState = await fetchGameState(gameId);

  if (!gameState) {
    return Promise.reject(new Error(ErrorTypes.GAME_NOT_FOUND));
  }

  if (gameState.handNumber >= gameState.players.length * 4) {
    return Promise.reject(new Error(ErrorTypes.GAME_ENDED));
  }

  const handStatute = await setUpHand(gameId, gameState);
  const updatedGameState = {
    ...gameState,
    handNumber: gameState.handNumber + 1,
    handStatute,
  };
  storeGameState(updatedGameState, gameId);
  clearTrick(gameId);

  return handStatute;
};
