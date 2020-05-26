import { StorageService } from '../persistence/storage-service';
import { RegisterPlayer } from '../types/register-player';
import shuffle from 'fisher-yates';
import { v4 as uuid } from 'uuid';
import UuidEncoder from 'uuid-encoder';
import { Game } from '../types/game';
import { sendGameLink } from '../service/email-service';

const storageService = StorageService.getInstance();

const initGameObject = (players: RegisterPlayer[]): Game => {
  return {
    players: shuffle(players.map((item) => item.player)),
    handNumber: 0,
  };
};

const checkForDuplicatePlayers = (players: RegisterPlayer[]): boolean => {
  return (
    new Set(
      players.map((item) => {
        return item.player.name;
      })
    ).size !== players.length
  );
};

function generateGameIdentifier(): string {
  const encoder = new UuidEncoder();
  return encoder.encode(uuid()).substring(0, 11);
}

export const createGameAndInvitatePlayers = async (
  players: RegisterPlayer[]
): Promise<Game> => {
  if (players.length < 3 || players.length > 4) {
    return Promise.reject(new Error('Must have 3 or 4 players'));
  }

  if (checkForDuplicatePlayers(players)) {
    return Promise.reject(new Error('Players must have unique names'));
  }

  // TODO validate emails

  const gameId: string = generateGameIdentifier();

  const playerIds = new Map<string, RegisterPlayer>();

  players.forEach((item) => {
    playerIds.set(uuid(), item);
  });

  playerIds.forEach((value, key) => {
    storageService.storeGamePlayer({ gameId, player: value.player }, key);
    sendGameLink(value, key);
  });

  const game = initGameObject(players);

  storageService.storeGame(game, gameId);

  return game;
};
