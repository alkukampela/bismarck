import { ErrorTypes } from './error-types';
import { HandService } from './hand-service';
import {
  fetchGame as fetchGameFromStore,
  storeGame,
  clearTrick,
} from '../persistence/storage-service';
import { Game } from '../types/game';
import { HandStatute } from '../types/hand-statute';

const handService = new HandService();

export const nextHand = (game: Game, gameId: string) => {
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
  const isHandFinished = await handService.isHandFinished(gameId);

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

  handService.setUp(gameId, game);
  clearTrick(gameId);
  const updatedGame = {
    ...game,
    handNumber: game.handNumber + 1,
  };
  storeGame(updatedGame, gameId);

  return handService.getStatute(gameId);
};
