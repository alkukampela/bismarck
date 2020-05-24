import { CardManager } from './card-manager';
import { ErrorTypes } from './error-types';
import { HandService } from './hand-service';
import { StorageService } from '../persistence/storage-service';
import { Game } from '../types/game';
import { HandStatute } from '../types/hand-statute';
import { Player } from '../types/player';
import shuffle from 'fisher-yates';

const storageService = StorageService.getInstance();
const handService = new HandService(
  storageService,
  CardManager.getInstance(storageService)
);

export const createGame = async (
  gameId: string,
  players: Player[],
  handNumber?: number
): Promise<Game> => {
  if (players.length < 3 || players.length > 4) {
    return Promise.reject('Must have 3 or 4 players');
  }

  const existingGame = await storageService.fetchGame(gameId);
  if (!!existingGame) {
    return Promise.reject('Game already exists');
  }

  const game = {
    players: shuffle(players),
    handNumber: handNumber || 0,
  };

  storageService.storeGame(game, gameId);
  return game;
};

export const nextHand = (game: Game, gameId: string) => {
  const updatedGame = {
    ...game,
    handNumber: game.handNumber + 1,
  };
  storageService.storeGame(updatedGame, gameId);
};

export const fetchGame = async (gameId: string): Promise<Game> => {
  return await storageService.fetchGame(gameId);
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
  storageService.clearTrick(gameId);
  const updatedGame = {
    ...game,
    handNumber: game.handNumber + 1,
  };
  storageService.storeGame(updatedGame, gameId);

  return handService.getStatute(gameId);
};
