import { ErrorTypes } from './error-types';
import { getStatute, isCurrentHandFinished, setUpHand } from './hand-service';
import { Game } from '../types/game';
import { HandStatute } from '../types/hand-statute';
import {
  fetchGame as fetchGameFromStore,
  storeGame,
  clearTrick,
} from '../persistence/storage-service';

export const nextHand = (game: Game, gameId: string): void => {
  const updatedGame = {
    ...game,
    handNumber: game.handNumber + 1,
  };
  storeGame(updatedGame, gameId);
};

export const fetchGame = async (gameId: string): Promise<Game> => {
  return fetchGameFromStore(gameId);
};

export const initHand = async (gameId: string): Promise<HandStatute> => {
  const isHandFinished = await isCurrentHandFinished(gameId);

  if (!isHandFinished) {
    return Promise.reject(new Error(ErrorTypes.CURRENT_HAND_NOT_FINISHED));
  }

  const game = await fetchGame(gameId);

  if (!game) {
    return Promise.reject(new Error(ErrorTypes.GAME_NOT_FOUND));
  }

  if (game.handNumber >= game.players.length * 4) {
    return Promise.reject(new Error(ErrorTypes.GAME_ENDED));
  }

  setUpHand(gameId, game);
  clearTrick(gameId);
  const updatedGame = {
    ...game,
    handNumber: game.handNumber + 1,
  };
  storeGame(updatedGame, gameId);

  return getStatute(gameId);
};
