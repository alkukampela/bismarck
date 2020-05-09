import { StorageService } from '../persistence/storage-service';
import { Player } from '../types/player';
import { Game } from '../types/game';
import { HandEntity } from './hand-entity';
import { CardManager } from './card-manager';
import shuffle from 'fisher-yates';

export const createGame = async (
  gameId: string,
  players: Player[]
): Promise<Game> => {
  const storageService = StorageService.getInstance();

  if (players.length !== 4) {
    return Promise.reject('Must have 4 players');
  }

  const existingGame = await storageService.fetchGame(gameId);
  if (!!existingGame) {
    return Promise.reject('Game already exists');
  }

  storageService.storeGame(gameId, {
    players: shuffle(players),
    handNumber: 0,
  });

  const hand = new HandEntity(
    storageService,
    CardManager.getInstance(storageService)
  );

  return storageService.fetchGame(gameId).then((game) => {
    hand.setUp(gameId, game);
    return game;
  });
};

export const fetchGame = async (gameId: string): Promise<Game> => {
  return await StorageService.getInstance().fetchGame(gameId);
};
